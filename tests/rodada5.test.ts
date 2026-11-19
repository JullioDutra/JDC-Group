import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { handleMessage } from '../src/lib/game/engine';
import type { AnagramaParty, Outgoing, Top100Party } from '../src/lib/game/types';
import { freshPick } from '../src/lib/party/common';
import { ANAGRAMS, ANAGRAM_THEMES, findAnagramTheme, getAnagram } from '../src/lib/party/content/anagramas';
import { anagramaAnswer, anagramaHit } from '../src/lib/party/anagrama';
import { parsePartyStart, pickTop10 } from '../src/lib/party/engine';
import { TOP10_LISTS, top10Theme } from '../src/lib/party/top10-lists';
import { MemoryStore } from '../src/lib/store/memory';
import { dayKey, listOfDay } from '../src/lib/party/content/top100';
import { playedTodayKey } from '../src/lib/party/top100';
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

test('Anagrama: só vale a palavra 100% certa (sem acento), nada de erro de digitação nem apelido', async () => {
  // Os casos do grupo.
  assert.ok(!anagramaHit('Rodrygo', 'Rodrigo'));
  assert.ok(!anagramaHit('Paraíba', 'bparaiba'));
  assert.ok(anagramaHit('Rodrygo', 'rodrygo'));
  assert.ok(anagramaHit('Paraíba', 'PARAIBA'));
  assert.ok(anagramaHit('Paraíba', 'Paraíba'));
  // Espaço, hífen e artigo do começo não contam; letra trocada, sim.
  assert.ok(anagramaHit('Beira-Rio', 'beira rio'));
  assert.ok(anagramaHit('O Rei do Gado', 'rei do gado'));
  assert.ok(anagramaHit('Vinícius Júnior', 'vinicius junior'));
  assert.ok(!anagramaHit('Vinícius Júnior', 'vini jr'), 'apelido não vale no Anagrama');
  assert.ok(!anagramaHit('Internacional', 'inter'));
  assert.ok(!anagramaHit('Florianópolis', 'florianopoles'), 'erro em palavra longa também não');

  // Na partida: "Rodrigo" gasta tentativa e leva ❌; "Rodrygo" acerta.
  const word = ANAGRAMS.find((a) => a.answer === 'Rodrygo')!;
  const players = ['Ana', 'Bia'].map((n) => ({ jid: `${n}@s`, name: n, score: 0, missed: 0, hits: 0, lastHitAt: 0 }));
  const state = {
    kind: 'party', game: 'anagrama', status: 'PLAYING', host: players[0], players, createdAt: 0, updatedAt: 0, deadline: null,
    timerToken: null, seq: 0, warned: [], category: 'futebol', theme: 'craque brasileiro', round: 0, totalRounds: 1,
    order: [word.id], scrambled: 'GORYRDO', hint: false, tries: {}, solved: false,
  } as unknown as AnagramaParty;
  const deps = { store: new MemoryStore(), lookup: createLookup(new MemoryStore(), async () => null), now: new Date('2026-11-19T12:00:00Z'), rng: lcg(1) };
  const save = async (out: Outgoing[]) => out;
  const msg = (who: string, text: string) => ({ id: `${who}-${text}`, groupJid: 'g@g.us', senderJid: `${who}@s`, senderName: who, text });
  const wrong = await anagramaAnswer(state, players[1], msg('Bia', 'Rodrigo'), deps as never, save);
  assert.ok(wrong.some((o) => o.type === 'react' && o.emoji === '❌'));
  assert.equal(state.solved, false);
  const right = await anagramaAnswer(state, players[0], msg('Ana', 'RODRYGO'), deps as never, save);
  assert.ok(right.some((o) => o.type === 'react' && o.emoji === '✅'));
  assert.equal(state.solved, true);
});

// ---------- Comandos do admin: Top 100 e temporada ----------

test('Admin: resetar o Top 100 libera mais uma partida hoje, com outra lista; só o admin', async () => {
  const store = new MemoryStore();
  let id = 0;
  const deps = {
    store,
    lookup: createLookup(store, async () => null),
    now: () => new Date('2026-11-19T15:00:00Z'),
    rng: lcg(5),
    canManageGroup: (jid: string) => jid === 'Ana@s',
  };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `t${++id}`, groupJid: 'adm@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  await say('Ana', 'ativar jogos');
  // Já jogou hoje (a lista do dia).
  const day = dayKey(new Date('2026-11-19T15:00:00Z'));
  const today = listOfDay(new Date('2026-11-19T15:00:00Z')).id;
  await store.markSeen('adm@g.us', 'top100', [playedTodayKey(day), today]);
  assert.match(asText(await say('Ana', 'top 100')), /já foi jogado/);
  assert.match(asText(await say('Bia', 'resetar top 100')), /Só o admin/);
  assert.match(asText(await say('Ana', 'resetar o 100')), /Top 100\* liberado/);
  assert.match(asText(await say('Ana', 'top 100')), /img:partyLobby/);
  const st = (await store.getActiveMatch('adm@g.us'))!.state as Top100Party;
  assert.notEqual(st.listId, today, 'a partida extra vem com outra lista');
});

test('Admin: virada de temporada mostra os melhores, guarda o campeão e zera o ranking', async () => {
  const store = new MemoryStore();
  let id = 0;
  const deps = {
    store,
    lookup: createLookup(store, async () => null),
    now: () => new Date('2026-11-19T15:00:00Z'),
    rng: lcg(5),
    canManageGroup: (jid: string) => jid === 'Ana@s',
  };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `s${++id}`, groupJid: 'temp@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  await say('Ana', 'ativar jogos');
  assert.match(asText(await say('Ana', 'virada de temporada')), /ainda não tem partidas/);
  const p = (n: string) => ({ jid: `${n}@s`, name: n });
  await store.recordResults('temp@g.us', [
    { player: p('Ana'), result: 'win' },
    { player: p('Bia'), result: 'loss' },
    { player: p('Caio'), result: 'loss' },
  ]);
  await store.recordResults('temp@g.us', [{ player: p('Ana'), result: 'win' }, { player: p('Bia'), result: 'draw' }]);
  await store.recordResults('temp@g.us', [{ player: p('Caio'), result: 'win' }, { player: p('Bia'), result: 'loss' }]);
  assert.match(asText(await say('Bia', 'ranking')), /img:ranking/);
  assert.match(asText(await say('Bia', 'virada de temporada')), /Só o admin/);
  const out = await say('Ana', 'virada de temporada');
  assert.match(asText(out), /\[img:season\][\s\S]*Fim da Temporada 1!\* Campeão: \*Ana\*, com 6 pontos[\s\S]*Temporada 2\* começa agora/);
  const img = out.find((o) => o.type === 'image');
  assert.ok(img && img.type === 'image' && img.image.kind === 'season');
  if (img.image.kind === 'season') {
    assert.deepEqual(img.image.rows.map((r) => r.name), ['Ana', 'Caio', 'Bia']);
    assert.ok(img.image.highlights.some((h) => h.label === 'Mais vitórias' && h.name === 'Ana'));
    assert.ok(img.image.highlights.some((h) => h.label === 'Mais partidas' && h.name === 'Bia'));
  }
  assert.deepEqual(await store.getRanking('temp@g.us', 10), [], 'ranking zerado');
  assert.match(asText(await say('Bia', 'campeoes')), /Temporada 1 \([^)]*\): \*Ana\*, 6 pts[\s\S]*Temporada atual: \*2\*/);
  assert.match(asText(await say('Bia', 'ranking')), /Ainda não há partidas finalizadas na \*Temporada 2\*/);
});

// ---------- Imagens não adiantam o time das próximas rodadas ----------

/** Junta todo o texto de um elemento React (para conferir o que a imagem mostra). */
const textOfElement = (el: unknown): string => {
  if (el == null || typeof el === 'boolean') return '';
  if (typeof el === 'string' || typeof el === 'number') return String(el);
  if (Array.isArray(el)) return el.map(textOfElement).join(' ');
  const props = (el as { props?: { children?: unknown } }).props;
  return props ? textOfElement(props.children) : '';
};

test('Escalação em Grupo e 1x1: a imagem só mostra o time das rodadas já abertas', async () => {
  const { buildImage } = await import('../src/lib/images/templates');
  const { MODES } = await import('../src/lib/game/modes');
  const teams = ['flamengo', 'palmeiras', 'corinthians', 'atletico-mg', 'santos', 'gremio'];
  const restrictions = teams.map((teamId) => ({ kind: 'club' as const, teamId }));
  const mode = MODES.find((m) => m.restriction === 'club') ?? MODES[0];
  // Rodada 3 (índice 2): o Atlético-MG da rodada 4 não pode aparecer.
  const party = {
    kind: 'party', game: 'escalacao', status: 'PLAYING', modeId: mode.id, randomMode: false,
    options: { blind: false, turnSeconds: 60, hard: false }, restrictions, round: 2,
    players: [{ jid: 'a', name: 'Ana', score: 0, missed: 0, hits: 0 }], picks: { a: [null, null, null, null, null, null] },
    host: { jid: 'a', name: 'Ana' }, used: [], deadline: null, timerToken: null, seq: 0, warned: [], createdAt: 0, updatedAt: 0,
  };
  const table = textOfElement(buildImage({ kind: 'partyTable', state: party as never }));
  assert.match(table, /Corinthians/, 'a rodada atual aparece');
  assert.doesNotMatch(table, /Atlético|Santos|Grêmio/, 'as próximas não');
  const done = textOfElement(buildImage({ kind: 'partyTable', state: { ...party, status: 'FINISHED' } as never }));
  assert.match(done, /Atlético/, 'no fim, tudo aparece');

  const match = {
    status: 'PLAYING', modeId: mode.id, restrictions, round: 2, turn: 0, turnStartedAt: 0, createdAt: 0, updatedAt: 0, winner: null,
    players: [{ jid: 'a', name: 'Ana' }, { jid: 'b', name: 'Bia' }],
    picks: [[null, null, null, null, null, null], [null, null, null, null, null, null]],
    options: { blind: false, turnSeconds: 60, hard: false },
  };
  const pitch = textOfElement(buildImage({ kind: 'pitch', state: match as never }));
  assert.doesNotMatch(pitch, /ATLÉTICO|SANTOS|GRÊMIO/, '1x1: as próximas rodadas não aparecem no campo');
  assert.match(pitch, /CORINTHIANS/, '1x1: a rodada atual aparece');
});
