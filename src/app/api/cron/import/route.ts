import { NextResponse } from 'next/server';
import { secretMatches } from '@/lib/auth';
import { IMPORT_STATE_ID, isStalled, runImportCall, type StoredImport } from '@/lib/players/importRunner';
import { publicOrigin } from '@/lib/scheduler';
import { getStore, hasDatabase } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Cron diário da Vercel (vercel.json): se a carga de jogadores parou no meio
 * (por exemplo, a cota do QStash acabou e a cadeia quebrou), retoma de onde
 * parou. Não faz nada se a carga estiver andando, terminada ou parada à mão.
 * A Vercel manda "Authorization: Bearer CRON_SECRET"; o admin também pode chamar.
 */
export async function GET(request: Request) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '');
  const ok = secretMatches(bearer, process.env.CRON_SECRET) || secretMatches(bearer, process.env.ADMIN_KEY);
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ ok: false, reason: 'sem banco' });
  const store = getStore();
  const state = (await store.getImportState(IMPORT_STATE_ID)) as StoredImport | null;
  if (!isStalled(state, Date.now())) {
    return NextResponse.json({ ok: true, retomou: false, motivo: !state ? 'sem carga' : state.done ? 'terminou' : state.stopped ? 'parada à mão' : 'andando' });
  }
  const result = await runImportCall(store, `${publicOrigin(request)}/api/admin/players/import`, { action: 'step' });
  return NextResponse.json({ retomou: true, ...result, state: undefined });
}
