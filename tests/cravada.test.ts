import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import { normalize } from '../src/lib/game/text';
import type { CravadaParty, Outgoing } from '../src/lib/game/types';
import { CRAVADA_LISTS, askableRanks, cravadaChoice, getCravadaList, listsOfCategory } from '../src/lib/party/content/cravada';
import { CRAVADA_WIKI } from '../src/lib/party/content/cravada-wiki';
import { cravadaMatch, cravadaPoints } from '../src/lib/party/cravada';
import { parsePartyStart } from '../src/lib/party/engine';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';
import { imageAsText } from '../src/lib/images/fallback';
import { renderImage } from '../src/lib/images/render';
import { imageMime } from '../src/lib/whatsapp';

/** O que o grupo lê: a legenda e, se a imagem não sair, o texto de reserva dela. */
const full = (out: Outgoing[]) =>
  out.map((o) => (o.type === 'image' ? `[img:${o.image.kind}] ${o.caption ?? ''}\n${imageAsText(o.image) ?? ''}` : asText([o]))).join('\n');
const kinds = (out: Outgoing[]) => out.flatMap((o) => (o.type === 'image' ? [o.image.kind] : []));

test('Cravada: listas com fonte, data, posições em ordem e nomes limpos', () => {
  assert.equal(new Set(CRAVADA_LISTS.map((l) => l.id)).size, CRAVADA_LISTS.length, 'id repetido');
  assert.ok(CRAVADA_WIKI.length >= 20, `só ${CRAVADA_WIKI.length} listas novas`);
  assert.ok(listsOfCategory('futebol').length >= 40, 'futebol');
  assert.ok(listsOfCategory('geral').length >= 40, 'geral');
  for (const l of CRAVADA_LISTS) {
    assert.ok(l.title.trim() && l.source.trim(), l.id);
    assert.ok(askableRanks(l).length >= 5, `${l.id}: poucas posições para pedir`);
    for (let i = 1; i < l.items.length; i++) assert.ok(l.items[i].rank >= l.items[i - 1].rank, `${l.id}: posição fora de ordem em ${l.items[i].name}`);
    for (const it of l.items) assert.match(it.name, /^[^|[\]{}=*♦]+$/u, `${l.id}: nome sujo "${it.name}"`);
  }
  for (const l of CRAVADA_WIKI) {
    assert.equal(l.category, 'futebol', l.id);
    assert.ok(l.items.length >= 18, `${l.id}: ${l.items.length} itens`);
    // Data no título: "até 17/11/2026", "2025/26", "de 2026"...
    assert.match(l.title, /20\d\d/, `${l.id}: sem data no título`);
    assert.match(l.source, /Wikipédia/, l.id);
    assert.ok(l.tags.length, l.id);
    for (const it of l.items) assert.match(it.detail ?? '', /\d/, `${l.id}: ${it.name} sem número`);
  }
  // Conferência de alguns números (Wikipédia, lida em 27/11/2026).
  const premier = getCravadaList('tabela-premier-2025-26')!;
  assert.deepEqual(premier.items.slice(0, 2).map((i) => `${i.rank} ${i.name} ${i.detail}`), ['1 Arsenal 85 pontos', '2 Manchester City 78 pontos']);
  assert.equal(getCravadaList('tabela-brasileirao-2025')!.items[0].name, 'Flamengo');
  assert.equal(getCravadaList('bola-de-ouro-2026')!.items[0].name, 'Harry Kane');
  assert.equal(getCravadaList('artilheiros-copas')!.items[0].name, 'Kylian Mbappé');
});

test('Cravada: pontos pela distância (cravou 100, perto vale mais, mínimo 5)', () => {
  assert.equal(cravadaPoints(0, 100), 100);
  assert.deepEqual([1, 5, 10, 20].map((d) => cravadaPoints(d, 100)), [74, 53, 35, 15]);
  assert.deepEqual([1, 3].map((d) => cravadaPoints(d, 20)), [53, 23]);
  assert.deepEqual([1, 3].map((d) => cravadaPoints(d, 10)), [49, 18]);
  assert.equal(cravadaPoints(99, 100), 5, 'na lista, mesmo longe, vale 5');
  for (let d = 1; d < 50; d++) assert.ok(cravadaPoints(d, 100) >= cravadaPoints(d + 1, 100), 'mais longe nunca vale mais');
});

test('Cravada: comandos, temas e palpite (apelido, sobrenome, nome repetido)', () => {
  for (const cmd of ['abrir cravada', 'jogar cravada', 'abrir a cravada', 'abrir posição']) assert.deepEqual(parsePartyStart(normalize(cmd)), { game: 'cravada', rest: '' }, cmd);
  assert.deepEqual(parsePartyStart('abrir cravada artilheiros'), { game: 'cravada', rest: 'artilheiros' });
  assert.equal(parsePartyStart('cravada'), null, 'sem "abrir" é conversa');
  assert.deepEqual(cravadaChoice('futebol'), { category: 'futebol', theme: null, listIds: [] });
  assert.deepEqual(cravadaChoice('geral'), { category: 'geral', theme: null, listIds: [] });
  assert.equal(cravadaChoice('xyzabc'), null);
  const art = cravadaChoice('de artilheiros')!;
  assert.equal(art.theme, 'artilheiros');
  assert.ok(art.listIds.includes('artilheiros-copas') && art.listIds.includes('artilheiros-premier'));
  assert.ok(cravadaChoice('premier')!.listIds.includes('tabela-premier-2025-26'));
  assert.ok(cravadaChoice('bola de ouro')!.listIds.includes('bola-de-ouro-2026'));

  const copas = getCravadaList('artilheiros-copas')!;
  const at = (raw: string) => copas.items[cravadaMatch(copas, raw, 10)!]?.name;
  assert.equal(at('CR7'), 'Cristiano Ronaldo');
  assert.equal(at('Ronaldo'), 'Ronaldo', 'Ronaldo é o Fenômeno; o português é Cristiano');
  assert.equal(at('Klose'), 'Miroslav Klose');
  assert.equal(at('mbape'), 'Kylian Mbappé');
  assert.equal(cravadaMatch(copas, 'Zé Ninguém da Silva', 10), -1);
  // O Neymar aparece duas vezes nas transferências: vale a posição mais perto da pedida.
  const tr = getCravadaList('transferencias')!;
  const neymar = tr.items.map((it, i) => (it.name === 'Neymar' ? i : -1)).filter((i) => i >= 0);
  assert.ok(neymar.length >= 2, 'Neymar duas vezes');
  const far = tr.items[neymar[neymar.length - 1]].rank;
  assert.equal(cravadaMatch(tr, 'Neymar', far), neymar[neymar.length - 1]);
  assert.equal(cravadaMatch(tr, 'Neymar', 1), neymar[0]);
  // Clubes: apelido do grupo.
  const br = getCravadaList('tabela-brasileirao-2025')!;
  assert.equal(br.items[cravadaMatch(br, 'Galo', 5)!].name, 'Atlético Mineiro');
  assert.equal(br.items[cravadaMatch(br, 'mengão', 5)!].name, 'Flamengo');
});

test('Cravada: partida (palpite escondido, revelação com a posição de cada um, placar)', async () => {
  const G = 'cravada@g.us';
  const store = new MemoryStore();
  let id = 0;
  let clock = Date.parse('2026-11-27T12:00:00Z');
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date(clock) };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick(G, null, deps, true);
  const state = async () => (await store.getActiveMatch(G))!.state as CravadaParty;

  await say('Ana', 'ativar jogos');
  assert.deepEqual(kinds(await say('Ana', 'temas da cravada')), ['cravadaThemes']);
  const notFound = await say('Ana', 'abrir cravada xyzabc');
  assert.deepEqual(kinds(notFound), ['cravadaThemes']);
  assert.match(asText(notFound), /Não achei o tema "xyzabc"/);
  const lobby = await say('Ana', 'abrir cravada brasileirão');
  assert.match(asText(lobby), /Cravada[\s\S]*Tema: \*brasileirão\*/);
  await say('Bia', 'entrar');
  await say('Caio', 'entrar');
  const startOut = await say('Ana', 'começar');
  assert.deepEqual(kinds(startOut), ['cravadaRound'], 'a pergunta vai em imagem');
  const start = full(startOut);
  assert.match(start, /Cravada\* valendo! 3 jogadores, 5 rodadas\. Tema: \*brasileirão\*/);
  assert.match(start, /Lista com \d+ nomes/);
  assert.match(start, /Rodada 1\/5[\s\S]*Qual é o \*\d+º\*\?/);

  let s = await state();
  assert.equal(s.rounds.length, 5);
  const list = getCravadaList(s.rounds[0].listId)!;
  const target = s.rounds[0].rank;
  const exact = list.items.find((i) => i.rank === target)!;
  const other = list.items.find((i) => Math.abs(i.rank - target) >= 2)!;
  // Palpite fica escondido: só 📌. Conversa não conta. Segundo palpite não vale.
  assert.equal(asText(await say('Ana', exact.name)), '[react:📌]');
  assert.equal(asText(await say('Bia', 'kkkkk')), '');
  assert.match(asText(await say('Ana', other.name)), /vale só o primeiro palpite/);
  assert.equal(asText(await say('Bia', other.name)), '[react:📌]');
  // Caio manda alguém fora da lista: todos palpitaram, a rodada fecha e revela.
  const revealOut = await say('Caio', 'Fulano Beltrano');
  assert.deepEqual(kinds(revealOut), ['cravadaReveal', 'cravadaRound'], 'revelação e próxima pergunta em imagem');
  const card = revealOut.find((o) => o.type === 'image' && o.image.kind === 'cravadaReveal');
  assert.ok(card && card.type === 'image' && card.image.kind === 'cravadaReveal');
  assert.equal(card.image.guesses.length, 3);
  assert.match(card.caption ?? '', /Cravou: \*Ana\* \(\+100\)/);
  const reveal = full(revealOut);
  assert.match(reveal, /Todos palpitaram/);
  assert.match(reveal, new RegExp(`🎯 \\*${target}º:\\*`));
  assert.match(reveal, new RegExp(`🎯 Ana: ${exact.name} — ${target}º, cravou! \\(\\+100\\)`));
  const d = Math.abs(other.rank - target);
  assert.match(reveal, new RegExp(`✅ Bia: ${other.name} — ${other.rank}º, ${d} posições de distância \\(\\+${cravadaPoints(d, list.items.length)}\\)`));
  assert.match(reveal, /❌ Caio: Fulano Beltrano — fora da lista \(0\)/);
  assert.match(reveal, /Fonte: /);
  assert.match(reveal, /Rodada 2\/5/, 'sem pausa nos testes, a próxima abre');
  s = await state();
  assert.deepEqual(s.players.map((p) => p.score), [100, cravadaPoints(d, list.items.length), 0]);

  // Rodada 2: ninguém palpita; o prazo revela mesmo assim.
  clock += 61_000;
  const timeout = full(await tick());
  assert.match(timeout, /Tempo esgotado[\s\S]*Ninguém palpitou/);
  // Até o fim: placar final com o vencedor.
  let last = '';
  for (let r = 3; r <= 5; r++) {
    clock += 61_000;
    last = full(await tick());
  }
  assert.match(last, /\[img:cravadaReveal\][\s\S]*\[img:partyScore\][\s\S]*Ana\* venceu com 100 pontos/);
  assert.match(last, /abrir cravada/);
  // Listas da partida no histórico do grupo (a próxima prioriza as outras).
  const seen = await store.getSeen(G, 'cravada');
  assert.ok(seen.includes(list.id));
});

test('Cravada: imagens da pergunta, da revelação e dos temas (e o texto de reserva)', async () => {
  const list = getCravadaList('artilheiros-seriea')!;
  const tie = askableRanks(list).find((r) => list.items.filter((i) => i.rank === r).length > 1)!;
  const guesses = [0, 5, -1].map((index, color) => ({ player: ['Ana', 'Bia', 'Caio'][color], color, guess: index < 0 ? 'Zé' : list.items[index].name, index, points: index < 0 ? 0 : 10 }));
  const specs = [
    { kind: 'cravadaRound' as const, listId: list.id, rank: tie, round: 2, total: 5, seconds: 60 },
    { kind: 'cravadaReveal' as const, listId: list.id, rank: tie, round: 2, total: 5, reason: 'Tempo esgotado.', guesses },
    { kind: 'cravadaReveal' as const, listId: 'tabela-brasileirao-2025', rank: 2, round: 5, total: 5, reason: 'Tempo esgotado.', guesses: [] },
    { kind: 'cravadaThemes' as const },
  ];
  for (const spec of specs) assert.equal(imageMime(await renderImage(spec)).mimetype, 'image/png', spec.kind);
  assert.match(imageAsText(specs[0])!, /empate: qualquer um dos empatados crava/);
  assert.match(imageAsText(specs[1])!, /❌ Caio: Zé — fora da lista \(0\)/);
  assert.match(imageAsText(specs[2])!, /Ninguém palpitou/);
  assert.match(imageAsText(specs[3])!, /Temas da Cravada/);
});

