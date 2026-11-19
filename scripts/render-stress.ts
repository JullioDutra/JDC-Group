/**
 * Estresse de todas as imagens: 10 a 20 jogadores, nomes longos, acentos de fora
 * e emoji. Gera os PNGs em ./samples/stress e avisa caractere sem glifo.
 * npm run render:stress [-- pasta filtro]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { SLOTS } from '../src/lib/game/types';
import type { ImageSpec, MatchState, PartyPlayer } from '../src/lib/game/types';
import { glyphSafeSpec, glyphSafeTree, renderImage } from '../src/lib/images/render';
import { buildImage } from '../src/lib/images/templates';
import { TOP10_LISTS } from '../src/lib/party/top10-lists';
import { getLineup } from '../src/lib/party/content/lineups';
import { INTRUSO_SETS } from '../src/lib/party/content/intruso';
import { FLAGS } from '../src/lib/party/content/flags';
import { CONEXOES } from '../src/lib/party/content/conexoes';
import { TOP100_LISTS } from '../src/lib/party/content/top100';
import { IMPOSTOR_SECRETS } from '../src/lib/party/content/impostor';
import { impostorBoard } from '../src/lib/party/impostor';
import { leilaoBoard } from '../src/lib/party/leilao';
import { draftRows } from '../src/lib/party/draft';
import { STOP_CATEGORIES } from '../src/lib/party/content/stop';

const OUT = process.argv[2] ?? 'samples/stress';
const NAMES = [
  'Júllio Dutra 🔥', 'Maria Eduarda Albuquerque', 'Zé', 'Luka Modrić', 'Şükür ⚽ Fan', 'Ødegaard da Silva', 'Szczęsny',
  '🦁🦁', 'João Pedro de Oliveira Santos', 'Ana Beatriz 💚', 'Ćiro Đorđević', 'Tchê', 'Bia ✨', 'Rafaél Łukasz', 'Lu',
  'Ŷvonne', 'Mestre Yoda 👽', 'Kvaratskhelia Fã Clube', 'Gui', 'Paulão do Churrasco',
];
const P = (n: number): PartyPlayer[] =>
  NAMES.slice(0, n).map((name, i) => ({ jid: `p${i}@s`, name, score: Math.max(0, 900 - i * 47), missed: 0, hits: i, lastHitAt: i }));
const base = (game: string, n: number) => ({
  kind: 'party' as const, game, status: 'PLAYING' as const, host: { jid: 'p0@s', name: NAMES[0] }, players: P(n),
  createdAt: 0, updatedAt: 0, deadline: null, timerToken: null, seq: 0, warned: [],
});

const longPicks = ['Gianluigi Buffon', 'Sergio Ramos García', 'Virgil van Dijk', 'Luka Modrić', 'Kevin De Bruyne', 'Kvaratskhelia'];
const match: MatchState = {
  status: 'FINISHED', players: [{ jid: 'a', name: NAMES[1] }, { jid: 'b', name: NAMES[3] }], modeId: 'joias',
  restrictions: ['barcelona', 'real-madrid', 'flamengo', 'psg', 'palmeiras', 'manchester-city'].map((teamId) => ({ kind: 'club', teamId })),
  picks: [
    longPicks.map((name, i) => ({ name, key: `x${i}`, value: 100 + i })),
    ['Čech', 'Szczęsny', 'Šeško', 'Gvardiol', 'Çalhanoğlu', 'Mesut Özil'].map((name, i) => ({ name, key: `y${i}`, value: 10 * i })),
  ],
  round: 5, turn: 0, turnStartedAt: 0, createdAt: 0, updatedAt: 0, winner: 1,
} as MatchState;

const rankRows = NAMES.slice(0, 12).map((name, i) => ({ jid: `${i}`, name, games: 30 - i, wins: 20 - i, draws: i % 3, losses: i }));

const escalacao = {
  ...base('escalacao', 10), modeId: 'artilheiros', randomMode: false, options: { blind: false, turnSeconds: 60 },
  restrictions: SLOTS.map(() => ({ kind: 'none' })), round: 5, status: 'FINISHED', used: [],
  picks: Object.fromEntries(P(10).map((p, i) => [p.jid, SLOTS.map((_, s) => ({ name: longPicks[(i + s) % 6], key: `${i}${s}`, value: 1000 + i * 37 + s }))])),
};

const t10 = TOP10_LISTS.reduce((a, b) => (JSON.stringify(b).length > JSON.stringify(a).length ? b : a));
const top10 = {
  ...base('top10', 10), category: 'futebol', listId: t10.id,
  found: t10.items.map((_: unknown, i: number) => (i % 2 ? { jid: `p${i}@s`, name: NAMES[i] } : null)), guesses: [], lastJid: 'p1@s',
};

const quiz = { ...base('quetime', 15), round: 1, totalRounds: 6, order: [], clue: 0, attempts: [], guesses: [], solved: false, roundHits: [], category: null };

const longest = <T,>(xs: T[], f: (x: T) => string) => xs.reduce((a, b) => (f(b).length > f(a).length ? b : a));
const iset0 = longest(INTRUSO_SETS, (s) => s.members.join('') + s.intruder + s.reason);
const iset = { ...iset0, options: [iset0.members[0], iset0.intruder, ...iset0.members.slice(1)] };
const intruso = {
  ...base('intruso', 15), round: 0, totalRounds: 5, order: [iset.id], options: iset.options.slice(0, 5), intruderIndex: 1,
  marks: P(15).map((p, i) => ({ index: i % 5, jid: p.jid, name: p.name })), lastJid: 'p1@s', category: null,
};

const dp = (name: string, club: string) => ({ name, key: name, club, strength: 50 });
const draft1x1 = {
  ...base('melhortime', 2), judge: 'ia', phase: 'done', status: 'FINISHED', round: 5,
  clubs: ['fenerbahce', 'santos', 'flamengo', 'barcelona', 'real-madrid', 'milan'], turn: 0, used: [], votes: {},
  verdict: { winner: 1, reason: 'Defesa com Maldini e Roberto Carlos e ataque com Neymar e Romário pesam mais que o meio de Zico e Seedorf, e o banco ainda tem Kvaratskhelia para decidir no fim do jogo.' },
  picks: {
    'p0@s': [dp('Volkan Demirel', 'Fenerbahçe'), dp('Diego Lugano', 'Fenerbahçe'), dp('Gerard Piqué', 'Barcelona'), dp('Zico', 'Flamengo'), dp('Clarence Seedorf', 'Milan'), dp('Pelé', 'Santos')],
    'p1@s': [dp('Iker Casillas', 'Real Madrid'), dp('Roberto Carlos', 'Real Madrid'), dp('Paolo Maldini', 'Milan'), dp('Alex de Souza', 'Fenerbahçe'), dp('Neymar Júnior', 'Santos'), dp('Romário', 'Flamengo')],
  },
};

const flag = FLAGS[0];
const conex = longest(CONEXOES, (c) => c.groups.flatMap((g) => g.items).join('') + c.groups.map((g) => g.label).join(''));
const tiles = conex.groups.flatMap((g) => g.items);
const conexoes = (reveal: boolean) => ({
  ...base('conexoes', 12), category: null, round: 0, totalRounds: 2, order: [conex.id], tiles,
  solved: reveal ? [0, 1, 2, 3].map((g, i) => ({ group: g, jid: i < 3 ? `p${i}@s` : null, name: NAMES[i] })) : [{ group: 2, jid: 'p1@s', name: NAMES[1] }],
  errors: {}, tried: [], lastJid: null,
});

const grade = {
  ...base('grade', 2), rows: ['club:manchester-united', 'league:premier-league', 'club:borussia-dortmund'], cols: ['nation:bosnia-herzegovina', 'title:champions', 'nation:argentina'],
  cells: [{ jid: 'p0@s', name: 'Kvaratskhelia' }, null, { jid: 'p1@s', name: 'Cristiano Ronaldo' }, null, { jid: 'p0@s', name: 'Szczęsny' }, null, null, null, { jid: 'p1@s', name: 'Pierre-Emerick Aubameyang' }],
  turn: 0, used: [], idle: 0, round: 0,
};

const t100 = longest(TOP100_LISTS, (l) => l.title + l.items.map((i) => i.name).join(''));
const top100 = (final: boolean) => ({
  ...base('top100', 20), listId: t100.id, day: '2026-11-19',
  found: t100.items.map((_, i) => (i % 3 === 0 ? { jid: `p${i % 20}@s`, name: NAMES[i % 20] } : null)), lives: {}, misses: [], round: 0,
});

const secret = longest(IMPOSTOR_SECRETS, (s) => s.name);
const imp = (final: boolean) => {
  const players = P(10);
  return {
    ...base('impostor', 10), status: final ? 'FINISHED' : 'PLAYING', theme: secret.theme, secretId: secret.id, impostor: players[3].jid,
    order: players.map((p) => p.jid), lap: 2, turn: 0, phase: final ? 'guess' : 'debate',
    clues: players.flatMap((p, i) => [{ jid: p.jid, lap: 0, word: ['tetracampeão', 'Maracanã', null, 'pentacampeonato'][i % 4] }, { jid: p.jid, lap: 1, word: ['Copacabana', 'internacionalmente'][i % 2] }]),
    votes: Object.fromEntries(players.map((p, i) => [p.jid, players[(i + 3) % 10].jid])), runoffVotes: {}, runoff: [], ballot: players.map((p) => p.jid),
    fast: false, round: 0, totalRounds: 1,
  };
};

const leilao = (final: boolean, mode: 'overall' | 'votacao') => {
  const players = P(8);
  const squad = (i: number) => [
    { name: 'Gianluigi Donnarumma', positions: ['GOL'], slot: 'GOL', overall: 89, price: 31 },
    { name: 'Joško Gvardiol', positions: ['DEF'], slot: 'DEF', overall: 86, price: 22 },
    { name: 'Trent Alexander-Arnold', positions: ['DEF'], slot: 'DEF', overall: 87, price: 19 },
    { name: 'Kvaratskhelia', positions: ['MEI', 'ATA'], slot: 'MEI', overall: 88, price: 25 },
    ...(i % 2 ? [{ name: 'Kylian Mbappé Lottin', positions: ['ATA'], slot: 'ATA', overall: 91, price: 3 }] : []),
  ];
  return {
    ...base('leilao', 8), mode, phase: final ? 'auction' : 'auction', round: 12, totalRounds: 48, lots: [],
    budget: Object.fromEntries(players.map((p) => [p.jid, 100])), squads: Object.fromEntries(players.map((p, i) => [p.jid, squad(i)])), bid: null,
    votes: Object.fromEntries(players.map((p, i) => [p.jid, (i + 1) % 8])),
  };
};

const draft = {
  ...base('draft', 8), phase: 'voting', round: 4, totalRounds: 5,
  rules: [
    { pos: 'GOL', kind: 'club', value: 'flamengo', label: 'Flamengo' }, { pos: 'DEF', kind: 'nation', value: 'italia', label: 'Itália' },
    { pos: 'MEI', kind: 'letter', value: 'K', label: 'letra K' }, { pos: 'ATA', kind: 'club', value: 'real-madrid', label: 'Real Madrid' },
    { pos: 'ATA', kind: 'none', value: '', label: 'livre' },
  ],
  sequence: [], pick: 0, used: [],
  picks: Object.fromEntries(P(8).map((p) => [p.jid, ['Diego Alves Carreira', 'Giorgio Chiellini', 'Kvaratskhelia', 'Cristiano Ronaldo dos Santos', 'Robert Lewandowski'].map((name) => ({ name, key: name }))])),
  votes: Object.fromEntries(P(8).map((p, i) => [p.jid, i % 3])),
};

const stopRows = P(10).map((p, i) => ({
  head: `${p.name} · ${50 - i * 10}`,
  lines: STOP_CATEGORIES.slice(0, 5).map((c, k) => `${c.label}: ${['Pernambuco', 'Paulo Henrique Ganso', 'Pernambucano', '', 'Paralelepípedo'][k] || '—'} ${k === 3 ? '' : k === 2 ? '0 (repetida)' : '+10'}`.trim()),
}));
const sobRows = P(15).map((p, i) => ({ head: p.name, lines: [`${15 - i} acertos · ${i ? 'eliminado' : '2 vidas'}`], highlight: i === 0 }));

const specs: Record<string, ImageSpec> = {
  'help': { kind: 'help' },
  'modes': { kind: 'modes' },
  'challenge': { kind: 'challenge', host: NAMES[8] },
  'kickoff': { kind: 'kickoff', state: { ...match, status: 'PLAYING', round: 0 } as MatchState },
  'pitch-final': { kind: 'pitch', state: match },
  'ranking-10': { kind: 'ranking', groupName: 'Resenha dos Amigos do Futebol de Quinta 🍺', rows: rankRows.slice(0, 10), season: 3, since: '01/11' },
  'season': {
    kind: 'season', groupName: 'Resenha dos Amigos do Futebol 🍺', season: 2, startedAt: '2026-10-01T12:00:00Z', endedAt: '2026-11-19T12:00:00Z',
    rows: rankRows, matches: 184, highlights: [
      { label: 'Mais vitórias', name: NAMES[0], value: '20 vitórias' }, { label: 'Mais partidas', name: NAMES[8], value: '30 partidas' },
      { label: 'Melhor aproveitamento', name: NAMES[1], value: '78%' }, { label: 'Mais empates', name: NAMES[7], value: '2 empates' },
    ],
    games: [{ name: 'Impostor do Futebol', count: 40 }, { name: 'Escalação em Grupo', count: 33 }],
  },
  'season-3p': {
    kind: 'season', groupName: 'Grupo', season: 1, startedAt: '2026-10-01T12:00:00Z', endedAt: '2026-11-19T12:00:00Z',
    rows: rankRows.slice(0, 3), matches: 7, highlights: [{ label: 'Mais vitórias', name: NAMES[3], value: '3 vitórias' }],
    games: [{ name: 'Impostor do Futebol', count: 4 }, { name: 'Que time é esse?', count: 2 }, { name: 'Top 100 do Dia', count: 1 }],
  },
  'lobby-impostor-10': { kind: 'partyLobby', state: { ...base('impostor', 10), status: 'LOBBY' } as never },
  'lobby-quetime-15': { kind: 'partyLobby', state: { ...quiz, status: 'LOBBY' } as never },
  'lobby-top100-20': { kind: 'partyLobby', state: { ...top100(false), status: 'LOBBY' } as never },
  'lobby-leilao-8': { kind: 'partyLobby', state: { ...leilao(false, 'overall'), status: 'LOBBY' } as never },
  'lobby-grade': { kind: 'partyLobby', state: { ...grade, status: 'LOBBY', players: P(1) } as never },
  'table-escalacao-10': { kind: 'partyTable', state: escalacao as never },
  'top10-final': { kind: 'top10Board', state: { ...top10, status: 'FINISHED' } as never, list: t10, final: true },
  'top10-playing': { kind: 'top10Board', state: top10 as never, list: t10, final: false },
  'lineup-chelsea': { kind: 'lineupQuiz', state: quiz as never, lines: getLineup('chelsea-2012')!.lines },
  'score-15': { kind: 'partyScore', state: quiz as never, title: 'Resultado final', final: true },
  'score-top100-20': { kind: 'partyScore', state: top100(true) as never, title: 'Resultado final', final: true },
  'intruso-reveal-15': { kind: 'intrusoBoard', state: intruso as never, reason: iset.reason, reveal: true },
  'intruso-open': { kind: 'intrusoBoard', state: { ...intruso, marks: intruso.marks.slice(0, 3) } as never, reason: '', reveal: false },
  'melhortime-final': { kind: 'draftBoard', state: draft1x1 as never },
  'flag': { kind: 'flagQuiz', state: quiz as never, flag: flag.flag },
  'conexoes-open': { kind: 'conexoesBoard', state: conexoes(false) as never, reveal: false },
  'conexoes-reveal': { kind: 'conexoesBoard', state: conexoes(true) as never, reveal: true },
  'grade': { kind: 'gradeBoard', state: grade as never, final: false },
  'top100-playing': { kind: 'top100Board', state: top100(false) as never, final: false },
  'top100-final': { kind: 'top100Board', state: top100(true) as never, final: true },
  'impostor-mesa': (impostorBoard(imp(false) as never, false) as { image: ImageSpec }).image,
  'impostor-final': (impostorBoard(imp(true) as never, true) as { image: ImageSpec }).image,
  'leilao-overall-final': (leilaoBoard(leilao(true, 'overall') as never, true) as { image: ImageSpec }).image,
  'leilao-4-final': (leilaoBoard({ ...leilao(true, 'overall'), players: P(4) } as never, true) as { image: ImageSpec }).image,
  'ranking-7': { kind: 'ranking', groupName: 'Grupo', rows: rankRows.slice(0, 7) },
  'leilao-votacao': (leilaoBoard(leilao(false, 'votacao') as never, false) as { image: ImageSpec }).image,
  'draft-votos': { kind: 'textBoard', game: 'draft', title: 'Resultado', subtitle: '8 votos', rows: draftRows(draft as never, true) },
  'stop-10': { kind: 'textBoard', game: 'stop', title: 'Letra P', subtitle: 'Rodada 3 de 3', rows: stopRows },
  'sobrevivente-15': { kind: 'textBoard', game: 'sobrevivente', title: 'Resultado final', subtitle: '8 voltas', rows: sobRows },
};

/** Texto que sobrou fora das fontes depois do filtro (deve ser vazio). */
const leftovers = (el: unknown): string[] => {
  if (el == null || typeof el === 'boolean') return [];
  if (typeof el === 'string') return [...el].filter((c) => !/[\n\x20-\x7e\xa0-\xffıŒœ–—‘-‚“-„•…′″‹›€™−]/.test(c));
  if (Array.isArray(el)) return el.flatMap(leftovers);
  const props = (el as { props?: { children?: unknown } }).props;
  return props ? leftovers(props.children) : [];
};

async function main() {
  await mkdir(OUT, { recursive: true });
  const only = process.argv[3];
  for (const [name, spec] of Object.entries(specs)) {
    if (only && !name.includes(only)) continue;
    const t = Date.now();
    const bad = leftovers(glyphSafeTree(buildImage(glyphSafeSpec(spec))));
    try {
      await writeFile(`${OUT}/${name}.png`, await renderImage(spec));
      console.log(`${name.padEnd(24)} ok ${Date.now() - t}ms${bad.length ? `  SEM GLIFO: ${bad.join('')}` : ''}`);
    } catch (e) {
      console.log(`${name.padEnd(24)} FALHOU ${(e as Error).message.slice(0, 120)}`);
    }
  }
}
main();
