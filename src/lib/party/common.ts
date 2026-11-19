import type { PlayerLookup } from '../ai';
import { normalize } from '../game/text';
import type { IncomingMessage, MatchPlayer, Outgoing, PartyGame, PartyPlayer, PartyState } from '../game/types';
import type { Store } from '../store/types';

/** Peças compartilhadas por todos os jogos do Modo em Grupo. */

export interface PartyConfig {
  name: string;
  maxPlayers: number;
  minPlayers: number;
  /**
   * Até quando dá para entrar depois de começar. Jogos com rodadas: até a
   * rodada N (1-based). Top 10: até N posições reveladas.
   */
  joinUntil: number;
  /** Escalação/quiz: segundos por rodada (Quem é?: por dica). Top 10: duração total. */
  seconds: number;
  /** Quiz: número de rodadas. */
  rounds?: number;
}

export const PARTY_CONFIG: Record<PartyGame, PartyConfig> = {
  escalacao: { name: 'Escalação em Grupo', maxPlayers: 10, minPlayers: 2, joinUntil: 2, seconds: 75 },
  top10: { name: 'Top 10', maxPlayers: 10, minPlayers: 2, joinUntil: 2, seconds: 240 },
  quetime: { name: 'Que time é esse?', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 60, rounds: 6 },
  quemeh: { name: 'Quem é?', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 20, rounds: 8 },
  intruso: { name: 'Intruso', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 45, rounds: 6 },
  emoji: { name: 'Emoji', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 45, rounds: 8 },
  relampago: { name: 'Quiz Relâmpago', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 40, rounds: 10 },
  alfabeto: { name: 'Alfabeto', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 60, rounds: 5 },
  chute: { name: 'Chute Certo', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 50, rounds: 6 },
  bandeira: { name: 'Bandeiraço', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 40, rounds: 10 },
  // Sobrevivente: 20 s por vez; ninguém entra depois de começar (a ordem é fixa).
  sobrevivente: { name: 'Sobrevivente', maxPlayers: 15, minPlayers: 2, joinUntil: 0, seconds: 30, rounds: 8 },
  conexoes: { name: 'Conexões', maxPlayers: 12, minPlayers: 2, joinUntil: 1, seconds: 240, rounds: 2 },
  stop: { name: 'Stop', maxPlayers: 10, minPlayers: 2, joinUntil: 2, seconds: 120, rounds: 3 },
  // Draft: 90 s por escolha, 5 rodadas em serpente, até 8 pessoas.
  draft: { name: 'Draft da Resenha', maxPlayers: 8, minPlayers: 2, joinUntil: 0, seconds: 90, rounds: 5 },
  linha: { name: 'Linha do Tempo', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 60, rounds: 6 },
  fato: { name: 'Fato ou Fake', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 40, rounds: 10 },
  // 1 x 1: 90 s por escolha; 'joinUntil' 0 = ninguém entra depois de começar.
  melhortime: { name: 'Melhor Time', maxPlayers: 2, minPlayers: 2, joinUntil: 0, seconds: 90, rounds: 6 },
  // Jogos gerados da base de jogadores (frente F2).
  carreira: { name: 'Carreira', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 25, rounds: 5 },
  ponte: { name: 'Ponte', maxPlayers: 12, minPlayers: 2, joinUntil: 2, seconds: 90, rounds: 4 },
  grade: { name: 'Grade 3x3', maxPlayers: 2, minPlayers: 2, joinUntil: 0, seconds: 60 },
  penaltis: { name: 'Pênaltis', maxPlayers: 2, minPlayers: 2, joinUntil: 0, seconds: 45 },
  // Leilão: 30 s por lote; ninguém entra depois de começar (os lotes são contados por pessoa).
  leilao: { name: 'Leilão de Craques', maxPlayers: 8, minPlayers: 2, joinUntil: 0, seconds: 30 },
  // Anagrama: 40 s por palavra (dica na metade), 12 palavras.
  anagrama: { name: 'Anagrama', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 40, rounds: 12 },
  // Top 100 do dia: 8 minutos no total; uma partida por dia em cada grupo.
  top100: { name: 'Top 100 do Dia', maxPlayers: 20, minPlayers: 1, joinUntil: 0, seconds: 480 },
  // Impostor: 40 s por dica (25 no rápido); ninguém entra depois de começar (as cartas já foram).
  impostor: { name: 'Impostor do Futebol', maxPlayers: 10, minPlayers: 4, joinUntil: 0, seconds: 40 },
};

/** Jogos 1 x 1: quem aceitar entra e a partida começa sozinha. */
export const ONE_X_ONE: PartyGame[] = ['melhortime', 'grade', 'penaltis'];

export interface PartyDeps {
  store: Store;
  lookup: PlayerLookup;
  now: Date;
  rng: () => number;
  isAdmin: (jid: string) => boolean;
  /** Juiz do Melhor Time (IA). Sem ele, usa a regra de reserva (soma do pico de valor). */
  judge?: TeamJudge;
  /** Stop: confere palavras fora das listas curadas (IA). Sem ele, só vale o que está nas listas. */
  checkWords?: WordCheck;
  /** Pergunta de sim ou não à IA (títulos da Grade fora das listas). null = não sabe. */
  checkFact?: FactCheck;
  /** Itens que o grupo já viu neste jogo (do mais antigo ao mais recente): o sorteio prioriza o resto. */
  seen?: string[];
}

export type FactCheck = (question: string) => Promise<boolean | null>;

/** Recebe a letra e os pares (categoria, palavra); devolve se cada palavra vale. */
export type WordCheck = (letter: string, items: Array<{ category: string; word: string }>) => Promise<boolean[]>;

export interface JudgeTeam {
  player: string;
  lineup: Array<{ position: string; name: string; club: string }>;
}

export type TeamJudge = (teams: [JudgeTeam, JudgeTeam]) => Promise<{ winner: 0 | 1 | 'draw'; reason: string }>;

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Embaralha priorizando o que o grupo ainda não viu; depois vem o que ele viu
 * há mais tempo. Sem histórico, é um embaralhamento comum.
 */
export function freshFirst(ids: string[], rng: () => number, seen?: string[]): string[] {
  if (!seen?.length) return shuffle(ids, rng);
  const when = new Map(seen.map((id, i) => [id, i]));
  const unseen = shuffle(ids.filter((id) => !when.has(id)), rng);
  const old = ids.filter((id) => when.has(id)).sort((a, b) => when.get(a)! - when.get(b)!);
  return [...unseen, ...old];
}

/**
 * Sorteia `count` itens priorizando o que o grupo ainda não viu (chave
 * `key(item)` no histórico); depois, o que ele viu há mais tempo.
 */
export function freshPick<T>(items: T[], key: (item: T) => string, count: number, rng: () => number, seen?: string[]): T[] {
  const byKey = new Map(items.map((t) => [key(t), t]));
  return freshFirst([...byKey.keys()], rng, seen).slice(0, count).map((k) => byKey.get(k)!);
}

export function scoreImage(state: PartyState, final: boolean): Outgoing {
  const round = 'round' in state ? state.round : 0;
  const title = final ? 'Resultado final' : `Placar após a rodada ${round + 1}`;
  return { type: 'image', image: { kind: 'partyScore', state: structuredClone(state), title, final } };
}

/** Fim de jogo por pontos: placar final, manchete e resultados para o ranking. */
export function finishByScore(state: PartyState, reason: string, again: string, unit = 'pontos'): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.lastHitAt - b.lastHitAt);
  const best = ranked[0];
  const tied = ranked.filter((p) => p.score === best.score);
  const headline =
    best.score === 0
      ? 'Ninguém pontuou desta vez.'
      : tied.length > 1
        ? `🏆 Empate: ${tied.map((p) => `*${p.name}*`).join(' e ')}, com ${best.score} ${unit}.`
        : `🏆 *${best.name}* venceu com ${best.score} ${unit}.`;
  pendingResults.set(
    state,
    ranked.map((p) => ({
      player: { jid: p.jid, name: p.name },
      result: best.score > 0 && p.score === best.score ? (tied.length > 1 ? 'draw' : 'win') : 'loss',
    })),
  );
  const lines = ranked.map((p, i) => `${i + 1}º ${p.name} — ${p.score}`);
  return [
    {
      ...scoreImage(state, true),
      caption: [reason, headline, lines.join('\n'), `Mande *${again}* para jogar de novo.`].filter(Boolean).join('\n\n'),
    } as Outgoing,
  ];
}

/** Soma pontos a um jogador. */
export function award(player: PartyPlayer, points: number, nowMs: number): void {
  if (points <= 0) return;
  player.score += points;
  player.hits += 1;
  player.lastHitAt = nowMs;
}

/** Pausa entre rodadas, para dar tempo de ler a revelação. */
export const PAUSE_SECONDS = 12;

/** Encerra a rodada com uma pausa; a próxima abre no prazo ou com "próxima". */
export function pauseBeforeNext(state: PartyState, deps: PartyDeps): Outgoing[] {
  state.intermission = true;
  state.warned = [];
  return [
    text(`Próxima rodada em ${PAUSE_SECONDS}s. Para adiantar, mande *próxima*.`),
    schedule(state, PAUSE_SECONDS, deps.now.getTime(), 'px'),
  ];
}

export type Save = (out: Outgoing[]) => Promise<Outgoing[]>;

export const text = (t: string): Outgoing => ({ type: 'text', text: t });

export const react = (msg: IncomingMessage, emoji: string): Outgoing => ({
  type: 'react',
  messageId: msg.id,
  senderJid: msg.senderJid,
  participant: msg.keyParticipant ?? msg.senderJid,
  emoji,
});

export function warnOnce(state: PartyState, jid: string, message: string, save: Save): Promise<Outgoing[]> {
  if (state.warned.includes(jid)) return Promise.resolve([]);
  state.warned.push(jid);
  return save([text(message)]);
}

/** Abre um prazo: devolve o agendamento (QStash) e guarda o token da rodada. */
export function schedule(state: PartyState, seconds: number, nowMs: number, groupKey: string): Outgoing {
  state.seq += 1;
  state.timerToken = `${groupKey}:${state.seq}`;
  state.deadline = nowMs + seconds * 1000;
  return { type: 'schedule', delaySeconds: seconds + 1, token: state.timerToken };
}

/** Quem ainda conta para "todos responderam" (2 rodadas sem responder = ausente). */
export function activePlayers(state: PartyState): PartyPlayer[] {
  return state.players.filter((p) => p.missed < 2);
}

/**
 * Resultados calculados no fim da sala. São gravados no ranking só depois que
 * o estado final foi salvo (para não contar duas vezes se houver conflito).
 */
export const pendingResults = new WeakMap<PartyState, Array<{ player: MatchPlayer; result: 'win' | 'draw' | 'loss' }>>();

export function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

export const LEADING_ARTICLE = /^(o|a|os|as) /;

/** Normaliza uma resposta: sem acento, sem artigo no começo. */
export function normalizeAnswer(raw: string): string {
  return normalize(raw).replace(LEADING_ARTICLE, '');
}

/** O palpite (já normalizado) bate com alguma das formas? Tolera erro de digitação em nomes longos. */
export function answerMatches(forms: string[], guess: string): boolean {
  // Cada forma vale com e sem artigo: o palpite chega sem ele ("o rei leao" vira "rei leao").
  const norm = forms.flatMap((f) => [normalize(f), normalizeAnswer(f)]);
  if (norm.includes(guess)) return true;
  const tolerance = guess.length >= 9 ? 2 : guess.length >= 5 ? 1 : 0;
  return tolerance > 0 && norm.some((f) => f.length >= 5 && editDistance(f, guess) <= tolerance);
}
