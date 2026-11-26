import type { Nomination, NominationInput, NominationResult } from '../awards/types';
import type { MatchPlayer, PlayerProfile, RankingRow, Session, SessionState, Side } from '../game/types';
import type { ManualClub, ManualEntry, ManualPosition, PlayerRecord, StatKey } from '../players/types';

/** Temporada do ranking de um grupo. */
export interface Season {
  season: number;
  /** ISO. */
  startedAt: string;
  endedAt?: string | null;
  /** Ranking final (só nas encerradas). */
  ranking?: RankingRow[];
}

export interface MatchStats {
  total: number;
  /** Terminaram com resultado. */
  terminadas: number;
  /** Canceladas, abandonadas ou salas que não começaram. */
  canceladas: number;
  emAndamento: number;
  ultimas24h: number;
  grupos: number;
  desde: string | null;
  /** Por jogo ("1x1" = duelo de escalação): total e terminadas. */
  porJogo: Record<string, { total: number; terminadas: number }>;
}

export interface Store {
  isAwardsActive(groupJid: string): Promise<boolean>;
  setAwardsActive(groupJid: string, active: boolean, by: string): Promise<void>;
  /** Insere atomicamente apenas com coleta aberta; deduplica prova e webhook. */
  addNomination(input: NominationInput): Promise<NominationResult>;
  listNominations(groupJid: string, limit: number, offset: number): Promise<Nomination[]>;
  classifyNomination(groupJid: string, id: string, category: number): Promise<boolean>;

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
  /** Passagem por clube confirmada fora do Wikidata (admin ou Wikipédia): vale como clube da ficha. */
  addManualClub(id: string, club: ManualClub): Promise<void>;
  /** Posição confirmada fora do Wikidata: vale como posição da ficha. */
  addManualPosition(id: string, entry: ManualPosition): Promise<void>;
  /** Apaga fichas (usado ao juntar duplicadas). */
  deletePlayers(ids: string[]): Promise<void>;
  /** Jogadores conhecidos ao acaso (modos gerados da base). */
  samplePlayers(opts: { minSitelinks: number; minClubs: number; limit: number }): Promise<PlayerRecord[]>;

  // ----- Sem repetição por grupo -----
  /** Itens de um jogo que o grupo já viu (do mais antigo para o mais recente). */
  getSeen(groupJid: string, kind: string): Promise<string[]>;
  markSeen(groupJid: string, kind: string, items: string[]): Promise<void>;
  /** Salas abertas de um jogo em todos os grupos (o privado do Impostor acha a partida da pessoa). */
  openMatchesByGame(game: string): Promise<Session[]>;
  /** Tira itens do histórico (ex.: o admin libera o Top 100 de hoje). */
  unmarkSeen(groupJid: string, kind: string, items: string[]): Promise<void>;
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

  // ----- Temporadas -----
  /** Temporada aberta do grupo (cria a 1ª, a partir da primeira partida, se não houver). */
  getSeason(groupJid: string): Promise<Season>;
  /** Fecha a temporada aberta com o ranking final, zera o placar e abre a próxima (que é devolvida). */
  closeSeason(groupJid: string, ranking: RankingRow[]): Promise<Season>;
  /** Temporadas encerradas, da mais antiga para a mais nova. */
  listSeasons(groupJid: string): Promise<Season[]>;
  /** Partidas terminadas do grupo desde a data, por jogo ("1x1", "top10"...). */
  groupGameCounts(groupJid: string, sinceIso: string): Promise<Record<string, number>>;
  /** Só contagens (sem grupo nem pessoa): partidas por situação e por jogo. */
  matchStats(): Promise<MatchStats>;
}

