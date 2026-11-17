import { playContext } from '../game/validate';
import { CLUBS, NATIONS, drawTeams, getTeam, isFromNation, playedForClub } from '../game/teams';
import { firstName, looksLikePlayerName, normalize } from '../game/text';
import type { DraftParty, IncomingMessage, Outgoing, PartyPlayer, PlayerProfile, Position } from '../game/types';
import { POSITION_LABEL } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, award, pendingResults, react, schedule, shuffle, text, warnOnce } from './common';

/**
 * Draft da Resenha (do "Draft 5x5" do Projeto Trivia): até 8 pessoas, ordem em
 * serpente, 5 rodadas com regra (posição + letra, clube ou seleção). A IA
 * confere cada escolha e ninguém repete. No fim, o grupo vota no melhor time.
 */
export const DRAFT_POSITIONS: Position[] = ['GOL', 'DEF', 'MEI', 'ATA', 'ATA'];
export const DRAFT_VOTE_SECONDS = 90;

export function newDraft(): Pick<DraftParty, 'game' | 'phase' | 'round' | 'totalRounds' | 'rules' | 'sequence' | 'pick' | 'picks' | 'used' | 'votes'> {
  return { game: 'draft', phase: 'draft', round: -1, totalRounds: PARTY_CONFIG.draft.rounds!, rules: [], sequence: [], pick: 0, picks: {}, used: [], votes: {} };
}

export const DRAFT_RULES = [
  'Ordem em serpente (1→último, último→1). 5 rodadas: GOL, DEF, MEI e 2 ATA.',
  'Cada rodada tem um clube ou uma seleção sorteada. Na sua vez, mande o nome.',
  'No fim, todo o grupo vota no melhor time (ninguém vota no próprio).',
];

function drawRules(rng: () => number): DraftParty['rules'] {
  // Toda rodada tem um time (clube ou seleção): não existe rodada "livre" nem só de letra.
  const kinds = shuffle<DraftParty['rules'][number]['kind']>(['club', 'nation', 'club', 'nation', 'club'], rng);
  const clubs = drawTeams(CLUBS, 3, rng, 1);
  const nations = drawTeams(NATIONS, 2, rng, 1);
  return DRAFT_POSITIONS.map((pos, i) => {
    const kind = kinds[i];
    const posLabel = POSITION_LABEL[pos];
    if (kind === 'club') {
      const c = clubs.shift()!;
      return { pos, kind, value: c.id, label: `${posLabel} que passou pelo ${c.name}` };
    }
    const n = nations.shift()!;
    return { pos, kind, value: n.id, label: `${posLabel} da seleção ${n.name}` };
  });
}

const snake = (state: DraftParty, round: number) => {
  const order = state.players.map((p) => p.jid);
  return round % 2 === 0 ? order : [...order].reverse();
};

export function startDraft(state: DraftParty, deps: PartyDeps): Outgoing[] {
  state.rules = drawRules(deps.rng);
  state.status = 'PLAYING';
  state.phase = 'draft';
  state.round = 0;
  state.pick = 0;
  state.sequence = snake(state, 0);
  for (const p of state.players) state.picks[p.jid] = DRAFT_POSITIONS.map(() => null);
  const order = state.players.map((p, i) => `${i + 1}. ${firstName(p.name)}`).join('\n');
  return [text(`*Draft da Resenha* valendo! Ordem:\n${order}\n\nA ordem inverte a cada rodada.`), ...turnPrompt(state, deps, true)];
}

function turnPrompt(state: DraftParty, deps: PartyDeps, header: boolean): Outgoing[] {
  const p = state.players.find((x) => x.jid === state.sequence[state.pick])!;
  const rule = state.rules[state.round];
  const head = header ? `*Rodada ${state.round + 1}/${state.totalRounds}* · ${rule.label}\n` : '';
  return [
    text(`${head}Vez de *${firstName(p.name)}*. ${PARTY_CONFIG.draft.seconds}s.`),
    schedule(state, PARTY_CONFIG.draft.seconds, deps.now.getTime(), 'dr'),
  ];
}

function startsWith(letter: string, ...names: string[]): boolean {
  const l = letter.toLowerCase();
  return names.some((n) => normalize(n).startsWith(l));
}

function ruleProblem(rule: DraftParty['rules'][number], profile: PlayerProfile, typed: string): string | null {
  if (!profile.positions.includes(rule.pos)) return `não joga de ${POSITION_LABEL[rule.pos]}`;
  if (rule.kind === 'letter' && !startsWith(rule.value, typed, profile.name)) return `não começa com ${rule.value}`;
  if (rule.kind === 'club' && !playedForClub(getTeam(rule.value)!, profile.clubs)) return `não passou pelo ${getTeam(rule.value)!.name}`;
  if (rule.kind === 'nation' && !isFromNation(getTeam(rule.value)!, profile.nationality)) return `não é da seleção ${getTeam(rule.value)!.name}`;
  return null;
}

export async function draftAnswer(state: DraftParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> {
  if (state.phase !== 'draft' || state.sequence[state.pick] !== player.jid) return [];
  if (!looksLikePlayerName(msg.text)) return [];
  const who = firstName(player.name);
  const typed = msg.text.trim();
  let profile;
  try {
    const rule = state.rules[state.round];
    profile = await deps.lookup(typed, playContext(rule.pos, { kind: rule.kind, value: rule.value }));
  } catch (error) {
    console.error('lookup failed', error);
    return [text(`*${who}*, a consulta falhou. Manda de novo.`)];
  }
  if (!profile) return [text(`❌ *${who}*: não achei "${typed}". Manda outro.`)];
  const key = normalize(profile.name);
  const typedKey = normalize(typed);
  if (state.used.includes(key) || state.used.includes(typedKey)) return [text(`❌ *${who}*: ${profile.name} já foi escolhido. Manda outro.`)];
  const problem = ruleProblem(state.rules[state.round], profile, typed);
  if (problem) return [text(`❌ *${who}*: ${profile.name} ${problem}. Manda outro.`)];

  state.picks[player.jid][state.round] = { name: profile.name, key };
  state.used.push(key);
  if (typedKey !== key) state.used.push(typedKey);
  player.missed = 0;
  return save([react(msg, '✅'), ...advance(state, deps)]);
}

export function draftTimeout(state: DraftParty, deps: PartyDeps): Outgoing[] {
  if (state.phase === 'voting') return closeVoting(state, 'Fim da votação.');
  const p = state.players.find((x) => x.jid === state.sequence[state.pick])!;
  if (p.missed < 99) p.missed += 1;
  return [text(`*${firstName(p.name)}* não escolheu a tempo: vaga vazia.`), ...advance(state, deps)];
}

function advance(state: DraftParty, deps: PartyDeps): Outgoing[] {
  state.pick += 1;
  // Pula quem saiu da sala.
  while (state.pick < state.sequence.length && (state.players.find((p) => p.jid === state.sequence[state.pick])?.missed ?? 99) >= 99) state.pick += 1;
  if (state.pick < state.sequence.length) return turnPrompt(state, deps, false);
  if (state.round >= state.totalRounds - 1) return openVoting(state, deps);
  state.round += 1;
  state.pick = 0;
  state.sequence = snake(state, state.round);
  return turnPrompt(state, deps, true);
}

export function draftRows(state: DraftParty, withVotes: boolean) {
  const counts = voteCounts(state);
  return state.players.map((p, i) => ({
    head: `${i + 1} · ${p.name}${withVotes ? ` · ${counts[i]} voto${counts[i] === 1 ? '' : 's'}` : ''}`,
    lines: state.rules.map((r, k) => `${r.pos}: ${state.picks[p.jid]?.[k]?.name ?? '—'}`),
  }));
}

function openVoting(state: DraftParty, deps: PartyDeps): Outgoing[] {
  state.phase = 'voting';
  state.votes = {};
  state.warned = [];
  return [
    {
      type: 'image',
      image: { kind: 'textBoard', game: 'draft', title: 'Os times', subtitle: 'Votação aberta', rows: draftRows(state, false) },
      caption: `*Votação!* Qualquer pessoa do grupo manda o número do melhor time (1 a ${state.players.length}). Quem jogou não vota no próprio. ${DRAFT_VOTE_SECONDS}s.`,
    },
    schedule(state, DRAFT_VOTE_SECONDS, deps.now.getTime(), 'dv'),
  ];
}

function voteCounts(state: DraftParty): number[] {
  const counts = state.players.map(() => 0);
  for (const v of Object.values(state.votes)) counts[v] += 1;
  return counts;
}

/** Voto: qualquer pessoa do grupo, 1 por pessoa, ninguém vota no próprio time. */
export function draftVote(state: DraftParty, msg: IncomingMessage, save: Save): Promise<Outgoing[]> | Outgoing[] {
  const n = Number(msg.text.trim());
  if (!Number.isInteger(n) || n < 1 || n > state.players.length) return [];
  if (msg.senderJid in state.votes) return [];
  const own = state.players.findIndex((p) => p.jid === msg.senderJid);
  if (own === n - 1) return warnOnce(state, msg.senderJid, `*${firstName(msg.senderName)}*, não vale votar no próprio time.`, save);
  state.votes[msg.senderJid] = n - 1;
  return save([react(msg, '✅')]);
}

export function closeVoting(state: DraftParty, reason: string): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const counts = voteCounts(state);
  const nowMs = Date.now();
  state.players.forEach((p, i) => award(p, counts[i], nowMs));
  const top = Math.max(...counts);
  const winners = top === 0 ? [] : state.players.filter((_, i) => counts[i] === top);
  const headline =
    winners.length === 0
      ? 'Ninguém votou: empate geral.'
      : winners.length > 1
        ? `🏆 Empate na votação: ${winners.map((p) => `*${p.name}*`).join(' e ')} (${top} voto${top === 1 ? "" : "s"}).`
        : `🏆 *${winners[0].name}* montou o melhor time (${top} voto${top === 1 ? '' : 's'}).`;
  pendingResults.set(
    state,
    state.players.map((p) => ({
      player: { jid: p.jid, name: p.name },
      result: winners.length === 0 ? 'draw' : winners.includes(p) ? (winners.length > 1 ? 'draw' : 'win') : 'loss',
    })),
  );
  return [
    {
      type: 'image',
      image: { kind: 'textBoard', game: 'draft', title: 'Resultado', subtitle: `${Object.keys(state.votes).length} votos`, rows: draftRows(state, true) },
      caption: `${reason}\n\n${headline}\n\nMande *abrir draft* para jogar de novo.`,
    },
  ];
}
