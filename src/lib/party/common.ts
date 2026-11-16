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
  escalacao: { name: 'Escalação em Grupo', maxPlayers: 10, minPlayers: 2, joinUntil: 2, seconds: 60 },
  top10: { name: 'Top 10', maxPlayers: 10, minPlayers: 2, joinUntil: 2, seconds: 240 },
  quetime: { name: 'Que time é esse?', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 45, rounds: 6 },
  quemeh: { name: 'Quem é?', maxPlayers: 15, minPlayers: 2, joinUntil: 2, seconds: 12, rounds: 8 },
};

export interface PartyDeps {
  store: Store;
  lookup: PlayerLookup;
  now: Date;
  rng: () => number;
  isAdmin: (jid: string) => boolean;
}

export type Save = (out: Outgoing[]) => Promise<Outgoing[]>;

export const text = (t: string): Outgoing => ({ type: 'text', text: t });

export const react = (msg: IncomingMessage, emoji: string): Outgoing => ({
  type: 'react',
  messageId: msg.id,
  senderJid: msg.senderJid,
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
  const norm = forms.map((f) => normalize(f));
  if (norm.includes(guess)) return true;
  const tolerance = guess.length >= 9 ? 2 : guess.length >= 5 ? 1 : 0;
  return tolerance > 0 && norm.some((f) => f.length >= 5 && editDistance(f, guess) <= tolerance);
}
