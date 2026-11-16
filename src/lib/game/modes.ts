import type { MetricKey, PlayerProfile, RestrictionKind } from './types';

export interface GameMode {
  id: string;
  /** Número mostrado no menu. */
  number: number;
  name: string;
  /** Uma linha para o menu. */
  tagline: string;
  metric: MetricKey;
  /** Nome curto do dado, como aparece nas imagens: "gols", "cm"... */
  unit: string;
  /** 'high' = maior soma vence · 'low' = menor soma vence */
  direction: 'high' | 'low';
  restriction: RestrictionKind;
  /** Valor lançado quando o jogador estoura o tempo (o pior possível no tema). */
  penalty: number;
  /** Regras resumidas (3 linhas) para a imagem de início. */
  rules: string[];
}

const restrictionRule: Record<RestrictionKind, string> = {
  none: 'Vale qualquer jogador da história do futebol.',
  club: 'A cada rodada um clube é sorteado: só vale quem joga ou jogou nele.',
  country: 'A cada rodada uma seleção é sorteada: só vale jogador daquele país.',
};

function mode(m: Omit<GameMode, 'rules' | 'penalty'> & { what: string; penalty?: number }): GameMode {
  const { what, ...rest } = m;
  return {
    ...rest,
    penalty: m.penalty ?? 0,
    rules: [
      what,
      restrictionRule[m.restriction],
      m.direction === 'high' ? 'Quem somar MAIS no fim leva o duelo.' : 'Quem somar MENOS no fim leva o duelo.',
    ],
  };
}

export const MODES: GameMode[] = [
  mode({
    id: 'artilheiros', number: 1, name: 'Artilheiros', tagline: 'Gols na carreira',
    metric: 'careerGoals', unit: 'gols', direction: 'high', restriction: 'none',
    what: 'Escale quem mais fez gols na carreira (clubes + seleção).',
  }),
  mode({
    id: 'garcons', number: 2, name: 'Garçons', tagline: 'Assistências na carreira',
    metric: 'careerAssists', unit: 'assist.', direction: 'high', restriction: 'none',
    what: 'Escale quem mais deu assistências na carreira.',
  }),
  mode({
    id: 'milionarios', number: 3, name: 'Milionários', tagline: 'Maior valor de mercado · clube sorteado',
    metric: 'peakValueEurM', unit: 'mi €', direction: 'high', restriction: 'club',
    what: 'Escale os mais valiosos: conta o pico de valor de mercado.',
  }),
  mode({
    id: 'joias', number: 4, name: 'Joias', tagline: 'Os mais jovens · clube sorteado',
    metric: 'age', unit: 'anos', direction: 'low', restriction: 'club', penalty: 45,
    what: 'Escale os jogadores mais novos que você lembrar.',
  }),
  mode({
    id: 'gigantes', number: 5, name: 'Gigantes', tagline: 'Os mais altos',
    metric: 'heightCm', unit: 'cm', direction: 'high', restriction: 'none',
    what: 'Escale os jogadores mais altos, centímetro por centímetro.',
  }),
  mode({
    id: 'baixinhos', number: 6, name: 'Baixinhos', tagline: 'Os mais baixos · clube sorteado',
    metric: 'heightCm', unit: 'cm', direction: 'low', restriction: 'club', penalty: 205,
    what: 'Escale os jogadores mais baixos do clube sorteado.',
  }),
  mode({
    id: 'convocados', number: 7, name: 'Convocados', tagline: 'Jogos pela seleção · seleção sorteada',
    metric: 'intlCaps', unit: 'jogos', direction: 'high', restriction: 'country',
    what: 'Escale quem mais vestiu a camisa da seleção sorteada.',
  }),
  mode({
    id: 'matadores', number: 8, name: 'Matadores da Seleção', tagline: 'Gols pela seleção · seleção sorteada',
    metric: 'intlGoals', unit: 'gols', direction: 'high', restriction: 'country',
    what: 'Escale quem mais marcou pela seleção sorteada.',
  }),
  mode({
    id: 'copa', number: 9, name: 'Reis da Copa', tagline: 'Gols em Copas do Mundo',
    metric: 'worldCupGoals', unit: 'gols', direction: 'high', restriction: 'none',
    what: 'Escale quem mais fez gols em Copas do Mundo.',
  }),
  mode({
    id: 'champions', number: 10, name: 'Noites de Champions', tagline: 'Gols na Champions League',
    metric: 'uclGoals', unit: 'gols', direction: 'high', restriction: 'none',
    what: 'Escale quem mais marcou na Champions League.',
  }),
  mode({
    id: 'papa-titulos', number: 11, name: 'Papa-Títulos', tagline: 'Títulos oficiais · clube sorteado',
    metric: 'titles', unit: 'títulos', direction: 'high', restriction: 'club',
    what: 'Escale quem mais levantou taças oficiais na carreira.',
  }),
];

export function getMode(id: string | null): GameMode | undefined {
  return MODES.find((m) => m.id === id);
}

export function ageFromBirthDate(birthDate: string, now: Date): number | null {
  const born = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(born.getTime())) return null;
  let age = now.getUTCFullYear() - born.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < born.getUTCMonth() ||
    (now.getUTCMonth() === born.getUTCMonth() && now.getUTCDate() < born.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 10 && age <= 130 ? age : null;
}

/** Valor do jogador no tema, ou null se a IA não tiver o dado. */
export function metricValue(profile: PlayerProfile, metric: MetricKey, now: Date): number | null {
  if (metric === 'age') return profile.birthDate ? ageFromBirthDate(profile.birthDate, now) : null;
  const value = profile[metric];
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
