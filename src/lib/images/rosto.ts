import { createElement, type ReactElement } from 'react';
import type { ImageSpec } from '../game/types';
import { getRosto, rostoCredit } from '../party/content/rostos';
import { C, DISPLAY, box, brand, fit, pill, stage, txt } from './theme';

/** Espaço da foto no cartão: a foto (retrato ou paisagem) cabe aqui sem cortar. */
export const PHOTO_MAX_W = 968;
export const PHOTO_MAX_H = 900;

const STAGES = [
  { label: 'BORRÃO FORTE', points: 100 },
  { label: 'BORRÃO MÉDIO', points: 70 },
  { label: 'BORRÃO LEVE', points: 40 },
];

const upper = (s: string) => s.toLocaleUpperCase('pt-BR');

/** Cartão do Rosto Borrado: a foto (já borrada) no meio, etapa e crédito. */
export function faceQuiz(spec: Extract<ImageSpec, { kind: 'faceQuiz' }>): ReactElement {
  const photo = getRosto(spec.photoId);
  const reveal = spec.level >= STAGES.length;
  const stageInfo = STAGES[Math.min(spec.level, STAGES.length - 1)];
  const frame = spec.photo
    ? createElement('img', { src: spec.photo, width: spec.photoW ?? PHOTO_MAX_W, height: spec.photoH ?? PHOTO_MAX_H, style: { borderRadius: 24 } })
    : box(
        { width: 736, height: 900, borderRadius: 24, backgroundColor: C.panel, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 },
        txt('A FOTO NÃO CARREGOU', { fontFamily: DISPLAY, fontSize: 56, color: C.muted }),
        txt('O anfitrião pode mandar PULAR.', { fontSize: 30, color: C.muted }),
      );
  return stage(
    box(
      { justifyContent: 'space-between', alignItems: 'center' },
      brand(0.8),
      box({ gap: 12 }, pill('ROSTO BORRADO', C.lime, C.ink, 24), pill(`FOTO ${spec.round}/${spec.total}`, C.panel, C.white, 24)),
    ),
    box(
      { marginTop: 18, height: PHOTO_MAX_H + 12, justifyContent: 'center', alignItems: 'center' },
      box({ padding: 6, borderRadius: 30, backgroundColor: reveal ? C.lime : C.panelLine }, frame),
    ),
    box(
      { marginTop: 14, justifyContent: 'center', alignItems: 'center', gap: 18 },
      reveal
        ? txt(upper(fit(spec.answer ?? photo?.name ?? '', 22)), { fontFamily: DISPLAY, fontSize: 64, color: C.lime, lineHeight: 1.05 })
        : box(
            { alignItems: 'center', gap: 18 },
            txt(stageInfo.label, { fontFamily: DISPLAY, fontSize: 52, lineHeight: 1.05 }),
            pill(`VALE ${stageInfo.points}`, C.lime, C.ink, 30),
          ),
    ),
    box(
      { marginTop: 'auto', justifyContent: 'center' },
      txt(fit(spec.credit ?? (photo ? rostoCredit(photo, !reveal) : 'Foto: Wikimedia Commons'), 96), { fontSize: 18, color: C.muted }),
    ),
  );
}
