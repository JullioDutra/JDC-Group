import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import type { Face } from '../images/facePhoto';
import type { RostoUpload, Store } from '../store/types';
import { ROSTOS, isUploadId } from './content/rostos';

/**
 * Fotos do Rosto Borrado pela página do admin: enviar (com os rostos
 * marcados à mão), esconder, mostrar de novo, remarcar os rostos e excluir.
 * As fotos fixas (do Commons, no código) não são apagadas: ficam escondidas.
 */

/** Foto maior que isso (depois de decodificar) é recusada. */
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
/** A foto guardada cabe em 1280 x 1280 (o cartão usa até 968 x 900). */
export const STORED_MAX = 1280;
export const MAX_FACES = 30;

/** Rostos marcados na página: até 30 caixas, de 0 a 1, com tamanho mínimo. */
export function parseFaces(input: unknown): Face[] | null {
  if (!Array.isArray(input) || input.length > MAX_FACES) return null;
  const out: Face[] = [];
  for (const f of input) {
    if (!Array.isArray(f) || f.length !== 4 || !f.every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    const x = clamp(f[0]);
    const y = clamp(f[1]);
    const w = Math.min(clamp(f[2]), 1 - x);
    const h = Math.min(clamp(f[3]), 1 - y);
    if (w < 0.005 || h < 0.005) return null;
    out.push([round(x), round(y), round(w), round(h)]);
  }
  return out;
}

const round = (n: number) => Math.round(n * 10_000) / 10_000;

export function cleanName(raw: unknown): string | null {
  const name = typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim() : '';
  return name.length >= 2 && name.length <= 40 ? name : null;
}

/** "cr7, cristiano" ou ["cr7", "cristiano"] → até 10 apelidos. */
export function cleanAliases(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(/[,;\n]/) : [];
  const out: string[] = [];
  for (const a of list) {
    const t = typeof a === 'string' ? a.replace(/\s+/g, ' ').trim() : '';
    if (t.length >= 2 && t.length <= 40 && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
  }
  return out.slice(0, 10);
}

export function cleanCredit(raw: unknown): string {
  return typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim().slice(0, 80) : '';
}

/**
 * Foto enviada (base64, com ou sem "data:image/...;base64,") → JPEG guardado:
 * gira pela orientação da câmera, cabe em 1280 x 1280 e sai sem os metadados
 * da câmera (localização, aparelho).
 */
export async function prepareUpload(base64: unknown): Promise<Buffer> {
  if (typeof base64 !== 'string' || !base64) throw new Error('mande a foto');
  const data = Buffer.from(base64.replace(/^data:image\/[a-z+.-]+;base64,/i, ''), 'base64');
  if (!data.length) throw new Error('foto vazia');
  if (data.length > MAX_UPLOAD_BYTES) throw new Error('foto grande demais (máximo 6 MB)');
  const meta = await sharp(data).metadata().catch(() => null);
  if (!meta?.width || !meta.height) throw new Error('não consegui abrir a foto (use JPG, PNG ou WebP)');
  if (meta.width < 200 || meta.height < 200) throw new Error('foto pequena demais (mínimo 200 x 200)');
  return sharp(data).rotate().resize(STORED_MAX, STORED_MAX, { fit: 'inside', withoutEnlargement: true }).removeAlpha().jpeg({ quality: 85 }).toBuffer();
}

export interface AdminRosto {
  id: string;
  name: string;
  aliases: string[];
  faces: Face[];
  credit: string;
  hidden: boolean;
  /** Fixa (do código, foto do Commons) ou enviada pelo admin. */
  fixed: boolean;
  /** Miniatura pública (fixas); as enviadas a página busca com a chave. */
  url?: string;
  createdAt?: string;
}

/** Todas as fotos, para a página: enviadas (mais novas primeiro) e depois as fixas. */
export async function listAdminRostos(store: Store): Promise<AdminRosto[]> {
  const rows = await store.listRostoPhotos();
  const byId = new Map(rows.map((r) => [r.id, r]));
  const uploads = rows
    .filter((r) => isUploadId(r.id))
    .map((r): AdminRosto => ({ id: r.id, name: r.name, aliases: r.aliases, faces: r.faces, credit: r.credit, hidden: r.hidden, fixed: false, createdAt: r.createdAt }));
  const fixed = ROSTOS.map((r): AdminRosto => {
    const o = byId.get(r.id);
    return {
      id: r.id,
      name: o?.name || r.name,
      aliases: o?.aliases.length ? o.aliases : r.aliases,
      faces: o?.faces.length ? o.faces : r.faces,
      credit: `${r.author} · ${r.license} · Wikimedia Commons`,
      hidden: o?.hidden ?? false,
      fixed: true,
      url: r.url,
    };
  });
  return [...uploads, ...fixed];
}

const today = () => new Date().toISOString().slice(0, 10);

export async function addRosto(store: Store, input: { name: unknown; aliases?: unknown; credit?: unknown; faces: unknown; image: unknown }): Promise<RostoUpload> {
  const name = cleanName(input.name);
  if (!name) throw new Error('nome do jogador: de 2 a 40 letras');
  const faces = parseFaces(input.faces);
  if (!faces?.length) throw new Error('marque pelo menos um rosto na foto');
  const jpg = await prepareUpload(input.image);
  const photo: RostoUpload = {
    id: `up:${randomUUID().replace(/-/g, '').slice(0, 12)}`,
    name,
    aliases: cleanAliases(input.aliases),
    faces,
    credit: cleanCredit(input.credit),
    hidden: false,
    createdAt: today(),
  };
  await store.saveRostoPhoto(photo, jpg);
  return photo;
}

/** Edita nome, apelidos, crédito ou rostos. Foto fixa: grava só o ajuste (a foto continua a do Commons). */
export async function updateRosto(
  store: Store,
  id: string,
  patch: { name?: unknown; aliases?: unknown; credit?: unknown; faces?: unknown; hidden?: unknown },
): Promise<AdminRosto> {
  const current = (await listAdminRostos(store)).find((r) => r.id === id);
  if (!current) throw new Error('foto não encontrada');
  const name = patch.name === undefined ? current.name : cleanName(patch.name);
  if (!name) throw new Error('nome do jogador: de 2 a 40 letras');
  const faces = patch.faces === undefined ? current.faces : parseFaces(patch.faces);
  if (!faces?.length) throw new Error('marque pelo menos um rosto na foto');
  const row: RostoUpload = {
    id,
    name,
    aliases: patch.aliases === undefined ? current.aliases : cleanAliases(patch.aliases),
    faces,
    // A foto fixa guarda o crédito do Commons no código; o ajuste não troca.
    credit: current.fixed ? '' : patch.credit === undefined ? current.credit : cleanCredit(patch.credit),
    hidden: patch.hidden === undefined ? current.hidden : patch.hidden === true,
    createdAt: current.createdAt ?? today(),
  };
  await store.saveRostoPhoto(row, null);
  return { ...current, ...row, credit: current.fixed ? current.credit : row.credit };
}

/** Exclui a enviada; a fixa só fica escondida (está no código). */
export async function deleteRosto(store: Store, id: string): Promise<string> {
  if (isUploadId(id)) {
    await store.deleteRostoPhoto(id);
    return 'Foto excluída.';
  }
  await updateRosto(store, id, { hidden: true });
  return 'Foto fixa escondida (ela está no código; dá para mostrar de novo).';
}
