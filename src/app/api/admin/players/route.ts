import { NextResponse } from 'next/server';
import { createLookup } from '@/lib/ai';
import { secretMatches } from '@/lib/auth';
import { queryKeys, queryTokens } from '@/lib/players/keys';
import { describeContext } from '@/lib/players/lookup';
import { rankCandidates } from '@/lib/players/rank';
import type { LookupContext } from '@/lib/players/types';
import type { MetricKey, Position } from '@/lib/game/types';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Diagnóstico da busca de jogadores.
 * GET /api/admin/players?q=victor&pos=GOL&club=atletico-mg   (Authorization: Bearer ADMIN_KEY)
 *   &nation=brasil   seleção em vez de clube
 *   &metric=careerGoals   número do tema
 *   &ia=1   roda a busca completa (pode chamar a IA e gravar na base)
 */
export async function GET(request: Request) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!secretMatches(bearer, process.env.ADMIN_KEY)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const q = params.get('q') ?? '';
  const pos = params.get('pos')?.toUpperCase() as Position | undefined;
  const club = params.get('club') ?? undefined;
  const nation = params.get('nation') ?? undefined;
  const ctx: LookupContext = {
    position: pos && ['GOL', 'DEF', 'MEI', 'ATA'].includes(pos) ? pos : null,
    ...(club ? { kind: 'club' as const, teamId: club } : nation ? { kind: 'country' as const, teamId: nation } : {}),
    ...(params.get('metric') ? { metric: params.get('metric') as MetricKey } : {}),
  };
  const store = getStore();
  const candidates = await store.findPlayers(queryKeys(q), 80);
  const parts = queryTokens(q);
  const more = parts.length > 1 ? await store.findPlayers(parts, 120) : [];
  const ranked = rankCandidates([...candidates, ...more], q, ctx).slice(0, 8);
  const result = params.get('ia') === '1' ? await createLookup(store)(q, ctx) : null;
  return NextResponse.json({
    contexto: describeContext(ctx) ?? null,
    candidatos: ranked.map((r) => ({
      id: r.record.id,
      nome: r.record.name,
      posicoes: r.record.positions,
      selecao: r.record.nationality,
      nascimento: r.record.birthDate,
      clubes: r.record.clubs.slice(0, 12),
      fama: r.record.sitelinks,
      cabeNoContexto: r.fits,
      pontos: Math.round(r.score),
      dados: r.record.stats,
    })),
    buscaCompleta: result,
  });
}
