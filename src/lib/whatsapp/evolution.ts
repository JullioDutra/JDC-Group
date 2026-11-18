import type { IncomingMessage } from '../game/types';
import { postJson, type WhatsAppProvider } from './index';
import { getStore, hasDatabase } from '../store';

/**
 * Evolution API v2 (self-hosted, baseada em Baileys).
 * Formatos conferidos nos tipos do SDK oficial da v2 (evolution-api-sdk).
 */

interface TextContent {
  conversation?: string;
  extendedTextMessage?: { text?: string };
  /** Grupos com mensagens temporárias embrulham o conteúdo aqui. */
  ephemeralMessage?: { message?: TextContent };
}

interface UpsertPayload {
  event?: string;
  instance?: string;
  data?: {
    key?: {
      remoteJid?: string;
      fromMe?: boolean;
      id?: string;
      participant?: string;
      participantAlt?: string;
      participantPn?: string;
      senderPn?: string;
      participantLid?: string;
    };
    participant?: string;
    participantPn?: string;
    pushName?: string;
    message?: TextContent;
  };
}

export function evolutionConfig() {
  return {
    url: (process.env.EVOLUTION_API_URL ?? '').replace(/\/$/, ''),
    instance: process.env.EVOLUTION_INSTANCE ?? '',
    headers: { apikey: process.env.EVOLUTION_API_KEY ?? '' },
  };
}

function textOf(message: TextContent | undefined, depth = 0): string | undefined {
  if (!message || depth > 2) return undefined;
  return (
    message.conversation ??
    message.extendedTextMessage?.text ??
    textOf(message.ephemeralMessage?.message, depth + 1)
  );
}

/** Prefere o JID de telefone (@s.whatsapp.net) ao @lid, que muda entre versões. */
function pickSender(candidates: Array<string | undefined>): string | undefined {
  const list = candidates.filter((c): c is string => Boolean(c));
  const phone = list.find((c) => c.endsWith('@s.whatsapp.net'));
  return (phone ?? list[0])?.replace(/:\d+@/, '@'); // remove sufixo de dispositivo
}

export const evolution: WhatsAppProvider = {
  parseWebhook(body) {
    const payload = body as UpsertPayload;
    const event = (payload?.event ?? '').toLowerCase().replace(/_/g, '.');
    if (event !== 'messages.upsert') return null;

    // Defesa extra: se o servidor Evolution mandar eventos de outras instâncias
    // (webhook global ligado), o jogo ignora tudo que não for do seu número.
    const expected = evolutionConfig().instance;
    if (expected && payload.instance && payload.instance !== expected) return null;

    const key = payload.data?.key;
    if (!key?.id || key.fromMe) return null;
    if (!key.remoteJid?.endsWith('@g.us')) return null; // só grupos
    const text = textOf(payload.data?.message);
    const candidates = [key.participant, payload.data?.participant, key.participantAlt, key.participantPn, key.senderPn, payload.data?.participantPn, key.participantLid];
    const sender = pickSender(candidates);
    if (!text || !sender) return null;
    const message: IncomingMessage = {
      id: key.id,
      groupJid: key.remoteJid,
      senderJid: sender,
      keyParticipant: key.participant ?? payload.data?.participant,
      senderAliases: [...new Set(candidates.filter((c): c is string => Boolean(c)).map((c) => c.replace(/:\d+@/, '@')))],
      senderName: payload.data?.pushName?.trim() || 'Jogador',
      text,
    };
    return message;
  },

  async sendText(groupJid, text) {
    const { url, instance, headers } = evolutionConfig();
    await postJson(`${url}/message/sendText/${encodeURIComponent(instance)}`, headers, { number: groupJid, text });
  },

  async sendImage(groupJid, png, caption) {
    const { url, instance, headers } = evolutionConfig();
    await postJson(`${url}/message/sendMedia/${encodeURIComponent(instance)}`, headers, {
      number: groupJid,
      mediatype: 'image',
      mimetype: 'image/png',
      fileName: 'duelo-de-craques.png',
      caption: caption ?? '',
      media: png.toString('base64'),
    });
  },

  async sendReaction(groupJid, messageId, participant, emoji) {
    await evoReaction(groupJid, messageId, participant, emoji);
  },

  /**
   * Reinicia SÓ a instância do jogo (EVOLUTION_INSTANCE), com o token dela:
   * nenhuma outra instância do servidor é tocada. No máximo 1 vez a cada 15 min.
   */
  async recover() {
    const store = hasDatabase() ? getStore() : null;
    const last = (await store?.getImportState(RESTART_KEY).catch(() => null)) as { at?: number } | null;
    const now = Date.now();
    if ((last?.at && now - last.at < RESTART_EVERY_MS) || now - lastRestartHere < RESTART_EVERY_MS) return false;
    lastRestartHere = now;
    await store?.setImportState(RESTART_KEY, { at: now }).catch(() => undefined);
    const { url, instance, headers } = evolutionConfig();
    for (const method of ['POST', 'PUT']) {
      const response = await fetch(`${url}/instance/restart/${encodeURIComponent(instance)}`, {
        method,
        headers,
        signal: AbortSignal.timeout(15_000),
      }).catch((error: Error) => {
        console.warn(`reiniciar ${instance} (${method}) falhou: ${error.message}`);
        return null;
      });
      if (!response) continue;
      const detail = (await response.text().catch(() => '')).slice(0, 200);
      console.warn(`reiniciar ${instance}: ${method} ${response.status} ${detail}`);
      if (response.status !== 404 && response.status !== 405) return response.ok;
    }
    return false;
  },
};

const RESTART_KEY = 'evolution-restart';
const RESTART_EVERY_MS = 15 * 60_000;
let lastRestartHere = 0;

async function evoReaction(groupJid: string, messageId: string, participant: string, emoji: string) {
  const { url, instance, headers } = evolutionConfig();
  // Em grupo, a chave da reação precisa do autor da mensagem (participant), igual ao
  // que veio no webhook; sem ele, o WhatsApp mostra uma mensagem vazia no grupo.
  await postJson(`${url}/message/sendReaction/${encodeURIComponent(instance)}`, headers, {
    key: { remoteJid: groupJid, fromMe: false, id: messageId, participant },
    reaction: emoji,
  });
}

async function evo(method: 'GET' | 'POST', path: string, body?: unknown): Promise<unknown> {
  const { url, instance, headers } = evolutionConfig();
  const response = await fetch(`${url}/${path}/${encodeURIComponent(instance)}`, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Evolution ${path} ${response.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

/** Estado da conexão do número ("open", "connecting" ou "close"). */
export async function evolutionConnectionState(): Promise<string> {
  const data = (await evo('GET', 'instance/connectionState')) as { instance?: { state?: string } };
  return data?.instance?.state ?? 'desconhecido';
}

export async function evolutionWebhook(): Promise<{ url?: string; enabled?: boolean; events?: string[] } | null> {
  return (await evo('GET', 'webhook/find')) as { url?: string; enabled?: boolean; events?: string[] } | null;
}

/**
 * Aponta o webhook DA INSTÂNCIA configurada para o jogo e garante que ela
 * lê grupos. Mexe só nessa instância; as outras (ex.: bot pessoal) ficam intactas.
 */
export async function evolutionSetupInstance(webhookUrl: string): Promise<{ groupsIgnoreWasOn: boolean }> {
  await evo('POST', 'webhook/set', {
    webhook: { enabled: true, url: webhookUrl, byEvents: false, base64: false, events: ['MESSAGES_UPSERT'] },
  });
  const settings = (await evo('GET', 'settings/find')) as Record<string, unknown> | null;
  const groupsIgnoreWasOn = settings?.groupsIgnore === true;
  if (settings && groupsIgnoreWasOn) {
    const keep = (k: string, fallback: boolean) => (typeof settings[k] === 'boolean' ? settings[k] : fallback);
    await evo('POST', 'settings/set', {
      rejectCall: keep('rejectCall', false),
      msgCall: typeof settings.msgCall === 'string' ? settings.msgCall : '',
      groupsIgnore: false,
      alwaysOnline: keep('alwaysOnline', false),
      readMessages: keep('readMessages', false),
      readStatus: keep('readStatus', false),
      syncFullHistory: keep('syncFullHistory', false),
      ...(typeof settings.wavoipToken === 'string' ? { wavoipToken: settings.wavoipToken } : {}),
    });
  }
  return { groupsIgnoreWasOn };
}
