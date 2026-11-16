import { firstName, looksLikePlayerName, normalize } from '../game/text';
import type { AlfabetoParty, ChuteParty, IncomingMessage, IntrusoParty, Outgoing, PartyPlayer, QuizParty } from '../game/types';
import {
  PARTY_CONFIG,
  PartyDeps,
  Save,
  activePlayers,
  answerMatches,
  normalizeAnswer,
  pendingResults,
  react,
  schedule,
  text,
} from './common';
import { LINEUPS, Lineup, getLineup } from './content/lineups';
import { WHOIS, getWhoIs } from './content/whois';
import { CARDS, getCard } from './content/cards';
import type { ContentCategory } from '../game/types';

/**
 * "Que time é esse?" e "Quem é?": quiz em rodadas, no formato corrida.
 * - 1 tentativa por jogador por rodada (errar gasta a tentativa);
 * - palpite igual a um já dito é recusado e NÃO gasta a tentativa;
 * - a rodada acaba quando alguém acerta tudo, quando todos tentaram ou no prazo.
 */

/** Quem é?: pontos conforme a dica em que acertou (1ª dica vale mais). */
export const WHOIS_POINTS = [150, 120, 90, 60, 30];

/** Que time é esse?: time e ano exatos / só o time. */
export const QUETIME_POINTS = { full: 150, teamOnly: 60 };

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Emoji e Quiz Relâmpago: 1 pergunta por rodada, o primeiro que acertar leva. */
export const CARD_POINTS = 100;

const isCardGame = (game: QuizParty['game']): game is 'emoji' | 'relampago' => game === 'emoji' || game === 'relampago';

export function newQuiz(
  game: QuizParty['game'],
  category: ContentCategory | null = null,
): Pick<QuizParty, 'game' | 'category' | 'round' | 'totalRounds' | 'order' | 'clue' | 'attempts' | 'guesses' | 'solved' | 'roundHits'> {
  return {
    game,
    category,
    round: -1,
    totalRounds: PARTY_CONFIG[game].rounds!,
    order: [],
    clue: 0,
    attempts: [],
    guesses: [],
    solved: false,
    roundHits: [],
  };
}

export function quizRules(state: QuizParty): string[] {
  if (state.game === 'emoji') {
    return [
      'O bot manda emojis: adivinhe o clube, jogador, filme ou anime.',
      `1 palpite por pessoa em cada rodada. O primeiro que acertar leva ${CARD_POINTS}.`,
      'Palpite igual a um já dito não vale. Vence quem somar mais pontos.',
    ];
  }
  if (state.game === 'relampago') {
    return [
      'Perguntas de resposta curta, uma por rodada.',
      `1 palpite por pessoa em cada rodada. O primeiro que acertar leva ${CARD_POINTS}.`,
      'Palpite igual a um já dito não vale. Vence quem somar mais pontos.',
    ];
  }
  if (state.game === 'quetime') {
    return [
      'O bot mostra uma escalação histórica. Diga o time e o ano: *Brasil 94*.',
      `1 palpite por pessoa em cada rodada. Time e ano certos: ${QUETIME_POINTS.full} pontos; só o time: ${QUETIME_POINTS.teamOnly}.`,
      'Palpite igual a um já dito não vale. Vence quem somar mais pontos.',
    ];
  }
  return [
    'O bot vai soltando dicas sobre um craque misterioso.',
    `1 palpite por pessoa em cada rodada. Acertar na 1ª dica vale ${WHOIS_POINTS[0]}; na 5ª, ${WHOIS_POINTS[4]}.`,
    'Palpite igual a um já dito não vale. Vence quem somar mais pontos.',
  ];
}

export function startQuiz(state: QuizParty, deps: PartyDeps): Outgoing[] {
  // Sem categoria escolhida, política fica de fora (só entra quando pedida).
  const fits = (category: ContentCategory | undefined) =>
    state.category ? (category ?? 'futebol') === state.category : (category ?? 'futebol') !== 'politica';
  const pool =
    state.game === 'quetime'
      ? LINEUPS.map((l) => l.id)
      : state.game === 'quemeh'
        ? WHOIS.filter((c) => fits(c.category)).map((c) => c.id)
        : CARDS[state.game].filter((c) => (state.category ? c.category === state.category : c.category !== 'politica')).map((c) => c.id);
  state.order = shuffle(pool, deps.rng).slice(0, state.totalRounds);
  state.totalRounds = state.order.length;
  state.status = 'PLAYING';
  state.round = -1;
  const cfg = PARTY_CONFIG[state.game];
  return [
    text(`*${cfg.name}* valendo! ${state.players.length} jogadores, ${state.totalRounds} rodadas.`),
    ...openRound(state, deps),
  ];
}

function openRound(state: QuizParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  state.clue = 0;
  state.attempts = [];
  state.guesses = [];
  state.solved = false;
  state.roundHits = [];
  state.warned = [];
  const nowMs = deps.now.getTime();
  const header = `*Rodada ${state.round + 1}/${state.totalRounds}*`;
  if (state.game === 'quetime') {
    const lineup = getLineup(state.order[state.round])!;
    return [
      {
        type: 'image',
        image: { kind: 'lineupQuiz', state: structuredClone(state), lines: lineup.lines },
        caption: `${header} · Que time é esse? Mande time e ano (ex.: *Brasil 94*). 1 palpite por pessoa.`,
      },
      schedule(state, PARTY_CONFIG.quetime.seconds, nowMs, 'qt'),
    ];
  }
  if (isCardGame(state.game)) {
    const c = getCard(state.order[state.round])!;
    const label = state.game === 'emoji' ? 'O que é isso?' : 'Responda rápido:';
    return [
      text(`${header} · ${label}\n\n${c.prompt}\n\n1 palpite por pessoa.`),
      schedule(state, PARTY_CONFIG[state.game].seconds, nowMs, state.game === 'emoji' ? 'em' : 'rl'),
    ];
  }
  const card = getWhoIs(state.order[state.round])!;
  return [
    text(`${header} · Quem é?\nDica 1: ${card.clues[0]}\n1 palpite por pessoa. Quanto antes acertar, mais pontos.`),
    schedule(state, PARTY_CONFIG.quemeh.seconds, nowMs, 'qe'),
  ];
}

/** "Brasil 94", "seleção de 1994", "o Barça de 2011" → time e ano. */
export function parseTeamGuess(raw: string): { team: string; year: number | null } {
  const norm = normalize(raw);
  const yearMatch = norm.match(/(?:^| )(\d{4}|\d{2})$/) ?? norm.match(/(?:^| )(\d{4}|\d{2})(?: |$)/);
  let year: number | null = null;
  let team = norm;
  if (yearMatch) {
    const digits = yearMatch[1];
    const n = Number(digits);
    year = digits.length === 4 ? n : n >= 30 ? 1900 + n : 2000 + n;
    team = norm.replace(yearMatch[0], ' ').trim();
  }
  team = team.replace(/\b(de|do|da|em|time|selecao do|selecao da)\b/g, ' ').replace(/\s+/g, ' ').trim();
  return { team: normalizeAnswer(team), year };
}

function teamMatches(lineup: Lineup, team: string): boolean {
  return answerMatches([lineup.team, ...lineup.aliases], team);
}

export async function quizAnswer(
  state: QuizParty,
  player: PartyPlayer,
  msg: IncomingMessage,
  deps: PartyDeps,
  save: Save,
): Promise<Outgoing[]> {
  if (state.solved || state.attempts.includes(player.jid)) return [];
  const raw = msg.text.trim();
  if (raw.length < 2 || raw.length > 40 || /[?!\n]/.test(raw)) return [];
  if (state.game === 'quemeh' && !looksLikePlayerName(raw)) return [];
  const who = firstName(player.name);

  // Palpite repetido (mesmo texto já dito nesta rodada): não vale e não gasta a tentativa.
  const key = state.game === 'quetime' ? JSON.stringify(parseTeamGuess(raw)) : normalizeAnswer(raw);
  if (state.guesses.includes(key)) return [text(`*${who}*, esse palpite já foi dado. Tente outro.`)];
  state.guesses.push(key);
  state.attempts.push(player.jid);
  player.missed = 0;

  const out: Outgoing[] = [];
  if (state.game === 'quetime') {
    const lineup = getLineup(state.order[state.round])!;
    const guess = parseTeamGuess(raw);
    if (!teamMatches(lineup, guess.team)) {
      out.push(react(msg, '❌'));
    } else if (guess.year === lineup.year) {
      score(state, player, QUETIME_POINTS.full, `${lineup.team} ${lineup.year}`, deps);
      state.solved = true;
      out.push(text(`✅ *${who}* acertou: *${lineup.team} ${lineup.year}* (+${QUETIME_POINTS.full})`));
    } else if (state.roundHits.length > 0) {
      // O time já foi descoberto por alguém: agora só vale acertar o ano.
      out.push(react(msg, '❌'));
    } else {
      score(state, player, QUETIME_POINTS.teamOnly, `${lineup.team} (ano errado)`, deps);
      out.push(text(`*${who}* acertou o time, mas não o ano (+${QUETIME_POINTS.teamOnly}). Ainda vale descobrir o ano.`));
    }
  } else if (isCardGame(state.game)) {
    const c = getCard(state.order[state.round])!;
    if (answerMatches([c.answer, ...(c.aliases ?? [])], normalizeAnswer(raw))) {
      score(state, player, CARD_POINTS, c.answer, deps);
      state.solved = true;
      out.push(text(`✅ *${who}* acertou: *${c.answer}* (+${CARD_POINTS})`));
    } else {
      out.push(react(msg, '❌'));
    }
  } else {
    const card = getWhoIs(state.order[state.round])!;
    if (answerMatches([card.answer, ...card.aliases], normalizeAnswer(raw))) {
      const points = WHOIS_POINTS[state.clue];
      score(state, player, points, `dica ${state.clue + 1}`, deps);
      state.solved = true;
      out.push(text(`✅ *${who}* acertou na dica ${state.clue + 1}: *${card.answer}* (+${points})`));
    } else {
      out.push(react(msg, '❌'));
    }
  }

  const everyoneTried = activePlayers(state).every((p) => state.attempts.includes(p.jid));
  if (state.solved || everyoneTried) {
    out.push(...closeQuizRound(state, deps, state.solved ? '' : 'Todos tentaram.'));
  }
  return save(out);
}

function score(state: QuizParty, player: PartyPlayer, points: number, label: string, deps: PartyDeps) {
  player.score += points;
  player.hits += 1;
  player.lastHitAt = deps.now.getTime();
  state.roundHits.push({ jid: player.jid, name: player.name, points, label });
}

/** Prazo vencido: no Quem é? solta a próxima dica; senão, fecha a rodada. */
export function quizTimeout(state: QuizParty, deps: PartyDeps): Outgoing[] {
  if (state.game === 'quemeh' && state.clue < 4) {
    state.clue += 1;
    const card = getWhoIs(state.order[state.round])!;
    return [
      text(`Dica ${state.clue + 1}: ${card.clues[state.clue]}`),
      schedule(state, PARTY_CONFIG.quemeh.seconds, deps.now.getTime(), 'qe'),
    ];
  }
  return closeQuizRound(state, deps, 'Tempo esgotado.');
}

export function closeQuizRound(state: QuizParty, deps: PartyDeps, reason: string): Outgoing[] {
  // Quem não tentou nesta rodada acumula falta (2 seguidas = ausente).
  for (const p of state.players) {
    if (!state.attempts.includes(p.jid) && p.missed < 99) p.missed += 1;
  }
  const answer = isCardGame(state.game)
    ? `Era *${getCard(state.order[state.round])!.answer}*.`
    : state.game === 'quetime'
      ? (() => {
          const l = getLineup(state.order[state.round])!;
          return `Era *${l.team} ${l.year}*, ${l.match}.`;
        })()
      : `Era *${getWhoIs(state.order[state.round])!.answer}*.`;
  const reveal = [reason, state.solved ? answer : `Ninguém acertou. ${answer}`].filter(Boolean).join(' ');

  if (state.round >= state.totalRounds - 1) return finishQuiz(state, deps, reveal);

  const out: Outgoing[] = [text(reveal)];
  if ((state.round + 1) % 3 === 0) out.push(scoreImage(state, false));
  return [...out, ...openRound(state, deps)];
}

export function quizStandings(state: QuizParty): PartyPlayer[] {
  return [...state.players].sort((a, b) => b.score - a.score || a.lastHitAt - b.lastHitAt);
}

export function scoreImage(state: QuizParty | IntrusoParty | AlfabetoParty | ChuteParty, final: boolean): Outgoing {
  const title = final ? 'Resultado final' : `Placar após a rodada ${state.round + 1}`;
  return { type: 'image', image: { kind: 'partyScore', state: structuredClone(state), title, final } };
}

export function finishQuiz(state: QuizParty, deps: PartyDeps, reason: string): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const ranked = quizStandings(state);
  const best = ranked[0];
  const tied = ranked.filter((p) => p.score === best.score);
  const headline =
    best.score === 0
      ? 'Ninguém pontuou desta vez.'
      : tied.length > 1
        ? `🏆 Empate: ${tied.map((p) => `*${p.name}*`).join(' e ')}, com ${best.score} pontos.`
        : `🏆 *${best.name}* venceu com ${best.score} pontos.`;
  const lines = ranked.map((p, i) => `${i + 1}º ${p.name} — ${p.score}`);
  pendingResults.set(
    state,
    ranked.map((p) => ({
      player: { jid: p.jid, name: p.name },
      result: best.score > 0 && p.score === best.score ? (tied.length > 1 ? 'draw' : 'win') : 'loss',
    })),
  );
  const again = { quetime: 'abrir que time é esse', quemeh: 'abrir quem é', emoji: 'abrir emoji', relampago: 'abrir relâmpago' }[state.game];
  return [
    {
      ...scoreImage(state, true),
      caption: `${reason}\n\n${headline}\n${lines.join('\n')}\n\nMande *${again}* para jogar de novo.`,
    } as Outgoing,
  ];
}
