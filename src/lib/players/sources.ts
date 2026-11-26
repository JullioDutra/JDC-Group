import { USER_AGENT, fetchClubs, isNationalTeamLabel, isYouthOrReserve, type Fetcher } from './wikidata';

/**
 * Fontes para conferir a carreira de um jogador na hora da jogada (rodada 14).
 *
 * Ordem de confiança das passagens por clube:
 *   1. correção do admin (*corrigir X clube Y*);
 *   2. Wikidata (passagens P54), lido pela página da entidade (Special:EntityData),
 *      que é cacheada e não depende do serviço de consultas (WDQS), que às vezes
 *      entra em pane (em 25/11/2026: 1 consulta por minuto);
 *   3. Wikipédia (caixa de informação em pt e en), só quando o Wikidata não tem
 *      a passagem pedida: cobre transferência recente que ainda não entrou lá
 *      (ex.: Fábio no Fluminense desde 2022);
 *   4. IA: nunca prova passagem sozinha.
 */

export interface Career {
  id: string;
  /** Clubes profissionais (sem base, time B nem seleção), na ordem da carreira. */
  clubs: string[];
  /** Jogos e gols pela seleção principal (somados das passagens), quando o Wikidata tem. */
  intlCaps?: number;
  intlGoals?: number;
  /** Títulos das páginas na Wikipédia (para a segunda fonte). */
  wiki: { pt?: string; en?: string };
  sitelinks: number;
  birthDate: string | null;
  label: string | null;
}

export interface PlayerSources {
  /** Carreira pelo Wikidata (null = o Wikidata não tem passagens). Lança erro se a fonte falhar. */
  career(id: string): Promise<Career | null>;
  /** Clubes da caixa de informação da Wikipédia (pt e en). null = sem página ou sem caixa. */
  wikipediaClubs(wiki: Career['wiki']): Promise<string[] | null>;
  /** Q-id do jogador no Wikidata pelo nome (e ano de nascimento, se souber). null = não achou. */
  findId(name: string, birthYear: number | null): Promise<string | null>;
}

const WIKIDATA = 'https://www.wikidata.org';
/** Futebolista (ocupação P106). */
const FOOTBALLER = 'Q937857';

interface Snak {
  snaktype?: string;
  datavalue?: { value: unknown };
}
interface Claim {
  mainsnak: Snak;
  rank?: string;
  qualifiers?: Record<string, Snak[]>;
}
export interface Entity {
  id: string;
  labels?: Record<string, { value: string }>;
  claims?: Record<string, Claim[]>;
  sitelinks?: Record<string, { title: string }>;
}

async function getJson(url: string, fetcher: Fetcher, timeoutMs: number): Promise<unknown> {
  const res = await fetcher(url, { headers: { 'user-agent': USER_AGENT, accept: 'application/json' }, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`${new URL(url).host} respondeu ${res.status}`);
  return res.json();
}

async function getText(url: string, fetcher: Fetcher, timeoutMs: number): Promise<string | null> {
  const res = await fetcher(url, { headers: { 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(timeoutMs) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${new URL(url).host} respondeu ${res.status}`);
  return res.text();
}

export async function fetchEntity(id: string, fetcher: Fetcher = fetch, timeoutMs = 6_000): Promise<Entity | null> {
  if (!/^Q\d+$/.test(id)) return null;
  const data = (await getJson(`${WIKIDATA}/wiki/Special:EntityData/${id}.json`, fetcher, timeoutMs)) as { entities?: Record<string, Entity> };
  const entities = Object.values(data.entities ?? {});
  return entities[0] ?? null;
}

/** Rótulos pt/en de vários itens (até 50 por pedido). */
export async function fetchLabels(ids: string[], fetcher: Fetcher = fetch, timeoutMs = 6_000): Promise<Map<string, { pt?: string; en?: string }>> {
  const out = new Map<string, { pt?: string; en?: string }>();
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const url = `${WIKIDATA}/w/api.php?action=wbgetentities&ids=${chunk.join('|')}&props=labels&languages=pt|en&format=json`;
    const data = (await getJson(url, fetcher, timeoutMs)) as { entities?: Record<string, { labels?: Record<string, { value: string }> }> };
    for (const [id, e] of Object.entries(data.entities ?? {})) out.set(id, { pt: e.labels?.pt?.value, en: e.labels?.en?.value });
  }
  return out;
}

const itemId = (s: Snak | undefined) => {
  const v = s?.datavalue?.value as { id?: string } | undefined;
  return v?.id ?? null;
};
const timeYear = (s: Snak | undefined) => {
  const v = s?.datavalue?.value as { time?: string } | undefined;
  const m = v?.time?.match(/^[+-](\d{4})/);
  return m ? Number(m[1]) : null;
};
const amount = (s: Snak | undefined) => {
  const v = s?.datavalue?.value as { amount?: string } | undefined;
  const n = Number(v?.amount);
  return Number.isFinite(n) ? n : 0;
};
const claimsOf = (e: Entity, p: string) => (e.claims?.[p] ?? []).filter((c) => c.rank !== 'deprecated');

export function birthOf(e: Entity): string | null {
  const v = claimsOf(e, 'P569')[0]?.mainsnak.datavalue?.value as { time?: string } | undefined;
  const m = v?.time?.match(/^\+(\d{4}-\d{2}-\d{2})/);
  return m && !m[1].endsWith('-00') ? m[1] : null;
}

export function isFootballer(e: Entity): boolean {
  return claimsOf(e, 'P106').some((c) => itemId(c.mainsnak) === FOOTBALLER);
}

/** Times das passagens (P54), com início, jogos e gols, na ordem em que aparecem. */
export function stintsOf(e: Entity): Array<{ team: string; start: number | null; apps: number; goals: number }> {
  return claimsOf(e, 'P54')
    .map((c) => ({
      team: itemId(c.mainsnak) ?? '',
      start: timeYear(c.qualifiers?.P580?.[0]),
      apps: amount(c.qualifiers?.P1350?.[0]),
      goals: amount(c.qualifiers?.P1351?.[0]),
    }))
    .filter((s) => s.team);
}

/** Monta a carreira com os rótulos dos times: sem base/time B; seleção separada. */
export function buildCareer(e: Entity, labels: Map<string, { pt?: string; en?: string }>): Career {
  const teams = new Map<string, { label: string; start: number | null; nat: boolean; apps: number; goals: number }>();
  for (const s of stintsOf(e)) {
    const l = labels.get(s.team);
    const label = l?.pt ?? l?.en;
    if (!label) continue;
    const both = `${l?.pt ?? ''} ${l?.en ?? ''}`;
    if (isYouthOrReserve(both)) continue;
    const entry = teams.get(s.team) ?? { label, start: null, nat: isNationalTeamLabel(both), apps: 0, goals: 0 };
    if (s.start && (!entry.start || s.start < entry.start)) entry.start = s.start;
    entry.apps += s.apps;
    entry.goals += s.goals;
    teams.set(s.team, entry);
  }
  const all = [...teams.values()];
  const clubs = all.filter((t) => !t.nat).sort((a, b) => (a.start ?? 9999) - (b.start ?? 9999)).map((t) => t.label);
  const national = all.filter((t) => t.nat);
  const caps = national.reduce((a, t) => a + t.apps, 0);
  return {
    id: e.id,
    clubs,
    ...(caps > 0 ? { intlCaps: caps, intlGoals: national.reduce((a, t) => a + t.goals, 0) } : {}),
    wiki: { pt: e.sitelinks?.ptwiki?.title, en: e.sitelinks?.enwiki?.title },
    sitelinks: Object.keys(e.sitelinks ?? {}).filter((k) => k.endsWith('wiki') && k !== 'commonswiki').length,
    birthDate: birthOf(e),
    label: e.labels?.pt?.value ?? e.labels?.en?.value ?? null,
  };
}

/**
 * Carreira pelo Wikidata. Página da entidade + rótulos dos times; se os
 * rótulos falharem, cai na consulta antiga (WDQS) só para os clubes.
 */
export async function wikidataCareer(id: string, fetcher: Fetcher = fetch): Promise<Career | null> {
  const e = await fetchEntity(id, fetcher);
  if (!e) return null;
  const teamIds = [...new Set(stintsOf(e).map((s) => s.team))];
  if (!teamIds.length) return null;
  try {
    return buildCareer(e, await fetchLabels(teamIds, fetcher));
  } catch (error) {
    const clubs = await fetchClubs(id, fetcher).catch(() => null);
    if (!clubs) throw error;
    const career = buildCareer(e, new Map());
    return { ...career, clubs };
  }
}

// ---------- Wikipédia ----------

/** Só a caixa de informação do jogador (do "{{Info/Futebol" até o "}}" que a fecha). */
function infobox(wikitext: string): string | null {
  const start = wikitext.search(/\{\{\s*(Info\/Futebol|Infobox football biography|Info\/Futebolista)/i);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < wikitext.length - 1; i++) {
    if (wikitext[i] === '{' && wikitext[i + 1] === '{') {
      depth++;
      i++;
    } else if (wikitext[i] === '}' && wikitext[i + 1] === '}') {
      depth--;
      i++;
      if (depth === 0) return wikitext.slice(start, i + 1);
    }
  }
  return wikitext.slice(start);
}

/** Campos de clube profissional: pt (clube1, clubes, clube atual) e en (clubs1). Nada de base nem seleção. */
const CLUB_FIELD = /^(clube\s*\d+|clubes|clube atual|clubs\d+)$/i;

/** Nomes de clube num valor da caixa: {{Futebol X}}, [[Artigo|Texto]] ou texto simples. */
function clubNames(value: string): string[] {
  const out: string[] = [];
  for (const piece of value.split(/<br\s*\/?>|\n\*/i)) {
    const names: string[] = [];
    for (const m of piece.matchAll(/\{\{\s*Futebol\s+([^|}]+)/gi)) names.push(m[1].trim());
    for (const m of piece.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) names.push([m[1], m[2]].filter(Boolean).join(' ').trim());
    if (!names.length) {
      const plain = piece.replace(/\{\{[^}]*\}\}|<[^>]+>|\(.*?\)|→|'''?/g, ' ').replace(/\s+/g, ' ').trim();
      if (plain) names.push(plain);
    }
    const joined = names.join(' ').trim();
    if (joined) out.push(joined);
  }
  return out;
}

/** Clubes profissionais da caixa de informação de um artigo (pt ou en). */
export function parseInfoboxClubs(wikitext: string): string[] {
  const box = infobox(wikitext);
  if (!box) return [];
  const out: string[] = [];
  for (const field of box.split(/\n\s*\|/).slice(1)) {
    const eq = field.indexOf('=');
    if (eq < 0) continue;
    const name = field.slice(0, eq).trim();
    if (!CLUB_FIELD.test(name)) continue;
    for (const club of clubNames(field.slice(eq + 1))) if (!out.includes(club) && !isNationalTeamLabel(club) && !isYouthOrReserve(club)) out.push(club);
  }
  return out;
}

const rawUrl = (lang: 'pt' | 'en', title: string) => `https://${lang}.wikipedia.org/w/index.php?title=${encodeURIComponent(title.replace(/ /g, '_'))}&action=raw`;

export async function wikipediaClubs(wiki: Career['wiki'], fetcher: Fetcher = fetch): Promise<string[] | null> {
  const out: string[] = [];
  let found = false;
  for (const lang of ['pt', 'en'] as const) {
    const title = wiki[lang];
    if (!title) continue;
    const text = await getText(rawUrl(lang, title), fetcher, 5_000);
    if (!text) continue;
    const clubs = parseInfoboxClubs(text);
    if (clubs.length) found = true;
    for (const c of clubs) if (!out.includes(c)) out.push(c);
  }
  return found ? out : null;
}

// ---------- Busca do Q-id ----------

const FOOTBALL_WORDS = /futebol|football|soccer|f[uú]tbol|calci|fu[sß]ball/i;

/**
 * Q-id pelo nome: busca do Wikidata, só itens descritos como futebolista;
 * confere a ocupação e o ano de nascimento (se souber) na página da entidade.
 */
export async function findWikidataId(name: string, birthYear: number | null, fetcher: Fetcher = fetch): Promise<string | null> {
  for (const lang of ['pt', 'en'] as const) {
    const url = `${WIKIDATA}/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=${lang}&uselang=${lang}&type=item&limit=10&format=json`;
    const data = (await getJson(url, fetcher, 5_000)) as { search?: Array<{ id: string; description?: string }> };
    const hits = (data.search ?? []).filter((h) => FOOTBALL_WORDS.test(h.description ?? '')).slice(0, 3);
    for (const hit of hits) {
      const e = await fetchEntity(hit.id, fetcher);
      if (!e || !isFootballer(e)) continue;
      const born = birthOf(e);
      if (birthYear && born && Number(born.slice(0, 4)) !== birthYear) continue;
      return e.id;
    }
  }
  return null;
}

export function defaultSources(fetcher: Fetcher = fetch): PlayerSources {
  return {
    career: (id) => wikidataCareer(id, fetcher),
    wikipediaClubs: (wiki) => wikipediaClubs(wiki, fetcher),
    findId: (name, year) => findWikidataId(name, year, fetcher),
  };
}
