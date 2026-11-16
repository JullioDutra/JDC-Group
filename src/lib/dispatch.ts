import type { Outgoing } from './game/types';
import { renderImage } from './images/render';
import { scheduleTick } from './scheduler';
import type { WhatsAppProvider } from './whatsapp';

/**
 * Envia ao grupo, em ordem, o que o motor devolveu. Reações e agendamentos
 * falham em silêncio (logados): não podem derrubar a jogada.
 */
export async function dispatch(
  provider: WhatsAppProvider,
  groupJid: string,
  outgoing: Outgoing[],
  origin: string,
): Promise<void> {
  for (const out of outgoing) {
    if (out.type === 'text') await provider.sendText(groupJid, out.text);
    else if (out.type === 'image') await provider.sendImage(groupJid, await renderImage(out.image), out.caption);
    else if (out.type === 'react') {
      await provider.sendReaction(groupJid, out.messageId, out.senderJid, out.emoji).catch((e) => console.error('reaction failed', e));
    } else if (out.type === 'schedule') {
      await scheduleTick(origin, groupJid, out.token, out.delaySeconds).catch((e) => console.error('schedule failed', e));
    }
  }
}
