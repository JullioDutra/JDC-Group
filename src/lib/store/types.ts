import type { Match, MatchPlayer, MatchState, PlayerProfile, RankingRow, Side } from '../game/types';

export interface Store {
  isGroupActive(groupJid: string): Promise<boolean>;
  setGroupActive(groupJid: string, name: string | undefined, active: boolean, by: string): Promise<void>;

  /** Partida em andamento no grupo (no máximo uma). */
  getActiveMatch(groupJid: string): Promise<Match | null>;
  /** Devolve null se já existir partida ativa no grupo. */
  createMatch(groupJid: string, state: MatchState): Promise<Match | null>;
  /** Trava otimista: false se outra mensagem alterou a partida antes. */
  saveMatch(match: Match): Promise<boolean>;

  /** true se a mensagem é nova; false se o webhook já a entregou antes. */
  markProcessed(messageId: string): Promise<boolean>;

  getCachedProfile(key: string): Promise<PlayerProfile | null | undefined>;
  putCachedProfile(key: string, profile: PlayerProfile | null): Promise<void>;

  recordResult(groupJid: string, players: [MatchPlayer, MatchPlayer], winner: Side | 'draw'): Promise<void>;
  getRanking(groupJid: string, limit: number): Promise<RankingRow[]>;
}
