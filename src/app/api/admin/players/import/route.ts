import { NextResponse } from 'next/server';
import { secretMatches } from '@/lib/auth';
import { runImportCall, type ImportCall } from '@/lib/players/importRunner';
import { publicOrigin } from '@/lib/scheduler';
import { getStore, hasDatabase } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Carga da base de jogadores a partir do Wikidata, em lotes.
 *
 * POST /api/admin/players/import  (Authorization: Bearer ADMIN_KEY)
 *   {"action": "start"}   começa do zero com o plano padrão (mundo + clubes de 27 países)
 *   {"action": "start", "onlyParts": [1]}   só uma parte do plano (ex.: 1 = clubes do Brasil)
 *   {"action": "step"}    roda o próximo lote (o QStash chama sozinho, em cadeia)
 *   {"action": "stop"}    para a cadeia
 *   {"action": "status"}  mostra o andamento
 *
 * Gasta no máximo IMPORT_DAILY_CALLS (350) mensagens do QStash por dia; passou
 * disso, o próximo lote fica para 00:05 UTC. Se a cadeia quebrar, o cron
 * diário (/api/cron/import) retoma.
 */
export async function POST(request: Request) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!secretMatches(bearer, process.env.ADMIN_KEY)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 500 });
  const body = (await request.json().catch(() => ({}))) as ImportCall;
  const result = await runImportCall(getStore(), `${publicOrigin(request)}/api/admin/players/import`, body);
  return NextResponse.json(result);
}
