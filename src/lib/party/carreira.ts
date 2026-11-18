import { firstName, looksLikePlayerName, normalize } from '../game/text';
import type { CarreiraParty, IncomingMessage, Outgoing, PartyPlayer } from '../game/types';
import { POSITION_LABEL } from '../game/types';
import { coherenceScore } from '../players/keys';
import type { PlayerRecord } from '../players/types';
import { BASE_LOADING, cardOf, careerPath, pickFresh } from './basegames';
import { PARTY_CONFIG, PartyDeps, Save, award, finishByScore, pauseBeforeNext, react, schedule, scoreImage, text } from './common';

/**
 * Carreira: o bot mostra a trajetória de um jogador conhecido ("São Paulo →
 * Real Madrid → Milan"). A cada 25 s sai uma dica extra (posição e seleção,
 * década, iniciais). 1 palpite por pessoa a cada dica; o primeiro que acertar
 * leva, e quanto antes, mais pontos. Gerado da base: não acaba.
 */
export const CARREIRA_POINTS = [100, 70, 50, 30];

export const CARREIRA_RULES = [
  'O bot mostra a trajetória de clubes de um jogador. Quem é?',
  `A cada ${PARTY_CONFIG.carreira.seconds}s sai uma dica extra. 1 palpite por pessoa a cada dica.`,
  `O primeiro que acertar leva: ${CARREIRA_POINTS.join(', ')} pontos (da 1ª à última dica).`,
  'Vale o nome pelo qual ele é conhecido ou o nome completo (sem apelido nem erro de digitação).',
];

export function newCarreira(): Pick<CarreiraParty, 'game' | 'round' | 'totalRounds' | 'cards' | 'clue' | 'attempts' | 'guesses' | 'solved'> {
  return { game: 'carreira', round: -1, totalRounds: PARTY_CONFIG.carreira.rounds!, cards: [], clue: 0, attempts: [], guesses: [], solved: false };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(w))
    .map((w) => `${w[0].toUpperCase()}.`)
    .join(' ');
}

/** Dicas extras, da mais vaga para a mais forte. */
export function careerClues(r: PlayerRecord): string[] {
  const clues: string[] = [];
  const pos = r.positions.map((p) => POSITION_LABEL[p]).join('/');
  const who = [pos ? `Posição: ${pos}` : '', r.nationality ? `Seleção: ${r.nationality}` : ''].filter(Boolean).join(' · ');
  if (who) clues.push(who);
  if (r.birthDate) clues.push(`Nasceu nos anos ${r.birthDate.slice(2, 3)}0 (${r.birthDate.slice(0, 4)})`);
  clues.push(`Iniciais: ${initials(r.name)} (${r.name.replace(/\s/g, '').length} letras)`);
  return clues.slice(0, 3);
}

export async function startCarreira(state: CarreiraParty, deps: PartyDeps): Promise<Outgoing[]> {
  const sample = await deps.store.samplePlayers({ minSitelinks: 35, minClubs: 3, limit: 200 });
  const usable = sample
    .map((record) => ({ record, path: careerPath(record) }))
    .filter((x) => x.path.length >= 3 && x.path.length <= 12);
  const picked = pickFresh(usable, state.totalRounds, deps);
  if (picked.length < 3) {
    state.status = 'CANCELLED';
    return [text(BASE_LOADING)];
  }
  state.cards = picked.map(({ record, path }) => ({ ...cardOf(record), path, clues: careerClues(record) }));
  state.totalRounds = state.cards.length;
  state.status = 'PLAYING';
  state.round = -1;
  return [text(`*Carreira* valendo! ${state.players.length} jogadores, ${state.totalRounds} carreiras.`), ...openCarreiraRound(state, deps)];
}

export function openCarreiraRound(state: CarreiraParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  state.clue = 0;
  state.attempts = [];
  state.guesses = [];
  state.solved = false;
  state.warned = [];
  const card = state.cards[state.round];
  return [
    text(
      `*Rodada ${state.round + 1}/${state.totalRounds}* · De quem é esta carreira?\n\n` +
        `${card.path.join(' → ')}\n\n` +
        `1 palpite por pessoa. Agora vale ${CARREIRA_POINTS[0]}; nova dica em ${PARTY_CONFIG.carreira.seconds}s.`,
    ),
    schedule(state, PARTY_CONFIG.carreira.seconds, deps.now.getTime(), 'cr'),
  ];
}

export function carreiraAnswer(state: CarreiraParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (state.solved || state.attempts.includes(player.jid)) return [];
  const raw = msg.text.trim();
  if (!looksLikePlayerName(raw)) return [];
  const guess = normalize(raw);
  if (state.guesses.includes(guess)) return [];
  state.attempts.push(player.jid);
  state.guesses.push(guess);
  player.missed = 0;
  const card = state.cards[state.round];
  if (coherenceScore(raw, card.names) === 0) return save([react(msg, '❌')]);
  const points = CARREIRA_POINTS[Math.min(state.clue, CARREIRA_POINTS.length - 1)];
  award(player, points, deps.now.getTime());
  state.solved = true;
  return save([react(msg, '✅'), ...reveal(state, deps, `✅ *${firstName(player.name)}* acertou (+${points}): era *${card.name}*.`)]);
}

/** Prazo da dica: solta a próxima ou revela. */
export function carreiraTimeout(state: CarreiraParty, deps: PartyDeps): Outgoing[] {
  const card = state.cards[state.round];
  if (state.clue < card.clues.length) {
    state.clue += 1;
    state.attempts = [];
    const points = CARREIRA_POINTS[Math.min(state.clue, CARREIRA_POINTS.length - 1)];
    const last = state.clue === card.clues.length;
    return [
      text(`💡 *Dica ${state.clue}:* ${card.clues[state.clue - 1]}\n${card.path.join(' → ')}\nVale ${points}.${last ? ' Última dica!' : ''} Todos podem palpitar de novo.`),
      schedule(state, PARTY_CONFIG.carreira.seconds, deps.now.getTime(), 'cr'),
    ];
  }
  return reveal(state, deps, `⏱️ Ninguém acertou. Era *${card.name}*.`);
}

function reveal(state: CarreiraParty, deps: PartyDeps, headline: string): Outgoing[] {
  state.solved = true;
  state.deadline = null;
  state.timerToken = null;
  if (state.round >= state.totalRounds - 1) return finishCarreira(state, headline);
  return [text(headline), scoreImage(state, false), ...pauseBeforeNext(state, deps)];
}

export function finishCarreira(state: CarreiraParty, reason: string): Outgoing[] {
  return finishByScore(state, reason, 'abrir carreira');
}

export function skipCarreira(state: CarreiraParty, deps: PartyDeps): Outgoing[] {
  return reveal(state, deps, `Rodada encerrada pelo anfitrião. Era *${state.cards[state.round].name}*.`);
}
