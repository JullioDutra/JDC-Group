import type { MatchPlayer, PlayerProfile, RankingRow, Session, SessionState, Side } from '../game/types';
import { nameKeys } from '../players/keys';
import type { PlayerRecord, StatKey } from '../players/types';
import type { Store } from './types';

const isOpen = (s: SessionState) => s.status !== 'FINISHED' && s.status !== 'CANCELLED';

/** Store em memória: usado nos testes e no desenvolvimento local sem banco. */
export class MemoryStore implements Store {
  private groups = new Map<string, boolean>();
  private matches = new Map<string, Session>(); // por grupo, só as abertas
  private processed = new Set<string>();
  private cache = new Map<string, PlayerProfile | null>();
  private stats = new Map<string, Map<string, RankingRow>>();
  private seq = 0;
  private players = new Map<string, { record: PlayerRecord; keys: string[] }>();
  private importStates = new Map<string, unknown>();
  readonly lookups: Array<{ query: string; context?: string; outcome: string; playerId?: string | null }> = [];

  async isGroupActive(groupJid: string) {
    return this.groups.get(groupJid) === true;
  }

  async setGroupActive(groupJid: string, _name: string | undefined, active: boolean) {
    this.groups.set(groupJid, active);
  }

  async getActiveMatch(groupJid: string) {
    const match = this.matches.get(groupJid);
    return match ? structuredClone(match) : null;
  }

  async createMatch(groupJid: string, state: SessionState) {
    if (this.matches.has(groupJid)) return null;
    const match: Session = { id: `m${++this.seq}`, groupJid, version: 1, state: structuredClone(state) };
    this.matches.set(groupJid, match);
    return structuredClone(match);
  }

  async saveMatch(match: Session) {
    const current = this.matches.get(match.groupJid);
    if (!current || current.id !== match.id || current.version !== match.version) return false;
    if (isOpen(match.state)) {
      this.matches.set(match.groupJid, { ...structuredClone(match), version: match.version + 1 });
    } else {
      this.matches.delete(match.groupJid);
    }
    match.version += 1;
    return true;
  }

  async markProcessed(messageId: string) {
    if (this.processed.has(messageId)) return false;
    this.processed.add(messageId);
    return true;
  }

  async getCachedProfile(key: string) {
    return this.cache.has(key) ? this.cache.get(key)! : undefined;
  }

  async putCachedProfile(key: string, profile: PlayerProfile | null) {
    this.cache.set(key, profile);
  }

  async findPlayers(keys: string[], limit: number) {
    const wanted = new Set(keys);
    return [...this.players.values()]
      .filter((p) => p.keys.some((k) => wanted.has(k)))
      .map((p) => structuredClone(p.record))
      .sort((a, b) => b.sitelinks - a.sitelinks)
      .slice(0, limit);
  }

  async upsertPlayers(records: PlayerRecord[]) {
    for (const r of records) {
      const old = this.players.get(r.id)?.record;
      const merged: PlayerRecord = old
        ? { ...r, positions: r.positions.length ? r.positions : old.positions, stats: { ...old.stats, ...r.stats } }
        : r;
      this.players.set(r.id, { record: structuredClone(merged), keys: nameKeys([merged.name, ...merged.aliases]) });
    }
  }

  async setPlayerStat(id: string, stat: StatKey, value: number | null) {
    const p = this.players.get(id);
    if (p) p.record.stats[stat] = value;
  }

  async countPlayers() {
    return this.players.size;
  }

  async getImportState(id: string) {
    return this.importStates.has(id) ? structuredClone(this.importStates.get(id)) : null;
  }

  async setImportState(id: string, state: unknown) {
    this.importStates.set(id, structuredClone(state));
  }

  async logLookup(row: { query: string; context?: string; outcome: string; playerId?: string | null }) {
    this.lookups.push(row);
  }

  async topLookups(outcomePrefix: string, _hours: number, limit: number) {
    const counts = new Map<string, { query: string; context: string | null; n: number }>();
    for (const l of this.lookups) {
      if (!l.outcome.startsWith(outcomePrefix)) continue;
      const key = `${l.query.toLowerCase()}|${l.context ?? ''}`;
      const row = counts.get(key) ?? { query: l.query, context: l.context ?? null, n: 0 };
      row.n += 1;
      counts.set(key, row);
    }
    return [...counts.values()].sort((a, b) => b.n - a.n).slice(0, limit);
  }

  async lookupSummary() {
    const out: Record<string, number> = {};
    for (const l of this.lookups) out[l.outcome] = (out[l.outcome] ?? 0) + 1;
    return out;
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
    const table = this.stats.get(groupJid) ?? new Map<string, RankingRow>();
    this.stats.set(groupJid, table);
    for (const { player: p, result } of rows) {
      const row = table.get(p.jid) ?? { jid: p.jid, name: p.name, games: 0, wins: 0, draws: 0, losses: 0 };
      row.name = p.name;
      row.games += 1;
      if (result === 'draw') row.draws += 1;
      else if (result === 'win') row.wins += 1;
      else row.losses += 1;
      table.set(p.jid, row);
    }
  }

  async getRanking(groupJid: string, limit: number) {
    return [...(this.stats.get(groupJid)?.values() ?? [])]
      .sort((a, b) => b.wins * 3 + b.draws - (a.wins * 3 + a.draws) || b.wins - a.wins || a.games - b.games)
      .slice(0, limit);
  }
}
