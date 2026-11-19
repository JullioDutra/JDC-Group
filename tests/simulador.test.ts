import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { handleMessage } from '../src/lib/game/engine';
import type { Outgoing } from '../src/lib/game/types';
import {
  SIM_TEAMS,
  type Pick,
  type SimData,
  matchKey,
  parseWikitext,
  playedCount,
  remaining,
  simulate,
  standings,
} from '../src/lib/sim/brasileirao';
import { loadBrasileirao } from '../src/lib/sim/data';
import { SNAPSHOT_2026 } from '../src/lib/sim/snapshot-2026';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

/** Wikitexto no formato da página (Module:Sports results) a partir de uma lista de jogos. */
function wikitext(data: SimData, update = '18 November 2026'): string {
  const lines = data.matches.map(([h, a, hg, ag]) => `|match_${h}_${a}=${hg === null ? '' : `${hg}–${ag}`}`);
  return `==Results==\n{{#invoke:Sports results|main\n|update=${update}\n${lines.join('\n')}\n}}`;
}

test('Simulador: lê a matriz da Wikipédia e recusa página fora do formato', () => {
  const parsed = parseWikitext(wikitext(SNAPSHOT_2026));
  assert.ok(parsed);
  assert.equal(parsed!.update, '2026-11-18');
  assert.equal(playedCount(parsed!), playedCount(SNAPSHOT_2026));
  assert.equal(remaining(parsed!).length, 33);
  // Clássico com link na célula ("[[Fla–Flu|2–1]]") também vale.
  const linked = wikitext(SNAPSHOT_2026).replace(/\|match_FLA_FLU=(\d+)–(\d+)/, '|match_FLA_FLU=[[Fla–Flu|$1–$2]]');
  assert.equal(playedCount(parseWikitext(linked)!), playedCount(SNAPSHOT_2026));
  // Time desconhecido, jogos faltando ou placar absurdo: fora.
  assert.equal(parseWikitext(wikitext(SNAPSHOT_2026).replace('match_FLA_', 'match_XYZ_')), null);
  assert.equal(parseWikitext(wikitext({ ...SNAPSHOT_2026, matches: SNAPSHOT_2026.matches.slice(0, 300) })), null);
  assert.equal(parseWikitext(wikitext(SNAPSHOT_2026).replace(/\|match_CAP_CAM=\d+–\d+/, '|match_CAP_CAM=40–0')), null);
  assert.equal(parseWikitext('sem tabela nenhuma'), null);
});

test('Simulador: tabela confere com a da CBF e desempata por vitórias, saldo e gols', () => {
  const t = standings(SNAPSHOT_2026);
  assert.equal(t[0].name, 'Flamengo');
  assert.deepEqual([t[0].p, t[0].j, t[0].v, t[0].sg], [79, 35, 24, 43]);
  assert.equal(t[19].name, 'Chapecoense');
  // Vitória, Internacional e Grêmio com 38: Vitória e Inter têm 10 e 9 vitórias... a ordem segue V, SG, GP.
  const tied = t.filter((r) => r.p === 38);
  for (let i = 1; i < tied.length; i++) {
    const [a, b] = [tied[i - 1], tied[i]];
    assert.ok(a.v > b.v || (a.v === b.v && (a.sg > b.sg || (a.sg === b.sg && a.gp >= b.gp))), `${a.name} antes de ${b.name}`);
  }
  assert.equal(SIM_TEAMS.length, 20);
});

test('Simulador: chances somam certo, a mesma tabela dá o mesmo resultado e palpites mandam', () => {
  const odds = simulate(SNAPSHOT_2026);
  const sum = (k: 'z4' | 'title' | 'g4') => Object.values(odds).reduce((a, o) => a + o[k], 0);
  assert.ok(Math.abs(sum('z4') - 4) < 1e-9, '4 caem em toda simulação');
  assert.ok(Math.abs(sum('title') - 1) < 1e-9);
  assert.ok(Math.abs(sum('g4') - 4) < 1e-9);
  assert.equal(odds.CHA.z4, 1, 'Chapecoense já não escapa');
  assert.ok(odds.FLA.title > 0.9);
  assert.deepEqual(simulate(SNAPSHOT_2026), odds, 'determinístico');
  // Todos os jogos com palpite: as chances viram 0 ou 1 e batem com a tabela final.
  const picks: Record<string, Pick> = {};
  remaining(SNAPSHOT_2026).forEach((m, i) => (picks[matchKey(m)] = (['H', 'D', 'A'] as Pick[])[i % 3]));
  const final = standings(SNAPSHOT_2026, picks);
  const done = simulate(SNAPSHOT_2026, picks, 200);
  for (const [i, r] of final.entries()) assert.equal(done[r.id].z4, i >= 16 ? 1 : 0, r.name);
  assert.ok(final.every((r) => r.j === 38));
});

test('Simulador: usa a página ao vivo; se falhar ou vier atrasada, a versão guardada', async () => {
  const fake = (body: string, ok = true) => (async () => ({ ok, text: async () => body })) as unknown as typeof fetch;
  // Ao vivo com um jogo a mais: vale a ao vivo.
  const ahead: SimData = { ...SNAPSHOT_2026, matches: SNAPSHOT_2026.matches.map((m) => (matchKey(m) === 'CAP-REM' ? ['CAP', 'REM', 3, 0] : m)) };
  const live = await loadBrasileirao(fake(wikitext(ahead, '25 November 2026')));
  assert.equal(live.update, '2026-11-25');
  assert.equal(remaining(live).length, 32);
  // Página com menos jogos que a guardada (reversão), quebrada ou fora do ar: a guardada.
  const behind: SimData = { ...SNAPSHOT_2026, matches: SNAPSHOT_2026.matches.map((m) => (matchKey(m) === 'CAP-CAM' ? ['CAP', 'CAM', null, null] : m)) };
  assert.equal((await loadBrasileirao(fake(wikitext(behind)))).update, SNAPSHOT_2026.update);
  assert.equal(await loadBrasileirao(fake('lixo')), SNAPSHOT_2026);
  assert.equal(await loadBrasileirao(fake('', false)), SNAPSHOT_2026);
  assert.equal(await loadBrasileirao((async () => { throw new Error('sem rede'); }) as typeof fetch), SNAPSHOT_2026);
});

test('Simulador no grupo: "simulador" e "quem cai" mandam as chances e o link da página', async () => {
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, async () => null), now: () => new Date('2026-11-19T12:00:00Z'), brasileirao: async () => SNAPSHOT_2026 };
  const say = (text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `s${++id}`, groupJid: 'sim@g.us', senderJid: 'ana@s', senderName: 'Ana', text }, deps);
  await say('ativar jogos');
  for (const cmd of ['simulador', 'quem cai', 'Brasileirão']) {
    const out = asText(await say(cmd));
    assert.match(out, /Brasileirão 2026: quem cai\?[\s\S]*Faltam 33 jogos[\s\S]*Cair\*: Chapecoense 100%[\s\S]*Título\*: Flamengo/, cmd);
    assert.match(out, /\/simulador$/m);
  }
  assert.deepEqual(await say('quem cai hoje no grupo'), [], 'frase solta na conversa não chama o simulador');
});
