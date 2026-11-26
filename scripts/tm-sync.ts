/**
 * Atualização da base com o Transfermarkt (rodada 17). Roda fora do bot
 * (na sessão do Claude ou na máquina do admin) e grava a base versionada em
 * src/lib/transfermarkt/dados.ts, que vai junto no deploy.
 *
 * Use "npm run tm -- <comando>" (liga NODE_USE_ENV_PROXY=1 para o Node usar o proxy).
 *
 *   npm run tm -- alvos [--min-fama 30] [--max 5000]
 *       Monta data/transfermarkt-alvos.json pelo Wikidata: futebolistas com
 *       código do Transfermarkt (P2446), dos mais famosos para os menos.
 *   npm run tm -- rodar [--limite 100] [--intervalo 4000] [--refazer-dias 30]
 *       Lê no Transfermarkt os alvos ainda sem dado (ou com dado velho).
 *       Salva a cada 10 jogadores; para sozinho se o site bloquear.
 *   npm run tm -- status
 *
 * Boa vizinhança (no TmClient): 1 pedido a cada 4 s (mínimo 2 s), robots.txt,
 * User-Agent do bot e parada no bloqueio, sem contornar.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { TmBlocked, TmClient } from '../src/lib/transfermarkt/client';
import { TM_DADOS } from '../src/lib/transfermarkt/dados';
import { readTmPlayer } from '../src/lib/transfermarkt/sync';
import type { TmPlayer, TmTarget } from '../src/lib/transfermarkt/types';
import { USER_AGENT } from '../src/lib/players/wikidata';

const ALVOS = 'data/transfermarkt-alvos.json';
const DADOS = 'src/lib/transfermarkt/dados.ts';

const arg = (name: string, fallback: number) => {
  const i = process.argv.indexOf(`--${name}`);
  const v = i > 0 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(v) ? v : fallback;
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);

function saveDados(players: TmPlayer[]) {
  const sorted = [...players].sort((a, b) => a.qid.localeCompare(b.qid, 'en', { numeric: true }));
  const body = sorted.map((p) => `  ${JSON.stringify(p)},`).join('\n');
  // Atômico: um commit no meio da gravação nunca pega o arquivo pela metade.
  writeFileSync(
    `${DADOS}.tmp`,
    `import type { TmPlayer } from './types';\n\n/**\n * Base do Transfermarkt, GERADA pelo scripts/tm-sync.ts (não editar à mão).\n * Cada linha: um jogador, ligado à nossa base pelo Q-id do Wikidata.\n */\nexport const TM_DADOS: TmPlayer[] = [\n${body}${body ? '\n' : ''}];\n`,
  );
  renameSync(`${DADOS}.tmp`, DADOS);
}

/** CSV simples (aspas duplas, vírgula, quebra de linha dentro de aspas). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell || row.length) rows.push([...row, cell]);
  return rows.filter((r) => r.some((c) => c));
}

async function alvos() {
  const minFama = arg('min-fama', 30);
  const max = arg('max', 5000);
  const query = `SELECT ?p ?tm ?sl ?pt ?en WHERE {
  ?p wdt:P106 wd:Q937857 ; wdt:P2446 ?tm ; wikibase:sitelinks ?sl .
  FILTER(?sl >= ${minFama})
  OPTIONAL { ?p rdfs:label ?pt FILTER(LANG(?pt) = "pt") }
  OPTIONAL { ?p rdfs:label ?en FILTER(LANG(?en) = "en") }
} ORDER BY DESC(?sl) LIMIT ${max}`;
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch('https://query.wikidata.org/sparql', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'text/csv', 'user-agent': USER_AGENT },
      body: new URLSearchParams({ query }).toString(),
    });
    const text = await res.text();
    // CSV (bem menor que o JSON, que vinha cortado): p,tm,sl,pt,en
    if (res.ok && text.startsWith('p,tm,sl')) {
      const rows = parseCsv(text).slice(1);
      const seen = new Set<string>();
      const out: TmTarget[] = [];
      for (const [p, tm, sl, pt, en] of rows) {
        const qid = (p ?? '').split('/').pop() ?? '';
        if (!/^Q\d+$/.test(qid) || seen.has(qid) || !/^\d+$/.test(tm ?? '')) continue;
        seen.add(qid);
        out.push({ qid, tmId: tm, name: pt || en || qid, sitelinks: Number(sl) });
      }
      if (out.length < rows.length * 0.5) throw new Error('lista do Wikidata incompleta');
      mkdirSync('data', { recursive: true });
      writeFileSync(ALVOS, JSON.stringify(out, null, 0).replace(/},{/g, '},\n{') + '\n');
      console.log(`${out.length} alvos (fama >= ${minFama}) em ${ALVOS}`);
      return;
    }
    console.log(`Wikidata limitou (${res.status}); tentativa ${attempt}/6, esperando 65 s...`);
    await sleep(65_000);
  }
  throw new Error('o Wikidata não respondeu; tente mais tarde');
}

async function rodar() {
  if (!existsSync(ALVOS)) throw new Error(`falta ${ALVOS}: rode "alvos" antes`);
  const targets = JSON.parse(readFileSync(ALVOS, 'utf8')) as TmTarget[];
  const limite = arg('limite', 100);
  const refazer = arg('refazer-dias', 30);
  const players = new Map(TM_DADOS.map((p) => [p.qid, p]));
  const old = (p: TmPlayer) => (Date.now() - Date.parse(p.at)) / 86_400_000 > refazer;
  const pending = targets.filter((t) => !players.has(t.qid) || old(players.get(t.qid)!)).slice(0, limite);
  const client = new TmClient({ intervalMs: arg('intervalo', 4000) });
  let ok = 0;
  let empty = 0;
  const partial: string[] = [];
  console.log(`${pending.length} para ler (de ${targets.length} alvos; ${players.size} já na base)`);
  try {
    for (const [i, t] of pending.entries()) {
      const { player, missing } = await readTmPlayer(client, t, today());
      if (player) {
        players.set(t.qid, player);
        ok++;
        if (missing.length) partial.push(`${t.name}: sem ${missing.join(', ')}`);
      } else {
        empty++;
        partial.push(`${t.name}: sem leitura (${missing.join(', ')})`);
      }
      if ((i + 1) % 10 === 0) {
        saveDados([...players.values()]);
        console.log(`${i + 1}/${pending.length} · ${ok} lidos · ${empty} sem leitura · ${client.requests} pedidos`);
      }
    }
  } catch (error) {
    saveDados([...players.values()]);
    if (error instanceof TmBlocked) {
      console.log(`PAROU: ${error.message}. ${ok} lidos foram salvos. Não insista agora; tente de novo mais tarde.`);
      process.exitCode = 2;
      return;
    }
    throw error;
  }
  saveDados([...players.values()]);
  console.log(`Fim: ${ok} lidos, ${empty} sem leitura, ${client.requests} pedidos. Base: ${players.size} jogadores.`);
  if (partial.length) console.log(`Faltou algo em ${partial.length}:\n${partial.slice(0, 30).join('\n')}`);
}

function status() {
  const targets = existsSync(ALVOS) ? (JSON.parse(readFileSync(ALVOS, 'utf8')) as TmTarget[]) : [];
  const withGoals = TM_DADOS.filter((p) => typeof p.stats.careerGoals === 'number').length;
  const withClubs = TM_DADOS.filter((p) => p.clubs.length).length;
  console.log(`Alvos: ${targets.length} · Na base: ${TM_DADOS.length} (com gols: ${withGoals}; com clubes: ${withClubs})`);
  const oldest = [...TM_DADOS].sort((a, b) => a.at.localeCompare(b.at))[0];
  if (oldest) console.log(`Leitura mais antiga: ${oldest.at} (${oldest.name})`);
}

const cmd = process.argv[2];
const run = cmd === 'alvos' ? alvos() : cmd === 'rodar' ? rodar() : cmd === 'status' ? Promise.resolve(status()) : null;
if (!run) {
  console.log('Uso: npx tsx scripts/tm-sync.ts alvos|rodar|status (veja o comentário no topo do arquivo)');
} else {
  run.catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
