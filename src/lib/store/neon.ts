import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { Match, MatchPlayer, MatchState, PlayerProfile, RankingRow, Side } from '../game/types';
import { SCHEMA_STATEMENTS } from './schema';
import type { Store } from './types';

/** Fichas em cache valem 30 dias; "não existe" vale 1 dia (pode ter sido erro da IA). */
const CACHE_TTL_DAYS = 30;
const NEGATIVE_TTL_DAYS = 1;

export class NeonStore implements Store {
  private sql: NeonQueryFunction<false, false>;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  async migrate(): Promise<void> {
    for (const statement of SCHEMA_STATEMENTS) await this.sql.query(statement);
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

  async getActiveMatch(groupJid: string): Promise<Match | null> {
    const rows = await this.sql`
      SELECT id, version, state FROM matches
      WHERE group_jid = ${groupJid} AND status NOT IN ('FINISHED', 'CANCELLED')
      LIMIT 1`;
    if (!rows[0]) return null;
    return { id: String(rows[0].id), groupJid, version: rows[0].version, state: rows[0].state as MatchState };
  }

  async createMatch(groupJid: string, state: MatchState): Promise<Match | null> {
    const rows = await this.sql`
      INSERT INTO matches (group_jid, status, mode_id, state)
      VALUES (${groupJid}, ${state.status}, ${state.modeId}, ${JSON.stringify(state)}::jsonb)
      ON CONFLICT DO NOTHING
      RETURNING id, version`;
    if (!rows[0]) return null;
    return { id: String(rows[0].id), groupJid, version: rows[0].version, state };
  }

  async saveMatch(match: Match): Promise<boolean> {
    const rows = await this.sql`
      UPDATE matches
      SET state = ${JSON.stringify(match.state)}::jsonb,
          status = ${match.state.status},
          mode_id = ${match.state.modeId},
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
        AND updated_at > now() - make_interval(days => CASE WHEN profile IS NULL THEN ${NEGATIVE_TTL_DAYS}::int ELSE ${CACHE_TTL_DAYS}::int END)`;
    if (!rows[0]) return undefined;
    return (rows[0].profile as PlayerProfile | null) ?? null;
  }

  async putCachedProfile(key: string, profile: PlayerProfile | null) {
    await this.sql`
      INSERT INTO player_cache (key, profile) VALUES (${key}, ${profile ? JSON.stringify(profile) : null}::jsonb)
      ON CONFLICT (key) DO UPDATE SET profile = EXCLUDED.profile, updated_at = now()`;
  }

  async recordResult(groupJid: string, players: [MatchPlayer, MatchPlayer], winner: Side | 'draw') {
    for (const side of [0, 1] as const) {
      const p = players[side];
      const win = winner === side ? 1 : 0;
      const draw = winner === 'draw' ? 1 : 0;
      const loss = win || draw ? 0 : 1;
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
