import { NextResponse } from 'next/server';
import { createLookup } from '@/lib/ai';
import { hasMaritacaKey } from '@/lib/ai/maritaca';
import { secretMatches } from '@/lib/auth';
import { handleMessage, handleTick } from '@/lib/game/engine';
import type { Outgoing } from '@/lib/game/types';
import { renderImage } from '@/lib/images/render';
import { getStore, hasDatabase } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Simulador: roda o mesmo motor do WhatsApp para a página /jogar.
 * Protegido por ADMIN_KEY porque consome créditos da IA.
 * `tick: true` simula o fim do tempo da rodada (no WhatsApp quem faz isso é o QStash).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { key?: string; room?: string; sender?: string; text?: string; tick?: boolean }
    | null;
  if (!secretMatches(body?.key, process.env.ADMIN_KEY)) {
    return NextResponse.json({ error: 'Chave inválida.' }, { status: 401 });
  }
  const room = (body?.room ?? '').replace(/[^a-z0-9]/gi, '').slice(0, 24);
  if (!room) return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });

  const store = getStore();
  const groupJid = `sim-${room}`;
  const deps = { store, lookup: createLookup(store) };
  let outgoing: Outgoing[];
  let messageId: string | null = null;

  if (body?.tick) {
    outgoing = await handleTick(groupJid, null, deps, true);
  } else {
    const sender = (body?.sender ?? '').trim().slice(0, 24);
    const text = (body?.text ?? '').slice(0, 200);
    if (!sender || !text.trim()) return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    messageId = crypto.randomUUID();
    outgoing = await handleMessage(
      {
        id: messageId,
        groupJid,
        groupName: 'Simulador',
        senderJid: `sim-${room}-${sender.toLowerCase()}`,
        senderName: sender,
        text,
      },
      deps,
    );
  }

  const messages = [];
  for (const out of outgoing) {
    if (out.type === 'text') messages.push({ type: 'text', text: out.text });
    else if (out.type === 'image') {
      messages.push({
        type: 'image',
        caption: out.caption ?? '',
        src: `data:image/png;base64,${(await renderImage(out.image)).toString('base64')}`,
      });
    } else if (out.type === 'react') messages.push({ type: 'react', messageId: out.messageId, emoji: out.emoji });
    else if (out.type === 'schedule') messages.push({ type: 'timer', seconds: out.delaySeconds - 1 });
  }
  return NextResponse.json({ messageId, messages, demoAi: !hasMaritacaKey(), volatile: !hasDatabase() });
}
