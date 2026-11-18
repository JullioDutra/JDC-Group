import { NextResponse } from 'next/server';
import { secretMatches } from '@/lib/auth';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';

/**
 * Diagnóstico da busca de jogadores: os nomes que mais falharam.
 * GET /api/admin/lookups?resultado=ia-nao-achou&horas=24   (Authorization: Bearer ADMIN_KEY)
 * resultado: ia-nao-achou · ia-nome-diferente · base-fora-do-contexto · nao-achou-recente · ia · base
 */
export async function GET(request: Request) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!secretMatches(bearer, process.env.ADMIN_KEY)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const outcome = params.get('resultado') ?? 'ia-nao-achou';
  const hours = Math.min(720, Math.max(1, Number(params.get('horas') ?? 24) || 24));
  const store = getStore();
  return NextResponse.json({
    resumo: await store.lookupSummary(hours),
    resultado: outcome,
    nomes: await store.topLookups(outcome, hours, 80),
  });
}
