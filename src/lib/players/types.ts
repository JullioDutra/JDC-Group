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
  | 'debutYear';

export const STAT_KEYS: StatKey[] = [
  'careerGoals', 'careerAssists', 'peakValueEurM', 'intlCaps', 'intlGoals', 'worldCupGoals', 'uclGoals',
  'titles', 'careerApps', 'brasileiraoGoals', 'libertadoresGoals', 'worldCupsPlayed', 'heightCm', 'debutYear',
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
  source: 'wikidata' | 'ai' | 'admin';
}

/** Contexto da jogada: resolve homônimos e diz qual número o tema precisa. */
export interface LookupContext {
  position?: Position | null;
  kind?: 'club' | 'country' | 'nation' | 'none';
  teamId?: string;
  metric?: MetricKey;
}
