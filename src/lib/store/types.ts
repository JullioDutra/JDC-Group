import type { MatchPlayer, PlayerProfile, RankingRow, Session, SessionState, Side } from '../game/types';
import type { PlayerRecord, StatKey } from '../players/types';

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

  // ----- Base de jogadores -----
  /** Jogadores com alguma das chaves de busca, dos mais famosos para os menos. */
  findPlayers(keys: string[], limit: number): Promise<PlayerRecord[]>;
  upsertPlayers(records: PlayerRecord[]): Promise<void>;
  setPlayerStat(id: string, stat: StatKey, value: number | null): Promise<void>;
  countPlayers(): Promise<number>;
  getImportState(id: string): Promise<unknown | null>;
  setImportState(id: string, state: unknown): Promise<void>;
  logLookup(row: { query: string; context?: string; outcome: string; playerId?: string | null; ms?: number }): Promise<void>;
  /** Contagem dos resultados de busca nas últimas horas (para o status). */
  lookupSummary(hours: number): Promise<Record<string, number>>;

  recordResult(groupJid: string, players: [MatchPlayer, MatchPlayer], winner: Side | 'draw'): Promise<void>;
  /** Resultado de uma sala: vitória para os vencedores, derrota para os demais. */
  recordResults(groupJid: string, rows: Array<{ player: MatchPlayer; result: 'win' | 'draw' | 'loss' }>): Promise<void>;
  getRanking(groupJid: string, limit: number): Promise<RankingRow[]>;
}
