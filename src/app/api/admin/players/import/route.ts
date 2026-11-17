import { NextResponse } from 'next/server';
import { secretMatches } from '@/lib/auth';
import { importStep, newImportState, type ImportState } from '@/lib/players/wikidata';
import { publicOrigin, scheduleAdminCall } from '@/lib/scheduler';
import { getStore, hasDatabase } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 60;

const STATE_ID = 'wikidata';

/**
 * Carga da base de jogadores a partir do Wikidata, em lotes.
 *
 * POST /api/admin/players/import  (Authorization: Bearer ADMIN_KEY)
 *   {"action": "start"}   começa do zero com o plano padrão (mundo + clubes de 27 países)
 *   {"action": "start", "onlyParts": [1]}   só uma parte do plano (ex.: 1 = clubes do Brasil)
 *   {"action": "step"}    roda o próximo lote (o QStash chama sozinho, em cadeia)
 *   {"action": "stop"}    para a cadeia
 *   {"action": "status"}  mostra o andamento
 */
export async function POST(request: Request) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!secretMatches(bearer, process.env.ADMIN_KEY)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 500 });

  const store = getStore();
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    runId?: string;
    untilYear?: number;
    onlyParts?: number[];
  };
  const action = body.action ?? 'status';
  let state = (await store.getImportState(STATE_ID)) as (ImportState & { stopped?: boolean; errors?: number }) | null;

  if (action === 'status') return NextResponse.json({ state, players: await store.countPlayers() });
  if (action === 'stop') {
    if (state) await store.setImportState(STATE_ID, { ...state, stopped: true });
    return NextResponse.json({ ok: true, stopped: true });
  }
  if (action === 'start') {
    state = { ...newImportState(body), errors: 0 };
  } else if (!state || state.done || state.stopped) {
    return NextResponse.json({ ok: false, reason: 'nada para continuar', state });
  } else if (body.runId && body.runId !== state.runId) {
    return NextResponse.json({ ok: false, reason: 'cadeia antiga (outra carga começou depois)' });
  }

  // Vários lotes por chamada (até ~25 s), para gastar menos mensagens do QStash.
  const started = Date.now();
  let next: ImportState = state;
  do {
    next = await importStep(next, (records) => store.upsertPlayers(records));
  } while (!next.done && !next.lastError && Date.now() - started < 25_000);
  const errors = next.lastError ? (state.errors ?? 0) + 1 : 0;
  const saved = { ...next, errors };
  await store.setImportState(STATE_ID, saved);

  // Continua sozinho: falha passageira espera mais; 6 falhas seguidas param a cadeia.
  let chained = false;
  if (!saved.done && errors < 6) {
    const url = `${publicOrigin(request)}/api/admin/players/import`;
    chained = await scheduleAdminCall(url, { action: 'step', runId: saved.runId }, errors ? 30 * errors : 2).catch((error) => {
      console.error('agendar próximo lote falhou', error);
      return false;
    });
  }
  const { plan, ...summary } = saved;
  return NextResponse.json({
    ok: !saved.lastError,
    chained,
    parte: plan[saved.part]?.label ?? 'fim',
    state: summary,
    players: await store.countPlayers(),
  });
}
