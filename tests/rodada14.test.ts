import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage } from '../src/lib/game/engine';
import { getMode } from '../src/lib/game/modes';
import { getTeam } from '../src/lib/game/teams';
import type { MatchState, Outgoing, PlayerProfile } from '../src/lib/game/types';
import { checkPick, clubVerdict } from '../src/lib/game/validate';
import { formatCard, parseClubCorrection } from '../src/lib/players/admin';
import { toProfile } from '../src/lib/players/lookup';
import { buildCareer, parseInfoboxClubs, wikidataCareer, type Career, type Entity, type PlayerSources } from '../src/lib/players/sources';
import type { PlayerRecord } from '../src/lib/players/types';
import { DEFAULT_PLAN, LATE_PARTS, buildRecords, extendPlan, importStep, isNationalTeamLabel, newImportState, teamsQuery } from '../src/lib/players/wikidata';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

/**
 * Dados reais (25/11/2026): entidades do Wikidata (Fábio Q677923 e Domingos da
 * Guia Q717927, só passagens, ocupação e nascimento) e as caixas de informação
 * da Wikipédia (pt e en, CC BY-SA). O Wikidata não tem o Fluminense do Fábio;
 * a Wikipédia tem.
 */
const FX = JSON.parse(readFileSync('tests/fixtures/rodada14-fontes.json', 'utf8')) as {
  entities: Record<string, Entity>;
  wiki: { fabio_pt: string; fabio_en: string; domingos_pt: string };
};

/** Rótulos pt/en dos times das duas fichas (como o Wikidata devolve). */
const LABELS = new Map<string, { pt?: string; en?: string }>([
  ['Q9195913', { pt: 'União Bandeirante Futebol Clube', en: 'União Bandeirante Futebol Clube' }],
  ['Q506832', { pt: 'Club Athletico Paranaense', en: 'Club Athletico Paranaense' }],
  ['Q188277', { pt: 'Cruzeiro Esporte Clube', en: 'Cruzeiro Esporte Clube' }],
  ['Q5014111', { pt: 'Club de Regatas Vasco da Gama', en: 'CR Vasco da Gama' }],
  ['Q83459', { pt: 'Seleção Brasileira de Futebol', en: 'Brazil national football team' }],
  ['Q170703', { pt: 'Club Atlético Boca Juniors', en: 'Boca Juniors' }],
  ['Q499616', { pt: 'Club Nacional de Football', en: 'Club Nacional de Football' }],
  ['Q17479', { pt: 'Clube de Regatas do Flamengo', en: 'CR Flamengo' }],
  ['Q35933', { pt: 'Sport Club Corinthians Paulista', en: 'Sport Club Corinthians Paulista' }],
  ['Q788363', { pt: 'Bangu Atlético Clube', en: 'Bangu Atlético Clube' }],
]);

/** Fetcher falso: página da entidade, rótulos (wbgetentities), busca e Wikipédia. */
function fakeWeb(calls: string[] = []) {
  return async (url: string): Promise<Response> => {
    calls.push(url);
    const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
    const entity = url.match(/Special:EntityData\/(Q\d+)\.json/);
    if (entity) return FX.entities[entity[1]] ? json({ entities: { [entity[1]]: FX.entities[entity[1]] } }) : new Response('', { status: 404 });
    if (url.includes('action=wbgetentities')) {
      const ids = decodeURIComponent(url.match(/ids=([^&]+)/)![1]).split('|');
      return json({ entities: Object.fromEntries(ids.map((id) => [id, { labels: { pt: { value: LABELS.get(id)?.pt }, en: { value: LABELS.get(id)?.en } } }])) });
    }
    if (url.includes('action=wbsearchentities')) {
      const q = decodeURIComponent(url.match(/search=([^&]+)/)![1]);
      return json({ search: /domingos/i.test(q) ? [{ id: 'Q717927', description: 'futebolista brasileiro' }] : [] });
    }
    if (url.includes('pt.wikipedia.org') && url.includes('Maciel')) return new Response(FX.wiki.fabio_pt);
    if (url.includes('en.wikipedia.org') && url.includes('born_1980')) return new Response(FX.wiki.fabio_en);
    if (url.includes('pt.wikipedia.org') && url.includes('Domingos_da_Guia')) return new Response(FX.wiki.domingos_pt);
    return new Response('', { status: 404 });
  };
}

function realSources(calls: string[] = []): PlayerSources {
  const web = fakeWeb(calls);
  return {
    career: (id) => wikidataCareer(id, web),
    wikipediaClubs: async (wiki) => {
      const { wikipediaClubs } = await import('../src/lib/players/sources');
      return wikipediaClubs(wiki, web);
    },
    findId: async (name, year) => {
      const { findWikidataId } = await import('../src/lib/players/sources');
      return findWikidataId(name, year, web);
    },
  };
}

const record = (id: string, name: string, clubs: string[], extra: Partial<PlayerRecord> = {}): PlayerRecord => ({
  id, name, aliases: [], positions: ['GOL'], nationality: 'Brasil', birthDate: '1980-09-30', heightCm: 188, clubs,
  debutYear: 1997, sitelinks: 20, stats: {}, source: 'wikidata', ...extra,
});

test('Rodada 14: seleção não é clube (classe nova do Wikidata e rótulo)', () => {
  for (const l of ['Seleção Brasileira de Futebol', 'Argentina national football team', 'Selección de fútbol de Uruguay', 'Brazil national under-20 football team']) {
    assert.ok(isNationalTeamLabel(l), l);
  }
  for (const l of ['Fluminense Football Club', 'Club Nacional de Football', 'Seleçãozinha FC'.replace('Seleçãozinha', 'Cruzeiro')]) assert.ok(!isNationalTeamLabel(l), l);
  // A consulta aceita a subclasse ("men's national association football team").
  assert.match(teamsQuery(['Q1']), /wdt:P31\/wdt:P279\? wd:Q6979593/);
  // Carga: sem a marca de seleção, o rótulo basta; os jogos pela seleção somam.
  const p = { type: 'uri', value: 'http://www.wikidata.org/entity/Q677923' };
  const team = (q: string, pt: string, apps: string) => ({ p, team: { type: 'uri', value: `http://www.wikidata.org/entity/${q}` }, pt: { type: 'literal', value: pt }, apps: { type: 'literal', value: apps }, nat: { type: 'literal', value: 'false' } });
  const [r] = buildRecords([{ id: 'Q677923', sitelinks: 20, birth: null }], [{ p, pt: { type: 'literal', value: 'Fábio' } }], [], [
    team('Q188277', 'Cruzeiro Esporte Clube', '700'),
    team('Q83459', 'Seleção Brasileira de Futebol', '3'),
  ]);
  assert.deepEqual(r.clubs, ['Cruzeiro Esporte Clube']);
  assert.equal(r.stats.intlCaps, 3);
  // Ficha antiga com a seleção na lista: some na leitura (e na recusa).
  const old = toProfile(record('Q677923', 'Fábio', ['Cruzeiro Esporte Clube', 'Seleção Brasileira de Futebol']));
  assert.deepEqual(old.clubs, ['Cruzeiro Esporte Clube']);
  assert.doesNotMatch(formatCard(record('Q1', 'Fábio', ['Cruzeiro Esporte Clube', 'Seleção Brasileira de Futebol'])), /Seleção/);
});

test('Rodada 14: carreira pela página da entidade (sem WDQS) e caixa da Wikipédia (pt e en)', async () => {
  const calls: string[] = [];
  const career = (await wikidataCareer('Q677923', fakeWeb(calls)))!;
  // Ordem da carreira: o Cruzeiro (1999, primeira passagem) vem antes do Vasco (2000).
  assert.deepEqual(career.clubs, ['União Bandeirante Futebol Clube', 'Club Athletico Paranaense', 'Cruzeiro Esporte Clube', 'Club de Regatas Vasco da Gama']);
  assert.equal(career.intlCaps, 3, 'jogos pela seleção (P1350)');
  assert.deepEqual(career.wiki, { pt: 'Fábio Deivson Lopes Maciel', en: 'Fábio (footballer, born 1980)' });
  assert.equal(career.birthDate, '1980-09-30');
  assert.ok(!calls.some((u) => u.includes('query.wikidata.org')), 'não usa o WDQS');
  assert.ok(!career.clubs.some((c) => /fluminense/i.test(c)), 'o Wikidata não tem o Fluminense');
  // Caixa de informação: pt ({{Futebol X}} e lista com <br>) e en ([[Artigo|Texto]]).
  assert.deepEqual(parseInfoboxClubs(FX.wiki.fabio_pt), ['Fluminense', 'União Bandeirante', 'Athletico Paranaense', 'Cruzeiro', 'Vasco da Gama']);
  assert.ok(parseInfoboxClubs(FX.wiki.fabio_en).some((c) => /Fluminense/.test(c)));
  assert.deepEqual(parseInfoboxClubs(FX.wiki.domingos_pt), ['Bangu', 'Vasco', 'Nacional-URU', 'Boca Juniors', 'Flamengo', 'Corinthians']);
  // Sem rótulo nenhum, nada inventado.
  assert.deepEqual(buildCareer(FX.entities.Q677923, new Map()).clubs, []);
});

function duel(sources: PlayerSources, identify = lookupDemo) {
  const store = new MemoryStore();
  const lookup = createLookup(store, identify, undefined, sources);
  return { store, lookup };
}

const flu = { position: 'GOL' as const, kind: 'club' as const, teamId: 'fluminense' };
const mode = getMode('artilheiros')!;

test('Rodada 14: Fábio no Fluminense — o Wikidata não tem, a Wikipédia confirma e fica gravado', async () => {
  const calls: string[] = [];
  const { store, lookup } = duel(realSources(calls));
  // Ficha da base como a do grupo: clubes do Wikidata e a seleção no meio.
  await store.upsertPlayers([record('Q677923', 'Fábio', ['União Bandeirante Futebol Clube', 'Club Athletico Paranaense', 'Cruzeiro Esporte Clube', 'Club de Regatas Vasco da Gama', 'Seleção Brasileira de Futebol'])]);
  const p = (await lookup('Fábio', flu))!;
  assert.ok(p.clubs.includes('Fluminense'), p.clubs.join(', '));
  assert.ok(!p.clubs.some((c) => /Seleção/.test(c)));
  assert.equal(checkPick({ ...p, careerGoals: 1 }, 'GOL', { kind: 'club', teamId: 'fluminense' }, mode, new Date()).ok, true);
  const saved = (await store.getPlayer('Q677923'))!;
  assert.deepEqual(saved.manual?.clubs?.map((c) => [c.name, c.source]), [['Fluminense', 'Wikipédia']]);
  assert.match(formatCard(saved), /Fluminense \(Wikipédia\)/);
  // De novo (outro clube, outra rodada): cache e passagem gravada, sem ir à rede.
  const before = calls.length;
  assert.ok((await lookup('Fábio', { ...flu, teamId: 'cruzeiro' }))!.clubs.includes('Fluminense'));
  assert.ok((await lookup('Fábio', flu))!.clubs.includes('Fluminense'));
  assert.equal(calls.length, before);
  // Clube que nem Wikidata nem Wikipédia têm: recusa com os clubes, sem a seleção.
  const milan = (await lookup('Fábio', { ...flu, teamId: 'milan' }))!;
  const v = checkPick({ ...milan, careerGoals: 1 }, 'GOL', { kind: 'club', teamId: 'milan' }, mode, new Date());
  assert.ok(!v.ok && v.kind === 'club');
  assert.doesNotMatch(!v.ok ? v.reason : '', /Seleção/);
});

test('Rodada 14: Domingos da Guia no Milan — a ficha só da IA vira ficha do Wikidata e a passagem falsa cai', async () => {
  const { store, lookup } = duel(realSources());
  // Ficha antiga da IA, contaminada (o Milan veio de uma resposta antiga).
  await store.upsertPlayers([
    record('ai:domingos da guia:1912-11-19', 'Domingos da Guia', ['Bangu', 'Vasco', 'Milan', 'Flamengo'], { positions: ['DEF'], birthDate: '1912-11-19', source: 'ai', sitelinks: 0, stats: { careerGoals: 5 } }),
  ]);
  const ctx = { position: 'DEF' as const, kind: 'club' as const, teamId: 'milan' };
  const p = (await lookup('Domingos da Guia', ctx))!;
  assert.equal(p.id, 'Q717927');
  assert.equal(p.name, 'Domingos da Guia', 'fica o nome que o grupo usa');
  const v = checkPick(p, 'DEF', { kind: 'club', teamId: 'milan' }, mode, new Date());
  assert.ok(!v.ok && v.kind === 'club');
  assert.match(!v.ok ? v.reason : '', /não tem passagem pelo \*Milan\*\. Clubes: Bangu Atlético Clube, Club Nacional de Football, Club de Regatas Vasco da Gama, Club Atlético Boca Juniors, Clube de Regatas do Flamengo, Sport Club Corinthians Paulista\./);
  assert.equal(await store.getPlayer('ai:domingos da guia:1912-11-19'), null, 'a ficha da IA some');
  assert.equal((await store.getPlayer('Q717927'))!.stats.careerGoals, 5, 'os números dela ficam');
  // E no Flamengo, onde jogou de verdade, vale.
  const fla = (await lookup('Domingos da Guia', { ...ctx, teamId: 'flamengo' }))!;
  assert.equal(checkPick(fla, 'DEF', { kind: 'club', teamId: 'flamengo' }, mode, new Date()).ok, true);
});

test('Rodada 14: ficha sem fonte — clube da IA não prova passagem (e não gasta tentativa)', async () => {
  const nothing: PlayerSources = { career: async () => null, wikipediaClubs: async () => null, findId: async () => null };
  const ai = async (): Promise<PlayerProfile> => ({
    exists: true, name: 'Fulano Obscuro', positions: ['ATA'], nationality: 'Brasil', birthDate: '1990-01-01', clubs: ['Fluminense', 'Bangu'],
    heightCm: 180, careerGoals: 90, careerAssists: 10, peakValueEurM: 1, intlCaps: 0, intlGoals: 0, worldCupGoals: 0, uclGoals: 0,
    titles: 2, careerApps: 300, brasileiraoGoals: 20, libertadoresGoals: 0, worldCupsPlayed: 0, debutYear: 2009,
  });
  const { lookup } = duel(nothing, ai);
  const p = (await lookup('Fulano Obscuro', { position: 'ATA', kind: 'club', teamId: 'fluminense' }))!;
  assert.equal(p.clubsUnverified, true);
  const v = clubVerdict(p, getTeam('fluminense')!);
  assert.ok(v && v.kind === 'data' && /não gasta tentativa/.test(v.reason));
  const other = clubVerdict(p, getTeam('palmeiras')!);
  assert.ok(other && other.kind === 'club' && /passagem confirmada/.test(other.reason));
  // Fora de rodada de clube nada muda.
  assert.equal((await lookup('Fulano Obscuro', { position: 'ATA' }))!.clubsUnverified, undefined);

  // No 1 x 1: a recusa por falta de fonte não conta como tentativa.
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, ai, undefined, nothing), rng: () => 0, now: () => new Date('2026-11-25T12:00:00Z') };
  const say = (who: string, text: string): Promise<Outgoing[]> => handleMessage({ id: `x${++id}`, groupJid: 'r14@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  await say('Ana', 'ativar jogos');
  await say('Ana', 'iniciar jogo');
  await say('Bia', 'aceitar');
  await say('Ana', '1');
  const s = (await store.getActiveMatch('r14@g.us'))!.state as MatchState;
  const team = getTeam(s.restrictions[0].teamId)!;
  const ai2 = async (): Promise<PlayerProfile> => ({ ...(await ai()), clubs: [team.name], positions: ['GOL', 'DEF', 'MEI', 'ATA'] });
  deps.lookup = createLookup(store, ai2, undefined, nothing);
  const out = asText(await say('Ana', 'Fulano Obscuro'));
  assert.match(out, /Não achei a carreira de \*Fulano Obscuro\*/);
  assert.doesNotMatch(out, /Tentativa/);
});

test('Rodada 14: admin confirma passagem que falta (corrigir X clube Y fonte Z)', async () => {
  assert.deepEqual(parseClubCorrection('corrigir fabio clube fluminense fonte ge'), { player: 'fabio', club: 'fluminense', source: 'ge' });
  assert.deepEqual(parseClubCorrection('corrigir rogerio ceni clube sao paulo'), { player: 'rogerio ceni', club: 'sao paulo', source: 'admin' });
  assert.equal(parseClubCorrection('corrigir rogerio ceni gols 131'), null);
  const store = new MemoryStore();
  await store.upsertPlayers([record('Q677923', 'Fábio', ['Cruzeiro Esporte Clube'])]);
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), now: () => new Date('2026-11-25T12:00:00Z'), canManageGroup: (jid: string) => jid === 'dono@s' };
  const say = (who: string, text: string) => handleMessage({ id: `c${++id}`, groupJid: 'adm@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  await say('dono', 'ativar jogos');
  assert.match(asText(await say('Bia', 'corrigir Fábio clube Fluminense')), /Só o admin/);
  assert.match(asText(await say('dono', 'corrigir Fábio clube Fluminense fonte ge')), /Fábio: passagem pelo \*Fluminense\* confirmada \(ge, 25\/11\/2026\)/);
  assert.match(asText(await say('dono', 'corrigir Fábio clube Time Inventado')), /Não conheço o clube/);
  const p = toProfile((await store.getPlayer('Q677923'))!);
  assert.ok(p.clubs.includes('Fluminense'));
  assert.match(asText(await say('Bia', 'ficha Fábio')), /Fluminense \(ge\)/);
  // A carga do Wikidata regrava a ficha e a passagem confirmada continua.
  await store.upsertPlayers([record('Q677923', 'Fábio', ['Cruzeiro Esporte Clube', 'Club de Regatas Vasco da Gama'])]);
  assert.ok((await store.getPlayer('Q677923'))!.clubs.includes('Fluminense'));
});

test('Rodada 14: carga — lendas antes de 1920 e reparo das seleções entram na carga em andamento', async () => {
  // Carga parada na Alemanha (parte 8): as partes novas entram logo depois.
  const running = { ...newImportState(), part: 8, cursor: '1997-07-21' };
  const ext = extendPlan(running);
  assert.equal(ext.plan.length, DEFAULT_PLAN.length + LATE_PARTS.length);
  assert.deepEqual(ext.plan.slice(9, 11).map((p) => p.label), LATE_PARTS.map((p) => p.label));
  assert.equal(ext.plan[8].label, 'clubes da Alemanha');
  assert.equal(extendPlan(ext).plan.length, ext.plan.length, 'não duplica');
  // Carga que já tinha terminado: volta a andar pela primeira parte nova.
  const done = extendPlan({ ...newImportState(), part: DEFAULT_PLAN.length - 1, done: true });
  assert.equal(done.done, false);
  assert.equal(done.plan[done.part].label, LATE_PARTS[0].label);
  assert.equal(done.cursor, '1860-01-01');
  // A parte das lendas acaba em 1919 (não refaz quem nasceu depois).
  const legends = { ...newImportState({ plan: [LATE_PARTS[0], DEFAULT_PLAN[1]] }), cursor: '1920-01-01' };
  const next = await importStep(legends, async () => undefined, async () => new Response('{"results":{"bindings":[]}}'));
  assert.equal(next.part, 1);
  assert.equal(next.cursor, `${DEFAULT_PLAN[1].fromYear}-01-01`);
});

test('Rodada 14: Career (tipo) só tem campos simples (cabe no cache)', () => {
  const c: Career = { id: 'Q1', clubs: ['A'], wiki: {}, sitelinks: 1, birthDate: null, label: null };
  assert.deepEqual(JSON.parse(JSON.stringify(c)), c);
});

test('Rodada 14: conteúdo de 2025/26 nos jogos (sem repetir id e sem item ambíguo no Conexões)', async () => {
  const { RELAMPAGO_R14, FACTS_R14, EMOJI_R14, WHOIS_R14, TIMELINE_R14, INTRUSO_R14, CONEXOES_R14 } = await import('../src/lib/party/content/rodada14');
  const { CARDS } = await import('../src/lib/party/content/cards');
  const { FACTS } = await import('../src/lib/party/content/fato');
  const { WHOIS } = await import('../src/lib/party/content/whois');
  const { TIMELINE } = await import('../src/lib/party/content/linha');
  const { INTRUSO_SETS } = await import('../src/lib/party/content/intruso');
  const { CONEXOES } = await import('../src/lib/party/content/conexoes');
  const { LINEUPS } = await import('../src/lib/party/content/lineups');
  const has = <T extends { id: string }>(all: T[], some: T[]) => some.every((x) => all.some((y) => y.id === x.id));
  assert.ok(has(CARDS.relampago, RELAMPAGO_R14) && has(CARDS.emoji, EMOJI_R14) && has(FACTS, FACTS_R14) && has(WHOIS, WHOIS_R14));
  assert.ok(has(TIMELINE, TIMELINE_R14) && has(INTRUSO_SETS, INTRUSO_R14) && has(CONEXOES, CONEXOES_R14));
  for (const list of [CARDS.relampago, CARDS.emoji, FACTS, WHOIS, TIMELINE, INTRUSO_SETS, CONEXOES, LINEUPS] as Array<Array<{ id: string }>>) {
    const ids = list.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `id repetido: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`);
  }
  assert.ok(RELAMPAGO_R14.length >= 10 && FACTS_R14.length >= 10 && EMOJI_R14.length >= 8);
  // Fato ou Fake equilibrado e Conexões com 16 itens diferentes.
  assert.ok(FACTS_R14.some((x) => x.fact) && FACTS_R14.some((x) => !x.fact));
  for (const p of CONEXOES_R14) {
    const items = p.groups.flatMap((g) => g.items);
    assert.equal(new Set(items).size, 16, p.id);
  }
  // Que Time: as três finais novas, com 11 titulares cada.
  for (const id of ['espanha-2026', 'flamengo-2025', 'crystal-palace-2026']) {
    const l = LINEUPS.find((x) => x.id === id)!;
    assert.equal(l.lines.flat().length, 11, id);
  }
});

test('Rodada 14: novidades de 26/11 (e o grupo só de Impostor ainda vê a última com Impostor)', async () => {
  const { NEWS, NEWS_LINE_MAX, latestNewsFor, newsOutgoing } = await import('../src/lib/game/novidades');
  const r14 = NEWS.find((n) => n.id === '2026-11-26')!;
  for (const i of r14.items) for (const l of i.lines) assert.ok(l.length <= NEWS_LINE_MAX, l);
  assert.ok(r14.items.some((i) => /Fábio no Fluminense/.test(i.lines.join(' '))));
  assert.equal(newsOutgoing(r14, true), null, 'nada desta versão é do Impostor');
  assert.equal(latestNewsFor(true)?.id, '2026-11-25');
  assert.equal(latestNewsFor(false)?.id, NEWS[0].id);
});
