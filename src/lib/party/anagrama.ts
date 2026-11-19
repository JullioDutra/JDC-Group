import { firstName, isChatter, normalize } from '../game/text';
import type { AnagramaParty, ContentCategory, IncomingMessage, Outgoing, PartyPlayer } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, answerMatches, award, finishByScore, freshFirst, normalizeAnswer, pauseBeforeNext, react, schedule, scoreImage, text } from './common';
import { ANAGRAMS, getAnagram, plainUpper, scramble } from './content/anagramas';

/**
 * Anagrama (em grupo, corrida): o bot mostra as letras embaralhadas e o
 * tema ("clube brasileiro", "animal"...). O primeiro que acertar leva:
 * 100 pontos antes da dica, 60 depois. Na metade do tempo sai a dica (a
 * primeira letra). Cada um tem 3 tentativas por rodada.
 */
export const ANAGRAMA_POINTS = { early: 100, late: 60 };
export const ANAGRAMA_TRIES = 3;

export const ANAGRAMA_RULES = [
  'O bot mostra as letras embaralhadas e o tema. Desembaralhe e mande a palavra.',
  `O primeiro que acertar leva ${ANAGRAMA_POINTS.early} pontos (${ANAGRAMA_POINTS.late} depois da dica, que sai na metade do tempo).`,
  `Cada um tem ${ANAGRAMA_TRIES} tentativas por rodada. Vence quem acertar mais.`,
];

const half = () => Math.round(PARTY_CONFIG.anagrama.seconds / 2);

export function newAnagrama(category: ContentCategory | null = null): Pick<AnagramaParty, 'game' | 'category' | 'round' | 'totalRounds' | 'order' | 'scrambled' | 'hint' | 'tries' | 'solved'> {
  return { game: 'anagrama', category, round: -1, totalRounds: PARTY_CONFIG.anagrama.rounds!, order: [], scrambled: '', hint: false, tries: {}, solved: false };
}

export function startAnagrama(state: AnagramaParty, deps: PartyDeps): Outgoing[] {
  const pool = ANAGRAMS.filter((a) => !state.category || a.category === state.category);
  // Sem categoria: mistura futebol e geral, metade de cada (quando dá).
  state.order = freshFirst(pool.map((a) => a.id), deps.rng, deps.seen).slice(0, state.totalRounds);
  state.totalRounds = state.order.length;
  state.status = 'PLAYING';
  state.round = -1;
  return [text(`🔤 *Anagrama* valendo! ${state.players.length} jogadores, ${state.totalRounds} rodadas.`), ...openAnagramaRound(state, deps)];
}

export function openAnagramaRound(state: AnagramaParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  state.hint = false;
  state.tries = {};
  state.solved = false;
  state.warned = [];
  const word = getAnagram(state.order[state.round])!;
  state.scrambled = scramble(word.answer, deps.rng);
  const letters = plainUpper(word.answer).replace(/[^A-Z]/g, '').length;
  return [
    text(
      `*Rodada ${state.round + 1}/${state.totalRounds}* · Tema: *${word.theme}* (${letters} letras)\n\n` +
        `🔤 *${state.scrambled}*\n\n` +
        `Desembaralhe! Dica em ${half()}s.`,
    ),
    schedule(state, half(), deps.now.getTime(), 'an'),
  ];
}

export function anagramaAnswer(state: AnagramaParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (state.solved) return [];
  const raw = msg.text.trim();
  if (raw.length < 2 || raw.length > 40 || /[?\n]/.test(raw) || isChatter(raw)) return [];
  const used = state.tries[player.jid] ?? 0;
  if (used >= ANAGRAMA_TRIES) return [];
  const word = getAnagram(state.order[state.round])!;
  const guess = normalizeAnswer(raw);
  // Só conta como tentativa o que tem o tamanho certo (conversa não gasta tentativa).
  const size = (s: string) => normalize(s).replace(/[^a-z]/g, '').length;
  if (Math.abs(size(raw) - size(word.answer)) > 2) return [];
  state.tries[player.jid] = used + 1;
  player.missed = 0;
  if (!answerMatches([word.answer, ...(word.aliases ?? [])], guess)) {
    return save([react(msg, used + 1 >= ANAGRAMA_TRIES ? '🚫' : '❌')]);
  }
  const points = state.hint ? ANAGRAMA_POINTS.late : ANAGRAMA_POINTS.early;
  award(player, points, deps.now.getTime());
  return save([react(msg, '✅'), ...revealAnagrama(state, deps, `✅ *${firstName(player.name)}* acertou (+${points}): *${word.answer}*.`)]);
}

/** Prazo: na metade sai a dica; no fim, revela. */
export function anagramaTimeout(state: AnagramaParty, deps: PartyDeps): Outgoing[] {
  const word = getAnagram(state.order[state.round])!;
  if (!state.hint) {
    state.hint = true;
    return [
      text(`💡 Dica: começa com *${plainUpper(word.answer)[0]}*.\n🔤 *${state.scrambled}*\nAgora vale ${ANAGRAMA_POINTS.late}. ${half()}s.`),
      schedule(state, half(), deps.now.getTime(), 'an'),
    ];
  }
  return revealAnagrama(state, deps, `⏱️ Ninguém acertou. Era *${word.answer}*.`);
}

function revealAnagrama(state: AnagramaParty, deps: PartyDeps, headline: string): Outgoing[] {
  state.solved = true;
  state.deadline = null;
  state.timerToken = null;
  if (state.round >= state.totalRounds - 1) return finishByScore(state, headline, 'abrir anagrama');
  const out: Outgoing[] = [text(headline)];
  // Placar a cada 4 rodadas, para não poluir o grupo.
  if ((state.round + 1) % 4 === 0) out.push(scoreImage(state, false));
  return [...out, ...pauseBeforeNext(state, deps)];
}

export function skipAnagrama(state: AnagramaParty, deps: PartyDeps): Outgoing[] {
  return revealAnagrama(state, deps, `Rodada encerrada pelo anfitrião. Era *${getAnagram(state.order[state.round])!.answer}*.`);
}
