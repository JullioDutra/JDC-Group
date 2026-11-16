import { NextResponse } from 'next/server';
import { createLookup } from '@/lib/ai';
import { defaultJudge } from '@/lib/ai/judge';
import { secretMatches } from '@/lib/auth';
import { handleMessage } from '@/lib/game/engine';
import { dispatch } from '@/lib/dispatch';
import { ownerCheck } from '@/lib/owners';
import { getStore } from '@/lib/store';
import { publicOrigin } from '@/lib/scheduler';
import { getProvider } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Webhook do gateway de WhatsApp: recebe cada mensagem dos grupos,
 * passa pelo motor do jogo e envia as respostas (texto/imagem) em ordem.
 */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  if (!secretMatches(token, process.env.WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const provider = getProvider();
  const message = provider.parseWebhook(await request.json().catch(() => null));
  if (!message) return NextResponse.json({ ok: true, ignored: true });

  const store = getStore();
  // Gateways reenviam webhooks: cada mensagem é processada uma única vez.
  if (!(await store.markProcessed(message.id))) return NextResponse.json({ ok: true, duplicate: true });

  try {
    const outgoing = await handleMessage(message, { store, lookup: createLookup(store), canManageGroup: ownerCheck(), judge: defaultJudge() });
    await dispatch(provider, message.groupJid, outgoing, publicOrigin(request));
    return NextResponse.json({ ok: true, sent: outgoing.length });
  } catch (error) {
    console.error('webhook failed', error);
    // 200 para o gateway não reenviar em loop; o erro fica nos logs da Vercel.
    return NextResponse.json({ ok: false });
  }
}
