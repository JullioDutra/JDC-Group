import sharp from 'sharp';

/**
 * Rosto Borrado: foto de jogo (o craque em campo) com TODOS os rostos
 * borrados (cada um numa elipse de borda suave). O resto (camisa, corpo,
 * lance, estádio) fica nítido. Nível 0 = borrão forte, 1 = médio, 2 = leve,
 * 3 = foto limpa (revelação).
 *
 * Os rostos vêm prontos (detectados antes, na preparação das fotos) em
 * coordenadas relativas (0 a 1): valem para qualquer tamanho da miniatura.
 */
export type Face = [x: number, y: number, w: number, h: number];

/** Quanto borrar em cada nível, em fração da largura do rosto, e o mínimo em pixels (rosto pequeno some de vez). */
export const BLUR_LEVELS = [
  { k: 0.3, min: 9 },
  { k: 0.16, min: 6 },
  { k: 0.08, min: 3.5 },
] as const;
export const CLEAR_LEVEL = BLUR_LEVELS.length;

export interface PreparedPhoto {
  jpg: Buffer;
  width: number;
  height: number;
}

/** Elipse de cada rosto (um pouco maior que a caixa do detector: testa e queixo entram). */
function ellipse(face: Face, W: number, H: number) {
  const [x, y, w, h] = face;
  const fw = w * W;
  const fh = h * H;
  return { cx: (x + w / 2) * W, cy: (y + h / 2) * H - fh * 0.05, rx: fw * 0.62, ry: fh * 0.72, fw };
}

/**
 * Foto pronta (JPEG), cabendo em maxW x maxH sem cortar, com os rostos
 * borrados no nível pedido.
 */
export async function blurredFaces(src: Buffer, faces: Face[], level: number, maxW: number, maxH: number): Promise<PreparedPhoto> {
  const base = await sharp(src).rotate().resize(maxW, maxH, { fit: 'inside' }).removeAlpha().toBuffer({ resolveWithObject: true });
  const W = base.info.width;
  const H = base.info.height;
  if (level >= CLEAR_LEVEL || !faces.length) {
    return { jpg: await sharp(base.data).jpeg({ quality: 86 }).toBuffer(), width: W, height: H };
  }
  const { k, min } = BLUR_LEVELS[Math.max(0, Math.min(level, BLUR_LEVELS.length - 1))];
  const shapes = faces.map((f) => ellipse(f, W, H));
  // Um borrão por tamanho de rosto: o maior manda (os rostos de uma foto costumam ter tamanho parecido).
  const sigma = Math.max(min, k * Math.max(...shapes.map((s) => s.fw)));
  const feather = Math.max(3, Math.min(...shapes.map((s) => s.fw)) * 0.08);
  const blurred = await sharp(base.data).blur(sigma).toBuffer();
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
      `<defs><filter id="f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${feather.toFixed(1)}"/></filter></defs>` +
      shapes.map((s) => `<ellipse cx="${s.cx.toFixed(1)}" cy="${s.cy.toFixed(1)}" rx="${s.rx.toFixed(1)}" ry="${s.ry.toFixed(1)}" fill="#fff" filter="url(#f)"/>`).join('') +
      `</svg>`,
  );
  const facesOnly = await sharp(blurred).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const jpg = await sharp(base.data).composite([{ input: facesOnly }]).jpeg({ quality: 86 }).toBuffer();
  return { jpg, width: W, height: H };
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
