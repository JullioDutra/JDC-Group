import type { Nomination, NominationInput, NominationResult } from '../awards/types';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { MatchPlayer, PlayerProfile, RankingRow, Session, SessionState, Side } from '../game/types';
import { SCHEMA_STATEMENTS } from './schema';
import { nameKeys } from '../players/keys';
import type { ManualClub, ManualData, ManualEntry, ManualPosition, PlayerRecord, StatKey } from '../players/types';
import { normalize } from '../game/text';
import type { Position } from '../game/types';
import type { Store, MatchStats, Season } from './types';

/** Fichas em cache valem 30 dias; "não achei" vale só 10 minutos (pode ter sido falha passageira). */
const CACHE_TTL_DAYS = 30;
const NEGATIVE_TTL_MINUTES = 10;

export class NeonStore implements Store {
  private sql: NeonQueryFunction<false, false>;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  async migrate(): Promise<void> {
    for (const statement of SCHEMA_STATEMENTS) await this.sql.query(statement);
  }

  async isAwardsActive(groupJid: string) {
    const rows = await this.sql`SELECT active FROM awards_groups WHERE group_jid = ${groupJid}`;
    return rows[0]?.active === true;
  }

  async setAwardsActive(groupJid: string, active: boolean, by: string) {
    await this.sql`INSERT INTO awards_groups (group_jid, active, updated_by)
      VALUES (${groupJid}, ${active}, ${by})
      ON CONFLICT (group_jid) DO UPDATE SET active = EXCLUDED.active,
        updated_by = EXCLUDED.updated_by, updated_at = now()`;
  }

  async addNomination(input: NominationInput): Promise<NominationResult> {
    // Trava compartilhada coordena a inserção com o encerramento da coleta.
    // UNIQUE evita perda/duplicação em webhooks simultâneos e múltiplas instâncias.
    const rows = await this.sql`WITH enabled AS (
        SELECT group_jid FROM awards_groups WHERE group_jid = ${input.groupJid} AND active FOR SHARE
      ), inserted AS (
        INSERT INTO awards_nominations (group_jid, category, fingerprint, command_message_id, payload)
        SELECT group_jid, ${input.category}, ${input.fingerprint}, ${input.commandMessageId}, ${JSON.stringify(input)}::jsonb
        FROM enabled ON CONFLICT DO NOTHING RETURNING id
      ) SELECT CASE WHEN EXISTS (SELECT 1 FROM inserted) THEN 'saved'
        WHEN EXISTS (SELECT 1 FROM enabled) THEN 'duplicate' ELSE 'inactive' END AS result`;
    return rows[0].result as NominationResult;
  }

  async listNominations(groupJid: string, limit: number, offset: number): Promise<Nomination[]> {
    const rows = await this.sql`SELECT id::text, category, payload FROM awards_nominations
      WHERE group_jid = ${groupJid} ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
    return rows.map(r => ({ ...(r.payload as NominationInput), id: r.id as string, category: r.category as number | null }));
  }

  async classifyNomination(groupJid: string, id: string, category: number): Promise<boolean> {
    if (!/^\d+$/.test(id) || !Number.isInteger(category) || category < 1 || category > 22) return false;
    const rows = await this.sql`UPDATE awards_nominations SET category = ${category}
      WHERE group_jid = ${groupJid} AND id::text = ${id} RETURNING id`;
    return rows.length > 0;
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

  async openMatchesByGame(game: string): Promise<Session[]> {
    const rows = await this.sql`
      SELECT id, group_jid, version, state FROM matches
      WHERE status NOT IN ('FINISHED', 'CANCELLED') AND state->>'game' = ${game}
      LIMIT 50`;
    return rows.map((r) => ({ id: String(r.id), groupJid: r.group_jid as string, version: r.version as number, state: r.state as SessionState }));
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
      ...NeonStore.manualOf(row),
    };
  }

  private static manualOf(row: Record<string, unknown>): Partial<PlayerRecord> {
    const manual = (row.manual as ManualData | null) ?? null;
    if (!manual || (!manual.stats && !manual.aliases && !manual.clubs && !manual.positions)) return {};
    const aliases = ((row.aliases as string[]) ?? []).slice();
    for (const a of manual.aliases ?? []) if (!aliases.includes(a)) aliases.push(a);
    // Clubes confirmados pelo admin ou pela Wikipédia valem como clubes da ficha.
    const clubs = ((row.clubs as string[]) ?? []).slice();
    for (const c of manual.clubs ?? []) if (c?.name && !clubs.includes(c.name)) clubs.push(c.name);
    // Posições confirmadas pela Wikipédia também.
    const positions = ((row.positions as PlayerRecord['positions']) ?? []).slice();
    for (const p of manual.positions ?? []) if (p?.position && !positions.includes(p.position)) positions.push(p.position);
    return { manual, aliases, clubs, positions };
  }

  async findPlayers(keys: string[], limit: number): Promise<PlayerRecord[]> {
    if (keys.length === 0) return [];
    const rows = await this.sql`SELECT * FROM players WHERE keys && ${keys}::text[] ORDER BY sitelinks DESC LIMIT ${limit}`;
    return rows.map((r) => NeonStore.toRecord(r));
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
           name = EXCLUDED.name, name_norm = EXCLUDED.name_norm, keys = EXCLUDED.keys || players.manual_keys, aliases = EXCLUDED.aliases,
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

  async getPlayer(id: string): Promise<PlayerRecord | null> {
    const rows = await this.sql`SELECT * FROM players WHERE id = ${id}`;
    return rows[0] ? NeonStore.toRecord(rows[0]) : null;
  }

  async setManualStat(id: string, stat: StatKey, entry: ManualEntry | null): Promise<void> {
    if (entry) {
      await this.sql`
        UPDATE players SET
          manual = jsonb_set(CASE WHEN manual ? 'stats' THEN manual ELSE manual || '{"stats":{}}'::jsonb END,
                             ARRAY['stats', ${stat}::text], ${JSON.stringify(entry)}::jsonb),
          updated_at = now()
        WHERE id = ${id}`;
    } else {
      await this.sql`UPDATE players SET manual = manual #- ARRAY['stats', ${stat}::text], updated_at = now() WHERE id = ${id}`;
    }
  }

  async addManualAlias(id: string, alias: string): Promise<void> {
    const keys = nameKeys([alias]);
    await this.sql`
      UPDATE players SET
        manual = jsonb_set(manual, '{aliases}', COALESCE(manual->'aliases', '[]'::jsonb) || to_jsonb(${alias}::text)),
        manual_keys = manual_keys || ${keys}::text[],
        keys = keys || ${keys}::text[],
        updated_at = now()
      WHERE id = ${id}`;
  }

  async addManualClub(id: string, club: ManualClub): Promise<void> {
    await this.sql`
      UPDATE players SET
        manual = jsonb_set(manual, '{clubs}',
          COALESCE((SELECT jsonb_agg(c) FROM jsonb_array_elements(manual->'clubs') c WHERE c->>'name' <> ${club.name}), '[]'::jsonb)
          || jsonb_build_array(${JSON.stringify(club)}::jsonb)),
        updated_at = now()
      WHERE id = ${id}`;
  }

  async addManualPosition(id: string, entry: ManualPosition): Promise<void> {
    await this.sql`
      UPDATE players SET
        manual = jsonb_set(manual, '{positions}',
          COALESCE((SELECT jsonb_agg(x) FROM jsonb_array_elements(manual->'positions') x WHERE x->>'position' <> ${entry.position}), '[]'::jsonb)
          || jsonb_build_array(${JSON.stringify(entry)}::jsonb)),
        updated_at = now()
      WHERE id = ${id}`;
  }

  async deletePlayers(ids: string[]): Promise<void> {
    if (ids.length) await this.sql`DELETE FROM players WHERE id = ANY(${ids}::text[])`;
  }

  async samplePlayers(opts: { minSitelinks: number; minClubs: number; limit: number }): Promise<PlayerRecord[]> {
    const rows = await this.sql`
      SELECT * FROM players
      WHERE sitelinks >= ${opts.minSitelinks} AND cardinality(clubs) >= ${opts.minClubs}
      ORDER BY random() LIMIT ${opts.limit}`;
    return rows.map((r) => NeonStore.toRecord(r));
  }

  async getSeen(groupJid: string, kind: string): Promise<string[]> {
    const rows = await this.sql`SELECT item FROM group_seen WHERE group_jid = ${groupJid} AND kind = ${kind} ORDER BY seen_at`;
    return rows.map((r) => r.item as string);
  }

  async markSeen(groupJid: string, kind: string, items: string[]): Promise<void> {
    if (!items.length) return;
    await this.sql`
      INSERT INTO group_seen (group_jid, kind, item)
      SELECT ${groupJid}, ${kind}, unnest(${items}::text[])
      ON CONFLICT (group_jid, kind, item) DO UPDATE SET seen_at = now()`;
  }

  async unmarkSeen(groupJid: string, kind: string, items: string[]): Promise<void> {
    if (!items.length) return;
    await this.sql`DELETE FROM group_seen WHERE group_jid = ${groupJid} AND kind = ${kind} AND item = ANY(${items}::text[])`;
  }

  async getSeason(groupJid: string): Promise<Season> {
    const open = await this.sql`SELECT season, started_at FROM group_seasons WHERE group_jid = ${groupJid} AND ended_at IS NULL`;
    if (open[0]) return { season: open[0].season as number, startedAt: new Date(open[0].started_at as string).toISOString() };
    const rows = await this.sql`
      INSERT INTO group_seasons (group_jid, season, started_at)
      SELECT ${groupJid},
             COALESCE((SELECT max(season) FROM group_seasons WHERE group_jid = ${groupJid}), 0) + 1,
             COALESCE((SELECT min(created_at) FROM matches WHERE group_jid = ${groupJid}), now())
      ON CONFLICT (group_jid, season) DO NOTHING
      RETURNING season, started_at`;
    if (rows[0]) return { season: rows[0].season as number, startedAt: new Date(rows[0].started_at as string).toISOString() };
    return this.getSeason(groupJid);
  }

  async closeSeason(groupJid: string, ranking: RankingRow[]): Promise<Season> {
    const current = await this.getSeason(groupJid);
    await this.sql`
      UPDATE group_seasons SET ended_at = now(), ranking = ${JSON.stringify(ranking)}::jsonb
      WHERE group_jid = ${groupJid} AND season = ${current.season} AND ended_at IS NULL`;
    await this.sql`INSERT INTO group_seasons (group_jid, season, started_at) VALUES (${groupJid}, ${current.season + 1}, now()) ON CONFLICT DO NOTHING`;
    await this.sql`DELETE FROM group_stats WHERE group_jid = ${groupJid}`;
    return this.getSeason(groupJid);
  }

  async listSeasons(groupJid: string): Promise<Season[]> {
    const rows = await this.sql`
      SELECT season, started_at, ended_at, ranking FROM group_seasons
      WHERE group_jid = ${groupJid} AND ended_at IS NOT NULL ORDER BY season`;
    return rows.map((r) => ({
      season: r.season as number,
      startedAt: new Date(r.started_at as string).toISOString(),
      endedAt: new Date(r.ended_at as string).toISOString(),
      ranking: (r.ranking as RankingRow[] | null) ?? [],
    }));
  }

  async groupGameCounts(groupJid: string, sinceIso: string): Promise<Record<string, number>> {
    const rows = await this.sql`
      SELECT COALESCE(state->>'game', '1x1') AS jogo, count(*)::int AS n
      FROM matches WHERE group_jid = ${groupJid} AND status = 'FINISHED' AND created_at >= ${sinceIso}
      GROUP BY 1`;
    return Object.fromEntries(rows.map((r) => [r.jogo as string, r.n as number]));
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

  async topLookups(outcomePrefix: string, hours: number, limit: number) {
    const rows = await this.sql`
      SELECT lower(query) AS query, context, count(*)::int AS n FROM lookup_log
      WHERE outcome LIKE ${`${outcomePrefix}%`} AND created_at > now() - make_interval(hours => ${hours}::int)
      GROUP BY lower(query), context ORDER BY n DESC LIMIT ${limit}`;
    return rows.map((r) => ({ query: r.query as string, context: (r.context as string | null) ?? null, n: r.n as number }));
  }

  async lookupSummary(hours: number): Promise<Record<string, number>> {
    const rows = await this.sql`
      SELECT outcome, count(*)::int AS n FROM lookup_log
      WHERE created_at > now() - make_interval(hours => ${hours}::int) GROUP BY outcome`;
    return Object.fromEntries(rows.map((r) => [r.outcome as string, r.n as number]));
  }

  async matchStats(): Promise<MatchStats> {
    const rows = await this.sql`
      SELECT COALESCE(state->>'game', '1x1') AS jogo,
             count(*)::int AS total,
             count(*) FILTER (WHERE status = 'FINISHED')::int AS terminadas,
             count(*) FILTER (WHERE status = 'CANCELLED')::int AS canceladas,
             count(*) FILTER (WHERE created_at > now() - interval '24 hours')::int AS dia
      FROM matches GROUP BY 1 ORDER BY 2 DESC`;
    const extra = await this.sql`SELECT count(DISTINCT group_jid)::int AS grupos, min(created_at) AS desde FROM matches`;
    const sum = (k: string) => rows.reduce((a, r) => a + (r[k] as number), 0);
    const desde = extra[0]?.desde as string | Date | null;
    return {
      total: sum('total'),
      terminadas: sum('terminadas'),
      canceladas: sum('canceladas'),
      emAndamento: sum('total') - sum('terminadas') - sum('canceladas'),
      ultimas24h: sum('dia'),
      grupos: (extra[0]?.grupos as number) ?? 0,
      desde: desde ? new Date(desde).toISOString() : null,
      porJogo: Object.fromEntries(rows.map((r) => [r.jogo as string, { total: r.total as number, terminadas: r.terminadas as number }])),
    };
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

