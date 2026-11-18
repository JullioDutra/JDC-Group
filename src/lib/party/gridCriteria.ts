import { CLUBS, NATIONS, clubsIn, getTeam, isFromNation, playedForClub, type Team } from '../game/teams';
import { normalize } from '../game/text';
import { coherenceScore, nameTokens } from '../players/keys';
import type { PlayerRecord } from '../players/types';
import { TITLE_ENTRIES, TITLE_INFO, type TitleEntry, type TitleId } from './content/titles';

/**
 * Critérios da Grade 3x3: clube, seleção, liga (jogou em algum clube da liga)
 * e título (campeão do mundo, Bola de Ouro, Champions, Libertadores).
 * No estado da partida, cada critério é um texto "tipo:id" ("league:premier").
 */
export type CriterionKind = 'club' | 'nation' | 'league' | 'title';
export interface Criterion {
  kind: CriterionKind;
  id: string;
}

export const LEAGUES: Record<string, { name: string; clubs: string[] }> = {
  premier: {
    name: 'Premier League',
    clubs: 'manchester-united manchester-city liverpool chelsea arsenal tottenham newcastle aston-villa west-ham everton leeds nottingham leicester southampton fulham wolves crystal-palace brighton'.split(' '),
  },
  laliga: { name: 'LaLiga', clubs: 'real-madrid barcelona atletico-madrid sevilla valencia athletic real-sociedad villarreal betis celta deportivo espanyol malaga'.split(' ') },
  seriea: { name: 'Serie A', clubs: 'juventus milan inter napoli roma lazio fiorentina atalanta torino parma sampdoria udinese bologna'.split(' ') },
  bundesliga: { name: 'Bundesliga', clubs: 'bayern dortmund leverkusen schalke wolfsburg hamburgo werder stuttgart eintracht leipzig gladbach'.split(' ') },
  ligue1: { name: 'Ligue 1', clubs: 'psg marseille lyon monaco lille nice rennes bordeaux saint-etienne'.split(' ') },
  brasileirao: { name: 'Brasileirão', clubs: clubsIn('br').map((t) => t.id) },
  portugues: { name: 'Liga Portuguesa', clubs: 'porto benfica sporting braga'.split(' ') },
  argentino: { name: 'Campeonato Argentino', clubs: 'boca river independiente racing san-lorenzo estudiantes velez rosario-central lanus'.split(' ') },
};

export const encodeCriterion = (c: Criterion) => `${c.kind}:${c.id}`;

/** Lê "tipo:id"; partidas antigas guardavam só o id (linha = clube, coluna = seleção). */
export function parseCriterion(raw: string, legacy: 'club' | 'nation'): Criterion {
  const i = raw.indexOf(':');
  if (i === -1) return { kind: legacy, id: raw };
  return { kind: raw.slice(0, i) as CriterionKind, id: raw.slice(i + 1) };
}

const SUB: Record<CriterionKind, string> = { club: 'CLUBE', nation: 'SELEÇÃO', league: 'LIGA', title: 'TÍTULO' };

export function criterionLabel(c: Criterion): { name: string; sub: string } {
  if (c.kind === 'league') return { name: LEAGUES[c.id]?.name ?? c.id, sub: SUB.league };
  if (c.kind === 'title') return { name: TITLE_INFO[c.id as TitleId]?.label ?? c.id, sub: SUB.title };
  return { name: getTeam(c.id)?.name ?? c.id, sub: SUB[c.kind] };
}

/** Frase do "não": "não passou pelo Milan", "não jogou na Premier League"... */
export function criterionMiss(c: Criterion): string {
  const { name } = criterionLabel(c);
  if (c.kind === 'club') return `não passou pelo ${name}`;
  if (c.kind === 'nation') return `não é da seleção ${name}`;
  if (c.kind === 'league') return `não jogou na ${name}`;
  if (c.id === 'copa') return 'não foi campeão do mundo';
  if (c.id === 'bola') return 'não ganhou a Bola de Ouro';
  if (c.id === 'champions') return 'não foi campeão da Champions';
  return 'não foi campeão da Libertadores';
}

// ---------- Títulos (listas curadas) ----------

/** Índice por palavra do nome, para não comparar com a lista inteira. */
const TITLE_INDEX = new Map<string, Array<{ title: TitleId; entry: TitleEntry }>>();
for (const [title, entries] of Object.entries(TITLE_ENTRIES) as Array<[TitleId, TitleEntry[]]>) {
  for (const entry of entries) {
    for (const token of nameTokens(entry.name)) {
      const bucket = TITLE_INDEX.get(token) ?? [];
      bucket.push({ title, entry });
      TITLE_INDEX.set(token, bucket);
    }
  }
}

function entryMatches(entry: TitleEntry, record: Pick<PlayerRecord, 'name' | 'aliases' | 'nationality' | 'clubs'>): boolean {
  if (coherenceScore(entry.name, [record.name, ...record.aliases]) === 0) return false;
  if (entry.nation) {
    const nation = getTeam(entry.nation);
    if (nation && !isFromNation(nation, record.nationality)) return false;
  }
  if (entry.club) {
    const club = getTeam(entry.club);
    if (club && !playedForClub(club, record.clubs)) return false;
  }
  return true;
}

/** Títulos que a lista curada confirma para o jogador. */
export function curatedTitles(record: Pick<PlayerRecord, 'name' | 'aliases' | 'nationality' | 'clubs'>): Set<TitleId> {
  const out = new Set<TitleId>();
  const tokens = new Set([record.name, ...record.aliases].flatMap((n) => nameTokens(n)));
  for (const token of tokens) {
    for (const { title, entry } of TITLE_INDEX.get(token) ?? []) {
      if (!out.has(title) && entryMatches(entry, record)) out.add(title);
    }
  }
  return out;
}

/** Todas as chaves de busca dos campeões das listas (para buscar as fichas na base de uma vez). */
export function titleNames(): string[] {
  return [...new Set(Object.values(TITLE_ENTRIES).flat().map((e) => normalize(e.name)))];
}

// ---------- Conferência ----------

export interface Features {
  clubs: Set<string>;
  nation: string | null;
  leagues: Set<string>;
  titles: Set<TitleId>;
}

const ALL_CLUBS: Team[] = CLUBS;

/** Clube conhecido de um nome de clube da ficha (com memória: os nomes se repetem muito). */
const CLUB_MEMO = new Map<string, string | null>();
function clubIdOf(raw: string): string | null {
  const hit = CLUB_MEMO.get(raw);
  if (hit !== undefined) return hit;
  const id = ALL_CLUBS.find((t) => playedForClub(t, [raw]))?.id ?? null;
  if (CLUB_MEMO.size > 20_000) CLUB_MEMO.clear();
  CLUB_MEMO.set(raw, id);
  return id;
}

export function featuresOf(record: Pick<PlayerRecord, 'name' | 'aliases' | 'nationality' | 'clubs'>): Features {
  const clubs = new Set<string>();
  for (const raw of record.clubs) {
    const id = clubIdOf(raw);
    if (id) clubs.add(id);
  }
  const leagues = new Set<string>();
  for (const [id, league] of Object.entries(LEAGUES)) if (league.clubs.some((c) => clubs.has(c))) leagues.add(id);
  const nation = NATIONS.find((t) => isFromNation(t, record.nationality))?.id ?? null;
  return { clubs, nation, leagues, titles: curatedTitles(record) };
}

export function satisfies(f: Features, c: Criterion): boolean {
  if (c.kind === 'club') return f.clubs.has(c.id);
  if (c.kind === 'nation') return f.nation === c.id;
  if (c.kind === 'league') return f.leagues.has(c.id);
  return f.titles.has(c.id as TitleId);
}

/** Linha e coluna que seriam óbvias juntas (clube dentro da própria liga, duas ligas). */
export function trivialPair(a: Criterion, b: Criterion): boolean {
  const pair = [a, b];
  const league = pair.find((c) => c.kind === 'league');
  const club = pair.find((c) => c.kind === 'club');
  if (league && club && LEAGUES[league.id]?.clubs.includes(club.id)) return true;
  if (a.kind === b.kind && a.id === b.id) return true;
  if (a.kind === 'nation' && b.kind === 'nation') return true;
  return false;
}
