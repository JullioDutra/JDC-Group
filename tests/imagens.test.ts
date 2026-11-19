import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ImageSpec, PartyPlayer } from '../src/lib/game/types';
import { glyphSafe, safeFirstName, safeName } from '../src/lib/images/glyphs';
import { glyphSafeSpec, glyphSafeTree, renderImage } from '../src/lib/images/render';
import { buildImage } from '../src/lib/images/templates';
import { draftRows } from '../src/lib/party/draft';
import { leilaoBoard } from '../src/lib/party/leilao';

/** Junta todo o texto de um elemento React (o que a imagem mostra). */
const textOf = (el: unknown): string => {
  if (el == null || typeof el === 'boolean') return '';
  if (typeof el === 'string' || typeof el === 'number') return String(el);
  if (Array.isArray(el)) return el.map(textOf).join(' ');
  const props = (el as { props?: { children?: unknown } }).props;
  return props ? textOf(props.children) : '';
};
/** O que a imagem mostra depois dos filtros do renderImage. */
const shown = (spec: ImageSpec) => textOf(glyphSafeTree(buildImage(glyphSafeSpec(spec))));

/** Só o que as fontes Anton e Barlow desenham (assets/fonts). */
const COVERED = /^[\n\x20-\x7e\xa0-\xffıŒœ–—‘-‚“-„•…′″‹›€™−]*$/;

const NAMES = ['Júllio 🔥', '🦁🦁', 'Luka Modrić', 'Maria Eduarda Albuquerque', '🇧🇷 Ana', 'Szczęsny', 'Ødegaard', 'Çalhanoğlu'];
const players = (n: number): PartyPlayer[] =>
  Array.from({ length: n }, (_, i) => ({ jid: `p${i}@s`, name: NAMES[i % NAMES.length], score: 100 - i, missed: 0, hits: 0, lastHitAt: i }));
const base = (game: string, n: number) => ({
  kind: 'party', game, status: 'PLAYING', host: { jid: 'p0@s', name: NAMES[0] }, players: players(n),
  createdAt: 0, updatedAt: 0, deadline: null, timerToken: null, seq: 0, warned: [],
});

test('Glifos: letra de fora vira a sem acento, emoji sai, nome só de emoji vira "?"', () => {
  assert.equal(glyphSafe('Luka Modrić'), 'Luka Modric');
  assert.equal(glyphSafe('Čech'), 'Cech');
  assert.equal(glyphSafe('Łukasz Piszczek'), 'Lukasz Piszczek');
  assert.equal(glyphSafe('Hakan Çalhanoğlu'), 'Hakan Çalhanoglu');
  assert.equal(glyphSafe('Joško Gvardiol'), 'Josko Gvardiol');
  assert.equal(glyphSafe('Ødegaard · São Paulo — 2º'), 'Ødegaard · São Paulo — 2º', 'Latin-1 fica como está');
  assert.equal(glyphSafe('Júllio Dutra 🔥'), 'Júllio Dutra');
  assert.equal(glyphSafe('🇧🇷 Ana ✨'), 'Ana');
  assert.equal(glyphSafe('🦁🦁'), '?');
  assert.equal(glyphSafe(''), '');
  assert.equal(glyphSafe(' '), ' ', 'espaço proposital não some');
  assert.equal(glyphSafe('João'), 'João', 'acento separado (NFD) vira a letra pronta');
  assert.equal(safeFirstName('🔥 Júllio Dutra'), 'Júllio');
  assert.equal(safeName('Maria Eduarda Albuquerque'), 'Maria Eduarda Alb…');
});

test('Imagens: nenhum caractere fora das fontes depois do filtro (nomes com emoji e acentos de fora)', () => {
  const rows = NAMES.map((name, i) => ({ jid: `${i}`, name, games: 9, wins: 9 - i, draws: 0, losses: i }));
  const specs: ImageSpec[] = [
    { kind: 'ranking', groupName: 'Resenha 🍺', rows },
    { kind: 'partyScore', state: base('quetime', 8) as never, title: 'Resultado final', final: true },
    { kind: 'partyLobby', state: { ...base('impostor', 8), status: 'LOBBY' } as never },
    { kind: 'textBoard', game: 'stop', title: 'Letra Ł', subtitle: 'Rodada 1 de 3', rows: [{ head: '🦁🦁 · 30', lines: ['Nome: Šeško +10'] }] },
    { kind: 'challenge', host: '⚽ Modrić' },
  ];
  for (const spec of specs) {
    const text = shown(spec);
    assert.match(text, COVERED, `${spec.kind}: sobrou caractere sem glifo em "${[...text].filter((c) => !COVERED.test(c)).join('')}"`);
  }
  assert.match(shown(specs[0]), /MODRIC/);
  assert.doesNotMatch(shown(specs[0]), /JÚLLIO…/, 'o emoji não gasta espaço do nome (sem reticências à toa)');
});

test('Imagens: renderiza nome com emoji sem baixar nada da internet', async () => {
  // Sem o filtro, o gerador busca o emoji num CDN; aqui (sem rede) isso derrubava a imagem.
  const png = await renderImage({
    kind: 'ranking', groupName: 'Grupo 🍺',
    rows: [{ jid: '1', name: 'Júllio 🔥', games: 1, wins: 1, draws: 0, losses: 0 }, { jid: '2', name: '🦁🦁', games: 1, wins: 0, draws: 0, losses: 1 }],
  });
  assert.ok(png.length > 10_000);
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
});

test('Quadros de texto: nome longo não corta o que vem depois (votos, overall)', () => {
  const draft = {
    ...base('draft', 8), phase: 'voting', round: 4, totalRounds: 5, sequence: [], pick: 0, used: [],
    rules: [{ pos: 'GOL', kind: 'none', value: '', label: 'livre' }],
    picks: Object.fromEntries(players(8).map((p) => [p.jid, [{ name: 'Diego Alves', key: 'diego-alves' }]])),
    votes: { 'p1@s': 3, 'p2@s': 3, 'p0@s': 3 },
  };
  const rows = draftRows(draft as never, true);
  const text = shown({ kind: 'textBoard', game: 'draft', title: 'Resultado', subtitle: '3 votos', rows });
  assert.match(text, /4 · MARIA EDUARDA A… · 3 VOTOS/);
  assert.match(text, /2 · \? · 0 VOTOS/, 'nome só de emoji vira "?" e a linha continua');

  const squad = [
    { name: 'Gianluigi Donnarumma', positions: ['GOL'], slot: 'GOL', overall: 89, price: 31 },
    { name: 'Trent Alexander-Arnold', positions: ['DEF'], slot: 'DEF', overall: 87, price: 19 },
  ];
  const leilao = {
    ...base('leilao', 8), mode: 'overall', phase: 'auction', round: 47, totalRounds: 48, lots: [], bid: null,
    budget: Object.fromEntries(players(8).map((p) => [p.jid, 50])),
    squads: Object.fromEntries(players(8).map((p) => [p.jid, squad])),
  };
  const final = leilaoBoard(leilao as never, true);
  assert.ok(final.type === 'image');
  const shownFinal = shown(final.image);
  assert.match(shownFinal, /DEF Trent Alexander-Arnold · overall 87/, 'overall inteiro no resultado');
  assert.doesNotMatch(shownFinal, /overal…|ove…/);
  const open = leilaoBoard(leilao as never, false);
  assert.ok(open.type === 'image');
  assert.match(shown(open.image), /GOL Gianluigi Donnarumma · 31 moedas/);
  assert.doesNotMatch(shown(open.image), /overall \d/, 'durante o leilão o overall fica escondido');
});
