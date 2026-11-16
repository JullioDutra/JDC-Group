import { NextResponse } from 'next/server';
import { createLookup } from '@/lib/ai';
import { secretMatches } from '@/lib/auth';
import { handleMessage } from '@/lib/game/engine';
import { renderImage } from '@/lib/images/render';
import { getStore } from '@/lib/store';
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
    const outgoing = await handleMessage(message, { store, lookup: createLookup(store) });
    for (const out of outgoing) {
      if (out.type === 'text') await provider.sendText(message.groupJid, out.text);
      else await provider.sendImage(message.groupJid, await renderImage(out.image), out.caption);
    }
    return NextResponse.json({ ok: true, sent: outgoing.length });
  } catch (error) {
    console.error('webhook failed', error);
    // 200 para o gateway não reenviar em loop; o erro fica nos logs da Vercel.
    return NextResponse.json({ ok: false });
  }
}
