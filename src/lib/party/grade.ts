import { CLUBS, NATIONS } from '../game/teams';
import { firstName, normalize } from '../game/text';
import type { GradeParty, IncomingMessage, Outgoing, PartyPlayer } from '../game/types';
import { queryKeys } from '../players/keys';
import type { LookupContext, PlayerRecord } from '../players/types';
import { TITLE_INFO, TITLE_IDS, type TitleId } from './content/titles';
import { BASE_LOADING, findForRule } from './basegames';
import { PARTY_CONFIG, PartyDeps, Save, pendingResults, react, schedule, shuffle, text } from './common';
import {
  LEAGUES, criterionLabel, criterionMiss, encodeCriterion, featuresOf, parseCriterion, satisfies, titleNames, trivialPair,
  type Criterion, type Features,
} from './gridCriteria';

/**
 * Grade 3x3 (1 x 1, jogo da velha). Linhas: clubes ou ligas. Colunas:
 * seleções, títulos (campeão do mundo, Bola de Ouro, Champions,
 * Libertadores) ou ligas. Na sua vez, marque uma casa com um jogador que
 * cumpra a linha e a coluna (ex.: "A2 Neymar"). Errou ou estourou o tempo:
 * perde a vez. 3 casas em linha vence; sem linha, vence quem marcou mais.
 * A grade sai da base de jogadores e das listas de campeões: toda casa tem
 * resposta.
 */
export const GRADE_ROWS = ['A', 'B', 'C'];

export const GRADE_RULES = [
  'Linhas (A, B, C): clubes ou ligas. Colunas (1, 2, 3): seleções, títulos ou ligas.',
  'Na sua vez, mande a casa e o jogador: *A2 Neymar*. Ele precisa cumprir a linha e a coluna.',
  'Liga = jogou em algum clube dela. Título = estava no elenco campeão (Copa do Mundo, Champions, Libertadores) ou ganhou a Bola de Ouro.',
  `Errou ou passou de ${PARTY_CONFIG.grade.seconds}s: perde a vez. Ninguém repete jogador.`,
  '3 casas em linha (reta ou diagonal) vence. Sem linha, vence quem marcou mais casas.',
];

export function newGrade(): Pick<GradeParty, 'game' | 'rows' | 'cols' | 'cells' | 'turn' | 'used' | 'idle' | 'round'> {
  return { game: 'grade', rows: [], cols: [], cells: Array(9).fill(null), turn: 0, used: [], idle: 0, round: 0 };
}

const rowOf = (state: GradeParty, cell: number) => parseCriterion(state.rows[Math.floor(cell / 3)], 'club');
const colOf = (state: GradeParty, cell: number) => parseCriterion(state.cols[cell % 3], 'nation');

const ROW_CLUBS: Criterion[] = CLUBS.filter((t) => t.tier <= 2).map((t) => ({ kind: 'club', id: t.id }));
const LEAGUE_CRITERIA: Criterion[] = Object.keys(LEAGUES).map((id) => ({ kind: 'league', id }));
const NATION_CRITERIA: Criterion[] = NATIONS.filter((t) => t.tier <= 2).map((t) => ({ kind: 'nation', id: t.id }));
const TITLE_CRITERIA: Criterion[] = TITLE_IDS.map((id) => ({ kind: 'title', id }));

const pick = <T>(xs: T[], rng: () => number): T => xs[Math.floor(rng() * xs.length)];

/**
 * Monta a grade com os jogadores conhecidos (amostra da base + campeões das
 * listas). Colunas: sempre 1 seleção e 1 título; a terceira é seleção,
 * título ou liga. Linhas: clubes (gigantes e conhecidos) e às vezes uma liga.
 * Toda casa precisa de pelo menos 2 respostas na base (1, se não der).
 */
export function buildGrid(players: PlayerRecord[], rng: () => number): { rows: string[]; cols: string[] } | null {
  const seen = new Set<string>();
  const feats: Features[] = [];
  for (const r of players) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    feats.push(featuresOf(r));
  }
  const memo = new Map<string, number>();
  const count = (a: Criterion, b: Criterion) => {
    const key = `${encodeCriterion(a)}|${encodeCriterion(b)}`;
    let n = memo.get(key);
    if (n === undefined) {
      n = feats.reduce((acc, f) => acc + (satisfies(f, a) && satisfies(f, b) ? 1 : 0), 0);
      memo.set(key, n);
    }
    return n;
  };
  const brazil = NATION_CRITERIA.find((c) => c.id === 'brasil');
  for (let attempt = 0; attempt < 600; attempt++) {
    const need = attempt < 400 ? 2 : 1;
    const nation = brazil && rng() < 0.5 ? brazil : pick(NATION_CRITERIA, rng);
    const title = pick(TITLE_CRITERIA, rng);
    const r = rng();
    const kind = r < 0.4 ? NATION_CRITERIA : r < 0.7 ? TITLE_CRITERIA : LEAGUE_CRITERIA;
    // Duas colunas de seleção podem (cada casa cruza uma linha com uma coluna só).
    const options = kind.filter((c) => encodeCriterion(c) !== encodeCriterion(nation) && encodeCriterion(c) !== encodeCriterion(title));
    if (!options.length) continue;
    const cols = [nation, title, pick(options, rng)];
    const useLeague = rng() < 0.4;
    const rowPool = shuffle([...ROW_CLUBS, ...(useLeague ? LEAGUE_CRITERIA : [])], rng);
    const rows: Criterion[] = [];
    for (const row of rowPool) {
      if (row.kind === 'league' && rows.some((x) => x.kind === 'league')) continue;
      if (cols.some((c) => trivialPair(row, c) || count(row, c) < need)) continue;
      rows.push(row);
      if (rows.length === 3) break;
    }
    if (rows.length === 3) return { rows: rows.map(encodeCriterion), cols: shuffle(cols, rng).map(encodeCriterion) };
  }
  return null;
}

/** Chaves de busca dos campeões das listas (para trazer as fichas deles da base). */
const TITLE_KEYS = [...new Set(titleNames().flatMap((n) => queryKeys(n)))];

export async function startGrade(state: GradeParty, deps: PartyDeps): Promise<Outgoing[]> {
  const [sample, champions] = await Promise.all([
    deps.store.samplePlayers({ minSitelinks: 15, minClubs: 1, limit: 2000 }),
    deps.store.findPlayers(TITLE_KEYS, 3000),
  ]);
  const grid = buildGrid([...champions, ...sample], deps.rng);
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
      caption: `*Grade 3x3*: ${a.name} x ${b.name}\nO jogador precisa cumprir a linha e a coluna. Mande a casa e o nome: *A2 Neymar*.\n\n${turnLine(state)}`,
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

export function cellLabel(state: GradeParty, cell: number): string {
  return `${GRADE_ROWS[Math.floor(cell / 3)]}${(cell % 3) + 1} (${criterionLabel(rowOf(state, cell)).name} + ${criterionLabel(colOf(state, cell)).name})`;
}

/** Contexto para a busca completa (IA) quando o jogador não está na base. */
function lookupContext(row: Criterion, col: Criterion): LookupContext | undefined {
  if (row.kind === 'club') return { kind: 'club', teamId: row.id };
  if (col.kind === 'nation') return { kind: 'country', teamId: col.id };
  return undefined;
}

/**
 * Título fora da lista curada: pergunta de sim ou não à IA, guardada na base
 * (a mesma pergunta não se repete). Na dúvida, não vale.
 */
async function titleByAi(deps: PartyDeps, title: TitleId, record: PlayerRecord): Promise<boolean> {
  if (!deps.checkFact) return false;
  const key = `fato:${title}:${record.id}`;
  const cached = (await deps.store.getImportState(key).catch(() => null)) as { ok?: boolean } | null;
  if (cached && typeof cached.ok === 'boolean') return cached.ok;
  const who = [
    record.name,
    record.birthDate ? `nascido em ${record.birthDate.slice(0, 4)}` : '',
    record.nationality ? `da seleção ${record.nationality}` : '',
    record.clubs.length ? `clubes: ${record.clubs.slice(0, 12).join(', ')}` : '',
  ].filter(Boolean).join('; ');
  try {
    const ok = await deps.checkFact(`O futebolista ${who} ${TITLE_INFO[title].question}?`);
    if (ok !== null) await deps.store.setImportState(key, { ok }).catch(() => undefined);
    return ok === true;
  } catch (error) {
    console.error('conferir título falhou', error);
    return false;
  }
}

export async function gradeAnswer(state: GradeParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> {
  if (state.players[state.turn]?.jid !== player.jid) return [];
  const move = parseMove(msg.text);
  if (!move) return [];
  const who = firstName(player.name);
  if (state.cells[move.cell]) return [text(`A casa ${cellLabel(state, move.cell)} já é de ${firstName(state.cells[move.cell]!.name)}. Escolha outra.`)];
  const row = rowOf(state, move.cell);
  const col = colOf(state, move.cell);
  const score = (r: PlayerRecord) => {
    const f = featuresOf(r);
    return (satisfies(f, row) ? 1 : 0) + (satisfies(f, col) ? 1 : 0);
  };
  let found;
  try {
    found = await findForRule(deps, move.name, score, lookupContext(row, col));
  } catch (error) {
    console.error('lookup failed', error);
    return [text(`*${who}*, a consulta falhou. Manda de novo.`)];
  }
  if (!found) return [text(`❌ *${who}*: não achei "${move.name}". Manda outro (a vez continua sua).`)];
  const key = normalize(found.record.name);
  if (state.used.includes(key)) return [text(`*${found.record.name}* já foi usado. Manda outro (a vez continua sua).`)];
  player.missed = 0;
  const f = featuresOf(found.record);
  let rowOk = satisfies(f, row);
  let colOk = satisfies(f, col);
  // Título que a lista curada não cobre: a IA confere (só se o outro critério já vale).
  if (!rowOk && colOk && row.kind === 'title') rowOk = await titleByAi(deps, row.id as TitleId, found.record);
  if (!colOk && rowOk && col.kind === 'title') colOk = await titleByAi(deps, col.id as TitleId, found.record);
  if (!rowOk || !colOk) {
    const why = !rowOk ? criterionMiss(row) : criterionMiss(col);
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
