import { firstName, normalize } from '../game/text';
import type { IncomingMessage, IntrusoParty, Outgoing, PartyPlayer } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, activePlayers, answerMatches, award, pendingResults, react, schedule, text, pauseBeforeNext, freshFirst } from './common';
import { INTRUSO_SETS, getIntrusoSet } from './content/intruso';

/**
 * Intruso (regra de 18/11/2026): o bot mostra 5 nomes (A a E); 4 têm algo em
 * comum e 1 é o intruso. Cada pessoa dá UM palpite: a letra (ou o nome) do
 * intruso. Acertou: +100; o primeiro a acertar ganha +50. A rodada fecha
 * quando todos palpitarem ou o tempo acabar, e o bot explica o porquê.
 *
 * A regra antiga (marcar X, um de cada vez, em quem pertence) era a mais
 * complicada do repertório: nenhuma das 3 primeiras partidas terminou.
 */
export const INTRUSO_POINTS = { hit: 100, firstBonus: 50 };

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function newIntruso(
  category: IntrusoParty['category'] = null,
): Pick<IntrusoParty, 'game' | 'category' | 'round' | 'totalRounds' | 'order' | 'options' | 'intruderIndex' | 'marks' | 'lastJid'> {
  return { game: 'intruso', category, round: -1, totalRounds: PARTY_CONFIG.intruso.rounds!, order: [], options: [], intruderIndex: -1, marks: [], lastJid: null };
}

export const INTRUSO_RULES = [
  'Cada um dá 1 palpite por rodada: a letra (A a E) ou o nome do intruso.',
  `Acertou: +${INTRUSO_POINTS.hit}. O primeiro a acertar ganha +${INTRUSO_POINTS.firstBonus}.`,
  'A rodada fecha quando todos palpitarem ou o tempo acabar. Aí o bot explica o porquê.',
];

export function startIntruso(state: IntrusoParty, deps: PartyDeps): Outgoing[] {
  // Sem categoria: futebol e geral. Política só quando pedida.
  const pool = INTRUSO_SETS.filter((s) =>
    state.category ? (s.category ?? 'futebol') === state.category : (s.category ?? 'futebol') !== 'politica',
  );
  state.order = freshFirst(pool.map((s) => s.id), deps.rng, deps.seen).slice(0, state.totalRounds);
  state.totalRounds = state.order.length;
  state.status = 'PLAYING';
  state.round = -1;
  return [text(`*Intruso* valendo! ${state.players.length} jogadores, ${state.totalRounds} rodadas.`), ...openIntrusoRound(state, deps)];
}

export function openIntrusoRound(state: IntrusoParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  const set = getIntrusoSet(state.order[state.round])!;
  state.options = shuffle([...set.members, set.intruder], deps.rng);
  state.intruderIndex = state.options.indexOf(set.intruder);
  state.marks = [];
  state.lastJid = null;
  state.warned = [];
  return [
    {
      type: 'image',
      image: { kind: 'intrusoBoard', state: structuredClone(state), reason: '', reveal: false },
      caption:
        `*Rodada ${state.round + 1}/${state.totalRounds} · Quem é o intruso?*\n` +
        `4 nomes têm algo em comum. Mande a *letra* do que não pertence: 1 palpite por pessoa. ${PARTY_CONFIG.intruso.seconds}s.`,
    },
    schedule(state, PARTY_CONFIG.intruso.seconds, deps.now.getTime(), 'in'),
  ];
}

/** Lê "c", "C)", "letra c" ou o nome da opção. */
export function parseIntrusoPick(state: IntrusoParty, raw: string): number {
  const norm = normalize(raw);
  const letter = norm.match(/^(?:letra )?([a-e])$/);
  if (letter) return LETTERS.indexOf(letter[1].toUpperCase());
  if (norm.length < 3) return -1;
  return state.options.findIndex((o) => answerMatches([o], norm));
}

export async function intrusoAnswer(
  state: IntrusoParty,
  player: PartyPlayer,
  msg: IncomingMessage,
  deps: PartyDeps,
  save: Save,
): Promise<Outgoing[]> {
  const index = parseIntrusoPick(state, msg.text);
  if (index < 0 || index >= state.options.length) return [];
  if (state.marks.some((m) => m.jid === player.jid)) return []; // 1 palpite por rodada
  state.marks.push({ index, jid: player.jid, name: player.name });
  player.missed = 0;
  // Confirma que o palpite entrou, sem dizer se está certo.
  const out: Outgoing[] = [react(msg, '🔒')];
  if (activePlayers(state).every((p) => state.marks.some((m) => m.jid === p.jid))) {
    return save([...out, ...revealRound(state, deps, 'Todos palpitaram.')]);
  }
  return save(out);
}

export function revealRound(state: IntrusoParty, deps: PartyDeps, reason: string): Outgoing[] {
  const set = getIntrusoSet(state.order[state.round])!;
  const nowMs = deps.now.getTime();
  const hits = state.marks.filter((m) => m.index === state.intruderIndex);
  const lines: string[] = [];
  hits.forEach((m, i) => {
    const p = state.players.find((x) => x.jid === m.jid);
    if (!p) return;
    const points = INTRUSO_POINTS.hit + (i === 0 ? INTRUSO_POINTS.firstBonus : 0);
    award(p, points, nowMs);
    lines.push(`${firstName(p.name)} +${points}${i === 0 ? ' (primeiro)' : ''}`);
  });
  for (const p of state.players) if (!state.marks.some((m) => m.jid === p.jid) && p.missed < 99) p.missed += 1;
  const misses = state.marks.filter((m) => m.index !== state.intruderIndex).map((m) => `${firstName(m.name)} (${LETTERS[m.index]})`);

  const intruder = state.options[state.intruderIndex];
  const caption = [
    reason,
    `O intruso era *${LETTERS[state.intruderIndex]}) ${intruder}*.`,
    `Por quê: ${set.reason}`,
    lines.length ? `Acertaram: ${lines.join(' · ')}` : 'Ninguém acertou.',
    misses.length ? `Erraram: ${misses.join(', ')}` : '',
  ].filter(Boolean).join('\n');
  const reveal: Outgoing = {
    type: 'image',
    image: { kind: 'intrusoBoard', state: structuredClone(state), reason: set.reason, reveal: true },
    caption,
  };

  if (state.round >= state.totalRounds - 1) return [reveal, ...finishIntruso(state)];
  return [reveal, ...pauseBeforeNext(state, deps)];
}

export function intrusoTimeout(state: IntrusoParty, deps: PartyDeps): Outgoing[] {
  return revealRound(state, deps, 'Tempo esgotado.');
}

export function finishIntruso(state: IntrusoParty, reason = ''): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.lastHitAt - b.lastHitAt);
  const best = ranked[0];
  const tied = ranked.filter((p) => p.score === best.score);
  const headline =
    best.score <= 0
      ? 'Ninguém pontuou desta vez.'
      : tied.length > 1
        ? `🏆 Empate: ${tied.map((p) => `*${p.name}*`).join(' e ')}, com ${best.score} pontos.`
        : `🏆 *${best.name}* venceu com ${best.score} pontos.`;
  pendingResults.set(
    state,
    ranked.map((p) => ({
      player: { jid: p.jid, name: p.name },
      result: best.score > 0 && p.score === best.score ? (tied.length > 1 ? 'draw' : 'win') : 'loss',
    })),
  );
  return [
    {
      type: 'image',
      image: { kind: 'partyScore', state: structuredClone(state), title: 'Resultado final', final: true },
      caption: [reason, headline, ranked.map((p, i) => `${i + 1}º ${p.name} — ${p.score}`).join('\n'), 'Mande *abrir intruso* para jogar de novo.']
        .filter(Boolean)
        .join('\n\n'),
    },
  ];
}
