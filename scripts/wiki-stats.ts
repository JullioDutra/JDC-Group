/**
 * Base de números da carreira pela Wikipédia em inglês (rodada 17).
 * Use "npm run wiki-stats -- <comando>" (liga NODE_USE_ENV_PROXY=1).
 *
 *   alvos [--min-fama 30] [--max 6000] [--brasil 6]
 *       data/wikipedia-alvos.json pelo Wikidata: futebolistas com página em
 *       inglês, dos mais famosos para os menos; com --brasil N, também quem
 *       jogou em clube brasileiro e tem N artigos ou mais (entram logo depois
 *       dos mais famosos).
 *   rodar [--limite 500] [--intervalo 3000] [--refazer-dias 14]
 *       Lê a página de cada alvo (pelo endereço do artigo, /wiki/..., que o
 *       robots.txt permite), um pedido a cada 3 s; 429 espera e repete; 5
 *       seguidos param. Salva a cada 25 e retoma de onde parou.
 *   status
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { USER_AGENT } from '../src/lib/players/wikidata';
import { WIKI_STATS } from '../src/lib/players/wikistats-dados';
import { parseWikiStats } from '../src/lib/players/wikistats-parse';
import type { WikiStatsEntry } from '../src/lib/players/wikistats';

const ALVOS = 'data/wikipedia-alvos.json';
const DADOS = 'src/lib/players/wikistats-dados.ts';
interface Alvo { qid: string; title: string; sitelinks: number }

const arg = (name: string, fallback: number) => {
  const i = process.argv.indexOf(`--${name}`);
  const v = i > 0 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(v) ? v : fallback;
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);

function save(entries: WikiStatsEntry[]) {
  const sorted = [...entries].sort((a, b) => a.qid.localeCompare(b.qid, 'en', { numeric: true }));
  const body = sorted.map((e) => `  ${JSON.stringify(e)},`).join('\n');
  // Atômico: um commit no meio da gravação nunca pega o arquivo pela metade.
  writeFileSync(
    `${DADOS}.tmp`,
    `import type { WikiStatsEntry } from './wikistats';\n\n/**\n * Números da carreira lidos na Wikipédia em inglês, GERADOS pelo\n * scripts/wiki-stats.ts (não editar à mão). Uma linha por jogador, ligado à\n * nossa base pelo Q-id do Wikidata. Fonte: tabela "Appearances and goals by\n * club, season and competition" e a caixa de informação (seleção principal).\n */\nexport const WIKI_STATS: WikiStatsEntry[] = [\n${body}${body ? '\n' : ''}];\n`,
  );
  renameSync(`${DADOS}.tmp`, DADOS);
}

function parseCsv(text: string): string[][] {
  return text.trim().split(/\r?\n/).map((line) => {
    const out: string[] = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') quoted = false; else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { out.push(cell); cell = ''; } else cell += ch;
    }
    out.push(cell);
    return out;
  });
}

async function sparqlCsv(query: string): Promise<string[][]> {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch('https://query.wikidata.org/sparql', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'text/csv', 'user-agent': USER_AGENT },
      body: new URLSearchParams({ query }).toString(),
    });
    const text = await res.text();
    if (res.ok && /^p,title,sl/.test(text)) return parseCsv(text).slice(1);
    console.log(`Wikidata limitou (${res.status}); tentativa ${attempt}/6, esperando 65 s...`);
    await sleep(65_000);
  }
  throw new Error('o Wikidata não respondeu; tente mais tarde');
}

const rowsToAlvos = (rows: string[][]): Alvo[] =>
  rows.map(([p, title, sl]) => ({ qid: p.split('/').pop() ?? '', title, sitelinks: Number(sl) })).filter((a) => /^Q\d+$/.test(a.qid) && a.title);

async function alvos() {
  const minFama = arg('min-fama', 30);
  const max = arg('max', 6000);
  const brasil = arg('brasil', 0);
  const famous = rowsToAlvos(await sparqlCsv(`SELECT ?p ?title ?sl WHERE {
  ?p wdt:P106 wd:Q937857 ; wikibase:sitelinks ?sl .
  FILTER(?sl >= ${minFama})
  ?a schema:about ?p ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title .
} ORDER BY DESC(?sl) LIMIT ${max}`));
  let br: Alvo[] = [];
  if (brasil) {
    br = rowsToAlvos(await sparqlCsv(`SELECT DISTINCT ?p ?title ?sl WHERE {
  ?p wdt:P106 wd:Q937857 ; wikibase:sitelinks ?sl ; wdt:P54 ?club .
  ?club wdt:P17 wd:Q155 .
  FILTER(?sl >= ${brasil} && ?sl < ${minFama})
  ?a schema:about ?p ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title .
} ORDER BY DESC(?sl) LIMIT ${max}`));
  }
  const seen = new Set<string>();
  const all = [...famous, ...br].filter((a) => (seen.has(a.qid) ? false : (seen.add(a.qid), true)));
  mkdirSync('data', { recursive: true });
  writeFileSync(ALVOS, JSON.stringify(all).replace(/},{/g, '},\n{') + '\n');
  console.log(`${famous.length} famosos + ${br.length} do Brasil = ${all.length} alvos em ${ALVOS}`);
}

async function page(title: string): Promise<{ status: number; text: string }> {
  const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}?action=raw`;
  const res = await fetch(url, { headers: { 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(20_000) });
  return { status: res.status, text: res.ok ? await res.text() : '' };
}

async function rodar() {
  if (!existsSync(ALVOS)) throw new Error(`falta ${ALVOS}: rode "alvos" antes`);
  const targets = JSON.parse(readFileSync(ALVOS, 'utf8')) as Alvo[];
  const limite = arg('limite', 500);
  const intervalo = Math.max(2000, arg('intervalo', 3000));
  const refazer = arg('refazer-dias', 14);
  const entries = new Map(WIKI_STATS.map((e) => [e.qid, e]));
  const tried = new Set<string>(existsSync('data/wikipedia-sem-tabela.json') ? (JSON.parse(readFileSync('data/wikipedia-sem-tabela.json', 'utf8')) as string[]) : []);
  const fresh = (e: WikiStatsEntry) => (Date.now() - Date.parse(e.read)) / 86_400_000 <= refazer;
  const pending = targets.filter((t) => !tried.has(t.qid) && !(entries.has(t.qid) && fresh(entries.get(t.qid)!))).slice(0, limite);
  console.log(`${pending.length} para ler (de ${targets.length}; ${entries.size} na base)`);
  let ok = 0;
  let none = 0;
  let limited = 0;
  const flush = () => {
    save([...entries.values()]);
    writeFileSync('data/wikipedia-sem-tabela.json', JSON.stringify([...tried]) + '\n');
  };
  for (const [i, t] of pending.entries()) {
    let title = t.title;
    let result: { status: number; text: string } | null = null;
    for (let hop = 0; hop < 2; hop++) {
      await sleep(intervalo);
      result = await page(title).catch(() => ({ status: 0, text: '' }));
      const redirect = result.text.match(/^#REDIRECT\s*\[\[([^\]|#]+)/i);
      if (!redirect) break;
      title = redirect[1].trim();
    }
    if (!result || result.status === 429 || result.status === 0 || result.status >= 500) {
      limited++;
      if (limited >= 5) {
        flush();
        console.log(`PAROU: a Wikipédia limitou 5 vezes seguidas. ${ok} lidos salvos; rode de novo mais tarde.`);
        process.exitCode = 2;
        return;
      }
      await sleep(60_000);
      continue;
    }
    limited = 0;
    const stats = result.status === 200 ? parseWikiStats(result.text) : null;
    if (stats) {
      entries.set(t.qid, { qid: t.qid, title, read: today(), ...stats });
      ok++;
    } else {
      tried.add(t.qid);
      none++;
    }
    if ((i + 1) % 25 === 0) {
      flush();
      console.log(`${i + 1}/${pending.length} · ${ok} com números · ${none} sem tabela`);
    }
  }
  flush();
  console.log(`Fim: ${ok} com números, ${none} sem tabela. Base: ${entries.size} jogadores.`);
}

function status() {
  const targets = existsSync(ALVOS) ? (JSON.parse(readFileSync(ALVOS, 'utf8')) as Alvo[]) : [];
  const recent = WIKI_STATS.filter((e) => (e.asOf ?? '') >= '2026-01-01').length;
  console.log(`Alvos: ${targets.length} · Na base: ${WIKI_STATS.length} (atualizados em 2026: ${recent})`);
}

const cmd = process.argv[2];
const run = cmd === 'alvos' ? alvos() : cmd === 'rodar' ? rodar() : cmd === 'status' ? Promise.resolve(status()) : null;
if (!run) console.log('Uso: npm run wiki-stats -- alvos|rodar|status (veja o topo do arquivo)');
else run.catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
