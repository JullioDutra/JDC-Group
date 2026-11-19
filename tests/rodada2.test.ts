import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { LeilaoParty, MatchState, Outgoing } from '../src/lib/game/types';
import type { PlayerRecord } from '../src/lib/players/types';
import { parsePartyStart } from '../src/lib/party/engine';
import { LEILAO_BONUS, completeTeam, maxBid, overallOf, parseBid, teamScore } from '../src/lib/party/leilao';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

// ---------- Prazo automático do 1 x 1 ----------

test('1 x 1: cada vez tem prazo; estourou, pior valor do tema e a vez passa; 3 seguidas = W.O.', async () => {
  const store = new MemoryStore();
  let clock = Date.parse('2026-11-19T12:00:00Z');
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), now: () => new Date(clock), rng: () => 0 };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `d${++id}`, groupJid: 'duelo@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick('duelo@g.us', null, deps, true);
  await say('Ana', 'ativar jogos');
  await say('Ana', 'iniciar jogo');
  await say('Bia', 'aceitar');
  const kickoff = asText(await say('Ana', '1'));
  assert.match(kickoff, /Você tem 90s\.[\s\S]*\[timer:91s\]/, 'a primeira vez já tem prazo agendado');

  const first = asText(await tick());
  assert.match(first, /⏱️ \*Ana\* estourou o tempo e ficou com o pior valor do tema[\s\S]*\*Bia\*, mande[\s\S]*\[timer:91s\]/);
  // Bia, Bia (nova rodada começa com ela), Ana: 2 estouros de cada; o aviso aparece.
  await tick();
  assert.match(asText(await tick()), /Bia\* estourou o tempo[\s\S]*Mais uma e é W\.O\./);
  await tick();
  const wo = asText(await tick());
  assert.match(wo, /\*Ana\* ficou 3 vezes seguidas sem jogar\. Vitória de \*Bia\* por W\.O\./);
  assert.equal(await store.getActiveMatch('duelo@g.us'), null, 'grupo liberado');
  const ranking = await store.getRanking('duelo@g.us', 5);
  assert.equal(ranking.find((r) => r.name === 'Bia')?.wins, 1);
});

test('1 x 1: o agendador antigo não cobra a vez nova; prazo vencido cobra na próxima mensagem', async () => {
  const store = new MemoryStore();
  let clock = Date.parse('2026-11-19T12:00:00Z');
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), now: () => new Date(clock), rng: () => 0 };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `e${++id}`, groupJid: 'duelo2@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  await say('Ana', 'ativar jogos');
  await say('Ana', 'iniciar jogo');
  await say('Bia', 'aceitar');
  await say('Ana', '1');
  const state = () => store.getActiveMatch('duelo2@g.us').then((m) => m!.state as MatchState);
  const token = (await state()).timerToken!;
  // Antes do prazo, o tick com o token certo não faz nada.
  assert.deepEqual(await handleTick('duelo2@g.us', token, deps), []);
  // Token velho também não.
  assert.deepEqual(await handleTick('duelo2@g.us', 'duel:0', deps), []);
  // Passou o prazo e o QStash não chegou: a próxima mensagem do grupo cobra.
  clock += 95_000;
  assert.match(asText(await say('Caio', 'oi gente')), /Ana\* estourou o tempo/);
});

// ---------- Leilão de Craques ----------

const rec = (id: string, name: string, pos: PlayerRecord['positions'], sitelinks: number): PlayerRecord => ({
  id, name, aliases: [], positions: pos, nationality: 'Brasil', birthDate: null, heightCm: null,
  clubs: ['Flamengo', 'Real Madrid'], debutYear: null, sitelinks, stats: {}, source: 'wikidata',
});

test('Leilão: overall pela fama, lance pelo número, limite de saldo e time completo', () => {
  assert.equal(overallOf(250), 99);
  assert.ok(overallOf(30) > overallOf(5) && overallOf(5) >= 60);
  assert.equal(parseBid('15'), 15);
  assert.equal(parseBid('lance 30'), 30);
  assert.equal(parseBid('quinze'), null);
  assert.deepEqual(parsePartyStart('abrir leilao'), { game: 'leilao', rest: '' });
  assert.deepEqual(parsePartyStart('abrir leilao de craques'), { game: 'leilao', rest: '' });
  const squad = [
    { name: 'a', positions: ['GOL'] as const, overall: 80, price: 1 },
    { name: 'b', positions: ['DEF', 'MEI'] as const, overall: 80, price: 1 },
    { name: 'c', positions: ['MEI'] as const, overall: 80, price: 1 },
    { name: 'd', positions: ['ATA'] as const, overall: 80, price: 1 },
  ].map((x) => ({ ...x, positions: [...x.positions] }));
  assert.ok(completeTeam(squad));
  assert.equal(teamScore(squad).total, 320 + LEILAO_BONUS);
  assert.ok(!completeTeam(squad.map((s) => ({ ...s, positions: ['ATA' as const] }))));
  const st = { budget: { a: 100 }, squads: { a: [] } } as unknown as LeilaoParty;
  assert.equal(maxBid(st, 'a'), 97, 'guarda 1 moeda para cada uma das outras 3 vagas');
});

test('Leilão na partida: lances, venda no fim do tempo e resultado com o overall revelado', async () => {
  const store = new MemoryStore();
  const records: PlayerRecord[] = [];
  let n = 0;
  for (const pos of ['GOL', 'DEF', 'MEI', 'ATA'] as const) {
    for (let i = 0; i < 4; i++) records.push(rec(`L${++n}`, `Craque ${pos} ${i + 1}`, [pos], 10 + n * 7));
  }
  await store.upsertPlayers(records);
  let id = 0;
  const deps = { store, lookup: createLookup(store, async () => null), now: () => new Date('2026-11-19T12:00:00Z'), rng: () => 0.5 };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `l${++id}`, groupJid: 'leilao@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick('leilao@g.us', null, deps, true);
  await say('Ana', 'ativar jogos');
  await say('Ana', 'abrir leilão');
  await say('Bia', 'entrar');
  const start = asText(await say('Ana', 'começar'));
  assert.match(start, /Leilão de Craques\* valendo![\s\S]*Lote 1\/12[\s\S]*Mande o valor\. 30s\.[\s\S]*\[timer:31s\]/);
  assert.equal(asText(await say('Ana', '10')), '[react:💰]');
  assert.equal(asText(await say('Bia', '5')), '', 'lance menor que o atual não vale');
  assert.equal(asText(await say('Bia', '12')), '[react:💰]');
  assert.match(asText(await say('Ana', '98')), /lance máximo agora é 97/);
  const sold = asText(await tick());
  assert.match(sold, /✅ Vendido! \*[^*]+\* para \*Bia\* por 12 \(sobram 88\)\.[\s\S]*Lote 2\/12/);
  // Resto do leilão: cada um dá lance de 1 alternando, até os times fecharem.
  let out = '';
  for (let i = 0; i < 20; i++) {
    const m = await store.getActiveMatch('leilao@g.us');
    if (!m) break;
    const s = m.state as LeilaoParty;
    const who = s.squads['Ana@s'].length <= s.squads['Bia@s'].length ? 'Ana' : 'Bia';
    await say(who, '1');
    out = asText(await tick());
  }
  assert.match(out, /\[img:textBoard\][\s\S]*(Todos os times estão completos|Acabaram os lotes)[\s\S]*🏆/);
  assert.equal(await store.getActiveMatch('leilao@g.us'), null);
});

// ---------- Anagrama ----------

test('Anagrama: 100+ palavras, embaralha diferente, primeiro que acerta leva; dica na metade', async () => {
  const { ANAGRAMS, scramble } = await import('../src/lib/party/content/anagramas');
  assert.ok(ANAGRAMS.length >= 100, `só ${ANAGRAMS.length}`);
  assert.equal(new Set(ANAGRAMS.map((a) => a.id)).size, ANAGRAMS.length);
  assert.ok(new Set(ANAGRAMS.map((a) => a.theme)).size >= 10, 'vários temas');
  for (const a of ANAGRAMS.slice(0, 40)) assert.notEqual(scramble(a.answer, () => 0).replace(/[^A-Z]/g, ''), a.answer.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, ''), a.answer);
  assert.deepEqual(parsePartyStart('abrir anagrama'), { game: 'anagrama', rest: '' });
  assert.deepEqual(parsePartyStart('jogar anagrama futebol'), { game: 'anagrama', rest: 'futebol' });

  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), now: () => new Date('2026-11-19T12:00:00Z'), rng: () => 0 };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `a${++id}`, groupJid: 'ana@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick('ana@g.us', null, deps, true);
  await say('Ana', 'ativar jogos');
  await say('Ana', 'abrir anagrama futebol');
  await say('Bia', 'entrar');
  const start = asText(await say('Ana', 'começar'));
  assert.match(start, /Anagrama\* valendo![\s\S]*Rodada 1\/12\* · Tema: \*[^*]+\* \(\d+ letras\)[\s\S]*🔤[\s\S]*\[timer:21s\]/);
  const state = async () => (await store.getActiveMatch('ana@g.us'))!.state as import('../src/lib/game/types').AnagramaParty;
  const s = await state();
  const { getAnagram } = await import('../src/lib/party/content/anagramas');
  const word = getAnagram(s.order[0])!;
  // Errar gasta tentativa; o tamanho errado (conversa) não gasta.
  assert.equal(asText(await say('Bia', 'kkkk que dificil isso')), '');
  const wrong = word.answer.split('').reverse().join('');
  assert.match(asText(await say('Bia', wrong)), /\[react:❌\]/);
  // Dica na metade do tempo.
  assert.match(asText(await tick()), /💡 Dica: começa com/);
  const hit = asText(await say('Ana', word.answer));
  assert.match(hit, /Ana\* acertou \(\+60\)/);
});

// ---------- Top 100 do Dia ----------

test('Top 100 do Dia: lista do dia igual para todos, acerto vale a posição, 1 vez por dia por grupo', async () => {
  const { TOP100_LISTS, listOfDay, dayKey } = await import('../src/lib/party/content/top100');
  assert.ok(TOP100_LISTS.length >= 4);
  for (const l of TOP100_LISTS) {
    assert.equal(l.items.length, 100, l.id);
    assert.ok(l.items.every((it, i) => i === 0 || it.rank >= l.items[i - 1].rank), `ordem em ${l.id}`);
  }
  assert.deepEqual(parsePartyStart('top 100'), { game: 'top100', rest: '' });
  assert.deepEqual(parsePartyStart('desafio do dia'), { game: 'top100', rest: '' });
  assert.equal(parsePartyStart('top 10')?.game, 'top10');
  // 23h de Brasília ainda é o mesmo dia; a lista muda à meia-noite de Brasília.
  assert.equal(dayKey(new Date('2026-11-20T02:30:00Z')), '2026-11-19');

  const store = new MemoryStore();
  let clock = Date.parse('2026-11-19T15:00:00Z');
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), now: () => new Date(clock), rng: () => 0 };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `t${++id}`, groupJid: 't100@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick('t100@g.us', null, deps, true);
  const list = listOfDay(new Date(clock));
  await say('Ana', 'ativar jogos');
  await say('Ana', 'top 100');
  const start = asText(await say('Ana', 'começar'));
  assert.match(start, /\[img:top100Board\][\s\S]*Top 100 do Dia\* \(19\/11\/2026\)[\s\S]*\[timer:481s\]/);
  const item = list.items[59];
  const hit = asText(await say('Ana', item.name));
  assert.match(hit, new RegExp(`✅ \\*Ana\\*: ${item.rank}º[\\s\\S]*\\(\\+${item.rank}\\)`));
  assert.match(asText(await say('Ana', item.name)), /já foi/);
  // Quem não entrou e manda palpite já joga; erro gasta vida.
  assert.equal(asText(await say('Bia', 'Zzzzz Inexistente')), '[react:❌]');
  const end = asText(await tick());
  assert.match(end, /Tempo esgotado\.[\s\S]*O grupo achou 1 de 100\.[\s\S]*Ana\* venceu/);
  // Mesmo dia: não abre de novo. Dia seguinte: abre (com outra lista).
  assert.match(asText(await say('Ana', 'top 100')), /já foi jogado neste grupo/);
  clock += 24 * 3600_000;
  assert.match(asText(await say('Ana', 'top 100')), /img:partyLobby/);
  assert.notEqual(listOfDay(new Date(clock)).id, list.id);
});
