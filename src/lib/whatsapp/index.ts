import type { IncomingMessage } from '../game/types';
import { evolution } from './evolution';
import { zapi } from './zapi';

/**
 * Adaptador de gateway de WhatsApp. O jogo só conhece esta interface;
 * trocar de provedor (ou ir para 2x2 em outro canal) não toca no motor.
 */
export interface WhatsAppProvider {
  /** Converte o corpo do webhook em mensagem de grupo; null = ignorar. */
  parseWebhook(body: unknown): IncomingMessage | null;
  sendText(groupJid: string, text: string): Promise<void>;
  sendImage(groupJid: string, png: Buffer, caption?: string): Promise<void>;
  /** Reage a uma mensagem recebida (ex.: ✅). */
  sendReaction(groupJid: string, messageId: string, senderJid: string, emoji: string): Promise<void>;
}

export function getProvider(): WhatsAppProvider {
  return process.env.WHATSAPP_PROVIDER === 'zapi' ? zapi : evolution;
}

export async function postJson(url: string, headers: Record<string, string>, body: unknown): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(`WhatsApp gateway ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
}
