import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { STAT_QUESTION } from '../src/lib/ai/stats';
import { handleMessage } from '../src/lib/game/engine';
import { MODES, getMode, metricValue, parseModeChoice } from '../src/lib/game/modes';
import { CLUBS, LEAGUES, clubsInLeague, drawLeagueTeams, getTeam, playedForClub } from '../src/lib/game/teams';
import type { EscalacaoParty, MatchState, Outgoing, PlayerProfile } from '../src/lib/game/types';
import { drawRestrictions } from '../src/lib/game/validate';
import { parsePartyStart } from '../src/lib/party/engine';
import { STAT_LABEL, parseCorrection } from '../src/lib/players/admin';
import { STAT_KEYS } from '../src/lib/players/types';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

test('Rodada 11: tema 19 Casca-Grossa conta cartões na carreira', () => {
  const m = getMode('casca-grossa')!;
  assert.equal(m.number, 19);
  assert.equal(m.metric, 'careerCards');
  assert.equal(m.direction, 'high');
  assert.equal(m.restriction, 'club');
  assert.ok(STAT_KEYS.includes('careerCards'));
  assert.match(STAT_QUESTION.careerCards, /amarelos \+ vermelhos/);
  assert.match(STAT_LABEL.careerCards, /cartões/);
  const p = { exists: true, name: 'Sergio Ramos', positions: ['DEF'], nationality: 'Espanha', birthDate: '1986-03-30', clubs: [], careerCards: 290 } as unknown as PlayerProfile;
  const now = new Date('2026-11-21T12:00:00Z');
  assert.equal(metricValue(p, 'careerCards', now), 290);
  assert.equal(metricValue({ ...p, careerCards: 900 }, 'careerCards', now), null, 'fora da faixa plausível');
  assert.equal(metricValue({ ...p, careerCards: undefined }, 'careerCards', now), null, 'ficha antiga sem o dado');
  assert.deepEqual(parseCorrection('corrigir sergio ramos cartoes 290 fonte ogol'), { player: 'sergio ramos', stat: 'careerCards', value: 290, source: 'ogol' });
});

test('Rodada 11: liga como extra do tema (e "brasileirão" sozinho continua sendo o tema 14)', () => {
  const rng = seeded(3);
  const cases: Array<[string, number, string | undefined, string | undefined]> = [
    ['1 brasileirao', 1, 'br', undefined],
    ['3 premier', 3, 'eng', undefined],
    ['5 la liga', 5, 'esp', undefined],
    ['12 serie a dificil', 12, 'ita', undefined],
    ['2 bundesliga', 2, 'ger', undefined],
    ['13 ligue 1', 13, 'fra', undefined],
    ['1 argentino', 1, 'arg', undefined],
    ['19 brasileirao', 19, 'br', undefined],
    ['15 argentino', 15, 'arg', undefined],
    ['10 premier', 10, 'eng', undefined],
    ['7 brasileirao', 7, undefined, 'br'],
    ['14 premier', 14, undefined, 'eng'],
    ['10 brasileirao', 10, undefined, 'br'],
  ];
  for (const [txt, n, league, ignored] of cases) {
    const p = parseModeChoice(txt, rng)!;
    assert.equal(p.mode.number, n, txt);
    assert.equal(p.twists.league, league, txt);
    assert.equal(p.ignoredLeague, ignored, txt);
  }
  assert.equal(parseModeChoice('12 serie a dificil', rng)!.twists.hard, true);
  assert.equal(parseModeChoice('brasileirao', rng)!.mode.id, 'brasileirao');
  assert.equal(parseModeChoice('rei do brasileirao', rng)!.mode.id, 'brasileirao');
  // Aleatório com liga: só temas de clube em que a liga vale.
  for (let i = 0; i < 40; i++) {
    const p = parseModeChoice('aleatorio premier', rng)!;
    assert.equal(p.mode.restriction, 'club');
    assert.ok(!p.mode.region || p.mode.region === 'eu', p.mode.id);
    assert.equal(p.twists.league, 'eng');
  }
  assert.deepEqual(parsePartyStart('abrir sala 1 brasileirao'), { game: 'escalacao', rest: '1 brasileirao' });
  assert.deepEqual(parsePartyStart('abrir sala aleatorio la liga'), { game: 'escalacao', rest: 'aleatorio la liga' });
});

test('Rodada 11: sorteio por liga mistura gigantes, médios e raiz (difícil puxa para a raiz)', () => {
  for (const league of Object.keys(LEAGUES) as Array<keyof typeof LEAGUES>) {
    const clubs = clubsInLeague(league);
    assert.ok(clubs.length >= 10, `${league}: só ${clubs.length} clubes`);
    assert.equal(clubs.length, LEAGUES[league].tiers.flat().length, `${league}: id de clube que não existe`);
    assert.equal(new Set(clubs.map((c) => c.id)).size, clubs.length, `${league}: clube repetido`);
  }
  assert.ok(clubsInLeague('br').length >= 55, 'muitos times do Brasil');
  const tierOf = (league: keyof typeof LEAGUES, id: string) => LEAGUES[league].tiers.findIndex((t) => t.includes(id));
  const count = (hard: boolean) => {
    const rng = seeded(11);
    const tiers = [0, 0, 0];
    for (let i = 0; i < 300; i++) {
      const teams = drawLeagueTeams('br', 6, rng, hard);
      assert.equal(new Set(teams.map((t) => t.id)).size, 6);
      for (const t of teams) tiers[tierOf('br', t.id)]++;
    }
    return tiers;
  };
  const normal = count(false);
  const hard = count(true);
  assert.ok(normal[0] > normal[2], `normal: mais gigantes que raiz (${normal})`);
  assert.ok(normal[2] > 0, 'normal também tem raiz às vezes');
  assert.ok(hard[2] > hard[0], `difícil: mais raiz que gigantes (${hard})`);
  // Restrições do tema: só clubes da liga; tema de seleção ignora a liga.
  const r = drawRestrictions(getMode('artilheiros')!, seeded(5), false, 'eng');
  assert.equal(r.length, 6);
  for (const x of r) assert.ok(LEAGUES.eng.tiers.flat().includes(x.teamId!), x.teamId);
  const c = drawRestrictions(getMode('convocados')!, seeded(5), false, 'eng');
  assert.ok(c.every((x) => x.kind === 'country'));
});

test('Rodada 11: clubes novos do Brasil não se confundem com os de mesmo nome', () => {
  const t = (id: string) => getTeam(id)!;
  assert.ok(playedForClub(t('america-rn'), ['América Futebol Clube (RN)']));
  assert.ok(!playedForClub(t('america-mg'), ['América Futebol Clube (RN)']));
  assert.ok(playedForClub(t('america-mg'), ['América Futebol Clube (MG)']));
  assert.ok(playedForClub(t('america-rj'), ['America Football Club (Rio de Janeiro)']));
  assert.ok(playedForClub(t('botafogo-sp'), ['Botafogo Futebol Clube (Ribeirão Preto)']));
  assert.ok(!playedForClub(t('botafogo'), ['Botafogo Futebol Clube (Ribeirão Preto)']));
  assert.ok(playedForClub(t('botafogo'), ['Botafogo de Futebol e Regatas']));
  assert.ok(playedForClub(t('novorizontino'), ['Grêmio Novorizontino']));
  assert.ok(!playedForClub(t('gremio'), ['Grêmio Novorizontino']));
  assert.ok(!playedForClub(t('porto'), ['Grêmio Foot-Ball Porto Alegrense']));
  assert.ok(playedForClub(t('lens'), ['Racing Club de Lens']));
  assert.ok(!playedForClub(t('racing'), ['Racing Club de Lens']));
  // Nenhum clube casa com o nome de outro.
  for (const a of CLUBS) for (const b of CLUBS) if (a.id !== b.id) assert.ok(!playedForClub(a, [b.name]), `${a.id} x ${b.name}`);
});

test('Rodada 11: liga no 1x1 e na sala', async () => {
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: seeded(9), now: () => new Date('2026-11-21T12:00:00Z') };
  const say = (g: string, who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: g, senderJid: `${who}@s`, senderName: who, text }, deps);

  for (const g of ['a@g.us', 'b@g.us', 'c@g.us']) await say(g, 'Ana', 'ativar jogos');
  // 1x1
  await say('a@g.us', 'Ana', 'iniciar jogo');
  const menu = asText(await say('a@g.us', 'Beto', 'aceitar'));
  assert.match(menu, /1 brasileirão/);
  const kick = asText(await say('a@g.us', 'Ana', '1 brasileirão difícil'));
  assert.match(kick, /só Brasileirão/);
  const duel = (await store.getActiveMatch('a@g.us'))!.state as MatchState;
  assert.equal(duel.options?.league, 'br');
  assert.ok(duel.restrictions.every((r) => LEAGUES.br.tiers.flat().includes(r.teamId!)));

  // Sala
  await say('b@g.us', 'Ana', 'abrir sala 3 premier');
  const sala = (await store.getActiveMatch('b@g.us'))!.state as EscalacaoParty;
  assert.equal(sala.modeId, 'milionarios');
  assert.equal(sala.options.league, 'eng');
  // Liga que não vale para o tema: avisa e segue sem ela.
  const out = asText(await say('c@g.us', 'Ana', 'abrir sala 7 brasileirão'));
  assert.match(out, /ficou de fora: esse tema sorteia seleções/);
  const sala2 = (await store.getActiveMatch('c@g.us'))!.state as EscalacaoParty;
  assert.equal(sala2.options.league, undefined);
  assert.equal(MODES.length, 22);
});

test('Rodada 11: todos os temas nos jogos que não são só de futebol', async () => {
  const { EMOJI_CARDS, RELAMPAGO_CARDS } = await import('../src/lib/party/content/cards');
  const { CHUTE_QUESTIONS } = await import('../src/lib/party/content/chute');
  const { CONEXOES } = await import('../src/lib/party/content/conexoes');
  const { FACTS } = await import('../src/lib/party/content/fato');
  const { INTRUSO_SETS } = await import('../src/lib/party/content/intruso');
  const { TIMELINE } = await import('../src/lib/party/content/linha');
  const { SURVIVOR_LISTS } = await import('../src/lib/party/content/sobrevivente');
  const { WHOIS } = await import('../src/lib/party/content/whois');
  const { ANAGRAMS } = await import('../src/lib/party/content/anagramas');
  const { TOP10_LISTS } = await import('../src/lib/party/top10-lists');
  type WithCategory = { id: string; category?: string };
  const count = (xs: WithCategory[], cat: string) => xs.filter((x) => (x.category ?? 'futebol') === cat).length;
  const min: Array<[string, WithCategory[], number]> = [
    ['Quem é?', WHOIS, 16],
    ['Emoji', EMOJI_CARDS, 20],
    ['Relâmpago', RELAMPAGO_CARDS, 15],
    ['Fato ou Fake', FACTS, 12],
    ['Chute Certo', CHUTE_QUESTIONS, 15],
    ['Linha do Tempo', TIMELINE, 24],
    ['Intruso', INTRUSO_SETS, 15],
    ['Conexões', CONEXOES, 6],
    ['Sobrevivente', SURVIVOR_LISTS, 8],
    ['Anagrama', ANAGRAMS, 25],
    ['Top 10', TOP10_LISTS, 6],
  ];
  for (const [game, pool, n] of min) {
    assert.equal(new Set(pool.map((x) => x.id)).size, pool.length, `${game}: id repetido`);
    for (const cat of ['futebol', 'geral', 'historia', 'anime']) {
      const need = ['Conexões', 'Sobrevivente', 'Top 10'].includes(game) && cat !== 'futebol' && cat !== 'geral' ? Math.min(n, 5) : n;
      assert.ok(count(pool, cat) >= need, `${game} ${cat}: ${count(pool, cat)} < ${need}`);
    }
  }
  // Top 10: listas sem nome repetido e com até 10 itens.
  for (const l of TOP10_LISTS) {
    assert.ok(l.items.length >= 4 && l.items.length <= 10, l.id);
    assert.equal(new Set(l.items.map((i) => i.name)).size, l.items.length, `${l.id}: nome repetido`);
  }
});

test('Rodada 11: Top 10 aceita história e anime; Stop filtra futebol e geral; Anagrama tem história e anime', async () => {
  const { STOP_CATEGORIES, stopPool } = await import('../src/lib/party/content/stop');
  const { findAnagramTheme } = await import('../src/lib/party/content/anagramas');
  const { IMPOSTOR_THEMES } = await import('../src/lib/party/content/impostor');
  for (const cat of ['historia', 'anime']) assert.deepEqual(parsePartyStart(`top 10 ${cat}`), { game: 'top10', rest: cat });
  assert.deepEqual(parsePartyStart('abrir stop futebol'), { game: 'stop', rest: 'futebol' });
  assert.deepEqual(parsePartyStart('abrir stop geral'), { game: 'stop', rest: 'geral' });
  assert.deepEqual(parsePartyStart('abrir stop'), { game: 'stop', rest: '' });
  assert.equal(parsePartyStart('abrir stop agora'), null);
  const fut = stopPool('futebol');
  assert.ok(fut.length >= 6 && fut.every((c) => c.futebol));
  assert.ok(stopPool('geral').every((c) => !c.futebol));
  assert.ok(stopPool('geral').some((c) => c.id === 'historico') && stopPool('geral').some((c) => c.id === 'anime'));
  assert.ok(stopPool(null).every((c) => !c.onlyFutebol), 'a mistura de sempre não ganha as categorias só de futebol');
  assert.equal(new Set(STOP_CATEGORIES.map((c) => c.id)).size, STOP_CATEGORIES.length);
  assert.equal(findAnagramTheme('historia')?.category, 'historia');
  assert.equal(findAnagramTheme('anime')?.category, 'anime');
  // O Impostor continua com um tema só de cada (não herda os do Anagrama).
  assert.equal(IMPOSTOR_THEMES.filter((t) => t.keys.includes('anime')).length, 1);
  assert.equal(IMPOSTOR_THEMES.filter((t) => t.keys.includes('historia')).length, 1);

  // Fluxo: Top 10 história e Stop futebol.
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: seeded(4), now: () => new Date('2026-11-21T12:00:00Z') };
  const say = (g: string, who: string, text: string) =>
    handleMessage({ id: `m${++id}`, groupJid: g, senderJid: `${who}@s`, senderName: who, text }, deps);
  for (const g of ['t@g.us', 's@g.us']) await say(g, 'Ana', 'ativar jogos');
  await say('t@g.us', 'Ana', 'top 10 historia');
  await say('t@g.us', 'Beto', 'entrar');
  await say('t@g.us', 'Ana', 'começar');
  const top = (await store.getActiveMatch('t@g.us'))!.state as { category: string; listId: string };
  assert.equal(top.category, 'historia');
  const { getTop10List } = await import('../src/lib/party/top10-lists');
  assert.equal(getTop10List(top.listId)?.category, 'historia');
  await say('s@g.us', 'Ana', 'abrir stop futebol');
  await say('s@g.us', 'Beto', 'entrar');
  const start = asText(await say('s@g.us', 'Ana', 'começar'));
  assert.match(start, /Só futebol/);
  const stop = (await store.getActiveMatch('s@g.us'))!.state as { cats: string[][] };
  const futIds = new Set(fut.map((c) => c.id));
  assert.ok(stop.cats.flat().every((c) => futIds.has(c)));
});
