/** Minúsculas, sem acento, sem pontuação, espaços colapsados. */
export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** `haystack` contém `needle` como sequência de palavras inteiras? */
export function containsPhrase(haystack: string, needle: string): boolean {
  return ` ${haystack} `.includes(` ${needle} `);
}

/**
 * Decide se uma mensagem parece um nome de jogador (e não conversa de grupo).
 * Evita gastar chamadas de IA com "kkkk", perguntas e frases longas.
 */
export function looksLikePlayerName(raw: string): boolean {
  const text = raw.trim();
  if (text.length < 2 || text.length > 40) return false;
  if (/[?!@#\n]|https?:/i.test(text)) return false;
  const norm = normalize(text);
  if (!norm || /^\d+$/.test(norm.replace(/ /g, ''))) return false; // só números: não é nome
  if (/\d{3,}/.test(norm)) return false; // "Messi 900 gols" não é um nome
  const words = norm.split(' ');
  if (words.length > 5) return false;
  if (/^(k+|ha+|rs+|a*ha(ha)+|ok|sim|nao|vai|bora|opa|oi|eita|vish|boa|top)$/.test(norm)) return false;
  return true;
}

export function formatNumber(n: number): string {
  return Number.isInteger(n)
    ? n.toLocaleString('pt-BR')
    : n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}
