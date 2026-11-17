import type { Position } from '../game/types';
import type { PlayerRecord } from './types';

/**
 * Carga da base de jogadores a partir do Wikidata (dados abertos, sem chave).
 *
 * - Lista: futebolistas (ocupação Q937857) nascidos numa janela de datas, com
 *   pelo menos N artigos na Wikipédia (sitelinks = fama), dos mais famosos aos menos.
 * - Detalhes (em lotes de até 200): nome em português/inglês, apelidos,
 *   posições (P413), seleção (P1532, ou cidadania P27), altura (P2048) e as
 *   passagens por times (P54) com início, fim, jogos (P1350) e gols (P1351).
 *
 * Limites do serviço: 60 s por consulta e cota por cliente; pede um
 * User-Agent que identifique o app.
 */

export const WDQS_URL = 'https://query.wikidata.org/sparql';
export const USER_AGENT = 'DueloDeCraquesBot/1.0 (https://duelo-de-craques-peach.vercel.app; jogo de futebol para grupos de WhatsApp)';

export type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

interface Binding {
  [name: string]: { type: string; value: string } | undefined;
}

export class WikidataTimeout extends Error {}

export async function sparql(query: string, fetcher: Fetcher = fetch): Promise<Binding[]> {
  const response = await fetcher(WDQS_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/sparql-results+json',
      'user-agent': USER_AGENT,
    },
    body: new URLSearchParams({ query }).toString(),
    signal: AbortSignal.timeout(58_000),
  });
  if (!response.ok) {
    const text = (await response.text()).slice(0, 400);
    if (response.status === 500 && /TimeoutException|timeout/i.test(text)) throw new WikidataTimeout('consulta passou de 60 s');
    if (response.status === 429) throw new WikidataTimeout('cota do Wikidata (429)');
    throw new Error(`Wikidata respondeu ${response.status}: ${text}`);
  }
  const data = (await response.json()) as { results?: { bindings?: Binding[] } };
  return data.results?.bindings ?? [];
}

const qid = (uri: string | undefined) => (uri ? uri.slice(uri.lastIndexOf('/') + 1) : '');
const val = (b: Binding, k: string) => b[k]?.value;

// ---------- Consultas ----------

export function listQuery(from: string, to: string, minSitelinks: number, limit: number, offset: number): string {
  return `SELECT ?p (MAX(?sl) AS ?links) (MIN(?birth) AS ?born) WHERE {
  ?p wdt:P106 wd:Q937857 ; wdt:P569 ?birth ; wikibase:sitelinks ?sl .
  FILTER(?birth >= "${from}T00:00:00Z"^^xsd:dateTime && ?birth < "${to}T00:00:00Z"^^xsd:dateTime && ?sl >= ${minSitelinks})
} GROUP BY ?p ORDER BY DESC(?links) ?p LIMIT ${limit} OFFSET ${offset}`;
}

const values = (ids: string[]) => ids.map((id) => `wd:${id}`).join(' ');

export function identityQuery(ids: string[]): string {
  return `SELECT ?p ?pt ?en ?height ?pos ?country ?citizen WHERE {
  VALUES ?p { ${values(ids)} }
  OPTIONAL { ?p rdfs:label ?pt FILTER(LANG(?pt) = "pt") }
  OPTIONAL { ?p rdfs:label ?en FILTER(LANG(?en) = "en") }
  OPTIONAL { ?p p:P2048/psn:P2048/wikibase:quantityAmount ?height }
  OPTIONAL { ?p wdt:P413 ?posItem . ?posItem rdfs:label ?pos FILTER(LANG(?pos) = "en") }
  OPTIONAL { ?p wdt:P1532 ?c . ?c rdfs:label ?country FILTER(LANG(?country) = "pt") }
  OPTIONAL { ?p wdt:P27 ?ci . ?ci rdfs:label ?citizen FILTER(LANG(?citizen) = "pt") }
}`;
}

export function aliasQuery(ids: string[]): string {
  return `SELECT ?p ?alias WHERE {
  VALUES ?p { ${values(ids)} }
  ?p skos:altLabel ?alias FILTER(LANG(?alias) IN ("pt", "en", "es"))
}`;
}

export function teamsQuery(ids: string[]): string {
  return `SELECT ?p ?team ?pt ?en ?start ?end ?apps ?goals ?nat WHERE {
  VALUES ?p { ${values(ids)} }
  ?p p:P54 ?st . ?st ps:P54 ?team .
  OPTIONAL { ?st pq:P580 ?start }
  OPTIONAL { ?st pq:P582 ?end }
  OPTIONAL { ?st pq:P1350 ?apps }
  OPTIONAL { ?st pq:P1351 ?goals }
  OPTIONAL { ?team rdfs:label ?pt FILTER(LANG(?pt) = "pt") }
  OPTIONAL { ?team rdfs:label ?en FILTER(LANG(?en) = "en") }
  BIND(EXISTS { ?team wdt:P31 wd:Q6979593 } AS ?nat)
}`;
}

// ---------- Interpretação ----------

/** Posição do Wikidata (rótulo em inglês) → posição do jogo. */
export function mapPosition(label: string): Position | null {
  const l = label.toLowerCase();
  if (/goalkeeper|goalie/.test(l)) return 'GOL';
  if (/defender|back\b|centre-back|center-back|full-back|wing-back|sweeper|libero/.test(l)) return 'DEF';
  if (/midfielder|playmaker|regista|volante/.test(l)) return 'MEI';
  if (/forward|striker|winger|attacker|centre forward|center forward/.test(l)) return 'ATA';
  return null;
}

/** Time de base, reserva, B ou olímpico: não conta como passagem pelo clube/seleção. */
export function isYouthOrReserve(label: string): boolean {
  return /\b(sub|under|u)[\s-]?\d{2}\b|\bunder-\d{2}\b|\bolymp|\bol[ií]mpic|\breserv|\bjuvenil|\bjuniores|\byouth\b|\bacademy\b|\bcastilla\b|\batl[eè]tic\b|\bii\b|\biii\b|\bb\b\s*$|\bsquad b\b|\bsegundo equipo\b/i.test(
    label,
  );
}

const year = (iso: string | undefined) => (iso ? Number(iso.slice(0, 4)) : null);

/** Monta as fichas a partir das três consultas de detalhes. */
export function buildRecords(
  list: Array<{ id: string; sitelinks: number; birth: string | null }>,
  identity: Binding[],
  aliases: Binding[],
  teams: Binding[],
): PlayerRecord[] {
  const byId = new Map<string, PlayerRecord & { _teams: Map<string, { label: string; start: number | null; nat: boolean; apps: number; goals: number }> }>();
  for (const item of list) {
    byId.set(item.id, {
      id: item.id, name: '', aliases: [], positions: [], nationality: null, birthDate: item.birth ? item.birth.slice(0, 10) : null,
      heightCm: null, clubs: [], debutYear: null, sitelinks: item.sitelinks, stats: {}, source: 'wikidata', _teams: new Map(),
    });
  }
  const citizen = new Map<string, string>();
  for (const b of identity) {
    const r = byId.get(qid(val(b, 'p')));
    if (!r) continue;
    const pt = val(b, 'pt');
    const en = val(b, 'en');
    if (!r.name) r.name = pt ?? en ?? '';
    for (const n of [pt, en]) if (n && n !== r.name && !r.aliases.includes(n)) r.aliases.push(n);
    const h = Number(val(b, 'height'));
    if (Number.isFinite(h) && h > 0 && !r.heightCm) {
      const cm = Math.round(h < 3 ? h * 100 : h); // valor normalizado vem em metros
      if (cm >= 150 && cm <= 215) r.heightCm = cm;
    }
    const pos = val(b, 'pos');
    const mapped = pos ? mapPosition(pos) : null;
    if (mapped && !r.positions.includes(mapped)) r.positions.push(mapped);
    const country = val(b, 'country');
    if (country && !r.nationality) r.nationality = country;
    const cit = val(b, 'citizen');
    if (cit && !citizen.has(r.id)) citizen.set(r.id, cit);
  }
  for (const b of aliases) {
    const r = byId.get(qid(val(b, 'p')));
    const a = val(b, 'alias');
    if (r && a && a !== r.name && !r.aliases.includes(a) && r.aliases.length < 12) r.aliases.push(a);
  }
  for (const b of teams) {
    const r = byId.get(qid(val(b, 'p')));
    if (!r) continue;
    const label = val(b, 'pt') ?? val(b, 'en');
    if (!label) continue;
    const both = `${val(b, 'pt') ?? ''} ${val(b, 'en') ?? ''}`;
    if (isYouthOrReserve(both)) continue;
    const team = qid(val(b, 'team'));
    const nat = val(b, 'nat') === 'true';
    const entry = r._teams.get(team) ?? { label, start: null, nat, apps: 0, goals: 0 };
    const start = year(val(b, 'start'));
    if (start && (!entry.start || start < entry.start)) entry.start = start;
    const apps = Number(val(b, 'apps'));
    const goals = Number(val(b, 'goals'));
    if (Number.isFinite(apps)) entry.apps = Math.max(entry.apps, apps);
    if (Number.isFinite(goals)) entry.goals = Math.max(entry.goals, goals);
    r._teams.set(team, entry);
  }

  const out: PlayerRecord[] = [];
  for (const r of byId.values()) {
    if (!r.name) continue;
    const entries = [...r._teams.values()];
    const clubs = entries.filter((e) => !e.nat).sort((a, b) => (a.start ?? 9999) - (b.start ?? 9999));
    const national = entries.filter((e) => e.nat);
    r.clubs = clubs.map((c) => c.label);
    const starts = clubs.map((c) => c.start).filter((y): y is number => !!y);
    r.debutYear = starts.length ? Math.min(...starts) : null;
    if (!r.nationality) r.nationality = citizen.get(r.id) ?? null;
    const caps = national.reduce((a, n) => a + n.apps, 0);
    const intlGoals = national.reduce((a, n) => a + n.goals, 0);
    if (national.length && caps > 0) {
      r.stats.intlCaps = caps;
      r.stats.intlGoals = intlGoals;
    }
    const clubApps = clubs.reduce((a, c) => a + c.apps, 0);
    const clubGoals = clubs.reduce((a, c) => a + c.goals, 0);
    if (clubApps > 0) r.anchors = { clubApps, clubGoals };
    const { _teams, ...record } = r;
    void _teams;
    out.push(record);
  }
  return out;
}

// ---------- Passo da importação ----------

export interface ImportState {
  runId: string;
  /** Início da janela atual (AAAA-MM-DD) e tamanho em dias. */
  cursor: string;
  spanDays: number;
  offset: number;
  untilYear: number;
  minSitelinks: number;
  imported: number;
  steps: number;
  done: boolean;
  lastError?: string;
  updatedAt?: string;
}

export const PAGE = 400;
const CHUNK = 200;

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function newImportState(opts: { fromYear?: number; untilYear?: number; minSitelinks?: number } = {}): ImportState {
  return {
    runId: Math.random().toString(36).slice(2, 10),
    cursor: `${opts.fromYear ?? 1925}-01-01`,
    spanDays: 365,
    offset: 0,
    untilYear: opts.untilYear ?? 2010,
    minSitelinks: opts.minSitelinks ?? 5,
    imported: 0,
    steps: 0,
    done: false,
  };
}

/**
 * Um passo: uma página (até 400 jogadores) de uma janela de nascimento.
 * Janela pesada demais (estouro de 60 s) é dividida ao meio e tentada de novo.
 */
export async function importStep(
  state: ImportState,
  save: (records: PlayerRecord[]) => Promise<void>,
  fetcher: Fetcher = fetch,
): Promise<ImportState> {
  const next: ImportState = { ...state, steps: state.steps + 1, lastError: undefined, updatedAt: new Date().toISOString() };
  if (state.done || Number(state.cursor.slice(0, 4)) > state.untilYear) return { ...next, done: true };
  const to = addDays(state.cursor, state.spanDays);
  let rows: Binding[];
  try {
    rows = await sparql(listQuery(state.cursor, to, state.minSitelinks, PAGE, state.offset), fetcher);
  } catch (error) {
    if (error instanceof WikidataTimeout && state.spanDays > 7) {
      return { ...next, spanDays: Math.ceil(state.spanDays / 2), lastError: (error as Error).message };
    }
    return { ...next, lastError: (error as Error).message };
  }
  const list = rows
    .map((b) => ({ id: qid(val(b, 'p')), sitelinks: Number(val(b, 'links') ?? 0), birth: val(b, 'born') ?? null }))
    .filter((x) => /^Q\d+$/.test(x.id));
  for (let i = 0; i < list.length; i += CHUNK) {
    const part = list.slice(i, i + CHUNK);
    const ids = part.map((x) => x.id);
    const [identity, aliases, teams] = await Promise.all([
      sparql(identityQuery(ids), fetcher),
      sparql(aliasQuery(ids), fetcher),
      sparql(teamsQuery(ids), fetcher),
    ]);
    const records = buildRecords(part, identity, aliases, teams);
    await save(records);
    next.imported += records.length;
  }
  if (list.length === PAGE) return { ...next, offset: state.offset + PAGE };
  // Janela concluída: segue para a próxima; janelas pequenas voltam a crescer.
  return { ...next, cursor: to, offset: 0, spanDays: Math.min(365, state.spanDays * 2) };
}
