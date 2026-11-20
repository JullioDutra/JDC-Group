import type { ReactElement } from 'react';
import type { RankingRow } from '../game/types';
import { C, DISPLAY, box, brand, fit, pill, stage, txt } from './theme';
import { aproveitamentoText } from '../game/season';

/**
 * Imagem da virada de temporada: pódio dos 3 primeiros, a tabela até o 10º,
 * os destaques do período e o aviso de que o ranking foi zerado.
 */
export interface SeasonSpec {
  groupName: string;
  season: number;
  /** ISO. */
  startedAt: string;
  endedAt: string;
  rows: RankingRow[];
  /** Partidas terminadas no período. */
  matches: number;
  highlights: Array<{ label: string; name: string; value: string }>;
  /** Partidas por jogo, do mais jogado ao menos (preenche o espaço quando há poucos jogadores). */
  games?: Array<{ name: string; count: number }>;
}

const MEDAL = ['#FFD54A', '#D9E2E7', '#E39A5B'];
/** Largura da barra de partidas por jogo (nome 300 + barra + número 70 + espaços = largura útil). */
const BAR = 570;
const upper = (s: string) => s.toLocaleUpperCase('pt-BR');
const points = (r: RankingRow) => r.wins * 3 + r.draws;
const day = (iso: string) => {
  const d = new Date(new Date(iso).getTime() - 3 * 3600_000); // Brasília
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
};

/** Um degrau do pódio: medalha, nome, pontos e campanha. */
function step(r: RankingRow | undefined, place: number, height: number): ReactElement {
  const color = MEDAL[place - 1];
  const champion = place === 1;
  return box(
    { flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: 300 },
    champion ? pill('CAMPEÃO', C.lime, C.ink, 20) : txt('', { height: 32 }),
    box(
      {
        width: champion ? 100 : 80, height: champion ? 100 : 80, marginTop: 10, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center', backgroundColor: color, border: `6px solid ${C.night}`,
        boxShadow: champion ? '0 0 60px rgba(255,213,74,0.55)' : 'none',
      },
      txt(place, { fontFamily: DISPLAY, fontSize: champion ? 58 : 46, color: C.ink, lineHeight: 1 }),
    ),
    txt(r ? upper(fit(r.name, 14)) : '—', { fontFamily: DISPLAY, fontSize: champion ? 42 : 34, marginTop: 8, lineHeight: 1.05, color: C.white }),
    txt(r ? `${points(r)} pts` : '', { fontSize: champion ? 30 : 26, fontWeight: 700, color: champion ? C.lime : C.muted }),
    box(
      {
        width: 300, height, marginTop: 10, borderRadius: '22px 22px 0 0', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 16,
        backgroundImage: `linear-gradient(180deg, ${color} 0%, rgba(12,32,22,0.95) 100%)`,
      },
      txt(r ? `${r.wins}V · ${r.draws}E · ${r.losses}D · ${aproveitamentoText(r)}` : '', { fontSize: 22, fontWeight: 700, color: C.ink }),
    ),
  );
}

function gamesBlock(games: Array<{ name: string; count: number }>, room: number): ReactElement[] {
  const list = games.slice(0, Math.max(0, room - 1));
  if (list.length < 2) return [];
  const max = Math.max(...list.map((g) => g.count));
  return [
    txt('PARTIDAS POR JOGO', { fontSize: 20, fontWeight: 700, letterSpacing: 3, color: C.lime, marginTop: 16, flexShrink: 0 }),
    box(
      { flexDirection: 'column', gap: 6, marginTop: 8, flexShrink: 0 },
      ...list.map((g) =>
        box(
          { alignItems: 'center', height: 38, gap: 14, flexShrink: 0 },
          txt(upper(fit(g.name, 20)), { width: 300, flexShrink: 0, fontFamily: DISPLAY, fontSize: 24, color: C.white }),
          box(
            { width: BAR, flexShrink: 0, height: 22, borderRadius: 999, backgroundColor: C.panel },
            box({ width: Math.max(14, Math.round((g.count / max) * BAR)), height: 22, borderRadius: 999, backgroundImage: `linear-gradient(90deg, ${C.lime} 0%, #7EE8A0 100%)` }),
          ),
          txt(g.count, { width: 70, flexShrink: 0, fontFamily: DISPLAY, fontSize: 26, color: C.lime, justifyContent: 'flex-end' }),
        ),
      ),
    ),
  ];
}

export function seasonImage(spec: SeasonSpec): ReactElement {
  const [first, second, third] = spec.rows;
  const rest = spec.rows.slice(3, 10);
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }, brand(0.7), pill(upper(fit(spec.groupName, 20)), C.panel, C.lime, 22)),
    txt(`FIM DA TEMPORADA ${spec.season}`, { fontFamily: DISPLAY, fontSize: 84, lineHeight: 1.1, marginTop: 14, color: C.white, flexShrink: 0 }),
    txt(`${day(spec.startedAt)} a ${day(spec.endedAt)} · ${spec.matches} partida${spec.matches === 1 ? '' : 's'}`, {
      fontSize: 28, color: C.muted, fontWeight: 600, marginTop: 2, flexShrink: 0,
    }),
    // Pódio: 2º, 1º, 3º.
    box({ justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginTop: 10, flexShrink: 0 }, step(second, 2, 84), step(first, 1, 118), step(third, 3, 60)),
    // 4º ao 10º.
    box(
      { flexDirection: 'column', gap: 5, marginTop: 12, flexShrink: 0 },
      ...rest.map((r, i) =>
        box(
          { alignItems: 'center', height: 40, padding: '0 22px', borderRadius: 12, backgroundColor: C.panel, border: `2px solid ${C.panelLine}`, flexShrink: 0 },
          txt(`${i + 4}`, { width: 56, fontFamily: DISPLAY, fontSize: 26, color: C.muted }),
          txt(upper(fit(r.name, 22)), { flexGrow: 1, fontFamily: DISPLAY, fontSize: 26, letterSpacing: 1 }),
          txt(`${r.wins}V ${r.draws}E ${r.losses}D`, { width: 180, fontSize: 24, fontWeight: 600, color: C.muted, justifyContent: 'flex-end' }),
          txt(aproveitamentoText(r), { width: 90, fontSize: 24, fontWeight: 700, color: C.white, justifyContent: 'flex-end' }),
          txt(`${points(r)}`, { width: 90, fontFamily: DISPLAY, fontSize: 30, color: C.lime, justifyContent: 'flex-end' }),
        ),
      ),
    ),
    // Com poucos jogadores sobra espaço: partidas por jogo, em barras.
    ...gamesBlock(spec.games ?? [], 7 - rest.length),
    // Destaques do período.
    box(
      { gap: 12, marginTop: 'auto', flexWrap: 'wrap', flexShrink: 0, paddingTop: 12 },
      ...spec.highlights.slice(0, 4).map((h) =>
        box(
          {
            flexDirection: 'column', width: 478, padding: '10px 20px', borderRadius: 16,
            backgroundColor: 'rgba(200,255,62,0.08)', border: `2px solid ${C.panelLine}`,
          },
          txt(upper(h.label), { fontSize: 20, fontWeight: 700, letterSpacing: 2, color: C.lime }),
          box(
            { justifyContent: 'space-between', alignItems: 'baseline' },
            txt(upper(fit(h.name, 18)), { fontFamily: DISPLAY, fontSize: 32, color: C.white }),
            txt(h.value, { fontSize: 24, fontWeight: 700, color: C.muted }),
          ),
        ),
      ),
    ),
    txt(`TEMPORADA ${spec.season + 1} COMEÇA AGORA · RANKING ZERADO`, {
      fontFamily: DISPLAY, fontSize: 30, letterSpacing: 2, color: C.ink, backgroundColor: C.lime,
      justifyContent: 'center', padding: '8px 0', borderRadius: 14, marginTop: 12, flexShrink: 0,
    }),
  );
}
