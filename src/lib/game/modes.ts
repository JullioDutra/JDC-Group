import { normalize } from './text';
import type { MetricKey, PlayerProfile, RestrictionKind } from './types';
import type { ClubRegion } from './teams';

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
  /** Só sorteia clubes desta região (Brasileirão, Libertadores, Champions). */
  region?: ClubRegion;
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
    id: 'artilheiros', number: 1, name: 'Artilheiros', tagline: 'Gols na carreira · clube sorteado',
    metric: 'careerGoals', unit: 'gols', direction: 'high', restriction: 'club',
    what: 'Escale quem mais fez gols na carreira (clubes + seleção).',
  }),
  mode({
    id: 'garcons', number: 2, name: 'Garçons', tagline: 'Assistências na carreira · clube sorteado',
    metric: 'careerAssists', unit: 'assist.', direction: 'high', restriction: 'club',
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
    id: 'gigantes', number: 5, name: 'Gigantes', tagline: 'Os mais altos · clube sorteado',
    metric: 'heightCm', unit: 'cm', direction: 'high', restriction: 'club',
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
    id: 'copa', number: 9, name: 'Reis da Copa', tagline: 'Gols em Copas do Mundo · seleção sorteada',
    metric: 'worldCupGoals', unit: 'gols', direction: 'high', restriction: 'country',
    what: 'Escale quem mais fez gols em Copas do Mundo.',
  }),
  mode({
    id: 'champions', number: 10, name: 'Noites de Champions', tagline: 'Gols na Champions League · clube europeu sorteado',
    metric: 'uclGoals', unit: 'gols', direction: 'high', restriction: 'club', region: 'eu',
    what: 'Escale quem mais marcou na Champions League.',
  }),
  mode({
    id: 'papa-titulos', number: 11, name: 'Papa-Títulos', tagline: 'Títulos oficiais · clube sorteado',
    metric: 'titles', unit: 'títulos', direction: 'high', restriction: 'club',
    what: 'Escale quem mais levantou taças oficiais na carreira.',
  }),
  mode({
    id: 'rodados', number: 12, name: 'Rodados', tagline: 'Clubes na carreira · clube sorteado',
    metric: 'clubsCount', unit: 'clubes', direction: 'high', restriction: 'club',
    what: 'Escale os andarilhos: conta quantos clubes profissionais cada um defendeu.',
  }),
  mode({
    id: 'incansaveis', number: 13, name: 'Incansáveis', tagline: 'Jogos na carreira · clube sorteado',
    metric: 'careerApps', unit: 'jogos', direction: 'high', restriction: 'club',
    what: 'Escale quem mais entrou em campo na carreira (clubes + seleção).',
  }),
  mode({
    id: 'brasileirao', number: 14, name: 'Rei do Brasileirão', tagline: 'Gols no Brasileirão · clube brasileiro sorteado',
    metric: 'brasileiraoGoals', unit: 'gols', direction: 'high', restriction: 'club', region: 'br',
    what: 'Escale quem mais marcou na Série A do Campeonato Brasileiro.',
  }),
  mode({
    id: 'libertadores', number: 15, name: 'Libertadores', tagline: 'Gols na Libertadores · clube sul-americano sorteado',
    metric: 'libertadoresGoals', unit: 'gols', direction: 'high', restriction: 'club', region: 'sa',
    what: 'Escale quem mais balançou a rede na Copa Libertadores.',
  }),
  mode({
    id: 'mundialistas', number: 16, name: 'Mundialistas', tagline: 'Copas disputadas · seleção sorteada',
    metric: 'worldCupsPlayed', unit: 'Copas', direction: 'high', restriction: 'country',
    what: 'Escale quem mais disputou Copas do Mundo pela seleção sorteada.',
  }),
  mode({
    id: 'raiz', number: 17, name: 'Raiz', tagline: 'Estreia mais antiga · clube sorteado',
    metric: 'debutYear', unit: 'ano', direction: 'low', restriction: 'club', penalty: new Date().getUTCFullYear(),
    what: 'Escale os mais antigos: conta o ano de estreia como profissional.',
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

/**
 * Faixa plausível de cada dado. Valor fora dela é tratado como "sem dado
 * confiável": protege o jogo de erro da IA e de alguém tentando forçar números.
 */
const RANGES: Record<MetricKey, [number, number]> = {
  careerGoals: [0, 1400],
  careerAssists: [0, 500],
  peakValueEurM: [0, 250],
  age: [14, 100],
  heightCm: [150, 215],
  intlCaps: [0, 230],
  intlGoals: [0, 150],
  worldCupGoals: [0, 20],
  uclGoals: [0, 145],
  titles: [0, 50],
  careerApps: [0, 1600],
  brasileiraoGoals: [0, 250],
  libertadoresGoals: [0, 60],
  worldCupsPlayed: [0, 6],
  debutYear: [1900, 2100],
  clubsCount: [1, 40],
};

function raw(profile: PlayerProfile, metric: MetricKey, now: Date): number | null {
  if (metric === 'age') return profile.birthDate ? ageFromBirthDate(profile.birthDate, now) : null;
  if (metric === 'clubsCount') return profile.clubs.length || null;
  const value = profile[metric];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Valor do jogador no tema, ou null se não houver dado confiável. */
export function metricValue(profile: PlayerProfile, metric: MetricKey, now: Date): number | null {
  const value = raw(profile, metric, now);
  if (value === null) return null;
  const [min, max] = RANGES[metric];
  if (value < min || value > max) return null;
  if (metric === 'debutYear' && value > now.getUTCFullYear()) return null;
  return value;
}

export interface Twists {
  blind: boolean;
  fast: boolean;
  /** "difícil": clubes/seleções menos óbvios no sorteio. */
  hard: boolean;
}

const RANDOM_WORDS = ['aleatorio', 'aleatoria', 'sortear', 'sorteio', 'sorteia', 'surpresa', 'tanto faz', '0'];

export function isRandomWord(word: string): boolean {
  return RANDOM_WORDS.includes(word);
}

export function randomMode(rng: () => number): GameMode {
  return MODES[Math.floor(rng() * MODES.length)];
}

export const FAST_TURN_SECONDS = 45;

/**
 * Lê a escolha do anfitrião: "3", "milionarios", "aleatorio", com extras
 * opcionais "cego" (números escondidos) e "relampago" (45 s por jogada).
 * Ex.: "3 cego", "aleatorio relampago", "12 cego relampago".
 */
export function parseModeChoice(
  norm: string,
  rng: () => number,
): { mode: GameMode; twists: Twists; random: boolean } | undefined {
  const words = norm.split(' ').filter(Boolean);
  const twists: Twists = { blind: false, fast: false, hard: false };
  const rest: string[] = [];
  for (const w of words) {
    if (['cego', 'cega', 'cegas', 'escondido', 'secreto'].includes(w)) twists.blind = true;
    else if (['relampago', 'rapido', 'turbo'].includes(w)) twists.fast = true;
    else if (['dificil', 'hard', 'raiz', 'hardcore'].includes(w) && words.length > 1) twists.hard = true;
    else if (!['as', 'a', 'modo', 'tema'].includes(w)) rest.push(w);
  }
  const choice = rest.join(' ');
  if (!choice) return undefined;
  let mode: GameMode | undefined;
  const random = isRandomWord(choice);
  if (random) {
    mode = randomMode(rng);
  } else if (/^\d+$/.test(choice)) {
    mode = MODES.find((m) => m.number === Number(choice));
  } else {
    mode = MODES.find((m) => normalize(m.name) === choice || m.id === choice);
  }
  return mode ? { mode, twists, random } : undefined;
}
