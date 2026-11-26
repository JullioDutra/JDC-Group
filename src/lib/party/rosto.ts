import { firstName, isChatter, looksLikePlayerName, normalize } from '../game/text';
import type { IncomingMessage, Outgoing, PartyPlayer, RostoParty } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, answerMatches, award, finishByScore, freshFirst, normalizeAnswer, pauseBeforeNext, react, schedule, scoreImage, text } from './common';
import { ROSTOS, getRosto, rostoCredit, rostoPool, type RostoPhoto } from './content/rostos';

/**
 * Rosto Borrado (em grupo, corrida): o bot manda a foto de um craque com SÓ o
 * rosto borrado. A cada etapa o borrão diminui (forte, médio, leve). O
 * primeiro que mandar o nome certo leva os pontos da etapa. Cada um tem 3
 * tentativas por foto. No fim da rodada, a foto sem borrão.
 */
export const ROSTO_POINTS = [100, 70, 40] as const;
export const ROSTO_TRIES = 3;
const STAGE_LABEL = ['Borrão forte', 'Borrão médio', 'Borrão leve'];

export const ROSTO_RULES = [
  'O bot manda a foto de um craque com só o rosto borrado. Mande o nome dele.',
  `A cada ${PARTY_CONFIG.rosto.seconds}s o borrão diminui. Acertou no borrão forte: ${ROSTO_POINTS[0]}; no médio: ${ROSTO_POINTS[1]}; no leve: ${ROSTO_POINTS[2]}.`,
  `Vale o nome famoso, o completo ou o apelido. ${ROSTO_TRIES} tentativas por foto. Vence quem somar mais.`,
];

export function newRosto(): Pick<RostoParty, 'game' | 'round' | 'totalRounds' | 'order' | 'level' | 'tries' | 'solved'> {
  return { game: 'rosto', round: -1, totalRounds: PARTY_CONFIG.rosto.rounds!, order: [], level: 0, tries: {}, solved: false };
}

export async function startRosto(state: RostoParty, deps: PartyDeps): Promise<Outgoing[]> {
  // Fixas + as que o admin enviou; as que o grupo ainda não viu primeiro.
  // Se o admin escondeu tudo, valem as fixas (o jogo não abre vazio).
  const found = await rostoPool(deps.store);
  const pool = found.length ? found : ROSTOS;
  const byId = new Map(pool.map((p) => [p.id, p]));
  state.order = freshFirst(pool.map((r) => r.id), deps.rng, deps.seen).slice(0, state.totalRounds);
  state.photos = state.order.map((id) => {
    const p = byId.get(id)!;
    return { id, name: p.name, aliases: p.aliases, faces: p.faces, credit: p.upload ? p.credit ?? '' : '', ...(p.upload ? { upload: true } : {}) };
  });
  state.totalRounds = state.order.length;
  state.status = 'PLAYING';
  state.round = -1;
  return [text(`📸 *Rosto Borrado* valendo! ${state.players.length} jogadores, ${state.totalRounds} fotos.`), ...openRostoRound(state, deps)];
}

function photoOf(state: RostoParty): RostoPhoto {
  const id = state.order[state.round];
  const fixed = getRosto(id);
  const saved = state.photos?.find((p) => p.id === id);
  if (!saved) return fixed!;
  return fixed
    ? { ...fixed, name: saved.name, aliases: saved.aliases, faces: saved.faces }
    : { id, name: saved.name, aliases: saved.aliases, url: '', faces: saved.faces, author: '', license: '', upload: true, credit: saved.credit };
}

function faceSpec(photo: RostoPhoto, edited: boolean) {
  return { faces: photo.faces, credit: rostoCredit(photo, edited) };
}

function stageImage(state: RostoParty, caption: string): Outgoing {
  const photo = photoOf(state);
  return {
    type: 'image',
    image: { kind: 'faceQuiz', photoId: photo.id, level: state.level, round: state.round + 1, total: state.totalRounds, ...faceSpec(photo, true) },
    caption: `${caption}\n_${rostoCredit(photo)}_`,
  };
}

export function openRostoRound(state: RostoParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  state.level = 0;
  state.tries = {};
  state.solved = false;
  state.warned = [];
  return [
    stageImage(state, `*Foto ${state.round + 1}/${state.totalRounds}* · Quem é o craque? Mande o nome. Vale *${ROSTO_POINTS[0]}*.`),
    schedule(state, PARTY_CONFIG.rosto.seconds, deps.now.getTime(), 'ro'),
  ];
}

/** O palpite bate com o nome (tolera erro de digitação em nome longo, como os outros quizzes). */
export function rostoHit(photo: RostoPhoto, raw: string): boolean {
  return answerMatches([photo.name, ...photo.aliases], normalizeAnswer(raw));
}

export function rostoAnswer(state: RostoParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (state.solved || state.round < 0) return [];
  const raw = msg.text.trim();
  // Só o que parece um nome conta como tentativa (conversa não gasta).
  if (raw.length < 2 || raw.length > 40 || /[?!\n]/.test(raw) || isChatter(raw) || !looksLikePlayerName(raw)) return [];
  const used = state.tries[player.jid] ?? 0;
  if (used >= ROSTO_TRIES) return [];
  state.tries[player.jid] = used + 1;
  player.missed = 0;
  const photo = photoOf(state);
  if (!rostoHit(photo, raw)) return save([react(msg, used + 1 >= ROSTO_TRIES ? '🚫' : '❌')]);
  const points = ROSTO_POINTS[Math.min(state.level, ROSTO_POINTS.length - 1)];
  award(player, points, deps.now.getTime());
  return save([react(msg, '✅'), ...revealRosto(state, deps, `✅ *${firstName(player.name)}* acertou (+${points}): era *${photo.name}*!`)]);
}

/** Prazo da etapa: o borrão diminui; depois da etapa leve, revela. */
export function rostoTimeout(state: RostoParty, deps: PartyDeps): Outgoing[] {
  if (state.solved) return [];
  if (state.level < ROSTO_POINTS.length - 1) {
    state.level += 1;
    return [
      stageImage(state, `${STAGE_LABEL[state.level]} · Foto ${state.round + 1}/${state.totalRounds}. Agora vale *${ROSTO_POINTS[state.level]}*.`),
      schedule(state, PARTY_CONFIG.rosto.seconds, deps.now.getTime(), 'ro'),
    ];
  }
  return revealRosto(state, deps, `⏱️ Ninguém acertou. Era *${photoOf(state).name}*.`);
}

function revealRosto(state: RostoParty, deps: PartyDeps, headline: string): Outgoing[] {
  const photo = photoOf(state);
  state.solved = true;
  state.deadline = null;
  state.timerToken = null;
  const reveal: Outgoing = {
    type: 'image',
    image: { kind: 'faceQuiz', photoId: photo.id, level: 3, round: state.round + 1, total: state.totalRounds, answer: photo.name, ...faceSpec(photo, false) },
    caption: `${headline}\n_${rostoCredit(photo, false)}_`,
  };
  if (state.round >= state.totalRounds - 1) return [reveal, ...finishByScore(state, '', 'abrir rosto borrado')];
  const out: Outgoing[] = [reveal];
  if ((state.round + 1) % 4 === 0) out.push(scoreImage(state, false));
  return [...out, ...pauseBeforeNext(state, deps)];
}

export function skipRosto(state: RostoParty, deps: PartyDeps): Outgoing[] {
  if (state.solved) return [];
  return revealRosto(state, deps, `Rodada encerrada pelo anfitrião. Era *${photoOf(state).name}*.`);
}

/** Nome sem acento, para comparar em testes e no histórico. */
export const rostoKey = (photo: RostoPhoto) => normalize(photo.name);
