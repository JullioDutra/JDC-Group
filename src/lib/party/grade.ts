import { CLUBS, NATIONS, getTeam, isFromNation, playedForClub } from '../game/teams';
import { firstName, normalize } from '../game/text';
import type { GradeParty, IncomingMessage, Outgoing, PartyPlayer } from '../game/types';
import type { PlayerRecord } from '../players/types';
import { BASE_LOADING, findForRule, knownClubs, nationOf } from './basegames';
import { PARTY_CONFIG, PartyDeps, Save, pendingResults, react, schedule, shuffle, text } from './common';

/**
 * Grade 3x3 (1 x 1, jogo da velha): linhas = clubes, colunas = seleções. Na
 * sua vez, marque uma casa com um jogador que cumpra as duas (ex.: "A2
 * Neymar"). Errou ou estourou o tempo: perde a vez. 3 casas em linha vence;
 * sem linha, vence quem marcou mais casas. A grade é montada a partir da
 * base, e só entra casa que tem resposta.
 */
export const GRADE_ROWS = ['A', 'B', 'C'];

export const GRADE_RULES = [
  'Linhas são clubes (A, B, C); colunas são seleções (1, 2, 3).',
  'Na sua vez, mande a casa e o jogador: *A2 Neymar* (passou pelo clube da linha e é da seleção da coluna).',
  `Errou ou passou de ${PARTY_CONFIG.grade.seconds}s: perde a vez. Ninguém repete jogador.`,
  '3 casas em linha (reta ou diagonal) vence. Sem linha, vence quem marcou mais casas.',
];

export function newGrade(): Pick<GradeParty, 'game' | 'rows' | 'cols' | 'cells' | 'turn' | 'used' | 'idle' | 'round'> {
  return { game: 'grade', rows: [], cols: [], cells: Array(9).fill(null), turn: 0, used: [], idle: 0, round: 0 };
}

/**
 * Monta a grade: 3 seleções e 3 clubes em que todas as 9 casas têm ao menos
 * um jogador conhecido na base (de preferência 2).
 */
export function buildGrid(sample: PlayerRecord[], rng: () => number): { rows: string[]; cols: string[] } | null {
  const count = new Map<string, number>();
  const perNation = new Map<string, number>();
  for (const r of sample) {
    const nation = nationOf(r, 2);
    if (!nation) continue;
    perNation.set(nation.id, (perNation.get(nation.id) ?? 0) + 1);
    for (const club of knownClubs(r, 1)) count.set(`${club.id}|${nation.id}`, (count.get(`${club.id}|${nation.id}`) ?? 0) + 1);
  }
  const nations = NATIONS.filter((n) => (perNation.get(n.id) ?? 0) >= 8);
  const clubs = CLUBS.filter((c) => c.tier === 1);
  const cell = (c: string, n: string) => count.get(`${c}|${n}`) ?? 0;
  for (let attempt = 0; attempt < 400; attempt++) {
    // Brasil entra em boa parte das grades (o grupo é brasileiro).
    const withBrazil = rng() < 0.6 && nations.some((n) => n.id === 'brasil');
    const pool = shuffle(nations.filter((n) => !withBrazil || n.id !== 'brasil'), rng);
    const cols = [...(withBrazil ? ['brasil'] : []), ...pool.map((n) => n.id)].slice(0, 3);
    if (cols.length < 3) return null;
    const need = attempt < 250 ? 2 : 1;
    const eligible = shuffle(clubs.filter((c) => cols.every((n) => cell(c.id, n) >= need)), rng);
    if (eligible.length >= 3) return { rows: eligible.slice(0, 3).map((c) => c.id), cols: shuffle(cols, rng) };
  }
  return null;
}

export async function startGrade(state: GradeParty, deps: PartyDeps): Promise<Outgoing[]> {
  const sample = await deps.store.samplePlayers({ minSitelinks: 15, minClubs: 1, limit: 2500 });
  const grid = buildGrid(sample, deps.rng);
  if (!grid) {
    state.status = 'CANCELLED';
    return [text(BASE_LOADING)];
  }
  state.rows = grid.rows;
  state.cols = grid.cols;
  state.cells = Array(9).fill(null);
  state.turn = deps.rng() < 0.5 ? 0 : 1;
  state.status = 'PLAYING';
  const [a, b] = state.players;
  return [
    {
      type: 'image',
      image: { kind: 'gradeBoard', state: structuredClone(state), final: false },
      caption: `*Grade 3x3*: ${a.name} x ${b.name}\nLinha = clube · coluna = seleção. Mande a casa e o jogador: *A2 Neymar*.\n\n${turnLine(state)}`,
    },
    schedule(state, PARTY_CONFIG.grade.seconds, deps.now.getTime(), 'gd'),
  ];
}

const turnLine = (state: GradeParty) => `Vez de *${firstName(state.players[state.turn].name)}* (${PARTY_CONFIG.grade.seconds}s).`;

/** "A2 Neymar", "a 2 neymar", "2A Neymar". */
export function parseMove(raw: string): { cell: number; name: string } | null {
  const m = raw.trim().match(/^([abc])\s*([123])\s+(.+)$/i) ?? raw.trim().match(/^([123])\s*([abc])\s+(.+)$/i);
  if (!m) return null;
  const [letter, digit] = /^[abc]$/i.test(m[1]) ? [m[1], m[2]] : [m[2], m[1]];
  const row = GRADE_ROWS.indexOf(letter.toUpperCase());
  const col = Number(digit) - 1;
  const name = m[3].trim();
  return name.length >= 2 && name.length <= 40 ? { cell: row * 3 + col, name } : null;
}

const fitsCell = (state: GradeParty, cell: number) => (r: Pick<PlayerRecord, 'clubs' | 'nationality'>) => {
  const club = getTeam(state.rows[Math.floor(cell / 3)])!;
  const nation = getTeam(state.cols[cell % 3])!;
  return (playedForClub(club, r.clubs) ? 1 : 0) + (isFromNation(nation, r.nationality) ? 1 : 0);
};

export function cellLabel(state: GradeParty, cell: number): string {
  return `${GRADE_ROWS[Math.floor(cell / 3)]}${(cell % 3) + 1} (${getTeam(state.rows[Math.floor(cell / 3)])?.name} + ${getTeam(state.cols[cell % 3])?.name})`;
}

export async function gradeAnswer(state: GradeParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> {
  if (state.players[state.turn]?.jid !== player.jid) return [];
  const move = parseMove(msg.text);
  if (!move) return [];
  const who = firstName(player.name);
  if (state.cells[move.cell]) return [text(`A casa ${cellLabel(state, move.cell)} já é de ${firstName(state.cells[move.cell]!.name)}. Escolha outra.`)];
  let found;
  try {
    found = await findForRule(deps, move.name, fitsCell(state, move.cell), { kind: 'club', teamId: state.rows[Math.floor(move.cell / 3)] });
  } catch (error) {
    console.error('lookup failed', error);
    return [text(`*${who}*, a consulta falhou. Manda de novo.`)];
  }
  if (!found) return [text(`❌ *${who}*: não achei "${move.name}". Manda outro (a vez continua sua).`)];
  const key = normalize(found.record.name);
  if (state.used.includes(key)) return [text(`*${found.record.name}* já foi usado. Manda outro (a vez continua sua).`)];
  player.missed = 0;
  if (found.score < 2) {
    const club = getTeam(state.rows[Math.floor(move.cell / 3)])!;
    const nation = getTeam(state.cols[move.cell % 3])!;
    const why = !playedForClub(club, found.record.clubs) ? `não passou pelo ${club.name}` : `não é da seleção ${nation.name}`;
    return save([text(`❌ ${found.record.name} ${why}. *${who}* perdeu a vez.`), ...nextTurn(state, deps, false)]);
  }
  state.used.push(key);
  state.cells[move.cell] = { jid: player.jid, name: found.record.name };
  state.idle = 0;
  if (hasLine(state, player.jid)) return save([react(msg, '✅'), ...finishGrade(state, `✅ ${found.record.name} em ${cellLabel(state, move.cell)}.\n🏆 *${player.name}* fechou uma linha!`, player.jid)]);
  if (state.cells.every(Boolean)) return save([react(msg, '✅'), ...finishGrade(state, 'Grade completa.', null)]);
  return save([react(msg, '✅'), ...nextTurn(state, deps, true, `✅ ${found.record.name} em ${cellLabel(state, move.cell)}.`)]);
}

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

export function hasLine(state: GradeParty, jid: string): boolean {
  return LINES.some((line) => line.every((i) => state.cells[i]?.jid === jid));
}

function nextTurn(state: GradeParty, deps: PartyDeps, marked: boolean, note?: string): Outgoing[] {
  if (!marked) state.idle += 1;
  if (state.idle >= 4) return finishGrade(state, 'Quatro vezes seguidas sem casa marcada.', null);
  state.turn = 1 - state.turn;
  state.round += 1;
  return [
    { type: 'image', image: { kind: 'gradeBoard', state: structuredClone(state), final: false }, caption: [note, turnLine(state)].filter(Boolean).join('\n') },
    schedule(state, PARTY_CONFIG.grade.seconds, deps.now.getTime(), 'gd'),
  ];
}

export function gradeTimeout(state: GradeParty, deps: PartyDeps): Outgoing[] {
  const p = state.players[state.turn];
  return [text(`⏱️ *${firstName(p.name)}* não jogou a tempo: perdeu a vez.`), ...nextTurn(state, deps, false)];
}

/** Fim: quem fechou a linha vence; sem linha, quem tem mais casas. */
export function finishGrade(state: GradeParty, reason: string, winnerJid: string | null): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const counts = state.players.map((p) => state.cells.filter((c) => c?.jid === p.jid).length);
  let winner = winnerJid;
  if (!winner && counts[0] !== counts[1]) winner = state.players[counts[0] > counts[1] ? 0 : 1].jid;
  state.players.forEach((p, i) => {
    p.score = counts[i];
  });
  pendingResults.set(
    state,
    state.players.map((p) => ({ player: { jid: p.jid, name: p.name }, result: !winner ? 'draw' : p.jid === winner ? 'win' : 'loss' })),
  );
  const w = state.players.find((p) => p.jid === winner);
  const headline = w
    ? winnerJid
      ? ''
      : `🏆 *${w.name}* venceu: ${Math.max(...counts)} casas x ${Math.min(...counts)}.`
    : `Empate: ${counts[0]} casas para cada.`;
  return [
    {
      type: 'image',
      image: { kind: 'gradeBoard', state: structuredClone(state), final: true },
      caption: [reason, headline, 'Mande *desafio grade* para jogar de novo.'].filter(Boolean).join('\n\n'),
    },
  ];
}
