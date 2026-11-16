/** Gera PNGs de exemplo de todas as telas em ./samples (npm run render:samples). */
import { mkdir, writeFile } from 'node:fs/promises';
import { SLOTS, type ImageSpec, type MatchState } from '../src/lib/game/types';
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

const specs: Record<string, ImageSpec> = {
  '1-desafio': { kind: 'challenge', host: 'Júllio Dutra' },
  '2-temas': { kind: 'modes' },
  '3-inicio': { kind: 'kickoff', state: { ...base, modeId: 'milionarios' } },
  '4-campinho-parcial': { kind: 'pitch', state: base },
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
