import { createElement, type CSSProperties, type ReactElement, type ReactNode } from 'react';

/**
 * Identidade visual das imagens do jogo.
 * As imagens são montadas com createElement (sem JSX) e renderizadas pelo
 * Satori (next/og). Regras do Satori: todo <div> com mais de um filho precisa
 * de display:flex, e emojis são evitados (exigiriam baixar fontes em runtime).
 */
export const W = 1080;
export const H = 1350;

export const C = {
  night: '#06130C',
  panel: '#0C2016',
  panelLine: '#1C3A29',
  grassA: '#128A45',
  grassB: '#0F7A3C',
  line: 'rgba(255,255,255,0.62)',
  lime: '#C8FF3E',
  white: '#F4F8F1',
  muted: '#93AD9C',
  host: '#38BDF8',
  guest: '#FF8A3D',
  ink: '#06130C',
};

export const SIDE_COLOR = [C.host, C.guest] as const;

export const DISPLAY = 'Anton';
export const BODY = 'Barlow';

type Style = CSSProperties;

/** div com display:flex por padrão. */
export function box(style: Style, ...children: ReactNode[]): ReactElement {
  return createElement('div', { style: { display: 'flex', ...style } }, ...children);
}

export function txt(content: string | number, style: Style = {}): ReactElement {
  return createElement('div', { style: { display: 'flex', ...style } }, String(content));
}

/** Corta nomes longos para caber nas fichas. */
export function fit(name: string, max: number): string {
  return name.length <= max ? name : `${name.slice(0, max - 1).trimEnd()}…`;
}

/** Bola estilizada (SVG), usada no escudo e como marca. */
export function ball(size: number, color = C.ink, bg = C.lime): ReactElement {
  const s = (n: number) => String(n);
  return createElement(
    'svg',
    { width: size, height: size, viewBox: '0 0 100 100' },
    createElement('circle', { cx: 50, cy: 50, r: 46, fill: bg, stroke: color, strokeWidth: s(6) }),
    createElement('polygon', { points: '50,30 69,44 62,66 38,66 31,44', fill: color }),
    ...[
      [50, 30, 50, 6],
      [69, 44, 93, 36],
      [62, 66, 78, 88],
      [38, 66, 22, 88],
      [31, 44, 7, 36],
    ].map(([x1, y1, x2, y2], i) =>
      createElement('line', { key: i, x1, y1, x2, y2, stroke: color, strokeWidth: s(6), strokeLinecap: 'round' }),
    ),
  );
}

/** Marca: bola + nome do jogo. */
export function brand(scale = 1): ReactElement {
  return box(
    { alignItems: 'center', gap: 16 * scale },
    ball(64 * scale),
    box(
      { flexDirection: 'column' },
      txt('DUELO DE', { fontFamily: DISPLAY, fontSize: 30 * scale, color: C.lime, letterSpacing: 4 * scale, lineHeight: 1 }),
      txt('CRAQUES', { fontFamily: DISPLAY, fontSize: 46 * scale, color: C.white, letterSpacing: 2 * scale, lineHeight: 1.05 }),
    ),
  );
}

/** Fundo padrão: noite de estádio com refletores. */
export function stage(...children: ReactNode[]): ReactElement {
  return box(
    {
      width: W,
      height: H,
      flexDirection: 'column',
      backgroundColor: C.night,
      backgroundImage:
        'radial-gradient(circle at 0% 0%, rgba(200,255,62,0.20) 0%, rgba(6,19,12,0) 42%), radial-gradient(circle at 100% 0%, rgba(56,189,248,0.16) 0%, rgba(6,19,12,0) 42%), linear-gradient(180deg, #0A2114 0%, #06130C 70%)',
      color: C.white,
      fontFamily: BODY,
      padding: 56,
    },
    ...children,
  );
}

export function pill(label: string, bg: string, color: string, fontSize = 24): ReactElement {
  return txt(label, {
    backgroundColor: bg,
    color,
    fontSize,
    fontWeight: 700,
    letterSpacing: 2,
    padding: `${Math.round(fontSize * 0.25)}px ${Math.round(fontSize * 0.7)}px`,
    borderRadius: 999,
  });
}

/** Mini-campinho com a formação 1-2-2-1, usado nas telas de abertura. */
export function formationStrip(): ReactElement {
  const dot = (label: string) =>
    box(
      { flexDirection: 'column', alignItems: 'center', gap: 8 },
      txt(label, {
        width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center',
        backgroundColor: C.lime, color: C.ink, fontFamily: DISPLAY, fontSize: 28,
      }),
    );
  const col = (...dots: ReactElement[]) => box({ flexDirection: 'column', gap: 18, justifyContent: 'center' }, ...dots);
  return box(
    {
      alignItems: 'center', justifyContent: 'space-around', height: 230, borderRadius: 28,
      border: `3px solid ${C.line}`, padding: '0 40px',
      backgroundImage: `linear-gradient(90deg, ${C.grassA} 0%, ${C.grassA} 25%, ${C.grassB} 25%, ${C.grassB} 50%, ${C.grassA} 50%, ${C.grassA} 75%, ${C.grassB} 75%, ${C.grassB} 100%)`,
    },
    col(dot('GOL')),
    col(dot('DEF'), dot('DEF')),
    col(dot('MEI'), dot('MEI')),
    col(dot('ATA')),
  );
}
