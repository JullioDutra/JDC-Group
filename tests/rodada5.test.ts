import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { handleMessage } from '../src/lib/game/engine';
import type { AnagramaParty, Outgoing } from '../src/lib/game/types';
import { freshPick } from '../src/lib/party/common';
import { ANAGRAMS, ANAGRAM_THEMES, findAnagramTheme, getAnagram } from '../src/lib/party/content/anagramas';
import { parsePartyStart, pickTop10 } from '../src/lib/party/engine';
import { TOP10_LISTS, top10Theme } from '../src/lib/party/top10-lists';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

/** rng determinístico (LCG) para os sorteios. */
const lcg = (seed: number) => () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

test('Top 10: não repete tema até passar por todos, nem lista até acabar as do grupo', () => {
  const pool = TOP10_LISTS.filter((l) => l.category === 'futebol');
  const themes = new Set(pool.map((l) => top10Theme(l.id)));
  const rng = lcg(7);
  const seen: string[] = [];
  const playedThemes: string[] = [];
  for (let i = 0; i < pool.length; i++) {
    const list = pickTop10(pool, rng, seen);
    assert.ok(!seen.includes(list.id), `lista repetida antes de acabar: ${list.id} (partida ${i + 1})`);
    seen.push(list.id);
    playedThemes.push(top10Theme(list.id));
  }
  // As primeiras N partidas (N = número de temas) passam por todos os temas, sem repetir.
  assert.equal(new Set(playedThemes.slice(0, themes.size)).size, themes.size);
  // Acabou tudo: volta pelo tema jogado há mais tempo.
  const last = new Map(playedThemes.map((t, i) => [t, i]));
  const oldest = [...last.entries()].sort((a, b) => a[1] - b[1])[0][0];
  assert.equal(top10Theme(pickTop10(pool, rng, seen).id), oldest);
});

test('Sorteio pelo histórico: o que o grupo não viu vem primeiro, depois o mais antigo', () => {
  const rng = lcg(3);
  const letters = ['A', 'B', 'C', 'D'];
  const seen = ['letra:C', 'letra:A', 'letra:B'];
  assert.deepEqual(freshPick(letters, (l) => `letra:${l}`, 2, rng, seen), ['D', 'C']);
});

test('Anagrama: temas escolhidos no comando, todos com pelo menos 16 palavras', async () => {
  for (const t of ANAGRAM_THEMES) {
    const n = ANAGRAMS.filter((a) => a.theme === t.theme).length;
    assert.ok(n >= 16, `tema ${t.theme} tem só ${n} palavras`);
  }
  assert.equal(new Set(ANAGRAMS.map((a) => a.id)).size, ANAGRAMS.length, 'ids únicos');
  assert.equal(findAnagramTheme('capitais')?.theme, 'capital');
  assert.equal(findAnagramTheme('clubes de fora')?.theme, 'clube do exterior');
  assert.equal(findAnagramTheme('Filmes')?.theme, 'filme');
  assert.deepEqual(parsePartyStart('abrir anagrama capitais'), { game: 'anagrama', rest: 'capitais' });
  assert.deepEqual(parsePartyStart('abrir anagrama de clubes'), { game: 'anagrama', rest: 'clubes' });
  assert.deepEqual(parsePartyStart('abrir anagrama'), { game: 'anagrama', rest: '' });

  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, async () => null), now: () => new Date('2026-11-19T12:00:00Z'), rng: lcg(11) };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `a${++id}`, groupJid: 'ana@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  await say('Ana', 'ativar jogos');
  assert.match(asText(await say('Ana', 'abrir anagrama planetas')), /Não achei o tema "planetas"[\s\S]*Temas do Anagrama/);
  assert.match(asText(await say('Ana', 'temas do anagrama')), /Temas do Anagrama[\s\S]*capitais/);
  await say('Ana', 'abrir anagrama capitais');
  await say('Bia', 'entrar');
  const start = asText(await say('Ana', 'começar'));
  assert.match(start, /Tema: \*capital\*/);
  const m = await store.getActiveMatch('ana@g.us');
  const st = m!.state as AnagramaParty;
  assert.equal(st.theme, 'capital');
  assert.ok(st.order.every((w) => getAnagram(w)?.theme === 'capital'), 'só palavras do tema');
});
