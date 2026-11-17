import assert from 'node:assert/strict';
import { test } from 'node:test';
process.env.PARTY_PAUSE = '12'; // este arquivo testa a pausa de verdade
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import { isChatter, looksLikePlayerName } from '../src/lib/game/text';
import { MODES } from '../src/lib/game/modes';
import { clubsIn, getTeam } from '../src/lib/game/teams';
import { drawRestrictions } from '../src/lib/game/validate';
import { describeContext } from '../src/lib/players/lookup';
import type { Outgoing, QuizParty } from '../src/lib/game/types';
import { getCard } from '../src/lib/party/content/cards';
import { MemoryStore } from '../src/lib/store/memory';
import { isAdminJid } from '../src/lib/owners';
import { asText } from './helpers';

process.env.PARTY_PAUSE = '12';
const G = 'pausa@g.us';

function setup() {
  const store = new MemoryStore();
  let id = 0;
  let t = Date.parse('2026-11-17T12:00:00Z');
  const deps = () => ({ store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date(t) });
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps());
  const tick = () => handleTick(G, null, deps(), true);
  const advance = (s: number) => (t += s * 1000);
  return { store, say, tick, advance };
}

async function openRelampago(say: (w: string, t: string) => Promise<Outgoing[]>) {
  await say('Ana', 'ativar jogos');
  await say('Ana', 'abrir relampago futebol');
  await say('Bia', 'entrar');
  return asText(await say('Ana', 'começar'));
}

test('pausa entre rodadas: revela, espera e "próxima" adianta', async () => {
  const { say, store } = setup();
  await openRelampago(say);
  const s = (await store.getActiveMatch(G))!.state as QuizParty;
  const card = getCard(s.order[0])!;
  const hit = asText(await say('Bia', card.answer));
  assert.match(hit, /✅ \*Bia\* acertou[\s\S]*Próxima rodada em 12s\. Para adiantar, mande \*próxima\*\.\n\[timer:13s\]$/);
  assert.doesNotMatch(hit, /Rodada 2\/10/, 'a próxima pergunta não sai junto com a revelação');
  const next = getCard(((await store.getActiveMatch(G))!.state as QuizParty).order[1])!;
  assert.deepEqual(await say('Ana', next.answer), [], 'resposta na pausa é ignorada');
  assert.match(asText(await say('Bia', 'Próxima')), /Rodada 2\/10/);
});

test('pausa acaba sozinha no prazo', async () => {
  const { say, tick } = setup();
  await openRelampago(say);
  await say('Ana', 'pular');
  assert.match(asText(await tick()), /Rodada 2\/10/);
});

test('"próxima" do anfitrião no meio da rodada revela e já abre a seguinte', async () => {
  const { say } = setup();
  await openRelampago(say);
  const out = asText(await say('Ana', 'próxima'));
  assert.match(out, /Rodada pulada pelo anfitrião\. Ninguém acertou\. Era [\s\S]*Rodada 2\/10/);
  assert.doesNotMatch(out, /Próxima rodada em/);
  assert.deepEqual(await say('Bia', 'próxima'), [], 'quem não é anfitrião não pula rodada em andamento');
});

test('conversa não gasta palpite', async () => {
  for (const msg of ['kkkkk', 'hahaha', 'rsrs', 'bom dia', 'sei la', 'eu acho que é o Pelé', 'nossa', '😂😂', 'mano que difícil', 'quem é esse', 'https://x.com', 'vish']) {
    assert.equal(isChatter(msg), true, msg);
  }
  for (const msg of ['Pelé', 'Real Madrid', '46', 'Brasil 94', 'Victor', 'Vitamina D', 'H2O', 'Laranja Mecânica']) {
    assert.equal(isChatter(msg), false, msg);
  }
  assert.equal(looksLikePlayerName('kkkk'), false);
  const { say, store } = setup();
  await openRelampago(say);
  assert.deepEqual(await say('Bia', 'kkkkkk'), []);
  assert.deepEqual(await say('Bia', 'nossa, essa é difícil'), []);
  const s = (await store.getActiveMatch(G))!.state as QuizParty;
  assert.deepEqual(s.attempts, [], 'ninguém gastou a tentativa');
});

test('admin reconhecido pelo @lid quando a Evolution manda os dois ids', async () => {
  assert.ok(isAdminJid('5562993259733@s.whatsapp.net', ['62993259733']));
  const store = new MemoryStore();
  const deps = { store, lookup: createLookup(store, lookupDemo), canManageGroup: (jid: string) => isAdminJid(jid, ['5562993259733']) };
  const out = await handleMessage(
    { id: 'x1', groupJid: 'outro@g.us', senderJid: '123456789012345@lid', senderAliases: ['123456789012345@lid', '556293259733@s.whatsapp.net'], senderName: 'Jullio', text: 'ativar jogos' },
    deps,
  );
  assert.match(asText(out), /ativado neste grupo/);
});

test('contexto da jogada vai para a IA; temas regionais sorteiam clubes da região', async () => {
  assert.equal(describeContext({ position: 'GOL', kind: 'club', teamId: 'atletico-mg' }), 'goleiro que jogou no Atlético-MG');
  assert.equal(describeContext({ position: 'ATA', kind: 'country', teamId: 'argentina' }), 'atacante da seleção de Argentina');
  const seen: Array<string | undefined> = [];
  const store = new MemoryStore();
  const lookup = createLookup(store, async (q, hint) => (seen.push(hint), null));
  await lookup('Victor', { position: 'GOL', kind: 'club', teamId: 'atletico-mg' });
  await lookup('Victor');
  assert.deepEqual(seen, ['goleiro que jogou no Atlético-MG', undefined], 'com e sem contexto são consultas separadas');
  const br = new Set(clubsIn('br').map((t) => t.id));
  const brasileirao = MODES.find((m) => m.id === 'brasileirao')!;
  for (let i = 0; i < 10; i++) {
    const rs = drawRestrictions(brasileirao, Math.random, true);
    assert.ok(rs.every((r) => r.kind === 'club' && br.has(r.teamId!)), rs.map((r) => getTeam(r.teamId)?.name).join(', '));
  }
});
