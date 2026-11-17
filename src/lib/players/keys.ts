import { normalize } from '../game/text';

/** Partículas que não identificam ninguém ("da", "de", "van", "Júnior"...). */
const PARTICLES = new Set(['da', 'de', 'do', 'dos', 'das', 'e', 'van', 'von', 'der', 'den', 'di', 'del', 'la', 'le', 'du', 'y', 'jr', 'junior', 'filho', 'neto', 'sobrinho']);

/**
 * Palavras que identificam a pessoa, sem acento, maiúsculas e partículas.
 * Se o nome for só partícula ("Júnior", "Neto"), mantém a palavra.
 */
export function nameTokens(name: string): string[] {
  const all = normalize(name.replace(/\([^)]*\)/g, ' ')).split(' ').filter(Boolean);
  const kept = all.filter((t) => !PARTICLES.has(t));
  return kept.length ? kept : all;
}

/**
 * Regra do jogo para nomes: vale o nome pelo qual o jogador é conhecido
 * (Ronaldinho, Hulk), o nome completo, ou uma parte coerente dele, na ordem:
 * sobrenome ("Sule" → Niklas Süle), nome + sobrenome ("Ronaldo Nazário").
 * NÃO vale: erro de digitação, apelido informal (R9, Fenômeno, CR7) nem só
 * o primeiro nome de quem é conhecido por nome e sobrenome ("Niklas").
 *
 * Devolve como o digitado bate com o nome: 'exato', 'partes' ou 'sobrenome'.
 */
export function coherentWith(query: string, name: string): 'exato' | 'partes' | 'sobrenome' | null {
  const q = nameTokens(query);
  const t = nameTokens(name);
  if (q.length === 0 || t.length === 0) return null;
  if (q.join(' ') === t.join(' ')) return 'exato';
  let i = 0;
  for (const tok of t) if (i < q.length && tok === q[i]) i++;
  if (i < q.length) return null; // alguma palavra não está no nome (ou fora de ordem)
  if (q.length >= 2) return 'partes';
  return q[0] !== t[0] ? 'sobrenome' : null; // uma palavra só: precisa ser sobrenome
}

/** Pontos do melhor jeito em que o digitado bate com algum dos nomes aceitos (0 = não vale). */
export function coherenceScore(query: string, names: string[]): number {
  let best = 0;
  names.forEach((name, i) => {
    const how = coherentWith(query, name);
    const score = how === 'exato' ? (i === 0 ? 1000 : 900) : how === 'partes' ? 700 : how === 'sobrenome' ? 400 : 0;
    best = Math.max(best, score);
  });
  return best;
}

/**
 * Chaves de busca no banco: nome inteiro, cada palavra e "primeiro + último".
 * A busca só traz candidatos; quem decide se o nome vale é coherentWith.
 */
export function nameKeys(names: string[]): string[] {
  const keys = new Set<string>();
  for (const raw of names) {
    const n = normalize(raw.replace(/\([^)]*\)/g, ' '));
    if (!n) continue;
    keys.add(n);
    const tokens = nameTokens(raw);
    keys.add(tokens.join(' '));
    for (const t of tokens) keys.add(t);
    if (tokens.length > 2) keys.add(`${tokens[0]} ${tokens[tokens.length - 1]}`);
  }
  return [...keys];
}

/** Palavras do que foi digitado (para achar por partes do nome completo). */
export function queryTokens(query: string): string[] {
  return nameTokens(query);
}

/** Chaves para procurar o que foi digitado. */
export function queryKeys(query: string): string[] {
  const n = normalize(query);
  if (!n) return [];
  return [...new Set([n, nameTokens(query).join(' ')].filter(Boolean))];
}
