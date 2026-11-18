import { CLUBS, NATIONS, drawTeams, getTeam, isFromNation, playedForClub } from '../game/teams';
import { firstName, looksLikePlayerName, normalize } from '../game/text';
import { playContext } from '../game/validate';
import type { IncomingMessage, Outgoing, PartyPlayer, PenaltisParty, Position } from '../game/types';
import { POSITION_LABEL } from '../game/types';
import type { PlayerRecord } from '../players/types';
import { findForRule } from './basegames';
import { PARTY_CONFIG, PartyDeps, Save, pendingResults, react, schedule, text } from './common';

/**
 * Pênaltis (1 x 1): 5 cobranças para cada, alternadas. Cada cobrança tem uma
 * regra ("atacante que jogou no Milan"): citou um jogador que cumpre, é gol;
 * não cumpre ou estourou o tempo, o goleiro defendeu. Empate: morte súbita.
 * Acaba antes se um lado não puder mais alcançar o outro.
 */
export const PENALTIS_RULES = [
  '5 cobranças para cada, alternadas. Cada cobrança tem uma regra: posição + clube ou seleção.',
  'Na sua cobrança, mande o nome de um jogador que cumpra a regra: gol. Não cumpre: o goleiro defendeu.',
  `Tempo por cobrança: ${PARTY_CONFIG.penaltis.seconds}s. Nome não encontrado não conta: manda outro. Ninguém repete jogador.`,
  'Empate depois das 5: morte súbita.',
];

const POSITIONS: Position[] = ['ATA', 'ATA', 'MEI', 'MEI', 'DEF', 'GOL'];

export function newPenaltis(): Pick<PenaltisParty, 'game' | 'kicks' | 'kick' | 'used' | 'round'> {
  return { game: 'penaltis', kicks: [], kick: 0, used: [], round: 0 };
}

function drawKick(deps: PartyDeps, jid: string, last?: string): PenaltisParty['kicks'][number] {
  const pos = POSITIONS[Math.floor(deps.rng() * POSITIONS.length)];
  const club = deps.rng() < 0.6;
  let team = drawTeams(club ? CLUBS : NATIONS, 2, deps.rng, 1).find((t) => t.id !== last)!;
  if (!team) team = (club ? CLUBS : NATIONS)[0];
  const label = club ? `${POSITION_LABEL[pos]} que jogou no ${team.name}` : `${POSITION_LABEL[pos]} da seleção ${team.name}`;
  return { jid, pos, kind: club ? 'club' : 'nation', teamId: team.id, label, result: null };
}

function addPair(state: PenaltisParty, deps: PartyDeps, first: string, second: string) {
  const last = state.kicks.at(-1)?.teamId;
  const a = drawKick(deps, first, last);
  state.kicks.push(a);
  state.kicks.push(drawKick(deps, second, a.teamId));
}

export async function startPenaltis(state: PenaltisParty, deps: PartyDeps): Promise<Outgoing[]> {
  const order = deps.rng() < 0.5 ? [0, 1] : [1, 0];
  const [first, second] = order.map((i) => state.players[i].jid);
  state.kicks = [];
  for (let i = 0; i < 5; i++) addPair(state, deps, first, second);
  state.kick = 0;
  state.status = 'PLAYING';
  const starter = state.players[order[0]];
  return [text(`*Pênaltis*: ${state.players[0].name} x ${state.players[1].name}\n5 cobranças para cada. Quem começa: *${firstName(starter.name)}*.`), ...kickPrompt(state, deps)];
}

const nameOf = (state: PenaltisParty, jid: string) => firstName(state.players.find((p) => p.jid === jid)?.name ?? '?');

export function goals(state: PenaltisParty, jid: string): number {
  return state.kicks.filter((k) => k.jid === jid && k.result === 'gol').length;
}

/** Placar com a sequência: "Rafa ⚽⚽❌ 2 x 1 ⚽❌❌ Duda". */
export function scoreLine(state: PenaltisParty): string {
  const [a, b] = state.players;
  const seq = (jid: string) => state.kicks.filter((k) => k.jid === jid && k.result).map((k) => (k.result === 'gol' ? '⚽' : '❌')).join('');
  return `${firstName(a.name)} ${seq(a.jid)} *${goals(state, a.jid)} x ${goals(state, b.jid)}* ${seq(b.jid)} ${firstName(b.name)}`;
}

function kickPrompt(state: PenaltisParty, deps: PartyDeps): Outgoing[] {
  const k = state.kicks[state.kick];
  const n = Math.floor(state.kick / 2) + 1;
  const sudden = state.kick >= 10 ? ' (morte súbita)' : '';
  return [
    text(`⚽ *Cobrança ${n}${sudden}* · bate *${nameOf(state, k.jid)}*\nRegra: *${k.label}*\n${PARTY_CONFIG.penaltis.seconds}s.`),
    schedule(state, PARTY_CONFIG.penaltis.seconds, deps.now.getTime(), 'pn'),
  ];
}

const fitsKick = (k: PenaltisParty['kicks'][number]) => (r: Pick<PlayerRecord, 'positions' | 'clubs' | 'nationality'>) => {
  const team = getTeam(k.teamId)!;
  const teamOk = k.kind === 'club' ? playedForClub(team, r.clubs) : isFromNation(team, r.nationality);
  const posOk = r.positions.length === 0 || r.positions.includes(k.pos);
  return (teamOk ? 1 : 0) + (posOk ? 1 : 0);
};

export async function penaltisAnswer(state: PenaltisParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> {
  const k = state.kicks[state.kick];
  if (!k || k.jid !== player.jid) return [];
  const raw = msg.text.trim();
  if (!looksLikePlayerName(raw)) return [];
  const who = firstName(player.name);
  let found;
  try {
    found = await findForRule(deps, raw, fitsKick(k), playContext(k.pos, { kind: k.kind === 'club' ? 'club' : 'country', value: k.teamId }));
  } catch (error) {
    console.error('lookup failed', error);
    return [text(`*${who}*, a consulta falhou. Manda de novo.`)];
  }
  if (!found) return [text(`*${who}*, não achei "${raw}". Manda outro: a cobrança continua.`)];
  const key = normalize(found.record.name);
  if (state.used.includes(key)) return [text(`*${found.record.name}* já foi usado. Manda outro: a cobrança continua.`)];
  state.used.push(key);
  player.missed = 0;
  k.answer = found.record.name;
  if (found.score >= 2) {
    k.result = 'gol';
    return save([react(msg, '⚽'), ...advance(state, deps, `⚽ *GOL!* ${found.record.name}.`)]);
  }
  k.result = 'defendeu';
  const team = getTeam(k.teamId)!;
  const why = fitsKick(k)({ ...found.record, positions: [] }) < 2
    ? k.kind === 'club' ? `não jogou no ${team.name}` : `não é da seleção ${team.name}`
    : `não é ${POSITION_LABEL[k.pos]}`;
  return save([react(msg, '🧤'), ...advance(state, deps, `🧤 *Defendeu!* ${found.record.name} ${why}.`)]);
}

export function penaltisTimeout(state: PenaltisParty, deps: PartyDeps): Outgoing[] {
  const k = state.kicks[state.kick];
  if (!k) return [];
  k.result = 'defendeu';
  return advance(state, deps, `⏱️ *${nameOf(state, k.jid)}* demorou: o goleiro defendeu.`);
}

/** Ainda dá para alguém alcançar? Decide o vencedor ou segue. */
function decided(state: PenaltisParty): string | null | 'draw' {
  const [a, b] = state.players.map((p) => p.jid);
  const ga = goals(state, a);
  const gb = goals(state, b);
  const left = (jid: string) => state.kicks.slice(0, 10).filter((k) => k.jid === jid && !k.result).length;
  if (state.kick <= 10) {
    if (ga > gb + left(b)) return a;
    if (gb > ga + left(a)) return b;
    if (state.kick < 10) return null;
    return ga === gb ? 'draw' : ga > gb ? a : b;
  }
  // Morte súbita: decide a cada par completo.
  if (state.kick % 2 !== 0) return null;
  return ga === gb ? 'draw' : ga > gb ? a : b;
}

function advance(state: PenaltisParty, deps: PartyDeps, note: string): Outgoing[] {
  state.kick += 1;
  state.round = state.kick;
  const result = decided(state);
  if (result && result !== 'draw') return finishPenaltis(state, `${note}\n${scoreLine(state)}`, result);
  if (result === 'draw') {
    if (state.kick >= 30) return finishPenaltis(state, `${note}\n${scoreLine(state)}\nEmpate depois de 10 rodadas de morte súbita.`, null);
    const first = state.kicks[0].jid;
    const second = state.kicks[1].jid;
    addPair(state, deps, first, second);
    return [text(`${note}\n${scoreLine(state)}${state.kick === 10 ? '\n\nEmpate! *Morte súbita*.' : ''}`), ...kickPrompt(state, deps)];
  }
  return [text(`${note}\n${scoreLine(state)}`), ...kickPrompt(state, deps)];
}

export function finishPenaltis(state: PenaltisParty, reason: string, winnerJid: string | null): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  for (const p of state.players) p.score = goals(state, p.jid);
  pendingResults.set(
    state,
    state.players.map((p) => ({ player: { jid: p.jid, name: p.name }, result: !winnerJid ? 'draw' : p.jid === winnerJid ? 'win' : 'loss' })),
  );
  const w = state.players.find((p) => p.jid === winnerJid);
  const headline = w ? `🏆 *${w.name}* venceu nos pênaltis!` : 'Terminou empatado.';
  return [text(`${reason}\n\n${headline}\n\nMande *desafio pênaltis* para jogar de novo.`)];
}
