import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage } from '../src/lib/game/engine';
import { getMode } from '../src/lib/game/modes';
import type { EscalacaoParty, MatchState, Outgoing, PlayerProfile } from '../src/lib/game/types';
import { PICK_TRIES, checkPick } from '../src/lib/game/validate';
import type { PlayerRecord } from '../src/lib/players/types';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

const wd = (id: string, name: string, clubs: string[], extra: Partial<PlayerRecord> = {}): PlayerRecord => ({
  id, name, aliases: [], positions: ['DEF'], nationality: 'Argentina', birthDate: '1988-02-12', heightCm: 183,
  clubs, debutYear: 2008, sitelinks: 80, stats: {}, source: 'wikidata', ...extra,
});

const aiProfile = (name: string, clubs: string[]): PlayerProfile => ({
  exists: true, name, positions: ['DEF'], nationality: 'Argentina', birthDate: '1988-02-12', clubs, heightCm: 183,
  careerGoals: 30, careerAssists: 10, peakValueEurM: 50, intlCaps: 120, intlGoals: 6, worldCupGoals: 0, uclGoals: 2,
  titles: 20, careerApps: 700, brasileiraoGoals: 0, libertadoresGoals: 1, worldCupsPlayed: 4, debutYear: 2008,
});

test('Rodada 13: a IA não recebe o clube e não soma clubes à ficha do Wikidata (Otamendi não passa no Boca)', async () => {
  const store = new MemoryStore();
  await store.upsertPlayers([wd('Q336128', 'Otamendi', ['Vélez Sarsfield', 'Porto', 'Valencia', 'Manchester City', 'Benfica'])]);
  const hints: Array<string | undefined> = [];
  // A IA "concorda" com o clube da rodada e devolve o Boca na lista.
  const lookup = createLookup(store, async (_q, hint) => (hints.push(hint), aiProfile('Otamendi', ['Vélez Sarsfield', 'Boca Juniors', 'Porto'])));
  const ctx = { position: 'DEF' as const, kind: 'club' as const, teamId: 'boca' };
  const profile = (await lookup('Otamendi', ctx))!;
  assert.deepEqual(hints, ['defensor'], 'só a posição vai para a IA');
  assert.ok(!profile.clubs.some((c) => /boca/i.test(c)), `clubes: ${profile.clubs.join(', ')}`);
  assert.deepEqual((await store.getPlayer('Q336128'))!.clubs, ['Vélez Sarsfield', 'Porto', 'Valencia', 'Manchester City', 'Benfica'], 'ficha intacta');
  const verdict = checkPick(profile, 'DEF', { kind: 'club', teamId: 'boca' }, getMode('artilheiros')!, new Date());
  assert.equal(verdict.ok, false);
  assert.ok(!verdict.ok && verdict.kind === 'club');
  assert.match(!verdict.ok ? verdict.reason : '', /não tem passagem pelo \*Boca Juniors\*\. Clubes: Vélez Sarsfield, Porto, Valencia, Manchester City, Benfica\./);
});

test('Rodada 13: em rodada de clube, os clubes vêm do Wikidata e a ficha contaminada é consertada (Puskás)', async () => {
  const store = new MemoryStore();
  // Ficha contaminada por respostas antigas da IA (Boca e Flamengo a mais).
  await store.upsertPlayers([wd('Q187125', 'Puskás', ['Budapest Honvéd', 'Real Madrid', 'Boca Juniors', 'Flamengo'], { positions: ['ATA'], nationality: 'Hungria' })]);
  let calls = 0;
  const clubs = async (id: string) => (calls++, id === 'Q187125' ? ['Budapest Honvéd', 'Real Madrid'] : null);
  const lookup = createLookup(store, async () => null, undefined, clubs);
  const ctx = { position: 'ATA' as const, kind: 'club' as const, teamId: 'flamengo' };
  const p = (await lookup('Puskás', ctx))!;
  assert.deepEqual(p.clubs, ['Budapest Honvéd', 'Real Madrid']);
  assert.deepEqual((await store.getPlayer('Q187125'))!.clubs, ['Budapest Honvéd', 'Real Madrid'], 'ficha consertada');
  // Segunda vez: vem do cache, sem consultar o Wikidata de novo.
  await lookup('Puskás', { ...ctx, teamId: 'real-madrid' });
  assert.equal(calls, 1);
  // Rodada que não é de clube: não consulta.
  await lookup('Puskás', { position: 'ATA', kind: 'country', teamId: 'brasil' });
  assert.equal(calls, 1);
  // Wikidata fora do ar: vale a ficha gravada.
  const store2 = new MemoryStore();
  await store2.upsertPlayers([wd('Q1', 'Fulano', ['Flamengo'])]);
  const down = createLookup(store2, async () => null, undefined, async () => {
    throw new Error('fora do ar');
  });
  const err = console.error;
  console.error = () => undefined;
  try {
    assert.deepEqual((await down('Fulano', { position: 'DEF', kind: 'club', teamId: 'flamengo' }))!.clubs, ['Flamengo']);
  } finally {
    console.error = err;
  }
});

function duel() {
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date('2026-11-25T12:00:00Z') };
  const say = (who: string, text: string, g = 'r13@g.us'): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: g, senderJid: `${who}@s`, senderName: who, text }, deps);
  return { store, say };
}

test('Rodada 13: 1x1 — 3 tentativas erradas na vez e ela acaba com o pior valor do tema', async () => {
  const { store, say } = duel();
  await say('Ana', 'ativar jogos');
  await say('Ana', 'iniciar jogo');
  await say('Bia', 'aceitar');
  await say('Ana', '7'); // Convocados (seleção sorteada)
  assert.match(asText(await say('Ana', 'Fulano Inexistente')), /Não encontrei[\s\S]*Tentativa 1\/3/);
  assert.match(asText(await say('Ana', 'Beltrano Inexistente')), /Tentativa 2\/3/);
  const out = asText(await say('Ana', 'Ciclano Inexistente'));
  assert.match(out, new RegExp(`errou ${PICK_TRIES} vezes e ficou com o pior valor do tema`));
  const s = (await store.getActiveMatch('r13@g.us'))!.state as MatchState;
  assert.equal(s.picks[0][0]?.name, 'Sem acerto');
  assert.equal(s.turn, 1, 'a vez passou para a Bia');
  // A Bia começa a vez dela com as 3 tentativas.
  assert.match(asText(await say('Bia', 'Fulano Inexistente')), /Tentativa 1\/3/);
});

test('Rodada 13: sala — 3 tentativas erradas na rodada e a pessoa fica com o pior valor', async () => {
  const { store, say } = duel();
  const G = 'r13sala@g.us';
  await say('Ana', 'ativar jogos', G);
  await say('Ana', 'abrir sala 7', G);
  await say('Bia', 'entrar', G);
  await say('Ana', 'começar', G);
  assert.match(asText(await say('Bia', 'Fulano Inexistente', G)), /Tentativa 1\/3/);
  await say('Bia', 'Beltrano Inexistente', G);
  assert.match(asText(await say('Bia', 'Ciclano Inexistente', G)), /errou 3 vezes e fica com o pior valor do tema nesta rodada/);
  const s = (await store.getActiveMatch(G))!.state as EscalacaoParty;
  const bia = s.players.find((p) => p.name === 'Bia')!;
  assert.equal(s.picks[bia.jid][0]?.name, 'Sem acerto');
  assert.equal(asText(await say('Bia', 'Outro Nome', G)), '', 'já respondeu nesta rodada');
});

test('Rodada 13: temas 20-22 (falta, finais, pênalti) com dado da IA e correção do admin', async () => {
  const { MODES } = await import('../src/lib/game/modes');
  const { STAT_QUESTION } = await import('../src/lib/ai/stats');
  const { parseCorrection } = await import('../src/lib/players/admin');
  assert.equal(MODES.length, 22);
  for (const [id, metric, n] of [['rei-da-falta', 'freeKickGoals', 20], ['decisivo', 'finalGoals', 21], ['dono-da-marca', 'penaltyGoals', 22]] as const) {
    const m = getMode(id)!;
    assert.equal(m.number, n);
    assert.equal(m.metric, metric);
    assert.ok(STAT_QUESTION[metric].length > 20);
  }
  assert.deepEqual(parseCorrection('corrigir juninho pernambucano gols de falta 77 fonte ogol'), { player: 'juninho pernambucano', stat: 'freeKickGoals', value: 77, source: 'ogol' });
  assert.equal(parseCorrection('corrigir cristiano ronaldo gols de penalti 175')?.stat, 'penaltyGoals');
  assert.equal(parseCorrection('corrigir messi gols em finais 30')?.stat, 'finalGoals');
});

test('Rodada 13: "ligas" mostra as 7 ligas; "novidades" mostra o que mudou (Impostor só vê o do Impostor)', async () => {
  const { NEWS, NEWS_LINE_MAX } = await import('../src/lib/game/novidades');
  const { setImpostorOnly } = await import('../src/lib/game/groupMode');
  const { store, say } = duel();
  const G = 'r13news@g.us';
  await say('Ana', 'ativar jogos', G);
  const ligas = (await say('Ana', 'ligas', G))[0];
  assert.ok(ligas.type === 'image' && ligas.image.kind === 'textBoard' && ligas.image.rows.length === 7);
  assert.match(ligas.type === 'image' ? ligas.caption ?? '' : '', /brasileirão[\s\S]*premier[\s\S]*abrir sala 1 brasileirão/);
  const news = (await say('Ana', 'novidades', G))[0];
  assert.ok(news.type === 'image' && news.image.kind === 'textBoard' && news.image.rows.length === NEWS[0].items.length);
  // Linhas curtas (sem corte na imagem).
  for (const n of NEWS) for (const i of n.items) for (const l of i.lines) assert.ok(l.length <= NEWS_LINE_MAX, `${l.length}: ${l}`);
  // Grupo só de Impostor: só os itens do Impostor.
  await setImpostorOnly(store, G, true);
  const imp = (await say('Ana', 'novidades', G))[0];
  assert.ok(imp.type === 'image' && imp.image.kind === 'textBoard');
  assert.ok(imp.type === 'image' && imp.image.kind === 'textBoard' && imp.image.rows.every((r) => /impostor/i.test(r.head)));
});

test('Rodada 13: depois de uma atualização, a imagem de novidades vai uma vez por grupo (e nunca no meio da partida)', async () => {
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date('2026-11-25T12:00:00Z'), announce: true };
  const say = (who: string, text: string, g = 'anuncio@g.us') =>
    handleMessage({ id: `a${++id}`, groupJid: g, senderJid: `${who}@s`, senderName: who, text }, deps);
  const hasNews = (out: Outgoing[]) => out.some((o) => o.type === 'image' && o.image.kind === 'textBoard' && o.image.pill === 'Novidades');
  assert.ok(hasNews(await say('Ana', 'ativar jogos')), 'primeira resposta leva as novidades');
  assert.ok(!hasNews(await say('Ana', 'ajuda')), 'só uma vez');
  assert.deepEqual(await say('Ana', 'conversa qualquer'), [], 'conversa não dispara nada');
  // Outro grupo, com partida aberta: espera a partida acabar.
  await say('Ana', 'ativar jogos', 'outro@g.us').then(() => store.unmarkSeen('outro@g.us', 'novidades', ['2026-11-25']));
  await say('Ana', 'abrir sala 1', 'outro@g.us');
  assert.ok(!hasNews(await say('Bia', 'entrar', 'outro@g.us')), 'no meio da sala, não');
});
