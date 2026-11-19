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

test('regra nova: 1 palpite por pessoa; acertou +100, o primeiro +50; todos palpitaram fecha a rodada', async () => {
  const { say, state } = setup();
  const out = await start(say);
  assert.match(out, /Intruso\* valendo![\s\S]*img:intrusoBoard[\s\S]*Rodada 1\/6 · Quem é o intruso\?[\s\S]*1 palpite por pessoa[\s\S]*timer:46s/);
  const s = await state();
  const right = L[s.intruderIndex];
  const wrong = L[(s.intruderIndex + 1) % 5];
  assert.equal(asText(await say('Bia', wrong)), '[react:🔒]', 'confirma sem dizer se acertou');
  assert.equal(asText(await say('Bia', right)), '', 'segundo palpite é ignorado');
  const reveal = asText(await say('Ana', right));
  assert.match(reveal, /Todos palpitaram\.[\s\S]*O intruso era \*[A-E]\) [^*]+\*\.[\s\S]*Por quê:[\s\S]*Acertaram: Ana \+150 \(primeiro\)[\s\S]*Erraram: Bia/);
  const after = await state();
  assert.equal(after.players.find((p) => p.name === 'Ana')!.score, 150);
  assert.equal(after.players.find((p) => p.name === 'Bia')!.score, 0);
});

test('tempo esgotado revela; ninguém palpitou: ninguém pontua; nome também vale como palpite', async () => {
  const { say, tick, state } = setup();
  await start(say);
  const s = await state();
  const timeout = asText(await tick());
  assert.match(timeout, new RegExp(`Tempo esgotado\\.[\\s\\S]*O intruso era \\*${L[s.intruderIndex]}\\) [\\s\\S]*Ninguém acertou\\.`));
  // Nos testes não há pausa: a próxima rodada já abriu. Palpite pelo nome.
  const s2 = await state();
  const name = s2.options[s2.intruderIndex];
  assert.equal(asText(await say('Ana', name)), '[react:🔒]');
  const r = asText(await say('Bia', name));
  assert.match(r, /Acertaram: Ana \+150 \(primeiro\) · Bia \+100/);
});
