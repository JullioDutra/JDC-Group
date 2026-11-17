import { findTeamByName } from '../game/teams';
import { firstName, normalize } from '../game/text';
import type { IncomingMessage, Outgoing, PartyPlayer, StopParty } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, activePlayers, answerMatches, award, finishByScore, react, schedule, shuffle, text, warnOnce, pauseBeforeNext } from './common';
import { STOP_CATEGORIES, STOP_LETTERS, getStopCategory } from './content/stop';

/**
 * Stop coletivo (Adedonha): letra + 5 categorias. Cada um manda UMA mensagem
 * com as 5 respostas. Quem manda primeiro encurta o prazo dos outros.
 * Resposta igual à de quem mandou antes não vale (copiar dá zero).
 */
export const STOP_CATS_PER_ROUND = 5;
export const STOP_POINTS = 10;
export const STOP_RUSH_SECONDS = 30;

export function newStop(): Pick<StopParty, 'game' | 'round' | 'totalRounds' | 'letters' | 'cats' | 'sheets' | 'arrival' | 'stopped'> {
  return { game: 'stop', round: -1, totalRounds: PARTY_CONFIG.stop.rounds!, letters: [], cats: [], sheets: {}, arrival: [], stopped: false };
}

export const STOP_RULES = [
  `Uma letra e ${STOP_CATS_PER_ROUND} categorias por rodada. Mande tudo numa mensagem só, na ordem, separado por vírgula.`,
  `Quem manda primeiro dá STOP: os outros ficam com ${STOP_RUSH_SECONDS}s.`,
  `Resposta certa: ${STOP_POINTS} pontos. Igual à de quem mandou antes: zero.`,
];

export function startStop(state: StopParty, deps: PartyDeps): Outgoing[] {
  state.letters = shuffle(STOP_LETTERS, deps.rng).slice(0, state.totalRounds);
  state.cats = state.letters.map(() => shuffle(STOP_CATEGORIES.map((c) => c.id), deps.rng).slice(0, STOP_CATS_PER_ROUND));
  state.status = 'PLAYING';
  state.round = -1;
  return [text(`*Stop* valendo! ${state.players.length} jogadores, ${state.totalRounds} rodadas.`), ...openStopRound(state, deps)];
}

export function openStopRound(state: StopParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  state.sheets = {};
  state.arrival = [];
  state.stopped = false;
  state.warned = [];
  const letter = state.letters[state.round];
  const cats = state.cats[state.round].map((id, i) => `${i + 1}. ${getStopCategory(id)!.label}`).join('\n');
  const example = state.cats[state.round].map(() => '...').join(', ');
  return [
    text(
      `*Rodada ${state.round + 1}/${state.totalRounds}* · Letra *${letter}*\n${cats}\n\n` +
        `Mande as ${STOP_CATS_PER_ROUND} respostas numa mensagem, na ordem: *${example}*. Use - para pular.\n` +
        `Tempo: ${PARTY_CONFIG.stop.seconds}s. Quem mandar primeiro encurta para ${STOP_RUSH_SECONDS}s.`,
    ),
    schedule(state, PARTY_CONFIG.stop.seconds, deps.now.getTime(), 'st'),
  ];
}

/** "Maria, Marrocos, macaco" → partes; mensagem em várias linhas também vale. */
export function parseSheet(raw: string, count: number): string[] | null {
  const parts = raw.split(/[,;\n]/).map((p) => p.trim());
  if (parts.length !== count) return null;
  return parts.map((p) => (/^[-–x.]?$/i.test(p) ? '' : p));
}

export async function stopAnswer(state: StopParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> {
  if (player.jid in state.sheets) return [];
  const count = state.cats[state.round].length;
  const sheet = parseSheet(msg.text, count);
  if (!sheet) {
    if (!/[,;\n]/.test(msg.text)) return []; // conversa normal
    return warnOnce(state, player.jid, `*${firstName(player.name)}*, mande as ${count} respostas, na ordem, separadas por vírgula (use - para pular).`, save);
  }
  state.sheets[player.jid] = sheet;
  state.arrival.push(player.jid);
  player.missed = 0;
  const out: Outgoing[] = [react(msg, '✅')];
  const waiting = activePlayers(state).filter((p) => !(p.jid in state.sheets));
  if (waiting.length === 0) return save([...out, ...(await closeStopRound(state, deps, 'Todos mandaram.'))]);
  if (!state.stopped) {
    state.stopped = true;
    const nowMs = deps.now.getTime();
    if (state.deadline === null || state.deadline - nowMs > STOP_RUSH_SECONDS * 1000) {
      out.push(text(`STOP! *${firstName(player.name)}* mandou. Os outros têm ${STOP_RUSH_SECONDS}s.`), schedule(state, STOP_RUSH_SECONDS, nowMs, 'st'));
    }
  }
  return save(out);
}

type Verdict = 'ok' | 'letra' | 'invalida' | 'repetida' | 'vazia';

const startsWithLetter = (word: string, letter: string) => normalize(word).startsWith(letter.toLowerCase());

/** Confere cada resposta: letra, categoria (lista, time, jogador ou IA) e repetição. */
export async function judgeSheets(state: StopParty, deps: PartyDeps): Promise<Record<string, Verdict[]>> {
  const letter = state.letters[state.round];
  const cats = state.cats[state.round].map((id) => getStopCategory(id)!);
  const verdicts: Record<string, Verdict[]> = {};
  const pending: Array<{ jid: string; i: number; category: string; word: string }> = [];

  for (const jid of state.arrival) {
    verdicts[jid] = await Promise.all(
      state.sheets[jid].map(async (word, i): Promise<Verdict> => {
        if (!word) return 'vazia';
        if (!startsWithLetter(word, letter)) return 'letra';
        const cat = cats[i];
        if (cat.kind === 'name') return /^[a-z][a-z ]{1,30}$/.test(normalize(word)) ? 'ok' : 'invalida';
        if (cat.kind === 'team') return findTeamByName(word) ? 'ok' : 'invalida';
        if (cat.kind === 'player') {
          try {
            const profile = await deps.lookup(word);
            return profile ? 'ok' : 'invalida';
          } catch {
            return 'invalida';
          }
        }
        if (answerMatches(cat.words ?? [], normalize(word))) return 'ok';
        pending.push({ jid, i, category: cat.label, word });
        return 'invalida';
      }),
    );
  }

  if (pending.length && deps.checkWords) {
    try {
      const results = await deps.checkWords(letter, pending.map(({ category, word }) => ({ category, word })));
      pending.forEach((p, k) => {
        if (results[k]) verdicts[p.jid][p.i] = 'ok';
      });
    } catch (error) {
      console.error('stop word check failed', error);
    }
  }

  // Repetida: igual (sem acento) a uma resposta válida de quem mandou antes.
  for (let i = 0; i < cats.length; i++) {
    const seen = new Set<string>();
    for (const jid of state.arrival) {
      if (verdicts[jid][i] !== 'ok') continue;
      const key = normalize(state.sheets[jid][i]).replace(/^(o|a|os|as) /, '');
      if (seen.has(key)) verdicts[jid][i] = 'repetida';
      else seen.add(key);
    }
  }
  return verdicts;
}

const LABEL: Record<Verdict, string> = { ok: `+${STOP_POINTS}`, letra: '0 (letra)', invalida: '0', repetida: '0 (repetida)', vazia: '—' };

export async function closeStopRound(state: StopParty, deps: PartyDeps, reason: string): Promise<Outgoing[]> {
  for (const p of state.players) if (!(p.jid in state.sheets) && p.missed < 99) p.missed += 1;
  const verdicts = await judgeSheets(state, deps);
  const cats = state.cats[state.round].map((id) => getStopCategory(id)!);
  const nowMs = deps.now.getTime();
  const rows = state.arrival.map((jid) => {
    const p = state.players.find((x) => x.jid === jid)!;
    const points = verdicts[jid].filter((v) => v === 'ok').length * STOP_POINTS;
    award(p, points, nowMs);
    return {
      head: `${p.name} · ${points}`,
      lines: cats.map((c, i) => `${c.label}: ${state.sheets[jid][i] || '—'} ${verdicts[jid][i] === 'vazia' ? '' : LABEL[verdicts[jid][i]]}`.trim()),
    };
  });
  const summary = rows.length ? rows.map((r) => r.head).join('\n') : 'Ninguém mandou.';
  const out: Outgoing[] = [
    {
      type: 'image',
      image: { kind: 'textBoard', game: 'stop', title: `Letra ${state.letters[state.round]}`, subtitle: `Rodada ${state.round + 1} de ${state.totalRounds}`, rows },
      caption: `${reason}\n${summary}`,
    },
  ];
  if (state.round >= state.totalRounds - 1) return [...out, ...finishByScore(state, '', 'abrir stop')];
  return [...out, ...pauseBeforeNext(state, deps)];
}
