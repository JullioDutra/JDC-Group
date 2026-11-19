import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { LeilaoParty, MatchState, Outgoing } from '../src/lib/game/types';
import type { PlayerRecord } from '../src/lib/players/types';
import { parsePartyStart } from '../src/lib/party/engine';
import { leilaoEligible, leilaoModeOf, maxBid, overallOf, parseBid, teamScore } from '../src/lib/party/leilao';
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
  clubs: ['Flamengo', 'Real Madrid'], debutYear: 2010, sitelinks, stats: {}, source: 'wikidata',
});

test('Leilão: overall pela fama, lance pelo número, limite de saldo e time completo', () => {
  assert.equal(overallOf(250), 99);
  assert.equal(overallOf(30), 70);
  assert.equal(overallOf(5), 70);
  assert.ok(overallOf(90) >= 83 && overallOf(90) <= 87, 'estrela começa perto de 85');
  // Só conhecidos das grandes ligas e da era recente (ou lendas).
  assert.ok(leilaoEligible(rec('a', 'Conhecido', ['ATA'], 40)));
  assert.ok(!leilaoEligible(rec('b', 'Pouco conhecido', ['ATA'], 20)), 'menos de 30 Wikipédias não entra');
  assert.ok(!leilaoEligible({ ...rec('c', 'Liga pequena', ['ATA'], 60), clubs: ['FC Sheriff', 'Ludogorets'] }), 'fora das grandes ligas não entra');
  assert.ok(!leilaoEligible({ ...rec('d', 'Antigo', ['ATA'], 60), debutYear: 1960 }), 'antigo e pouco famoso não entra');
  assert.ok(leilaoEligible({ ...rec('e', 'Lenda', ['ATA'], 150), debutYear: 1960 }), 'lenda entra');
  assert.equal(parseBid('15'), 15);
  assert.equal(parseBid('lance 30'), 30);
  assert.equal(parseBid('quinze'), null);
  assert.deepEqual(parsePartyStart('abrir leilao'), { game: 'leilao', rest: '' });
  assert.deepEqual(parsePartyStart('abrir leilao de craques'), { game: 'leilao', rest: '' });
  assert.deepEqual(parsePartyStart('abrir leilao votacao'), { game: 'leilao', rest: 'votacao' });
  assert.deepEqual(parsePartyStart('abrir leilao overall'), { game: 'leilao', rest: 'overall' });
  assert.equal(leilaoModeOf('votacao'), 'votacao');
  assert.equal(leilaoModeOf('overall'), 'overall');
  const squad = [
    { name: 'a', positions: ['GOL' as const], overall: 80, price: 1 },
    { name: 'b', positions: ['DEF' as const], overall: 80, price: 1 },
  ];
  assert.equal(teamScore(squad).total, 160);
  const st = { budget: { a: 100 }, squads: { a: [] } } as unknown as LeilaoParty;
  assert.equal(maxBid(st, 'a'), 97, 'guarda 1 moeda para cada uma das outras 3 vagas');
});

/** Monta a base do leilão (4 craques por posição) e devolve as funções da partida. */
async function leilaoSetup(group: string) {
  const store = new MemoryStore();
  const records: PlayerRecord[] = [];
  let n = 0;
  for (const pos of ['GOL', 'DEF', 'MEI', 'ATA'] as const) {
    for (let i = 0; i < 4; i++) records.push(rec(`L${++n}`, `Craque ${pos} ${i + 1}`, [pos], 30 + n * 8));
  }
  await store.upsertPlayers(records);
  let id = 0;
  const deps = { store, lookup: createLookup(store, async () => null), now: () => new Date('2026-11-19T12:00:00Z'), rng: () => 0.5 };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `l${++id}`, groupJid: group, senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick(group, null, deps, true);
  const state = async () => (await store.getActiveMatch(group))?.state as LeilaoParty | undefined;
  /** Até fechar os times: em cada lote, quem ainda precisa da posição dá lance de 1. */
  const playOut = async () => {
    let out = '';
    for (let i = 0; i < 30; i++) {
      const s = await state();
      if (!s || s.phase === 'voting') break;
      const slot = s.lots[s.round].positions[0];
      const who = ['Ana', 'Bia'].find((w) => s.squads[`${w}@s`].length < 4 && !s.squads[`${w}@s`].some((x) => (x.slot ?? x.positions[0]) === slot));
      if (who) await say(who, '1');
      out = asText(await tick());
    }
    return out;
  };
  return { store, say, tick, state, playOut };
}

test('Leilão na partida: um por posição, venda no fim do tempo e resultado com o overall revelado', async () => {
  const { store, say, tick, state, playOut } = await leilaoSetup('leilao@g.us');
  await say('Ana', 'ativar jogos');
  await say('Ana', 'abrir leilão');
  await say('Bia', 'entrar');
  const start = asText(await say('Ana', 'começar'));
  assert.match(start, /Leilão de Craques\* valendo![\s\S]*1 GOL, 1 DEF, 1 MEI e 1 ATA[\s\S]*Lote 1\/12\* · \*[A-Z]+\*[\s\S]*Podem dar lance: Ana, Bia[\s\S]*30s\.[\s\S]*\[timer:31s\]/);
  assert.equal(asText(await say('Ana', '10')), '[react:💰]');
  assert.equal(asText(await say('Bia', '5')), '', 'lance menor que o atual não vale');
  assert.equal(asText(await say('Bia', '12')), '[react:💰]');
  assert.match(asText(await say('Ana', '98')), /lance máximo agora é 97/);
  const firstSlot = (await state())!.lots[0].positions[0];
  const sold = asText(await tick());
  assert.match(sold, /✅ Vendido! \*[^*]+\* para \*Bia\* por 12 \(sobram 88\)\.[\s\S]*Lote 2\/12/);
  // Um por posição: Bia não pode dar lance no próximo craque da mesma posição.
  for (let i = 0; i < 12; i++) {
    const s = (await state())!;
    if (s.lots[s.round].positions[0] === firstSlot) {
      assert.match(asText(await say('Bia', '5')), /já tem [a-z]+: é um por posição/);
      break;
    }
    await say('Ana', '1');
    await tick();
  }
  const out = await playOut();
  assert.match(out, /\[img:textBoard\][\s\S]*(Todos os times estão completos|Acabaram os lotes)[\s\S]*🏆/);
  assert.equal(await store.getActiveMatch('leilao@g.us'), null);
});

test('Leilão no modo votação: times de 1 por posição e o grupo vota (ninguém no próprio)', async () => {
  const { store, say, tick, state, playOut } = await leilaoSetup('leilaov@g.us');
  await say('Ana', 'ativar jogos');
  await say('Ana', 'abrir leilão votação');
  await say('Bia', 'entrar');
  const start = asText(await say('Ana', 'começar'));
  assert.match(start, /No fim, o grupo vota no melhor time/);
  const voting = await playOut();
  assert.match(voting, /Votação!\* Qualquer pessoa do grupo manda o número do melhor time \(1 a 2\)/);
  const s = (await state())!;
  assert.equal(s.phase, 'voting');
  for (const w of ['Ana@s', 'Bia@s']) {
    const slots = s.squads[w].map((x) => x.slot ?? x.positions[0]);
    assert.equal(new Set(slots).size, slots.length, 'nenhuma posição repetida no time');
  }
  assert.match(asText(await say('Ana', '1')), /não vale votar no próprio time/);
  assert.equal(asText(await say('Ana', '2')), '[react:✅]');
  assert.equal(asText(await say('Caio', '2')), '[react:✅]', 'quem não jogou também vota');
  assert.equal(asText(await say('Caio', '1')), '', 'um voto por pessoa');
  const result = asText(await tick());
  assert.match(result, /\[img:textBoard\][\s\S]*🏆 \*Bia\* montou o melhor time \(2 votos\)[\s\S]*2\. Bia — 2 votos/);
  assert.equal(await store.getActiveMatch('leilaov@g.us'), null);
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

test('resposta com artigo no começo é aceita com ou sem o artigo (Emoji, Top 100)', async () => {
  const { answerMatches, normalizeAnswer } = await import('../src/lib/party/common');
  const { matchTop100 } = await import('../src/lib/party/top100');
  const { getTop100 } = await import('../src/lib/party/content/top100');
  assert.ok(answerMatches(['O Rei Leão'], normalizeAnswer('o rei leão')));
  assert.ok(answerMatches(['O Rei Leão'], normalizeAnswer('rei leao')));
  assert.ok(answerMatches(['A Bela e a Fera'], normalizeAnswer('A bela e a fera')));
  const musicas = getTop100('rs-100-musicas')!;
  const banda = musicas.items.findIndex((it) => it.name === 'A Banda');
  assert.deepEqual(matchTop100(musicas, 'a banda'), [banda]);
  assert.deepEqual(matchTop100(musicas, 'banda'), [banda]);
});
