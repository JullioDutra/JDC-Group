/**
 * As fontes das imagens (Anton e Barlow, em assets/fonts) só desenham o
 * alfabeto latino básico, o Latin-1 (á, ç, õ, ø, ß...) e algumas pontuações.
 * Letra fora disso (Modrić, Čech, Szczęsny) ou emoji no nome do WhatsApp faz
 * o gerador baixar uma fonte ou o emoji da internet na hora da imagem: ela
 * demora, sai com a letra numa fonte diferente e, se o download falhar (emoji),
 * nem sai. Aqui todo texto da imagem passa por um filtro: a letra vira a
 * versão sem o acento que falta (ć → c, ł → l) e o resto (emoji, símbolos,
 * outros alfabetos) sai.
 */

/** Caracteres que as três fontes têm (conferido com fontTools nos .woff). */
const COVERED: Array<[number, number]> = [
  [0x0a, 0x0a],
  [0x20, 0x7e],
  [0xa0, 0xff],
  [0x131, 0x131],
  [0x152, 0x153],
  [0x2013, 0x2014],
  [0x2018, 0x201a],
  [0x201c, 0x201e],
  [0x2022, 0x2022],
  [0x2026, 0x2026],
  [0x2032, 0x2033],
  [0x2039, 0x203a],
  [0x20ac, 0x20ac],
  [0x2122, 0x2122],
  [0x2212, 0x2212],
];

/** Letras sem decomposição (o NFD não separa o "acento"). */
const MAP: Record<string, string> = {
  'ł': 'l', 'Ł': 'L', 'đ': 'd', 'Đ': 'D', 'ħ': 'h', 'Ħ': 'H', 'ŧ': 't', 'Ŧ': 'T',
  'ŀ': 'l', 'Ŀ': 'L', 'ſ': 's', 'ƒ': 'f', 'ə': 'e', 'Ə': 'E', 'ŋ': 'n', 'Ŋ': 'N',
  'ǆ': 'dz', 'ǅ': 'Dz', 'Ǆ': 'DZ', 'ǉ': 'lj', 'ǈ': 'Lj', 'Ǉ': 'LJ', 'ǌ': 'nj', 'ǋ': 'Nj', 'Ǌ': 'NJ',
  '→': '>', '←': '<',
};

const isCovered = (cp: number) => COVERED.some(([a, b]) => cp >= a && cp <= b);

/** Só ASCII imprimível e Latin-1: o caso comum, sem trabalho nenhum. */
const SIMPLE = /^[\x20-\x7e\xa0-\xff]*$/;

/** Troca ou tira o que as fontes não desenham. Nome só de emoji vira "?". */
export function glyphSafe(text: string): string {
  if (SIMPLE.test(text)) return text;
  let out = '';
  let changed = false;
  for (const ch of text.normalize('NFC')) {
    const cp = ch.codePointAt(0)!;
    if (isCovered(cp)) {
      out += ch;
      continue;
    }
    changed = true;
    const base = ch.normalize('NFD').replace(/\p{M}/gu, '');
    if (base && base !== ch && [...base].every((c) => isCovered(c.codePointAt(0)!))) out += base;
    else if (MAP[ch]) out += MAP[ch];
    // Emoji, seletores de variação, ZWJ, outros alfabetos: saem.
  }
  if (!changed) return out;
  const tidy = out.replace(/\s{2,}/g, ' ').trim();
  return tidy || (text.trim() ? '?' : text);
}

/** Com o filtro e cortado no tamanho (… no fim): nomes dentro de textos compostos. */
export function safeName(name: string, max = 18): string {
  const s = glyphSafe(name);
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

/** Primeiro nome já sem emoji ("🔥 Júllio Dutra" → "Júllio"). */
export function safeFirstName(name: string, max = 14): string {
  const clean = glyphSafe(name);
  return safeName(clean.trim().split(/\s+/)[0] || clean, max);
}
