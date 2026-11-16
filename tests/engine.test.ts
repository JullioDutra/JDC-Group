import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { extractJson, parseProfile } from '../src/lib/ai/maritaca';
import { handleMessage, TURN_SECONDS } from '../src/lib/game/engine';
import { ageFromBirthDate } from '../src/lib/game/modes';
import { CLUBS, getTeam, playedForClub } from '../src/lib/game/teams';
import { looksLikePlayerName } from '../src/lib/game/text';
import type { Outgoing } from '../src/lib/game/types';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

const G = 'grupo@g.us';

function setup() {
  const store = new MemoryStore();
  let clock = Date.parse('2026-11-16T12:00:00Z');
  let id = 0;
  let calls = 0;
  const lookup = createLookup(store, (q) => (calls++, lookupDemo(q)));
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage(
      { id: `msg${++id}`, groupJid: G, groupName: 'Resenha', senderJid: `${who}@s`, senderName: who, text },
      { store, lookup, now: () => new Date(clock), rng: () => 0 },
    );
  return { store, say, advance: (s: number) => (clock += s * 1000), calls: () => calls };
}


test('grupo não ativado é ignorado', async () => {
  const { say } = setup();
  assert.deepEqual(await say('Ana', 'iniciar jogo'), []);
  assert.match(asText(await say('Ana', 'Ativar Grupo')), /ativado/);
  assert.match(asText(await say('Ana', 'iniciar jogo')), /img:challenge/);
});

test('partida completa no modo Artilheiros', async () => {
  const { say, store, calls } = setup();
  await say('Ana', 'ativar grupo');
  await say('Ana', 'iniciar jogo');
  assert.match(asText(await say('Ana', 'aceitar')), /próprio desafio/);
  assert.match(asText(await say('Bia', 'aceitar')), /img:modes/);
  assert.deepEqual(await say('Bia', '1'), [], 'só o anfitrião escolhe o tema');
  const kickoff = await say('Ana', '1');
  assert.match(asText(kickoff), /img:kickoff[\s\S]*Rodada 1\/6 · GOLEIRO[\s\S]*Ana/);

  // Fora da vez: um único aviso, sem gastar IA. Conversa de grupo e quem está de fora: ignorados.
  assert.match(asText(await say('Bia', 'Neuer')), /Segura, \*Bia\*: agora é a vez de \*Ana\* escolher o goleiro/);
  assert.deepEqual(await say('Bia', 'Alisson'), [], 'só um aviso por vez');
  assert.deepEqual(await say('Ana', 'kkkk'), []);
  assert.deepEqual(await say('Zé', 'Neuer'), [], 'quem está de fora não escala');
  assert.equal(calls(), 0);

  assert.match(asText(await say('Ana', 'Fulano Inexistente')), /Não encontrei/);
  assert.match(asText(await say('Ana', 'Messi')), /atacante\/meia.*pede um goleiro/);
  assert.match(asText(await say('Ana', 'ceni')), /Rogério Ceni.*131 gols[\s\S]*Bia/);
  assert.match(asText(await say('Bia', 'Rogério Ceni')), /já foi escalado/);
  const round1 = await say('Bia', 'neuer');
  assert.match(asText(round1), /img:pitch[\s\S]*131.*x.*0[\s\S]*Rodada 2\/6 · DEFENSOR[\s\S]*Bia/, 'rodada 2 começa pela desafiante');

  await say('Bia', 'Marcelo');
  await say('Ana', 'Sergio Ramos');
  await say('Ana', 'Koeman');
  await say('Bia', 'Roberto Carlos');
  await say('Bia', 'Kaká');
  await say('Ana', 'Zico');
  await say('Ana', 'Lampard');
  await say('Bia', 'Iniesta');
  await say('Bia', 'Pelé');
  const end = await say('Ana', 'cristiano ronaldo');
  // Ana: 131+140+250+520+300+950 = 2291 · Bia: 0+60+113+230+95+760 = 1258
  assert.match(asText(end), /img:pitch[\s\S]*2\.291.*x.*1\.258[\s\S]*Ana.*venceu/);
  assert.equal(await store.getActiveMatch(G), null);
  const ranking = await store.getRanking(G, 10);
  assert.deepEqual(ranking.map((r) => [r.name, r.wins, r.losses]), [['Ana', 1, 0], ['Bia', 0, 1]]);
  assert.match(asText(await say('Bia', 'ranking')), /img:ranking/);
  assert.match(asText(await say('Bia', 'iniciar jogo')), /img:challenge/, 'grupo liberado para revanche');
});

test('tema com clube sorteado e menor soma vence', async () => {
  const { say } = setup();
  await say('Ana', 'ativar grupo');
  await say('Ana', 'iniciar jogo');
  await say('Bia', 'aceitar');
  const out = asText(await say('Ana', '4')); // Joias; rng 0 => primeiro clube da lista
  assert.match(out, new RegExp(`Clube da rodada: \\*${CLUBS[0].name}\\*`));
  assert.match(asText(await say('Ana', 'Neuer')), /não tem passagem pelo/);
});

test('comando tempo aplica a penalidade só depois do limite', async () => {
  const { say, advance } = setup();
  await say('Ana', 'ativar grupo');
  await say('Ana', 'iniciar jogo');
  await say('Bia', 'aceitar');
  await say('Ana', '1');
  assert.match(asText(await say('Bia', 'tempo')), /Calma/);
  advance(TURN_SECONDS + 1);
  assert.match(asText(await say('Bia', 'tempo')), /estourou o tempo[\s\S]*Bia/);
});

test('desistência com a bola rolando dá W.O.', async () => {
  const { say, store } = setup();
  await say('Ana', 'ativar grupo');
  await say('Ana', 'iniciar jogo');
  await say('Bia', 'aceitar');
  await say('Ana', '1');
  await say('Ana', 'ceni');
  assert.match(asText(await say('Ana', 'desistir')), /Vitória de \*Bia\* por W\.O\./);
  assert.equal((await store.getRanking(G, 5))[0].name, 'Bia');
});

test('utilitários', () => {
  assert.equal(looksLikePlayerName('Lamine Yamal'), true);
  assert.equal(looksLikePlayerName('quem vai jogar hoje?'), false);
  assert.equal(looksLikePlayerName('kkkkkk'), false);
  assert.equal(ageFromBirthDate('2007-07-13', new Date('2026-11-16T00:00:00Z')), 19);
  assert.equal(playedForClub(getTeam('inter')!, ['Inter Miami']), false);
  assert.equal(playedForClub(getTeam('inter')!, ['Inter de Milão']), true);
  assert.equal(playedForClub(getTeam('milan')!, ['Inter Milan']), false);
  assert.equal(playedForClub(getTeam('barcelona')!, ['FC Barcelona']), true);
  assert.equal(parseProfile(extractJson('```json\n{"exists": false}\n```')), null);
  const p = parseProfile({ exists: true, name: 'X', positions: ['GOL', 'ZZZ'], careerGoals: '12', heightCm: -1 });
  assert.deepEqual([p?.positions, p?.careerGoals, p?.heightCm], [['GOL'], 12, null]);
});
