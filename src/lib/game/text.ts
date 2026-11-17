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

const CHAT_EXACT = new Set(
  (
    'ok okay sim nao ss sss nn oi ola opa eae eai e ai salve bom dia boa tarde boa noite valeu vlw obrigado obrigada tmj blz beleza ' +
    'top show massa legal boa bora vamo vamos vai eita vish oxe oxi uai ue aff affs pqp slk mds nossa caraca caramba mano cara ' +
    'gente pessoal serio ne neh ue pera calma espera ja foi foi errei acertei facil dificil sei la nem sei nao sei ' +
    'quem e que isso o que como assim kkk rs rsrs haha hahaha hehe lol'
  ).split(' '),
);
const CHAT_PHRASES = ['bom dia', 'boa tarde', 'boa noite', 'sei la', 'nem sei', 'nao sei', 'e ai', 'ja foi', 'o que', 'como assim', 'que isso', 'quem e'];
const CHAT_PREFIX = /^(kk|rs|ha(ha)+|he(he)+|eu acho|acho que|sera que|sei la|nao sei|mano |cara |gente |pessoal |nossa |caraca |slk |pqp |mds |ow |oh |ai |aff |vish |eita |q |pq |porque |por que |quem |qual |como |kd |cade )/;

/**
 * Conversa, e não palpite: risadas, interjeições, cumprimentos, emoji/figurinha,
 * links, menções e frases longas. Mensagens assim não gastam a tentativa de ninguém.
 */
export function isChatter(raw: string): boolean {
  const text = raw.trim();
  if (!text) return true;
  if (!/[\p{L}\p{N}]/u.test(text)) return true; // só emoji, figurinha ou pontuação
  if (/https?:|www\.|@\d/i.test(text)) return true;
  const norm = normalize(text);
  if (!norm) return true;
  if (CHAT_EXACT.has(norm) || CHAT_PHRASES.includes(norm)) return true;
  if (/^(k|a?ha|he|rs|ks|kj)+$/.test(norm.replace(/ /g, ''))) return true; // kkkk, hahaha, rsrs, kjkj
  if (CHAT_PREFIX.test(`${norm} `)) return true;
  if (norm.split(' ').length > 6) return true;
  return false;
}

/**
 * Decide se uma mensagem parece um nome de jogador (e não conversa de grupo).
 * Evita gastar chamadas de IA com "kkkk", perguntas e frases longas.
 */
export function looksLikePlayerName(raw: string): boolean {
  const text = raw.trim();
  if (text.length < 2 || text.length > 40) return false;
  if (/[?!@#\n]|https?:/i.test(text)) return false;
  if (isChatter(text)) return false;
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
