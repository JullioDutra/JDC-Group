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
  | 'titles';

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
}

export type Side = 0 | 1; // 0 = anfitrião, 1 = desafiante

export type MatchStatus = 'LOBBY' | 'MODE_SELECT' | 'PLAYING' | 'FINISHED' | 'CANCELLED';

export interface MatchPlayer {
  jid: string;
  name: string;
}

export interface MatchState {
  status: MatchStatus;
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
}

export interface Match {
  id: string;
  groupJid: string;
  version: number;
  state: MatchState;
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
  | { type: 'image'; image: ImageSpec; caption?: string };

export type ImageSpec =
  | { kind: 'challenge'; host: string }
  | { kind: 'modes' }
  | { kind: 'kickoff'; state: MatchState }
  | { kind: 'pitch'; state: MatchState }
  | { kind: 'ranking'; groupName: string; rows: RankingRow[] };
