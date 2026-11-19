import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalize } from '../src/lib/game/text';
import { EMOJI_CARDS } from '../src/lib/party/content/cards';
import { CONEXOES } from '../src/lib/party/content/conexoes';
import { TIMELINE } from '../src/lib/party/content/linha';
import { LINEUPS } from '../src/lib/party/content/lineups';
import { SURVIVOR_LISTS } from '../src/lib/party/content/sobrevivente';
import { STOP_CATEGORIES, STOP_LETTERS } from '../src/lib/party/content/stop';

const unique = (xs: string[]) => new Set(xs).size === xs.length;
const futebol = <T extends { category?: string }>(xs: T[]) => xs.filter((x) => (x.category ?? 'futebol') === 'futebol');

test('Rodada 9: modos magros com mais conteúdo, sem id repetido', () => {
  assert.ok(futebol(TIMELINE).length >= 70, `Linha do Tempo: ${futebol(TIMELINE).length} fatos de futebol`);
  assert.ok(futebol(SURVIVOR_LISTS).length >= 28, `Sobrevivente: ${futebol(SURVIVOR_LISTS).length} listas de futebol`);
  assert.ok(futebol(EMOJI_CARDS).length >= 65, `Emoji: ${futebol(EMOJI_CARDS).length} cartas de futebol`);
  assert.ok(LINEUPS.length >= 49, `Que time é esse: ${LINEUPS.length}`);
  assert.ok(futebol(CONEXOES).length >= 15, `Conexões: ${futebol(CONEXOES).length} de futebol`);
  assert.ok(STOP_CATEGORIES.length >= 18, `Stop: ${STOP_CATEGORIES.length} categorias`);
  for (const [name, ids] of [
    ['linha', TIMELINE.map((x) => x.id)],
    ['sobrevivente', SURVIVOR_LISTS.map((x) => x.id)],
    ['emoji', EMOJI_CARDS.map((x) => x.id)],
    ['escalações', LINEUPS.map((x) => x.id)],
    ['conexões', CONEXOES.map((x) => x.id)],
    ['stop', STOP_CATEGORIES.map((x) => x.id)],
  ] as const) {
    assert.ok(unique([...ids]), `id repetido em ${name}`);
  }
});

test('Rodada 9: escalações com 11, tabuleiros com 16 nomes diferentes e listas sem item repetido', () => {
  for (const l of LINEUPS) assert.equal(l.lines.flat().length, 11, `${l.id} não tem 11 titulares`);
  assert.ok(unique(LINEUPS.map((l) => `${normalize(l.team)} ${l.year}`)), 'time + ano repetido no Que time é esse');
  for (const p of CONEXOES) {
    const items = p.groups.flatMap((g) => g.items).map(normalize);
    assert.equal(items.length, 16, p.id);
    assert.ok(unique(items), `${p.id}: nome repetido no tabuleiro`);
  }
  for (const l of SURVIVOR_LISTS) {
    assert.ok(l.items.length >= 4, `${l.id} curta demais`);
    assert.ok(unique(l.items.map((i) => normalize(i[0]))), `${l.id}: item repetido`);
  }
});

test('Rodada 9: categorias novas do Stop têm palavra para quase todas as letras do sorteio', () => {
  for (const id of ['marca', 'objeto', 'corpo', 'filme', 'carro', 'bebida', 'esporte', 'artista']) {
    const cat = STOP_CATEGORIES.find((c) => c.id === id)!;
    assert.ok(cat && cat.kind === 'list' && (cat.words?.length ?? 0) >= 25, `${id}: lista curta`);
    const covered = STOP_LETTERS.filter((l) => cat.words!.some((w) => normalize(w).startsWith(l.toLowerCase())));
    assert.ok(covered.length >= 9, `${id}: só ${covered.length} letras com palavra (${covered.join('')})`);
  }
});
