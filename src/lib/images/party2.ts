import { createElement, type ReactElement } from 'react';
import { firstName } from '../game/text';
import { criterionLabel, parseCriterion } from '../party/gridCriteria';
import type { ConexoesParty, FlagSpec, GradeParty, PartyGame, QuizParty, Top100Party } from '../game/types';
import { getTop100 } from '../party/content/top100';
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
  // Quantos caracteres cabem na linha (Barlow ~0,37 em) e no título do card (Anton maiúsculo ~0,45 em).
  const room = (font: number) => Math.floor(((two ? 434 : 928) / (font * 0.37)) * 0.95);
  const headRoom = (size: number) => Math.floor((two ? 430 : 924) / (size * 0.44));
  const longest = Math.max(0, ...rows.flatMap((r) => r.lines.map((l) => l.length)));
  // Maior letra que cabe na altura e, se der, sem cortar a linha mais longa.
  const byHeight = totalLines > 24 ? 20 : totalLines > 16 ? 24 : 28;
  const font = [28, 24, 20].find((f) => f <= byHeight && longest <= room(f)) ?? 20;
  // Título do card (nome · pontos/votos): encolhe antes de cortar, para o fim não sumir.
  const headSize = (head: string) => [font + 6, font + 2, font - 2].find((size) => head.length <= headRoom(size)) ?? font - 2;
  const card = (r: (typeof rows)[number]) =>
    box(
      {
        flexDirection: 'column', width: two ? 470 : 968, backgroundColor: r.highlight ? 'rgba(200,255,62,0.12)' : C.panel,
        border: `2px solid ${r.highlight ? C.lime : C.panelLine}`, borderRadius: 18, padding: '12px 18px',
      },
      txt(upper(fit(r.head, headRoom(headSize(r.head)))), { fontFamily: DISPLAY, fontSize: headSize(r.head), color: r.highlight ? C.lime : r.color ?? C.white }),
      ...r.lines.map((l) => txt(fit(l, room(font)), { fontSize: font, fontWeight: 500, lineHeight: 1.25 })),
    );
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill(upper(PARTY_CONFIG[game].name), C.panel, C.lime, 24)),
    txt(upper(title), { fontFamily: DISPLAY, fontSize: 76, lineHeight: 1.1, marginTop: 16 }),
    txt(subtitle, { fontSize: 28, color: C.muted, fontWeight: 500, marginBottom: 18 }),
    box({ flexWrap: 'wrap', gap: 14, alignContent: 'flex-start' }, ...rows.map(card)),
  );
}

// ---------- Grade 3x3 ----------

export function gradeBoard(state: GradeParty, final: boolean): ReactElement {
  const colors = [C.host, C.guest];
  const colorOf = (jid: string) => colors[Math.max(0, state.players.findIndex((p) => p.jid === jid))];
  const cellSize = 236;
  const head = 196;
  const header = (label: string, sub: string) =>
    box(
      { width: cellSize, height: 110, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: C.panel, borderRadius: 16, border: `2px solid ${C.panelLine}` },
      txt(sub, { fontSize: 22, fontWeight: 700, color: C.lime, letterSpacing: 2 }),
      txt(upper(fit(label, 26)), { fontFamily: DISPLAY, fontSize: label.length > 16 ? 24 : label.length > 12 ? 28 : 34, lineHeight: 1.1, textAlign: 'center' }),
    );
  const rowHead = (label: string, sub: string) =>
    box(
      { width: head, height: cellSize, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: C.panel, borderRadius: 16, border: `2px solid ${C.panelLine}` },
      txt(sub, { fontSize: 26, fontWeight: 700, color: C.lime, letterSpacing: 2 }),
      txt(upper(fit(label, 26)), { fontFamily: DISPLAY, fontSize: label.length > 14 ? 24 : label.length > 11 ? 28 : 32, lineHeight: 1.1, textAlign: 'center' }),
    );
  const cell = (i: number) => {
    const c = state.cells[i];
    const coord = `${['A', 'B', 'C'][Math.floor(i / 3)]}${(i % 3) + 1}`;
    return box(
      {
        width: cellSize, height: cellSize, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 18,
        backgroundColor: c ? colorOf(c.jid) : 'rgba(255,255,255,0.04)', border: `3px solid ${c ? colorOf(c.jid) : C.panelLine}`, padding: 10,
      },
      c
        ? box(
            { flexDirection: 'column', alignItems: 'center' },
            txt(upper(fit(c.name, 14)), { fontFamily: DISPLAY, fontSize: 30, color: C.ink, textAlign: 'center', lineHeight: 1.1 }),
            txt(fit(firstName(state.players.find((p) => p.jid === c.jid)?.name ?? ''), 14), { fontSize: 24, fontWeight: 700, color: C.ink, marginTop: 6 }),
          )
        : txt(coord, { fontFamily: DISPLAY, fontSize: 56, color: 'rgba(255,255,255,0.25)' }),
    );
  };
  const rowLabel = (raw: string) => criterionLabel(parseCriterion(raw, 'club'));
  const colLabel = (raw: string) => criterionLabel(parseCriterion(raw, 'nation'));
  const [a, b] = state.players;
  const counts = state.players.map((p) => state.cells.filter((x) => x?.jid === p.jid).length);
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill(final ? 'FIM DE JOGO' : 'GRADE 3X3', C.panel, C.lime, 24)),
    box(
      { justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 18, marginBottom: 18 },
      txt(upper(fit(firstName(a.name), 12)), { fontFamily: DISPLAY, fontSize: 52, color: colors[0] }),
      txt(`${counts[0]} x ${counts[1]}`, { fontFamily: DISPLAY, fontSize: 52 }),
      txt(upper(fit(firstName(b.name), 12)), { fontFamily: DISPLAY, fontSize: 52, color: colors[1] }),
    ),
    box(
      { flexDirection: 'column', gap: 12, alignItems: 'center' },
      box({ gap: 12 }, box({ width: head, height: 110 }), ...state.cols.map((raw, i) => header(colLabel(raw).name, `${i + 1} · ${colLabel(raw).sub}`))),
      ...[0, 1, 2].map((r) => box({ gap: 12 }, rowHead(rowLabel(state.rows[r]).name, `${['A', 'B', 'C'][r]} · ${rowLabel(state.rows[r]).sub}`), ...[0, 1, 2].map((c) => cell(r * 3 + c)))),
    ),
    txt(final ? 'Mande DESAFIO GRADE para jogar de novo' : `Vez de ${firstName(state.players[state.turn].name)} · mande: A2 Neymar`, {
      fontSize: 30, fontWeight: 700, color: C.lime, marginTop: 22, textAlign: 'center', justifyContent: 'center',
    }),
  );
}

// ---------- Top 100 do Dia ----------

const T100_COLORS = ['#38BDF8', '#FF8A3D', '#C084FC', '#F472B6', '#FACC15', '#34D399', '#F87171', '#60A5FA', '#A3E635', '#FB923C', '#2DD4BF', '#E879F9', '#FDE047', '#93C5FD', '#FCA5A5'];

export function top100Board(state: Top100Party, final: boolean): ReactElement {
  const list = getTop100(state.listId);
  const items = list?.items ?? [];
  const colorOf = (jid: string) => T100_COLORS[Math.max(0, state.players.findIndex((p) => p.jid === jid)) % T100_COLORS.length];
  const cell = (i: number) => {
    const it = items[i];
    const hit = state.found[i];
    const show = hit || final;
    return box(
      {
        width: 91, height: 88, flexDirection: 'column', padding: '4px 6px', borderRadius: 10,
        backgroundColor: hit ? colorOf(hit.jid) : 'rgba(255,255,255,0.04)', border: `2px solid ${hit ? colorOf(hit.jid) : C.panelLine}`,
      },
      txt(it ? it.rank : i + 1, { fontFamily: DISPLAY, fontSize: 18, color: hit ? C.ink : 'rgba(255,255,255,0.45)' }),
      ...(show && it
        ? [txt(fit(it.name, 22), { fontSize: 14, fontWeight: 700, lineHeight: 1.05, color: hit ? C.ink : 'rgba(255,255,255,0.55)' })]
        : []),
    );
  };
  const found = state.found.filter(Boolean).length;
  const ranked = [...state.players].sort((a, b) => b.score - a.score).slice(0, 4);
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.7), pill(final ? 'RESULTADO' : `${found} DE 100`, final ? C.lime : C.panel, final ? C.ink : C.lime, 22)),
    txt(upper(fit(list?.title ?? 'Top 100 do Dia', 70)), { fontFamily: DISPLAY, fontSize: (list?.title.length ?? 0) > 50 ? 30 : 38, lineHeight: 1.1, marginTop: 10 }),
    box(
      { gap: 14, marginTop: 6, marginBottom: 10, flexWrap: 'wrap' },
      ...ranked.map((p) => txt(`${firstName(p.name)} ${p.score}`, { fontSize: 22, fontWeight: 700, color: colorOf(p.jid) })),
    ),
    box({ flexWrap: 'wrap', gap: 6, width: 968 }, ...items.slice(0, 100).map((_, i) => cell(i))),
  );
}
