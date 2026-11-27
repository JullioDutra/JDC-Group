import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { firstName } from '../game/text';
import type { ContentCategory, CravadaGuessView } from '../game/types';
import { CRAVADA_LISTS, CRAVADA_THEMES, cravadaChoice, getCravadaList, listsOfCategory, type CravadaList } from '../party/content/cravada';
import { PLAYER_COLORS } from './party';
import { BODY, C, DISPLAY, box, brand, fit, pill, stage, txt } from './theme';

/** Imagens da Cravada: a pergunta da rodada, a revelação e os temas. */

const upper = (s: string) => s.toLocaleUpperCase('pt-BR');
const INNER = 968;
const CATEGORY: Record<ContentCategory, string> = { futebol: 'FUTEBOL', geral: 'CONHECIMENTOS GERAIS', historia: 'HISTÓRIA', anime: 'ANIME', politica: 'POLÍTICA' };
const color = (i: number) => PLAYER_COLORS[Math.max(0, i) % PLAYER_COLORS.length];

/** "35º" com o "º" pequeno no alto (no Anton ele sai do tamanho de um "o" e parece "35 graus"). */
function ord(n: number, size: number, col: string, style: CSSProperties = {}): ReactElement {
  // Pequeno: a fonte do texto (Barlow) já tem o "º" certo.
  if (size <= 40) return txt(`${n}º`, { fontFamily: BODY, fontWeight: 700, fontSize: Math.round(size * 1.05), lineHeight: 1, color: col, flexShrink: 0, ...style });
  return box(
    { alignItems: 'flex-start', flexShrink: 0, ...style },
    txt(String(n), { fontFamily: DISPLAY, fontSize: size, lineHeight: 1, color: col }),
    txt('º', { fontFamily: DISPLAY, fontSize: Math.round(size * 0.42), lineHeight: 1, color: col, marginTop: Math.round(size * 0.04), marginLeft: -Math.round(size * 0.02) }),
  );
}

/** Título em duas partes: o nome da lista e o que vem entre parênteses no fim (fonte, data). */
function splitTitle(title: string): { main: string; note: string } {
  const m = title.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  return m ? { main: m[1], note: m[2] } : { main: title, note: '' };
}

/** Letra que cabe: o título em até 3 linhas (Anton maiúsculo ~0,45 em por letra). */
function titleSize(text: string, max: number, lines: number): number {
  for (let size = max; size > 30; size -= 2) if (text.length <= Math.floor(INNER / (size * 0.47)) * lines) return size;
  return 30;
}

const lastRank = (list: CravadaList) => list.items[list.items.length - 1]?.rank ?? 1;

/**
 * Régua da lista (do 1º ao último) com a posição pedida e, na revelação, uma
 * bolinha por palpite (na cor de quem mandou). Bolinhas que se encostam
 * descem de faixa.
 */
function ruler(list: CravadaList, target: number, marks: Array<{ rank: number; color: string; label: string }>, question: boolean): ReactElement {
  const max = Math.max(2, lastRank(list));
  const left = 34;
  const span = INNER - 2 * left;
  const x = (rank: number) => left + ((rank - 1) / (max - 1)) * span;
  const trackY = 50;
  const lanes: number[][] = [];
  const placed = [...marks]
    .sort((a, b) => a.rank - b.rank)
    .map((m) => {
      const mx = x(m.rank);
      let lane = lanes.findIndex((xs) => xs.every((px) => Math.abs(px - mx) >= 34));
      if (lane < 0) lane = Math.min(lanes.length, 2);
      (lanes[lane] ??= []).push(mx);
      return { ...m, mx, lane };
    });
  const height = trackY + 26 + (placed.length ? 38 * (Math.max(...placed.map((p) => p.lane)) + 1) : 18);
  const tx = x(target);
  return box(
    { position: 'relative', width: INNER, height, flexShrink: 0 },
    box({ position: 'absolute', left, top: trackY, width: span, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.14)' }),
    ord(1, 22, C.muted, { position: 'absolute', left: 0, top: trackY - 6 }),
    box({ position: 'absolute', left: INNER - 60, width: 60, top: trackY - 6, justifyContent: 'flex-end' }, ord(max, 22, C.muted)),
    box({ position: 'absolute', left: tx - 4, top: trackY - 14, width: 8, height: 38, borderRadius: 4, backgroundColor: C.lime }),
    box({ position: 'absolute', left: tx - 50, width: 100, top: 0, justifyContent: 'center' }, ord(target, question ? 28 : 24, C.lime)),
    ...placed.map((p) =>
      txt(p.label, {
        position: 'absolute', left: p.mx - 15, top: trackY + 26 + p.lane * 38, width: 30, height: 30, borderRadius: 15,
        alignItems: 'center', justifyContent: 'center', backgroundColor: p.color, color: C.ink, fontFamily: DISPLAY, fontSize: 18,
      }),
    ),
  );
}

const chip = (label: string) =>
  txt(label, { fontSize: 22, fontWeight: 700, letterSpacing: 1.5, color: C.white, backgroundColor: C.panel, border: `2px solid ${C.panelLine}`, padding: '6px 16px', borderRadius: 999 });

/** Pergunta da rodada: "Qual é o 35º?" em destaque, a lista e a régua. */
export function cravadaRound(spec: { listId: string; rank: number; round: number; total: number; seconds: number }): ReactElement {
  const list = getCravadaList(spec.listId);
  if (!list) return stage(txt('Cravada', { fontFamily: DISPLAY, fontSize: 80 }));
  const { main, note } = splitTitle(list.title);
  const tie = list.items.filter((i) => i.rank === spec.rank).length > 1;
  const kids: ReactNode[] = [
    txt('QUAL É O', { fontFamily: DISPLAY, fontSize: 60, color: C.muted, letterSpacing: 4 }),
    ord(spec.rank, 290, C.lime),
    txt(`de ${list.items.length} na lista`, { fontSize: 36, fontWeight: 700 }),
  ];
  if (tie) kids.push(txt('Posição empatada: qualquer um dos empatados crava', { fontSize: 26, color: C.muted, fontWeight: 500, marginTop: 6 }));
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill(`RODADA ${spec.round} DE ${spec.total}`, C.panel, C.lime, 24)),
    txt(`CRAVADA · ${CATEGORY[list.category]}`, { fontSize: 24, fontWeight: 700, letterSpacing: 4, color: C.lime, marginTop: 26 }),
    txt(upper(main), { fontFamily: DISPLAY, fontSize: titleSize(main, 62, 3), lineHeight: 1.12, marginTop: 6 }),
    ...(note ? [txt(fit(note, 80), { fontSize: 26, color: C.muted, fontWeight: 500, marginTop: 4 })] : []),
    box({ flexDirection: 'column', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }, ...kids),
    ruler(list, spec.rank, [], true),
    box({ gap: 12, justifyContent: 'center', marginTop: 20 }, chip('1 PALPITE POR PESSOA'), chip('CRAVOU: 100'), chip('PERTO VALE MAIS'), chip('FORA: 0')),
    txt(`Mande o nome · ${spec.seconds}s · vale o primeiro palpite`, { fontSize: 26, color: C.muted, fontWeight: 500, justifyContent: 'center', marginTop: 14 }),
  );
}

/** Revelação: quem está na posição, os vizinhos, a régua com os palpites e os pontos de cada um. */
export function cravadaReveal(spec: { listId: string; rank: number; round: number; total: number; reason: string; guesses: CravadaGuessView[] }): ReactElement {
  const list = getCravadaList(spec.listId);
  if (!list) return stage(txt('Cravada', { fontFamily: DISPLAY, fontSize: 80 }));
  const { main, note } = splitTitle(list.title);
  const answers = list.items.filter((i) => i.rank === spec.rank);
  const first = list.items.findIndex((i) => i.rank === spec.rank);
  const last = first + answers.length - 1;
  const around = [...list.items.slice(Math.max(0, first - 2), first), ...list.items.slice(last + 1, last + 3)];
  const guesses = [...spec.guesses].sort((a, b) => b.points - a.points);
  const marks = guesses
    .filter((g) => g.index >= 0)
    .map((g) => ({ rank: list.items[g.index].rank, color: color(g.color), label: upper(firstName(g.player)).slice(0, 1) }));
  const nameSize = answers.length > 1 ? 34 : 50;
  const answerCard = box(
    { alignItems: 'center', gap: 26, backgroundColor: 'rgba(200,255,62,0.10)', border: `3px solid ${C.lime}`, borderRadius: 22, padding: '14px 26px', marginTop: 14 },
    ord(spec.rank, 112, C.lime),
    box(
      { flexDirection: 'column', flexGrow: 1, gap: 4 },
      ...answers.map((a) =>
        box(
          { flexDirection: 'column' },
          txt(upper(fit(a.name, answers.length > 1 ? 30 : 24)), { fontFamily: DISPLAY, fontSize: nameSize, lineHeight: 1.05 }),
          ...(a.detail ? [txt(fit(a.detail, 52), { fontSize: answers.length > 1 ? 20 : 26, color: C.muted, fontWeight: 500 })] : []),
        ),
      ),
    ),
  );
  const near = box(
    { flexWrap: 'wrap', gap: 8, marginTop: 12 },
    ...around.map((i) =>
      box(
        { width: 480, alignItems: 'center', gap: 10, backgroundColor: C.panel, border: `2px solid ${C.panelLine}`, borderRadius: 12, padding: '6px 14px' },
        ord(i.rank, 22, C.muted, { width: 52 }),
        txt(fit(i.name, 22), { fontSize: 22, fontWeight: 700, flexGrow: 1 }),
        ...(i.detail ? [txt(fit(i.detail.split(' · ')[0], 16), { fontSize: 18, color: C.muted, fontWeight: 500, flexShrink: 0 })] : []),
      ),
    ),
  );
  // Altura das linhas de palpite: o que sobra da página dividido por quantos palpitaram.
  const room = 500 - (answers.length - 1) * 56 - (around.length > 2 ? 0 : -44) - Math.max(0, Math.ceil(marks.length / 8) - 1) * 38;
  const rowH = Math.max(34, Math.min(62, Math.floor(room / Math.max(1, guesses.length)) - 6));
  const small = rowH < 48;
  const row = (g: CravadaGuessView) => {
    const item = g.index >= 0 ? list.items[g.index] : null;
    const d = item ? Math.abs(item.rank - spec.rank) : -1;
    const exact = d === 0;
    return box(
      {
        alignItems: 'center', gap: 12, height: rowH, padding: '0 16px', borderRadius: 14, flexShrink: 0,
        backgroundColor: exact ? 'rgba(200,255,62,0.12)' : C.panel, border: `2px solid ${exact ? C.lime : C.panelLine}`,
      },
      box({ width: 16, height: 16, borderRadius: 8, backgroundColor: color(g.color), flexShrink: 0 }),
      txt(upper(fit(firstName(g.player), 12)), { fontFamily: DISPLAY, fontSize: small ? 22 : 28, width: 170, flexShrink: 0 }),
      txt(fit(item ? item.name : g.guess, 24), { fontSize: small ? 20 : 24, fontWeight: 700, flexGrow: 1, width: 300 }),
      box(
        { backgroundColor: 'rgba(255,255,255,0.08)', padding: '2px 12px', borderRadius: 10, flexShrink: 0 },
        item ? ord(item.rank, small ? 18 : 22, C.white) : txt('FORA', { fontFamily: DISPLAY, fontSize: small ? 18 : 22, color: '#F87171' }),
      ),
      txt(exact ? 'CRAVOU!' : item ? `${d} de distância` : 'fora da lista', {
        fontSize: small ? 17 : 20, fontWeight: 700, color: exact ? C.lime : C.muted, width: 150, flexShrink: 0, justifyContent: 'flex-end',
      }),
      txt(`+${g.points}`, { fontFamily: DISPLAY, fontSize: small ? 26 : 34, color: g.points > 0 ? C.lime : C.muted, width: 78, justifyContent: 'flex-end', flexShrink: 0 }),
    );
  };
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.7), pill(`RODADA ${spec.round} DE ${spec.total}`, C.lime, C.ink, 22)),
    txt(upper(main), { fontFamily: DISPLAY, fontSize: titleSize(main, 40, 2), lineHeight: 1.1, marginTop: 14 }),
    ...(note ? [txt(fit(note, 90), { fontSize: 20, color: C.muted, fontWeight: 500 })] : []),
    answerCard,
    ...(around.length ? [near] : []),
    box({ marginTop: 12 }, ruler(list, spec.rank, marks, false)),
    box(
      { flexDirection: 'column', gap: 6, flexGrow: 1, marginTop: 4 },
      ...(guesses.length
        ? guesses.map(row)
        : [txt('Ninguém palpitou nesta rodada.', { fontSize: 28, color: C.muted, fontWeight: 500, justifyContent: 'center', marginTop: 20 })]),
    ),
    txt(fit(`Fonte: ${list.source}`, 118), { fontSize: 17, color: C.muted, fontWeight: 500, marginTop: 8 }),
  );
}

/** Temas da Cravada: um cartão por tema, com quantas listas tem. */
export function cravadaThemes(): ReactElement {
  const cards = [
    ...CRAVADA_THEMES.map((t) => ({ label: t.label, n: cravadaChoice(t.label)?.listIds.length ?? 0, fut: true })),
    { label: 'geral', n: listsOfCategory('geral').length, fut: false },
    { label: 'história', n: listsOfCategory('historia').length, fut: false },
    { label: 'anime', n: listsOfCategory('anime').length, fut: false },
  ];
  const fut = CRAVADA_LISTS.filter((l) => l.category === 'futebol').length;
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill('TEMAS', C.panel, C.lime, 24)),
    txt('TEMAS DA CRAVADA', { fontFamily: DISPLAY, fontSize: 76, lineHeight: 1.1, marginTop: 16 }),
    txt('Mande ABRIR CRAVADA + tema. Sem tema: 4 rodadas de futebol e 1 geral.', { fontSize: 26, color: C.muted, fontWeight: 500, marginBottom: 18 }),
    box(
      { flexWrap: 'wrap', gap: 10, alignContent: 'flex-start', flexGrow: 1, marginBottom: 16 },
      ...cards.map((c) =>
        box(
          {
            width: 479, height: 64, alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderRadius: 14,
            backgroundColor: c.fut ? C.panel : 'rgba(56,189,248,0.10)', border: `2px solid ${c.fut ? C.panelLine : 'rgba(56,189,248,0.45)'}`,
          },
          txt(upper(c.label), { fontFamily: DISPLAY, fontSize: 30 }),
          txt(`${c.n} ${c.n === 1 ? 'lista' : 'listas'}`, { fontSize: 22, fontWeight: 700, color: c.fut ? C.lime : C.host }),
        ),
      ),
    ),
    txt('EXEMPLOS', { fontSize: 22, fontWeight: 700, letterSpacing: 4, color: C.muted, marginTop: 6 }),
    box(
      { flexWrap: 'wrap', gap: 10, marginTop: 10 },
      ...['abrir cravada artilheiros', 'abrir cravada bola de ouro', 'abrir cravada tabelas', 'abrir cravada geral'].map((c) =>
        txt(c, { fontSize: 24, fontWeight: 700, color: C.ink, backgroundColor: C.lime, padding: '6px 16px', borderRadius: 999 }),
      ),
    ),
    txt(`${CRAVADA_LISTS.length} listas no total · ${fut} de futebol`, { fontSize: 24, fontWeight: 700, color: C.muted, justifyContent: 'center', marginTop: 18 }),
  );
}
