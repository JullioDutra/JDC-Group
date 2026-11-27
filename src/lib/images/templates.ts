import type { ReactElement } from 'react';
import { faceQuiz } from './rosto';
import { cravadaReveal, cravadaRound, cravadaThemes } from './cravada';
import { TURN_SECONDS, isBlind, totals, turnSeconds } from '../game/engine';
import { MODES, getMode } from '../game/modes';
import { getTeam } from '../game/teams';
import { firstName, formatNumber } from '../game/text';
import { ImageSpec, MatchState, Pick, Position, RankingRow, SLOTS, Side } from '../game/types';
import { conexoesBoard, flagQuiz, gradeBoard, textBoard, top100Board } from './party2';
import { helpMenu } from './help';
import { seasonImage } from './season';
import { aproveitamentoText } from '../game/season';
import { draftBoard, intrusoBoard, lineupQuiz, partyLobby, partyScore, partyTable, top10Board } from './party';
import { BODY, C, DISPLAY, H, SIDE_COLOR, W, ball, box, brand, fit, formationStrip, pill, stage, txt } from './theme';

const upper = (s: string) => s.toLocaleUpperCase('pt-BR');

// ---------- 1. Desafio lançado ----------

function challenge(host: string): ReactElement {
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(), pill('1 x 1', C.panel, C.lime, 28)),
    box(
      { flexDirection: 'column', flexGrow: 1, justifyContent: 'center' },
      txt('DESAFIO', { fontFamily: DISPLAY, fontSize: 190, lineHeight: 1, color: C.white }),
      txt('LANÇADO', { fontFamily: DISPLAY, fontSize: 190, lineHeight: 1, color: C.lime }),
      box(
        { marginTop: 44, alignItems: 'center', gap: 20 },
        box({ width: 14, height: 84, backgroundColor: C.host, borderRadius: 7 }),
        box(
          { flexDirection: 'column' },
          txt(upper(fit(host, 22)), { fontFamily: DISPLAY, fontSize: 68, lineHeight: 1.05 }),
          txt('quer saber quem entende mais de futebol', { fontSize: 34, color: C.muted, fontWeight: 500 }),
        ),
      ),
    ),
    formationStrip(),
    box(
      { marginTop: 36, justifyContent: 'space-between', alignItems: 'center' },
      box(
        { flexDirection: 'column' },
        txt('O primeiro que responder entra em campo', { fontSize: 30, color: C.muted, fontWeight: 500 }),
        txt('6 escolhas · 1 tema · vence a melhor soma', { fontSize: 30, color: C.white, fontWeight: 700 }),
      ),
      txt('ACEITAR', {
        fontFamily: DISPLAY, fontSize: 56, color: C.ink, backgroundColor: C.lime,
        padding: '10px 40px', borderRadius: 20, letterSpacing: 2,
      }),
    ),
  );
}

// ---------- 2. Menu de temas ----------

const RESTRICTION_TAG = { none: 'LIVRE', club: 'CLUBE', country: 'SELEÇÃO' } as const;
/** Etiqueta curta da liga no início da partida. */
const LEAGUE_TAG = { br: 'Brasileirão', eng: 'Premier', esp: 'La Liga', ita: 'Série A', ger: 'Bundesliga', fra: 'Ligue 1', arg: 'Argentino' } as const;

function modesMenu(): ReactElement {
  const half = Math.ceil(MODES.length / 2);
  // Até 9 cards por coluna: 100 px; 10 (19-20 temas): 88 px; 11 (21-22 temas): 80 px.
  const cardH = half > 10 ? 80 : half > 9 ? 88 : 100;
  const compact = half > 9;
  const tight = half > 10;
  const card = (m: (typeof MODES)[number]) =>
    box(
      {
        alignItems: 'center', gap: 14, backgroundColor: C.panel, border: `2px solid ${C.panelLine}`,
        borderRadius: 16, padding: '0 14px', height: cardH, flexShrink: 0,
      },
      txt(m.number, {
        width: tight ? 46 : 52, height: tight ? 46 : 52, borderRadius: 12, backgroundColor: C.lime, color: C.ink, flexShrink: 0,
        fontFamily: DISPLAY, fontSize: tight ? 26 : 30, alignItems: 'center', justifyContent: 'center',
      }),
      box(
        { flexDirection: 'column', flexGrow: 1, width: 360 },
        txt(upper(fit(m.name, 20)), { fontFamily: DISPLAY, fontSize: tight ? 25 : compact ? 28 : 30, lineHeight: 1.1, letterSpacing: 0.5 }),
        txt(m.tagline.split(' · ')[0], { fontSize: tight ? 18 : compact ? 20 : 22, color: C.muted, fontWeight: 500, lineHeight: 1.1 }),
        box(
          { gap: 8, marginTop: tight ? 2 : compact ? 3 : 4 },
          txt(RESTRICTION_TAG[m.restriction], { fontSize: tight ? 14 : 16, fontWeight: 700, letterSpacing: 1.5, color: C.white, backgroundColor: 'rgba(255,255,255,0.10)', padding: '1px 8px', borderRadius: 6 }),
          txt(m.direction === 'high' ? 'MAIOR VENCE' : 'MENOR VENCE', {
            fontSize: tight ? 14 : 16, fontWeight: 700, letterSpacing: 1.5, color: C.ink, padding: '1px 8px', borderRadius: 6,
            backgroundColor: m.direction === 'high' ? C.lime : C.guest,
          }),
        ),
      ),
    );
  const column = (list: typeof MODES) => box({ flexDirection: 'column', gap: tight ? 8 : 10, width: 476 }, ...list.map(card));
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.8), pill('ANFITRIÃO ESCOLHE', C.panel, C.lime, 22)),
    txt('ESCOLHA O TEMA', { fontFamily: DISPLAY, fontSize: 66, lineHeight: 1.1, marginTop: 14, marginBottom: 12 }),
    box({ gap: 16, flexGrow: 1 }, column(MODES.slice(0, half)), column(MODES.slice(half))),
    box(
      { flexDirection: 'column', alignItems: 'center', marginTop: 8 },
      txt('Mande o número do tema ou ALEATÓRIO', { fontSize: 30, fontWeight: 700, color: C.lime }),
      txt('Extras: CEGO · RELÂMPAGO · DIFÍCIL · ex.: 3 cego', { fontSize: 22, fontWeight: 500, color: C.muted }),
      txt('Só uma liga: ex.: 1 brasileirão · mande LIGAS para ver todas', { fontSize: 20, fontWeight: 500, color: C.muted }),
    ),
  );
}

// ---------- 3. Início de partida (regras resumidas) ----------

function kickoff(state: MatchState): ReactElement {
  const mode = getMode(state.modeId)!;
  const nameCard = (side: Side, align: 'flex-start' | 'flex-end') =>
    box(
      { flexDirection: 'column', alignItems: align, flexGrow: 1, flexBasis: 0 },
      txt(side === 0 ? 'ANFITRIÃO' : 'DESAFIANTE', { fontSize: 22, fontWeight: 700, letterSpacing: 3, color: SIDE_COLOR[side] }),
      txt(upper(fit(firstName(state.players[side]!.name), 12)), { fontFamily: DISPLAY, fontSize: 60, lineHeight: 1.1 }),
    );
  return stage(
    box(
      { justifyContent: 'space-between', alignItems: 'center' },
      brand(),
      box(
        { gap: 10 },
        ...(state.options?.blind ? [pill('ÀS CEGAS', C.guest, C.ink, 24)] : []),
        ...(turnSeconds(state) !== TURN_SECONDS ? [pill('RELÂMPAGO', C.host, C.ink, 24)] : []),
        ...(state.options?.league ? [pill(upper(LEAGUE_TAG[state.options.league]), C.panel, C.lime, 24)] : []),
        pill(`TEMA ${mode.number}`, C.lime, C.ink, 24),
      ),
    ),
    box(
      { flexDirection: 'column', marginTop: 40 },
      txt('BOLA ROLANDO', { fontSize: 30, fontWeight: 700, letterSpacing: 6, color: C.lime }),
      txt(upper(mode.name), { fontFamily: DISPLAY, fontSize: mode.name.length > 12 ? 104 : 150, lineHeight: 1.02 }),
      txt(mode.tagline, { fontSize: 36, color: C.muted, fontWeight: 500 }),
    ),
    box(
      {
        marginTop: 34, alignItems: 'center', backgroundColor: C.panel, border: `2px solid ${C.panelLine}`,
        borderRadius: 26, padding: '22px 30px', gap: 20,
      },
      nameCard(0, 'flex-start'),
      txt('X', { fontFamily: DISPLAY, fontSize: 64, color: C.lime }),
      nameCard(1, 'flex-end'),
    ),
    box(
      { flexDirection: 'column', gap: 16, marginTop: 30, flexGrow: 1 },
      ...[...mode.rules, ...(state.options?.blind ? ['Às cegas: os números ficam secretos até o apito final.'] : [])].map((rule, i) =>
        box(
          { alignItems: 'center', gap: 20 },
          txt(i + 1, {
            width: 52, height: 52, borderRadius: 26, border: `3px solid ${C.lime}`, color: C.lime,
            fontFamily: DISPLAY, fontSize: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }),
          txt(rule, { fontSize: 34, fontWeight: 500, lineHeight: 1.15, width: 880 }),
        ),
      ),
    ),
    formationStrip(),
    box(
      { marginTop: 26, justifyContent: 'space-between' },
      txt('Na sua vez, mande só o nome do jogador', { fontSize: 28, color: C.muted, fontWeight: 500 }),
      txt(`${turnSeconds(state)}s por jogada`, { fontSize: 28, color: C.lime, fontWeight: 700 }),
    ),
  );
}

// ---------- 4. Campinho (parcial e final) ----------

const ROW_H = 118;
/** Faixa livre no meio-campo, onde fica o selo de rodada/resultado. */
const MID_H = 76;
const SHORT: Record<Position, string> = { GOL: 'GOL', DEF: 'DEF', MEI: 'MEI', ATA: 'ATA' };

function token(pick: Pick | null, position: Position, color: string, hidden = false): ReactElement {
  if (!pick) {
    return box(
      { flexDirection: 'column', alignItems: 'center', width: 330 },
      txt(SHORT[position], {
        width: 74, height: 74, borderRadius: 37, border: '3px dashed rgba(255,255,255,0.55)', color: 'rgba(255,255,255,0.7)',
        fontFamily: DISPLAY, fontSize: 24, alignItems: 'center', justifyContent: 'center',
      }),
      txt('aguardando', { fontSize: 22, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: 4 }),
    );
  }
  const value = hidden ? '?' : formatNumber(pick.value);
  return box(
    { flexDirection: 'column', alignItems: 'center', width: 330 },
    txt(value, {
      minWidth: 74, height: 74, borderRadius: 37, padding: '0 14px', backgroundColor: color, color: C.ink,
      border: `4px solid ${C.white}`, fontFamily: DISPLAY, fontSize: value.length > 4 ? 30 : 38,
      alignItems: 'center', justifyContent: 'center',
    }),
    txt(upper(fit(pick.name, 20)), {
      marginTop: 6, backgroundColor: 'rgba(6,19,12,0.82)', color: C.white, fontSize: 25, fontWeight: 700,
      padding: '2px 14px', borderRadius: 10, letterSpacing: 0.5,
    }),
  );
}

/** Uma linha do campo: um ou dois jogadores da mesma posição. */
function pitchRow(state: MatchState, side: Side, slots: number[]): ReactElement {
  // O time de cada rodada só aparece depois que ela termina (no fim da partida, todos).
  // A rodada em andamento vai no texto; a imagem de "fim da rodada" não adianta a próxima.
  const open = slots.filter((s) => state.status === 'FINISHED' || s < state.round);
  const team = open.length ? getTeam(state.restrictions[open[0]]?.teamId) : undefined;
  const teams = open.map((s) => getTeam(state.restrictions[s]?.teamId)?.name).filter(Boolean) as string[];
  return box(
    { height: ROW_H, alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' },
    ...slots.map((s) => token(state.picks[side][s], SLOTS[s], SIDE_COLOR[side], isBlind(state))),
    team && side === 0
      ? box(
          { position: 'absolute', right: 14, top: 0, height: ROW_H, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: 4 },
          ...teams.map((name) => txt(upper(fit(name, 17)), { fontSize: 18, fontWeight: 700, color: C.white, backgroundColor: 'rgba(6,19,12,0.6)', padding: '1px 8px', borderRadius: 6 })),
        )
      : null,
  );
}

const HALF_ROWS: number[][] = [[0], [1, 2], [3, 4], [5]]; // GOL · DEF DEF · MEI MEI · ATA

function pitch(state: MatchState): ReactElement {
  const mode = getMode(state.modeId)!;
  const [a, b] = totals(state);
  const finished = state.status === 'FINISHED';
  const pitchH = ROW_H * 8 + MID_H;
  const stripes = Array.from({ length: 8 }, (_, i) => {
    const color = i % 2 ? C.grassB : C.grassA;
    return `${color} ${i * 12.5}%, ${color} ${(i + 1) * 12.5}%`;
  }).join(', ');
  const hidden = isBlind(state);
  const best = mode.direction === 'high' ? Math.max(a, b) : Math.min(a, b);
  const scoreBox = (side: Side, total: number) =>
    box(
      { flexDirection: 'column', alignItems: side === 0 ? 'flex-start' : 'flex-end', flexGrow: 1, flexBasis: 0 },
      box(
        { alignItems: 'center', gap: 10 },
        box({ width: 18, height: 18, borderRadius: 9, backgroundColor: SIDE_COLOR[side] }),
        txt(upper(fit(firstName(state.players[side]!.name), 12)), { fontSize: 32, fontWeight: 700, letterSpacing: 1 }),
      ),
      txt(hidden ? '???' : formatNumber(total), {
        fontFamily: DISPLAY, fontSize: 92, lineHeight: 1.05,
        color: !hidden && a !== b && total === best ? C.lime : C.white,
      }),
    );
  const centerLabel = finished
    ? state.winner === 'draw'
      ? 'EMPATE'
      : `VITÓRIA DE ${upper(fit(firstName(state.players[state.winner as Side]!.name), 12))}`
    : `RODADA ${state.round + 1} DE ${SLOTS.length}`;

  return box(
    {
      width: W, height: H, flexDirection: 'column', backgroundColor: C.night, color: C.white, fontFamily: BODY,
      backgroundImage: 'linear-gradient(180deg, #0A2114 0%, #06130C 100%)', padding: '34px 36px 0 36px',
    },
    // Placar
    box(
      { alignItems: 'center', height: 190 },
      scoreBox(0, a),
      box(
        { flexDirection: 'column', alignItems: 'center', width: 330 },
        ball(46),
        txt(upper(mode.name), { fontFamily: DISPLAY, fontSize: mode.name.length > 12 ? 30 : 40, marginTop: 8, color: C.white, letterSpacing: 1 }),
        txt(hidden ? 'às cegas · revelação no fim' : `${mode.unit} · ${mode.direction === 'high' ? 'maior soma vence' : 'menor soma vence'}`, { fontSize: 22, color: hidden ? C.guest : C.muted, fontWeight: hidden ? 700 : 500 }),
      ),
      scoreBox(1, b),
    ),
    // Campo
    box(
      {
        position: 'relative', width: W - 72, height: pitchH + 8, borderRadius: 26, border: `4px solid ${C.line}`,
        backgroundImage: `linear-gradient(180deg, ${stripes})`, flexDirection: 'column', overflow: 'hidden',
      },
      // Marcações
      box({ position: 'absolute', left: 0, top: pitchH / 2 - 2, width: W - 80, height: 4, backgroundColor: C.line }),
      box({ position: 'absolute', left: (W - 80) / 2 - 300, top: -4, width: 600, height: 150, border: `4px solid ${C.line}` }),
      box({ position: 'absolute', left: (W - 80) / 2 - 300, top: pitchH - 142, width: 600, height: 150, border: `4px solid ${C.line}` }),
      ...HALF_ROWS.map((slots) => pitchRow(state, 0, slots)),
      box({ height: MID_H }),
      ...[...HALF_ROWS].reverse().map((slots) => pitchRow(state, 1, slots)),
      // Selo central
      box(
        { position: 'absolute', left: 0, top: pitchH / 2 - 27, width: W - 80, justifyContent: 'center' },
        txt(centerLabel, {
          fontFamily: DISPLAY, fontSize: 34, letterSpacing: 2, padding: '4px 30px', borderRadius: 999,
          backgroundColor: finished ? C.lime : C.night, color: finished ? C.ink : C.lime,
          border: `3px solid ${finished ? C.ink : C.lime}`,
        }),
      ),
    ),
    box(
      { justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 },
      txt('DUELO DE CRAQUES', { fontFamily: DISPLAY, fontSize: 24, color: C.lime, letterSpacing: 3 }),
      txt('Dados estimados por IA · podem ter pequenas diferenças', { fontSize: 20, color: C.muted, fontWeight: 500 }),
    ),
  );
}

// ---------- 5. Ranking do grupo ----------

function ranking(groupName: string, rows: RankingRow[], season?: number, since?: string, start = 1, more = false): ReactElement {
  const cell = (v: string | number, width: number, strong = false) =>
    txt(v, { width, justifyContent: 'center', fontSize: 34, fontWeight: strong ? 700 : 500, color: strong ? C.lime : C.white });
  const head = (v: string, width: number) => txt(v, { width, justifyContent: 'center', fontSize: 22, fontWeight: 700, color: C.muted, letterSpacing: 2 });
  // Até 7 linhas no tamanho grande; com 8 a 10 (o ranking mostra o top 10) tudo encolhe para caber.
  const many = rows.length > 7;
  // Destaque só para o líder (o 1º); no ranking B ninguém é líder.
  const leader = (i: number) => start === 1 && i === 0;
  const rowH = many ? 66 : 84;
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(), pill(upper(fit(groupName, 20)), C.panel, C.lime, 24)),
    txt(start > 1 ? 'RANKING B' : 'RANKING', { fontFamily: DISPLAY, fontSize: many ? 112 : 150, lineHeight: 1, marginTop: many ? 22 : 36, flexShrink: 0 }),
    txt(`${season ? `Temporada ${season}${since ? ` · desde ${since}` : ''} · ` : ''}${start > 1 ? `${start}º ao ${start + rows.length - 1}º · ` : ''}Vitória 3 pts · empate 1 pt`, { fontSize: 30, color: C.muted, fontWeight: 500, marginBottom: many ? 16 : 26, flexShrink: 0 }),
    // Colunas: J, V, E, D, PTS e aproveitamento (pontos ganhos sobre os possíveis).
    box(
      { padding: '0 24px', marginBottom: 8 },
      txt('', { width: 70 }), txt('', { flexGrow: 1 }),
      head('J', 76), head('V', 76), head('E', 76), head('D', 76), head('PTS', 100), head('APROV.', 116),
    ),
    box(
      { flexDirection: 'column', gap: many ? 8 : 10, flexGrow: 1 },
      ...rows.map((r, i) =>
        box(
          {
            alignItems: 'center', height: rowH, padding: '0 24px', borderRadius: 18, flexShrink: 0,
            backgroundColor: leader(i) ? 'rgba(200,255,62,0.14)' : C.panel,
            border: `2px solid ${leader(i) ? C.lime : C.panelLine}`,
          },
          txt(i + start, { width: 70, fontFamily: DISPLAY, fontSize: 40, color: leader(i) ? C.lime : C.muted }),
          txt(upper(fit(r.name, 16)), { flexGrow: 1, fontFamily: DISPLAY, fontSize: 36, letterSpacing: 1 }),
          cell(r.games, 76), cell(r.wins, 76), cell(r.draws, 76), cell(r.losses, 76), cell(r.wins * 3 + r.draws, 100, true),
          txt(aproveitamentoText(r), { width: 116, justifyContent: 'center', fontSize: 32, fontWeight: 700, color: C.white }),
        ),
      ),
    ),
    txt(start > 1 ? 'Mande RANKING para ver do 1º ao 10º' : more ? 'Mande RANKING B para ver do 11º ao 20º' : 'Mande INICIAR JOGO para subir na tabela', {
      fontSize: 30, fontWeight: 700, color: C.lime, justifyContent: 'center',
    }),
  );
}

export function buildImage(spec: ImageSpec): ReactElement {
  switch (spec.kind) {
    case 'challenge':
      return challenge(spec.host);
    case 'help':
      return helpMenu();
    case 'modes':
      return modesMenu();
    case 'kickoff':
      return kickoff(spec.state);
    case 'pitch':
      return pitch(spec.state);
    case 'ranking':
      return ranking(spec.groupName, spec.rows, spec.season, spec.since, spec.start, spec.more);
    case 'season':
      return seasonImage(spec);
    case 'partyLobby':
      return partyLobby(spec.state);
    case 'partyTable':
      return partyTable(spec.state);
    case 'top10Board':
      return top10Board(spec.state, spec.list, spec.final);
    case 'lineupQuiz':
      return lineupQuiz(spec.state, spec.lines);
    case 'partyScore':
      return partyScore(spec.state, spec.title, spec.final);
    case 'intrusoBoard':
      return intrusoBoard(spec.state, spec.reason, spec.reveal);
    case 'draftBoard':
      return draftBoard(spec.state);
    case 'flagQuiz':
      return flagQuiz(spec.state, spec.flag);
    case 'conexoesBoard':
      return conexoesBoard(spec.state, spec.reveal);
    case 'top100Board':
      return top100Board(spec.state, spec.final);
    case 'gradeBoard':
      return gradeBoard(spec.state, spec.final);
    case 'textBoard':
      return textBoard(spec.game, spec.title, spec.subtitle, spec.rows, spec.pill);
    case 'faceQuiz':
      return faceQuiz(spec);
    case 'cravadaRound':
      return cravadaRound(spec);
    case 'cravadaReveal':
      return cravadaReveal(spec);
    case 'cravadaThemes':
      return cravadaThemes();
  }
}
