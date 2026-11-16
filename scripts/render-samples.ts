/** Gera PNGs de exemplo de todas as telas em ./samples (npm run render:samples). */
import { mkdir, writeFile } from 'node:fs/promises';
import { SLOTS, type EscalacaoParty, type ImageSpec, type MatchState, type PartyPlayer, type Top10Party } from '../src/lib/game/types';
import { getTop10List } from '../src/lib/party/top10-lists';
import { renderImage } from '../src/lib/images/render';

const base: MatchState = {
  status: 'PLAYING',
  players: [{ jid: 'a', name: 'Júllio Dutra' }, { jid: 'b', name: 'Camila Rocha' }],
  modeId: 'artilheiros',
  restrictions: SLOTS.map(() => ({ kind: 'none' })),
  picks: [
    [{ name: 'Rogério Ceni', key: 'a', value: 131 }, { name: 'Sergio Ramos', key: 'b', value: 140 }, { name: 'Koeman', key: 'c', value: 250 }, null, null, null],
    [{ name: 'Neuer', key: 'd', value: 0 }, { name: 'Roberto Carlos', key: 'e', value: 113 }, { name: 'Marcelo', key: 'f', value: 60 }, { name: 'Kaká', key: 'g', value: 230 }, null, null],
  ],
  round: 3, turn: 0, turnStartedAt: 0, createdAt: 0, updatedAt: 0, winner: null,
};

const final: MatchState = {
  ...base,
  status: 'FINISHED',
  modeId: 'joias',
  restrictions: ['barcelona', 'real-madrid', 'flamengo', 'psg', 'palmeiras', 'manchester-city'].map((teamId) => ({ kind: 'club', teamId })),
  picks: [
    ['Ter Stegen', 'Pau Cubarsí', 'Vinícius Tobias', 'Wesley França', 'Zaïre-Emery', 'Estêvão'].map((name, i) => ({ name, key: `x${i}`, value: [34, 19, 22, 23, 20, 19][i] })),
    ['Iñaki Peña', 'Dean Huijsen', 'Ayrton Lucas', 'João Neves', 'Richard Ríos', 'Haaland'].map((name, i) => ({ name, key: `y${i}`, value: [27, 21, 29, 22, 26, 26][i] })),
  ],
  round: 5,
  winner: 0,
};

const names = ['Júllio', 'Camila', 'Tiago', 'Bernardo', 'Lu', 'Marina', 'Pedro'];
const players: PartyPlayer[] = names.map((n, i) => ({ jid: `p${i}`, name: n, score: 0, missed: 0, hits: 0, lastHitAt: 0 }));
const partyBase = {
  kind: 'party' as const, host: { jid: 'p0', name: 'Júllio' }, players, createdAt: 0, updatedAt: 0,
  deadline: null, timerToken: null, seq: 0, warned: [],
};
const pool = [['Rogério Ceni', 131], ['Neuer', 0], ['Alisson', 1], ['Ter Stegen', 0], ['Taffarel', 0], ['Marcos', 0], ['Dida', 0],
  ['Sergio Ramos', 140], ['Marcelo', 60], ['Roberto Carlos', 113], ['Piqué', 60], ['Lúcio', 30], ['Thiago Silva', 25], ['Cafu', 20],
  ['Koeman', 250], ['Maldini', 33], ['Daniel Alves', 70], ['Puyol', 21], ['Juan', 15], ['Miranda', 18], ['Marquinhos', 30]] as const;
const picks: EscalacaoParty['picks'] = {};
players.forEach((p, i) => {
  picks[p.jid] = SLOTS.map((_, slot) => {
    if (slot > 2) return null;
    const [name, value] = pool[slot * 7 + i];
    return { name, key: name, value };
  });
});
const escalacao: EscalacaoParty = {
  ...partyBase, game: 'escalacao', status: 'PLAYING', modeId: 'artilheiros', randomMode: false, options: { blind: false, turnSeconds: 60 },
  restrictions: SLOTS.map(() => ({ kind: 'none' })), round: 3, picks, used: [],
};
const finalPicks = structuredClone(picks);
players.forEach((p, i) => { for (let s = 3; s < 6; s++) finalPicks[p.jid][s] = { name: ['Zico', 'Kaká', 'Pelé', 'Iniesta', 'Lampard', 'Romário', 'Neymar'][(i + s) % 7], key: `k${i}${s}`, value: 100 + ((i * 37 + s * 53) % 400) }; });
const list = getTop10List('carros-2025')!;
const top10: Top10Party = {
  ...partyBase, game: 'top10', status: 'PLAYING', category: 'geral', listId: list.id,
  found: [null, { jid: 'p1', name: 'Camila' }, null, null, { jid: 'p0', name: 'Júllio' }, { jid: 'p2', name: 'Tiago' }, null, { jid: 'p1', name: 'Camila' }, null, null],
  guesses: [], lastJid: 'p1',
};

const specs: Record<string, ImageSpec> = {
  '7-sala-aberta': { kind: 'partyLobby', state: { ...escalacao, status: 'LOBBY', round: -1 } },
  '8-sala-tabela': { kind: 'partyTable', state: escalacao },
  '8b-sala-final': { kind: 'partyTable', state: { ...escalacao, status: 'FINISHED', round: 5, picks: finalPicks } },
  '9-top10': { kind: 'top10Board', state: top10, list, final: false },
  '9b-top10-final': { kind: 'top10Board', state: { ...top10, status: 'FINISHED' }, list, final: true },
  '1-desafio': { kind: 'challenge', host: 'Júllio Dutra' },
  '2-temas': { kind: 'modes' },
  '3-inicio': { kind: 'kickoff', state: { ...base, modeId: 'milionarios' } },
  '4-campinho-parcial': { kind: 'pitch', state: base },
  '4b-campinho-cego': { kind: 'pitch', state: { ...base, modeId: 'rodados', options: { blind: true, turnSeconds: 45 } } },
  '3b-inicio-cego-relampago': { kind: 'kickoff', state: { ...base, modeId: 'raiz', options: { blind: true, turnSeconds: 45 } } },
  '5-campinho-final': { kind: 'pitch', state: final },
  '6-ranking': {
    kind: 'ranking', groupName: 'Resenha FC',
    rows: [
      { jid: '1', name: 'Júllio Dutra', games: 9, wins: 6, draws: 1, losses: 2 },
      { jid: '2', name: 'Camila Rocha', games: 8, wins: 5, draws: 0, losses: 3 },
      { jid: '3', name: 'Tiago', games: 6, wins: 2, draws: 1, losses: 3 },
      { jid: '4', name: 'Bernardo Alves', games: 5, wins: 1, draws: 0, losses: 4 },
    ],
  },
};

async function main() {
  await mkdir('samples', { recursive: true });
  for (const [name, spec] of Object.entries(specs)) {
    const started = Date.now();
    await writeFile(`samples/${name}.png`, await renderImage(spec));
    console.log(`${name}.png  ${Date.now() - started} ms`);
  }
}

main();
