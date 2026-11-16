import { firstName, normalize } from '../game/text';
import type { ContentCategory, IncomingMessage, Outgoing, PartyPlayer, RodadaParty } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, activePlayers, award, finishByScore, react, schedule, scoreImage, shuffle, text } from './common';
import { FACTS, getFact } from './content/fato';
import { TIMELINE, getEvent } from './content/linha';

/**
 * Jogos em que todos respondem a mesma pergunta e a rodada fecha quando todos
 * responderem (ou no prazo):
 * - Linha do Tempo: 4 eventos, ponha em ordem do mais antigo ao mais recente.
 * - Fato ou Fake: a afirmação é verdade ou mentira?
 */
export const LINHA_POINTS_PER_SLOT = 25;
export const LINHA_PERFECT_BONUS = 50;
export const FATO_POINTS = 100;
export const FATO_FIRST_BONUS = 20;
const LETTERS = ['A', 'B', 'C', 'D'];

export function newRodada(game: 'linha' | 'fato', category: ContentCategory | null = null): Pick<RodadaParty, 'game' | 'category' | 'round' | 'totalRounds' | 'order' | 'answers' | 'arrival'> {
  return { game, category, round: -1, totalRounds: PARTY_CONFIG[game].rounds!, order: [], answers: {}, arrival: [] };
}

export const LINHA_RULES = [
  '4 acontecimentos por rodada. Ponha em ordem, do mais antigo ao mais recente: *CADB*.',
  `${LINHA_POINTS_PER_SLOT} pontos por posição certa; acertou tudo, +${LINHA_PERFECT_BONUS}.`,
  '1 resposta por pessoa. A rodada fecha quando todos responderem.',
];

export const FATO_RULES = [
  'Uma afirmação por rodada. Responda *fato* ou *fake*.',
  `Acertou: ${FATO_POINTS} pontos. O primeiro a acertar ganha +${FATO_FIRST_BONUS}.`,
  '1 resposta por pessoa. Na revelação, o bot explica.',
];

const fits = (category: ContentCategory | null) => (c: ContentCategory) => (category ? c === category : c !== 'politica');

/** Sorteia 4 eventos de anos diferentes (e não muito colados, para não virar loteria). */
function drawTimeline(category: ContentCategory | null, rounds: number, rng: () => number): string[] {
  const pool = shuffle(TIMELINE.filter((e) => fits(category)(e.category)), rng);
  const used = new Set<string>();
  const out: string[] = [];
  for (let r = 0; r < rounds; r++) {
    const pick: typeof pool = [];
    for (const ev of pool) {
      if (used.has(ev.id)) continue;
      if (pick.some((p) => Math.abs(p.year - ev.year) < 3)) continue;
      pick.push(ev);
      if (pick.length === 4) break;
    }
    if (pick.length < 4) break;
    pick.forEach((p) => used.add(p.id));
    out.push(pick.map((p) => p.id).join(','));
  }
  return out;
}

export function startRodada(state: RodadaParty, deps: PartyDeps): Outgoing[] {
  state.order =
    state.game === 'linha'
      ? drawTimeline(state.category, state.totalRounds, deps.rng)
      : shuffle(FACTS.filter((x) => fits(state.category)(x.category)).map((x) => x.id), deps.rng).slice(0, state.totalRounds);
  state.totalRounds = state.order.length;
  state.status = 'PLAYING';
  state.round = -1;
  const name = PARTY_CONFIG[state.game].name;
  return [text(`*${name}* valendo! ${state.players.length} jogadores, ${state.totalRounds} rodadas.`), ...openRound(state, deps)];
}

function openRound(state: RodadaParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  state.answers = {};
  state.arrival = [];
  state.warned = [];
  const header = `*Rodada ${state.round + 1}/${state.totalRounds}*`;
  const secs = PARTY_CONFIG[state.game].seconds;
  if (state.game === 'linha') {
    const events = state.order[state.round].split(',').map((id) => getEvent(id)!);
    const list = events.map((ev, i) => `*${LETTERS[i]}* · ${ev.text}`).join('\n');
    return [
      text(`${header} · Linha do Tempo\n${list}\n\nMande as letras do mais antigo ao mais recente (ex.: *CADB*). ${secs}s.`),
      schedule(state, secs, deps.now.getTime(), 'lt'),
    ];
  }
  const fact = getFact(state.order[state.round])!;
  return [text(`${header} · Fato ou Fake?\n\n"${fact.text}"\n\nResponda *fato* ou *fake*. ${secs}s.`), schedule(state, secs, deps.now.getTime(), 'ff')];
}

/** "CADB", "c a d b", "C-A-D-B" → "CADB" (precisa ser uma ordem das 4 letras). */
export function parseOrder(raw: string): string | null {
  const letters = raw.toUpperCase().replace(/[\s,.;>-]/g, '');
  if (!/^[ABCD]{4}$/.test(letters) || new Set(letters).size !== 4) return null;
  return letters;
}

/** fato / verdade / real → fato; fake / falso / mentira → fake. */
export function parseFact(raw: string): 'fato' | 'fake' | null {
  const n = normalize(raw);
  if (['fato', 'verdade', 'verdadeiro', 'real', 'e fato'].includes(n)) return 'fato';
  if (['fake', 'falso', 'mentira', 'e fake', 'fake news'].includes(n)) return 'fake';
  return null;
}

export function rodadaAnswer(state: RodadaParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (player.jid in state.answers) return [];
  const answer = state.game === 'linha' ? parseOrder(msg.text) : parseFact(msg.text);
  if (!answer) return [];
  state.answers[player.jid] = answer;
  state.arrival.push(player.jid);
  player.missed = 0;
  const waiting = activePlayers(state).filter((p) => !(p.jid in state.answers));
  if (waiting.length > 0) return save([react(msg, '✅')]);
  return save([react(msg, '✅'), ...closeRodadaRound(state, deps, 'Todos responderam.')]);
}

export function closeRodadaRound(state: RodadaParty, deps: PartyDeps, reason: string): Outgoing[] {
  for (const p of state.players) if (!(p.jid in state.answers) && p.missed < 99) p.missed += 1;
  const nowMs = deps.now.getTime();
  const name = (jid: string) => firstName(state.players.find((p) => p.jid === jid)?.name ?? '');
  let reveal: string;
  if (state.game === 'linha') {
    const events = state.order[state.round].split(',').map((id) => getEvent(id)!);
    const correct = events
      .map((ev, i) => ({ ev, letter: LETTERS[i] }))
      .sort((a, b) => a.ev.year - b.ev.year);
    const key = correct.map((c) => c.letter).join('');
    const lines = state.arrival.map((jid) => {
      const given = state.answers[jid];
      const right = [...given].filter((l, i) => l === key[i]).length;
      const points = right * LINHA_POINTS_PER_SLOT + (right === 4 ? LINHA_PERFECT_BONUS : 0);
      award(state.players.find((p) => p.jid === jid)!, points, nowMs);
      return `${name(jid)}: ${given} (${right}/4) +${points}`;
    });
    reveal = [
      `${reason} Ordem certa: *${key}*`,
      correct.map((c) => `${c.ev.year} · ${c.ev.text}`).join('\n'),
      lines.length ? lines.join('\n') : 'Ninguém respondeu.',
    ].join('\n\n');
  } else {
    const fact = getFact(state.order[state.round])!;
    const truth = fact.fact ? 'fato' : 'fake';
    const winners = state.arrival.filter((jid) => state.answers[jid] === truth);
    winners.forEach((jid, i) => award(state.players.find((p) => p.jid === jid)!, FATO_POINTS + (i === 0 ? FATO_FIRST_BONUS : 0), nowMs));
    reveal = [
      `${reason} É *${truth.toUpperCase()}*. ${fact.why}`,
      winners.length ? `Acertaram: ${winners.map(name).join(', ')}` : 'Ninguém acertou.',
    ].join('\n\n');
  }
  if (state.round >= state.totalRounds - 1) {
    return [text(reveal), ...finishByScore(state, '', state.game === 'linha' ? 'abrir linha do tempo' : 'abrir fato ou fake')];
  }
  const out: Outgoing[] = [text(reveal)];
  if ((state.round + 1) % 3 === 0) out.push(scoreImage(state, false));
  return [...out, ...openRound(state, deps)];
}
