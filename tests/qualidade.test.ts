import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalize } from '../src/lib/game/text';
import { CARDS } from '../src/lib/party/content/cards';
import { CHUTE_QUESTIONS } from '../src/lib/party/content/chute';
import { CONEXOES } from '../src/lib/party/content/conexoes';
import { FACTS } from '../src/lib/party/content/fato';
import { INTRUSO_SETS } from '../src/lib/party/content/intruso';
import { LINEUPS } from '../src/lib/party/content/lineups';
import { TIMELINE } from '../src/lib/party/content/linha';
import { SURVIVOR_LISTS } from '../src/lib/party/content/sobrevivente';
import { TOP100_LISTS } from '../src/lib/party/content/top100';
import { WHOIS } from '../src/lib/party/content/whois';
import { TOP10_LISTS } from '../src/lib/party/top10-lists';

/**
 * Qualidade do conteúdo (rodada 15): regras que valem para todo item, novo ou
 * antigo. Cada uma nasceu de um erro real (dica que entregava a resposta,
 * item que valia em dois grupos...). Conteúdo novo que quebrar uma regra
 * para o teste aqui.
 */

const word = (needle: string, hay: string) => new RegExp(`\\b${needle}\\b`).test(hay);

test('Qualidade: ids únicos em cada jogo', () => {
  const all = { emoji: CARDS.emoji, relampago: CARDS.relampago, fato: FACTS, quemEh: WHOIS, linha: TIMELINE, intruso: INTRUSO_SETS, conexoes: CONEXOES, sobrevivente: SURVIVOR_LISTS, queTime: LINEUPS, chute: CHUTE_QUESTIONS, top100: TOP100_LISTS, top10: TOP10_LISTS };
  for (const [game, list] of Object.entries(all)) {
    const ids = (list as Array<{ id: string }>).map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `${game}: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`);
  }
});

test('Qualidade: Quem é — nenhuma dica traz uma resposta aceita', () => {
  for (const c of WHOIS) {
    assert.equal(c.clues.length, 5, c.id);
    const answers = [c.answer, ...c.aliases].map(normalize).filter((a) => a.length >= 4);
    c.clues.forEach((clue, i) => {
      for (const a of answers) assert.ok(!word(a, normalize(clue)), `${c.id}: a dica ${i + 1} entrega "${a}"`);
    });
  }
});

test('Qualidade: Conexões 4 x 4 com 16 itens diferentes; Intruso fora dos membros', () => {
  for (const p of CONEXOES) {
    assert.equal(p.groups.length, 4, p.id);
    const items = p.groups.flatMap((g) => (assert.equal(g.items.length, 4, `${p.id}: ${g.label}`), g.items.map(normalize)));
    assert.equal(new Set(items).size, 16, `${p.id}: ${items.filter((x, i) => items.indexOf(x) !== i)}`);
  }
  for (const s of INTRUSO_SETS) {
    const m = s.members.map(normalize);
    assert.equal(m.length, 4, s.id);
    assert.equal(new Set(m).size, 4, s.id);
    assert.ok(!m.includes(normalize(s.intruder)), s.id);
  }
});

test('Qualidade: Sobrevivente e Top 10 — um nome (ou apelido) vale para um item só', () => {
  for (const l of SURVIVOR_LISTS) {
    const owner = new Map<string, string>();
    for (const item of l.items) {
      for (const n of item) {
        const k = normalize(n);
        assert.ok(!owner.has(k) || owner.get(k) === item[0], `${l.id}: "${n}" vale para ${owner.get(k)} e ${item[0]}`);
        owner.set(k, item[0]);
      }
    }
  }
  for (const l of TOP10_LISTS) {
    assert.ok(l.items.length <= 10 && l.items.length >= 3, l.id);
    l.items.forEach((it, i) => assert.ok(i === 0 || it.rank >= l.items[i - 1].rank, `${l.id}: ordem`));
    const owner = new Map<string, string>();
    for (const it of l.items) {
      for (const a of [it.name, ...(it.aliases ?? [])]) {
        const k = normalize(a);
        assert.ok(!owner.has(k) || owner.get(k) === it.name, `${l.id}: "${a}" vale para ${owner.get(k)} e ${it.name}`);
        owner.set(k, it.name);
      }
    }
  }
  for (const l of TOP100_LISTS) {
    const names = l.items.map((i) => normalize(i.name));
    assert.equal(new Set(names).size, names.length, `${l.id}: nome repetido`);
  }
});

test('Qualidade: Que Time com 11 titulares; Linha do Tempo, Chute, Fato e cartas bem formados', () => {
  for (const l of LINEUPS) {
    const n = l.lines.flat();
    assert.equal(n.length, 11, l.id);
    assert.equal(new Set(n).size, 11, l.id);
  }
  const texts = TIMELINE.map((e) => normalize(e.text));
  assert.equal(new Set(texts).size, texts.length, 'texto repetido na Linha do Tempo');
  for (const e of TIMELINE) assert.ok(e.year <= 2026, `${e.id}: ${e.year}`);
  for (const q of CHUTE_QUESTIONS) assert.ok(Number.isFinite(q.answer), q.id);
  for (const f of FACTS) assert.ok(f.text.trim() && f.why.trim(), f.id);
  for (const c of [...CARDS.emoji, ...CARDS.relampago]) {
    const a = normalize(c.answer);
    assert.ok(a, c.id);
    assert.ok(a.length <= 3 || !word(a, normalize(c.prompt)), `${c.id}: a pergunta entrega a resposta`);
  }
});
