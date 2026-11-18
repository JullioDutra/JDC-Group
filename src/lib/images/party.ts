import type { ReactElement } from 'react';
import { getMode } from '../game/modes';
import { getTeam } from '../game/teams';
import { firstName, formatNumber } from '../game/text';
import { EscalacaoParty, IntrusoParty, MelhorTimeParty, PartyState, QuizParty, SLOTS, Top10List, Top10Party } from '../game/types';
import { PARTY_CONFIG, standings } from '../party/engine';
import { ONE_X_ONE } from '../party/common';
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

const NEW_LOBBY: Partial<Record<PartyState['game'], { subtitle: string; rules: string[] }>> = {
  bandeira: {
    subtitle: `${PARTY_CONFIG.bandeira.rounds} bandeiras · América do Sul, Europa e mundo`,
    rules: ['O bot desenha uma bandeira (sem brasões nem estrelas).', '1 palpite por pessoa em cada rodada. Repetido não vale.', 'O primeiro que acertar o país leva 100 pontos.'],
  },
  sobrevivente: {
    subtitle: `Até ${PARTY_CONFIG.sobrevivente.rounds} categorias · 2 vidas`,
    rules: ['Uma categoria por volta. Na ordem da sala, cada um diz 1 item novo.', `Errou, repetiu ou passou de ${PARTY_CONFIG.sobrevivente.seconds}s: perde uma vida.`, 'O último de pé vence.'],
  },
  conexoes: {
    subtitle: `${PARTY_CONFIG.conexoes.rounds} tabuleiros · 16 nomes, 4 grupos`,
    rules: ['Ache 4 nomes com algo em comum e mande os números.', 'Grupo achado vale pontos; o mais difícil vale mais.', 'Cada um tem 3 erros por tabuleiro.'],
  },
  stop: {
    subtitle: `${PARTY_CONFIG.stop.rounds} rodadas · letra + 5 categorias`,
    rules: ['Mande as 5 respostas numa mensagem só, separadas por vírgula.', 'Quem manda primeiro encurta o tempo dos outros.', 'Resposta igual à de quem mandou antes vale zero.'],
  },
  draft: {
    subtitle: '5 rodadas em serpente · o grupo vota',
    rules: ['Na sua vez, escolha um jogador do clube ou seleção da rodada.', 'A ordem inverte a cada rodada. Ninguém repete jogador.', 'No fim, o grupo vota no melhor time.'],
  },
  linha: {
    subtitle: `${PARTY_CONFIG.linha.rounds} rodadas · 4 acontecimentos`,
    rules: ['Ponha os 4 acontecimentos em ordem: do mais antigo ao mais recente.', 'Mande as letras: CADB. 1 resposta por pessoa.', 'Pontos por posição certa; acertou tudo, bônus.'],
  },
  carreira: {
    subtitle: `${PARTY_CONFIG.carreira.rounds} carreiras · gerado da base de jogadores`,
    rules: ['O bot mostra a trajetória de clubes de um jogador.', 'A cada 25s sai uma dica extra. 1 palpite por pessoa a cada dica.', 'O primeiro que acertar leva: quanto antes, mais pontos.'],
  },
  ponte: {
    subtitle: `${PARTY_CONFIG.ponte.rounds} rodadas · 4 clubes por rodada`,
    rules: ['Cite quem passou pelos 4 clubes da rodada.', 'Passou pelos 4: 10 pts · por 3: 6 · por 2: 3 · por 1: 1.', 'Vale a sua melhor resposta. Ninguém repete jogador.'],
  },
  grade: {
    subtitle: 'Jogo da velha · clubes x seleções',
    rules: ['Linhas são clubes; colunas são seleções.', 'Na sua vez: casa + jogador que cumpra as duas (A2 Neymar).', 'Errou: perde a vez. 3 em linha vence.'],
  },
  penaltis: {
    subtitle: '5 cobranças para cada · morte súbita',
    rules: ['Cada cobrança tem uma regra: posição + clube ou seleção.', 'Jogador que cumpre a regra: gol. Não cumpre: defendeu.', 'Empate depois das 5: morte súbita.'],
  },
  fato: {
    subtitle: `${PARTY_CONFIG.fato.rounds} afirmações`,
    rules: ['Uma afirmação por rodada: é fato ou fake?', '1 resposta por pessoa. O primeiro a acertar ganha bônus.', 'Na revelação, o bot explica o porquê.'],
  },
};

export function partyLobby(state: PartyState): ReactElement {
  const cfg = PARTY_CONFIG[state.game];
  const oneXOne = ONE_X_ONE.includes(state.game);
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
    const labels: Record<string, string> = { futebol: 'Futebol', geral: 'Conhecimentos gerais', politica: 'Política', historia: 'História', anime: 'Animes' };
    subtitle = state.category ? `Categoria: ${labels[state.category] ?? state.category}` : 'Categoria: sorteada na hora';
    rules = [
      'Acerte itens do ranking para revelar a posição.',
      'Ninguém responde duas vezes seguidas: espere outra pessoa.',
      'Vence quem acertar mais posições.',
    ];
  } else if (state.game === 'melhortime') {
    subtitle = `1 x 1 · 6 clubes sorteados · juiz: ${state.judge === 'ia' ? 'IA' : 'votação do grupo'}`;
    rules = [
      'A cada rodada sai um clube: escolha um jogador que passou por ele.',
      'Diga a posição junto: "atacante Fulano". A ordem é livre.',
      state.judge === 'ia' ? 'No fim, a IA decide o melhor time.' : 'No fim, quem não jogou vota no melhor time.',
    ];
  } else if (state.game === 'intruso') {
    subtitle = `${PARTY_CONFIG.intruso.rounds} rodadas · 5 nomes, 1 intruso`;
    rules = [
      'Marque com X quem pertence ao grupo (mande a letra).',
      'Ninguém marca duas vezes seguidas. O que sobrar é o intruso.',
      'No fim: certo ou errado em cada X e a justificativa.',
    ];
  } else if (NEW_LOBBY[state.game]) {
    const info = NEW_LOBBY[state.game]!;
    const catLabel: Record<string, string> = { futebol: 'futebol', geral: 'conhecimentos gerais', historia: 'história', politica: 'política', anime: 'animes' };
    const cat = 'category' in state && state.category ? ` · ${catLabel[state.category] ?? state.category}` : '';
    subtitle = `${info.subtitle}${cat}`;
    rules = info.rules;
  } else {
    const q = PARTY_CONFIG[state.game];
    const catLabel: Record<string, string> = { futebol: 'futebol', geral: 'conhecimentos gerais', historia: 'história', politica: 'política', anime: 'animes' };
    const cat = 'category' in state && state.category ? ` · ${catLabel[state.category] ?? state.category}` : '';
    subtitle =
      state.game === 'quetime'
        ? `${q.rounds} escalações históricas`
        : state.game === 'quemeh'
          ? `${q.rounds} personagens misteriosos${cat}`
          : `${q.rounds} rodadas${cat}`;
    rules =
      state.game === 'alfabeto'
        ? ['Cada rodada: clube ou seleção + letra ("Flamengo com R").', '1 jogador por pessoa. Nome já usado não vale.', 'Quem responde primeiro ganha bônus.']
        : state.game === 'chute'
          ? ['Pergunta com resposta em número.', '1 número por pessoa, diferente dos já ditos.', 'O mais perto ganha; cravou leva bônus.']
          : state.game === 'emoji'
        ? ['O bot manda emojis: adivinhe o clube, jogador, filme ou anime.', '1 palpite por pessoa em cada rodada. Repetido não vale.', 'O primeiro que acertar leva 100 pontos.']
        : state.game === 'relampago'
          ? ['Perguntas de resposta curta, uma por rodada.', '1 palpite por pessoa em cada rodada. Repetido não vale.', 'O primeiro que acertar leva 100 pontos.']
          : 
      state.game === 'quetime'
        ? ['Veja a escalação e diga o time e o ano: "Brasil 94".', '1 palpite por pessoa em cada rodada. Palpite repetido não vale.', 'Time e ano: 150 pontos. Só o time: 60.']
        : ['O bot solta até 5 dicas sobre um craque.', '1 palpite por pessoa em cada rodada. Palpite repetido não vale.', 'Acertou na 1ª dica: 150 pontos. Na 5ª: 30.'];
  }
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(), pill(`ATÉ ${cfg.maxPlayers} JOGADORES`, C.panel, C.lime, 24)),
    box(
      { flexDirection: 'column', marginTop: 44 },
      txt(oneXOne ? 'DESAFIO 1 X 1' : 'SALA ABERTA', { fontSize: 30, fontWeight: 700, letterSpacing: 6, color: C.lime }),
      // Acento em maiúscula (PÊNALTIS) precisa de mais altura para não encostar no rótulo.
      txt(upper(cfg.name), { fontFamily: DISPLAY, fontSize: cfg.name.length > 10 ? 116 : 160, lineHeight: /[ÂÊÔÁÉÍÓÚÃÕ]/.test(upper(cfg.name)) ? 1.35 : 1.15 }),
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
        txt(oneXOne ? 'Desafio 1 x 1' : cfg.joinUntil === 0 ? 'Ninguém entra depois de começar' : `Dá para entrar até ${state.game === 'top10' ? `a ${cfg.joinUntil}ª posição revelada` : `a ${cfg.joinUntil}ª rodada`}`, { fontSize: 28, color: C.muted, fontWeight: 500 }),
        txt(oneXOne ? 'Começa assim que alguém aceitar' : 'O anfitrião manda COMEÇAR', { fontSize: 28, color: C.white, fontWeight: 700 }),
      ),
      txt(oneXOne ? 'ACEITAR' : 'ENTRAR', {
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

// ---------- Intruso ----------

const INTRUSO_LETTERS = ['A', 'B', 'C', 'D', 'E'];
const RED = '#F87171';

export function intrusoBoard(state: IntrusoParty, reason: string, reveal: boolean): ReactElement {
  const rowH = reveal ? 118 : 138;
  return stage(
    box(
      { justifyContent: 'space-between', alignItems: 'center' },
      brand(0.75),
      pill(reveal ? 'REVELAÇÃO' : `RODADA ${state.round + 1} DE ${state.totalRounds}`, reveal ? C.lime : C.panel, reveal ? C.ink : C.lime, 24),
    ),
    txt('QUEM É O INTRUSO?', { fontFamily: DISPLAY, fontSize: 80, lineHeight: 1.1, marginTop: 18 }),
    txt(reveal ? 'Cada X: certo ou errado' : 'Marque com X quem pertence ao grupo', { fontSize: 30, color: C.muted, fontWeight: 500, marginBottom: 20 }),
    box(
      { flexDirection: 'column', gap: 12 },
      ...state.options.map((name, i) => {
        const mark = state.marks.find((m) => m.index === i);
        const isIntruder = i === state.intruderIndex;
        let border = C.panelLine;
        let tag: ReactElement | null = null;
        if (reveal && isIntruder) {
          border = C.lime;
          tag = pill(mark ? 'INTRUSO · X ERRADO' : 'INTRUSO', mark ? RED : C.lime, C.ink, 22);
        } else if (reveal && mark) {
          border = '#34D399';
          tag = pill('X CERTO', '#34D399', C.ink, 22);
        }
        return box(
          {
            alignItems: 'center', height: rowH, padding: '0 24px', borderRadius: 18, gap: 20,
            backgroundColor: reveal && isIntruder ? 'rgba(200,255,62,0.12)' : C.panel, border: `3px solid ${border}`,
          },
          txt(INTRUSO_LETTERS[i], {
            width: 64, height: 64, borderRadius: 16, flexShrink: 0, alignItems: 'center', justifyContent: 'center',
            fontFamily: DISPLAY, fontSize: 36, color: C.ink, backgroundColor: mark ? 'rgba(255,255,255,0.35)' : C.lime,
          }),
          box(
            { flexGrow: 1, flexDirection: 'column', position: 'relative' },
            txt(name, {
              fontFamily: DISPLAY, fontSize: 46, letterSpacing: 0.5,
              color: mark && !(reveal && isIntruder) ? 'rgba(255,255,255,0.45)' : C.white,
              textDecoration: mark ? 'line-through' : 'none',
            }),
            ...(mark ? [txt(`X de ${firstName(mark.name)}`, { fontSize: 22, fontWeight: 700, color: colorOf(state, mark.jid) })] : []),
          ),
          ...(mark
            ? [txt('X', { fontFamily: DISPLAY, fontSize: 64, color: reveal ? (isIntruder ? RED : '#34D399') : C.white, width: 60, justifyContent: 'center' })]
            : []),
          ...(tag ? [tag] : []),
        );
      }),
    ),
    reveal
      ? box(
          {
            flexDirection: 'column', marginTop: 22, flexGrow: 1, backgroundColor: C.panel, borderRadius: 20,
            border: `2px solid ${C.panelLine}`, padding: '20px 26px',
          },
          txt('POR QUÊ', { fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.lime }),
          txt(reason, { fontSize: 30, fontWeight: 500, lineHeight: 1.25, marginTop: 8 }),
        )
      : box(
          { flexGrow: 1, alignItems: 'flex-end', justifyContent: 'space-between' },
          txt('Mande a letra · ninguém marca 2 vezes seguidas', { fontSize: 28, fontWeight: 700, color: C.lime }),
          txt(`${state.marks.length}/4 X`, { fontSize: 28, color: C.muted, fontWeight: 700 }),
        ),
  );
}

// ---------- Melhor Time ----------

export function draftBoard(state: MelhorTimeParty): ReactElement {
  const [a, b] = state.players;
  const v = state.verdict;
  const finished = state.status === 'FINISHED';
  const rowH = 118;
  const status = finished ? 'RESULTADO' : state.phase === 'voting' ? 'VOTAÇÃO' : `RODADA ${state.round + 1} DE 6`;
  const cell = (jid: string | undefined, i: number, align: 'flex-start' | 'flex-end') => {
    const pick = jid ? state.picks[jid]?.[i] : null;
    const empty = !pick || pick.name === '—';
    return box(
      { flexDirection: 'column', alignItems: align, width: 380 },
      txt(pick ? fit(pick.name, 20) : '—', { fontFamily: DISPLAY, fontSize: 34, color: empty ? C.muted : C.white }),
      txt(pick && !empty ? pick.club : pick ? 'vaga vazia' : ' ', { fontSize: 20, color: C.muted, fontWeight: 500 }),
    );
  };
  const nameTag = (i: 0 | 1) => {
    const p = state.players[i];
    const won = finished && v && v.winner === i;
    return box(
      { flexDirection: 'column', alignItems: i === 0 ? 'flex-start' : 'flex-end', width: 380 },
      txt(`${i + 1} · ${upper(fit(firstName(p?.name ?? ''), 12))}`, { fontFamily: DISPLAY, fontSize: 44, color: won ? C.lime : colorOf(state, p?.jid ?? '') }),
      ...(won ? [txt('MELHOR TIME', { fontSize: 20, fontWeight: 700, letterSpacing: 2, color: C.lime })] : []),
    );
  };
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill(status, finished ? C.lime : C.panel, finished ? C.ink : C.lime, 24)),
    txt('MELHOR TIME', { fontFamily: DISPLAY, fontSize: 80, lineHeight: 1.1, marginTop: 14 }),
    txt(state.judge === 'ia' ? 'Quem decide: a IA' : 'Quem decide: o grupo (quem não jogou)', { fontSize: 28, color: C.muted, fontWeight: 500, marginBottom: 18 }),
    box({ justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px', marginBottom: 10 }, nameTag(0), nameTag(1)),
    box(
      { flexDirection: 'column', gap: 8 },
      ...SLOTS.map((slot, i) =>
        box(
          {
            height: rowH, alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderRadius: 16,
            backgroundColor: C.panel, border: `2px solid ${C.panelLine}`,
          },
          cell(a?.jid, i, 'flex-start'),
          txt(slot, {
            width: 92, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            fontFamily: DISPLAY, fontSize: 26, color: C.ink, backgroundColor: C.lime,
          }),
          cell(b?.jid, i, 'flex-end'),
        ),
      ),
    ),
    finished && v
      ? box(
          { flexDirection: 'column', marginTop: 16, flexGrow: 1, backgroundColor: C.panel, borderRadius: 18, border: `2px solid ${C.lime}`, padding: '16px 22px' },
          txt(v.winner === 'draw' ? 'EMPATE' : `VENCEU: ${upper(state.players[v.winner].name)}`, { fontFamily: DISPLAY, fontSize: 34, color: C.lime }),
          txt(v.reason, { fontSize: 26, fontWeight: 500, lineHeight: 1.2, marginTop: 6 }),
        )
      : box(
          { flexGrow: 1, alignItems: 'flex-end', justifyContent: 'center' },
          txt(
            state.phase === 'voting'
              ? 'Quem não jogou: mande 1 ou 2'
              : `Clube da rodada: ${getTeam(state.clubs[state.round])?.name ?? ''}`,
            { fontSize: 32, fontWeight: 700, color: C.lime },
          ),
        ),
  );
}
