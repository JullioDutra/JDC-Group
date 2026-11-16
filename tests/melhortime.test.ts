import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { MelhorTimeParty, Outgoing } from '../src/lib/game/types';
import type { TeamJudge } from '../src/lib/party/common';
import { parsePartyStart } from '../src/lib/party/engine';
import { parseDraftPick } from '../src/lib/party/melhortime';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

const G = 'mt@g.us';
const CLUBS = ['sao-paulo', 'barcelona', 'real-madrid', 'flamengo', 'santos', 'chelsea'];

function setup(judge?: TeamJudge) {
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date('2026-11-16T12:00:00Z'), judge };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick(G, null, deps, true);
  const state = async () => (await store.getActiveMatch(G))!.state as MelhorTimeParty;
  /** Fixa os clubes sorteados para o teste ser previsível. */
  const fixClubs = async () => {
    const m = (await store.getActiveMatch(G))!;
    (m.state as MelhorTimeParty).clubs = CLUBS;
    await store.saveMatch(m);
  };
  return { store, say, tick, state, fixClubs };
}

/** Joga as 6 rodadas: algumas escolhas válidas e duas vagas por tempo esgotado. */
async function draft(say: (w: string, t: string) => Promise<Outgoing[]>, tick: () => Promise<Outgoing[]>) {
  await say('Ana', 'goleiro Ceni');            // R1 São Paulo (Ana abre)
  await say('Bia', 'Kaká meia');
  await say('Bia', 'goleiro Ter Stegen');      // R2 Barcelona (Bia abre)
  await say('Ana', 'zagueiro Piqué');
  await say('Ana', 'Sergio Ramos');            // R3 Real Madrid: posição deduzida (DEF)
  await say('Bia', 'Marcelo zagueiro');
  await say('Bia', 'atacante Romário');        // R4 Flamengo
  await say('Ana', 'meia Zico');
  await say('Ana', 'atacante Pelé');           // R5 Santos
  await tick();                                // Bia não tem vaga de atacante: tempo esgotado
  await say('Bia', 'meia Lampard');            // R6 Chelsea (Bia abre): os dois só têm vaga de meia
  return asText(await say('Ana', 'De Bruyne')); // posição deduzida (MEI) → julgamento
}

test('comandos e leitura de "posição + nome" em qualquer ordem', () => {
  assert.deepEqual(parsePartyStart('iniciar melhor time'), { game: 'melhortime', rest: '' });
  assert.deepEqual(parsePartyStart('iniciar melhor time votacao'), { game: 'melhortime', rest: 'votacao' });
  assert.deepEqual(parseDraftPick('atacante Dzeko'), { position: 'ATA', name: 'Dzeko' });
  assert.deepEqual(parseDraftPick('Alex meia'), { position: 'MEI', name: 'Alex' });
  assert.deepEqual(parseDraftPick('lateral esquerdo Roberto Carlos'), { position: 'DEF', name: 'Roberto Carlos' });
  assert.deepEqual(parseDraftPick('Lugano'), { position: null, name: 'Lugano' });
});

test('desafio 1 x 1: aceitar começa; clube da rodada, posição livre, sem repetir', async () => {
  const { say, fixClubs } = setup();
  await say('Ana', 'ativar jogos');
  assert.match(asText(await say('Ana', 'iniciar melhor time')), /img:partyLobby[\s\S]*Desafio: Melhor Time[\s\S]*Juiz: a IA/);
  assert.match(asText(await say('Ana', 'aceitar')), /não pode aceitar o próprio desafio/);
  const start = asText(await say('Bia', 'aceitar'));
  assert.match(start, /Bia\* aceitou[\s\S]*img:draftBoard[\s\S]*Rodada 1\/6 · Clube: [\s\S]*\*Ana\*, escolha[\s\S]*Suas vagas: GOL, DEF x2, MEI x2, ATA/);
  assert.deepEqual(await say('Caio', 'aceitar'), [], 'terceiro não entra');
  await fixClubs();

  assert.match(asText(await say('Bia', 'Kaká')), /agora é a vez de \*Ana\*/);
  assert.match(asText(await say('Ana', 'atacante Messi')), /❌ \*Ana\*: Messi não tem passagem pelo \*São Paulo\*/);
  assert.match(asText(await say('Ana', 'atacante Ceni')), /❌ \*Ana\*: Rogério Ceni é goleiro, não atacante/);
  assert.match(asText(await say('Ana', 'goleiro Ceni')), /✅ \*Ana\*: Rogério Ceni — goleiro \(São Paulo\)[\s\S]*\*Bia\*, escolha/);
  assert.match(asText(await say('Bia', 'goleiro Rogério Ceni')), /já foi escolhido nesta partida/);
  assert.match(asText(await say('Bia', 'Kaká meia')), /✅ \*Bia\*: Kaká — meia \(São Paulo\)[\s\S]*img:draftBoard[\s\S]*Rodada 2\/6 · Clube: Barcelona\*\n\*Bia\*/);
  assert.match(asText(await say('Bia', 'goleiro Ter Stegen')), /✅/);
  assert.match(asText(await say('Ana', 'goleiro Neuer')), /não tem passagem pelo \*Barcelona\*/);
  assert.match(asText(await say('Ana', 'goleiro Piqué')), /é zagueiro|é defensor/);
});

test('juiz IA: decide com justificativa e grava o ranking', async () => {
  const judge: TeamJudge = async (teams) => {
    assert.equal(teams[0].player, 'Ana');
    assert.equal(teams[0].lineup.length, 6);
    assert.ok(teams[0].lineup.some((l) => l.name === 'Pelé' && l.club === 'Santos'));
    return { winner: 0, reason: 'Pelé e Zico decidem.' };
  };
  const { say, tick, fixClubs, store } = setup(judge);
  await say('Ana', 'ativar jogos');
  await say('Ana', 'iniciar melhor time');
  await say('Bia', 'aceitar');
  await fixClubs();
  const end = await draft(say, tick);
  assert.match(end, /✅ \*Ana\*: De Bruyne — meia \(Chelsea\)[\s\S]*img:draftBoard[\s\S]*A IA analisou[\s\S]*🏆 \*Ana\* montou o melhor time![\s\S]*Pelé e Zico decidem\./);
  assert.deepEqual((await store.getRanking(G, 5)).map((r) => [r.name, r.wins, r.losses]), [['Ana', 1, 0], ['Bia', 0, 1]]);
});

test('sem IA configurada: vale a regra de reserva (soma do pico de valor)', async () => {
  const { say, tick, fixClubs } = setup();
  await say('Ana', 'ativar jogos');
  await say('Ana', 'iniciar melhor time');
  await say('Bia', 'aceitar');
  await fixClubs();
  const end = await draft(say, tick);
  assert.match(end, /Sem a IA ligada, valeu a soma do pico de valor de mercado: Ana \d+ mi € x \d+ mi € Bia/);
});

test('votação: só quem não jogou vota, um voto por pessoa', async () => {
  const { say, tick, fixClubs, store } = setup();
  await say('Ana', 'ativar jogos');
  await say('Ana', 'iniciar melhor time');
  await say('Ana', 'votação');
  await say('Bia', 'aceitar');
  await fixClubs();
  const open = await draft(say, tick);
  assert.match(open, /Votação aberta por 60s[\s\S]*Quem \*não\* jogou vota: mande \*1\*/);
  assert.match(asText(await say('Ana', '1')), /Quem jogou não vota/);
  assert.equal(asText(await say('Caio', '2')), '[react:✅]');
  assert.deepEqual(await say('Caio', '1'), [], 'segundo voto do Caio é ignorado');
  assert.equal(asText(await say('Duda', 'bia')), '[react:✅]', 'vale votar pelo nome');
  assert.equal(asText(await say('Edu', '1')), '[react:✅]');
  const result = asText(await tick());
  assert.match(result, /Votação encerrada[\s\S]*🏆 \*Bia\* montou o melhor time![\s\S]*Votos: Ana 1 x 2 Bia/);
  assert.equal((await store.getRanking(G, 5))[0].name, 'Bia');
});
