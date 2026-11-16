import { NextResponse } from 'next/server';
import { secretMatches } from '@/lib/auth';
import { NeonStore } from '@/lib/store/neon';

export const runtime = 'nodejs';

/** Cria as tabelas no Neon. Idempotente. POST /api/admin/migrate  (Authorization: Bearer ADMIN_KEY) */
export async function POST(request: Request) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!secretMatches(bearer, process.env.ADMIN_KEY)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 500 });
  await new NeonStore(url).migrate();
  return NextResponse.json({ ok: true });
}
