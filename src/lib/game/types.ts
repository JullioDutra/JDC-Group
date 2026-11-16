export type Position = 'GOL' | 'DEF' | 'MEI' | 'ATA';

/** Formação 1-2-2-1: seis escolhas por jogador. */
export const SLOTS: Position[] = ['GOL', 'DEF', 'DEF', 'MEI', 'MEI', 'ATA'];

export const POSITION_LABEL: Record<Position, string> = {
  GOL: 'goleiro',
  DEF: 'defensor',
  MEI: 'meia',
  ATA: 'atacante',
};

export type MetricKey =
  | 'careerGoals'
  | 'careerAssists'
  | 'peakValueEurM'
  | 'age'
  | 'heightCm'
  | 'intlCaps'
  | 'intlGoals'
  | 'worldCupGoals'
  | 'uclGoals'
  | 'titles'
  | 'careerApps'
  | 'brasileiraoGoals'
  | 'libertadoresGoals'
  | 'worldCupsPlayed'
  | 'debutYear'
  | 'clubsCount';

/** Ficha de um jogador de futebol, devolvida pela IA e guardada em cache. */
export interface PlayerProfile {
  exists: boolean;
  name: string;
  positions: Position[];
  nationality: string | null;
  birthDate: string | null; // AAAA-MM-DD
  clubs: string[];
  heightCm: number | null;
  careerGoals: number | null;
  careerAssists: number | null;
  peakValueEurM: number | null;
  intlCaps: number | null;
  intlGoals: number | null;
  worldCupGoals: number | null;
  uclGoals: number | null;
  titles: number | null;
  careerApps: number | null;
  brasileiraoGoals: number | null;
  libertadoresGoals: number | null;
  worldCupsPlayed: number | null;
  debutYear: number | null;
}

export type RestrictionKind = 'none' | 'club' | 'country';

export interface Restriction {
  kind: RestrictionKind;
  /** id do clube/seleção em teams.ts */
  teamId?: string;
}

export interface Pick {
  name: string;
  key: string; // nome normalizado, para detectar repetição
  value: number;
  /** Outras formas pelas quais o mesmo jogador foi pedido (ex.: o que foi digitado). */
  aliases?: string[];
}

export type Side = 0 | 1; // 0 = anfitrião, 1 = desafiante

export type MatchStatus = 'LOBBY' | 'MODE_SELECT' | 'PLAYING' | 'FINISHED' | 'CANCELLED';

export interface MatchPlayer {
  jid: string;
  name: string;
}

/** Variações que o anfitrião pode ligar junto com o tema. */
export interface MatchOptions {
  /** Números escondidos até o apito final. */
  blind?: boolean;
  /** Segundos por jogada (padrão 90; relâmpago 45). */
  turnSeconds?: number;
  /** "iniciar aleatório": o tema é sorteado assim que alguém aceita, sem menu. */
  autoRandom?: boolean;
  /** "difícil": sorteio com clubes/seleções de nível 2. */
  hard?: boolean;
}

export interface MatchState {
  status: MatchStatus;
  /** Opcional para manter compatibilidade com partidas já gravadas. */
  options?: MatchOptions;
  players: [MatchPlayer, MatchPlayer | null];
  modeId: string | null;
  /** Uma restrição por rodada (índice = slot). */
  restrictions: Restriction[];
  /** picks[lado][slot] */
  picks: [Array<Pick | null>, Array<Pick | null>];
  round: number; // 0..5
  turn: Side;
  /** Momento (ms) em que a vez atual começou — usado pelo comando "tempo". */
  turnStartedAt: number;
  createdAt: number;
  updatedAt: number;
  winner: Side | 'draw' | null;
  /** turnStartedAt da vez em que já avisamos "não é sua vez" (1 aviso por vez). */
  nudgedAt?: number;
}

export interface Match {
  id: string;
  groupJid: string;
  version: number;
  state: MatchState;
}

// ---------- Modo em Grupo (salas) ----------

export type PartyGame =
  | 'escalacao'
  | 'top10'
  | 'quetime'
  | 'quemeh'
  | 'intruso'
  | 'melhortime'
  | 'emoji'
  | 'relampago'
  | 'alfabeto'
  | 'chute';

export interface PartyPlayer {
  jid: string;
  name: string;
  score: number;
  /** Rodadas seguidas sem responder; 2 ou mais = ausente (sai da conta de "todos"). */
  missed: number;
  hits: number;
  lastHitAt: number;
}

export interface PartyBase {
  kind: 'party';
  game: PartyGame;
  status: 'LOBBY' | 'PLAYING' | 'FINISHED' | 'CANCELLED';
  host: MatchPlayer;
  players: PartyPlayer[];
  createdAt: number;
  updatedAt: number;
  /** Prazo da rodada atual e o token do agendamento (QStash) que vai fechá-la. */
  deadline: number | null;
  timerToken: string | null;
  seq: number;
  /** Jids que já foram avisados nesta rodada (evita repetir aviso). */
  warned: string[];
}

export interface EscalacaoParty extends PartyBase {
  game: 'escalacao';
  modeId: string | null;
  randomMode: boolean;
  options: MatchOptions;
  restrictions: Restriction[];
  round: number;
  /** picks[jid][slot] */
  picks: Record<string, Array<Pick | null>>;
  /** Chaves normalizadas de tudo que já foi escalado na partida (respostas únicas). */
  used: string[];
}

export interface Top10Item {
  name: string;
  aliases?: string[];
  detail?: string;
  /** Posição oficial (empates repetem a posição). */
  rank: number;
}

export type ContentCategory = 'futebol' | 'geral' | 'politica' | 'historia' | 'anime';

export interface Top10List {
  id: string;
  category: ContentCategory;
  title: string;
  source: string;
  items: Top10Item[];
}

export interface Top10Party extends PartyBase {
  game: 'top10';
  category: Top10List['category'] | null;
  listId: string | null;
  /** Quem acertou cada item (índice = item da lista). */
  found: Array<{ jid: string; name: string } | null>;
  /** Palpites já usados (certos e errados), normalizados: não podem se repetir. */
  guesses: string[];
  /** Quem mandou o último palpite válido: não pode mandar dois seguidos. */
  lastJid: string | null;
}

/** Quiz em rodadas ("Que time é esse?" e "Quem é?"): corrida, 1 tentativa por rodada. */
export interface QuizParty extends PartyBase {
  game: 'quetime' | 'quemeh' | 'emoji' | 'relampago';
  /** Categoria do conteúdo; null = padrão do jogo (sem política). */
  category: ContentCategory | null;
  round: number; // -1 no lobby
  totalRounds: number;
  /** Ids do conteúdo sorteado para cada rodada. */
  order: string[];
  /** Quem é?: dica atual (0 a 4). */
  clue: number;
  /** Quem já gastou a tentativa nesta rodada. */
  attempts: string[];
  /** Palpites já usados nesta rodada (normalizados): não podem se repetir. */
  guesses: string[];
  /** Rodada resolvida (alguém acertou tudo). */
  solved: boolean;
  /** Pontos marcados na rodada atual, para a revelação. */
  roundHits: Array<{ jid: string; name: string; points: number; label: string }>;
}

/** Intruso: 5 nomes; os jogadores marcam X em quem pertence ao grupo; o que sobra é o palpite de intruso. */
export interface IntrusoParty extends PartyBase {
  game: 'intruso';
  /** Categoria escolhida; null = futebol e geral. */
  category: ContentCategory | null;
  round: number; // -1 no lobby
  totalRounds: number;
  order: string[];
  /** Nomes da rodada, na ordem exibida (A, B, C...). */
  options: string[];
  intruderIndex: number;
  /** X marcados nesta rodada (índice da opção e quem marcou). */
  marks: Array<{ index: number; jid: string; name: string }>;
  /** Quem marcou por último: não pode marcar duas vezes seguidas. */
  lastJid: string | null;
}

/** Escolha do Melhor Time: jogador, clube da rodada e "força" (pico de valor, para o desempate sem IA). */
export interface DraftPick {
  name: string;
  key: string;
  club: string;
  strength: number;
  aliases?: string[];
}

/**
 * Melhor Time (1 x 1): a cada rodada sorteia um clube; cada um escolhe um
 * jogador que passou por ele e a posição que quer preencher, em qualquer ordem.
 * No fim, a IA ou a votação do grupo decide o melhor time.
 */
export interface MelhorTimeParty extends PartyBase {
  game: 'melhortime';
  judge: 'ia' | 'votacao';
  /** "difícil": sorteia também clubes de nível 3. */
  hard?: boolean;
  phase: 'draft' | 'voting' | 'done';
  round: number; // -1 no lobby, 0..5
  clubs: string[];
  /** picks[jid][slot] (slot = índice em SLOTS) */
  picks: Record<string, Array<DraftPick | null>>;
  /** Quem está na vez (índice em players). */
  turn: number;
  used: string[];
  votes: Record<string, number>;
  verdict: { winner: number | 'draw'; reason: string } | null;
}

/** Alfabeto: categoria + letra por rodada; 1 nome por pessoa, ninguém repete. */
export interface AlfabetoParty extends PartyBase {
  game: 'alfabeto';
  round: number;
  totalRounds: number;
  rounds: Array<{ kind: 'pos' | 'nation' | 'club'; value: string; label: string; letter: string }>;
  /** Resposta aceita de cada um nesta rodada. */
  answers: Record<string, { name: string; key: string; order: number }>;
  used: string[];
}

/** Chute Certo: cada um manda um número diferente; vence o mais perto. */
export interface ChuteParty extends PartyBase {
  game: 'chute';
  category: ContentCategory | null;
  round: number;
  totalRounds: number;
  order: string[];
  /** Palpites desta rodada (jid → número) e ordem de chegada. */
  guesses: Record<string, number>;
  arrival: string[];
}

export type PartyState = EscalacaoParty | Top10Party | QuizParty | IntrusoParty | MelhorTimeParty | AlfabetoParty | ChuteParty;

export type SessionState = MatchState | PartyState;

export interface Session {
  id: string;
  groupJid: string;
  version: number;
  state: SessionState;
}

export function isParty(state: SessionState): state is PartyState {
  return (state as PartyState).kind === 'party';
}

export interface RankingRow {
  jid: string;
  name: string;
  games: number;
  wins: number;
  draws: number;
  losses: number;
}

/** Mensagem recebida do WhatsApp, já normalizada pelo adaptador. */
export interface IncomingMessage {
  /** Id da mensagem no WhatsApp (usado também para reagir a ela). */
  id: string;
  groupJid: string;
  groupName?: string;
  senderJid: string;
  senderName: string;
  text: string;
}

/** O que o motor quer mandar de volta para o grupo. */
export type Outgoing =
  | { type: 'text'; text: string }
  | { type: 'image'; image: ImageSpec; caption?: string }
  /** Reação (ex.: ✅) na mensagem de um jogador: confirma sem poluir o grupo. */
  | { type: 'react'; messageId: string; senderJid: string; emoji: string }
  /** Agenda o fim da rodada (QStash). Não é enviado ao grupo. */
  | { type: 'schedule'; delaySeconds: number; token: string };

export type ImageSpec =
  | { kind: 'challenge'; host: string }
  | { kind: 'modes' }
  | { kind: 'kickoff'; state: MatchState }
  | { kind: 'pitch'; state: MatchState }
  | { kind: 'ranking'; groupName: string; rows: RankingRow[] }
  | { kind: 'partyLobby'; state: PartyState }
  | { kind: 'partyTable'; state: EscalacaoParty }
  | { kind: 'top10Board'; state: Top10Party; list: Top10List; final: boolean }
  | { kind: 'lineupQuiz'; state: QuizParty; lines: string[][] }
  | { kind: 'partyScore'; state: PartyState; title: string; final: boolean }
  | { kind: 'intrusoBoard'; state: IntrusoParty; reason: string; reveal: boolean }
  | { kind: 'draftBoard'; state: MelhorTimeParty };
