import { timingSafeEqual } from 'node:crypto';

/** Comparação em tempo constante; segredo não configurado nunca autoriza. */
export function secretMatches(provided: string | null | undefined, expected: string | undefined): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
