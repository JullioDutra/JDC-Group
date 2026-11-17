import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { IntrusoParty, Outgoing } from '../src/lib/game/types';
import { INTRUSO_SETS } from '../src/lib/party/content/intruso';
import { parsePartyStart } from '../src/lib/party/engine';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

const G = 'intruso@g.us';
const L = ['A', 'B', 'C', 'D', 'E'];

function setup() {
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date('2026-11-16T12:00:00Z') };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick(G, null, deps, true);
  const state = async () => (await store.getActiveMatch(G))!.state as IntrusoParty;
  return { say, tick, state, store };
}

async function start(say: (w: string, t: string) => Promise<Outgoing[]>) {
  await say('Ana', 'ativar jogos');
  await say('Ana', 'abrir intruso');
  await say('Bia', 'entrar');
  return asText(await say('Ana', 'começar'));
}

test('conteúdo do Intruso: 4 membros + 1 intruso + motivo, ids únicos', () => {
  assert.equal(new Set(INTRUSO_SETS.map((s) => s.id)).size, INTRUSO_SETS.length);
  for (const s of INTRUSO_SETS) {
    assert.equal(s.members.length, 4, s.id);
    assert.ok(!s.members.includes(s.intruder), s.id);
    assert.ok(s.reason.length > 20, s.id);
  }
  assert.deepEqual(parsePartyStart('abrir intruso'), { game: 'intruso', rest: '' });
  assert.equal(parsePartyStart('intruso'), null);
});

test('X aparece na hora, sem dizer se está certo; ninguém marca duas vezes seguidas', async () => {
  const { say, state } = setup();
  const out = await start(say);
  assert.match(out, /Intruso\* valendo![\s\S]*img:intrusoBoard[\s\S]*Rodada 1\/5 · Quem é o intruso\?[\s\S]*timer:76s/);

  const s = await state();
  const members = s.options.map((_, i) => i).filter((i) => i !== s.intruderIndex);
  const first = asText(await say('Ana', L[members[0]].toLowerCase()));
  assert.match(first, new RegExp(`\\*Ana\\* marcou X em \\*${L[members[0]]}\\) ${s.options[members[0]]}\\*`));
  assert.match(first, new RegExp(`${L[members[0]]}\\) ~${s.options[members[0]]}~  X \\(Ana\\)`), 'quadro mostra o X e o nome riscado');
  assert.doesNotMatch(first, /certo|errado|intruso era/i, 'não revela nada antes do fim');

  assert.match(asText(await say('Ana', L[members[1]])), /espere outra pessoa marcar/);
  assert.match(asText(await say('Bia', L[members[0]])), /já está marcado/);
});

test('sobrou o intruso: revela X certos, "Certo!", justificativa e bônus', async () => {
  const { say, state } = setup();
  await start(say);
  const s = await state();
  const members = s.options.map((_, i) => i).filter((i) => i !== s.intruderIndex);
  await say('Ana', L[members[0]]);
  await say('Bia', L[members[1]]);
  await say('Ana', L[members[2]]);
  const reveal = asText(await say('Bia', s.options[members[3]]));
  assert.match(reveal, new RegExp(`img:intrusoBoard[\\s\\S]*Certo! Sobrou \\*${s.options[s.intruderIndex]}\\*, e ele era o intruso\\.`));
  assert.match(reveal, /Por quê: Os outros quatro/);
  assert.match(reveal, /Pontos: Ana \+160 · Bia \+160/, '2 X certos (100) + bônus do grupo (30 por X)');
  assert.match(reveal, /Rodada 2\/5/);
});

test('marcou X no intruso: revela "Errado" e quem marcou; tempo esgotado também revela', async () => {
  const { say, state, tick } = setup();
  await start(say);
  let s = await state();
  const members = s.options.map((_, i) => i).filter((i) => i !== s.intruderIndex);
  await say('Ana', L[s.intruderIndex]);
  await say('Bia', L[members[0]]);
  await say('Ana', L[members[1]]);
  const reveal = asText(await say('Bia', L[members[2]]));
  assert.match(reveal, new RegExp(`Errado: o intruso era \\*${s.options[s.intruderIndex]}\\*, e Ana marcou X nele\\.`));
  assert.match(reveal, /Pontos: Ana \+0 · Bia \+100|Pontos: Ana 0 · Bia \+100/);

  s = await state();
  const timeout = asText(await tick());
  assert.match(timeout, new RegExp(`Tempo esgotado\\. O intruso era \\*${s.options[s.intruderIndex]}\\*\\.[\\s\\S]*Por quê:`));
});
