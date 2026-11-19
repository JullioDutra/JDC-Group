import { firstName, isChatter, normalize } from '../game/text';
import type { AnagramaParty, ContentCategory, IncomingMessage, Outgoing, PartyPlayer } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, award, finishByScore, freshFirst, normalizeAnswer, pauseBeforeNext, react, schedule, scoreImage, text } from './common';
import { ANAGRAMS, ANAGRAM_THEMES, getAnagram, plainUpper, scramble } from './content/anagramas';

/**
 * Anagrama (em grupo, corrida): o bot mostra as letras embaralhadas e o
 * tema ("clube brasileiro", "animal"...). O primeiro que acertar leva:
 * 100 pontos antes da dica, 60 depois. Na metade do tempo sai a dica (a
 * primeira letra). Cada um tem 3 tentativas por rodada.
 */
export const ANAGRAMA_POINTS = { early: 100, late: 60 };
export const ANAGRAMA_TRIES = 3;

/** Lista de temas para o grupo escolher ("abrir anagrama capitais"). */
export function anagramThemesText(head = ''): string {
  const fut = ANAGRAM_THEMES.filter((t) => t.category === 'futebol').map((t) => t.keys[0]);
  const ger = ANAGRAM_THEMES.filter((t) => t.category !== 'futebol').map((t) => t.keys[0]);
  return [
    head,
    '🔤 *Temas do Anagrama* (mande *abrir anagrama* + tema):',
    `⚽ ${fut.join(', ')}`,
    `🌎 ${ger.join(', ')}`,
    'Sem tema: mistura tudo. *abrir anagrama futebol* ou *abrir anagrama geral* juntam os temas de cada lado.',
  ]
    .filter(Boolean)
    .join('\n');
}

export const ANAGRAMA_RULES = [
  'O bot mostra as letras embaralhadas e o tema. Desembaralhe e mande a palavra.',
  'Só vale a palavra certinha (acento não precisa). Letra trocada ou apelido não valem.',
  'Dá para escolher o tema: *abrir anagrama capitais*, *abrir anagrama clubes*... (mande *temas do anagrama* para ver todos).',
  `O primeiro que acertar leva ${ANAGRAMA_POINTS.early} pontos (${ANAGRAMA_POINTS.late} depois da dica, que sai na metade do tempo).`,
  `Cada um tem ${ANAGRAMA_TRIES} tentativas por rodada. Vence quem acertar mais.`,
];

const half = () => Math.round(PARTY_CONFIG.anagrama.seconds / 2);

export function newAnagrama(
  category: ContentCategory | null = null,
  theme: string | null = null,
): Pick<AnagramaParty, 'game' | 'category' | 'theme' | 'round' | 'totalRounds' | 'order' | 'scrambled' | 'hint' | 'tries' | 'solved'> {
  return { game: 'anagrama', category, theme, round: -1, totalRounds: PARTY_CONFIG.anagrama.rounds!, order: [], scrambled: '', hint: false, tries: {}, solved: false };
}

export function startAnagrama(state: AnagramaParty, deps: PartyDeps): Outgoing[] {
  const pool = ANAGRAMS.filter((a) => (state.theme ? a.theme === state.theme : !state.category || a.category === state.category));
  state.order = freshFirst(pool.map((a) => a.id), deps.rng, deps.seen).slice(0, state.totalRounds);
  state.totalRounds = state.order.length;
  state.status = 'PLAYING';
  state.round = -1;
  const tema = state.theme ? ` Tema: *${state.theme}*.` : '';
  return [text(`🔤 *Anagrama* valendo! ${state.players.length} jogadores, ${state.totalRounds} rodadas.${tema}`), ...openAnagramaRound(state, deps)];
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

/**
 * Acertou só com a palavra 100% certa: as mesmas letras, na mesma ordem. Não
 * importam acento, maiúscula, espaço, hífen nem o artigo do começo ("O Rei do
 * Gado" = "rei do gado"). Erro de digitação e apelido não valem: "Rodrigo" não
 * é "Rodrygo", "bparaiba" não é "Paraíba".
 */
export function anagramaHit(answer: string, raw: string): boolean {
  const letters = (s: string) => normalizeAnswer(s).replace(/[^a-z0-9]/g, '');
  return letters(raw) !== '' && letters(raw) === letters(answer);
}

export function anagramaAnswer(state: AnagramaParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (state.solved) return [];
  const raw = msg.text.trim();
  if (raw.length < 2 || raw.length > 40 || /[?\n]/.test(raw) || isChatter(raw)) return [];
  const used = state.tries[player.jid] ?? 0;
  if (used >= ANAGRAMA_TRIES) return [];
  const word = getAnagram(state.order[state.round])!;
  // Só conta como tentativa o que tem o tamanho certo (conversa não gasta tentativa).
  const size = (s: string) => normalize(s).replace(/[^a-z]/g, '').length;
  if (Math.abs(size(raw) - size(word.answer)) > 2) return [];
  state.tries[player.jid] = used + 1;
  player.missed = 0;
  if (!anagramaHit(word.answer, raw)) {
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
