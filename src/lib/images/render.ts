import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { ImageSpec } from '../game/types';
import { buildImage } from './templates';
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

/** Renderiza uma imagem do jogo em PNG. */
export async function renderImage(spec: ImageSpec): Promise<Buffer> {
  const response = new ImageResponse(buildImage(spec), { width: W, height: H, fonts: await loadFonts() });
  return Buffer.from(await response.arrayBuffer());
}
