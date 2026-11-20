import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalize } from '../src/lib/game/text';
import { EMOJI_CARDS, RELAMPAGO_CARDS } from '../src/lib/party/content/cards';
import { CHUTE_QUESTIONS } from '../src/lib/party/content/chute';
import { CONEXOES } from '../src/lib/party/content/conexoes';
import { FACTS } from '../src/lib/party/content/fato';
import { INTRUSO_SETS } from '../src/lib/party/content/intruso';
import { TIMELINE } from '../src/lib/party/content/linha';
import { SURVIVOR_LISTS } from '../src/lib/party/content/sobrevivente';
import { WHOIS } from '../src/lib/party/content/whois';
import { parsePartyStart } from '../src/lib/party/engine';

type WithCategory = { id: string; category?: string };
const count = (xs: WithCategory[], cat: string) => xs.filter((x) => (x.category ?? 'futebol') === cat).length;

test('Rodada 10: conteúdo fora do futebol em todos os jogos com outros assuntos', () => {
  const min: Array<[string, WithCategory[], Record<string, number>]> = [
    ['Quem é?', WHOIS, { geral: 30, historia: 28, anime: 16 }],
    ['Emoji', EMOJI_CARDS, { geral: 75, anime: 20 }],
    ['Relâmpago', RELAMPAGO_CARDS, { geral: 100, historia: 40, anime: 15 }],
    ['Fato ou Fake', FACTS, { geral: 80, historia: 30, anime: 12 }],
    ['Chute Certo', CHUTE_QUESTIONS, { geral: 55, historia: 30, anime: 8 }],
    ['Linha do Tempo', TIMELINE, { geral: 70, historia: 70 }],
    ['Intruso', INTRUSO_SETS, { geral: 45, historia: 12, anime: 8 }],
    ['Conexões', CONEXOES, { geral: 22, historia: 4, anime: 3 }],
    ['Sobrevivente', SURVIVOR_LISTS, { geral: 40, historia: 3, anime: 5 }],
  ];
  for (const [game, pool, need] of min) {
    assert.equal(new Set(pool.map((x) => x.id)).size, pool.length, `${game}: id repetido`);
    for (const [cat, n] of Object.entries(need)) assert.ok(count(pool, cat) >= n, `${game} ${cat}: ${count(pool, cat)} < ${n}`);
  }
});

test('Rodada 10: fichas, intrusos e cartas bem formados', () => {
  for (const w of WHOIS) {
    assert.equal(w.clues.length, 5, w.id);
    // A resposta não aparece nas três primeiras dicas.
    const name = normalize(w.answer);
    if (name.length > 2) for (const c of w.clues.slice(0, 3)) assert.ok(!normalize(c).includes(name), `${w.id}: "${w.answer}" na dica "${c}"`);
  }
  for (const s of INTRUSO_SETS) {
    assert.equal(s.members.length, 4, s.id);
    assert.ok(!s.members.map(normalize).includes(normalize(s.intruder)), `${s.id}: intruso entre os membros`);
    assert.ok(s.reason.length > 20, s.id);
  }
  for (const c of [...EMOJI_CARDS, ...RELAMPAGO_CARDS]) assert.ok(c.answer.trim() && c.prompt.trim(), c.id);
  for (const q of CHUTE_QUESTIONS) assert.ok(Number.isFinite(q.answer), q.id);
  // Emoji: o prompt não entrega a resposta por escrito.
  for (const c of EMOJI_CARDS) assert.ok(!normalize(c.prompt).includes(normalize(c.answer)), `${c.id} entrega a resposta`);
});

test('Rodada 10: Intruso aceita história e anime no comando', () => {
  assert.deepEqual(parsePartyStart('abrir intruso historia'), { game: 'intruso', rest: 'historia' });
  assert.deepEqual(parsePartyStart('abrir intruso anime'), { game: 'intruso', rest: 'anime' });
  assert.deepEqual(parsePartyStart('abrir intruso'), { game: 'intruso', rest: '' });
});
