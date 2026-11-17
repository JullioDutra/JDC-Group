import { normalize } from '../game/text';

/** Partículas que não identificam ninguém ("da", "de", "van"...). */
const PARTICLES = new Set(['da', 'de', 'do', 'dos', 'das', 'e', 'van', 'von', 'der', 'den', 'di', 'del', 'la', 'le', 'du', 'y', 'jr', 'junior', 'filho', 'neto']);

/**
 * Chaves de busca de um jogador: nome completo, cada nome/sobrenome
 * relevante e "primeiro + último". "Rogério Ceni" acha por "ceni",
 * "rogerio" e "rogerio ceni"; "Victor Leandro Bagy" acha por "victor".
 */
export function nameKeys(names: string[]): string[] {
  const keys = new Set<string>();
  for (const raw of names) {
    const n = normalize(raw);
    if (!n) continue;
    keys.add(n);
    const tokens = n.split(' ').filter((t) => t.length >= 2 && !PARTICLES.has(t));
    if (tokens.length === 0) continue;
    keys.add(tokens.join(' '));
    for (const t of tokens) if (t.length >= 3 || tokens.length === 1) keys.add(t);
    if (tokens.length > 2) keys.add(`${tokens[0]} ${tokens[tokens.length - 1]}`);
  }
  return [...keys];
}

/** Palavras do que foi digitado (para achar por partes do nome completo). */
export function queryTokens(query: string): string[] {
  return normalize(query).split(' ').filter((t) => t.length >= 3 && !PARTICLES.has(t));
}

/** Chaves para procurar o que foi digitado. */
export function queryKeys(query: string): string[] {
  const n = normalize(query);
  if (!n) return [];
  const tokens = n.split(' ').filter((t) => !PARTICLES.has(t));
  return [...new Set([n, tokens.join(' ')].filter(Boolean))];
}
