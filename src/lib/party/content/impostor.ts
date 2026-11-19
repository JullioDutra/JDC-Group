import type { ContentCategory } from '../../game/types';
import { normalize } from '../../game/text';
import { ANAGRAM_THEMES } from './anagramas';

/**
 * Segredos do Impostor do Futebol: os nomes conhecidos dos temas de futebol
 * do Anagrama (mesmo critério: se alguém do grupo não reconheceria, não
 * entra). Cada segredo sabe as palavras que entregariam o nome (proibidas
 * na dica) e os apelidos aceitos no palpite final do impostor.
 */
export interface ImpostorSecret {
  id: string;
  theme: string;
  category: ContentCategory;
  name: string;
  aliases: string[];
  /** Pedaços do nome e dos apelidos (normalizados, 3+ letras): não valem como dica. */
  forbidden: string[];
}

/** Temas do Impostor (os de futebol do Anagrama) e como o grupo pede cada um. */
export const IMPOSTOR_THEMES = ANAGRAM_THEMES.filter((t) => t.category === 'futebol' && t.theme !== 'coisa do futebol');

const slug = (x: string) => normalize(x).replace(/\s+/g, '-');

export const IMPOSTOR_SECRETS: ImpostorSecret[] = IMPOSTOR_THEMES.flatMap((t) =>
  t.list.split(',').map((raw) => {
    const [name, ...aliases] = raw.split('|').map((x) => x.trim());
    const forms = [name, ...aliases].map(normalize);
    const forbidden = [...new Set(forms.flatMap((f) => [f.replace(/\s+/g, ''), ...f.split(' ')]).filter((w) => w.length >= 3))];
    return { id: `imp-${slug(t.theme)}-${slug(name)}`, theme: t.theme, category: t.category, name, aliases, forbidden };
  }),
);

export function getImpostorSecret(id: string): ImpostorSecret | undefined {
  return IMPOSTOR_SECRETS.find((s) => s.id === id);
}

/** Tema pedido no comando ("clubes", "craques do mundo"), ou undefined. */
export function findImpostorTheme(raw: string): string | undefined {
  const key = normalize(raw);
  return IMPOSTOR_THEMES.find((t) => t.keys.includes(key) || normalize(t.theme) === key)?.theme;
}
