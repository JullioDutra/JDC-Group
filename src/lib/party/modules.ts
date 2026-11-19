import type { CarreiraParty, GradeParty, IncomingMessage, Outgoing, PartyGame, PartyPlayer, PartyState, PenaltisParty, PonteParty } from '../game/types';
import type { PartyDeps, Save } from './common';
import { scoreImage } from './common';
import { CARREIRA_RULES, carreiraAnswer, carreiraTimeout, finishCarreira, newCarreira, openCarreiraRound, skipCarreira, startCarreira } from './carreira';
import { PONTE_RULES, closePonteRound, newPonte, openPonteRound, ponteAnswer, startPonte } from './ponte';
import { GRADE_RULES, finishGrade, gradeAnswer, gradeTimeout, newGrade, startGrade } from './grade';
import { PENALTIS_RULES, finishPenaltis, goals, newPenaltis, penaltisAnswer, penaltisTimeout, scoreLine, startPenaltis } from './penaltis';
import { finishByScore } from './common';
import { LEILAO_RULES, closeLot, endLeilao, leilaoAnswer, leilaoBoard, newLeilao, startLeilao } from './leilao';
import type { AnagramaParty, ImpostorParty, LeilaoParty, Top100Party } from '../game/types';
import { IMPOSTOR_RULES, endImpostor, impostorAnswer, impostorBoard, impostorSkip, impostorTimeout, newImpostor, startImpostor } from './impostor';
import { TOP100_RULES, finishTop100, newTop100, playedTodayKey, startTop100, top100Answer, top100Timeout } from './top100';
import { ANAGRAMA_RULES, anagramaAnswer, anagramaTimeout, newAnagrama, openAnagramaRound, skipAnagrama, startAnagrama } from './anagrama';

/**
 * Jogos gerados da base de jogadores (frente F2). Cada um declara as peças
 * que o motor das salas usa; assim o motor não precisa de um "if" por jogo.
 */
export type BaseGameState = CarreiraParty | PonteParty | GradeParty | PenaltisParty | LeilaoParty | AnagramaParty | Top100Party | ImpostorParty;

export interface PartyModule {
  rules: string[];
  create(): Partial<BaseGameState>;
  start(state: BaseGameState, deps: PartyDeps): Promise<Outgoing[]>;
  answer(state: BaseGameState, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[];
  timeout(state: BaseGameState, deps: PartyDeps): Outgoing[];
  /** "pular"/"próxima" do anfitrião. */
  skip(state: BaseGameState, deps: PartyDeps): Outgoing[];
  /** Fim da pausa entre rodadas. */
  resume?(state: BaseGameState, deps: PartyDeps): Outgoing[];
  finish(state: BaseGameState, reason: string): Outgoing[];
  board?(state: BaseGameState, final: boolean): Outgoing;
  /** O que entra no histórico do grupo (sem repetição). */
  seenItems(state: BaseGameState): string[];
}

const carreira: PartyModule = {
  rules: CARREIRA_RULES,
  create: newCarreira,
  start: (s, d) => startCarreira(s as CarreiraParty, d),
  answer: (s, p, m, d, save) => carreiraAnswer(s as CarreiraParty, p, m, d, save),
  timeout: (s, d) => carreiraTimeout(s as CarreiraParty, d),
  skip: (s, d) => skipCarreira(s as CarreiraParty, d),
  resume: (s, d) => openCarreiraRound(s as CarreiraParty, d),
  finish: (s, reason) => finishCarreira(s as CarreiraParty, reason),
  seenItems: (s) => (s as CarreiraParty).cards.map((c) => c.id),
};

const ponte: PartyModule = {
  rules: PONTE_RULES,
  create: newPonte,
  start: (s, d) => startPonte(s as PonteParty, d),
  answer: (s, p, m, d, save) => ponteAnswer(s as PonteParty, p, m, d, save),
  timeout: (s, d) => closePonteRound(s as PonteParty, d, 'Tempo esgotado.'),
  skip: (s, d) => closePonteRound(s as PonteParty, d, 'Rodada encerrada pelo anfitrião.'),
  resume: (s, d) => openPonteRound(s as PonteParty, d),
  finish: (s, reason) => finishByScore(s, reason, 'abrir ponte'),
  seenItems: (s) => (s as PonteParty).rounds.map((r) => r.exampleId),
};

const grade: PartyModule = {
  rules: GRADE_RULES,
  create: newGrade,
  start: (s, d) => startGrade(s as GradeParty, d),
  answer: (s, p, m, d, save) => gradeAnswer(s as GradeParty, p, m, d, save),
  timeout: (s, d) => gradeTimeout(s as GradeParty, d),
  skip: (s, d) => gradeTimeout(s as GradeParty, d),
  finish: (s, reason) => finishGrade(s as GradeParty, reason, null),
  board: (s, final) => ({ type: 'image', image: { kind: 'gradeBoard', state: structuredClone(s as GradeParty), final } }),
  seenItems: () => [],
};

const penaltis: PartyModule = {
  rules: PENALTIS_RULES,
  create: newPenaltis,
  start: (s, d) => startPenaltis(s as PenaltisParty, d),
  answer: (s, p, m, d, save) => penaltisAnswer(s as PenaltisParty, p, m, d, save),
  timeout: (s, d) => penaltisTimeout(s as PenaltisParty, d),
  skip: (s, d) => penaltisTimeout(s as PenaltisParty, d),
  finish: (s, reason) => {
    const st = s as PenaltisParty;
    const [a, b] = st.players;
    const ga = goals(st, a.jid);
    const gb = goals(st, b.jid);
    return finishPenaltis(st, `${reason}\n${scoreLine(st)}`, ga === gb ? null : ga > gb ? a.jid : b.jid);
  },
  board: (s) => ({ type: 'text', text: scoreLine(s as PenaltisParty) }),
  seenItems: () => [],
};

const leilao: PartyModule = {
  rules: LEILAO_RULES,
  create: () => newLeilao(),
  start: (s, d) => startLeilao(s as LeilaoParty, d),
  answer: (s, p, m, d, save) => leilaoAnswer(s as LeilaoParty, p, m, d, save),
  timeout: (s, d) => closeLot(s as LeilaoParty, d),
  skip: (s, d) => closeLot(s as LeilaoParty, d, (s as LeilaoParty).phase === 'voting' ? 'Votação encerrada pelo anfitrião.' : 'Martelo batido pelo anfitrião.'),
  finish: (s, reason) => endLeilao(s as LeilaoParty, reason),
  board: (s, final) => leilaoBoard(s as LeilaoParty, final),
  seenItems: (s) => (s as LeilaoParty).lots.map((l) => l.id),
};

const anagrama: PartyModule = {
  rules: ANAGRAMA_RULES,
  create: () => newAnagrama(),
  start: async (s, d) => startAnagrama(s as AnagramaParty, d),
  answer: (s, p, m, d, save) => anagramaAnswer(s as AnagramaParty, p, m, d, save),
  timeout: (s, d) => anagramaTimeout(s as AnagramaParty, d),
  skip: (s, d) => skipAnagrama(s as AnagramaParty, d),
  resume: (s, d) => openAnagramaRound(s as AnagramaParty, d),
  finish: (s, reason) => finishByScore(s, reason, 'abrir anagrama'),
  seenItems: (s) => (s as AnagramaParty).order,
};

const top100: PartyModule = {
  rules: TOP100_RULES,
  create: () => newTop100(new Date()),
  start: async (s, d) => startTop100(s as Top100Party, d),
  answer: (s, p, m, d, save) => top100Answer(s as Top100Party, p, m, d, save),
  timeout: (s) => top100Timeout(s as Top100Party),
  skip: (s) => finishTop100(s as Top100Party, 'Encerrado pelo anfitrião.'),
  finish: (s, reason) => finishTop100(s as Top100Party, reason),
  board: (s, final) => ({ type: 'image', image: { kind: 'top100Board', state: structuredClone(s as Top100Party), final } }),
  // Marca o dia (o grupo só joga uma vez por dia) e a lista.
  seenItems: (s) => [playedTodayKey((s as Top100Party).day), (s as Top100Party).listId],
};

const impostor: PartyModule = {
  rules: IMPOSTOR_RULES,
  create: () => newImpostor(),
  start: async (s, d) => startImpostor(s as ImpostorParty, d),
  answer: (s, p, m, d, save) => impostorAnswer(s as ImpostorParty, p, m, d, save),
  timeout: (s, d) => impostorTimeout(s as ImpostorParty, d),
  skip: (s, d) => impostorSkip(s as ImpostorParty, d),
  finish: (s, reason) => endImpostor(s as ImpostorParty, reason),
  board: (s, final) => impostorBoard(s as ImpostorParty, final),
  seenItems: (s) => [(s as ImpostorParty).secretId],
};

export const MODULES: Partial<Record<PartyGame, PartyModule>> = { carreira, ponte, grade, penaltis, leilao, anagrama, top100, impostor };

export function isBaseGame(state: PartyState): state is BaseGameState {
  return state.game in MODULES;
}

export function moduleOf(state: BaseGameState): PartyModule {
  return MODULES[state.game]!;
}

export function moduleBoard(state: BaseGameState, final: boolean): Outgoing {
  return moduleOf(state).board?.(state, final) ?? scoreImage(state, final);
}
