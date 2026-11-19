import type { Outgoing } from './game/types';
import { imageAsText } from './images/fallback';
import { renderImage } from './images/render';
import { scheduleTick } from './scheduler';
import type { WhatsAppProvider } from './whatsapp';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Envia ao grupo, em ordem, o que o motor devolveu. Uma falha NUNCA para o
 * envio no meio (senão a próxima pergunta e o fim da rodada não saem):
 * - imagem que não sai: tenta de novo; se falhar, pede para a conexão se
 *   recuperar e manda o conteúdo da imagem em texto;
 * - reações e agendamentos falham em silêncio (logados).
 */
export async function dispatch(
  provider: WhatsAppProvider,
  groupJid: string,
  outgoing: Outgoing[],
  origin: string,
  pause: (ms: number) => Promise<unknown> = wait,
): Promise<void> {
  for (const out of outgoing) {
    try {
      // Texto vazio vira bolha vazia no WhatsApp: nunca manda.
      if (out.type === 'text') {
        if (out.text.trim()) await provider.sendText(groupJid, out.text);
      }
      else if (out.type === 'image') await sendImage(provider, groupJid, out, pause);
      else if (out.type === 'react') {
        // WHATSAPP_REACTIONS=0 desliga as reações (✅/❌) sem mexer no jogo.
        if (process.env.WHATSAPP_REACTIONS === '0' || !out.emoji) continue;
        await provider.sendReaction(groupJid, out.messageId, out.participant ?? out.senderJid, out.emoji).catch((e) => console.error('reaction failed', e));
      } else if (out.type === 'dm') {
        // Privado (carta do Impostor): se não sair, avisa no grupo sem revelar nada.
        try {
          await provider.sendText(out.to, out.text);
        } catch (error) {
          console.error('privado falhou', error);
          await provider.sendText(groupJid, `📭 Não consegui te mandar a carta no privado, *${out.name}*. Mande *oi* para o bot no privado.`);
        }
      } else if (out.type === 'schedule') {
        await scheduleTick(origin, groupJid, out.token, out.delaySeconds).catch((e) => console.error('schedule failed', e));
      }
    } catch (error) {
      console.error(`envio de ${out.type} falhou`, error);
    }
  }
}

async function sendImage(
  provider: WhatsAppProvider,
  groupJid: string,
  out: Extract<Outgoing, { type: 'image' }>,
  pause: (ms: number) => Promise<unknown>,
): Promise<void> {
  const png = await renderImage(out.image);
  try {
    await provider.sendImage(groupJid, png, out.caption);
    return;
  } catch (first) {
    console.error('imagem falhou (1ª tentativa)', first);
  }
  await pause(1500);
  try {
    await provider.sendImage(groupJid, png, out.caption);
    return;
  } catch (second) {
    console.error('imagem falhou (2ª tentativa): plano B em texto', second);
  }
  await provider.recover?.().catch((e) => console.error('recuperar conexão falhou', e));
  const text = [out.caption, imageAsText(out.image)].filter(Boolean).join('\n\n');
  if (text) await provider.sendText(groupJid, text);
}
