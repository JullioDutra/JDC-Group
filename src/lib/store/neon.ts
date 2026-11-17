import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { MatchPlayer, PlayerProfile, RankingRow, Session, SessionState, Side } from '../game/types';
import { OPTIONAL_SCHEMA_STATEMENTS, SCHEMA_STATEMENTS } from './schema';
import { nameKeys } from '../players/keys';
import type { PlayerRecord, StatKey } from '../players/types';
import { normalize } from '../game/text';
import type { Position } from '../game/types';
import type { Store } from './types';

/** Fichas em cache valem 30 dias; "não achei" vale só 10 minutos (pode ter sido falha passageira). */
const CACHE_TTL_DAYS = 30;
const NEGATIVE_TTL_MINUTES = 10;

export class NeonStore implements Store {
  private sql: NeonQueryFunction<false, false>;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  private trigram = true;

  async migrate(): Promise<void> {
    for (const statement of SCHEMA_STATEMENTS) await this.sql.query(statement);
    for (const statement of OPTIONAL_SCHEMA_STATEMENTS) {
      try {
        await this.sql.query(statement);
      } catch (error) {
        this.trigram = false;
        console.warn('busca por semelhança indisponível', (error as Error).message);
      }
    }
  }

  async isGroupActive(groupJid: string) {
    const rows = await this.sql`SELECT active FROM wa_groups WHERE jid = ${groupJid}`;
    return rows[0]?.active === true;
  }

  async setGroupActive(groupJid: string, name: string | undefined, active: boolean, by: string) {
    await this.sql`
      INSERT INTO wa_groups (jid, name, active, activated_by)
      VALUES (${groupJid}, ${name ?? null}, ${active}, ${by})
      ON CONFLICT (jid) DO UPDATE
        SET active = EXCLUDED.active,
            name = COALESCE(EXCLUDED.name, wa_groups.name),
            activated_by = EXCLUDED.activated_by,
            updated_at = now()`;
  }

  async getActiveMatch(groupJid: string): Promise<Session | null> {
    const rows = await this.sql`
      SELECT id, version, state FROM matches
      WHERE group_jid = ${groupJid} AND status NOT IN ('FINISHED', 'CANCELLED')
      LIMIT 1`;
    if (!rows[0]) return null;
    return { id: String(rows[0].id), groupJid, version: rows[0].version, state: rows[0].state as SessionState };
  }

  async createMatch(groupJid: string, state: SessionState): Promise<Session | null> {
    const rows = await this.sql`
      INSERT INTO matches (group_jid, status, mode_id, state)
      VALUES (${groupJid}, ${state.status}, ${'modeId' in state ? state.modeId : null}, ${JSON.stringify(state)}::jsonb)
      ON CONFLICT DO NOTHING
      RETURNING id, version`;
    if (!rows[0]) return null;
    return { id: String(rows[0].id), groupJid, version: rows[0].version, state };
  }

  async saveMatch(match: Session): Promise<boolean> {
    const rows = await this.sql`
      UPDATE matches
      SET state = ${JSON.stringify(match.state)}::jsonb,
          status = ${match.state.status},
          mode_id = ${'modeId' in match.state ? match.state.modeId : null},
          version = version + 1,
          updated_at = now()
      WHERE id = ${match.id} AND version = ${match.version}
      RETURNING version`;
    if (!rows[0]) return false;
    match.version = rows[0].version;
    return true;
  }

  async markProcessed(messageId: string) {
    const rows = await this.sql`
      INSERT INTO processed_messages (id) VALUES (${messageId})
      ON CONFLICT DO NOTHING RETURNING id`;
    // Limpeza ocasional: só importa deduplicar reenvios recentes.
    if (Math.random() < 0.01) {
      await this.sql`DELETE FROM processed_messages WHERE created_at < now() - interval '3 days'`;
    }
    return rows.length > 0;
  }

  async getCachedProfile(key: string): Promise<PlayerProfile | null | undefined> {
    const rows = await this.sql`
      SELECT profile FROM player_cache
      WHERE key = ${key}
        AND updated_at > now() - CASE WHEN profile IS NULL THEN make_interval(mins => ${NEGATIVE_TTL_MINUTES}::int) ELSE make_interval(days => ${CACHE_TTL_DAYS}::int) END`;
    if (!rows[0]) return undefined;
    return (rows[0].profile as PlayerProfile | null) ?? null;
  }

  async putCachedProfile(key: string, profile: PlayerProfile | null) {
    await this.sql`
      INSERT INTO player_cache (key, profile) VALUES (${key}, ${profile ? JSON.stringify(profile) : null}::jsonb)
      ON CONFLICT (key) DO UPDATE SET profile = EXCLUDED.profile, updated_at = now()`;
  }

  // ----- Base de jogadores -----

  private static toRecord(row: Record<string, unknown>): PlayerRecord {
    const date = row.birth_date as string | Date | null;
    return {
      id: row.id as string,
      name: row.name as string,
      aliases: (row.aliases as string[]) ?? [],
      positions: ((row.positions as string[]) ?? []) as Position[],
      nationality: (row.nationality as string | null) ?? null,
      birthDate: date ? (date instanceof Date ? date.toISOString().slice(0, 10) : String(date).slice(0, 10)) : null,
      heightCm: (row.height_cm as number | null) ?? null,
      clubs: (row.clubs as string[]) ?? [],
      debutYear: (row.debut_year as number | null) ?? null,
      sitelinks: (row.sitelinks as number) ?? 0,
      stats: (row.stats as PlayerRecord['stats']) ?? {},
      anchors: (row.anchors as PlayerRecord['anchors']) ?? undefined,
      source: row.source as PlayerRecord['source'],
    };
  }

  async findPlayers(keys: string[], limit: number): Promise<PlayerRecord[]> {
    if (keys.length === 0) return [];
    const rows = await this.sql`SELECT * FROM players WHERE keys && ${keys}::text[] ORDER BY sitelinks DESC LIMIT ${limit}`;
    return rows.map((r) => NeonStore.toRecord(r));
  }

  async fuzzyPlayers(text: string, limit: number): Promise<PlayerRecord[]> {
    if (!this.trigram || !text) return [];
    try {
      const rows = await this.sql`
        SELECT * FROM players WHERE name_norm % ${text}
        ORDER BY similarity(name_norm, ${text}) DESC, sitelinks DESC LIMIT ${limit}`;
      return rows.map((r) => NeonStore.toRecord(r));
    } catch (error) {
      console.warn('busca por semelhança falhou', (error as Error).message);
      return [];
    }
  }

  async upsertPlayers(records: PlayerRecord[]): Promise<void> {
    const COLS = 15;
    for (let i = 0; i < records.length; i += 100) {
      const chunk = records.slice(i, i + 100);
      const params: unknown[] = [];
      const values = chunk.map((r, j) => {
        params.push(
          r.id, r.name, normalize(r.name), nameKeys([r.name, ...r.aliases]), r.aliases, r.positions, r.nationality,
          r.birthDate, r.heightCm, r.clubs, r.debutYear, r.sitelinks, JSON.stringify(r.stats ?? {}),
          r.anchors ? JSON.stringify(r.anchors) : null, r.source,
        );
        const b = j * COLS;
        return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}::text[], $${b + 5}::text[], $${b + 6}::text[], $${b + 7}, $${b + 8}::date, $${b + 9}::int, $${b + 10}::text[], $${b + 11}::int, $${b + 12}::int, $${b + 13}::jsonb, $${b + 14}::jsonb, $${b + 15})`;
      });
      await this.sql.query(
        `INSERT INTO players (id, name, name_norm, keys, aliases, positions, nationality, birth_date, height_cm, clubs, debut_year, sitelinks, stats, anchors, source)
         VALUES ${values.join(', ')}
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, name_norm = EXCLUDED.name_norm, keys = EXCLUDED.keys, aliases = EXCLUDED.aliases,
           positions = CASE WHEN cardinality(EXCLUDED.positions) > 0 THEN EXCLUDED.positions ELSE players.positions END,
           nationality = COALESCE(EXCLUDED.nationality, players.nationality),
           birth_date = COALESCE(EXCLUDED.birth_date, players.birth_date),
           height_cm = COALESCE(EXCLUDED.height_cm, players.height_cm),
           clubs = CASE WHEN cardinality(EXCLUDED.clubs) > 0 THEN EXCLUDED.clubs ELSE players.clubs END,
           debut_year = COALESCE(EXCLUDED.debut_year, players.debut_year),
           sitelinks = GREATEST(EXCLUDED.sitelinks, players.sitelinks),
           stats = players.stats || EXCLUDED.stats,
           anchors = COALESCE(EXCLUDED.anchors, players.anchors),
           updated_at = now()`,
        params,
      );
    }
  }

  async setPlayerStat(id: string, stat: StatKey, value: number | null): Promise<void> {
    await this.sql`UPDATE players SET stats = stats || jsonb_build_object(${stat}::text, ${value}::numeric), updated_at = now() WHERE id = ${id}`;
  }

  async countPlayers(): Promise<number> {
    const rows = await this.sql`SELECT count(*)::int AS n FROM players`;
    return (rows[0]?.n as number) ?? 0;
  }

  async getImportState(id: string): Promise<unknown | null> {
    const rows = await this.sql`SELECT state FROM import_state WHERE id = ${id}`;
    return rows[0]?.state ?? null;
  }

  async setImportState(id: string, state: unknown): Promise<void> {
    await this.sql`
      INSERT INTO import_state (id, state) VALUES (${id}, ${JSON.stringify(state)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state, updated_at = now()`;
  }

  async logLookup(row: { query: string; context?: string; outcome: string; playerId?: string | null; ms?: number }): Promise<void> {
    await this.sql`
      INSERT INTO lookup_log (query, context, outcome, player_id, ms)
      VALUES (${row.query.slice(0, 80)}, ${row.context ?? null}, ${row.outcome}, ${row.playerId ?? null}, ${row.ms ?? null})`;
    // Limpeza ocasional do registro antigo.
    if (Math.random() < 0.01) await this.sql`DELETE FROM lookup_log WHERE created_at < now() - interval '30 days'`;
  }

  async lookupSummary(hours: number): Promise<Record<string, number>> {
    const rows = await this.sql`
      SELECT outcome, count(*)::int AS n FROM lookup_log
      WHERE created_at > now() - make_interval(hours => ${hours}::int) GROUP BY outcome`;
    return Object.fromEntries(rows.map((r) => [r.outcome as string, r.n as number]));
  }

  async recordResult(groupJid: string, players: [MatchPlayer, MatchPlayer], winner: Side | 'draw') {
    await this.recordResults(
      groupJid,
      players.map((player, side) => ({
        player,
        result: winner === 'draw' ? ('draw' as const) : winner === side ? ('win' as const) : ('loss' as const),
      })),
    );
  }

  async recordResults(groupJid: string, rows: Array<{ player: MatchPlayer; result: 'win' | 'draw' | 'loss' }>) {
    for (const { player: p, result } of rows) {
      const win = result === 'win' ? 1 : 0;
      const draw = result === 'draw' ? 1 : 0;
      const loss = result === 'loss' ? 1 : 0;
      await this.sql`
        INSERT INTO group_stats (group_jid, player_jid, name, games, wins, draws, losses)
        VALUES (${groupJid}, ${p.jid}, ${p.name}, 1, ${win}, ${draw}, ${loss})
        ON CONFLICT (group_jid, player_jid) DO UPDATE
          SET name = EXCLUDED.name,
              games = group_stats.games + 1,
              wins = group_stats.wins + EXCLUDED.wins,
              draws = group_stats.draws + EXCLUDED.draws,
              losses = group_stats.losses + EXCLUDED.losses,
              updated_at = now()`;
    }
  }

  async getRanking(groupJid: string, limit: number): Promise<RankingRow[]> {
    const rows = await this.sql`
      SELECT player_jid AS jid, name, games, wins, draws, losses
      FROM group_stats WHERE group_jid = ${groupJid}
      ORDER BY (wins * 3 + draws) DESC, wins DESC, games ASC
      LIMIT ${limit}`;
    return rows as RankingRow[];
  }
}
