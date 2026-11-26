import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { formatCard, parseMultiCorrection } from '../src/lib/players/admin';
import type { PlayerRecord } from '../src/lib/players/types';
import { MemoryStore } from '../src/lib/store/memory';
import { TmBlocked, TmClient, parseRobots, robotsAllows } from '../src/lib/transfermarkt/client';
import { setTmData } from '../src/lib/transfermarkt';
import { parseCareerTotals, parseMarketValue, parseTransferClubs } from '../src/lib/transfermarkt/parse';
import { readTmPlayer } from '../src/lib/transfermarkt/sync';
import { getMode } from '../src/lib/game/modes';
import { checkPick } from '../src/lib/game/validate';

/**
 * Módulo do Transfermarkt (rodada 17). As páginas abaixo são SINTÉTICAS, no
 * formato conhecido do site (tabela com ícones com title e total no rodapé;
 * JSON do histórico de transferências e do valor de mercado). Quando a rede do
 * ambiente liberar o site, trocar por páginas reais como fixtures.
 */

const PERF = `<table class="items"><thead><tr>
<th>Season</th><th></th><th>Competition</th><th>Club</th>
<th><span title="Appearances">A</span></th><th><span title="Goals">G</span></th><th><span title="Assists">As</span></th>
<th><span title="Own goals">OG</span></th><th><span title="Yellow cards">Y</span></th><th><span title="Second yellow cards">YR</span></th>
<th><span title="Red cards">R</span></th><th><span title="Penalty goals">P</span></th><th><span title="Minutes per goal">MPG</span></th><th><span title="Minutes played">Min</span></th>
</tr></thead><tbody><tr><td>25/26</td><td></td><td>LaLiga</td><td>Barcelona</td><td>30</td><td>20</td><td>10</td><td>-</td><td>2</td><td>-</td><td>-</td><td>3</td><td>120'</td><td>2.400'</td></tr></tbody>
<tfoot><tr><td colspan="4">Total :</td><td>1.076</td><td>848</td><td>378</td><td>1</td><td>98</td><td>-</td><td>3</td><td>110</td><td>104'</td><td>88.564'</td></tr></tfoot></table>`;

const TRANSFERS = {
  transfers: [
    { from: { clubName: 'Barcelona B' }, to: { clubName: 'Barcelona' }, dateUnformatted: '2004-07-01', upcoming: false },
    { from: { clubName: 'Barcelona' }, to: { clubName: 'Paris SG' }, dateUnformatted: '2021-08-10', upcoming: false },
    { from: { clubName: 'Paris SG' }, to: { clubName: 'Inter Miami' }, dateUnformatted: '2023-07-15', upcoming: false },
    { from: { clubName: 'Inter Miami' }, to: { clubName: 'Retired' }, dateUnformatted: '2099-01-01', upcoming: true },
  ],
};
const MARKET = { list: [{ y: 80_000_000 }, { y: 180_000_000 }, { y: 18_000_000 }] };

test('Transfermarkt: robots.txt é respeitado (regra mais longa vence)', () => {
  const rules = parseRobots('User-agent: *\nDisallow: /ceapi/\nAllow: /ceapi/transferHistory/\nDisallow: /intern/\n\nUser-agent: OutroBot\nDisallow: /\n');
  assert.equal(robotsAllows(rules, '/-/leistungsdatendetails/spieler/28003'), true);
  assert.equal(robotsAllows(rules, '/ceapi/marketValueDevelopment/graph/28003'), false);
  assert.equal(robotsAllows(rules, '/ceapi/transferHistory/list/28003'), true);
  assert.equal(robotsAllows(rules, '/intern/x'), false);
});

test('Transfermarkt: um pedido por vez com intervalo, 429 espera e 403 para tudo', async () => {
  let clock = 0;
  const waits: number[] = [];
  const asked: string[] = [];
  let mode: 'ok' | '429' | '403' = 'ok';
  let limited = 0;
  const client = new TmClient({
    intervalMs: 500, // vira 2 s: o mínimo do código
    now: () => clock,
    sleep: async (ms) => void (waits.push(ms), (clock += ms)),
    fetcher: async (url) => {
      asked.push(url);
      if (url.endsWith('/robots.txt')) return new Response('User-agent: *\nDisallow: /intern/\n');
      if (mode === '403') return new Response('', { status: 403 });
      if (mode === '429' && limited++ < 1) return new Response('', { status: 429, headers: { 'retry-after': '5' } });
      return new Response('<html>ok</html>');
    },
  });
  assert.equal(await client.get('/a'), '<html>ok</html>');
  assert.equal(await client.get('/b'), '<html>ok</html>');
  assert.ok(waits.filter((w) => w >= 2000).length >= 2, `esperou entre pedidos: ${waits}`);
  mode = '429';
  assert.equal(await client.get('/c'), '<html>ok</html>');
  assert.ok(waits.includes(5000), 'respeitou o retry-after');
  mode = '403';
  await assert.rejects(client.get('/d'), TmBlocked);
  await assert.rejects(client.get('/intern/x'), /robots/);
  assert.ok(!asked.some((u) => u.includes('/intern/')), 'caminho proibido não é pedido');
});

test('Transfermarkt: leitura dos totais, dos clubes e do valor de mercado', () => {
  assert.deepEqual(parseCareerTotals(PERF), { apps: 1076, goals: 848, assists: 378, yellow: 98, secondYellow: 0, red: 3, minutes: 88564 });
  assert.equal(parseCareerTotals('<html>sem tabela</html>'), null);
  assert.deepEqual(parseTransferClubs(TRANSFERS), ['Barcelona', 'Paris SG', 'Inter Miami'], 'sem time B e sem transferência futura');
  assert.equal(parseTransferClubs({}), null);
  assert.deepEqual(parseMarketValue(MARKET), { current: 18, peak: 180 });
  assert.equal(parseMarketValue({ list: [] }), null);
});

test('Transfermarkt: leitura de um jogador (3 pedidos) e o que falta fica de fora', async () => {
  const client = new TmClient({
    sleep: async () => undefined,
    fetcher: async (url) => {
      if (url.endsWith('/robots.txt')) return new Response('User-agent: *\nDisallow: /ceapi/marketValueDevelopment/\n');
      if (url.includes('leistungsdatendetails')) return new Response(PERF);
      if (url.includes('transferHistory')) return new Response(JSON.stringify(TRANSFERS));
      return new Response('', { status: 404 });
    },
  });
  const { player, missing } = await readTmPlayer(client, { qid: 'Q615', tmId: '28003', name: 'Lionel Messi' }, '2026-11-26');
  assert.deepEqual(player!.stats, { careerApps: 1076, careerGoals: 848, careerAssists: 378, careerCards: 101 });
  assert.deepEqual(player!.clubs, ['Barcelona', 'Paris SG', 'Inter Miami']);
  assert.deepEqual(missing, ['valor de mercado (robots.txt)']);
});

const rec = (over: Partial<PlayerRecord>): PlayerRecord => ({
  id: 'Q615', name: 'Lionel Messi', aliases: [], positions: ['ATA'], nationality: 'Argentina', birthDate: '1987-06-24', heightCm: 170,
  clubs: ['Futbol Club Barcelona', 'Paris Saint-Germain Football Club'], debutYear: 2004, sitelinks: 200, stats: { careerGoals: 700 }, source: 'wikidata', ...over,
});

test('Transfermarkt na partida: vale mais que Wikidata e IA; o admin vale mais que ele; clubes contam', async () => {
  setTmData([{ qid: 'Q615', tmId: '28003', name: 'Lionel Messi', at: '2026-11-26', clubs: ['Barcelona', 'Paris SG', 'Inter Miami'], stats: { careerGoals: 848, careerApps: 1076 } }]);
  try {
    const store = new MemoryStore();
    await store.upsertPlayers([rec({})]);
    let askedAi = 0;
    const lookup = createLookup(store, async () => null, async () => (askedAi++, 1));
    const p = (await lookup('Messi', { position: 'ATA', kind: 'club', teamId: 'barcelona', metric: 'careerGoals' }))!;
    assert.equal(p.careerGoals, 848, 'Transfermarkt > Wikidata/IA');
    assert.equal(askedAi, 0, 'não pergunta à IA');
    assert.equal(p.careerApps, 1076);
    // Inter Miami só existe no Transfermarkt: a rodada de clube aceita (sem duplicar Barcelona/PSG na lista).
    const miami = (await lookup('Messi', { position: 'ATA', kind: 'club', teamId: 'inter-miami' }))!;
    assert.equal(checkPick(miami, 'ATA', { kind: 'club', teamId: 'inter-miami' }, getMode('artilheiros')!, new Date()).ok, true);
    assert.equal(p.clubs.filter((c) => /barcelona/i.test(c)).length, 1);
    // Correção do admin continua acima de tudo.
    await store.setManualStat('Q615', 'careerGoals', { value: 850, source: 'admin', at: '2026-11-26' });
    assert.equal((await lookup('Messi', { position: 'ATA', metric: 'careerGoals' }))!.careerGoals, 850);
    assert.match(formatCard((await store.getPlayer('Q615'))!), /Transfermarkt, lidos em 26\/11\/2026/);
  } finally {
    setTmData([]);
  }
});

test('Números estáveis: regravar a ficha (carga, outra fonte) não troca número já gravado', async () => {
  const store = new MemoryStore();
  await store.upsertPlayers([rec({ stats: { intlCaps: 190, careerGoals: null } })]);
  await store.upsertPlayers([rec({ stats: { intlCaps: 120, careerGoals: 700 } })]);
  const r = (await store.getPlayer('Q615'))!;
  assert.equal(r.stats.intlCaps, 190, 'o número já gravado fica');
  assert.equal(r.stats.careerGoals, 700, 'o que faltava (null) é preenchido');
});

test('Comando tm: vários números de uma vez, conferidos pelo admin', () => {
  const cmd = parseMultiCorrection('tm Neymar: gols 439, jogos 717, assistências 252, valor atual 60,5; cartões 120\nfoo 3')!;
  assert.equal(cmd.player, 'Neymar');
  assert.deepEqual(cmd.entries.map((e) => [e.stat, e.value]), [['careerGoals', 439], ['careerApps', 717], ['careerAssists', 252], ['marketValueEurM', 60.5], ['careerCards', 120]]);
  assert.deepEqual(cmd.unknown, ['foo 3']);
  assert.equal(parseMultiCorrection('corrigir neymar gols 10'), null);
});

test('Transfermarkt: robots.txt real (26/11/2026) — o nosso robô lê os dados detalhados; /ceapi fechado; agentes de IA bloqueados', async () => {
  const { readFileSync } = await import('node:fs');
  const text = readFileSync('tests/fixtures/transfermarkt-robots-2026-11-26.txt', 'utf8');
  const ours = parseRobots(text);
  assert.equal(robotsAllows(ours, '/-/leistungsdatendetails/spieler/28003'), true);
  assert.equal(robotsAllows(ours, '/ceapi/transferHistory/list/28003'), false);
  assert.equal(robotsAllows(ours, '/ceapi/marketValueDevelopment/graph/28003'), false);
  assert.equal(robotsAllows(ours, '/schnellsuche/ergebnis/schnellsuche'), false);
  for (const ai of ['claudebot', 'anthropic-ai', 'claude-searchbot', 'chatgpt-user', 'operator']) {
    assert.equal(robotsAllows(parseRobots(text, ai), '/-/leistungsdatendetails/spieler/28003'), false, ai);
  }
});

test('Transfermarkt: títulos das colunas em português (transfermarkt.com.br)', () => {
  const html = PERF.replace('title="Appearances"', 'title="Jogos"').replace('title="Goals"', 'title="Gols"').replace('title="Assists"', 'title="Assistências"')
    .replace('title="Own goals"', 'title="Gols contra"').replace('title="Yellow cards"', 'title="Cartões amarelos"').replace('title="Second yellow cards"', 'title="Cartão amarelo-vermelho"')
    .replace('title="Red cards"', 'title="Cartões vermelhos"').replace('title="Penalty goals"', 'title="Gols de pênalti"').replace('title="Minutes per goal"', 'title="Minutos por gol"').replace('title="Minutes played"', 'title="Minutos jogados"');
  assert.deepEqual(parseCareerTotals(html), { apps: 1076, goals: 848, assists: 378, yellow: 98, secondYellow: 0, red: 3, minutes: 88564 });
});
