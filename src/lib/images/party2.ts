import { createElement, type ReactElement } from 'react';
import { firstName } from '../game/text';
import type { ConexoesParty, FlagSpec, PartyGame, QuizParty } from '../game/types';
import { PARTY_CONFIG } from '../party/common';
import { getConexoes } from '../party/content/conexoes';
import { C, DISPLAY, box, brand, fit, pill, stage, txt } from './theme';

/** Imagens dos jogos novos: Bandeiraço, Conexões e o quadro de texto (Stop, Draft, Sobrevivente). */

const upper = (s: string) => s.toLocaleUpperCase('pt-BR');

// ---------- Bandeiras (SVG só com formas) ----------

function shapes(spec: FlagSpec, x: number, y: number, w: number, h: number, key: string): ReactElement[] {
  const el = (tag: string, props: Record<string, unknown>, i: number | string) => createElement(tag, { key: `${key}-${i}`, ...props });
  const out: ReactElement[] = [];
  const weights = spec.weights ?? spec.colors.map(() => 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let offset = 0;
  spec.colors.forEach((color, i) => {
    const size = (weights[i] / total) * (spec.dir === 'h' ? h : w);
    out.push(
      spec.dir === 'h'
        ? el('rect', { x, y: y + offset, width: w, height: size + 0.5, fill: color }, `s${i}`)
        : el('rect', { x: x + offset, y, width: size + 0.5, height: h, fill: color }, `s${i}`),
    );
    offset += size;
  });
  if (spec.hoist) out.push(el('rect', { x, y, width: w * spec.hoist.width, height: h, fill: spec.hoist.color }, 'hoist'));
  if (spec.diamond) {
    const mx = w * 0.085;
    const my = h * 0.12;
    const pts = [[x + w / 2, y + my], [x + w - mx, y + h / 2], [x + w / 2, y + h - my], [x + mx, y + h / 2]].map((p) => p.join(',')).join(' ');
    out.push(el('polygon', { points: pts, fill: spec.diamond.color }, 'diamond'));
  }
  if (spec.triangle) {
    const d = w * (spec.triangle.depth ?? 0.4);
    out.push(el('polygon', { points: `${x},${y} ${x + d},${y + h / 2} ${x},${y + h}`, fill: spec.triangle.color }, 'tri'));
  }
  if (spec.cross) {
    const { kind, color, outline } = spec.cross;
    const bars = (t: number, fill: string, tag: string) => {
      if (kind === 'plus') {
        const arm = h * 0.6;
        return [
          el('rect', { x: x + w / 2 - t / 2, y: y + h / 2 - arm / 2, width: t, height: arm, fill }, `${tag}v`),
          el('rect', { x: x + w / 2 - arm / 2, y: y + h / 2 - t / 2, width: arm, height: t, fill }, `${tag}h`),
        ];
      }
      const cx = kind === 'nordic' ? x + w * 0.375 : x + w / 2;
      return [
        el('rect', { x: cx - t / 2, y, width: t, height: h, fill }, `${tag}v`),
        el('rect', { x, y: y + h / 2 - t / 2, width: w, height: t, fill }, `${tag}h`),
      ];
    };
    const t = kind === 'nordic' ? h * 0.16 : h * 0.2;
    if (outline) out.push(...bars(t * 1.75, outline, 'o'));
    out.push(...bars(t, color, 'c'));
  }
  if (spec.circle) {
    const d = h * (spec.circle.size ?? 0.5);
    out.push(el('circle', { cx: x + w * (spec.circle.cx ?? 0.5), cy: y + h / 2, r: d / 2, fill: spec.circle.color }, 'circle'));
  }
  if (spec.canton) {
    out.push(...shapes(spec.canton.flag, x, y, w * spec.canton.width, h * spec.canton.height, `${key}-canton`));
  }
  return out;
}

export function flagSvg(spec: FlagSpec, width: number, height: number): ReactElement {
  return createElement('svg', { width, height, viewBox: `0 0 ${width} ${height}` }, ...shapes(spec, 0, 0, width, height, 'f'));
}

export function flagQuiz(state: QuizParty, flag: FlagSpec): ReactElement {
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill(`RODADA ${state.round + 1} DE ${state.totalRounds}`, C.panel, C.lime, 24)),
    txt('BANDEIRAÇO', { fontFamily: DISPLAY, fontSize: 96, lineHeight: 1.1, marginTop: 30 }),
    txt('De que país é esta bandeira?', { fontSize: 34, color: C.muted, fontWeight: 500 }),
    box(
      { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
      box({ border: `6px solid ${C.panelLine}`, borderRadius: 12, overflow: 'hidden' }, flagSvg(flag, 900, 600)),
    ),
    txt('1 palpite por pessoa · desenho sem brasões e estrelas', { fontSize: 26, color: C.lime, fontWeight: 700, justifyContent: 'center' }),
  );
}

// ---------- Conexões ----------

export const GROUP_COLORS = ['#FACC15', '#34D399', '#60A5FA', '#C084FC'];

export function conexoesBoard(state: ConexoesParty, reveal: boolean): ReactElement {
  const puzzle = getConexoes(state.order[state.round]);
  const groups = puzzle?.groups ?? [];
  const solvedTiles = new Set(state.solved.flatMap((s) => groups[s.group]?.items ?? []));
  const open = state.tiles.map((t, i) => ({ t, n: i + 1 })).filter(({ t }) => !solvedTiles.has(t));
  const tileW = 228;
  return stage(
    box(
      { justifyContent: 'space-between', alignItems: 'center' },
      brand(0.75),
      pill(reveal ? 'REVELAÇÃO' : `RODADA ${state.round + 1} DE ${state.totalRounds}`, reveal ? C.lime : C.panel, reveal ? C.ink : C.lime, 24),
    ),
    txt('CONEXÕES', { fontFamily: DISPLAY, fontSize: 88, lineHeight: 1.1, marginTop: 14 }),
    txt(reveal ? 'Os 4 grupos' : 'Ache 4 grupos de 4 · mande os números', { fontSize: 30, color: C.muted, fontWeight: 500, marginBottom: 18 }),
    box(
      { flexDirection: 'column', gap: 12 },
      ...state.solved.map((s) => {
        const g = groups[s.group];
        return box(
          { flexDirection: 'column', backgroundColor: GROUP_COLORS[s.group], borderRadius: 18, padding: '14px 22px', color: C.ink },
          box(
            { justifyContent: 'space-between' },
            txt(upper(fit(g?.label ?? '', 46)), { fontFamily: DISPLAY, fontSize: 30 }),
            txt(s.jid ? fit(firstName(s.name), 12) : 'revelado', { fontSize: 24, fontWeight: 700 }),
          ),
          txt((g?.items ?? []).join(' · '), { fontSize: 26, fontWeight: 600 }),
        );
      }),
    ),
    box(
      { flexWrap: 'wrap', gap: 12, marginTop: state.solved.length ? 16 : 0 },
      ...open.map(({ t, n }) =>
        box(
          {
            width: tileW, height: 130, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            backgroundColor: C.panel, border: `2px solid ${C.panelLine}`, borderRadius: 16, padding: '6px 10px',
          },
          txt(n, { fontFamily: DISPLAY, fontSize: 30, color: C.lime }),
          txt(t, { fontSize: t.length > 16 ? 22 : 28, fontWeight: 700, textAlign: 'center', justifyContent: 'center', lineHeight: 1.1 }),
        ),
      ),
    ),
    box(
      { flexGrow: 1, alignItems: 'flex-end', justifyContent: 'center' },
      txt(reveal ? ' ' : '3 erros por pessoa · combinação repetida não conta', { fontSize: 24, color: C.muted, fontWeight: 600 }),
    ),
  );
}

// ---------- Quadro de texto ----------

export function textBoard(
  game: PartyGame,
  title: string,
  subtitle: string,
  rows: Array<{ head: string; lines: string[]; color?: string; highlight?: boolean }>,
): ReactElement {
  const two = rows.length > 3;
  const totalLines = rows.reduce((a, r) => a + r.lines.length + 1, 0) / (two ? 2 : 1);
  const font = totalLines > 24 ? 20 : totalLines > 16 ? 24 : 28;
  const card = (r: (typeof rows)[number]) =>
    box(
      {
        flexDirection: 'column', width: two ? 470 : 968, backgroundColor: r.highlight ? 'rgba(200,255,62,0.12)' : C.panel,
        border: `2px solid ${r.highlight ? C.lime : C.panelLine}`, borderRadius: 18, padding: '12px 18px',
      },
      txt(upper(fit(r.head, 34)), { fontFamily: DISPLAY, fontSize: font + 6, color: r.highlight ? C.lime : r.color ?? C.white }),
      ...r.lines.map((l) => txt(fit(l, two ? 38 : 70), { fontSize: font, fontWeight: 500, lineHeight: 1.25 })),
    );
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill(upper(PARTY_CONFIG[game].name), C.panel, C.lime, 24)),
    txt(upper(title), { fontFamily: DISPLAY, fontSize: 76, lineHeight: 1.1, marginTop: 16 }),
    txt(subtitle, { fontSize: 28, color: C.muted, fontWeight: 500, marginBottom: 18 }),
    box({ flexWrap: 'wrap', gap: 14, alignContent: 'flex-start' }, ...rows.map(card)),
  );
}
