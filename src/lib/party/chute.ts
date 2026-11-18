import { firstName, formatNumber } from '../game/text';
import type { ChuteParty, ContentCategory, IncomingMessage, Outgoing, PartyPlayer } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, activePlayers, pendingResults, react, schedule, text, pauseBeforeNext, freshFirst } from './common';
import { CHUTE_QUESTIONS, getChute } from './content/chute';
import { scoreImage } from './quiz';

/**
 * Chute Certo ("Qual é a nota?", do Projeto Trivia, no estilo "O Preço Certo"):
 * cada um manda 1 número, diferente de todos os já ditos. Vence o mais perto.
 */
export const CHUTE_POINTS = [100, 60, 30];
export const CHUTE_EXACT_BONUS = 50;

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function newChute(category: ContentCategory | null = null): Pick<ChuteParty, 'game' | 'category' | 'round' | 'totalRounds' | 'order' | 'guesses' | 'arrival'> {
  return { game: 'chute', category, round: -1, totalRounds: PARTY_CONFIG.chute.rounds!, order: [], guesses: {}, arrival: [] };
}

export const CHUTE_RULES = [
  'Cada rodada tem uma pergunta com resposta em número.',
  '1 número por pessoa, diferente dos que já foram ditos.',
  `Mais perto: ${CHUTE_POINTS.join('/')} pontos; cravou: +${CHUTE_EXACT_BONUS}.`,
];

export function startChute(state: ChuteParty, deps: PartyDeps): Outgoing[] {
  const pool = CHUTE_QUESTIONS.filter((q) => (state.category ? q.category === state.category : q.category !== 'politica'));
  state.order = freshFirst(pool.map((q) => q.id), deps.rng, deps.seen).slice(0, state.totalRounds);
  state.totalRounds = state.order.length;
  state.status = 'PLAYING';
  state.round = -1;
  return [text(`*Chute Certo* valendo! ${state.players.length} jogadores, ${state.totalRounds} rodadas.`), ...openChuteRound(state, deps)];
}

export function openChuteRound(state: ChuteParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  state.guesses = {};
  state.arrival = [];
  state.warned = [];
  const q = getChute(state.order[state.round])!;
  return [
    text(
      `*Rodada ${state.round + 1}/${state.totalRounds}* · Chute Certo\n${q.prompt}\n` +
        `1 número por pessoa. Número já dito não vale. Tempo: ${PARTY_CONFIG.chute.seconds}s.`,
    ),
    schedule(state, PARTY_CONFIG.chute.seconds, deps.now.getTime(), 'ch'),
  ];
}

/** "1958", "173.850", "8 849", "60,3" → número; outra coisa → null. */
export function parseNumber(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, '');
  if (!/^-?\d[\d.]*(,\d+)?$/.test(t)) return null;
  const n = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function chuteAnswer(state: ChuteParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (player.jid in state.guesses) return [];
  const n = parseNumber(msg.text);
  if (n === null) return [];
  const owner = Object.entries(state.guesses).find(([, v]) => v === n);
  if (owner) {
    const name = firstName(state.players.find((p) => p.jid === owner[0])?.name ?? '');
    return [text(`*${firstName(player.name)}*, o ${formatNumber(n)} já foi dito por ${name}. Escolha outro número.`)];
  }
  state.guesses[player.jid] = n;
  state.arrival.push(player.jid);
  player.missed = 0;
  const waiting = activePlayers(state).filter((p) => !(p.jid in state.guesses));
  if (waiting.length > 0) return save([react(msg, '✅')]);
  return save([react(msg, '✅'), ...closeChuteRound(state, deps, 'Todos chutaram.')]);
}

export function closeChuteRound(state: ChuteParty, deps: PartyDeps, reason: string): Outgoing[] {
  for (const p of state.players) if (!(p.jid in state.guesses) && p.missed < 99) p.missed += 1;
  const q = getChute(state.order[state.round])!;
  const ranked = Object.entries(state.guesses)
    .map(([jid, v]) => ({ jid, v, diff: Math.abs(v - q.answer), at: state.arrival.indexOf(jid) }))
    .sort((a, b) => a.diff - b.diff || a.at - b.at);
  const lines = ranked.map((g, i) => {
    const p = state.players.find((x) => x.jid === g.jid)!;
    const points = (CHUTE_POINTS[i] ?? 0) + (g.diff === 0 ? CHUTE_EXACT_BONUS : 0);
    if (points > 0) {
      p.score += points;
      p.hits += 1;
      p.lastHitAt = deps.now.getTime();
    }
    return `${i + 1}º ${firstName(p.name)}: ${formatNumber(g.v)}${g.diff === 0 ? ' (cravou!)' : ''}${points ? ` +${points}` : ''}`;
  });
  const answer = `Resposta: *${formatNumber(q.answer)}*${q.unit ? ` ${q.unit}` : ''}.`;
  const summary = [`${reason} ${answer}`, lines.length ? lines.join('\n') : 'Ninguém chutou.'].join('\n');
  if (state.round >= state.totalRounds - 1) return finishChute(state, summary);
  const out: Outgoing[] = [text(summary)];
  if ((state.round + 1) % 3 === 0) out.push(scoreImage(state, false));
  return [...out, ...pauseBeforeNext(state, deps)];
}

export function finishChute(state: ChuteParty, reason = ''): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.lastHitAt - b.lastHitAt);
  const best = ranked[0];
  const tied = ranked.filter((p) => p.score === best.score);
  const headline =
    best.score === 0
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
      ...scoreImage(state, true),
      caption: [reason, headline, ranked.map((p, i) => `${i + 1}º ${p.name} — ${p.score}`).join('\n'), 'Mande *abrir chute certo* para jogar de novo.']
        .filter(Boolean)
        .join('\n\n'),
    } as Outgoing,
  ];
}
