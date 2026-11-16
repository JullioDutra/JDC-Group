import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import { normalize } from '../src/lib/game/text';
import { CLUBS, NATIONS } from '../src/lib/game/teams';
import type { AlfabetoParty, ChuteParty, Outgoing, QuizParty } from '../src/lib/game/types';
import { CHUTE_QUESTIONS, getChute } from '../src/lib/party/content/chute';
import { EMOJI_CARDS, RELAMPAGO_CARDS, getCard } from '../src/lib/party/content/cards';
import { INTRUSO_SETS } from '../src/lib/party/content/intruso';
import { LINEUPS } from '../src/lib/party/content/lineups';
import { WHOIS } from '../src/lib/party/content/whois';
import { parseNumber } from '../src/lib/party/chute';
import { parsePartyStart } from '../src/lib/party/engine';
import { TOP10_LISTS } from '../src/lib/party/top10-lists';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

const G = 'novos@g.us';

function setup() {
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date('2026-11-16T12:00:00Z') };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick(G, null, deps, true);
  const session = async () => (await store.getActiveMatch(G))!;
  return { store, say, tick, session };
}

async function open(say: (w: string, t: string) => Promise<Outgoing[]>, command: string) {
  await say('Ana', 'ativar grupo');
  await say('Ana', command);
  await say('Bia', 'entrar');
  return asText(await say('Ana', 'começar'));
}

test('repertório: tamanho e integridade do conteúdo', () => {
  const ids = (xs: Array<{ id: string }>) => new Set(xs.map((x) => x.id)).size === xs.length;
  assert.ok(CLUBS.length >= 160 && NATIONS.length >= 50, `clubes ${CLUBS.length}, seleções ${NATIONS.length}`);
  assert.ok(ids(CLUBS) && ids(NATIONS) && ids(TOP10_LISTS) && ids(INTRUSO_SETS) && ids(WHOIS) && ids(LINEUPS));
  assert.ok(ids([...EMOJI_CARDS, ...RELAMPAGO_CARDS]) && ids(CHUTE_QUESTIONS));
  assert.ok(TOP10_LISTS.length >= 30 && INTRUSO_SETS.length >= 40 && WHOIS.length >= 45 && LINEUPS.length >= 30);
  assert.ok(EMOJI_CARDS.length >= 30 && RELAMPAGO_CARDS.length >= 35 && CHUTE_QUESTIONS.length >= 45);
  for (const l of TOP10_LISTS) {
    const names = l.items.map((i) => normalize(i.name));
    assert.equal(new Set(names).size, names.length, `item repetido em ${l.id}`);
    assert.ok(l.items.every((it, i) => i === 0 || it.rank >= l.items[i - 1].rank), `posições fora de ordem em ${l.id}`);
  }
  for (const l of LINEUPS) assert.equal(l.lines.flat().length, 11, l.id);
  for (const cat of ['politica', 'historia', 'geral', 'futebol']) {
    assert.ok(TOP10_LISTS.some((l) => l.category === cat) || cat === 'historia', `Top 10 sem ${cat}`);
  }
});

test('comandos novos e categorias', () => {
  assert.deepEqual(parsePartyStart('abrir alfabeto'), { game: 'alfabeto', rest: '' });
  assert.deepEqual(parsePartyStart('abrir chute certo politica'), { game: 'chute', rest: 'politica' });
  assert.deepEqual(parsePartyStart('abrir emoji anime'), { game: 'emoji', rest: 'anime' });
  assert.deepEqual(parsePartyStart('jogar quiz relampago historia'), { game: 'relampago', rest: 'historia' });
  assert.deepEqual(parsePartyStart('abrir quem e historia'), { game: 'quemeh', rest: 'historia' });
  assert.deepEqual(parsePartyStart('abrir intruso politica'), { game: 'intruso', rest: 'politica' });
  assert.deepEqual(parsePartyStart('top 10 politica'), { game: 'top10', rest: 'politica' });
  assert.equal(parsePartyStart('chute certo'), null, 'precisa de "abrir"');
  assert.deepEqual(parseNumber('173.850'), 173850);
  assert.deepEqual(parseNumber('8 849'), 8849);
  assert.deepEqual(parseNumber('60,3'), 60.3);
  assert.equal(parseNumber('uns 1900'), null);
});

test('política só entra quando pedida', async () => {
  for (const [command, game] of [['abrir relampago', 'relampago'], ['abrir quem e', 'quemeh']] as const) {
    const { say, session } = setup();
    await open(say, command);
    const s = (await session()).state as QuizParty;
    assert.equal(s.game, game);
    for (const id of s.order) {
      const cat = game === 'relampago' ? getCard(id)!.category : (WHOIS.find((c) => c.id === id)!.category ?? 'futebol');
      assert.notEqual(cat, 'politica', `${command} sorteou ${id}`);
    }
  }
  const { say, session } = setup();
  await open(say, 'abrir relampago politica');
  const s = (await session()).state as QuizParty;
  assert.ok(s.order.every((id) => getCard(id)!.category === 'politica'));
});

test('Emoji / Relâmpago: corrida, 1 palpite por pessoa, o primeiro que acerta leva', async () => {
  const { say, session } = setup();
  const start = await open(say, 'abrir emoji futebol');
  assert.match(start, /Emoji\* valendo![\s\S]*Rodada 1\/8\* · O que é isso\?[\s\S]*1 palpite por pessoa/);
  const card = getCard(((await session()).state as QuizParty).order[0])!;
  assert.equal(asText(await say('Bia', 'Bayern')), '[react:❌]');
  assert.deepEqual(await say('Bia', card.answer), [], 'Bia já gastou o palpite');
  const hit = asText(await say('Ana', card.answer));
  assert.match(hit, new RegExp(`✅ \\*Ana\\* acertou: \\*${card.answer.replace(/[().-]/g, '\\$&')}\\* \\(\\+100\\)[\\s\\S]*Rodada 2\\/8`));
});

test('Alfabeto: letra + categoria, nome já usado não vale, bônus para quem responde primeiro', async () => {
  const { say, session, store } = setup();
  await open(say, 'abrir alfabeto');
  const m = await session();
  (m.state as AlfabetoParty).rounds = [
    { kind: 'pos', value: 'GOL', label: 'goleiros', letter: 'R' },
    { kind: 'club', value: 'sao-paulo', label: 'jogadores que passaram pelo São Paulo', letter: 'K' },
  ];
  (m.state as AlfabetoParty).totalRounds = 2;
  await store.saveMatch(m);

  assert.match(asText(await say('Bia', 'Neuer')), /não começa com \*R\*/);
  assert.match(asText(await say('Bia', 'Romário')), /não é dos goleiros/);
  assert.equal(asText(await say('Ana', 'Rogério Ceni')), '[react:✅]');
  assert.match(asText(await say('Bia', 'ceni')), /já foi usado/);
  const close = asText(await (await import('../src/lib/game/engine')).handleTick(G, null, { store, lookup: createLookup(store, lookupDemo), rng: () => 0 }, true));
  assert.match(close, /Tempo esgotado\. Fim da rodada 1\.\nAna: Rogério Ceni \(\+150\)\nBia: —[\s\S]*Letra \*K\*: jogadores que passaram pelo São Paulo/);
  assert.equal(asText(await say('Bia', 'Kaká')), '[react:✅]');
  const end = asText(await say('Ana', 'Kaká'));
  assert.match(end, /já foi usado/);
});

test('Chute Certo: número único, o mais perto ganha, cravou leva bônus', async () => {
  const { say, session } = setup();
  const start = await open(say, 'abrir chute certo futebol');
  assert.match(start, /Chute Certo\* valendo![\s\S]*Rodada 1\/6\* · Chute Certo/);
  const q = getChute(((await session()).state as ChuteParty).order[0])!;
  assert.equal(asText(await say('Ana', String(q.answer + 10))), '[react:✅]');
  assert.match(asText(await say('Bia', String(q.answer + 10))), /já foi dito por Ana/);
  assert.deepEqual(await say('Ana', '5'), [], 'Ana já chutou');
  const close = asText(await say('Bia', String(q.answer)));
  assert.match(close, new RegExp(`Todos chutaram\\. Resposta:[\\s\\S]*1º Bia: [\\d.]+ \\(cravou!\\) \\+150\\n2º Ana: [\\d.]+ \\+60[\\s\\S]*Rodada 2\\/6`));
});

test('categoria sem conteúdo cai na mistura (sem política)', async () => {
  const { say, session } = setup();
  await open(say, 'abrir chute certo anime');
  const s = (await session()).state as ChuteParty;
  assert.equal(s.category, null);
  assert.equal(s.order.length, 6);
  assert.ok(s.order.every((id) => getChute(id)!.category !== 'politica'));
  const h = setup();
  await open(h.say, 'abrir quem é história');
  assert.equal(((await h.session()).state as QuizParty).category, 'historia');
});
