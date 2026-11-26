import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { STAT_QUESTION } from '../src/lib/ai/stats';
import { getMode } from '../src/lib/game/modes';
import { checkPick } from '../src/lib/game/validate';
import { anchorEstimate } from '../src/lib/players/lookup';
import type { PlayerRecord } from '../src/lib/players/types';
import { setWikiStats } from '../src/lib/players/wikistats';
import { MemoryStore } from '../src/lib/store/memory';

/**
 * Pedido do grupo (26/11/2026): "por que ainda não sai gols e assistência
 * para goleiros?". A IA respondia "não sei" para assistência de goleiro, e a
 * rodada do goleiro (a primeira) travava em Garçons e Artilheiros.
 */
const rec = (over: Partial<PlayerRecord> & Pick<PlayerRecord, 'id' | 'name'>): PlayerRecord => ({
  aliases: [], positions: ['GOL'], nationality: 'Brasil', birthDate: '1987-06-06', heightCm: 195, clubs: ['Grêmio', 'Corinthians', 'Cruzeiro'],
  debutYear: 2005, sitelinks: 36, stats: {}, source: 'wikidata', ...over,
});
const CASSIO = rec({ id: 'Q920039', name: 'Cássio' });
const now = new Date('2026-11-26T12:00:00Z');
const pick = (p: Parameters<typeof checkPick>[0], mode: string) => checkPick(p, 'GOL', { kind: 'club', teamId: 'corinthians' }, getMode(mode)!, now);

test('Goleiro sem dado: assistências e gols contam 0 (a rodada do goleiro não trava)', async () => {
  const store = new MemoryStore();
  await store.upsertPlayers([CASSIO]);
  // A IA não sabe (ou está fora do ar).
  const lookup = createLookup(store, async () => null, async () => null);
  const garcom = (await lookup('Cássio', { position: 'GOL', kind: 'club', teamId: 'corinthians', metric: 'careerAssists' }))!;
  assert.deepEqual(pick(garcom, 'garcons'), { ok: true, value: 0 });
  const artilheiro = (await lookup('Cássio', { position: 'GOL', kind: 'club', teamId: 'corinthians', metric: 'careerGoals' }))!;
  assert.deepEqual(pick(artilheiro, 'artilheiros'), { ok: true, value: 0 });
  // Estimativa não fica gravada: numa próxima vez a IA (ou o admin) dá o número de verdade.
  assert.equal((await store.getPlayer('Q920039'))!.stats.careerAssists ?? null, null);
});

test('Goleiro: o número da IA, da Wikipédia ou do admin vale mais que o 0', async () => {
  const store = new MemoryStore();
  await store.upsertPlayers([CASSIO]);
  const lookup = createLookup(store, async () => null, async (_p, stat) => (stat === 'careerAssists' ? 2 : null));
  const p = (await lookup('Cássio', { position: 'GOL', kind: 'club', teamId: 'corinthians', metric: 'careerAssists' }))!;
  assert.deepEqual(pick(p, 'garcons'), { ok: true, value: 2 });
  assert.equal((await store.getPlayer('Q920039'))!.stats.careerAssists, 2, 'o número da IA fica gravado');

  // Rogério Ceni na base da Wikipédia: 131 gols, não 0.
  setWikiStats([{ qid: 'Q1249859', title: 'Rogério Ceni', read: '2026-11-26', clubApps: 1197, clubGoals: 131, intlCaps: 17, intlGoals: 0 }]);
  try {
    const ceni = rec({ id: 'Q1249859', name: 'Rogério Ceni', clubs: ['Sinop', 'São Paulo'], birthDate: '1973-01-22' });
    await store.upsertPlayers([ceni]);
    const c = (await createLookup(store, async () => null, async () => null)('Rogério Ceni', { position: 'GOL', kind: 'club', teamId: 'sao-paulo', metric: 'careerGoals' }))!;
    assert.equal(c.careerGoals, 131);
  } finally {
    setWikiStats(null);
  }
});

test('A regra do 0 é só para goleiro e só para gols e assistências', () => {
  const meia = rec({ id: 'Q1', name: 'Fulano', positions: ['MEI'] });
  assert.equal(anchorEstimate(meia, 'careerAssists'), null, 'meia sem dado continua sem dado');
  assert.equal(anchorEstimate(rec({ id: 'Q2', name: 'Goleiro-linha', positions: ['GOL', 'DEF'] }), 'careerAssists'), null);
  assert.equal(anchorEstimate(CASSIO, 'careerAssists'), 0);
  assert.equal(anchorEstimate(CASSIO, 'freeKickGoals'), 0);
  assert.equal(anchorEstimate({ ...CASSIO, stats: { intlGoals: 1 } }, 'careerGoals'), 1, 'gol pela seleção conta');
  assert.equal(anchorEstimate(CASSIO, 'titles'), null, 'títulos não: goleiro ganha taça');
  assert.equal(anchorEstimate(CASSIO, 'careerApps'), null);
  assert.ok(STAT_QUESTION.careerAssists.includes('assistências'));
});
