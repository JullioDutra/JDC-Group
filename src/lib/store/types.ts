import type { MatchPlayer, PlayerProfile, RankingRow, Session, SessionState, Side } from '../game/types';
import type { ManualEntry, PlayerRecord, StatKey } from '../players/types';

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
  getPlayer(id: string): Promise<PlayerRecord | null>;
  /** Número corrigido pelo admin (null apaga a correção). A carga do Wikidata nunca mexe. */
  setManualStat(id: string, stat: StatKey, entry: ManualEntry | null): Promise<void>;
  /** Nome famoso aceito pelo admin: o jogador passa a ser achado por ele. */
  addManualAlias(id: string, alias: string): Promise<void>;
  /** Apaga fichas (usado ao juntar duplicadas). */
  deletePlayers(ids: string[]): Promise<void>;
  /** Jogadores conhecidos ao acaso (modos gerados da base). */
  samplePlayers(opts: { minSitelinks: number; minClubs: number; limit: number }): Promise<PlayerRecord[]>;

  // ----- Sem repetição por grupo -----
  /** Itens de um jogo que o grupo já viu (do mais antigo para o mais recente). */
  getSeen(groupJid: string, kind: string): Promise<string[]>;
  markSeen(groupJid: string, kind: string, items: string[]): Promise<void>;
  countPlayers(): Promise<number>;
  getImportState(id: string): Promise<unknown | null>;
  setImportState(id: string, state: unknown): Promise<void>;
  logLookup(row: { query: string; context?: string; outcome: string; playerId?: string | null; ms?: number }): Promise<void>;
  /** Contagem dos resultados de busca nas últimas horas (para o status). */
  lookupSummary(hours: number): Promise<Record<string, number>>;
  /** Nomes que mais terminaram com um resultado (ex.: "ia-nao-achou"), para diagnóstico. */
  topLookups(outcomePrefix: string, hours: number, limit: number): Promise<Array<{ query: string; context: string | null; n: number }>>;

  recordResult(groupJid: string, players: [MatchPlayer, MatchPlayer], winner: Side | 'draw'): Promise<void>;
  /** Resultado de uma sala: vitória para os vencedores, derrota para os demais. */
  recordResults(groupJid: string, rows: Array<{ player: MatchPlayer; result: 'win' | 'draw' | 'loss' }>): Promise<void>;
  getRanking(groupJid: string, limit: number): Promise<RankingRow[]>;
}
