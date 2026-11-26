import type { MetricKey, Position } from '../game/types';

/** Dados numéricos guardados por jogador. null = a IA já foi consultada e não soube. */
export type StatKey =
  | 'careerGoals'
  | 'careerAssists'
  | 'peakValueEurM'
  | 'intlCaps'
  | 'intlGoals'
  | 'worldCupGoals'
  | 'uclGoals'
  | 'titles'
  | 'careerApps'
  | 'brasileiraoGoals'
  | 'libertadoresGoals'
  | 'worldCupsPlayed'
  | 'heightCm'
  | 'debutYear'
  | 'marketValueEurM'
  | 'careerCards'
  | 'freeKickGoals'
  | 'finalGoals'
  | 'penaltyGoals';

export const STAT_KEYS: StatKey[] = [
  'careerGoals', 'careerAssists', 'peakValueEurM', 'intlCaps', 'intlGoals', 'worldCupGoals', 'uclGoals',
  'titles', 'careerApps', 'brasileiraoGoals', 'libertadoresGoals', 'worldCupsPlayed', 'heightCm', 'debutYear',
  'marketValueEurM', 'careerCards', 'freeKickGoals', 'finalGoals', 'penaltyGoals',
];

/** Ficha guardada na base de jogadores (tabela players). */
export interface PlayerRecord {
  /** "Q12345" (Wikidata) ou "ai:<nome>:<nascimento>" (pesquisado pela IA). */
  id: string;
  /** Nome pelo qual é conhecido (rótulo em português, se houver). */
  name: string;
  /** Outros nomes: nome completo, apelidos, grafias. */
  aliases: string[];
  positions: Position[];
  nationality: string | null;
  birthDate: string | null;
  heightCm: number | null;
  /** Clubes profissionais (um nome por clube, sem time B/base), em ordem. */
  clubs: string[];
  debutYear: number | null;
  /** Quantas Wikipédias têm artigo sobre ele: mede a fama (desempate de homônimos). */
  sitelinks: number;
  stats: Partial<Record<StatKey, number | null>>;
  /** Somas do Wikidata (jogos e gols em clubes), usadas como referência para a IA. */
  anchors?: { clubApps?: number; clubGoals?: number };
  /**
   * Correções do admin (ex.: números conferidos no Transfermarkt). Têm
   * prioridade sobre Wikidata e IA, e a carga do Wikidata nunca apaga.
   */
  manual?: ManualData;
  source: 'wikidata' | 'ai' | 'admin';
}

export interface ManualEntry {
  value: number;
  /** De onde veio (ex.: "Transfermarkt"). */
  source: string;
  /** Data da conferência (AAAA-MM-DD). */
  at: string;
}

/** Passagem por clube confirmada fora do Wikidata (admin ou Wikipédia). */
export interface ManualClub {
  name: string;
  /** "Wikipédia" ou a fonte que o admin informou. */
  source: string;
  /** Data da conferência (AAAA-MM-DD). */
  at: string;
}

export interface ManualData {
  stats?: Partial<Record<StatKey, ManualEntry>>;
  /** Nomes famosos aceitos pelo admin (ex.: "Gabigol"). */
  aliases?: string[];
  /** Clubes confirmados pelo admin ou pela Wikipédia; a carga do Wikidata nunca apaga. */
  clubs?: ManualClub[];
  /** Posições confirmadas pela Wikipédia (ou pelo admin) que o Wikidata não tem. */
  positions?: ManualPosition[];
}

export interface ManualPosition {
  position: Position;
  source: string;
  /** AAAA-MM-DD */
  at: string;
}

/** Contexto da jogada: resolve homônimos e diz qual número o tema precisa. */
export interface LookupContext {
  position?: Position | null;
  kind?: 'club' | 'country' | 'nation' | 'none';
  teamId?: string;
  metric?: MetricKey;
}
