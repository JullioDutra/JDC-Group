import type { CarreiraParty, GradeParty, IncomingMessage, Outgoing, PartyGame, PartyPlayer, PartyState, PenaltisParty, PonteParty } from '../game/types';
import type { PartyDeps, Save } from './common';
import { scoreImage } from './common';
import { CARREIRA_RULES, carreiraAnswer, carreiraTimeout, finishCarreira, newCarreira, openCarreiraRound, skipCarreira, startCarreira } from './carreira';
import { PONTE_RULES, closePonteRound, newPonte, openPonteRound, ponteAnswer, startPonte } from './ponte';
import { GRADE_RULES, finishGrade, gradeAnswer, gradeTimeout, newGrade, startGrade } from './grade';
import { PENALTIS_RULES, finishPenaltis, goals, newPenaltis, penaltisAnswer, penaltisTimeout, scoreLine, startPenaltis } from './penaltis';
import { finishByScore } from './common';
import { LEILAO_RULES, closeLot, finishLeilao, leilaoAnswer, leilaoBoard, newLeilao, startLeilao } from './leilao';
import type { LeilaoParty } from '../game/types';

/**
 * Jogos gerados da base de jogadores (frente F2). Cada um declara as peças
 * que o motor das salas usa; assim o motor não precisa de um "if" por jogo.
 */
export type BaseGameState = CarreiraParty | PonteParty | GradeParty | PenaltisParty | LeilaoParty;

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
  create: newLeilao,
  start: (s, d) => startLeilao(s as LeilaoParty, d),
  answer: (s, p, m, d, save) => leilaoAnswer(s as LeilaoParty, p, m, d, save),
  timeout: (s, d) => closeLot(s as LeilaoParty, d),
  skip: (s, d) => closeLot(s as LeilaoParty, d, 'Martelo batido pelo anfitrião.'),
  finish: (s, reason) => finishLeilao(s as LeilaoParty, reason),
  board: (s, final) => leilaoBoard(s as LeilaoParty, final),
  seenItems: (s) => (s as LeilaoParty).lots.map((l) => l.id),
};

export const MODULES: Partial<Record<PartyGame, PartyModule>> = { carreira, ponte, grade, penaltis, leilao };

export function isBaseGame(state: PartyState): state is BaseGameState {
  return state.game in MODULES;
}

export function moduleOf(state: BaseGameState): PartyModule {
  return MODULES[state.game]!;
}

export function moduleBoard(state: BaseGameState, final: boolean): Outgoing {
  return moduleOf(state).board?.(state, final) ?? scoreImage(state, final);
}
