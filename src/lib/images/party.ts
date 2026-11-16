import type { ReactElement } from 'react';
import { getMode } from '../game/modes';
import { getTeam } from '../game/teams';
import { firstName, formatNumber } from '../game/text';
import { EscalacaoParty, PartyState, QuizParty, SLOTS, Top10List, Top10Party } from '../game/types';
import { PARTY_CONFIG, standings } from '../party/engine';
import { BODY, C, DISPLAY, H, W, box, brand, fit, pill, stage, txt } from './theme';

/** Imagens do Modo em Grupo: sala aberta, tabela da Escalação e quadro do Top 10. */

const upper = (s: string) => s.toLocaleUpperCase('pt-BR');

/** Uma cor por jogador, na ordem de entrada (até 15). */
export const PLAYER_COLORS = [
  '#38BDF8', '#FF8A3D', '#C084FC', '#F472B6', '#FACC15', '#34D399', '#F87171', '#60A5FA',
  '#A3E635', '#FB923C', '#2DD4BF', '#E879F9', '#FDE047', '#93C5FD', '#FCA5A5',
];

function colorOf(state: PartyState, jid: string): string {
  const i = state.players.findIndex((p) => p.jid === jid);
  return PLAYER_COLORS[(i < 0 ? 0 : i) % PLAYER_COLORS.length];
}

// ---------- Sala aberta ----------

export function partyLobby(state: PartyState): ReactElement {
  const cfg = PARTY_CONFIG[state.game];
  const mode = state.game === 'escalacao' ? getMode(state.modeId) : undefined;
  let subtitle: string;
  let rules: string[];
  if (state.game === 'escalacao') {
    subtitle = mode ? `Tema: ${mode.name} · ${mode.tagline.split(' · ')[0]}` : 'Tema: o anfitrião escolhe (ou sorteia)';
    rules = [
      'Todos escalam a mesma posição ao mesmo tempo: GOL, 2 DEF, 2 MEI, 1 ATA.',
      '1 jogador por pessoa em cada rodada. Nome já usado não vale.',
      'Vence a melhor soma no tema.',
    ];
  } else if (state.game === 'top10') {
    subtitle = state.category
      ? `Categoria: ${state.category === 'futebol' ? 'Futebol' : 'Conhecimentos gerais'}`
      : 'Categoria: sorteada na hora';
    rules = [
      'Acerte itens do ranking para revelar a posição.',
      'Ninguém responde duas vezes seguidas: espere outra pessoa.',
      'Vence quem acertar mais posições.',
    ];
  } else {
    const q = PARTY_CONFIG[state.game];
    subtitle = state.game === 'quetime' ? `${q.rounds} escalações históricas` : `${q.rounds} craques misteriosos`;
    rules =
      state.game === 'quetime'
        ? ['Veja a escalação e diga o time e o ano: "Brasil 94".', '1 palpite por pessoa em cada rodada. Palpite repetido não vale.', 'Time e ano: 150 pontos. Só o time: 60.']
        : ['O bot solta até 5 dicas sobre um craque.', '1 palpite por pessoa em cada rodada. Palpite repetido não vale.', 'Acertou na 1ª dica: 150 pontos. Na 5ª: 30.'];
  }
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(), pill(`ATÉ ${cfg.maxPlayers} JOGADORES`, C.panel, C.lime, 24)),
    box(
      { flexDirection: 'column', marginTop: 44 },
      txt('SALA ABERTA', { fontSize: 30, fontWeight: 700, letterSpacing: 6, color: C.lime }),
      txt(upper(cfg.name), { fontFamily: DISPLAY, fontSize: cfg.name.length > 10 ? 116 : 160, lineHeight: 1.15 }),
      txt(subtitle, { fontSize: 34, color: C.muted, fontWeight: 500, marginTop: 10 }),
    ),
    box(
      { flexDirection: 'column', gap: 16, marginTop: 40 },
      ...rules.map((rule, i) =>
        box(
          { alignItems: 'center', gap: 20 },
          txt(i + 1, {
            width: 52, height: 52, borderRadius: 26, border: `3px solid ${C.lime}`, color: C.lime, flexShrink: 0,
            fontFamily: DISPLAY, fontSize: 28, alignItems: 'center', justifyContent: 'center',
          }),
          txt(rule, { fontSize: 34, fontWeight: 500, lineHeight: 1.15, width: 880 }),
        ),
      ),
    ),
    box(
      {
        flexDirection: 'column', marginTop: 40, flexGrow: 1, backgroundColor: C.panel, borderRadius: 24,
        border: `2px solid ${C.panelLine}`, padding: '24px 30px',
      },
      txt(`JOGADORES (${state.players.length}/${cfg.maxPlayers})`, { fontSize: 24, fontWeight: 700, letterSpacing: 3, color: C.muted }),
      box(
        { flexWrap: 'wrap', gap: 12, marginTop: 16 },
        ...state.players.map((p) =>
          txt(fit(p.name, 16), {
            fontSize: 28, fontWeight: 700, color: C.ink, backgroundColor: colorOf(state, p.jid),
            padding: '6px 16px', borderRadius: 12,
          }),
        ),
      ),
    ),
    box(
      { marginTop: 28, justifyContent: 'space-between', alignItems: 'center' },
      box(
        { flexDirection: 'column' },
        txt(`Dá para entrar até ${state.game === 'top10' ? `a ${cfg.joinUntil}ª posição revelada` : `a ${cfg.joinUntil}ª rodada`}`, { fontSize: 28, color: C.muted, fontWeight: 500 }),
        txt('O anfitrião manda COMEÇAR', { fontSize: 28, color: C.white, fontWeight: 700 }),
      ),
      txt('ENTRAR', {
        fontFamily: DISPLAY, fontSize: 56, color: C.ink, backgroundColor: C.lime, padding: '10px 40px', borderRadius: 20, letterSpacing: 2,
      }),
    ),
  );
}

// ---------- Tabela da Escalação em Grupo ----------

const SLOT_SHORT = ['GOL', 'DEF', 'DEF', 'MEI', 'MEI', 'ATA'];

export function partyTable(state: EscalacaoParty): ReactElement {
  const mode = getMode(state.modeId);
  const finished = state.status === 'FINISHED';
  const hidden = Boolean(state.options.blind) && !finished;
  const rows = finished ? standings(state).map((r) => r.player) : state.players;
  const rowH = Math.min(96, Math.floor(860 / Math.max(rows.length, 1)));
  const nameW = 210;
  const cellW = 116;
  const totalW = 132;

  const header = box(
    { alignItems: 'center', height: 64, padding: '0 16px' },
    txt('', { width: nameW }),
    ...SLOTS.map((_, i) => {
      const team = getTeam(state.restrictions[i]?.teamId);
      const current = !finished && i === state.round;
      return box(
        { width: cellW, flexDirection: 'column', alignItems: 'center' },
        txt(SLOT_SHORT[i], { fontFamily: DISPLAY, fontSize: 26, color: current ? C.lime : C.white }),
        txt(team ? fit(team.name, 11) : ' ', { fontSize: 15, color: C.muted, fontWeight: 700 }),
      );
    }),
    txt('TOTAL', { width: totalW, justifyContent: 'center', fontFamily: DISPLAY, fontSize: 26, color: C.lime }),
  );

  const body = rows.map((p, idx) => {
    const picks = state.picks[p.jid] ?? [];
    const total = picks.reduce((a, x) => a + (x?.value ?? 0), 0);
    const leader = finished && idx === 0;
    return box(
      {
        alignItems: 'center', height: rowH, padding: '0 16px', borderRadius: 14,
        backgroundColor: leader ? 'rgba(200,255,62,0.14)' : idx % 2 ? 'rgba(255,255,255,0.03)' : C.panel,
        border: `2px solid ${leader ? C.lime : 'transparent'}`,
      },
      box(
        { width: nameW, alignItems: 'center', gap: 10 },
        box({ width: 14, height: 14, borderRadius: 7, backgroundColor: colorOf(state, p.jid), flexShrink: 0 }),
        txt(fit(upper(finished ? `${idx + 1} · ${firstName(p.name)}` : firstName(p.name)), 14), { fontFamily: DISPLAY, fontSize: 26 }),
      ),
      ...SLOTS.map((_, i) => {
        const pick = picks[i];
        const empty = !pick;
        const missed = pick && (pick.key.startsWith('none-') || pick.key.startsWith('late-'));
        return box(
          { width: cellW, flexDirection: 'column', alignItems: 'center' },
          txt(empty ? '—' : hidden ? '?' : formatNumber(pick!.value), {
            fontFamily: DISPLAY, fontSize: 28, color: empty || missed ? C.muted : C.white,
          }),
          txt(empty ? ' ' : fit(missed ? '—' : pick!.name, 12), { fontSize: 15, color: C.muted, fontWeight: 500 }),
        );
      }),
      txt(hidden ? '???' : formatNumber(total), {
        width: totalW, justifyContent: 'center', fontFamily: DISPLAY, fontSize: 34, color: leader ? C.lime : C.white,
      }),
    );
  });

  const title = finished ? 'RESULTADO FINAL' : `RODADA ${Math.min(state.round + 1, SLOTS.length)} DE ${SLOTS.length}`;
  return box(
    {
      width: W, height: H, flexDirection: 'column', backgroundColor: C.night, color: C.white, fontFamily: BODY,
      backgroundImage: 'linear-gradient(180deg, #0A2114 0%, #06130C 100%)', padding: '40px 40px 30px 40px',
    },
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill(title, finished ? C.lime : C.panel, finished ? C.ink : C.lime, 24)),
    box(
      { flexDirection: 'column', marginTop: 20, marginBottom: 16 },
      txt(upper(mode?.name ?? 'Escalação em Grupo'), { fontFamily: DISPLAY, fontSize: 64, lineHeight: 1.05 }),
      txt(
        hidden
          ? 'Às cegas: números revelados no fim'
          : `${mode?.tagline.split(' · ')[0] ?? ''} · ${mode?.direction === 'low' ? 'menor' : 'maior'} soma vence`,
        { fontSize: 28, color: hidden ? C.guest : C.muted, fontWeight: 500 },
      ),
    ),
    header,
    box({ flexDirection: 'column', gap: 6, flexGrow: 1 }, ...body),
    txt('1 jogador por pessoa em cada rodada · nome já usado não vale', { fontSize: 22, color: C.muted, fontWeight: 500, justifyContent: 'center', marginTop: 10 }),
  );
}

// ---------- Quadro do Top 10 ----------

export function top10Board(state: Top10Party, list: Top10List, final: boolean): ReactElement {
  const n = list.items.length;
  const rowH = Math.min(92, Math.floor(880 / n));
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill(final ? 'RESULTADO FINAL' : `TOP ${n}`, final ? C.lime : C.panel, final ? C.ink : C.lime, 24)),
    txt(list.title, { fontFamily: DISPLAY, fontSize: list.title.length > 44 ? 50 : 60, lineHeight: 1.08, marginTop: 22, marginBottom: 20 }),
    box(
      { flexDirection: 'column', gap: 8, flexGrow: 1 },
      ...list.items.map((item, i) => {
        const hit = state.found[i];
        const shown = Boolean(hit) || final;
        return box(
          {
            alignItems: 'center', height: rowH, padding: '0 20px', borderRadius: 16, gap: 18,
            backgroundColor: hit ? 'rgba(200,255,62,0.10)' : C.panel,
            border: `2px solid ${hit ? colorOf(state, hit.jid) : C.panelLine}`,
          },
          txt(item.rank, {
            width: 56, height: 56, borderRadius: 28, flexShrink: 0, alignItems: 'center', justifyContent: 'center',
            fontFamily: DISPLAY, fontSize: 30, color: hit ? C.ink : C.muted,
            backgroundColor: hit ? C.lime : 'rgba(255,255,255,0.06)',
          }),
          txt(shown ? item.name : '? ? ?', {
            flexGrow: 1, fontFamily: DISPLAY, fontSize: 36, letterSpacing: shown ? 0.5 : 6,
            color: hit ? C.white : shown ? C.muted : 'rgba(255,255,255,0.35)',
          }),
          ...(shown && item.detail ? [txt(item.detail, { fontSize: 24, color: C.muted, fontWeight: 500 })] : []),
          ...(hit
            ? [txt(fit(firstName(hit.name), 12), {
                fontSize: 24, fontWeight: 700, color: C.ink, backgroundColor: colorOf(state, hit.jid), padding: '2px 12px', borderRadius: 10,
              })]
            : []),
        );
      }),
    ),
    txt(`Fonte: ${list.source}`, { fontSize: 20, color: C.muted, fontWeight: 500, marginTop: 14 }),
  );
}

// ---------- Que time é esse? ----------

export function lineupQuiz(state: QuizParty, lines: string[][]): ReactElement {
  // Ataque em cima, goleiro embaixo, como na TV.
  const rows = [...lines].reverse();
  const pitchH = 900;
  const rowH = Math.floor(pitchH / rows.length);
  const stripes = Array.from({ length: 8 }, (_, i) => {
    const color = i % 2 ? C.grassB : C.grassA;
    return `${color} ${i * 12.5}%, ${color} ${(i + 1) * 12.5}%`;
  }).join(', ');
  return stage(
    box(
      { justifyContent: 'space-between', alignItems: 'center' },
      brand(0.75),
      pill(`RODADA ${state.round + 1} DE ${state.totalRounds}`, C.panel, C.lime, 24),
    ),
    txt('QUE TIME É ESSE?', { fontFamily: DISPLAY, fontSize: 84, lineHeight: 1.1, marginTop: 18, marginBottom: 18 }),
    box(
      {
        flexDirection: 'column', height: pitchH, borderRadius: 26, border: `4px solid ${C.line}`, overflow: 'hidden',
        backgroundImage: `linear-gradient(180deg, ${stripes})`,
      },
      ...rows.map((names) =>
        box(
          { height: rowH, alignItems: 'center', justifyContent: 'space-around', padding: '0 10px' },
          ...names.map((n) =>
            txt(fit(n, 16), {
              fontFamily: DISPLAY, fontSize: names.length >= 5 ? 30 : 36, color: C.white, letterSpacing: 0.5,
              backgroundColor: 'rgba(6,19,12,0.82)', padding: '6px 16px', borderRadius: 12,
            }),
          ),
        ),
      ),
    ),
    box(
      { justifyContent: 'space-between', alignItems: 'center', marginTop: 22 },
      txt('Mande time e ano · ex.: Brasil 94', { fontSize: 30, fontWeight: 700, color: C.lime }),
      txt('1 palpite por pessoa', { fontSize: 26, color: C.muted, fontWeight: 500 }),
    ),
  );
}

// ---------- Placar dos quizzes ----------

export function partyScore(state: PartyState, title: string, final: boolean): ReactElement {
  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.lastHitAt - b.lastHitAt);
  const top = Math.max(1, ranked[0]?.score ?? 1);
  const rowH = Math.min(84, Math.floor(860 / Math.max(ranked.length, 1)));
  const cfg = PARTY_CONFIG[state.game];
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill(upper(cfg.name), final ? C.lime : C.panel, final ? C.ink : C.lime, 24)),
    txt(upper(title), { fontFamily: DISPLAY, fontSize: 76, lineHeight: 1.08, marginTop: 22, marginBottom: 22 }),
    box(
      { flexDirection: 'column', gap: 8, flexGrow: 1 },
      ...ranked.map((p, i) => {
        const lead = i === 0 && p.score > 0;
        return box(
          {
            alignItems: 'center', height: rowH, padding: '0 20px', borderRadius: 16, gap: 18, position: 'relative',
            backgroundColor: C.panel, border: `2px solid ${lead ? C.lime : C.panelLine}`, overflow: 'hidden',
          },
          box({
            position: 'absolute', left: 0, top: 0, height: rowH, width: `${Math.round((p.score / top) * 100)}%`,
            backgroundColor: lead ? 'rgba(200,255,62,0.16)' : 'rgba(255,255,255,0.05)',
          }),
          txt(i + 1, {
            width: 48, height: 48, borderRadius: 24, flexShrink: 0, alignItems: 'center', justifyContent: 'center',
            fontFamily: DISPLAY, fontSize: 26, color: lead ? C.ink : C.white, backgroundColor: lead ? C.lime : 'rgba(255,255,255,0.08)',
          }),
          box({ width: 14, height: 14, borderRadius: 7, backgroundColor: colorOf(state, p.jid), flexShrink: 0 }),
          txt(upper(fit(firstName(p.name), 16)), { flexGrow: 1, fontFamily: DISPLAY, fontSize: 34 }),
          txt(`${p.score}`, { fontFamily: DISPLAY, fontSize: 40, color: lead ? C.lime : C.white }),
          txt('pts', { fontSize: 22, color: C.muted, fontWeight: 700 }),
        );
      }),
    ),
    txt('1 palpite por pessoa em cada rodada · palpite repetido não vale', { fontSize: 22, color: C.muted, fontWeight: 500, justifyContent: 'center', marginTop: 12 }),
  );
}
