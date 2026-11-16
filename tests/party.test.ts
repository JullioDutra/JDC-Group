import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import { matchTop10, parsePartyStart } from '../src/lib/party/engine';
import { getTop10List } from '../src/lib/party/top10-lists';
import type { Outgoing } from '../src/lib/game/types';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

const G = 'sala@g.us';

function setup() {
  const store = new MemoryStore();
  let clock = Date.parse('2026-11-16T12:00:00Z');
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date(clock) };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick(G, null, deps, true);
  return { store, say, tick, advance: (s: number) => (clock += s * 1000) };
}

async function openEscalacao(say: (w: string, t: string) => Promise<Outgoing[]>, theme = '1', players = ['Bia', 'Caio']) {
  await say('Ana', 'ativar jogos');
  const lobby = asText(await say('Ana', 'abrir sala'));
  for (const p of players) await say(p, 'entrar');
  await say('Ana', theme);
  return { lobby, start: asText(await say('Ana', 'começar')) };
}

test('abrir sala só com comando claro (conversa normal não abre nada)', () => {
  assert.deepEqual(parsePartyStart('abrir sala'), { game: 'escalacao', rest: '' });
  assert.deepEqual(parsePartyStart('abrir sala aleatorio cego'), { game: 'escalacao', rest: 'aleatorio cego' });
  assert.equal(parsePartyStart('abrir sala de aula'), null);
  assert.deepEqual(parsePartyStart('top 10 futebol'), { game: 'top10', rest: 'futebol' });
  assert.equal(parsePartyStart('top 10 melhores do mundo'), null);
});

test('Escalação em Grupo: rodada fecha quando todos respondem; nomes repetidos não valem', async () => {
  const { say } = setup();
  const { lobby, start } = await openEscalacao(say);
  assert.match(lobby, /img:partyLobby[\s\S]*Sala aberta: Escalação em Grupo/);
  assert.match(start, /img:partyTable[\s\S]*Tema: \*Artilheiros\*[\s\S]*3 jogadores[\s\S]*Rodada 1\/6 · GOLEIRO[\s\S]*timer:61s/);

  assert.match(asText(await say('Ana', 'ceni')), /react:✅/);
  assert.deepEqual(await say('Ana', 'Neuer'), [], 'uma resposta por rodada');
  assert.match(asText(await say('Bia', 'Rogério Ceni')), /❌ \*Bia\*: Rogério Ceni já foi escalado por Ana/);
  assert.match(asText(await say('Bia', 'Messi')), /❌ \*Bia\*: \*Messi\* é atacante\/meia/);
  assert.equal(asText(await say('Bia', 'Neuer')), '[react:✅]', 'ainda falta o Caio');
  assert.deepEqual(await say('Zé', 'Alisson'), [], 'quem não entrou não joga');
  const close = asText(await say('Caio', 'Alisson'));
  assert.match(close, /react:✅[\s\S]*img:partyTable[\s\S]*Todos responderam\. Fim da rodada 1\.[\s\S]*Rodada 2\/6 · DEFENSOR/);
});

test('Escalação em Grupo: tempo esgotado dá o pior valor; partida completa grava o ranking', async () => {
  const { say, tick, store } = setup();
  await openEscalacao(say);
  const rounds: Array<Array<[string, string]>> = [
    [['Ana', 'ceni'], ['Bia', 'neuer']],
    [['Ana', 'Sergio Ramos'], ['Bia', 'Marcelo']],
    [['Ana', 'Koeman'], ['Bia', 'Roberto Carlos']],
    [['Ana', 'Zico'], ['Bia', 'Kaká']],
    [['Ana', 'Lampard'], ['Bia', 'Iniesta']],
    [['Ana', 'Cristiano Ronaldo'], ['Bia', 'Pelé']],
  ];
  let last = '';
  for (const [i, round] of rounds.entries()) {
    for (const [who, name] of round) last = asText(await say(who, name));
    // Caio nunca responde. Nas 2 primeiras rodadas o tempo fecha a rodada;
    // depois disso ele vira ausente e a rodada fecha quando Ana e Bia respondem.
    if (!/Fim da rodada|venceu/.test(last)) last = asText(await tick());
    if (i === 0) assert.match(last, /Tempo esgotado\. Fim da rodada 1\.[\s\S]*Sem resposta \(pior valor do tema\): Caio/);
    if (i === 2) assert.match(last, /Todos responderam\. Fim da rodada 3/);
  }
  assert.match(last, /🏆 \*Ana\* venceu com 2\.291 gols\.\n1º Ana — 2\.291 gols\n2º Bia — 1\.258 gols\n3º Caio — 0 gols/);
  const ranking = await store.getRanking(G, 10);
  assert.deepEqual(ranking.map((r) => [r.name, r.wins, r.losses]), [['Ana', 1, 0], ['Bia', 0, 1], ['Caio', 0, 1]]);
  assert.equal(await store.getActiveMatch(G), null);
});

test('ausente por 2 rodadas sai da conta de "todos": a rodada não trava', async () => {
  const { say, tick } = setup();
  await openEscalacao(say);
  await say('Ana', 'ceni'); await say('Bia', 'neuer'); await tick();          // Caio falta 1
  await say('Bia', 'Marcelo'); await say('Ana', 'Sergio Ramos'); await tick(); // Caio falta 2 -> ausente
  await say('Ana', 'Koeman');
  const out = asText(await say('Bia', 'Roberto Carlos'));
  assert.match(out, /Todos responderam\. Fim da rodada 3/);
});

test('entrada tardia só até a 2ª rodada; sala tem limite de 10', async () => {
  const { say } = setup();
  await openEscalacao(say);
  assert.match(asText(await say('Davi', 'entrar')), /react:✅/, 'rodada 1: pode entrar');
  await say('Ana', 'ceni'); await say('Bia', 'neuer'); await say('Caio', 'Alisson');
  await say('Davi', 'Ter Stegen');
  assert.match(asText(await say('Edu', 'entrar')), /react:✅/, 'rodada 2: ainda pode');
  for (const [who, name] of [['Ana', 'Sergio Ramos'], ['Bia', 'Marcelo'], ['Caio', 'Piqué'], ['Davi', 'Roberto Carlos'], ['Edu', 'Koeman']]) {
    await say(who, name);
  }
  assert.match(asText(await say('Fabi', 'entrar')), /As inscrições fecharam \(só dava para entrar até a 2ª rodada\)/);
  assert.deepEqual(await say('Fabi', 'entrar'), [], 'avisa uma vez só');

  const big = setup();
  await big.say('Ana', 'ativar jogos');
  await big.say('Ana', 'abrir sala');
  for (let i = 1; i <= 9; i++) await big.say(`J${i}`, 'entrar');
  assert.match(asText(await big.say('J10', 'entrar')), /Sala cheia \(10\/10\)/);
});

test('Top 10: acertos revelam a posição; ninguém responde duas vezes seguidas', async () => {
  const { say } = setup();
  await say('Ana', 'ativar jogos');
  assert.match(asText(await say('Ana', 'top 10 geral')), /Sala aberta: Top 10/);
  await say('Bia', 'entrar');
  await say('Caio', 'entrar');
  const start = asText(await say('Ana', 'começar'));
  assert.match(start, /img:top10Board[\s\S]*Top 10: Marcas de carro mais vendidas no Brasil em 2025[\s\S]*timer:241s/);

  assert.match(asText(await say('Ana', 'Renault')), /✅ \*Ana\* acertou: \*6º lugar\* — Renault \(131\.724\)/);
  assert.match(asText(await say('Ana', 'Fiat')), /\*Ana\*, espere outra pessoa responder/);
  assert.deepEqual(await say('Ana', 'Fiat'), [], 'avisa uma vez só');
  assert.equal(asText(await say('Bia', 'Ferrari')), '[react:❌]');
  assert.match(asText(await say('Caio', 'ferrari')), /já foi tentado/, 'palpite errado repetido não vale');
  assert.match(asText(await say('Caio', 'a renault')), /já foi revelado \(6º lugar\)/);
  assert.match(asText(await say('Caio', 'VW')), /✅ \*Caio\* acertou: \*2º lugar\* — Volkswagen/);
  assert.match(asText(await say('Ana', 'Fiat')), /1º lugar/, 'depois de outra pessoa, Ana pode de novo');
});

test('Top 10: lista completa encerra e grava o ranking; tempo esgotado revela o resto', async () => {
  const { say, tick, store } = setup();
  await say('Ana', 'ativar jogos');
  await say('Ana', 'top 10 geral');
  await say('Bia', 'entrar');
  await say('Ana', 'começar');
  const names = ['Fiat', 'Volkswagen', 'Chevrolet', 'Hyundai', 'Toyota', 'Renault', 'Jeep', 'BYD', 'Honda', 'Nissan'];
  let out = '';
  for (const [i, n] of names.entries()) out = asText(await say(i % 2 ? 'Bia' : 'Ana', n));
  assert.match(out, /Lista completa![\s\S]*Empate: \*Ana\* e \*Bia\*|Lista completa![\s\S]*venceu com 5 acertos/);
  assert.equal((await store.getRanking(G, 5)).length, 2);

  const t = setup();
  await t.say('Ana', 'ativar jogos');
  await t.say('Ana', 'top 10 futebol');
  await t.say('Bia', 'entrar');
  await t.say('Ana', 'começar');
  await t.say('Bia', 'Brasil');
  const end = asText(await t.tick());
  assert.match(end, /img:top10Board[\s\S]*Tempo esgotado\.[\s\S]*🏆 \*Bia\* venceu com 1 acerto/);
});

test('Top 10: tolera erro de digitação em nomes longos, mas não em curtos', () => {
  const list = getTop10List('estados-populosos-2022')!;
  assert.equal(matchTop10(list, 'Minas Gerias'), 1);
  assert.equal(matchTop10(list, 'Rio Grande do Sull'), 5);
  assert.equal(matchTop10(list, 'Pa'), 8);
  assert.equal(matchTop10(list, 'Paris'), -1);
});

test('emojis só nos pontos previstos', async () => {
  const { say, tick } = setup();
  const all: string[] = [];
  const log = async (p: Promise<Outgoing[]>) => all.push(asText(await p));
  await log(say('Ana', 'ativar jogos'));
  await log(say('Ana', 'ajuda'));
  await log(say('Ana', 'regras'));
  await log(say('Ana', 'abrir sala aleatorio'));
  await log(say('Bia', 'entrar'));
  await log(say('Ana', 'começar'));
  await log(say('Ana', 'ceni'));
  await log(say('Bia', 'Pelé'));
  await log(tick());
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{23E9}-\u{23FA}]/gu;
  const found = new Set(all.join('\n').match(emoji) ?? []);
  for (const e of found) assert.ok(['✅', '❌', '🏆', '🎲'].includes(e), `emoji inesperado: ${e}`);
});
