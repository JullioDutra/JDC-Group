import type { Face } from '../../images/facePhoto';
import type { RostoUpload, Store } from '../../store/types';
import { ROSTOS_DATA } from './rostos-data';

/**
 * Rosto Borrado: fotos livres de craques EM JOGO (Wikimedia Commons; arquivos
 * marcados como "retrata" o jogador no Wikidata/Commons). Foto de pose ou de
 * card fica de fora: entrega demais. Os rostos de cada foto foram achados
 * antes, por um detector, e a foto foi conferida a olho (rodada 12). Só entra
 * licença livre (CC BY, CC BY-SA, CC0 ou domínio público) e o crédito vai na
 * legenda de cada imagem.
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
  /** Todos os rostos da foto: x, y, largura, altura (relativos, 0 a 1). Todos são borrados. */
  faces: Face[];
  /** Autor da foto e licença, como o Commons informa. */
  author: string;
  license: string;
  /** Foto enviada pelo admin pela página (fica no banco; id "up:..."). */
  upload?: boolean;
  /** Crédito que o admin escreveu (fotos enviadas). */
  credit?: string;
}

export const ROSTOS: RostoPhoto[] = ROSTOS_DATA.map(([id, name, aliases, url, faces, author, license]) => ({
  id,
  name,
  aliases,
  url,
  faces,
  author,
  license,
}));

export function getRosto(id: string): RostoPhoto | undefined {
  return ROSTOS.find((r) => r.id === id);
}

/** Foto enviada pelo admin: o id começa com "up:". */
export const isUploadId = (id: string) => id.startsWith('up:');

/**
 * Fotos do sorteio: as fixas (menos as que o admin escondeu, com os rostos
 * que ele remarcou) e as que ele enviou pela página. Banco fora do ar: só as fixas.
 */
export async function rostoPool(store: Pick<Store, 'listRostoPhotos'>): Promise<RostoPhoto[]> {
  let rows: RostoUpload[] = [];
  try {
    rows = await store.listRostoPhotos();
  } catch (error) {
    console.error('fotos do admin falharam', error);
  }
  const byId = new Map(rows.map((r) => [r.id, r]));
  const fixed = ROSTOS.filter((r) => !byId.get(r.id)?.hidden).map((r) => {
    const o = byId.get(r.id);
    return o ? { ...r, name: o.name || r.name, aliases: o.aliases.length ? o.aliases : r.aliases, faces: o.faces.length ? o.faces : r.faces } : r;
  });
  const uploads = rows.filter((r) => isUploadId(r.id) && !r.hidden && r.faces.length).map(fromUpload);
  return [...fixed, ...uploads];
}

export function fromUpload(r: RostoUpload): RostoPhoto {
  return { id: r.id, name: r.name, aliases: r.aliases, url: '', faces: r.faces, author: '', license: '', upload: true, credit: r.credit };
}

/** Crédito curto para a legenda: "Foto: Fulano · CC BY-SA 4.0 · Wikimedia Commons (rosto borrado pelo bot)". */
export function rostoCredit(r: RostoPhoto, edited = true): string {
  if (r.upload) return `Foto: ${r.credit?.trim() || 'acervo do admin'}${edited ? ' (rosto borrado pelo bot)' : ''}`;
  const author = r.author && !/^unknown|desconhecido/i.test(r.author) ? r.author : 'autor desconhecido';
  return `Foto: ${author} · ${r.license} · Wikimedia Commons${edited ? ' (rosto borrado pelo bot)' : ''}`;
}
