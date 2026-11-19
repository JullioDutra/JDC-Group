/**
 * Simulador do Brasileirão 2026: tabela, jogos que faltam e chances (título,
 * G4, queda) por simulação. Lógica pura: a página, o comando do grupo e os
 * testes usam a mesma.
 *
 * Fonte dos dados: matriz de resultados da página "2026 Campeonato Brasileiro
 * Série A" da Wikipédia em inglês (que cita a CBF). Do texto da página só se
 * aproveitam as siglas dos 20 times conhecidos e os placares.
 */

export interface SimTeam {
  id: string;
  name: string;
  short: string;
}

/** Jogo: mandante, visitante e placar (null = ainda não jogado). */
export type SimMatch = [home: string, away: string, hg: number | null, ag: number | null];

export interface SimData {
  season: number;
  /** Data da última atualização da fonte (AAAA-MM-DD). */
  update: string;
  source: string;
  matches: SimMatch[];
}

/** Palpite de um jogo que falta: vitória do mandante, empate ou do visitante. */
export type Pick = 'H' | 'D' | 'A';

export const SIM_TEAMS: SimTeam[] = [
  { id: 'CAP', name: 'Athletico-PR', short: 'CAP' },
  { id: 'CAM', name: 'Atlético-MG', short: 'CAM' },
  { id: 'BAH', name: 'Bahia', short: 'BAH' },
  { id: 'BOT', name: 'Botafogo', short: 'BOT' },
  { id: 'CHA', name: 'Chapecoense', short: 'CHA' },
  { id: 'COR', name: 'Corinthians', short: 'COR' },
  { id: 'CTB', name: 'Coritiba', short: 'CFC' },
  { id: 'CRU', name: 'Cruzeiro', short: 'CRU' },
  { id: 'FLA', name: 'Flamengo', short: 'FLA' },
  { id: 'FLU', name: 'Fluminense', short: 'FLU' },
  { id: 'GRE', name: 'Grêmio', short: 'GRE' },
  { id: 'INT', name: 'Internacional', short: 'INT' },
  { id: 'MIR', name: 'Mirassol', short: 'MIR' },
  { id: 'PAL', name: 'Palmeiras', short: 'PAL' },
  { id: 'RBB', name: 'Bragantino', short: 'RBB' },
  { id: 'REM', name: 'Remo', short: 'REM' },
  { id: 'SAN', name: 'Santos', short: 'SAN' },
  { id: 'SPA', name: 'São Paulo', short: 'SAO' },
  { id: 'VAS', name: 'Vasco', short: 'VAS' },
  { id: 'VIT', name: 'Vitória', short: 'VIT' },
];

const TEAM_IDS = new Set(SIM_TEAMS.map((t) => t.id));
export const teamName = (id: string) => SIM_TEAMS.find((t) => t.id === id)?.name ?? id;

/** Zonas da tabela (posições, 1 a 20). */
export const ZONES = {
  libertadores: [1, 4],
  pre: [5, 6],
  sula: [7, 12],
  z4: [17, 20],
} as const;
export type Zone = keyof typeof ZONES | null;
export function zoneOf(pos: number): Zone {
  for (const [zone, [a, b]] of Object.entries(ZONES)) if (pos >= a && pos <= b) return zone as Zone;
  return null;
}

export const matchKey = (m: SimMatch) => `${m[0]}-${m[1]}`;
export const remaining = (data: SimData) => data.matches.filter((m) => m[2] === null);

const MONTHS: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
};

/**
 * Lê a matriz de resultados do wikitexto (Module:Sports results). Devolve
 * null se a página não tiver o formato esperado: 20 times conhecidos, 380
 * jogos, cada time com no máximo 38, placares plausíveis.
 */
export function parseWikitext(raw: string, season = 2026): SimData | null {
  const start = raw.indexOf('Sports results');
  if (start < 0) return null;
  const block = raw.slice(start);
  const matches: SimMatch[] = [];
  const seen = new Set<string>();
  for (const [, home, away, value] of block.matchAll(/\|match_([A-Z]{3})_([A-Z]{3})=([^\n]*)/g)) {
    if (!TEAM_IDS.has(home) || !TEAM_IDS.has(away) || home === away) return null;
    const key = `${home}-${away}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const score = value.match(/(\d{1,2})\s*[–-]\s*(\d{1,2})/);
    matches.push(score ? [home, away, Number(score[1]), Number(score[2])] : [home, away, null, null]);
  }
  if (matches.length !== 380) return null;
  const games = new Map<string, number>();
  for (const [h, a, hg] of matches) {
    if (hg === null) continue;
    games.set(h, (games.get(h) ?? 0) + 1);
    games.set(a, (games.get(a) ?? 0) + 1);
  }
  if ([...games.values()].some((n) => n > 38) || matches.some((m) => m[2] !== null && (m[2] > 15 || (m[3] ?? 0) > 15))) return null;
  const up = block.match(/\|update=(\d{1,2}) ([A-Za-z]+) (\d{4})/);
  const update = up && MONTHS[up[2].toLowerCase()] ? `${up[3]}-${MONTHS[up[2].toLowerCase()]}-${up[1].padStart(2, '0')}` : '';
  return { season, update, source: 'CBF, via Wikipédia', matches };
}

export const playedCount = (data: SimData) => data.matches.filter((m) => m[2] !== null).length;

export interface Row {
  id: string;
  name: string;
  p: number;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  sg: number;
}

/** Placar que vale para um palpite (para saldo e gols no desempate). */
export const PICK_SCORE: Record<Pick, [number, number]> = { H: [1, 0], D: [1, 1], A: [0, 1] };

/**
 * Tabela com os jogos feitos e os palpites (jogo sem palpite não conta).
 * Desempate da CBF: pontos, vitórias, saldo, gols pró (depois, o nome).
 */
export function standings(data: SimData, picks: Record<string, Pick> = {}): Row[] {
  const rows = new Map<string, Row>(SIM_TEAMS.map((t) => [t.id, { id: t.id, name: t.name, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 }]));
  for (const m of data.matches) {
    const pick = picks[matchKey(m)];
    const score = m[2] !== null ? [m[2], m[3]!] : pick ? PICK_SCORE[pick] : null;
    if (!score) continue;
    addResult(rows.get(m[0])!, rows.get(m[1])!, score[0], score[1]);
  }
  return sortRows([...rows.values()]);
}

function addResult(home: Row, away: Row, hg: number, ag: number): void {
  home.j++; away.j++;
  home.gp += hg; home.gc += ag; away.gp += ag; away.gc += hg;
  home.sg = home.gp - home.gc; away.sg = away.gp - away.gc;
  if (hg > ag) { home.v++; away.d++; home.p += 3; }
  else if (hg < ag) { away.v++; home.d++; away.p += 3; }
  else { home.e++; away.e++; home.p++; away.p++; }
}

const sortRows = (rows: Row[]) =>
  rows.sort((a, b) => b.p - a.p || b.v - a.v || b.sg - a.sg || b.gp - a.gp || a.name.localeCompare(b.name, 'pt-BR'));

export interface Odds {
  title: number;
  g4: number;
  z4: number;
  /** Pontos e posição médios no fim. */
  points: number;
  pos: number;
  best: number;
  worst: number;
}

/** Poisson pelo método de Knuth (λ pequeno: gols de um jogo). */
function poisson(lambda: number, rng: () => number): number {
  const limit = Math.exp(-lambda);
  let k = 0;
  let p = rng();
  while (p > limit && k < 10) {
    k++;
    p *= rng();
  }
  return k;
}

/**
 * Força de cada time: ataque e defesa relativos à média da liga (gols por
 * jogo), puxados 25% para a média (a campanha não diz tudo), e o peso do
 * mando calculado na própria liga.
 */
export function strengths(data: SimData) {
  const played = data.matches.filter((m) => m[2] !== null);
  const homeAvg = played.reduce((a, m) => a + m[2]!, 0) / Math.max(1, played.length);
  const awayAvg = played.reduce((a, m) => a + m[3]!, 0) / Math.max(1, played.length);
  const avg = (homeAvg + awayAvg) / 2 || 1.3;
  const table = standings(data);
  const shrink = (x: number) => 0.75 * x + 0.25;
  const att: Record<string, number> = {};
  const def: Record<string, number> = {};
  for (const r of table) {
    att[r.id] = shrink(r.j ? r.gp / r.j / avg : 1);
    def[r.id] = shrink(r.j ? r.gc / r.j / avg : 1);
  }
  return { att, def, homeAvg: homeAvg || 1.5, awayAvg: awayAvg || 1.1 };
}

/** Gerador determinístico (mulberry32): a mesma tabela dá as mesmas chances. */
export function seededRng(seed = 2026): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simula os jogos que faltam (os com palpite valem o palpite) e conta, por
 * time, quantas vezes ele termina campeão, no G4 e no Z4.
 */
export function simulate(data: SimData, picks: Record<string, Pick> = {}, runs = 5000, rng: () => number = seededRng()): Record<string, Odds> {
  const base = standings(data, picks);
  const open = remaining(data).filter((m) => !picks[matchKey(m)]);
  const { att, def, homeAvg, awayAvg } = strengths(data);
  const lambdas = open.map((m) => [homeAvg * att[m[0]] * def[m[1]], awayAvg * att[m[1]] * def[m[0]]] as const);
  const acc: Record<string, { title: number; g4: number; z4: number; points: number; pos: number; best: number; worst: number }> = {};
  for (const r of base) acc[r.id] = { title: 0, g4: 0, z4: 0, points: 0, pos: 0, best: 20, worst: 1 };
  const idx = new Map(base.map((r, i) => [r.id, i]));
  for (let run = 0; run < runs; run++) {
    const rows = base.map((r) => ({ ...r }));
    open.forEach((m, i) => {
      addResult(rows[idx.get(m[0])!], rows[idx.get(m[1])!], poisson(lambdas[i][0], rng), poisson(lambdas[i][1], rng));
    });
    sortRows(rows).forEach((r, i) => {
      const a = acc[r.id];
      const pos = i + 1;
      if (pos === 1) a.title++;
      if (pos <= 4) a.g4++;
      if (pos >= ZONES.z4[0]) a.z4++;
      a.points += r.p;
      a.pos += pos;
      a.best = Math.min(a.best, pos);
      a.worst = Math.max(a.worst, pos);
    });
  }
  const out: Record<string, Odds> = {};
  for (const [id, a] of Object.entries(acc)) {
    out[id] = { title: a.title / runs, g4: a.g4 / runs, z4: a.z4 / runs, points: a.points / runs, pos: a.pos / runs, best: a.best, worst: a.worst };
  }
  return out;
}

/** "Chance" para texto: <1% e >99% sem arredondar para 0 ou 100 quando ainda há chance. */
export function pct(x: number): string {
  if (x <= 0) return '0%';
  if (x >= 1) return '100%';
  if (x < 0.01) return '<1%';
  if (x > 0.99) return '>99%';
  return `${Math.round(x * 100)}%`;
}

/** 18/11 a partir de 2026-11-18. */
export const shortDate = (iso: string) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');
