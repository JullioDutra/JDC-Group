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

/** Cabeçalho comum das tabelas de clube (Clube, Temporada, Liga ... Total). */
const HEAD = `|-\n!rowspan="2"|Club\n!rowspan="2"|Season\n!colspan="3"|League\n!colspan="2"|Cup\n!colspan="2"|Total\n|-\n!Division!!Apps!!Goals!!Apps!!Goals!!Apps!!Goals\n|-\n`;

test('Wikipédia: outros formatos da tabela de clubes (Giggs, Lineker, Ribéry, Puskás)', () => {
  // Giggs: legenda "Club appearances..." e a última linha só "Total" (3 colunas).
  const giggs = `{| class="wikitable"\n|+ Club appearances and goals by season by competition<ref name="x">{{cite web|title=X}}</ref>\n${HEAD}|rowspan="2"|Man Utd\n|1990–91||First Division||2||1||0||0||2||1\n|-\n!colspan="3"|Total\n!672!!114!!74!!12!!963!!168\n|}`;
  assert.deepEqual(parseWikiStats(giggs), { clubApps: 963, clubGoals: 168 });
  // Lineker: "Total" de 2 colunas por clube e o de 3 colunas no fim (a carreira).
  const lineker = `{| class="wikitable"\n|+ Appearances and goals by club, season and competition\n${HEAD}|rowspan="2"|Nagoya\n|1993||J League||7||1||0||0||12||5\n|-\n!colspan="2"|Total\n!18||4||0||0||24||8\n|-\n!colspan="3"|Total\n!461||238||38||18||573||283\n|}`;
  assert.deepEqual(parseWikiStats(lineker), { clubApps: 573, clubGoals: 283 });
  // Só o "Total" de um clube no fim: não é a carreira inteira, fica sem número.
  const oneClub = lineker.replace(/\n\|-\n!colspan="3"\|Total\n![^\n]*/, '');
  assert.equal(parseWikiStats(oneClub), null);
  // Ribéry e Puskás: tabela sem legenda, logo abaixo de "Career statistics > Club".
  const ribery = `==Career statistics==\n===Club===\nSource:<ref>X</ref>\n{| class="wikitable"\n${HEAD}|Bayern||2007–08||Bundesliga||28||11||5||1||48||16\n|-\n!colspan="3"|Career total!!523!!114!!55!!14!!715!!161\n|}\n\n===International===\n`;
  assert.deepEqual(parseWikiStats(ribery), { clubApps: 715, clubGoals: 161 });
  // Abaixo de "Club" mas sem jeito de tabela de temporadas (ex.: títulos): fica sem número.
  assert.equal(parseWikiStats(`==Career statistics==\n===Club===\n{| class="wikitable"\n!Trophy!!Year\n|-\n!colspan="3"|Career total!!5!!1\n|}`), null);
  // Tabela de outra seção depois de "Club" (sem tabela própria): não vale.
  assert.equal(parseWikiStats(`==Career statistics==\n===Club===\nSem dados.\n==Honours==\n{| class="wikitable"\n${HEAD}!colspan="3"|Career total!!1!!1!!0!!0!!1!!1\n|}`), null);
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
