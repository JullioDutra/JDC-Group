import type { Nomination, NominationInput, NominationResult } from '../awards/types';
import type { MatchPlayer, PlayerProfile, RankingRow, Session, SessionState, Side } from '../game/types';
import { nameKeys } from '../players/keys';
import type { ManualClub, ManualEntry, ManualPosition, PlayerRecord, StatKey } from '../players/types';
import type { MatchStats, RostoUpload, Season, Store } from './types';

const isOpen = (s: SessionState) => s.status !== 'FINISHED' && s.status !== 'CANCELLED';

/** Store em memória: usado nos testes e no desenvolvimento local sem banco. */
export class MemoryStore implements Store {
  private awardsActive = new Map<string, boolean>();
  private nominations: Nomination[] = [];

  async isAwardsActive(groupJid: string) { return this.awardsActive.get(groupJid) === true; }
  async setAwardsActive(groupJid: string, active: boolean, _by: string) { this.awardsActive.set(groupJid, active); }
  async addNomination(input: NominationInput): Promise<NominationResult> {
    if (this.awardsActive.get(input.groupJid) !== true) return 'inactive';
    if (this.nominations.some(n => n.groupJid === input.groupJid &&
      (n.fingerprint === input.fingerprint || n.commandMessageId === input.commandMessageId))) return 'duplicate';
    this.nominations.push({ ...structuredClone(input), id: String(this.nominations.length + 1) });
    return 'saved';
  }
  async listNominations(groupJid: string, limit: number, offset: number): Promise<Nomination[]> {
    return structuredClone(this.nominations.filter(n => n.groupJid === groupJid).slice(offset, offset + limit));
  }
  async classifyNomination(groupJid: string, id: string, category: number): Promise<boolean> {
    const row = this.nominations.find(n => n.groupJid === groupJid && n.id === id);
    if (!row || !Number.isInteger(category) || category < 1 || category > 22) return false;
    row.category = category;
    return true;
  }

  private groups = new Map<string, boolean>();
  private matches = new Map<string, Session>(); // por grupo, só as abertas
  private processed = new Set<string>();
  private cache = new Map<string, PlayerProfile | null>();
  private stats = new Map<string, Map<string, RankingRow>>();
  private seq = 0;
  private players = new Map<string, { record: PlayerRecord; keys: string[] }>();
  private importStates = new Map<string, unknown>();
  private seen = new Map<string, string[]>();
  private seasons = new Map<string, Season[]>();
  private rostos = new Map<string, { photo: RostoUpload; jpg: Buffer | null }>();
  /** Partidas terminadas (grupo, jogo, quando), para o resumo da temporada. */
  private finished: Array<{ groupJid: string; game: string; at: string }> = [];
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

  async openMatchesByGame(game: string) {
    return [...this.matches.values()].filter((m) => (m.state as { game?: string }).game === game).map((m) => structuredClone(m));
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
      if (match.state.status === 'FINISHED') {
        const game = 'game' in match.state && typeof match.state.game === 'string' ? match.state.game : '1x1';
        this.finished.push({ groupJid: match.groupJid, game, at: new Date().toISOString() });
      }
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
        ? {
            ...r,
            positions: r.positions.length ? r.positions : old.positions,
            // Número já gravado não muda na regravação: só entra o que falta (igual ao Neon).
            stats: { ...r.stats, ...Object.fromEntries(Object.entries(old.stats).filter(([, v]) => typeof v === 'number')) },
            manual: old.manual,
          }
        : r;
      const manualAliases = merged.manual?.aliases ?? [];
      merged.aliases = [...merged.aliases, ...manualAliases.filter((a) => !merged.aliases.includes(a))];
      const manualClubs = (merged.manual?.clubs ?? []).map((c) => c.name);
      merged.clubs = [...merged.clubs, ...manualClubs.filter((c) => !merged.clubs.includes(c))];
      const manualPositions = (merged.manual?.positions ?? []).map((p) => p.position);
      merged.positions = [...merged.positions, ...manualPositions.filter((p) => !merged.positions.includes(p))];
      this.players.set(r.id, { record: structuredClone(merged), keys: nameKeys([merged.name, ...merged.aliases]) });
    }
  }

  async setPlayerStat(id: string, stat: StatKey, value: number | null) {
    const p = this.players.get(id);
    if (p) p.record.stats[stat] = value;
  }

  async getPlayer(id: string) {
    const p = this.players.get(id);
    return p ? structuredClone(p.record) : null;
  }

  async setManualStat(id: string, stat: StatKey, entry: ManualEntry | null) {
    const p = this.players.get(id);
    if (!p) return;
    const manual = (p.record.manual ??= {});
    manual.stats ??= {};
    if (entry) manual.stats[stat] = entry;
    else delete manual.stats[stat];
  }

  async addManualAlias(id: string, alias: string) {
    const p = this.players.get(id);
    if (!p) return;
    const manual = (p.record.manual ??= {});
    manual.aliases = [...(manual.aliases ?? []), alias];
    if (!p.record.aliases.includes(alias)) p.record.aliases.push(alias);
    p.keys = nameKeys([p.record.name, ...p.record.aliases]);
  }

  async addManualClub(id: string, club: ManualClub) {
    const p = this.players.get(id);
    if (!p) return;
    const manual = (p.record.manual ??= {});
    manual.clubs = [...(manual.clubs ?? []).filter((c) => c.name !== club.name), club];
    if (!p.record.clubs.includes(club.name)) p.record.clubs.push(club.name);
  }

  async addManualPosition(id: string, entry: ManualPosition) {
    const p = this.players.get(id);
    if (!p) return;
    const manual = (p.record.manual ??= {});
    manual.positions = [...(manual.positions ?? []).filter((x) => x.position !== entry.position), entry];
    if (!p.record.positions.includes(entry.position)) p.record.positions.push(entry.position);
  }

  async deletePlayers(ids: string[]) {
    for (const id of ids) this.players.delete(id);
  }

  async samplePlayers(opts: { minSitelinks: number; minClubs: number; limit: number }) {
    return [...this.players.values()]
      .map((p) => p.record)
      .filter((r) => r.sitelinks >= opts.minSitelinks && r.clubs.length >= opts.minClubs)
      .slice(0, opts.limit)
      .map((r) => structuredClone(r));
  }

  async getSeen(groupJid: string, kind: string) {
    return [...(this.seen.get(`${groupJid}|${kind}`) ?? [])];
  }

  async markSeen(groupJid: string, kind: string, items: string[]) {
    const key = `${groupJid}|${kind}`;
    const list = (this.seen.get(key) ?? []).filter((x) => !items.includes(x));
    this.seen.set(key, [...list, ...items]);
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

  async matchStats(): Promise<MatchStats> {
    // A memória só guarda partidas abertas: serve para testes e desenvolvimento.
    const open = [...this.matches.values()];
    const porJogo: MatchStats['porJogo'] = {};
    for (const m of open) {
      const jogo = (m.state as { game?: string }).game ?? '1x1';
      porJogo[jogo] = { total: (porJogo[jogo]?.total ?? 0) + 1, terminadas: 0 };
    }
    return { total: open.length, terminadas: 0, canceladas: 0, emAndamento: open.length, ultimas24h: open.length, grupos: this.matches.size, desde: null, porJogo };
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

  async unmarkSeen(groupJid: string, kind: string, items: string[]) {
    const key = `${groupJid}|${kind}`;
    this.seen.set(key, (this.seen.get(key) ?? []).filter((x) => !items.includes(x)));
  }

  async getSeason(groupJid: string): Promise<Season> {
    const list = this.seasons.get(groupJid) ?? [];
    const open = list.find((s) => !s.endedAt);
    if (open) return { season: open.season, startedAt: open.startedAt };
    const first = this.finished.find((m) => m.groupJid === groupJid)?.at ?? new Date().toISOString();
    const created: Season = { season: list.length + 1, startedAt: list.length ? new Date().toISOString() : first, endedAt: null };
    this.seasons.set(groupJid, [...list, created]);
    return { season: created.season, startedAt: created.startedAt };
  }

  async closeSeason(groupJid: string, ranking: RankingRow[]): Promise<Season> {
    const current = await this.getSeason(groupJid);
    const list = this.seasons.get(groupJid)!;
    const open = list.find((s) => s.season === current.season)!;
    open.endedAt = new Date().toISOString();
    open.ranking = structuredClone(ranking);
    list.push({ season: current.season + 1, startedAt: new Date().toISOString(), endedAt: null });
    this.stats.delete(groupJid);
    return this.getSeason(groupJid);
  }

  async listSeasons(groupJid: string): Promise<Season[]> {
    return structuredClone((this.seasons.get(groupJid) ?? []).filter((s) => s.endedAt));
  }

  async groupGameCounts(groupJid: string, sinceIso: string): Promise<Record<string, number>> {
    const out: Record<string, number> = {};
    for (const m of this.finished) if (m.groupJid === groupJid && m.at >= sinceIso) out[m.game] = (out[m.game] ?? 0) + 1;
    return out;
  }

  async getRanking(groupJid: string, limit: number) {
    return [...(this.stats.get(groupJid)?.values() ?? [])]
      .sort((a, b) => b.wins * 3 + b.draws - (a.wins * 3 + a.draws) || b.wins - a.wins || a.games - b.games)
      .slice(0, limit);
  }

  async listRostoPhotos(): Promise<RostoUpload[]> {
    return [...this.rostos.values()].map((r) => structuredClone(r.photo)).reverse();
  }

  async getRostoJpg(id: string): Promise<Buffer | null> {
    return this.rostos.get(id)?.jpg ?? null;
  }

  async saveRostoPhoto(photo: RostoUpload, jpg: Buffer | null): Promise<void> {
    const old = this.rostos.get(photo.id);
    this.rostos.delete(photo.id);
    this.rostos.set(photo.id, { photo: structuredClone(photo), jpg: jpg ?? old?.jpg ?? null });
  }

  async deleteRostoPhoto(id: string): Promise<void> {
    this.rostos.delete(id);
  }
}
