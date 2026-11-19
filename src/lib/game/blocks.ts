import type { Store } from '../store/types';
import type { IncomingMessage } from './types';

/**
 * Bloqueio do "próxima": o admin tira de algumas pessoas o poder de pular a
 * pausa ou a rodada. Fica no histórico do grupo (group_seen), um item por
 * pessoa: só os dígitos do id (número ou @lid), que é o que bate entre as
 * formas como o WhatsApp manda o mesmo remetente.
 */
export const NEXT_BLOCK_KIND = 'admin:sem-proxima';

export const digitsOf = (jid: string) => jid.split('@')[0].split(':')[0].replace(/\D/g, '');

/** Quem o admin apontou: marcados com @, autor da mensagem respondida e números digitados (8+ dígitos). */
export function targetsOf(msg: IncomingMessage): string[] {
  const typed = msg.text.match(/\d[\d\s-]{7,}\d/g)?.map((n) => n.replace(/\D/g, '')) ?? [];
  const all = [...(msg.mentions ?? []), ...(msg.quotedParticipant ? [msg.quotedParticipant] : [])].map(digitsOf).concat(typed);
  return [...new Set(all.filter((d) => d.length >= 8))];
}

/** O remetente está bloqueado para o "próxima"? */
export async function isNextBlocked(store: Store, msg: IncomingMessage): Promise<boolean> {
  const blocked = await store.getSeen(msg.groupJid, NEXT_BLOCK_KIND).catch(() => [] as string[]);
  if (!blocked.length) return false;
  const ids = [msg.senderJid, ...(msg.senderAliases ?? [])].map(digitsOf);
  return ids.some((id) => blocked.includes(id));
}

/** Nome de quem já jogou (pelo ranking), ou o número. */
export async function blockedNames(store: Store, groupJid: string, digits: string[]): Promise<string[]> {
  const rows = await store.getRanking(groupJid, 1000).catch(() => []);
  return digits.map((d) => rows.find((r) => digitsOf(r.jid) === d)?.name ?? `@${d}`);
}
