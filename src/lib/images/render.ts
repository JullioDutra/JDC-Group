import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { ImageResponse } from 'next/og';
import type { ImageSpec } from '../game/types';
import { glyphSafe } from './glyphs';
import { buildImage } from './templates';
import sharp from 'sharp';
import { blurredFaces, loadPhoto } from './facePhoto';
import { PHOTO_MAX_H, PHOTO_MAX_W } from './rosto';
import { getRosto } from '../party/content/rostos';
import { BODY, DISPLAY, H, W } from './theme';

type Font = { name: string; data: Buffer; weight: 400 | 500 | 700; style: 'normal' };

let fontsPromise: Promise<Font[]> | undefined;

/** Fontes carregadas uma vez por instância (ficam em memória entre chamadas). */
function loadFonts(): Promise<Font[]> {
  fontsPromise ??= (async () => {
    const dir = path.join(process.cwd(), 'assets', 'fonts');
    const [anton, barlow500, barlow700] = await Promise.all([
      readFile(path.join(dir, 'anton.woff')),
      readFile(path.join(dir, 'barlow-500.woff')),
      readFile(path.join(dir, 'barlow-700.woff')),
    ]);
    return [
      { name: DISPLAY, data: anton, weight: 400, style: 'normal' },
      { name: BODY, data: barlow500, weight: 500, style: 'normal' },
      { name: BODY, data: barlow700, weight: 700, style: 'normal' },
    ];
  })();
  return fontsPromise;
}

/** O filtro de glifos em todo texto dos dados da imagem (nomes de jogadores, palpites...). */
export function glyphSafeSpec<T>(value: T): T {
  if (typeof value === 'string') return glyphSafe(value) as T;
  if (Array.isArray(value)) return value.map(glyphSafeSpec) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, glyphSafeSpec(v)])) as T;
  }
  return value;
}

/** E de novo na árvore pronta: pega o texto montado no próprio template. */
export function glyphSafeTree(node: ReactNode): ReactNode {
  if (typeof node === 'string') return glyphSafe(node);
  if (Array.isArray(node)) return node.map(glyphSafeTree);
  if (isValidElement(node)) {
    const children = (node.props as { children?: ReactNode }).children;
    if (children === undefined || children === null) return node;
    const next = Array.isArray(children) ? children.map(glyphSafeTree) : [glyphSafeTree(children)];
    return cloneElement(node, undefined, ...next);
  }
  return node;
}

/**
 * Renderiza uma imagem do jogo em PNG. Todo texto passa pelo filtro de glifos:
 * nada de baixar fonte ou emoji da internet na hora (ver glyphs.ts).
 */
export async function renderImage(spec: ImageSpec): Promise<Buffer> {
  let safe = glyphSafeSpec(spec);
  // Rosto Borrado: a foto entra pronta (borrada) depois do filtro de glifos.
  if (safe.kind === 'faceQuiz') safe = { ...safe, ...(await facePhoto(safe.photoId, safe.level)) };
  const element = glyphSafeTree(buildImage(safe)) as ReactElement;
  const response = new ImageResponse(element, { width: W, height: H, fonts: await loadFonts() });
  const png = Buffer.from(await response.arrayBuffer());
  // Foto vai em JPEG: o PNG de uma foto fica pesado demais para o WhatsApp.
  return safe.kind === 'faceQuiz' ? sharp(png).jpeg({ quality: 84 }).toBuffer() : png;
}

/** Foto do Rosto Borrado (data URI e tamanho), ou nada se não der para baixar (o cartão avisa). */
async function facePhoto(photoId: string, level: number): Promise<{ photo?: string; photoW?: number; photoH?: number }> {
  const photo = getRosto(photoId);
  if (!photo) return {};
  try {
    const ready = await blurredFaces(await loadPhoto(photo.url), photo.faces, level, PHOTO_MAX_W, PHOTO_MAX_H);
    return { photo: `data:image/jpeg;base64,${ready.jpg.toString('base64')}`, photoW: ready.width, photoH: ready.height };
  } catch (error) {
    console.error('foto do rosto borrado falhou', photoId, error);
    return {};
  }
}
