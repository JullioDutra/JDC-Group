import type { IncomingMessage } from '../game/types';
import { postJson, type WhatsAppProvider } from './index';

/** Evolution API v2 (self-hosted, baseada em Baileys). */

interface UpsertPayload {
  event?: string;
  data?: {
    key?: { remoteJid?: string; fromMe?: boolean; id?: string; participant?: string; participantAlt?: string };
    pushName?: string;
    message?: { conversation?: string; extendedTextMessage?: { text?: string } };
  };
}

const config = () => ({
  url: (process.env.EVOLUTION_API_URL ?? '').replace(/\/$/, ''),
  instance: encodeURIComponent(process.env.EVOLUTION_INSTANCE ?? ''),
  headers: { apikey: process.env.EVOLUTION_API_KEY ?? '' },
});

export const evolution: WhatsAppProvider = {
  parseWebhook(body) {
    const payload = body as UpsertPayload;
    const event = (payload?.event ?? '').toLowerCase().replace('_', '.');
    const key = payload?.data?.key;
    if (event !== 'messages.upsert' || !key?.id || key.fromMe) return null;
    if (!key.remoteJid?.endsWith('@g.us')) return null; // só grupos
    const text = payload.data?.message?.conversation ?? payload.data?.message?.extendedTextMessage?.text;
    const sender = key.participant ?? key.participantAlt;
    if (!text || !sender) return null;
    const message: IncomingMessage = {
      id: key.id,
      groupJid: key.remoteJid,
      senderJid: sender.replace(/:\d+@/, '@'), // remove sufixo de dispositivo
      senderName: payload.data?.pushName?.trim() || 'Jogador',
      text,
    };
    return message;
  },

  async sendText(groupJid, text) {
    const { url, instance, headers } = config();
    await postJson(`${url}/message/sendText/${instance}`, headers, { number: groupJid, text });
  },

  async sendImage(groupJid, png, caption) {
    const { url, instance, headers } = config();
    await postJson(`${url}/message/sendMedia/${instance}`, headers, {
      number: groupJid,
      mediatype: 'image',
      mimetype: 'image/png',
      fileName: 'duelo-de-craques.png',
      caption: caption ?? '',
      media: png.toString('base64'),
    });
  },
};
