import { firstName, normalize } from '../game/text';
import type { ImpostorParty, IncomingMessage, Outgoing, PartyPlayer } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, answerMatches, award, freshFirst, normalizeAnswer, pendingResults, react, schedule, shuffle, text, warnOnce } from './common';
import { IMPOSTOR_THEMES, getImpostorSecret, impostorPool, themeLabel } from './content/impostor';
import { safeFirstName } from '../images/glyphs';

/**
 * Impostor (blefe e dedução). Todos recebem no privado o mesmo segredo (um
 * craque, um filme, um lugar... conforme o tema), menos o impostor, que só
 * sabe o tema.
 * Duas voltas de dicas de 1 palavra no grupo, debate de 60 s e votação (só
 * quem joga; empate vai para o 2º turno). Se pegarem o impostor, ele ainda
 * tem 20 s para acertar o segredo no grupo e roubar a vitória.
 *
 * Com 7 ou mais na mesa, o anfitrião pode ligar *2 impostores*: um não sabe
 * do outro. Pegaram um (e ele errou o segredo)? Nova votação para achar o
 * outro. O grupo só vence pegando os dois.
 */
export const IMPOSTOR_LAPS = 2;
export const IMPOSTOR_CARDS_SECONDS = 15;
export const IMPOSTOR_DEBATE_SECONDS = 60;
/** No modo rápido o debate também encurta. */
export const IMPOSTOR_FAST_DEBATE_SECONDS = 30;
/** "mais tempo" no debate: +30 s por pedido, até 2 vezes por debate. */
export const IMPOSTOR_EXTRA_SECONDS = 30;
export const IMPOSTOR_MAX_EXTRAS = 2;
const MORE_TIME = /^(mais tempo( de debate| no debate)?|aumentar( o)? tempo( do debate)?|mais 30( ?s| segundos)?|estender( o)?( debate| tempo)?)$/;
/** "+30" (o normalize tira o "+", então confere no texto original; "30" sozinho não vale). */
const PLUS_30 = /^\+\s?30\s?s?$/i;
export const IMPOSTOR_VOTE_SECONDS = 45;
export const IMPOSTOR_RUNOFF_SECONDS = 30;
export const IMPOSTOR_GUESS_SECONDS = 20;
export const IMPOSTOR_FAST_SECONDS = 25;
export const IMPOSTOR_POINTS = { escaped: 5, stole: 4, rightVote: 2, team: 1, partner: 2 };
/** Mínimo de jogadores para valer o 2º impostor. */
export const IMPOSTOR_TWO_MIN = 7;
/** "2 impostores", "dois impostores", "segundo impostor", "impostor duplo" (e "1 impostor" desliga). */
export const TWO_IMPOSTORS = /^((2|dois) impostores|segundo impostor|impostor duplo|com 2 impostores)$/;
export const ONE_IMPOSTOR = /^((1|um|so um|so 1) impostor)$/;

export const IMPOSTOR_RULES = [
  'Todos recebem o segredo no privado (um craque, um filme, um lugar... conforme o tema), menos o impostor, que só sabe o tema.',
  `Na sua vez, mande *1 palavra* de dica no grupo (${PARTY_CONFIG.impostor.seconds}s). São ${IMPOSTOR_LAPS} voltas. Não vale o nome do segredo nem repetir dica.`,
  `Depois: ${IMPOSTOR_DEBATE_SECONDS}s de debate (${IMPOSTOR_FAST_DEBATE_SECONDS}s no rápido) e votação (só quem joga; empate vai para o 2º turno). No debate, *mais tempo* dá +${IMPOSTOR_EXTRA_SECONDS}s (até ${IMPOSTOR_MAX_EXTRAS} vezes).`,
  `Pegaram o impostor? Ele tem ${IMPOSTOR_GUESS_SECONDS}s para acertar o segredo e roubar a vitória.`,
  `Pontos: impostor que escapa +${IMPOSTOR_POINTS.escaped} (rouba acertando: +${IMPOSTOR_POINTS.stole}); grupo vence: +${IMPOSTOR_POINTS.rightVote} para quem votou certo, +${IMPOSTOR_POINTS.team} para os outros.`,
  `Com ${IMPOSTOR_TWO_MIN} ou mais na mesa, o anfitrião pode mandar *2 impostores*: um não sabe do outro, e o grupo só vence pegando os dois (o impostor que vence com o parceiro pego leva +${IMPOSTOR_POINTS.partner}).`,
  'Não recebeu a carta? Mande *carta* aqui ou *oi* para o bot no privado.',
];

/**
 * Lista de temas para o grupo escolher ("abrir impostor filmes"). No grupo
 * que só tem o Impostor ("ativar impostor"), sem tema vale "geral".
 */
export function impostorThemesText(head = '', onlyImpostor = false): string {
  const list = (category: string) => IMPOSTOR_THEMES.filter((t) => t.category === category).map(themeLabel).join(', ');
  return [
    head,
    '🕵️ *Temas do Impostor*: mande *abrir impostor* + tema (ex.: *abrir impostor filmes*).',
    `⚽ *Futebol*: ${list('futebol')}.`,
    `🌎 *Gerais*: ${list('geral')}.`,
    `🎌 *Anime*: ${list('anime')} · 📜 *História*: ${list('historia')}.`,
    'Misturas: *futebol* (todos os de futebol), *geral* (todos os outros) e *tudo*.',
    onlyImpostor ? 'Sem tema, neste grupo: *geral*.' : 'Sem tema: *futebol*.',
    '*rápido* no fim: 25s por dica (ex.: *abrir impostor séries rápido*).',
    `Com ${IMPOSTOR_TWO_MIN} ou mais: *2 impostores* no fim (ex.: *abrir impostor filmes 2 impostores*).`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function newImpostor(
  theme: string | null = null,
  fast = false,
  twoImpostors = false,
): Pick<ImpostorParty, 'game' | 'theme' | 'secretId' | 'impostor' | 'order' | 'lap' | 'turn' | 'phase' | 'clues' | 'votes' | 'runoffVotes' | 'runoff' | 'ballot' | 'fast' | 'round' | 'totalRounds' | 'twoImpostors'> {
  return {
    game: 'impostor', theme, secretId: '', impostor: '', order: [], lap: 0, turn: 0, phase: 'cards', clues: [],
    votes: {}, runoffVotes: {}, runoff: [], ballot: [], fast, round: 0, totalRounds: IMPOSTOR_LAPS, twoImpostors,
  };
}

/** Todos os impostores (partidas antigas só têm o `impostor`). */
export const impostorsOf = (state: ImpostorParty): string[] => (state.impostors?.length ? state.impostors : [state.impostor]);
const isImpostor = (state: ImpostorParty, jid: string) => impostorsOf(state).includes(jid);

const inGame = (state: ImpostorParty, jid: string) => state.players.some((p) => p.jid === jid && p.missed < 99);
const alive = (state: ImpostorParty) => state.order.filter((jid) => inGame(state, jid));
/** Quem ainda está na disputa: na mesa e não pego (impostor pego sai da votação seguinte). */
const active = (state: ImpostorParty) => alive(state).filter((jid) => !(state.caught ?? []).includes(jid));
/** Impostores ainda soltos (na mesa e não pegos). */
const loose = (state: ImpostorParty) => impostorsOf(state).filter((jid) => inGame(state, jid) && !(state.caught ?? []).includes(jid));
const two = (state: ImpostorParty) => impostorsOf(state).length > 1;
const namesOf = (state: ImpostorParty, jids: string[]) => jids.map((j) => `*${nameOf(state, j)}*`).join(' e ');
const nameOf = (state: ImpostorParty, jid: string | undefined) => firstName(state.players.find((p) => p.jid === jid)?.name ?? '?');
/** Na imagem: primeiro nome sem emoji (o resto da linha não some). */
const boardName = (state: ImpostorParty, jid: string | undefined) => safeFirstName(state.players.find((p) => p.jid === jid)?.name ?? '?');
const clueSeconds = (state: ImpostorParty) => (state.fast ? IMPOSTOR_FAST_SECONDS : PARTY_CONFIG.impostor.seconds);
const debateSeconds = (state: ImpostorParty) => (state.fast ? IMPOSTOR_FAST_DEBATE_SECONDS : IMPOSTOR_DEBATE_SECONDS);
const secretOf = (state: ImpostorParty) => getImpostorSecret(state.secretId)!;

/** O que cada um recebe no privado. */
export function cardText(state: ImpostorParty, jid: string): string {
  const secret = secretOf(state);
  if (isImpostor(state, jid)) {
    if (two(state)) {
      return (
        `🎭 *Impostor*: você é *UM DOS 2 IMPOSTORES*!\nTema: *${secret.theme}*.\n\n` +
        'Você não sabe quem é o outro. Ouça as dicas, finja que sabe e tente descobrir o segredo. Se te pegarem, ainda dá para roubar a vitória acertando o segredo.'
      );
    }
    return (
      `🎭 *Impostor*: você é o *IMPOSTOR*!\nTema: *${secret.theme}*.\n\n` +
      'Ouça as dicas, finja que sabe e tente descobrir o segredo. Se te pegarem, ainda dá para roubar a vitória acertando o segredo.'
    );
  }
  return (
    `🤫 *Impostor*: o segredo é *${secret.name}* (tema: ${secret.theme}).\n\n` +
    'Não fale o nome! Dê dicas que mostrem que você sabe, sem entregar para o impostor.' +
    (two(state) ? '\n\n⚠️ Nesta partida são *2 impostores*: o grupo só vence pegando os dois.' : '')
  );
}

const dm = (state: ImpostorParty, jid: string): Outgoing => ({ type: 'dm', to: jid, text: cardText(state, jid), name: nameOf(state, jid) });

export function startImpostor(state: ImpostorParty, deps: PartyDeps): Outgoing[] {
  // Sem tema: futebol misturado; "geral": os temas gerais. O que o grupo não viu vem primeiro.
  state.secretId = freshFirst(impostorPool(state.theme).map((s) => s.id), deps.rng, deps.seen)[0];
  const jids = state.players.map((p) => p.jid);
  state.impostor = jids[Math.floor(deps.rng() * jids.length)];
  // 2º impostor: só se o anfitrião pediu e a mesa tem 7 ou mais.
  const wantsTwo = Boolean(state.twoImpostors);
  const withTwo = wantsTwo && jids.length >= IMPOSTOR_TWO_MIN;
  const others = jids.filter((j) => j !== state.impostor);
  state.impostors = withTwo ? [state.impostor, others[Math.floor(deps.rng() * others.length)]] : [state.impostor];
  // Ordem sorteada; impostor nunca abre a 1ª volta (seria difícil demais para ele).
  const order = shuffle(jids, deps.rng);
  if (isImpostor(state, order[0])) {
    const first = order.findIndex((j) => !isImpostor(state, j));
    if (first > 0) [order[0], order[first]] = [order[first], order[0]];
  }
  Object.assign(state, { order, lap: 0, turn: 0, phase: 'cards', clues: [], votes: {}, runoffVotes: {}, runoff: [], ballot: [], round: 0, caught: [], rightVoters: [] });
  state.guessing = undefined;
  state.status = 'PLAYING';
  const secret = secretOf(state);
  const mesa = order.map((jid, i) => `${i + 1}. ${nameOf(state, jid)}`).join('\n');
  const note = withTwo
    ? '\n🎭🎭 São *2 impostores*: um não sabe do outro. O grupo só vence pegando os dois.'
    : wantsTwo
      ? `\n(2 impostores só com ${IMPOSTOR_TWO_MIN} ou mais na mesa: hoje vai 1.)`
      : jids.length >= IMPOSTOR_TWO_MIN
        ? `\nDica: com ${IMPOSTOR_TWO_MIN} ou mais dá para jogar com *2 impostores* (o anfitrião manda no saguão).`
        : '';
  return [
    text(
      `🕵️ *Impostor* valendo! ${jids.length} jogadores, ${withTwo ? '2 impostores' : '1 impostor'}. Tema: *${secret.theme}*.${note}\n` +
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
    if (!loose(state).length) return [...out, ...fled(state, deps)];
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
  state.extended = 0;
  return [
    text(
      `💬 *Debate!* ${debateSeconds(state)}s para acusar e se defender. Anfitrião: *votar* abre a votação antes. ` +
        `Precisa de mais? *mais tempo* (+${IMPOSTOR_EXTRA_SECONDS}s).`,
    ),
    schedule(state, debateSeconds(state), deps.now.getTime(), 'imp'),
  ];
}

const cluesOf = (state: ImpostorParty, jid: string) =>
  state.clues.filter((c) => c.jid === jid).map((c) => c.word ?? '—').join(' · ') || '—';

function openVoting(state: ImpostorParty, deps: PartyDeps): Outgoing[] {
  state.phase = 'voting';
  state.votes = {};
  state.warned = [];
  state.runoffVotes = {};
  state.runoff = [];
  state.ballot = active(state);
  const lines = state.ballot.map((jid, i) => `${i + 1}. ${nameOf(state, jid)} — ${cluesOf(state, jid)}`).join('\n');
  const which = (state.caught ?? []).length ? 'Quem é o outro impostor?' : two(state) ? 'Quem é um dos impostores?' : 'Quem é o impostor?';
  return [
    text(
      `🗳️ *Votação!* ${which} Mande o número (1 a ${state.ballot.length}). Só quem joga vota; não vale votar em si mesmo. ${IMPOSTOR_VOTE_SECONDS}s.\n\n${lines}`,
    ),
    schedule(state, IMPOSTOR_VOTE_SECONDS, deps.now.getTime(), 'imp'),
  ];
}

function openRunoff(state: ImpostorParty, tied: string[], deps: PartyDeps): Outgoing[] {
  state.phase = 'runoff';
  state.runoff = tied;
  state.runoffVotes = {};
  state.warned = [];
  if (!active(state).some((jid) => !tied.includes(jid))) return escaped(state, `Empate e ninguém de fora para desempatar: ${two(state) ? 'os impostores escapam' : 'o impostor escapa'}.`, deps);
  const lines = tied.map((jid, i) => `${i + 1}. ${nameOf(state, jid)} — ${cluesOf(state, jid)}`).join('\n');
  return [
    text(`⚖️ *Empate!* 2º turno (${IMPOSTOR_RUNOFF_SECONDS}s) só entre:\n${lines}\n\nMande o número. Os empatados não votam.`),
    schedule(state, IMPOSTOR_RUNOFF_SECONDS, deps.now.getTime(), 'imp'),
  ];
}

/** Quem ainda pode votar nesta fase. */
const voters = (state: ImpostorParty) => active(state).filter((jid) => state.phase !== 'runoff' || !state.runoff.includes(jid));

function voteAnswer(state: ImpostorParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  const n = Number(msg.text.trim());
  const ballot = state.phase === 'runoff' ? state.runoff : state.ballot;
  // Impostor já pego não vota mais.
  if ((state.caught ?? []).includes(player.jid)) return [];
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
  if (!loose(state).length) return fled(state, deps);
  const box = state.phase === 'runoff' ? state.runoffVotes : state.votes;
  const counts = new Map<string, number>();
  for (const target of Object.values(box)) counts.set(target, (counts.get(target) ?? 0) + 1);
  const max = Math.max(0, ...counts.values());
  const escapes = two(state) ? 'os impostores escapam' : 'o impostor escapa';
  if (max === 0) return escaped(state, `Ninguém votou: ${escapes}.`, deps);
  const top = [...counts.entries()].filter(([, n]) => n === max).map(([jid]) => jid);
  if (top.length > 1) {
    if (state.phase === 'voting') return openRunoff(state, state.ballot.filter((jid) => top.includes(jid)), deps);
    return escaped(state, `Empate de novo no 2º turno: ${escapes}.`, deps);
  }
  closeVote(state);
  const voted = top[0];
  if (!isImpostor(state, voted)) return escaped(state, `😱 *${nameOf(state, voted)}* era INOCENTE (${max} voto${max === 1 ? '' : 's'})!`, deps);
  state.phase = 'guess';
  state.guessing = voted;
  state.warned = [];
  const left = loose(state).filter((jid) => jid !== voted).length;
  return [
    text(
      `🎯 Pegaram ${two(state) ? 'um impostor' : 'o impostor'}: *${nameOf(state, voted)}* (${max} voto${max === 1 ? '' : 's'})!\n` +
        `Última chance, ${nameOf(state, voted)}: mande o segredo aqui no grupo em ${IMPOSTOR_GUESS_SECONDS}s. Acertou, rouba a vitória.` +
        (left ? `\nSe errar, a caça continua: ainda tem *${left} impostor* na mesa.` : ''),
    ),
    schedule(state, IMPOSTOR_GUESS_SECONDS, deps.now.getTime(), 'imp'),
  ];
}

/** Votação apurada: guarda quem votou num impostor (pontos no fim) e zera a urna. */
function closeVote(state: ImpostorParty): void {
  const right = new Set(state.rightVoters ?? []);
  for (const jid of new Set([...Object.keys(state.votes), ...Object.keys(state.runoffVotes)])) {
    const vote = state.runoffVotes[jid] ?? state.votes[jid];
    if (vote && isImpostor(state, vote)) right.add(jid);
  }
  state.rightVoters = [...right];
}

/** O impostor pego errou (ou não chutou): sai da mesa; sobrou outro, nova votação; senão, vitória do grupo. */
function missedGuess(state: ImpostorParty, deps: PartyDeps, lead: string): Outgoing[] {
  const jid = state.guessing ?? state.impostor;
  state.caught = [...new Set([...(state.caught ?? []), jid])];
  state.guessing = undefined;
  if (loose(state).length) {
    return [text(`${lead}\n🔎 Ainda tem *1 impostor* na mesa! Nova votação (${nameOf(state, jid)} não vota mais).`), ...openVoting(state, deps)];
  }
  return finishImpostor(state, 'caught', `${lead} ✅ *Vitória do grupo!*`, deps.now.getTime());
}

function guessAnswer(state: ImpostorParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  const guesser = state.guessing ?? state.impostor;
  if (player.jid !== guesser) return [];
  const raw = msg.text.trim();
  if (!normalize(raw) || /[?\n]/.test(raw)) return [];
  const secret = secretOf(state);
  const hit = answerMatches([secret.name, ...secret.aliases], normalizeAnswer(raw));
  const now = deps.now.getTime();
  if (hit) {
    const crew = two(state) ? ' para os impostores' : '';
    return save(finishImpostor(state, 'stole', `🎭 *${nameOf(state, guesser)}* acertou *${secret.name}* e rouba a vitória${crew}!`, now));
  }
  return save(missedGuess(state, deps, `❌ "${raw.slice(0, 40)}" não é o segredo.`));
}

const escaped = (state: ImpostorParty, reason: string, deps: PartyDeps) =>
  finishImpostor(
    state,
    'escaped',
    two(state)
      ? `${reason}\n🎭 Os impostores eram ${namesOf(state, impostorsOf(state))}: eles vencem a rodada!`
      : `${reason}\n🎭 O impostor era *${nameOf(state, state.impostor)}*: ele vence a rodada!`,
    deps.now.getTime(),
  );

const fled = (state: ImpostorParty, deps: PartyDeps) =>
  finishImpostor(
    state,
    'fled',
    two(state)
      ? `🏃 Os impostores saíram! Eram ${namesOf(state, impostorsOf(state))}. ✅ Vitória do grupo.`
      : `🏃 O impostor fugiu! Era *${nameOf(state, state.impostor)}*. ✅ Vitória do grupo.`,
    deps.now.getTime(),
  );

export function impostorAnswer(state: ImpostorParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  const norm = normalize(msg.text);
  // Reenvio da carta: em qualquer fase, sempre no privado.
  if (['carta', 'minha carta', 'segredo', 'meu segredo'].includes(norm)) return save([react(msg, '📩'), dm(state, player.jid)]);
  if (state.phase === 'clues') return clueAnswer(state, player, msg, deps, save);
  if (state.phase === 'debate') {
    if (norm === 'votar' && player.jid === state.host.jid) return save(openVoting(state, deps));
    if (MORE_TIME.test(norm) || PLUS_30.test(msg.text.trim())) return extendDebate(state, player, deps, save);
    return [];
  }
  if (state.phase === 'voting' || state.phase === 'runoff') return voteAnswer(state, player, msg, deps, save);
  if (state.phase === 'guess') return guessAnswer(state, player, msg, deps, save);
  return [];
}

/** "mais tempo": qualquer um da mesa soma 30 s ao debate, até 2 vezes. */
function extendDebate(state: ImpostorParty, player: PartyPlayer, deps: PartyDeps, save: Save): Promise<Outgoing[]> {
  const used = state.extended ?? 0;
  if (used >= IMPOSTOR_MAX_EXTRAS) {
    return warnOnce(state, player.jid, `O debate já ganhou mais tempo ${IMPOSTOR_MAX_EXTRAS} vezes. Anfitrião: *votar* abre a votação.`, save);
  }
  const nowMs = deps.now.getTime();
  const left = Math.max(0, Math.ceil(((state.deadline ?? nowMs) - nowMs) / 1000));
  state.extended = used + 1;
  const total = left + IMPOSTOR_EXTRA_SECONDS;
  const more = IMPOSTOR_MAX_EXTRAS - state.extended;
  return save([
    text(
      `⏳ *+${IMPOSTOR_EXTRA_SECONDS}s* de debate, a pedido de *${firstName(player.name)}*. Agora faltam ${total}s.` +
        (more ? ` Dá para pedir mais ${more} vez.` : ' Não dá para pedir mais.'),
    ),
    schedule(state, total, nowMs, 'imp'),
  ]);
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
      return missedGuess(state, deps, '⏱️ O impostor não chutou a tempo.');
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
  const caught = new Set(state.caught ?? []);
  const right = new Set(state.rightVoters ?? []);
  for (const p of state.players) {
    p.score = 0;
    if (outcome === 'cancelled') continue;
    if (isImpostor(state, p.jid)) {
      if (!impostorWins) continue;
      // Quem roubou: +4; quem escapou sem ser pego: +5; o parceiro (pego, ou de quem roubou): +2.
      const points =
        outcome === 'stole'
          ? p.jid === state.guessing
            ? IMPOSTOR_POINTS.stole
            : IMPOSTOR_POINTS.partner
          : caught.has(p.jid)
            ? IMPOSTOR_POINTS.partner
            : IMPOSTOR_POINTS.escaped;
      award(p, points, nowMs);
    } else if (!impostorWins) {
      award(p, right.has(p.jid) ? IMPOSTOR_POINTS.rightVote : IMPOSTOR_POINTS.team, nowMs);
    }
  }
  if (outcome !== 'cancelled') {
    pendingResults.set(
      state,
      state.players.map((p) => ({
        player: { jid: p.jid, name: p.name },
        result: isImpostor(state, p.jid) === impostorWins ? ('win' as const) : ('loss' as const),
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
  return finishImpostor(
    state,
    'cancelled',
    two(state) ? `${reason} Os impostores eram ${namesOf(state, impostorsOf(state))}.` : `${reason} O impostor era *${nameOf(state, state.impostor)}*.`,
  );
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
    const showImpostor = final && isImpostor(state, jid);
    return {
      head: `${i + 1}. ${boardName(state, jid)}${showImpostor ? ' · IMPOSTOR' : ''}${inGame(state, jid) ? '' : ' (saiu)'}`,
      lines,
      highlight: showImpostor,
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
