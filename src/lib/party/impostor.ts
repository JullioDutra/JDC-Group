import { firstName, normalize } from '../game/text';
import type { ImpostorParty, IncomingMessage, Outgoing, PartyPlayer } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, answerMatches, award, freshFirst, normalizeAnswer, pendingResults, react, schedule, shuffle, text, warnOnce } from './common';
import { IMPOSTOR_THEMES, getImpostorSecret, impostorPool } from './content/impostor';
import { safeFirstName } from '../images/glyphs';

/**
 * Impostor do Futebol (blefe e dedução). Todos recebem no privado o mesmo
 * segredo (craque, clube, seleção...), menos o impostor, que só sabe o tema.
 * Duas voltas de dicas de 1 palavra no grupo, debate de 30 s e votação (só
 * quem joga; empate vai para o 2º turno). Se pegarem o impostor, ele ainda
 * tem 20 s para acertar o segredo no grupo e roubar a vitória.
 */
export const IMPOSTOR_LAPS = 2;
export const IMPOSTOR_CARDS_SECONDS = 15;
export const IMPOSTOR_DEBATE_SECONDS = 30;
export const IMPOSTOR_VOTE_SECONDS = 45;
export const IMPOSTOR_RUNOFF_SECONDS = 30;
export const IMPOSTOR_GUESS_SECONDS = 20;
export const IMPOSTOR_FAST_SECONDS = 25;
export const IMPOSTOR_POINTS = { escaped: 5, stole: 4, rightVote: 2, team: 1 };

export const IMPOSTOR_RULES = [
  'Todos recebem o segredo no privado (craque, clube, seleção...), menos o impostor, que só sabe o tema.',
  `Na sua vez, mande *1 palavra* de dica no grupo (${PARTY_CONFIG.impostor.seconds}s). São ${IMPOSTOR_LAPS} voltas. Não vale o nome do segredo nem repetir dica.`,
  `Depois: ${IMPOSTOR_DEBATE_SECONDS}s de debate e votação (só quem joga; empate vai para o 2º turno).`,
  `Pegaram o impostor? Ele tem ${IMPOSTOR_GUESS_SECONDS}s para acertar o segredo e roubar a vitória.`,
  `Pontos: impostor que escapa +${IMPOSTOR_POINTS.escaped} (rouba acertando: +${IMPOSTOR_POINTS.stole}); grupo vence: +${IMPOSTOR_POINTS.rightVote} para quem votou certo, +${IMPOSTOR_POINTS.team} para os outros.`,
  'Não recebeu a carta? Mande *carta* aqui ou *oi* para o bot no privado.',
];

/** Lista de temas para o grupo escolher ("abrir impostor clubes"). */
export function impostorThemesText(head = ''): string {
  const keys = (futebol: boolean) => IMPOSTOR_THEMES.filter((t) => (t.category === 'futebol') === futebol).map((t) => t.keys[0]).join(', ');
  return [
    head,
    '😈 *Temas do Impostor* (mande *abrir impostor* + tema):',
    `⚽ Futebol: ${keys(true)}`,
    `🌎 Gerais: ${keys(false)}`,
    'Sem tema: mistura os de futebol. *geral*: mistura os gerais. *rápido* no fim: 25s por dica.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function newImpostor(
  theme: string | null = null,
  fast = false,
): Pick<ImpostorParty, 'game' | 'theme' | 'secretId' | 'impostor' | 'order' | 'lap' | 'turn' | 'phase' | 'clues' | 'votes' | 'runoffVotes' | 'runoff' | 'ballot' | 'fast' | 'round' | 'totalRounds'> {
  return {
    game: 'impostor', theme, secretId: '', impostor: '', order: [], lap: 0, turn: 0, phase: 'cards', clues: [],
    votes: {}, runoffVotes: {}, runoff: [], ballot: [], fast, round: 0, totalRounds: IMPOSTOR_LAPS,
  };
}

const inGame = (state: ImpostorParty, jid: string) => state.players.some((p) => p.jid === jid && p.missed < 99);
const alive = (state: ImpostorParty) => state.order.filter((jid) => inGame(state, jid));
const nameOf = (state: ImpostorParty, jid: string | undefined) => firstName(state.players.find((p) => p.jid === jid)?.name ?? '?');
/** Na imagem: primeiro nome sem emoji (o resto da linha não some). */
const boardName = (state: ImpostorParty, jid: string | undefined) => safeFirstName(state.players.find((p) => p.jid === jid)?.name ?? '?');
const clueSeconds = (state: ImpostorParty) => (state.fast ? IMPOSTOR_FAST_SECONDS : PARTY_CONFIG.impostor.seconds);
const secretOf = (state: ImpostorParty) => getImpostorSecret(state.secretId)!;

/** O que cada um recebe no privado. */
export function cardText(state: ImpostorParty, jid: string): string {
  const secret = secretOf(state);
  if (jid === state.impostor) {
    return (
      `😈 *Impostor do Futebol*: você é o *IMPOSTOR*!\nTema: *${secret.theme}*.\n\n` +
      'Ouça as dicas, finja que sabe e tente descobrir o segredo. Se te pegarem, ainda dá para roubar a vitória acertando o segredo.'
    );
  }
  return (
    `🤫 *Impostor do Futebol*: o segredo é *${secret.name}* (tema: ${secret.theme}).\n\n` +
    'Não fale o nome! Dê dicas que mostrem que você sabe, sem entregar para o impostor.'
  );
}

const dm = (state: ImpostorParty, jid: string): Outgoing => ({ type: 'dm', to: jid, text: cardText(state, jid), name: nameOf(state, jid) });

export function startImpostor(state: ImpostorParty, deps: PartyDeps): Outgoing[] {
  // Sem tema: futebol misturado; "geral": os temas gerais. O que o grupo não viu vem primeiro.
  state.secretId = freshFirst(impostorPool(state.theme).map((s) => s.id), deps.rng, deps.seen)[0];
  const jids = state.players.map((p) => p.jid);
  state.impostor = jids[Math.floor(deps.rng() * jids.length)];
  // Ordem sorteada; o impostor nunca abre a 1ª volta (seria difícil demais para ele).
  const order = shuffle(jids, deps.rng);
  if (order[0] === state.impostor && order.length > 1) [order[0], order[1]] = [order[1], order[0]];
  Object.assign(state, { order, lap: 0, turn: 0, phase: 'cards', clues: [], votes: {}, runoffVotes: {}, runoff: [], ballot: [], round: 0 });
  state.status = 'PLAYING';
  const secret = secretOf(state);
  const mesa = order.map((jid, i) => `${i + 1}. ${nameOf(state, jid)}`).join('\n');
  return [
    text(
      `😈 *Impostor do Futebol* valendo! ${jids.length} jogadores, 1 impostor. Tema: *${secret.theme}*.\n` +
        '🃏 Mandei a carta no privado de cada um. Não recebeu? Mande *carta* aqui ou *oi* para o bot no privado.\n\n' +
        `Ordem da mesa:\n${mesa}\n\nA 1ª volta de dicas começa em ${IMPOSTOR_CARDS_SECONDS}s.`,
    ),
    ...jids.map((jid) => dm(state, jid)),
    schedule(state, IMPOSTOR_CARDS_SECONDS, deps.now.getTime(), 'imp'),
  ];
}

/** Abre a vez do próximo da mesa (pula quem saiu); fim da volta mostra a mesa; fim das voltas abre o debate. */
function nextTurn(state: ImpostorParty, deps: PartyDeps, lead: Outgoing[] = []): Outgoing[] {
  const out = [...lead];
  for (;;) {
    if (!inGame(state, state.impostor)) return [...out, ...fled(state, deps)];
    if (alive(state).length < 3) return [...out, ...finishImpostor(state, 'cancelled', 'Ficaram menos de 3 jogadores.', deps.now.getTime())];
    if (state.turn >= state.order.length) {
      out.push(impostorBoard(state, false, `Fim da volta ${state.lap + 1}`));
      state.lap += 1;
      state.turn = 0;
      state.round = state.lap;
      if (state.lap >= IMPOSTOR_LAPS) return [...out, ...openDebate(state, deps)];
      continue;
    }
    if (!inGame(state, state.order[state.turn])) {
      state.turn += 1;
      continue;
    }
    break;
  }
  state.phase = 'clues';
  state.warned = [];
  const jid = state.order[state.turn];
  const list = alive(state);
  const secs = clueSeconds(state);
  out.push(
    text(`🗣️ Vez de *${nameOf(state, jid)}* (volta ${state.lap + 1}/${IMPOSTOR_LAPS} · ${list.indexOf(jid) + 1}/${list.length}). Mande *1 palavra*. ${secs}s.`),
    schedule(state, secs, deps.now.getTime(), 'imp'),
  );
  return out;
}

/** A palavra entrega o segredo? (pedaço do nome ou de um apelido) */
export function givesAway(secretId: string, word: string): boolean {
  const secret = getImpostorSecret(secretId);
  if (!secret) return false;
  const w = normalize(word).replace(/\s+/g, '');
  return secret.forbidden.some((f) => (f.length >= 4 ? w.includes(f) || (w.length >= 4 && f.includes(w)) : w === f));
}

function clueAnswer(state: ImpostorParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (state.order[state.turn] !== player.jid) return []; // só vale a dica de quem está na vez
  const raw = msg.text.trim();
  const word = normalize(raw);
  if (!word || /^(k|a?ha|rs|kj)+$/.test(word.replace(/ /g, ''))) return []; // risada não é dica
  const who = firstName(player.name);
  if (word.split(' ').length > 1) return save([text(`Só *1 palavra*, ${who}. Mande de novo.`)]);
  if (givesAway(state.secretId, word)) return save([text(`Essa entrega o segredo, ${who}! Mande outra palavra.`)]);
  if (state.clues.some((c) => c.word && normalize(c.word) === word)) return save([text(`*${raw}* já foi dita, ${who}. Mande outra.`)]);
  state.clues.push({ jid: player.jid, lap: state.lap, word: raw.slice(0, 30) });
  player.missed = 0;
  state.turn += 1;
  return save([react(msg, '✅'), ...nextTurn(state, deps)]);
}

function openDebate(state: ImpostorParty, deps: PartyDeps): Outgoing[] {
  state.phase = 'debate';
  state.warned = [];
  return [
    text(`💬 *Debate!* ${IMPOSTOR_DEBATE_SECONDS}s para acusar e se defender. Anfitrião: *votar* abre a votação antes.`),
    schedule(state, IMPOSTOR_DEBATE_SECONDS, deps.now.getTime(), 'imp'),
  ];
}

const cluesOf = (state: ImpostorParty, jid: string) =>
  state.clues.filter((c) => c.jid === jid).map((c) => c.word ?? '—').join(' · ') || '—';

function openVoting(state: ImpostorParty, deps: PartyDeps): Outgoing[] {
  state.phase = 'voting';
  state.votes = {};
  state.warned = [];
  state.ballot = alive(state);
  const lines = state.ballot.map((jid, i) => `${i + 1}. ${nameOf(state, jid)} — ${cluesOf(state, jid)}`).join('\n');
  return [
    text(
      `🗳️ *Votação!* Quem é o impostor? Mande o número (1 a ${state.ballot.length}). Só quem joga vota; não vale votar em si mesmo. ${IMPOSTOR_VOTE_SECONDS}s.\n\n${lines}`,
    ),
    schedule(state, IMPOSTOR_VOTE_SECONDS, deps.now.getTime(), 'imp'),
  ];
}

function openRunoff(state: ImpostorParty, tied: string[], deps: PartyDeps): Outgoing[] {
  state.phase = 'runoff';
  state.runoff = tied;
  state.runoffVotes = {};
  state.warned = [];
  if (!alive(state).some((jid) => !tied.includes(jid))) return escaped(state, 'Empate e ninguém de fora para desempatar: o impostor escapa.', deps);
  const lines = tied.map((jid, i) => `${i + 1}. ${nameOf(state, jid)} — ${cluesOf(state, jid)}`).join('\n');
  return [
    text(`⚖️ *Empate!* 2º turno (${IMPOSTOR_RUNOFF_SECONDS}s) só entre:\n${lines}\n\nMande o número. Os empatados não votam.`),
    schedule(state, IMPOSTOR_RUNOFF_SECONDS, deps.now.getTime(), 'imp'),
  ];
}

/** Quem ainda pode votar nesta fase. */
const voters = (state: ImpostorParty) => alive(state).filter((jid) => state.phase !== 'runoff' || !state.runoff.includes(jid));

function voteAnswer(state: ImpostorParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  const n = Number(msg.text.trim());
  const ballot = state.phase === 'runoff' ? state.runoff : state.ballot;
  if (!Number.isInteger(n) || n < 1 || n > ballot.length) return [];
  const who = firstName(player.name);
  if (state.phase === 'runoff' && state.runoff.includes(player.jid)) return warnOnce(state, player.jid, `*${who}*, quem está no 2º turno não vota.`, save);
  const target = ballot[n - 1];
  if (target === player.jid) return warnOnce(state, player.jid, `*${who}*, não vale votar em si mesmo.`, save);
  (state.phase === 'runoff' ? state.runoffVotes : state.votes)[player.jid] = target;
  player.missed = 0;
  const box = state.phase === 'runoff' ? state.runoffVotes : state.votes;
  // Todo mundo votou: apura na hora.
  if (voters(state).every((jid) => jid in box)) return save([react(msg, '✅'), ...tally(state, deps)]);
  return save([react(msg, '✅')]);
}

/** Apura a votação (ou o 2º turno). */
function tally(state: ImpostorParty, deps: PartyDeps): Outgoing[] {
  if (!inGame(state, state.impostor)) return fled(state, deps);
  const box = state.phase === 'runoff' ? state.runoffVotes : state.votes;
  const counts = new Map<string, number>();
  for (const target of Object.values(box)) counts.set(target, (counts.get(target) ?? 0) + 1);
  const max = Math.max(0, ...counts.values());
  if (max === 0) return escaped(state, 'Ninguém votou: o impostor escapa.', deps);
  const top = [...counts.entries()].filter(([, n]) => n === max).map(([jid]) => jid);
  if (top.length > 1) {
    if (state.phase === 'voting') return openRunoff(state, state.ballot.filter((jid) => top.includes(jid)), deps);
    return escaped(state, 'Empate de novo no 2º turno: o impostor escapa.', deps);
  }
  const voted = top[0];
  if (voted !== state.impostor) return escaped(state, `😱 *${nameOf(state, voted)}* era INOCENTE (${max} voto${max === 1 ? '' : 's'})!`, deps);
  state.phase = 'guess';
  state.warned = [];
  return [
    text(
      `🎯 Pegaram o impostor: *${nameOf(state, voted)}* (${max} voto${max === 1 ? '' : 's'})!\n` +
        `Última chance, ${nameOf(state, voted)}: mande o segredo aqui no grupo em ${IMPOSTOR_GUESS_SECONDS}s. Acertou, rouba a vitória.`,
    ),
    schedule(state, IMPOSTOR_GUESS_SECONDS, deps.now.getTime(), 'imp'),
  ];
}

function guessAnswer(state: ImpostorParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (player.jid !== state.impostor) return [];
  const raw = msg.text.trim();
  if (!normalize(raw) || /[?\n]/.test(raw)) return [];
  const secret = secretOf(state);
  const hit = answerMatches([secret.name, ...secret.aliases], normalizeAnswer(raw));
  const now = deps.now.getTime();
  if (hit) return save(finishImpostor(state, 'stole', `😈 *${nameOf(state, state.impostor)}* acertou *${secret.name}* e rouba a vitória!`, now));
  return save(finishImpostor(state, 'caught', `❌ "${raw.slice(0, 40)}" não é o segredo. ✅ *Vitória do grupo!*`, now));
}

const escaped = (state: ImpostorParty, reason: string, deps: PartyDeps) =>
  finishImpostor(state, 'escaped', `${reason}\n😈 O impostor era *${nameOf(state, state.impostor)}*: ele vence a rodada!`, deps.now.getTime());

const fled = (state: ImpostorParty, deps: PartyDeps) =>
  finishImpostor(state, 'fled', `🏃 O impostor fugiu! Era *${nameOf(state, state.impostor)}*. ✅ Vitória do grupo.`, deps.now.getTime());

export function impostorAnswer(state: ImpostorParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  const norm = normalize(msg.text);
  // Reenvio da carta: em qualquer fase, sempre no privado.
  if (['carta', 'minha carta', 'segredo', 'meu segredo'].includes(norm)) return save([react(msg, '📩'), dm(state, player.jid)]);
  if (state.phase === 'clues') return clueAnswer(state, player, msg, deps, save);
  if (state.phase === 'debate') {
    if (norm === 'votar' && player.jid === state.host.jid) return save(openVoting(state, deps));
    return [];
  }
  if (state.phase === 'voting' || state.phase === 'runoff') return voteAnswer(state, player, msg, deps, save);
  if (state.phase === 'guess') return guessAnswer(state, player, msg, deps, save);
  return [];
}

/** Fim do prazo da fase atual. */
export function impostorTimeout(state: ImpostorParty, deps: PartyDeps): Outgoing[] {
  switch (state.phase) {
    case 'cards':
      return nextTurn(state, deps);
    case 'clues': {
      const jid = state.order[state.turn];
      state.clues.push({ jid, lap: state.lap, word: null });
      const p = state.players.find((x) => x.jid === jid);
      if (p) p.missed += 1;
      state.turn += 1;
      return nextTurn(state, deps, [text(`⏱️ *${nameOf(state, jid)}* não deu dica.`)]);
    }
    case 'debate':
      return openVoting(state, deps);
    case 'voting':
    case 'runoff':
      return tally(state, deps);
    case 'guess':
      return finishImpostor(state, 'caught', `⏱️ O impostor não chutou a tempo. ✅ *Vitória do grupo!*`, deps.now.getTime());
  }
}

/** "pular" do anfitrião: encerra a fase atual como se o tempo tivesse acabado. */
export function impostorSkip(state: ImpostorParty, deps: PartyDeps): Outgoing[] {
  return impostorTimeout(state, deps);
}

type Outcome = 'escaped' | 'stole' | 'caught' | 'fled' | 'cancelled';

export function finishImpostor(state: ImpostorParty, outcome: Outcome, reason: string, nowMs = Date.now()): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const secret = secretOf(state);
  const impostorWins = outcome === 'escaped' || outcome === 'stole';
  for (const p of state.players) {
    p.score = 0;
    if (outcome === 'cancelled') continue;
    if (p.jid === state.impostor) {
      if (outcome === 'escaped') award(p, IMPOSTOR_POINTS.escaped, nowMs);
      if (outcome === 'stole') award(p, IMPOSTOR_POINTS.stole, nowMs);
    } else if (!impostorWins) {
      const vote = state.runoffVotes[p.jid] ?? state.votes[p.jid];
      award(p, vote === state.impostor ? IMPOSTOR_POINTS.rightVote : IMPOSTOR_POINTS.team, nowMs);
    }
  }
  if (outcome !== 'cancelled') {
    pendingResults.set(
      state,
      state.players.map((p) => ({
        player: { jid: p.jid, name: p.name },
        result: (p.jid === state.impostor) === impostorWins ? ('win' as const) : ('loss' as const),
      })),
    );
  }
  const lines = state.players
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((p) => `+${p.score} ${p.name}`);
  return [
    {
      ...impostorBoard(state, true),
      caption: [reason, `🔑 O segredo era *${secret.name}*.`, lines.join('\n'), 'Mande *abrir impostor* para jogar de novo.'].filter(Boolean).join('\n\n'),
    } as Outgoing,
  ];
}

/** "encerrar" do anfitrião: revela tudo, sem vencedor. */
export function endImpostor(state: ImpostorParty, reason: string): Outgoing[] {
  if (state.status !== 'PLAYING') return finishImpostor(state, 'cancelled', reason);
  return finishImpostor(state, 'cancelled', `${reason} O impostor era *${nameOf(state, state.impostor)}*.`);
}

/** Imagem da mesa (dicas de cada um) ou do resultado (com impostor, votos e pontos). */
export function impostorBoard(state: ImpostorParty, final: boolean, subtitle?: string): Outgoing {
  const secret = getImpostorSecret(state.secretId);
  const rows = state.order.map((jid, i) => {
    const words = Array.from({ length: IMPOSTOR_LAPS }, (_, lap) => state.clues.find((c) => c.jid === jid && c.lap === lap));
    const lines = [`Dicas: ${words.map((c) => (c ? (c.word ?? '—') : '…')).join(' · ')}`];
    if (final) {
      const vote = state.runoffVotes[jid] ?? state.votes[jid];
      lines.push(vote ? `Votou em: ${boardName(state, vote)}` : 'Não votou');
      const score = state.players.find((p) => p.jid === jid)?.score ?? 0;
      if (score) lines.push(`+${score} pontos`);
    }
    const isImpostor = final && jid === state.impostor;
    return {
      head: `${i + 1}. ${boardName(state, jid)}${isImpostor ? ' · IMPOSTOR' : ''}${inGame(state, jid) ? '' : ' (saiu)'}`,
      lines,
      highlight: isImpostor,
    };
  });
  return {
    type: 'image',
    image: {
      kind: 'textBoard',
      game: 'impostor',
      title: final && secret ? `O segredo era ${secret.name}` : 'A mesa',
      subtitle: final ? `Tema: ${secret?.theme ?? '—'}` : (subtitle ?? (state.lap >= IMPOSTOR_LAPS ? 'Dicas completas' : `Volta ${state.lap + 1} de ${IMPOSTOR_LAPS}`)) + ` · tema: ${secret?.theme ?? '—'}`,
      rows,
    },
  };
}
