import { lookupHint } from '../game/validate';
import { CLUBS, drawTeams, getTeam, playedForClub } from '../game/teams';
import { firstName, looksLikePlayerName, normalize } from '../game/text';
import { DraftPick, IncomingMessage, MelhorTimeParty, Outgoing, POSITION_LABEL, PartyPlayer, Position, SLOTS } from '../game/types';
import { JudgeTeam, PARTY_CONFIG, PartyDeps, Save, pendingResults, react, schedule, text, warnOnce } from './common';

/**
 * Melhor Time (1 x 1). A cada rodada sorteia um clube; cada um, na sua vez,
 * escolhe um jogador que passou por ele e diz a posição ("atacante Dzeko").
 * A ordem das posições é livre. Ninguém repete jogador. No fim, a IA ou a
 * votação de quem não jogou decide qual time ficou melhor.
 */

export const VOTE_SECONDS = 60;

const POSITION_WORDS: Array<[Position, string[]]> = [
  ['GOL', ['goleiro', 'goleira', 'gol', 'arqueiro', 'gk']],
  ['DEF', ['zagueiro', 'zaga', 'defensor', 'defesa', 'lateral', 'lateral direito', 'lateral esquerdo', 'beque', 'def']],
  ['MEI', ['meia', 'meio campo', 'meio', 'volante', 'armador', 'meio campista', 'mei']],
  ['ATA', ['atacante', 'centroavante', 'ponta', 'avancado', 'artilheiro', 'centro avante', 'ata']],
];

/** "atacante Dzeko", "Dzeko atacante", "Dzeko (ATA)" → posição e nome. */
export function parseDraftPick(raw: string): { position: Position | null; name: string } {
  const norm = normalize(raw);
  // Expressões mais longas primeiro ("lateral esquerdo" antes de "lateral").
  const all = POSITION_WORDS.flatMap(([position, words]) => words.map((w) => [position, w] as const)).sort(
    (a, b) => b[1].length - a[1].length,
  );
  for (const [position, w] of all) {
    if (norm.startsWith(`${w} `)) return { position, name: raw.trim().split(/\s+/).slice(w.split(' ').length).join(' ') };
    if (norm.endsWith(` ${w}`)) {
      const parts = raw.trim().split(/\s+/);
      return { position, name: parts.slice(0, parts.length - w.split(' ').length).join(' ') };
    }
  }
  return { position: null, name: raw.trim() };
}

export function newMelhorTime(
  judge: 'ia' | 'votacao',
  hard = false,
): Pick<MelhorTimeParty, 'game' | 'judge' | 'hard' | 'phase' | 'round' | 'clubs' | 'picks' | 'turn' | 'used' | 'votes' | 'verdict'> {
  return { game: 'melhortime', judge, hard, phase: 'draft', round: -1, clubs: [], picks: {}, turn: 0, used: [], votes: {}, verdict: null };
}

function picksCount(state: MelhorTimeParty, jid: string): number {
  return (state.picks[jid] ?? []).filter(Boolean).length;
}

function openSlots(state: MelhorTimeParty, jid: string): Position[] {
  return SLOTS.filter((_, i) => !state.picks[jid]?.[i]);
}

function slotsLabel(slots: Position[]): string {
  const count = (p: Position) => slots.filter((s) => s === p).length;
  return (['GOL', 'DEF', 'MEI', 'ATA'] as Position[])
    .filter((p) => count(p) > 0)
    .map((p) => (count(p) > 1 ? `${p} x${count(p)}` : p))
    .join(', ');
}

function clubName(state: MelhorTimeParty): string {
  return getTeam(state.clubs[state.round])?.name ?? '';
}

function prompt(state: MelhorTimeParty): string {
  const p = state.players[state.turn];
  return (
    `*Rodada ${state.round + 1}/${SLOTS.length} · Clube: ${clubName(state)}*\n` +
    `*${p.name}*, escolha 1 jogador que passou pelo ${clubName(state)} e a posição. Ex.: *atacante Fulano*.\n` +
    `Suas vagas: ${slotsLabel(openSlots(state, p.jid))}. Tempo: ${PARTY_CONFIG.melhortime.seconds}s.`
  );
}

export function startMelhorTime(state: MelhorTimeParty, deps: PartyDeps): Outgoing[] {
  // Gigantes + conhecidos (nível 2); com "difícil", qualquer clube.
  state.clubs = drawTeams(CLUBS, SLOTS.length, deps.rng, state.hard ? 3 : 2).map((c) => c.id);
  state.status = 'PLAYING';
  state.phase = 'draft';
  state.round = 0;
  state.turn = 0;
  for (const p of state.players) state.picks[p.jid] = SLOTS.map(() => null);
  const judge = state.judge === 'ia' ? 'a IA decide' : 'quem não jogou vota';
  return [
    {
      type: 'image',
      image: { kind: 'draftBoard', state: structuredClone(state) },
      caption: `*Melhor Time*: ${state.players[0].name} x ${state.players[1].name}. 6 clubes sorteados, a ordem das posições é livre. No fim, ${judge}.`,
    },
    text(prompt(state)),
    schedule(state, PARTY_CONFIG.melhortime.seconds, deps.now.getTime(), 'mt'),
  ];
}

export async function melhorTimeAnswer(
  state: MelhorTimeParty,
  player: PartyPlayer,
  msg: IncomingMessage,
  deps: PartyDeps,
  save: Save,
): Promise<Outgoing[]> {
  const norm = normalize(msg.text);
  if (norm === 'desistir') {
    const other = state.players.find((p) => p.jid !== player.jid)!;
    state.verdict = { winner: state.players.indexOf(other), reason: `${player.name} desistiu.` };
    return save(finish(state, `*${player.name}* desistiu. Vitória de *${other.name}* por W.O.`));
  }
  if (state.phase !== 'draft') return [];
  const idx = state.players.findIndex((p) => p.jid === player.jid);
  if (idx !== state.turn) {
    if (!looksLikePlayerName(msg.text) && !parseDraftPick(msg.text).position) return [];
    return warnOnce(state, player.jid, `Segura, *${firstName(player.name)}*: agora é a vez de *${state.players[state.turn].name}*.`, save);
  }

  const { position, name } = parseDraftPick(msg.text);
  if (!name || !looksLikePlayerName(name)) return [];
  const who = firstName(player.name);
  const club = getTeam(state.clubs[state.round])!;
  let profile;
  try {
    profile = await deps.lookup(name, lookupHint(position ?? null, { kind: 'club', teamId: club.id }));
  } catch (error) {
    console.error('lookup failed', error);
    return [text('A consulta falhou por um instante. Mande de novo.')];
  }
  if (!profile) return [text(`❌ *${who}*: não achei "${name}". Manda outro.`)];

  const key = normalize(profile.name);
  const typed = normalize(name);
  if (state.used.includes(key) || state.used.includes(typed)) {
    return [text(`❌ *${who}*: ${profile.name} já foi escolhido nesta partida. Manda outro.`)];
  }
  if (!playedForClub(club, profile.clubs)) {
    return [text(`❌ *${who}*: ${profile.name} não tem passagem pelo *${club.name}*. Manda outro.`)];
  }
  const open = openSlots(state, player.jid);
  let slot: Position | undefined;
  if (position) {
    if (!profile.positions.includes(position)) {
      const actual = profile.positions.map((p) => POSITION_LABEL[p]).join('/');
      return [text(`❌ *${who}*: ${profile.name} é ${actual}, não ${POSITION_LABEL[position]}. Manda outro ou outra posição.`)];
    }
    if (!open.includes(position)) {
      return [text(`❌ *${who}*: sua vaga de ${POSITION_LABEL[position]} já está ocupada. Vagas livres: ${slotsLabel(open)}.`)];
    }
    slot = position;
  } else {
    slot = profile.positions.find((p) => open.includes(p));
    if (!slot) {
      return [text(`❌ *${who}*: ${profile.name} joga de ${profile.positions.map((p) => POSITION_LABEL[p]).join('/')}, e essa vaga já está ocupada. Vagas livres: ${slotsLabel(open)}.`)];
    }
  }

  const index = SLOTS.findIndex((s, i) => s === slot && !state.picks[player.jid][i]);
  const pick: DraftPick = {
    name: profile.name,
    key,
    club: club.name,
    strength: profile.peakValueEurM ?? 0,
    ...(typed !== key ? { aliases: [typed] } : {}),
  };
  state.picks[player.jid][index] = pick;
  state.used.push(key);
  if (typed !== key) state.used.push(typed);
  player.missed = 0;
  const lead = `✅ *${who}*: ${profile.name} — ${POSITION_LABEL[slot]} (${club.name})`;
  return save([text(lead), ...(await advance(state, deps))]);
}

/** Passa a vez; fecha a rodada quando os dois escolheram; no fim, vai para o julgamento. */
async function advance(state: MelhorTimeParty, deps: PartyDeps): Promise<Outgoing[]> {
  const other = 1 - state.turn;
  if (picksCount(state, state.players[other].jid) < state.round + 1) {
    state.turn = other;
    state.warned = [];
    return [text(prompt(state)), schedule(state, PARTY_CONFIG.melhortime.seconds, deps.now.getTime(), 'mt')];
  }
  if (state.round === SLOTS.length - 1) return judge(state, deps);
  state.round += 1;
  state.turn = state.round % 2; // quem abre a rodada alterna
  state.warned = [];
  return [
    { type: 'image', image: { kind: 'draftBoard', state: structuredClone(state) }, caption: `Fim da rodada ${state.round}.` },
    text(prompt(state)),
    schedule(state, PARTY_CONFIG.melhortime.seconds, deps.now.getTime(), 'mt'),
  ];
}

/** Prazo vencido: na escolha, a vaga fica vazia; na votação, apura os votos. */
export async function melhorTimeTimeout(state: MelhorTimeParty, deps: PartyDeps): Promise<Outgoing[]> {
  if (state.phase === 'voting') return tally(state);
  if (state.phase !== 'draft') return [];
  const p = state.players[state.turn];
  const index = state.picks[p.jid].findIndex((x) => !x);
  state.picks[p.jid][index] = { name: '—', key: `skip-${p.jid}-${state.round}`, club: clubName(state), strength: 0 };
  return [text(`Tempo esgotado: *${p.name}* ficou com uma vaga vazia.`), ...(await advance(state, deps))];
}

function teamsForJudge(state: MelhorTimeParty): [JudgeTeam, JudgeTeam] {
  return state.players.slice(0, 2).map((p) => ({
    player: p.name,
    lineup: SLOTS.map((s, i) => {
      const pick = state.picks[p.jid][i];
      return { position: POSITION_LABEL[s], name: pick?.name ?? '—', club: pick && pick.name !== '—' ? pick.club : '' };
    }),
  })) as [JudgeTeam, JudgeTeam];
}

/** Regra de reserva sem IA: soma do pico de valor de mercado dos escolhidos. */
function fallbackVerdict(state: MelhorTimeParty): { winner: number | 'draw'; reason: string } {
  const sums = state.players.map((p) => state.picks[p.jid].reduce((a, x) => a + (x?.strength ?? 0), 0));
  const winner = sums[0] === sums[1] ? 'draw' : sums[0] > sums[1] ? 0 : 1;
  return {
    winner,
    reason: `Sem a IA ligada, valeu a soma do pico de valor de mercado: ${state.players[0].name} ${Math.round(sums[0])} mi € x ${Math.round(sums[1])} mi € ${state.players[1].name}.`,
  };
}

async function judge(state: MelhorTimeParty, deps: PartyDeps): Promise<Outgoing[]> {
  if (state.judge === 'votacao') {
    state.phase = 'voting';
    state.votes = {};
    return [
      {
        type: 'image',
        image: { kind: 'draftBoard', state: structuredClone(state) },
        caption:
          `Times fechados! *Votação aberta por ${VOTE_SECONDS}s.*\n` +
          `Quem *não* jogou vota: mande *1* para o time de ${state.players[0].name} ou *2* para o de ${state.players[1].name}.`,
      },
      schedule(state, VOTE_SECONDS, deps.now.getTime(), 'mtv'),
    ];
  }
  let verdict;
  if (deps.judge) {
    try {
      verdict = await deps.judge(teamsForJudge(state));
    } catch (error) {
      console.error('judge failed', error);
    }
  }
  state.verdict = verdict ?? fallbackVerdict(state);
  return finish(state, 'Times fechados! A IA analisou.');
}

/** Voto de quem não jogou: "1"/"2" ou o nome de um dos dois. Um voto por pessoa. */
export function melhorTimeVote(state: MelhorTimeParty, msg: IncomingMessage, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (state.phase !== 'voting') return [];
  const norm = normalize(msg.text);
  let choice = norm === '1' ? 0 : norm === '2' ? 1 : -1;
  if (choice === -1) choice = state.players.findIndex((p) => normalize(firstName(p.name)) === norm || normalize(p.name) === norm);
  if (choice < 0) return [];
  if (state.players.some((p) => p.jid === msg.senderJid)) {
    return warnOnce(state, msg.senderJid, 'Quem jogou não vota. A decisão é de quem assistiu.', save);
  }
  if (msg.senderJid in state.votes) return [];
  state.votes[msg.senderJid] = choice;
  return save([react(msg, '✅')]);
}

function tally(state: MelhorTimeParty): Outgoing[] {
  const counts = [0, 1].map((i) => Object.values(state.votes).filter((v) => v === i).length);
  const total = counts[0] + counts[1];
  const winner = counts[0] === counts[1] ? 'draw' : counts[0] > counts[1] ? 0 : 1;
  state.verdict = {
    winner,
    reason:
      total === 0
        ? 'Ninguém votou.'
        : `Votos: ${state.players[0].name} ${counts[0]} x ${counts[1]} ${state.players[1].name}.`,
  };
  return finish(state, 'Votação encerrada.');
}

function finish(state: MelhorTimeParty, lead: string): Outgoing[] {
  state.status = 'FINISHED';
  state.phase = 'done';
  state.deadline = null;
  state.timerToken = null;
  const v = state.verdict!;
  const headline =
    v.winner === 'draw'
      ? 'Empate: os dois times ficaram no mesmo nível.'
      : `🏆 *${state.players[v.winner].name}* montou o melhor time!`;
  pendingResults.set(
    state,
    state.players.map((p, i) => ({
      player: { jid: p.jid, name: p.name },
      result: v.winner === 'draw' ? 'draw' : v.winner === i ? 'win' : 'loss',
    })),
  );
  return [
    {
      type: 'image',
      image: { kind: 'draftBoard', state: structuredClone(state) },
      caption: `${lead}\n\n${headline}\n${v.reason}\n\nMande *iniciar melhor time* para outra partida.`,
    },
  ];
}
