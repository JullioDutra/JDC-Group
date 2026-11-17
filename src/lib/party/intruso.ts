import { firstName, normalize } from '../game/text';
import type { IncomingMessage, IntrusoParty, Outgoing, PartyPlayer } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, answerMatches, pendingResults, schedule, text, warnOnce, pauseBeforeNext } from './common';
import { INTRUSO_SETS, getIntrusoSet } from './content/intruso';

/**
 * Intruso: o bot mostra 5 nomes (A a E). Os jogadores marcam X, um de cada
 * vez, em quem eles acham que PERTENCE ao grupo. O X aparece na hora, mas
 * sem dizer se está certo. Quando sobra um nome (o palpite de intruso do
 * grupo) ou o tempo acaba, o bot revela cada X como certo ou errado e a
 * justificativa.
 *
 * Pontos: X em quem pertence = +50; X no intruso = -50.
 * Se o nome que sobrou for mesmo o intruso, todos que marcaram certo ganham +30.
 */
export const INTRUSO_POINTS = { goodMark: 50, badMark: -50, groupBonus: 30 };

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
  'Marque com X quem PERTENCE ao grupo: mande a letra (A a E) ou o nome.',
  'Ninguém marca duas vezes seguidas. O nome que sobrar é o palpite de intruso.',
  `No fim: X certo +${INTRUSO_POINTS.goodMark}, X no intruso ${INTRUSO_POINTS.badMark}.`,
];

export function startIntruso(state: IntrusoParty, deps: PartyDeps): Outgoing[] {
  // Sem categoria: futebol e geral. Política só quando pedida.
  const pool = INTRUSO_SETS.filter((s) =>
    state.category ? (s.category ?? 'futebol') === state.category : (s.category ?? 'futebol') !== 'politica',
  );
  state.order = shuffle(pool.map((s) => s.id), deps.rng).slice(0, state.totalRounds);
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
        'Marquem com X quem *pertence* ao grupo: mande a letra (A a E).\n' +
        'Ninguém marca duas vezes seguidas. O que sobrar é o palpite de intruso.',
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

/** Quadro em texto, com X e risco (~nome~) nos marcados. */
function boardText(state: IntrusoParty): string {
  return state.options
    .map((o, i) => {
      const mark = state.marks.find((m) => m.index === i);
      return mark ? `${LETTERS[i]}) ~${o}~  X (${firstName(mark.name)})` : `${LETTERS[i]}) ${o}`;
    })
    .join('\n');
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
  const who = firstName(player.name);
  if (state.lastJid === player.jid) {
    return warnOnce(state, player.jid, `*${who}*, espere outra pessoa marcar antes do seu próximo X.`, save);
  }
  if (state.marks.some((m) => m.index === index)) {
    return [text(`${LETTERS[index]}) ${state.options[index]} já está marcado. Escolha outro.`)];
  }
  state.marks.push({ index, jid: player.jid, name: player.name });
  state.lastJid = player.jid;
  state.warned = [];
  player.missed = 0;

  if (state.marks.length >= state.options.length - 1) return save(revealRound(state, deps, ''));
  return save([text(`*${who}* marcou X em *${LETTERS[index]}) ${state.options[index]}*.\n\n${boardText(state)}`)]);
}

export function revealRound(state: IntrusoParty, deps: PartyDeps, reason: string): Outgoing[] {
  const set = getIntrusoSet(state.order[state.round])!;
  const byPlayer = new Map<string, number>();
  for (const m of state.marks) {
    const delta = m.index === state.intruderIndex ? INTRUSO_POINTS.badMark : INTRUSO_POINTS.goodMark;
    byPlayer.set(m.jid, (byPlayer.get(m.jid) ?? 0) + delta);
  }
  const remaining = state.options.map((_, i) => i).filter((i) => !state.marks.some((m) => m.index === i));
  const groupRight = remaining.length === 1 && remaining[0] === state.intruderIndex;
  if (groupRight) {
    for (const m of state.marks) byPlayer.set(m.jid, (byPlayer.get(m.jid) ?? 0) + INTRUSO_POINTS.groupBonus);
  }
  for (const [jid, delta] of byPlayer) {
    const p = state.players.find((x) => x.jid === jid);
    if (!p) continue;
    p.score += delta;
    if (delta > 0) {
      p.hits += 1;
      p.lastHitAt = deps.now.getTime();
    }
  }
  for (const p of state.players) if (!byPlayer.has(p.jid) && p.missed < 99) p.missed += 1;

  const intruder = state.options[state.intruderIndex];
  const caught = state.marks.find((m) => m.index === state.intruderIndex);
  const verdict = groupRight
    ? `Certo! Sobrou *${intruder}*, e ele era o intruso.`
    : caught
      ? `Errado: o intruso era *${intruder}*, e ${firstName(caught.name)} marcou X nele.`
      : `Tempo esgotado. O intruso era *${intruder}*.`;
  const points = [...byPlayer.entries()]
    .map(([jid, d]) => `${firstName(state.players.find((p) => p.jid === jid)?.name ?? '')} ${d > 0 ? '+' : ''}${d}`)
    .join(' · ');
  const caption = [reason, verdict, `Por quê: ${set.reason}`, points ? `Pontos: ${points}` : ''].filter(Boolean).join('\n');
  const reveal: Outgoing = {
    type: 'image',
    image: { kind: 'intrusoBoard', state: structuredClone(state), reason: set.reason, reveal: true },
    caption,
  };

  if (state.round >= state.totalRounds - 1) return [reveal, ...finishIntruso(state)];
  return [reveal, ...pauseBeforeNext(state, deps)];
}

export function intrusoTimeout(state: IntrusoParty, deps: PartyDeps): Outgoing[] {
  return revealRound(state, deps, '');
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
