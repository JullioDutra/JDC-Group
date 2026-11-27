import { normalize } from '../../game/text';
import type { ContentCategory, Top10Item } from '../../game/types';
import { TOP10_LISTS } from '../top10-lists';
import { CRAVADA_WIKI } from './cravada-wiki';
import { TOP100_LISTS } from './top100';

/**
 * Listas da Cravada (rodada 18): rankings com fonte e data. O jogo pede uma
 * posição ("quem é o 35º?") e cada um manda 1 nome. Entram as listas novas
 * de futebol (Wikipédia, geradas pelo scripts/cravada-listas.ts), as 12 do
 * Top 100 do Dia e as do Top 10 com 8 itens ou mais.
 */
export interface CravadaList {
  id: string;
  category: ContentCategory;
  title: string;
  source: string;
  /** 'pessoas': vale o sobrenome (como no Top 100); 'coisas': nome exato ou apelido. */
  kind: 'pessoas' | 'coisas';
  items: Top10Item[];
  /** Palavras do tema ("abrir cravada artilheiros"), sem acento. */
  tags: string[];
}

/** Lista grande (pede posição funda): a partir de 15 itens. */
export const CRAVADA_BIG = 15;

/** Até quantos empatados uma posição ainda pode ser pedida (qualquer um deles vale como cravada). */
export const CRAVADA_MAX_TIE = 3;

/** Posições que podem ser pedidas: sem o 1º (fácil demais) e sem empate de mais de 3. */
export function askableRanks(list: CravadaList): number[] {
  const count = new Map<number, number>();
  for (const it of list.items) count.set(it.rank, (count.get(it.rank) ?? 0) + 1);
  return [...count.entries()].filter(([rank, n]) => n <= CRAVADA_MAX_TIE && rank > 1).map(([rank]) => rank).sort((a, b) => a - b);
}

const words = (title: string) => normalize(title).split(' ').filter((w) => w.length >= 4);

const fromTop100 = TOP100_LISTS.map(
  (l): CravadaList => ({ id: `t100:${l.id}`, category: l.category, title: l.title, source: l.source, kind: l.kind, items: l.items, tags: words(l.title) }),
);

/** Do Top 10: 8 itens ou mais e pelo menos 5 posições sem empate. */
const fromTop10 = TOP10_LISTS.map(
  (l): CravadaList => ({ id: `t10:${l.id}`, category: l.category, title: l.title, source: l.source, kind: 'coisas', items: l.items, tags: words(l.title) }),
).filter((l) => l.items.length >= 8 && askableRanks(l).length >= 5);

export const CRAVADA_LISTS: CravadaList[] = [...CRAVADA_WIKI, ...fromTop100, ...fromTop10];

export function getCravadaList(id: string): CravadaList | undefined {
  return CRAVADA_LISTS.find((l) => l.id === id);
}

/** Temas que o grupo pode pedir (palavra → listas). A ordem é a da mensagem de temas. */
export const CRAVADA_THEMES: Array<{ label: string; keys: string[] }> = [
  { label: 'artilheiros', keys: ['artilheiros', 'artilharia', 'gols'] },
  { label: 'goleadores', keys: ['goleadores', 'goleador'] },
  { label: 'copa', keys: ['copa', 'copas', 'copa do mundo'] },
  { label: 'seleções', keys: ['selecoes', 'selecao'] },
  { label: 'champions', keys: ['champions', 'champions league'] },
  { label: 'premier', keys: ['premier', 'premier league', 'ingles', 'inglaterra'] },
  { label: 'la liga', keys: ['la liga', 'laliga', 'espanhol', 'espanha'] },
  { label: 'italiano', keys: ['italiano', 'serie a', 'italia'] },
  { label: 'alemão', keys: ['alemao', 'bundesliga', 'alemanha'] },
  { label: 'francês', keys: ['frances', 'ligue 1', 'franca'] },
  { label: 'brasileirão', keys: ['brasileirao', 'campeonato brasileiro'] },
  { label: 'bola de ouro', keys: ['bola de ouro', 'ballon dor'] },
  { label: 'tabelas', keys: ['tabelas', 'tabela', 'classificacao', 'classificacoes'] },
  { label: 'transferências', keys: ['transferencias', 'contratacoes'] },
  { label: 'estádios', keys: ['estadios', 'estadio'] },
  { label: 'faturamento', keys: ['faturamento', 'dinheiro', 'deloitte'] },
  { label: 'jogos', keys: ['jogos', 'partidas'] },
];

export interface CravadaChoice {
  category: ContentCategory | null;
  /** Rótulo do tema escolhido (null = sem tema). */
  theme: string | null;
  /** Ids das listas do tema (vazio = escolhe pela categoria). */
  listIds: string[];
}

const CATEGORY_WORDS: Array<[RegExp, ContentCategory]> = [
  [/^fut/, 'futebol'],
  [/^(ger|conhec)/, 'geral'],
  [/^hist/, 'historia'],
  [/^anime/, 'anime'],
  [/^polit/, 'politica'],
];

const titleHas = (l: CravadaList, k: string) => ` ${normalize(l.title)} `.includes(` ${k} `);
/** Listas do Top 10 e do Top 100 (sem tags próprias: vale o título). */
const reused = (l: CravadaList) => l.id.includes(':');

/**
 * Listas de um tema. Os temas da lista (artilheiros, premier...) são de
 * futebol: valem as tags das listas novas e o título das do Top 10/Top 100.
 * Outra palavra ("abrir cravada pokémon") procura em todas, menos política.
 */
function listsFor(word: string): CravadaList[] {
  const theme = CRAVADA_THEMES.find((t) => t.keys.includes(word) || normalize(t.label) === word);
  if (theme) {
    return CRAVADA_LISTS.filter((l) => l.category === 'futebol' && theme.keys.some((k) => l.tags.includes(k) || (reused(l) && titleHas(l, k))));
  }
  return CRAVADA_LISTS.filter((l) => l.category !== 'politica' && (l.tags.includes(word) || titleHas(l, word)));
}

/**
 * "abrir cravada" + resto: categoria (futebol, geral, história, anime,
 * política) ou tema. null = não achei o tema.
 */
export function cravadaChoice(rest: string): CravadaChoice | null {
  const word = normalize(rest).replace(/^(de|do|da|dos|das) /, '').trim();
  if (!word) return { category: null, theme: null, listIds: [] };
  if (word === 'tudo' || word === 'misturado') return { category: null, theme: null, listIds: [] };
  const cat = CATEGORY_WORDS.find(([re]) => re.test(word))?.[1];
  if (cat) return { category: cat, theme: null, listIds: [] };
  const lists = listsFor(word);
  if (!lists.length) return null;
  const label = CRAVADA_THEMES.find((t) => t.keys.includes(word) || normalize(t.label) === word)?.label ?? rest.trim();
  return { category: null, theme: label, listIds: lists.map((l) => l.id) };
}

/** Listas por categoria: futebol, geral (o que não é futebol nem política) ou a pedida. */
export function listsOfCategory(category: ContentCategory | null): CravadaList[] {
  if (category === 'geral') return CRAVADA_LISTS.filter((l) => l.category !== 'futebol' && l.category !== 'politica');
  if (category) return CRAVADA_LISTS.filter((l) => l.category === category);
  return CRAVADA_LISTS.filter((l) => l.category !== 'politica');
}

/** Texto dos temas ("temas da cravada"). */
export function cravadaThemesText(head = ''): string {
  const fut = CRAVADA_LISTS.filter((l) => l.category === 'futebol').length;
  const other = CRAVADA_LISTS.length - fut;
  return [
    head,
    '🎯 *Temas da Cravada* (mande *abrir cravada* + tema):',
    `⚽ ${CRAVADA_THEMES.map((t) => t.label).join(', ')}`,
    '🌎 geral · 📜 história · 🍥 anime',
    `Sem tema: 4 rodadas de futebol e 1 de conhecimentos gerais. São ${fut} listas de futebol e ${other} de outros assuntos.`,
  ]
    .filter(Boolean)
    .join('\n');
}
