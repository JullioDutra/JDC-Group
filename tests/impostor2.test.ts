import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { ImpostorParty, Outgoing } from '../src/lib/game/types';
import { getImpostorSecret } from '../src/lib/party/content/impostor';
import { IMPOSTOR_POINTS, IMPOSTOR_TWO_MIN, impostorsOf } from '../src/lib/party/impostor';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

const lcg = (seed: number) => () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const PEOPLE = ['Ana', 'Bia', 'Caio', 'Duda', 'Edu', 'Fabi', 'Gui', 'Hugo'];

/** Mesa de N pessoas (Ana é a anfitriã), com o comando de abertura e um comando opcional no saguão. */
async function table(n: number, open = 'abrir impostor', lobby?: string, seed = 11) {
  const store = new MemoryStore();
  const G = `imp2-${seed}-${n}@g.us`;
  let id = 0;
  const deps = { store, lookup: createLookup(store, async () => null), now: () => new Date('2026-11-22T12:00:00Z'), rng: lcg(seed) };
  const say = (who: string, text: string) =>
    handleMessage({ id: `i${++id}`, groupJid: G, senderJid: `${who}@s.whatsapp.net`, senderName: who, text }, deps);
  const tick = () => handleTick(G, null, deps, true);
  const state = async () => (await store.getActiveMatch(G))?.state as ImpostorParty;
  await say('Ana', 'ativar jogos');
  await say('Ana', open);
  for (const p of PEOPLE.slice(1, n)) await say(p, 'entrar');
  const lobbyOut = lobby ? await say('Ana', lobby) : [];
  const start = await say('Ana', 'começar');
  const name = (jid: string) => jid.split('@')[0];
  /** Passa o tempo até a fase pedida (dicas e debate correm pelo prazo). */
  const until = async (phase: ImpostorParty['phase']) => {
    for (let i = 0; i < 40 && (await state()).phase !== phase; i++) await tick();
    assert.equal((await state()).phase, phase);
  };
  /** Todo mundo que pode votar vota no alvo (o alvo vota no primeiro outro da cédula). */
  const voteAll = async (target: string) => {
    const s = await state();
    const no = String(s.ballot.indexOf(target) + 1);
    const out: Outgoing[] = [];
    for (const jid of s.ballot) {
      if (jid === target) {
        const other = s.ballot.find((j) => j !== target)!;
        out.push(...(await say(name(jid), String(s.ballot.indexOf(other) + 1))));
      } else out.push(...(await say(name(jid), no)));
    }
    return out;
  };
  return { say, tick, state, start, lobbyOut, name, until, voteAll };
}

test('2 impostores: pedido no comando ou no saguão; só vale com 7 ou mais', async () => {
  // Pedido no comando, com 7 na mesa: 2 impostores diferentes, ninguém deles abre a 1ª volta.
  const t = await table(7, 'abrir impostor filmes 2 impostores');
  let s = await t.state();
  assert.equal(s.theme, 'filme');
  assert.equal(impostorsOf(s).length, 2);
  assert.notEqual(impostorsOf(s)[0], impostorsOf(s)[1]);
  assert.ok(!impostorsOf(s).includes(s.order[0]), 'impostor não abre a 1ª volta');
  assert.match(asText(t.start), /7 jogadores, 2 impostores/);
  // Cartas: os 2 impostores sabem que são 2 (mas não quem é o outro); os outros são avisados.
  const dms = t.start.filter((o): o is Extract<Outgoing, { type: 'dm' }> => o.type === 'dm');
  assert.equal(dms.length, 7);
  const secret = getImpostorSecret(s.secretId)!;
  for (const d of dms) {
    if (impostorsOf(s).includes(d.to)) {
      assert.match(d.text, /UM DOS 2 IMPOSTORES/);
      assert.doesNotMatch(d.text, new RegExp(secret.name));
      for (const other of impostorsOf(s)) assert.ok(!d.text.includes(t.name(other)), 'não entrega o parceiro');
    } else assert.match(d.text, /2 impostores/);
  }

  // Pedido no saguão com 4 na mesa: avisa e começa com 1.
  const small = await table(4, 'abrir impostor', '2 impostores');
  assert.match(asText(small.lobbyOut), /se tiver 7 ou mais/);
  s = await small.state();
  assert.equal(impostorsOf(s).length, 1);
  assert.match(asText(small.start), /4 jogadores, 1 impostor[\s\S]*2 impostores só com 7/);

  // Sem pedir, com 7: 1 impostor e a dica da opção.
  const plain = await table(IMPOSTOR_TWO_MIN);
  assert.equal(impostorsOf(await plain.state()).length, 1);
  assert.match(asText(plain.start), /Dica: com 7 ou mais dá para jogar com \*2 impostores\*/);

  // "1 impostor" desliga.
  const off = await table(7, 'abrir impostor 2 impostores', '1 impostor');
  assert.equal(impostorsOf(await off.state()).length, 1);
});

test('2 impostores: pegou um, ele erra o segredo, nova votação; pegou o outro = vitória do grupo', async () => {
  const t = await table(8, 'abrir impostor', '2 impostores');
  const [a, b] = impostorsOf(await t.state());
  await t.until('voting');
  let s = await t.state();
  const players = s.players.map((p) => p.jid);
  // 1ª votação: todo mundo em A.
  let out = await t.voteAll(a);
  assert.match(asText(out), /Pegaram um impostor[\s\S]*ainda tem \*1 impostor\* na mesa/);
  assert.equal((await t.state()).phase, 'guess');
  // A erra o segredo: nova votação sem A na cédula, e A não vota mais.
  out = await t.say(t.name(a), 'Batman');
  assert.match(asText(out), /não é o segredo[\s\S]*Ainda tem \*1 impostor\* na mesa! Nova votação/);
  s = await t.state();
  assert.equal(s.phase, 'voting');
  assert.ok(!s.ballot.includes(a), 'impostor pego sai da cédula');
  assert.equal(asText(await t.say(t.name(a), '1')), '', 'impostor pego não vota');
  // 2ª votação: todo mundo em B; B não chuta a tempo.
  out = await t.voteAll(b);
  assert.match(asText(out), /Pegaram um impostor/);
  const end = asText(await t.tick());
  assert.match(end, /Vitória do grupo/);
  for (const jid of players) {
    const line = new RegExp(`\\+\\d+ ${t.name(jid)}\\b`);
    if (jid === a || jid === b) assert.doesNotMatch(end, line, `${t.name(jid)} (impostor) perdeu`);
    else assert.match(end, new RegExp(`\\+${IMPOSTOR_POINTS.rightVote} ${t.name(jid)}\\b`), `${t.name(jid)} votou certo`);
  }
});

test('2 impostores: depois de pegar um, votar num inocente = impostores vencem (+5 quem escapou, +2 o parceiro pego)', async () => {
  const t = await table(8, 'abrir impostor', '2 impostores', 23);
  const [a, b] = impostorsOf(await t.state());
  await t.until('voting');
  await t.voteAll(a);
  await t.tick(); // A não chuta a tempo: nova votação
  let s = await t.state();
  assert.equal(s.phase, 'voting');
  const innocent = s.ballot.find((j) => j !== b)!;
  const end = asText(await t.voteAll(innocent));
  assert.match(end, /era INOCENTE[\s\S]*Os impostores eram[\s\S]*eles vencem a rodada/);
  assert.match(end, new RegExp(`\\+${IMPOSTOR_POINTS.escaped} ${t.name(b)}\\b`));
  assert.match(end, new RegExp(`\\+${IMPOSTOR_POINTS.partner} ${t.name(a)}\\b`));
  for (const jid of s.players.map((p) => p.jid)) if (jid !== a && jid !== b) assert.doesNotMatch(end, new RegExp(`\\+\\d+ ${t.name(jid)}\\b`));
});

test('2 impostores: o pego acerta o segredo e rouba para os dois (+4 e +2 o parceiro)', async () => {
  const t = await table(7, 'abrir impostor 2 impostores', undefined, 31);
  const [a, b] = impostorsOf(await t.state());
  await t.until('voting');
  await t.voteAll(b);
  const secret = getImpostorSecret((await t.state()).secretId)!;
  const end = asText(await t.say(t.name(b), secret.name.toLowerCase()));
  assert.match(end, /rouba a vitória para os impostores/);
  assert.match(end, new RegExp(`\\+${IMPOSTOR_POINTS.stole} ${t.name(b)}\\b`));
  assert.match(end, new RegExp(`\\+${IMPOSTOR_POINTS.partner} ${t.name(a)}\\b`));
});
