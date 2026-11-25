import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import type { PlayerProfile } from '../src/lib/game/types';
import { nameKeys, queryKeys } from '../src/lib/players/keys';
import { nameMatchesQuery, rankCandidates } from '../src/lib/players/rank';
import type { PlayerRecord } from '../src/lib/players/types';
import {
  WikidataTimeout,
  buildRecords,
  importStep,
  isYouthOrReserve,
  mapPosition,
  newImportState,
  type Fetcher,
} from '../src/lib/players/wikidata';
import { MemoryStore } from '../src/lib/store/memory';

const rec = (over: Partial<PlayerRecord> & Pick<PlayerRecord, 'id' | 'name'>): PlayerRecord => ({
  aliases: [], positions: [], nationality: null, birthDate: null, heightCm: null, clubs: [], debutYear: null,
  sitelinks: 0, stats: {}, source: 'wikidata', ...over,
});

const VICTOR_GALO = rec({
  id: 'Q1', name: 'Victor', aliases: ['Victor Leandro Bagy'], positions: ['GOL'], nationality: 'Brasil',
  birthDate: '1983-01-21', clubs: ['Paulista', 'Grêmio', 'Clube Atlético Mineiro'], sitelinks: 25, stats: { careerGoals: 0 },
});
const OSIMHEN = rec({
  id: 'Q2', name: 'Victor Osimhen', positions: ['ATA'], nationality: 'Nigéria', birthDate: '1998-12-29',
  clubs: ['Wolfsburg', 'Lille', 'Napoli', 'Galatasaray'], sitelinks: 60, stats: { careerGoals: 150 },
});
const RONALDO = rec({
  id: 'Q3', name: 'Ronaldo', aliases: ['Ronaldo Luís Nazário de Lima'], positions: ['ATA'], nationality: 'Brasil',
  birthDate: '1976-09-18', clubs: ['Cruzeiro', 'PSV', 'Barcelona', 'Inter de Milão', 'Real Madrid', 'Milan', 'Corinthians'], sitelinks: 120,
});

const profile = (name: string, over: Partial<PlayerProfile> = {}): PlayerProfile => ({
  exists: true, name, positions: ['ATA'], nationality: 'Brasil', birthDate: '1990-01-01', clubs: ['Flamengo'],
  heightCm: 180, careerGoals: 100, careerAssists: null, peakValueEurM: null, intlCaps: null, intlGoals: null,
  worldCupGoals: null, uclGoals: null, titles: null, careerApps: null, brasileiraoGoals: null, libertadoresGoals: null,
  worldCupsPlayed: null, debutYear: 2008, ...over,
});

async function base(...records: PlayerRecord[]) {
  const store = new MemoryStore();
  await store.upsertPlayers(records);
  return store;
}

test('chaves de busca: nome completo, sobrenome, primeiro + último; partículas fora', () => {
  const keys = nameKeys(['Rogério Ceni', 'Rogério Mücke Ceni']);
  for (const k of ['rogerio ceni', 'ceni', 'rogerio', 'rogerio mucke ceni']) assert.ok(keys.includes(k), k);
  assert.ok(nameKeys(['Daniel Alves da Silva']).includes('daniel silva'));
  assert.ok(!nameKeys(['Daniel Alves da Silva']).includes('da'));
  assert.deepEqual(queryKeys('Ronaldo de Assis'), ['ronaldo de assis', 'ronaldo assis']);
});

test('homônimos: o contexto da rodada escolhe; sem contexto, o nome exato e depois o mais famoso', () => {
  const galo = rankCandidates([OSIMHEN, VICTOR_GALO], 'Victor', { position: 'GOL', kind: 'club', teamId: 'atletico-mg' });
  assert.equal(galo[0].record.id, 'Q1');
  assert.equal(galo[0].fits, true);
  assert.equal(galo.length, 1, '"Victor" é só o primeiro nome do Osimhen: não vale para ele');
  assert.equal(rankCandidates([OSIMHEN, VICTOR_GALO], 'Victor')[0].record.id, 'Q1', 'sem contexto: o nome exato vence');
  const xavi = rec({ id: 'Q7', name: 'Xavi', sitelinks: 90 });
  const xaviB = rec({ id: 'Q8', name: 'Xavi', sitelinks: 5 });
  assert.equal(rankCandidates([xaviB, xavi], 'xavi')[0].record.id, 'Q7', 'nomes iguais: o mais famoso');
  assert.equal(rankCandidates([OSIMHEN, VICTOR_GALO], 'Osimhen', { position: 'ATA', kind: 'club', teamId: 'napoli' })[0].record.id, 'Q2');
  const ronaldos = [RONALDO, rec({ id: 'Q4', name: 'Cristiano Ronaldo', aliases: ['Cristiano Ronaldo dos Santos Aveiro'], sitelinks: 200 })];
  assert.equal(rankCandidates(ronaldos, 'Ronaldo')[0].record.id, 'Q3', '"Ronaldo" exato vence o sobrenome do Cristiano');
});

test('regra de nomes: nome conhecido, completo ou partes coerentes; nada de erro nem apelido', () => {
  // Valem
  assert.ok(nameMatchesQuery('Ronaldinho', ['Ronaldinho', 'Ronaldo de Assis Moreira']), 'nome famoso');
  assert.ok(nameMatchesQuery('Hulk', ['Hulk', 'Givanildo Vieira de Sousa']), 'nome famoso');
  assert.ok(nameMatchesQuery('Sule', ['Niklas Süle']), 'sobrenome, sem acento');
  assert.ok(nameMatchesQuery('niklas süle', ['Niklas Süle']), 'nome + sobrenome');
  assert.ok(nameMatchesQuery('Ronaldo Nazario', ['Ronaldo', 'Ronaldo Luís Nazário de Lima']), 'partes do nome completo');
  assert.ok(nameMatchesQuery('Vinicius Junior', ['Vinícius Júnior']));
  assert.ok(nameMatchesQuery('Vinicius', ['Vinícius Júnior']), '"Júnior" não conta como nome');
  assert.ok(nameMatchesQuery('Victor', ['Victor', 'Victor Leandro Bagy']));
  // Não valem
  assert.ok(!nameMatchesQuery('Ronaldiho', ['Ronaldinho', 'Ronaldo de Assis Moreira']), 'erro de digitação');
  assert.ok(!nameMatchesQuery('Osimen', ['Victor Osimhen']), 'erro de digitação');
  assert.ok(!nameMatchesQuery('Fenômeno', ['Ronaldo', 'Ronaldo Luís Nazário de Lima']), 'apelido informal');
  assert.ok(!nameMatchesQuery('R9', ['Ronaldo', 'Ronaldo Luís Nazário de Lima']), 'apelido informal');
  assert.ok(!nameMatchesQuery('Niklas', ['Niklas Süle']), 'só o primeiro nome de quem é conhecido por nome e sobrenome');
  assert.ok(!nameMatchesQuery('Sule Niklas', ['Niklas Süle']), 'fora de ordem');
  assert.ok(!nameMatchesQuery('Victor', ['Vinícius Júnior']), 'digitei X e veio Y: recusa');
  assert.ok(!nameMatchesQuery('Dida', ['Taffarel']));
});

test('busca na base: nome conhecido, completo e sobrenome valem; erro e apelido não', async () => {
  const store = await base(VICTOR_GALO, OSIMHEN, RONALDO);
  let calls = 0;
  const lookup = createLookup(store, async () => (calls++, null));
  assert.equal((await lookup('Victor', { position: 'GOL', kind: 'club', teamId: 'atletico-mg' }))?.name, 'Victor');
  assert.equal((await lookup('osimhen'))?.name, 'Victor Osimhen');
  assert.equal((await lookup('Victor Osimhen'))?.name, 'Victor Osimhen');
  assert.equal((await lookup('Ronaldo Nazário'))?.name, 'Ronaldo');
  assert.equal((await lookup('Bagy'))?.name, 'Victor');
  assert.equal(calls, 0, 'tudo isso veio da base, sem IA');
  assert.equal(await lookup('R9'), null);
  assert.equal(await lookup('Fenômeno'), null);
  assert.equal(await lookup('Osimen'), null);
  assert.equal(calls, 3, 'o que não vale vai para a IA, que também recusa');
});

test('quem não está na base: a IA pesquisa, entra na base e a próxima busca não chama a IA', async () => {
  const store = await base(VICTOR_GALO);
  const asked: Array<string | undefined> = [];
  const lookup = createLookup(store, async (q, hint) => {
    asked.push(hint);
    return q.toLowerCase().includes('pedro') ? profile('Pedro', { fullName: 'Pedro Guilherme Abreu dos Santos', clubs: ['Fluminense', 'Flamengo'] }) : null;
  });
  const ctx = { position: 'ATA' as const, kind: 'club' as const, teamId: 'flamengo' };
  assert.equal((await lookup('Pedro', ctx))?.name, 'Pedro');
  assert.deepEqual(asked, ['atacante'], 'a IA só recebe a posição, nunca o clube da rodada');
  assert.equal((await lookup('Pedro Guilherme', ctx))?.name, 'Pedro');
  assert.equal(asked.length, 1, 'segunda vez veio da base');
  assert.equal(await store.countPlayers(), 2);
  assert.deepEqual(store.lookups.map((l) => l.outcome), ['ia', 'base']);
});

test('IA devolve outro jogador: recusa ("digitei X, veio Y") e guarda o "não achei" por pouco tempo', async () => {
  const store = await base();
  let calls = 0;
  const lookup = createLookup(store, async () => (calls++, profile('Vinícius Júnior')));
  assert.equal(await lookup('Vitinho'), null);
  assert.equal(await lookup('Vitinho'), null);
  assert.equal(calls, 1, 'a segunda tentativa não gasta IA (não achei recente)');
  assert.equal(await store.countPlayers(), 0, 'nada errado entra na base');
});

test('na base mas fora do contexto: a IA tenta; se não achar, devolve o da base para o jogo explicar', async () => {
  const store = await base(OSIMHEN);
  const lookup = createLookup(store, async () => null);
  const p = await lookup('Osimhen', { position: 'GOL', kind: 'club', teamId: 'atletico-mg' });
  assert.equal(p?.name, 'Victor Osimhen');
  assert.equal(store.lookups.at(-1)?.outcome, 'base-fora-do-contexto');
});

test('número do tema que falta: pergunta focada uma vez só e fica gravado', async () => {
  const store = await base(VICTOR_GALO);
  const asked: string[] = [];
  const lookup = createLookup(store, async () => null, async (p, stat) => (asked.push(`${p.name}:${stat}`), 7));
  const ctx = { position: 'GOL' as const, kind: 'club' as const, teamId: 'atletico-mg', metric: 'titles' as const };
  assert.equal((await lookup('Victor', ctx))?.titles, 7);
  assert.equal((await lookup('Victor', ctx))?.titles, 7);
  assert.deepEqual(asked, ['Victor:titles']);
  assert.equal((await lookup('Victor', { ...ctx, metric: 'careerGoals' }))?.careerGoals, 0, 'já tinha: não pergunta');
  assert.equal(asked.length, 1);
});

// ---------- Wikidata ----------

const uri = (id: string) => ({ type: 'uri', value: `http://www.wikidata.org/entity/${id}` });
const lit = (v: string | number) => ({ type: 'literal', value: String(v) });

test('Wikidata: posições, altura, apelidos, clubes sem base, seleção e estreia', () => {
  assert.equal(mapPosition('goalkeeper'), 'GOL');
  assert.equal(mapPosition('centre-back'), 'DEF');
  assert.equal(mapPosition('defensive midfielder'), 'MEI');
  assert.equal(mapPosition('winger'), 'ATA');
  for (const youth of ['Brazil national under-20 football team', 'Seleção Brasileira de Futebol Sub-20', 'FC Barcelona Atlètic', 'Real Madrid Castilla', 'Bayern Munich II', 'Brazil Olympic football team']) {
    assert.ok(isYouthOrReserve(youth), youth);
  }
  for (const senior of ['Clube Atlético Mineiro', 'Athletic Bilbao', 'Sport Club Corinthians Paulista']) assert.ok(!isYouthOrReserve(senior), senior);

  const records = buildRecords(
    [{ id: 'Q1', sitelinks: 25, birth: '1983-01-21T00:00:00Z' }],
    [
      { p: uri('Q1'), pt: lit('Victor'), en: lit('Victor Leandro Bagy'), height: lit('1.93'), pos: lit('goalkeeper'), citizen: lit('Brasil') },
    ],
    [{ p: uri('Q1'), es: lit('Victor'), full: lit('Victor Leandro Bagy') }],
    [
      { p: uri('Q1'), team: uri('T1'), pt: lit('Paulista Futebol Clube'), start: lit('2003-01-01T00:00:00Z'), apps: lit(100), goals: lit(0), nat: lit('false') },
      { p: uri('Q1'), team: uri('T2'), pt: lit('Grêmio'), start: lit('2008-01-01T00:00:00Z'), apps: lit(150), goals: lit(0), nat: lit('false') },
      { p: uri('Q1'), team: uri('T3'), pt: lit('Clube Atlético Mineiro'), start: lit('2012-01-01T00:00:00Z'), apps: lit(400), goals: lit(1), nat: lit('false') },
      { p: uri('Q1'), team: uri('T4'), pt: lit('Seleção Brasileira de Futebol'), en: lit('Brazil national football team'), apps: lit(7), goals: lit(0), nat: lit('true') },
      { p: uri('Q1'), team: uri('T5'), en: lit('Brazil national under-20 football team'), apps: lit(10), goals: lit(0), nat: lit('true') },
    ],
  );
  assert.equal(records.length, 1);
  const r = records[0];
  assert.equal(r.name, 'Victor');
  assert.deepEqual(r.aliases, ['Victor Leandro Bagy'], 'nome conhecido + completo; apelidos não entram');
  assert.deepEqual(r.positions, ['GOL']);
  assert.equal(r.heightCm, 193);
  assert.equal(r.birthDate, '1983-01-21');
  assert.equal(r.nationality, 'Brasil', 'sem P1532: usa a cidadania');
  assert.deepEqual(r.clubs, ['Paulista Futebol Clube', 'Grêmio', 'Clube Atlético Mineiro']);
  assert.equal(r.debutYear, 2003);
  assert.deepEqual(r.stats, { intlCaps: 7, intlGoals: 0 }, 'seleção de base não conta');
  assert.deepEqual(r.anchors, { clubApps: 650, clubGoals: 1 });
  // E o jogo reconhece o clube na ficha importada.
  assert.equal(rankCandidates(records, 'victor', { position: 'GOL', kind: 'club', teamId: 'atletico-mg' })[0].fits, true);
});

function fakeWdqs(handler: (query: string) => object | 'timeout'): Fetcher {
  return async (_url, init) => {
    const query = new URLSearchParams(String(init.body)).get('query') ?? '';
    assert.match(String((init.headers as Record<string, string>)['user-agent']), /DueloDeCraquesBot/);
    const out = handler(query);
    if (out === 'timeout') return new Response('java.util.concurrent.TimeoutException', { status: 500 });
    return new Response(JSON.stringify({ results: { bindings: out } }), { status: 200 });
  };
}

test('Wikidata: um passo da carga grava jogadores e avança a janela; estouro de tempo divide a janela', async () => {
  const store = new MemoryStore();
  const fetcher = fakeWdqs((q) => {
    if (q.includes('GROUP BY ?p')) return [{ p: uri('Q9'), links: lit(40), born: lit('1990-05-01T00:00:00Z') }];
    if (q.includes('P1477')) return [];
    if (q.includes('P54')) return [{ p: uri('Q9'), team: uri('T9'), pt: lit('Clube de Regatas do Flamengo'), start: lit('2010-01-01T00:00:00Z'), nat: lit('false') }];
    return [{ p: uri('Q9'), pt: lit('Fulano'), pos: lit('forward'), country: lit('Brasil') }];
  });
  const s0 = newImportState({ untilYear: 1991, plan: [{ label: 'teste', minSitelinks: 3, fromYear: 1990 }] });
  const s1 = await importStep(s0, (r) => store.upsertPlayers(r), fetcher);
  assert.equal(s1.imported, 1);
  assert.equal(s1.cursor, '1991-01-01');
  assert.equal(s1.spanDays, 730, 'janela com pouca gente cresce');
  assert.equal(s1.offset, 0);
  assert.equal(await store.countPlayers(), 1);
  const found = await createLookup(store, async () => null)('Fulano', { position: 'ATA', kind: 'club', teamId: 'flamengo' });
  assert.equal(found?.name, 'Fulano');

  const slow = await importStep(s0, async () => undefined, fakeWdqs(() => 'timeout'));
  assert.equal(slow.spanDays, 183);
  assert.equal(slow.cursor, s0.cursor, 'tenta de novo a mesma data, com janela menor');
  assert.match(slow.lastError ?? '', /60 s/);
  assert.ok(new WikidataTimeout('x') instanceof Error);

  const end = await importStep({ ...s0, cursor: '2011-01-01', untilYear: 2010 }, async () => undefined, fetcher);
  assert.equal(end.done, true, 'última parte do plano terminou');

  // Plano com duas partes: ao terminar a primeira, passa para a segunda (clubes do Brasil).
  const two = newImportState({ untilYear: 1990, plan: [{ label: 'mundo', minSitelinks: 3, fromYear: 1990 }, { label: 'Brasil', clubCountry: 'Q155', minSitelinks: 1, fromYear: 1985 }] });
  const queries: string[] = [];
  const spy = fakeWdqs((q) => (queries.push(q), q.includes('GROUP BY ?p') ? [] : []));
  const afterFirst = await importStep(two, async () => undefined, spy);
  assert.equal(afterFirst.part, 1);
  assert.equal(afterFirst.cursor, '1985-01-01');
  await importStep(afterFirst, async () => undefined, spy);
  assert.match(queries.at(-1)!, /\?team wdt:P17 wd:Q155/, 'segunda parte filtra por clubes do Brasil');
});

test('na partida: Escalação, goleiro, Atlético-MG → "Victor" vale (e não o Osimhen)', async () => {
  const { handleMessage } = await import('../src/lib/game/engine');
  const { asText } = await import('./helpers');
  const store = await base(OSIMHEN, VICTOR_GALO);
  const lookup = createLookup(store, async () => null);
  let id = 0;
  const deps = { store, lookup, rng: () => 0, now: () => new Date('2026-11-17T12:00:00Z') };
  const say = (who: string, text: string) =>
    handleMessage({ id: `m${++id}`, groupJid: 'esc@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  await say('Ana', 'ativar jogos');
  await say('Ana', 'abrir sala 1');
  await say('Bia', 'entrar');
  await say('Ana', 'começar');
  const m = (await store.getActiveMatch('esc@g.us'))!;
  (m.state as { restrictions: Array<{ kind: string; teamId: string }> }).restrictions[0] = { kind: 'club', teamId: 'atletico-mg' };
  await store.saveMatch(m);
  assert.equal(asText(await say('Ana', 'Victor')), '[react:✅]');
  const after = (await store.getActiveMatch('esc@g.us'))!.state as { picks: Record<string, Array<{ name: string } | null>> };
  assert.equal(after.picks['Ana@s'][0]?.name, 'Victor');
});

test('Wikidata: cota estourada (429) no meio dos detalhes não quebra: guarda o erro e o tempo de espera', async () => {
  const { WikidataRateLimit } = await import('../src/lib/players/wikidata');
  let saved = 0;
  const fetcher: Fetcher = async (_url, init) => {
    const query = new URLSearchParams(String(init.body)).get('query') ?? '';
    if (query.includes('GROUP BY ?p')) {
      return new Response(JSON.stringify({ results: { bindings: [{ p: uri('Q9'), links: lit(40), born: lit('1990-05-01T00:00:00Z') }] } }));
    }
    return new Response('Too Many Requests', { status: 429, headers: { 'retry-after': '90' } });
  };
  const s0 = newImportState({ untilYear: 1991, plan: [{ label: 'teste', minSitelinks: 3, fromYear: 1990 }] });
  const s1 = await importStep(s0, async () => void saved++, fetcher);
  assert.equal(saved, 0);
  assert.equal(s1.cursor, s0.cursor, 'não avança: refaz depois');
  assert.equal(s1.offset, 0);
  assert.equal(s1.retryAfter, 90);
  assert.match(s1.lastError ?? '', /429/);
  assert.ok(new WikidataRateLimit(5) instanceof Error);
});

test('Wikidata: sem tempo para a próxima consulta, o passo devolve o estado sem avançar (e sem erro)', async () => {
  let calls = 0;
  const fetcher: Fetcher = async () => (calls++, new Response(JSON.stringify({ results: { bindings: [] } })));
  const s0 = newImportState({ untilYear: 1991, plan: [{ label: 'teste', minSitelinks: 3, fromYear: 1990 }] });
  const out = await importStep(s0, async () => undefined, fetcher, Date.now() + 1_000);
  assert.equal(calls, 0, 'nem começa a consulta');
  assert.equal(out.yielded, true);
  assert.equal(out.cursor, s0.cursor);
  assert.equal(out.lastError, undefined);
});

test('Wikidata: consulta lenta adapta (janela menor ou lote menor) em vez de errar', async () => {
  const slow = (match: string): Fetcher => async (_url, init) => {
    const query = new URLSearchParams(String(init.body)).get('query') ?? '';
    if (query.includes(match)) {
      const e = new Error('The operation was aborted due to timeout');
      e.name = 'TimeoutError';
      throw e;
    }
    const bindings = query.includes('GROUP BY ?p') ? [{ p: uri('Q9'), links: lit(40), born: lit('1990-05-01T00:00:00Z') }] : [];
    return new Response(JSON.stringify({ results: { bindings } }));
  };
  const s0 = newImportState({ untilYear: 1995, plan: [{ label: 'teste', minSitelinks: 3, fromYear: 1990 }] });
  const listSlow = await importStep(s0, async () => undefined, slow('GROUP BY ?p'));
  assert.equal(listSlow.spanDays, 183);
  assert.equal(listSlow.lastError, undefined, 'adaptação não conta como erro');
  assert.match(listSlow.note ?? '', /janela menor/);
  const detailSlow = await importStep(s0, async () => undefined, slow('P54'));
  assert.equal(detailSlow.pageSize, 100);
  assert.equal(detailSlow.cursor, s0.cursor);
  const ok = await importStep({ ...s0, pageSize: 50 }, async () => undefined, slow('NADA'));
  assert.equal(ok.pageSize, 100, 'deu certo: o lote volta a crescer');
});
