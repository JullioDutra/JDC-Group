import { ROSTOS_DATA } from './rostos-data';

/**
 * Rosto Borrado: fotos livres de craques (Wikimedia Commons, via Wikidata).
 * O rosto de cada foto foi achado antes, por um detector, e conferido a olho
 * (rodada 12). Só entra foto com licença livre (CC BY, CC BY-SA, CC0 ou
 * domínio público) e o crédito vai na legenda de cada imagem.
 */
export interface RostoPhoto {
  /** Id no Wikidata ("Q615"). */
  id: string;
  /** Nome pelo qual o grupo conhece o jogador (a resposta). */
  name: string;
  /** Outros nomes aceitos (nome completo, apelido). */
  aliases: string[];
  /** Miniatura no Commons (960 px de largura). */
  url: string;
  /** Rosto na foto: x, y, largura, altura (relativos, 0 a 1). */
  face: [number, number, number, number];
  /** Autor da foto e licença, como o Commons informa. */
  author: string;
  license: string;
}

export const ROSTOS: RostoPhoto[] = ROSTOS_DATA.map(([id, name, aliases, url, face, author, license]) => ({
  id,
  name,
  aliases,
  url,
  face,
  author,
  license,
}));

export function getRosto(id: string): RostoPhoto | undefined {
  return ROSTOS.find((r) => r.id === id);
}

/** Crédito curto para a legenda: "Foto: Fulano · CC BY-SA 4.0 · Wikimedia Commons (rosto borrado pelo bot)". */
export function rostoCredit(r: RostoPhoto, edited = true): string {
  const author = r.author && !/^unknown|desconhecido/i.test(r.author) ? r.author : 'autor desconhecido';
  return `Foto: ${author} · ${r.license} · Wikimedia Commons${edited ? ' (rosto borrado pelo bot)' : ''}`;
}
