import type { MatchPlayer, PlayerProfile, RankingRow, Session, SessionState, Side } from '../game/types';

export interface Store {
  isGroupActive(groupJid: string): Promise<boolean>;
  setGroupActive(groupJid: string, name: string | undefined, active: boolean, by: string): Promise<void>;

  /** Partida em andamento no grupo (no máximo uma). */
  getActiveMatch(groupJid: string): Promise<Session | null>;
  /** Devolve null se já existir partida ativa no grupo. */
  createMatch(groupJid: string, state: SessionState): Promise<Session | null>;
  /** Trava otimista: false se outra mensagem alterou a partida antes. */
  saveMatch(match: Session): Promise<boolean>;

  /** true se a mensagem é nova; false se o webhook já a entregou antes. */
  markProcessed(messageId: string): Promise<boolean>;

  getCachedProfile(key: string): Promise<PlayerProfile | null | undefined>;
  putCachedProfile(key: string, profile: PlayerProfile | null): Promise<void>;

  recordResult(groupJid: string, players: [MatchPlayer, MatchPlayer], winner: Side | 'draw'): Promise<void>;
  /** Resultado de uma sala: vitória para os vencedores, derrota para os demais. */
  recordResults(groupJid: string, rows: Array<{ player: MatchPlayer; result: 'win' | 'draw' | 'loss' }>): Promise<void>;
  getRanking(groupJid: string, limit: number): Promise<RankingRow[]>;
}
