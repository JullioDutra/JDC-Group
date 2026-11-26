import type { Position } from '../game/types';
import type { PlayerRecord } from './types';
import { USER_AGENT, fetchClubs, isNationalTeamLabel, isYouthOrReserve, mapPosition, type Fetcher } from './wikidata';

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
  /** Ano da primeira passagem por clube profissional. */
  debutYear?: number | null;
}

export interface PlayerSources {
  /** Carreira pelo Wikidata (null = o Wikidata não tem passagens). Lança erro se a fonte falhar. */
  career(id: string): Promise<Career | null>;
  /** Clubes da caixa de informação da Wikipédia (pt e en). null = sem página ou sem caixa. */
  wikipediaClubs(wiki: Career['wiki']): Promise<string[] | null>;
  /** Caixa de informação inteira (clubes, posições, seleção). null = sem página ou sem caixa. */
  wikipediaInfo?(wiki: Career['wiki']): Promise<WikiInfo | null>;
  /** Q-id do jogador no Wikidata pelo nome (e ano de nascimento, se souber). null = não achou. */
  findId(name: string, birthYear: number | null): Promise<string | null>;
  /**
   * Jogadores do Wikidata com esse nome, em fichas completas para entrar na
   * base (busca sob demanda: quem a carga ainda não alcançou). [] = nenhum.
   */
  searchPlayers?(name: string): Promise<PlayerRecord[]>;
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
  const sorted = all.filter((t) => !t.nat).sort((a, b) => (a.start ?? 9999) - (b.start ?? 9999));
  const clubs = sorted.map((t) => t.label);
  const starts = sorted.map((t) => t.start).filter((y): y is number => !!y);
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
    debutYear: starts.length ? Math.min(...starts) : null,
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

/** Campos da caixa, na ordem: nome em minúsculas → valor (sem as referências). */
function infoboxFields(wikitext: string): Array<[string, string]> | null {
  const box = infobox(wikitext);
  if (!box) return null;
  const out: Array<[string, string]> = [];
  for (const field of box.split(/\n\s*\|/).slice(1)) {
    const eq = field.indexOf('=');
    if (eq < 0) continue;
    const value = field.slice(eq + 1).replace(/<ref[^>]*\/>|<ref[^>]*>[\s\S]*?<\/ref>|<!--[\s\S]*?-->/g, '').trim();
    out.push([field.slice(0, eq).trim().toLowerCase(), value]);
  }
  return out;
}

/** Clubes profissionais da caixa de informação de um artigo (pt ou en). */
export function parseInfoboxClubs(wikitext: string): string[] {
  const out: string[] = [];
  for (const [name, value] of infoboxFields(wikitext) ?? []) {
    if (!CLUB_FIELD.test(name)) continue;
    for (const club of clubNames(value)) if (!out.includes(club) && !isNationalTeamLabel(club) && !isYouthOrReserve(club)) out.push(club);
  }
  return out;
}

/** Posição em pt ou en ("Goleiro", "Zagueiro", "Winger", "Centre-back"...). */
export function mapAnyPosition(label: string): Position | null {
  const l = label.toLowerCase();
  if (/goleiro|guarda-redes|arqueiro/.test(l)) return 'GOL';
  if (/zagueiro|defensor|lateral|beque|l[ií]bero|defesa|ala\b/.test(l)) return 'DEF';
  if (/volante|meia|m[eé]dio|meio[- ]campo|meio-campista|armador/.test(l)) return 'MEI';
  if (/atacante|ponta|centroavante|avan[cç]ado|extremo|segundo atacante/.test(l)) return 'ATA';
  return mapPosition(label);
}

/** Posições da caixa ("position" em en, "posição" em pt), na ordem. */
export function parseInfoboxPositions(wikitext: string): Position[] {
  const out: Position[] = [];
  for (const [name, value] of infoboxFields(wikitext) ?? []) {
    if (name !== 'position' && name !== 'posição' && name !== 'posicao') continue;
    for (const piece of value.split(/,|\/|<br\s*\/?>|\be\b|\band\b/i)) {
      const text = piece.replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2').replace(/\{\{[^}]*\}\}/g, '').trim();
      const p = text ? mapAnyPosition(text) : null;
      if (p && !out.includes(p)) out.push(p);
    }
  }
  return out;
}

const numberIn = (value: string | undefined) => {
  const m = (value ?? '').replace(/\[\[[^\]|]*\|/g, '').match(/\d+/);
  return m ? Number(m[0]) : null;
};

/**
 * Jogos e gols pela seleção principal (en: national_teamN / nationalteamN;
 * pt: seleçãoN). Seleção de base, olímpica ou B não conta. Se o jogador
 * defendeu duas seleções principais, vale a de mais jogos.
 */
export function parseInfoboxNational(wikitext: string): { caps: number; goals: number } | null {
  const fields = new Map(infoboxFields(wikitext) ?? []);
  let best: { caps: number; goals: number } | null = null;
  for (let i = 1; i <= 12; i++) {
    const team = fields.get(`national_team${i}`) ?? fields.get(`nationalteam${i}`) ?? fields.get(`seleção${i}`) ?? fields.get(`selecao${i}`);
    if (!team) continue;
    const label = team.replace(/\{\{\s*(pequeno|small)\s*\|([^}]*)\}\}/gi, ' $2');
    if (isYouthOrReserve(label) || /\bolympic|ol[ií]mpic|sub-?\d{2}|\bu-?\d{2}\b|under-\d{2}/i.test(label)) continue;
    const caps = numberIn(fields.get(`national_caps${i}`) ?? fields.get(`nationalcaps${i}`) ?? fields.get(`seleção-jogos${i}`));
    const goals = numberIn(fields.get(`national_goals${i}`) ?? fields.get(`nationalgoals${i}`) ?? fields.get(`seleção-gols${i}`));
    if (caps === null) continue;
    if (!best || caps > best.caps) best = { caps, goals: goals ?? 0 };
  }
  return best;
}

export interface WikiInfo {
  clubs: string[];
  positions: Position[];
  national: { caps: number; goals: number } | null;
}

/**
 * Tudo da caixa de informação: clubes (pt + en), posições (pt + en) e
 * seleção (en primeiro, que traz a data da atualização; pt se faltar).
 */
export async function wikipediaInfo(wiki: Career['wiki'], fetcher: Fetcher = fetch): Promise<WikiInfo | null> {
  const info: WikiInfo = { clubs: [], positions: [], national: null };
  let found = false;
  for (const lang of ['en', 'pt'] as const) {
    const title = wiki[lang];
    if (!title) continue;
    const text = await getText(rawUrl(lang, title), fetcher, 5_000);
    if (!text || !infobox(text)) continue;
    found = true;
    for (const c of parseInfoboxClubs(text)) if (!info.clubs.includes(c)) info.clubs.push(c);
    for (const p of parseInfoboxPositions(text)) if (!info.positions.includes(p)) info.positions.push(p);
    info.national ??= parseInfoboxNational(text);
  }
  return found ? info : null;
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

// ---------- Busca sob demanda (ficha completa) ----------

/** Várias entidades num pedido (rótulos pt/en/es, propriedades e páginas). */
export async function fetchEntities(ids: string[], fetcher: Fetcher = fetch, timeoutMs = 6_000): Promise<Entity[]> {
  if (!ids.length) return [];
  const url = `${WIKIDATA}/w/api.php?action=wbgetentities&ids=${ids.join('|')}&props=labels|claims|sitelinks&languages=pt|en|es&format=json`;
  const data = (await getJson(url, fetcher, timeoutMs)) as { entities?: Record<string, Entity> };
  return ids.map((id) => data.entities?.[id]).filter((e): e is Entity => !!e && !!e.claims);
}

const heightOf = (e: Entity): number | null => {
  const v = claimsOf(e, 'P2048')[0]?.mainsnak.datavalue?.value as { amount?: string; unit?: string } | undefined;
  const n = Number(v?.amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  const cm = Math.round(n < 3 ? n * 100 : n);
  return cm >= 150 && cm <= 215 ? cm : null;
};

const textOf = (s: Snak | undefined) => (s?.datavalue?.value as { text?: string } | undefined)?.text ?? null;

/**
 * Ficha completa a partir da entidade e dos rótulos (times, posições e países):
 * o mesmo formato da carga (nome em pt, nome completo como apelido, seleção
 * pelo país do esporte ou pela cidadania, clubes sem base nem seleção).
 */
export function recordFromEntity(e: Entity, labels: Map<string, { pt?: string; en?: string }>): PlayerRecord | null {
  const name = e.labels?.pt?.value ?? e.labels?.en?.value;
  if (!name) return null;
  const aliases: string[] = [];
  for (const n of [e.labels?.en?.value, e.labels?.es?.value, textOf(claimsOf(e, 'P1477')[0]?.mainsnak)]) {
    if (n && n !== name && !aliases.includes(n)) aliases.push(n);
  }
  const positions: Position[] = [];
  for (const c of claimsOf(e, 'P413')) {
    const label = labels.get(itemId(c.mainsnak) ?? '')?.en;
    const p = label ? mapPosition(label) : null;
    if (p && !positions.includes(p)) positions.push(p);
  }
  const country = (p: string) => claimsOf(e, p).map((c) => labels.get(itemId(c.mainsnak) ?? '')?.pt).find((l): l is string => !!l) ?? null;
  const career = buildCareer(e, labels);
  return {
    id: e.id,
    name,
    aliases: aliases.slice(0, 6),
    positions,
    nationality: country('P1532') ?? country('P27'),
    birthDate: career.birthDate,
    heightCm: heightOf(e),
    clubs: career.clubs,
    debutYear: career.debutYear ?? null,
    sitelinks: career.sitelinks,
    stats: career.intlCaps ? { intlCaps: career.intlCaps, intlGoals: career.intlGoals ?? 0 } : {},
    source: 'wikidata',
  };
}

/**
 * Busca sob demanda: futebolistas do Wikidata com esse nome (busca em pt e,
 * sem resultado, em en), em fichas completas. São 3 pedidos: busca,
 * entidades e rótulos dos times, posições e países.
 */
export async function searchWikidataPlayers(name: string, fetcher: Fetcher = fetch, max = 6): Promise<PlayerRecord[]> {
  let ids: string[] = [];
  for (const lang of ['pt', 'en'] as const) {
    const url = `${WIKIDATA}/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=${lang}&uselang=${lang}&type=item&limit=12&format=json`;
    const data = (await getJson(url, fetcher, 5_000)) as { search?: Array<{ id: string; description?: string }> };
    ids = (data.search ?? []).filter((h) => FOOTBALL_WORDS.test(h.description ?? '')).map((h) => h.id).slice(0, max);
    if (ids.length) break;
  }
  const entities = (await fetchEntities(ids, fetcher)).filter(isFootballer);
  if (!entities.length) return [];
  const refs = new Set<string>();
  for (const e of entities) {
    for (const s of stintsOf(e)) refs.add(s.team);
    for (const p of ['P413', 'P1532', 'P27']) for (const c of claimsOf(e, p)) if (itemId(c.mainsnak)) refs.add(itemId(c.mainsnak)!);
  }
  const labels = await fetchLabels([...refs], fetcher);
  return entities.map((e) => recordFromEntity(e, labels)).filter((r): r is PlayerRecord => !!r);
}

export function defaultSources(fetcher: Fetcher = fetch): PlayerSources {
  return {
    career: (id) => wikidataCareer(id, fetcher),
    wikipediaClubs: (wiki) => wikipediaClubs(wiki, fetcher),
    wikipediaInfo: (wiki) => wikipediaInfo(wiki, fetcher),
    findId: (name, year) => findWikidataId(name, year, fetcher),
    searchPlayers: (name) => searchWikidataPlayers(name, fetcher),
  };
}
