import { normalize } from './text';
import type { MetricKey, PlayerProfile, RestrictionKind } from './types';
import { LEAGUES, leagueFitsRegion, type ClubRegion, type LeagueId } from './teams';

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
  mode({
    id: 'vitrine', number: 18, name: 'Vitrine Atual', tagline: 'Valor de mercado hoje · clube sorteado',
    metric: 'marketValueEurM', unit: 'mi €', direction: 'high', restriction: 'club',
    what: 'Escale quem vale mais HOJE no mercado (aposentado vale zero).',
  }),
  mode({
    id: 'casca-grossa', number: 19, name: 'Casca-Grossa', tagline: 'Cartões na carreira · clube sorteado',
    metric: 'careerCards', unit: 'cartões', direction: 'high', restriction: 'club',
    what: 'Escale os mais faltosos: conta amarelos + vermelhos na carreira.',
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
  marketValueEurM: [0, 250],
  careerCards: [0, 400],
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
  /** Só clubes desta liga ("1 brasileirão", "3 premier"). */
  league?: LeagueId;
}

/** Como o grupo pede cada liga (sem acento). As frases mais longas primeiro. */
const LEAGUE_WORDS: Array<[string, LeagueId]> = (
  [
    ['campeonato brasileiro', 'br'], ['brasileirao', 'br'], ['brasileiro', 'br'], ['brasil', 'br'], ['br', 'br'],
    ['premier league', 'eng'], ['campeonato ingles', 'eng'], ['liga inglesa', 'eng'], ['premier', 'eng'], ['ingles', 'eng'], ['inglaterra', 'eng'],
    ['campeonato espanhol', 'esp'], ['liga espanhola', 'esp'], ['la liga', 'esp'], ['laliga', 'esp'], ['espanhol', 'esp'], ['espanha', 'esp'],
    ['campeonato italiano', 'ita'], ['liga italiana', 'ita'], ['serie a', 'ita'], ['serie', 'ita'], ['calcio', 'ita'], ['italiano', 'ita'], ['italia', 'ita'],
    ['campeonato alemao', 'ger'], ['liga alema', 'ger'], ['bundesliga', 'ger'], ['alemao', 'ger'], ['alemanha', 'ger'],
    ['campeonato frances', 'fra'], ['liga francesa', 'fra'], ['ligue 1', 'fra'], ['frances', 'fra'], ['franca', 'fra'],
    ['campeonato argentino', 'arg'], ['liga argentina', 'arg'], ['argentino', 'arg'], ['argentina', 'arg'],
  ] as Array<[string, LeagueId]>
).sort((a, b) => b[0].length - a[0].length);

export function leagueLabel(league: LeagueId | undefined): string {
  return league ? LEAGUES[league].label : '';
}

/** O filtro de liga vale para o tema? Só temas de clube; os de região fixa, só com liga da região. */
export function leagueFits(mode: GameMode, league: LeagueId): boolean {
  return mode.restriction === 'club' && leagueFitsRegion(mode.region, league);
}

/** Tira a liga do texto: "1 brasileirao" → { rest: "1", league: "br" }. */
function extractLeague(text: string): { rest: string; league?: LeagueId } {
  for (const [phrase, league] of LEAGUE_WORDS) {
    const re = new RegExp(`(^| )${phrase}( |$)`);
    if (re.test(text)) return { rest: text.replace(re, ' ').replace(/\s+/g, ' ').trim(), league };
  }
  return { rest: text };
}

const RANDOM_WORDS = ['aleatorio', 'aleatoria', 'sortear', 'sorteio', 'sorteia', 'surpresa', 'tanto faz', '0'];

export function isRandomWord(word: string): boolean {
  return RANDOM_WORDS.includes(word);
}

/** Tema sorteado; com liga, só entre os temas em que ela vale. */
export function randomMode(rng: () => number, league?: LeagueId): GameMode {
  const pool = league ? MODES.filter((m) => leagueFits(m, league)) : MODES;
  return pool[Math.floor(rng() * pool.length)];
}

export const FAST_TURN_SECONDS = 45;

/**
 * Lê a escolha do anfitrião: "3", "milionarios", "aleatorio", com extras
 * opcionais "cego" (números escondidos), "relampago" (45 s por jogada),
 * "dificil" e uma liga ("brasileirao", "premier", "la liga"...).
 * Ex.: "3 cego", "aleatorio relampago", "1 brasileirao dificil".
 * `ignoredLeague`: a liga pedida não vale para o tema (seleção, ou região que não combina).
 */
export function parseModeChoice(
  norm: string,
  rng: () => number,
): { mode: GameMode; twists: Twists; random: boolean; ignoredLeague?: LeagueId } | undefined {
  const words = norm.split(' ').filter(Boolean);
  const twists: Twists = { blind: false, fast: false, hard: false };
  const rest: string[] = [];
  for (const w of words) {
    if (['cego', 'cega', 'cegas', 'escondido', 'secreto'].includes(w)) twists.blind = true;
    else if (['relampago', 'rapido', 'turbo'].includes(w)) twists.fast = true;
    else if (['dificil', 'hard', 'raiz', 'hardcore'].includes(w) && words.length > 1) twists.hard = true;
    else if (!['as', 'a', 'modo', 'tema'].includes(w)) rest.push(w);
  }
  const full = rest.join(' ');
  if (!full) return undefined;
  const byName = (x: string) => MODES.find((m) => normalize(m.name) === x || m.id === x);
  // "brasileirao" sozinho (ou "rei do brasileirao") é o tema 14, não a liga.
  const { rest: choice, league } = byName(full) ? { rest: full, league: undefined } : extractLeague(full);
  if (!choice) return undefined;
  let mode: GameMode | undefined;
  const random = isRandomWord(choice);
  if (random) {
    mode = randomMode(rng, league);
  } else if (/^\d+$/.test(choice)) {
    mode = MODES.find((m) => m.number === Number(choice));
  } else {
    mode = byName(choice);
  }
  if (!mode) return undefined;
  if (league && !leagueFits(mode, league)) return { mode, twists, random, ignoredLeague: league };
  return { mode, twists: league ? { ...twists, league } : twists, random };
}

/** A liga pedida não vale para o tema escolhido: avisa e segue sem ela. */
export function ignoredLeagueNote(parsed: { mode: GameMode; ignoredLeague?: LeagueId }): string {
  if (!parsed.ignoredLeague) return '';
  const why =
    parsed.mode.restriction === 'country'
      ? 'esse tema sorteia seleções'
      : parsed.mode.region === 'br'
        ? 'esse tema só tem clubes brasileiros'
        : parsed.mode.region === 'sa'
          ? 'esse tema só aceita Brasileirão ou Argentino'
          : 'esse tema só aceita ligas europeias';
  return `A liga (${leagueLabel(parsed.ignoredLeague)}) ficou de fora: ${why}.\n`;
}
