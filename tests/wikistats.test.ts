import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { formatCard } from '../src/lib/players/admin';
import type { PlayerRecord } from '../src/lib/players/types';
import { setWikiStats, withWikiStats } from '../src/lib/players/wikistats';
import { englishDate, parseWikiStats } from '../src/lib/players/wikistats-parse';
import { MemoryStore } from '../src/lib/store/memory';
import { setTmData } from '../src/lib/transfermarkt';

/**
 * Base de números pela Wikipédia (rodada 17). Fixture: trecho real da página
 * "Lionel Messi" na Wikipédia em inglês (CC BY-SA), lida em 26/11/2026: caixa
 * de informação e a tabela de clubes ("Career total").
 */
const MESSI = readFileSync('tests/fixtures/wikipedia-messi-2026-11-26.txt', 'utf8');

test('Wikipédia: total da carreira em clubes (todas as competições), seleção principal e data', () => {
  assert.deepEqual(parseWikiStats(MESSI), { clubApps: 1010, clubGoals: 822, intlCaps: 208, intlGoals: 126, asOf: '2026-11-21' });
  assert.equal(englishDate('match played 21 November 2026'), '2026-11-21');
  assert.equal(englishDate('November 3, 2026'), '2026-11-03');
  assert.equal(parseWikiStats("'''Fulano''' é um jogador. Sem tabela."), null);
  // Tabela com assistências no grupo Total: lê pela posição do cabeçalho.
  const withAssists = `{| class="wikitable"\n|+ Appearances and goals by club, season and competition\n!rowspan="2"|Club!!rowspan="2"|Season!!colspan="3"|Total\n|-\n!Apps!!Goals!!Assists\n|-\n|X||2020||10||5||3\n|-\n! colspan="2" |Career total\n!300 || 120 || 80\n|}`;
  assert.deepEqual(parseWikiStats(withAssists), { clubApps: 300, clubGoals: 120, clubAssists: 80 });
});

const rec = (over: Partial<PlayerRecord> = {}): PlayerRecord => ({
  id: 'Q615', name: 'Lionel Messi', aliases: [], positions: ['ATA'], nationality: 'Argentina', birthDate: '1987-06-24', heightCm: 170,
  clubs: ['Futbol Club Barcelona'], debutYear: 2004, sitelinks: 228, stats: { careerGoals: 700, careerApps: 900 }, source: 'wikidata', ...over,
});

test('Wikipédia na partida: carreira = clubes + seleção; vale mais que a IA; Transfermarkt e admin valem mais', async () => {
  setWikiStats([{ qid: 'Q615', title: 'Lionel Messi', read: '2026-11-26', clubApps: 1010, clubGoals: 822, intlCaps: 208, intlGoals: 126, asOf: '2026-11-21' }]);
  try {
    const r = withWikiStats(rec());
    assert.equal(r.stats.careerGoals, 948);
    assert.equal(r.stats.careerApps, 1218);
    assert.equal(r.stats.intlGoals, 126);
    const store = new MemoryStore();
    await store.upsertPlayers([rec()]);
    let ai = 0;
    const lookup = createLookup(store, async () => null, async () => (ai++, 1));
    assert.equal((await lookup('Messi', { position: 'ATA', metric: 'careerGoals' }))!.careerGoals, 948);
    assert.equal(ai, 0, 'não pergunta à IA');
    assert.match(formatCard((await store.getPlayer('Q615'))!), /pela Wikipédia \(clubes \+ seleção\), atualizados até 21\/11\/2026/);
    // Transfermarkt (quando houver) por cima da Wikipédia.
    setTmData([{ qid: 'Q615', tmId: '28003', name: 'Lionel Messi', at: '2026-11-26', clubs: [], stats: { careerGoals: 950 } }]);
    assert.equal((await lookup('Messi', { position: 'ATA', metric: 'careerGoals' }))!.careerGoals, 950);
    // Admin por cima de tudo.
    await store.setManualStat('Q615', 'careerGoals', { value: 951, source: 'admin', at: '2026-11-26' });
    assert.equal((await lookup('Messi', { position: 'ATA', metric: 'careerGoals' }))!.careerGoals, 951);
  } finally {
    setWikiStats([]);
    setTmData([]);
  }
});
