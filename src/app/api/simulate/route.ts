import { NextResponse } from 'next/server';
import { createLookup } from '@/lib/ai';
import { hasMaritacaKey } from '@/lib/ai/maritaca';
import { secretMatches } from '@/lib/auth';
import { handleMessage } from '@/lib/game/engine';
import { renderImage } from '@/lib/images/render';
import { getStore, hasDatabase } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Simulador: roda o mesmo motor do WhatsApp para a página /jogar.
 * Protegido por ADMIN_KEY porque consome créditos da IA.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { key?: string; room?: string; sender?: string; text?: string }
    | null;
  if (!secretMatches(body?.key, process.env.ADMIN_KEY)) {
    return NextResponse.json({ error: 'Chave inválida.' }, { status: 401 });
  }
  const room = (body?.room ?? '').replace(/[^a-z0-9]/gi, '').slice(0, 24);
  const sender = (body?.sender ?? '').trim().slice(0, 24);
  const text = (body?.text ?? '').slice(0, 200);
  if (!room || !sender || !text.trim()) return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });

  const store = getStore();
  const outgoing = await handleMessage(
    {
      id: crypto.randomUUID(),
      groupJid: `sim-${room}`,
      groupName: 'Simulador',
      senderJid: `sim-${room}-${sender.toLowerCase()}`,
      senderName: sender,
      text,
    },
    { store, lookup: createLookup(store) },
  );
  const messages = await Promise.all(
    outgoing.map(async (out) =>
      out.type === 'text'
        ? { type: 'text' as const, text: out.text }
        : {
            type: 'image' as const,
            caption: out.caption ?? '',
            src: `data:image/png;base64,${(await renderImage(out.image)).toString('base64')}`,
          },
    ),
  );
  return NextResponse.json({ messages, demoAi: !hasMaritacaKey(), volatile: !hasDatabase() });
}
