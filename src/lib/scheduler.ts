import { Client, Receiver } from '@upstash/qstash';

/**
 * Prazos das rodadas do Modo em Grupo, via Upstash QStash: ao abrir uma
 * rodada, agendamos uma chamada a /api/tick para o segundo do prazo.
 * Sem QSTASH_TOKEN, o jogo segue funcionando: a rodada vencida fecha na
 * próxima mensagem do grupo (verificação preguiçosa).
 */
export function hasScheduler(): boolean {
  return Boolean(process.env.QSTASH_TOKEN);
}

/** Origem pública do app. Precisa ser a mesma na publicação e na verificação. */
export function publicOrigin(request: Request): string {
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.replace(/\/$/, '');
  const host = request.headers.get('x-forwarded-host') ?? new URL(request.url).host;
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function scheduleTick(origin: string, groupJid: string, token: string, delaySeconds: number): Promise<void> {
  if (!hasScheduler()) return;
  const client = new Client({ token: process.env.QSTASH_TOKEN! });
  await client.publishJSON({
    url: `${origin}/api/tick`,
    body: { groupJid, token },
    delay: Math.max(1, Math.round(delaySeconds)),
    retries: 2,
  });
}

export async function verifyTick(origin: string, signature: string | null, body: string): Promise<boolean> {
  if (!signature || !process.env.QSTASH_CURRENT_SIGNING_KEY || !process.env.QSTASH_NEXT_SIGNING_KEY) return false;
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
  });
  try {
    return await receiver.verify({ signature, body, url: `${origin}/api/tick` });
  } catch {
    return false;
  }
}
