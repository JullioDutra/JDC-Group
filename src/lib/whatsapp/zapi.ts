import type { IncomingMessage } from '../game/types';
import { postJson, type WhatsAppProvider } from './index';

/** Z-API (gateway brasileiro hospedado). */

interface ReceivedPayload {
  type?: string;
  isGroup?: boolean;
  fromMe?: boolean;
  messageId?: string;
  phone?: string;
  chatName?: string;
  participantPhone?: string;
  participantLid?: string;
  senderName?: string;
  text?: { message?: string };
}

const config = () => ({
  url: `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}`,
  headers: { 'client-token': process.env.ZAPI_CLIENT_TOKEN ?? '' },
});

export const zapi: WhatsAppProvider = {
  parseWebhook(body) {
    const p = body as ReceivedPayload;
    if (!p?.isGroup || p.fromMe || !p.messageId || !p.phone) return null;
    const text = p.text?.message;
    const sender = p.participantPhone ?? p.participantLid;
    if (!text || !sender) return null;
    const message: IncomingMessage = {
      id: p.messageId,
      groupJid: p.phone,
      groupName: p.chatName,
      senderJid: sender,
      senderName: p.senderName?.trim() || 'Jogador',
      text,
    };
    return message;
  },

  async sendText(groupJid, text) {
    const { url, headers } = config();
    await postJson(`${url}/send-text`, headers, { phone: groupJid, message: text });
  },

  async sendImage(groupJid, png, caption) {
    const { url, headers } = config();
    await postJson(`${url}/send-image`, headers, {
      phone: groupJid,
      image: `data:image/png;base64,${png.toString('base64')}`,
      caption: caption ?? '',
    });
  },
};
