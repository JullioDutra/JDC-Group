import sharp from 'sharp';

/**
 * Rosto Borrado: recorta a foto em retrato em volta do rosto e borra SÓ o
 * rosto (uma elipse com a borda suave). O resto (cabelo, camisa, fundo)
 * fica nítido. Nível 0 = borrão forte, 1 = médio, 2 = leve, 3 = foto limpa.
 *
 * As coordenadas do rosto vêm prontas (detectadas antes, na preparação das
 * fotos) e são relativas (0 a 1): valem para qualquer tamanho da miniatura.
 */
export interface FaceBox {
  /** x, y, largura e altura do rosto, relativos à foto (0 a 1). */
  face: [number, number, number, number];
}

/** Quanto borrar em cada nível, em fração da largura do rosto. */
export const BLUR_LEVELS = [0.22, 0.12, 0.06] as const;
export const CLEAR_LEVEL = BLUR_LEVELS.length;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Recorte retrato (4:5) com o rosto no terço de cima. Tudo em pixels da foto original. */
export function portraitCrop(W: number, H: number, box: FaceBox): Rect {
  const [fx, fy, fw, fh] = box.face;
  const faceW = fw * W;
  const cx = (fx + fw / 2) * W;
  const cy = (fy + fh / 2) * H;
  let width = Math.min(W, faceW * 3.4);
  let height = width * 1.25;
  if (height > H) {
    height = H;
    width = height / 1.25;
  }
  const left = Math.min(Math.max(0, cx - width / 2), W - width);
  const top = Math.min(Math.max(0, cy - height * 0.36), H - height);
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) };
}

/** Foto pronta (JPEG) no tamanho pedido, com o rosto borrado no nível pedido. */
export async function blurredFace(src: Buffer, box: FaceBox, level: number, outW: number, outH: number): Promise<Buffer> {
  const meta = await sharp(src).metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  if (!W || !H) throw new Error('foto sem tamanho');
  const crop = portraitCrop(W, H, box);
  const base = await sharp(src).rotate().extract(crop).resize(outW, outH, { fit: 'cover' }).removeAlpha().toBuffer();
  if (level >= CLEAR_LEVEL) return sharp(base).jpeg({ quality: 86 }).toBuffer();

  // Rosto no recorte, em pixels da saída.
  const [fx, fy, fw, fh] = box.face;
  const sx = outW / crop.width;
  const sy = outH / crop.height;
  const faceW = fw * W * sx;
  const faceH = fh * H * sy;
  const cx = ((fx + fw / 2) * W - crop.left) * sx;
  const cy = ((fy + fh / 2) * H - crop.top) * sy - faceH * 0.08;
  const rx = faceW * 0.64;
  const ry = faceH * 0.82;
  const sigma = Math.max(4, BLUR_LEVELS[Math.max(0, Math.min(level, BLUR_LEVELS.length - 1))] * faceW);
  const feather = Math.max(4, faceW * 0.06);

  const blurred = await sharp(base).blur(sigma).toBuffer();
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${outW}" height="${outH}">` +
      `<defs><filter id="f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${feather.toFixed(1)}"/></filter></defs>` +
      `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#fff" filter="url(#f)"/></svg>`,
  );
  const faceOnly = await sharp(blurred).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  return sharp(base).composite([{ input: faceOnly }]).jpeg({ quality: 86 }).toBuffer();
}

// ---------- Baixar a foto (Wikimedia Commons) ----------

type Fetcher = (url: string) => Promise<Buffer>;

const UA = 'DueloDeCraquesBot/1.0 (jogo de quiz no WhatsApp)';
const cache = new Map<string, Buffer>();
const CACHE_MAX = 24;

/** Baixa a miniatura do Commons: 10 s de prazo, 1 nova tentativa, cache em memória por instância. */
const commonsFetcher: Fetcher = async (url) => {
  let last: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`Commons respondeu ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (error) {
      last = error;
    }
  }
  throw last;
};

let fetcher: Fetcher = commonsFetcher;

/** Para os testes: troca o download por uma foto local. */
export function setPhotoFetcher(fn: Fetcher | null): void {
  fetcher = fn ?? commonsFetcher;
  cache.clear();
}

export async function loadPhoto(url: string): Promise<Buffer> {
  const hit = cache.get(url);
  if (hit) return hit;
  const buf = await fetcher(url);
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(url, buf);
  return buf;
}
