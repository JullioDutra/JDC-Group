import { extendPlan, importStep, newImportState, type ImportState } from './wikidata';
import { scheduleAdminCall } from '../scheduler';
import type { Store } from '../store/types';

export const IMPORT_STATE_ID = 'wikidata';

/**
 * Estado da carga gravado no banco. Além do andamento do Wikidata, guarda o
 * gasto de mensagens do QStash no dia: a cota grátis é de 1.000 por dia e é a
 * MESMA dos prazos das rodadas. Em 17/11 a carga gastou tudo e as rodadas
 * ficaram sem prazo por 4 h. Agora ela usa no máximo IMPORT_DAILY_CALLS (350)
 * e o resto fica para os jogos.
 */
export type StoredImport = ImportState & {
  stopped?: boolean;
  errors?: number;
  leaseUntil?: number;
  callsDay?: string;
  callsToday?: number;
  /** Último problema ao agendar o próximo lote (ex.: cota do QStash). */
  chainError?: string;
  /** Quando o próximo lote está marcado (ISO). */
  nextAt?: string;
};

export const dailyBudget = () => Math.max(20, Number(process.env.IMPORT_DAILY_CALLS) || 350);

/** Segundos até 00:05 UTC do dia seguinte (quando a cota do QStash renova). */
export function secondsToNextDay(now: Date): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 5, 0);
  return Math.max(60, Math.round((next - now.getTime()) / 1000));
}

export type ImportCall = { action?: string; runId?: string; untilYear?: number; onlyParts?: number[] };

/**
 * Uma chamada da carga: roda lotes por até ~36 s e agenda a próxima chamada
 * (respeitando o orçamento diário). Usada pela rota de admin e pelo cron diário.
 */
export async function runImportCall(store: Store, url: string, body: ImportCall, now = new Date()) {
  const action = body.action ?? 'status';
  let state = (await store.getImportState(IMPORT_STATE_ID)) as StoredImport | null;
  // Partes novas do plano (lendas, reparo das seleções) entram na carga em andamento.
  if (state && Array.isArray(state.plan) && !state.stopped && action !== 'status') state = extendPlan(state);

  if (action === 'status') return { state, players: await store.countPlayers() };
  if (action === 'stop') {
    if (state) await store.setImportState(IMPORT_STATE_ID, { ...state, stopped: true });
    return { ok: true, stopped: true };
  }
  if (action === 'start') {
    state = { ...newImportState(body), errors: 0, callsDay: state?.callsDay, callsToday: state?.callsToday };
  } else if (state && !Array.isArray(state.plan)) {
    return { ok: false, reason: 'carga no formato antigo: mande {"action":"start"} para recomeçar com o plano novo' };
  } else if (!state || state.done || state.stopped) {
    return { ok: false, reason: 'nada para continuar', state };
  } else if (body.runId && body.runId !== state.runId) {
    return { ok: false, reason: 'cadeia antiga (outra carga começou depois)' };
  } else if (state.leaseUntil && state.leaseUntil > Date.now()) {
    // Trava: só um lote por vez. Uma cadeia duplicada termina aqui.
    return { ok: false, reason: 'outro lote em andamento', state: { cursor: state.cursor, part: state.part } };
  }
  await store.setImportState(IMPORT_STATE_ID, { ...state, leaseUntil: Date.now() + 58_000 });

  // Vários lotes por chamada, sempre terminando antes dos 60 s da Vercel:
  // cada consulta só começa se couber até o prazo (48 s).
  const started = Date.now();
  const deadline = started + 48_000;
  let next: ImportState = state;
  try {
    do {
      next = await importStep(next, (records) => store.upsertPlayers(records), fetch, deadline);
    } while (!next.done && !next.lastError && !next.yielded && Date.now() - started < 36_000);
  } catch (error) {
    next = { ...next, lastError: (error as Error).message.slice(0, 200) };
  }
  const errors = next.lastError ? (state.errors ?? 0) + 1 : 0;
  const today = now.toISOString().slice(0, 10);
  let callsToday = state.callsDay === today ? (state.callsToday ?? 0) : 0;
  const saved: StoredImport = { ...next, errors, leaseUntil: undefined, callsDay: today, callsToday, chainError: undefined, nextAt: undefined };

  // Continua sozinho. Cota do Wikidata: espera o que ele pedir. Outras falhas:
  // espera cada vez mais; 10 falhas seguidas param a cadeia (o cron retoma).
  let chained = false;
  if (!saved.done && errors < 10) {
    const overBudget = callsToday >= dailyBudget();
    const delay = overBudget ? secondsToNextDay(now) : (saved.retryAfter ?? (errors ? Math.min(600, 30 * errors) : 5));
    try {
      chained = await scheduleAdminCall(url, { action: 'step', runId: saved.runId }, delay);
      if (chained) {
        callsToday += 1;
        saved.nextAt = new Date(now.getTime() + delay * 1000).toISOString();
      }
    } catch (error) {
      console.error('agendar próximo lote falhou', error);
      saved.chainError = (error as Error).message.slice(0, 120);
    }
    saved.callsToday = callsToday;
  }
  await store.setImportState(IMPORT_STATE_ID, saved);
  const { plan, ...summary } = saved;
  return {
    ok: !saved.lastError,
    chained,
    parte: plan[saved.part]?.label ?? 'fim',
    state: summary,
    players: await store.countPlayers(),
  };
}

/** A carga parou sem terminar (cadeia quebrada há mais de 15 min)? O cron diário retoma. */
export function isStalled(state: StoredImport | null, nowMs: number): boolean {
  if (!state || state.done || state.stopped || !Array.isArray(state.plan)) return false;
  if (state.leaseUntil && state.leaseUntil > nowMs) return false;
  if (state.nextAt && Date.parse(state.nextAt) > nowMs - 15 * 60_000) return false;
  const updated = state.updatedAt ? Date.parse(state.updatedAt) : 0;
  return nowMs - updated > 15 * 60_000;
}
