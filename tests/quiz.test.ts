import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { Outgoing, QuizParty } from '../src/lib/game/types';
import { getLineup, LINEUPS } from '../src/lib/party/content/lineups';
import { getWhoIs, WHOIS } from '../src/lib/party/content/whois';
import { parsePartyStart } from '../src/lib/party/engine';
import { parseTeamGuess } from '../src/lib/party/quiz';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

const G = 'quiz@g.us';

function setup() {
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date('2026-11-16T12:00:00Z') };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick(G, null, deps, true);
  const state = async () => (await store.getActiveMatch(G))!.state as QuizParty;
  return { store, say, tick, state };
}

async function open(say: (w: string, t: string) => Promise<Outgoing[]>, command: string) {
  await say('Ana', 'ativar jogos');
  const lobby = asText(await say('Ana', command));
  await say('Bia', 'entrar');
  await say('Caio', 'entrar');
  return { lobby, start: asText(await say('Ana', 'começar')) };
}

test('conteúdo: ids únicos, 5 dicas por ficha, escalações com 11 nomes', () => {
  assert.equal(new Set(LINEUPS.map((l) => l.id)).size, LINEUPS.length);
  for (const l of LINEUPS) assert.equal(l.lines.flat().length, 11, `${l.id} não tem 11 titulares`);
  assert.equal(new Set(WHOIS.map((c) => c.id)).size, WHOIS.length);
  for (const c of WHOIS) assert.equal(c.clues.length, 5);
});

test('comando de abrir exige "abrir"/"jogar": a pergunta solta na conversa não abre sala', () => {
  assert.equal(parsePartyStart('que time e esse'), null);
  assert.equal(parsePartyStart('quem e'), null);
  assert.deepEqual(parsePartyStart('abrir que time e esse'), { game: 'quetime', rest: '' });
  assert.deepEqual(parsePartyStart('jogar quem e'), { game: 'quemeh', rest: '' });
});

test('palpite de time e ano', () => {
  assert.deepEqual(parseTeamGuess('Brasil 94'), { team: 'brasil', year: 1994 });
  assert.deepEqual(parseTeamGuess('o Barça de 2011'), { team: 'barca', year: 2011 });
  assert.deepEqual(parseTeamGuess('Bayern de Munique 2020'), { team: 'bayern munique', year: 2020 });
  assert.deepEqual(parseTeamGuess('seleção de 70'), { team: 'selecao', year: 1970 });
  assert.deepEqual(parseTeamGuess('Liverpool'), { team: 'liverpool', year: null });
});

test('Que time é esse?: 1 palpite por pessoa, repetido não gasta, time sem ano vale 60', async () => {
  const { say, state } = setup();
  const { lobby, start } = await open(say, 'abrir que time é esse');
  assert.match(lobby, /img:partyLobby[\s\S]*Sala aberta: Que time é esse\?/);
  assert.match(start, /valendo! 3 jogadores, 6 rodadas[\s\S]*img:lineupQuiz[\s\S]*Rodada 1\/6[\s\S]*timer:46s/);

  const lineup = getLineup((await state()).order[0])!;
  const wrongTeam = lineup.team === 'Chelsea' ? 'Ajax 1995' : 'Chelsea 2012';
  assert.equal(asText(await say('Caio', wrongTeam)), '[react:❌]');
  assert.deepEqual(await say('Caio', `${lineup.team} ${lineup.year}`), [], 'Caio já gastou a tentativa');

  const wrongYear = `${lineup.team} ${lineup.year - 3}`;
  assert.match(asText(await say('Bia', wrongYear)), /acertou o time, mas não o ano \(\+60\)/);
  assert.match(asText(await say('Ana', wrongYear)), /esse palpite já foi dado/, 'repetido não gasta a tentativa');
  const solved = asText(await say('Ana', `${lineup.aliases[0]} ${String(lineup.year).slice(2)}`));
  assert.match(solved, new RegExp(`✅ \\*Ana\\* acertou: \\*${lineup.team} ${lineup.year}\\* \\(\\+150\\)`));
  assert.match(solved, /Era \*[\s\S]*Rodada 2\/6/);

  const s = await state();
  assert.deepEqual(s.players.map((p) => [p.name, p.score]), [['Ana', 150], ['Bia', 60], ['Caio', 0]]);
});

test('Que time é esse?: tempo esgotado revela a resposta; partida inteira grava o ranking', async () => {
  const { say, tick, state, store } = setup();
  await open(say, 'abrir que time é esse');
  const first = getLineup((await state()).order[0])!;
  assert.match(asText(await tick()), new RegExp(`Tempo esgotado\\. Ninguém acertou\\. Era \\*${first.team} ${first.year}\\*`));
  let last = '';
  for (let r = 1; r < 6; r++) {
    const l = getLineup((await state()).order[r])!;
    last = asText(await say(r % 2 ? 'Bia' : 'Caio', `${l.team} ${l.year}`));
  }
  assert.match(last, /img:partyScore[\s\S]*🏆 \*Bia\* venceu com 450 pontos\.\n1º Bia — 450\n2º Caio — 300\n3º Ana — 0/);
  assert.deepEqual((await store.getRanking(G, 5)).map((r) => [r.name, r.wins]), [['Bia', 1], ['Caio', 0], ['Ana', 0]]);
});

test('Quem é?: dicas vão saindo no tempo e o acerto vale menos a cada dica', async () => {
  const { say, tick, state } = setup();
  const { start } = await open(say, 'abrir quem é');
  const card = getWhoIs((await state()).order[0])!;
  assert.match(start, new RegExp(`Rodada 1\\/8\\* · Quem é\\?\\nDica 1: ${card.clues[0].replace(/[.()]/g, '\\$&')}[\\s\\S]*timer:13s`));
  assert.equal(asText(await say('Caio', 'Taffarel')), '[react:❌]', 'Taffarel não está nas fichas');
  const clue2 = asText(await tick());
  assert.match(clue2, /^Dica 2: /);
  const hit = asText(await say('Bia', card.answer));
  assert.match(hit, new RegExp(`✅ \\*Bia\\* acertou na dica 2: \\*${card.answer}\\* \\(\\+120\\)`));
  assert.match(hit, /Rodada 2\/8/);
});

test('Quem é?: depois da 5ª dica sem acerto, a rodada fecha com a resposta', async () => {
  const { say, tick, state } = setup();
  await open(say, 'abrir quem é');
  const card = getWhoIs((await state()).order[0])!;
  for (let i = 0; i < 4; i++) await tick();
  assert.match(asText(await tick()), new RegExp(`Tempo esgotado\\. Ninguém acertou\\. Era \\*${card.answer}\\*[\\s\\S]*Rodada 2\\/8`));
});
