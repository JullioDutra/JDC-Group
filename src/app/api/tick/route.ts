import { NextResponse } from 'next/server';
import { createLookup } from '@/lib/ai';
import { defaultJudge, defaultWordCheck } from '@/lib/ai/judge';
import { dispatch } from '@/lib/dispatch';
import { handleTick } from '@/lib/game/engine';
import { publicOrigin, verifyTick } from '@/lib/scheduler';
import { getStore } from '@/lib/store';
import { getProvider } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Prazo de uma rodada do Modo em Grupo. Chamado pelo QStash, com assinatura.
 * Se a rodada já mudou (todos responderam antes), o token não bate e nada acontece.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const origin = publicOrigin(request);
  if (!(await verifyTick(origin, request.headers.get('upstash-signature'), raw))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = JSON.parse(raw) as { groupJid?: string; token?: string };
  if (!body.groupJid || !body.token) return NextResponse.json({ ok: true, ignored: true });

  const store = getStore();
  try {
    const outgoing = await handleTick(body.groupJid, body.token, { store, lookup: createLookup(store), judge: defaultJudge(), checkWords: defaultWordCheck() });
    await dispatch(getProvider(), body.groupJid, outgoing, origin);
    return NextResponse.json({ ok: true, sent: outgoing.length });
  } catch (error) {
    console.error('tick failed', error);
    return NextResponse.json({ ok: false });
  }
}
