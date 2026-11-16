import type { PlayerLookup } from '../ai';
import { ConflictError } from '../game/conflict';
import { FAST_TURN_SECONDS, GameMode, MODES, getMode, parseModeChoice, randomMode } from '../game/modes';
import { firstName, formatNumber, looksLikePlayerName, normalize } from '../game/text';
import {
  EscalacaoParty,
  IncomingMessage,
  MatchPlayer,
  Outgoing,
  POSITION_LABEL,
  PartyBase,
  PartyGame,
  PartyPlayer,
  PartyState,
  SLOTS,
  Session,
  Top10List,
  Top10Party,
} from '../game/types';
import { checkPick, drawRestrictions, restrictionLine } from '../game/validate';
import type { Store } from '../store/types';
import { TOP10_CATEGORIES, TOP10_LISTS, getTop10List } from './top10-lists';

/**
 * Modo em Grupo: uma sala onde quem manda "entrar" joga.
 * Regras comuns: 1 resposta por jogador por rodada, nada se repete na partida,
 * limite de jogadores por jogo e entrada tardia só até a 2ª rodada.
 */

export interface PartyConfig {
  name: string;
  maxPlayers: number;
  minPlayers: number;
  /**
   * Até quando dá para entrar depois de começar. Escalação: até a rodada N
   * (1-based). Top 10: até N posições reveladas.
   */
  joinUntil: number;
  /** Escalação: segundos por rodada. Top 10: duração total. */
  seconds: number;
}

export const PARTY_CONFIG: Record<PartyGame, PartyConfig> = {
  escalacao: { name: 'Escalação em Grupo', maxPlayers: 10, minPlayers: 2, joinUntil: 2, seconds: 60 },
  top10: { name: 'Top 10', maxPlayers: 10, minPlayers: 2, joinUntil: 2, seconds: 240 },
};

const LOBBY_TTL_MS = 15 * 60_000;
const IDLE_TTL_MS = 20 * 60_000;

export interface PartyDeps {
  store: Store;
  lookup: PlayerLookup;
  now: Date;
  rng: () => number;
  isAdmin: (jid: string) => boolean;
}

const text = (t: string): Outgoing => ({ type: 'text', text: t });
const react = (msg: IncomingMessage, emoji: string): Outgoing => ({
  type: 'react',
  messageId: msg.id,
  senderJid: msg.senderJid,
  emoji,
});

// ---------- Início ----------

/** "abrir sala", "jogo em grupo", "escalação em grupo" (+ tema) · "top 10" (+ categoria). */
export function parsePartyStart(norm: string): { game: PartyGame; rest: string } | null {
  // Só abre sala se o que vier depois for vazio ou uma opção válida: assim
  // "top 10 melhores do mundo" ou "abrir sala de aula" na conversa não abrem nada.
  const top = norm.match(/^(abrir )?top ?10( (.*))?$/);
  if (top) {
    const rest = top[3] ?? '';
    const ok = !rest || ['futebol', 'geral', 'conhecimentos gerais', 'aleatorio', 'aleatoria', 'surpresa'].includes(rest);
    return ok ? { game: 'top10', rest } : null;
  }
  const esc = norm.match(/^(abrir sala|jogo em grupo|escalacao em grupo)( (.*))?$/);
  if (esc) {
    const rest = esc[3] ?? '';
    return !rest || parseModeChoice(rest, () => 0) ? { game: 'escalacao', rest } : null;
  }
  return null;
}

function newPlayer(p: MatchPlayer): PartyPlayer {
  return { jid: p.jid, name: p.name, score: 0, missed: 0, hits: 0, lastHitAt: 0 };
}

function base(game: PartyGame, host: MatchPlayer, now: number): PartyBase {
  return {
    kind: 'party',
    game,
    status: 'LOBBY',
    host,
    players: [newPlayer(host)],
    createdAt: now,
    updatedAt: now,
    deadline: null,
    timerToken: null,
    seq: 0,
    warned: [],
  };
}

export async function createParty(
  msg: IncomingMessage,
  start: { game: PartyGame; rest: string },
  deps: PartyDeps,
): Promise<Outgoing[]> {
  const nowMs = deps.now.getTime();
  const host = { jid: msg.senderJid, name: msg.senderName };
  let state: PartyState;
  if (start.game === 'escalacao') {
    const choice = start.rest ? parseModeChoice(start.rest, deps.rng) : undefined;
    state = {
      ...base('escalacao', host, nowMs),
      game: 'escalacao',
      modeId: choice?.mode.id ?? null,
      randomMode: choice?.random ?? false,
      options: { blind: choice?.twists.blind ?? false, turnSeconds: choice?.twists.fast ? 40 : PARTY_CONFIG.escalacao.seconds },
      restrictions: [],
      round: -1,
      picks: {},
      used: [],
    };
  } else {
    const cat = parseCategory(start.rest);
    state = {
      ...base('top10', host, nowMs),
      game: 'top10',
      category: cat === 'aleatorio' ? null : cat,
      listId: null,
      found: [],
      guesses: [],
      lastJid: null,
    };
  }
  const created = await deps.store.createMatch(msg.groupJid, state);
  if (!created) return [];
  return [{ type: 'image', image: { kind: 'partyLobby', state }, caption: lobbyCaption(state) }];
}

function lobbyCaption(state: PartyState): string {
  const cfg = PARTY_CONFIG[state.game];
  const lines = [`*Sala aberta: ${cfg.name}*`, `Quem quiser jogar, mande *entrar* (até ${cfg.maxPlayers} pessoas).`];
  if (state.game === 'escalacao') {
    const mode = getMode(state.modeId);
    lines.push(
      mode
        ? `Tema: *${mode.name}*. ${state.host.name}, mande *começar* quando todos entrarem.`
        : `${state.host.name}, escolha o tema (número de 1 a ${MODES.length} ou *aleatório*) e mande *começar*.`,
    );
  } else {
    lines.push(
      `${state.host.name}, escolha a categoria (*futebol*, *geral* ou *aleatório*) e mande *começar*.`,
    );
  }
  return lines.join('\n');
}

function parseCategory(rest: string): Top10List['category'] | 'aleatorio' {
  if (rest.startsWith('fut')) return 'futebol';
  if (rest.startsWith('ger') || rest.startsWith('conhec')) return 'geral';
  return 'aleatorio';
}

// ---------- Mensagens durante a sala ----------

export function isPartyStale(state: PartyState, now: number): boolean {
  return now - state.updatedAt > (state.status === 'LOBBY' ? LOBBY_TTL_MS : IDLE_TTL_MS);
}

export async function handlePartyMessage(
  msg: IncomingMessage,
  match: Session,
  deps: PartyDeps,
): Promise<Outgoing[]> {
  const state = match.state as PartyState;
  const nowMs = deps.now.getTime();
  const norm = normalize(msg.text);
  const cfg = PARTY_CONFIG[state.game];
  const player = state.players.find((p) => p.jid === msg.senderJid);
  const isHost = state.host.jid === msg.senderJid || deps.isAdmin(msg.senderJid);

  const save = async (out: Outgoing[]): Promise<Outgoing[]> => {
    state.updatedAt = nowMs;
    if (!(await deps.store.saveMatch(match))) throw new ConflictError();
    return out;
  };

  // Rodada vencida sem o agendador ter chegado: fecha antes de qualquer coisa.
  if (state.status === 'PLAYING' && state.deadline !== null && nowMs >= state.deadline) {
    return save(closeOnTimeout(state, deps));
  }

  if (norm === 'regras') return [text(rulesText(state))];

  if (norm === 'encerrar' || norm === 'cancelar') {
    if (!isHost) return [];
    if (state.status === 'LOBBY') {
      state.status = 'CANCELLED';
      return save([text('Sala cancelada.')]);
    }
    return finishAndSave(state, deps, save, 'Partida encerrada pelo anfitrião.');
  }

  if (norm === 'placar' || norm === 'tabela' || norm === 'lista') {
    if (state.status !== 'PLAYING') return [];
    return [boardImage(state, false)];
  }

  if (['entrar', 'entrar no jogo', 'eu', 'eu jogo', 'to dentro', 'quero jogar'].includes(norm)) {
    if (player) return [];
    if (state.players.length >= cfg.maxPlayers) {
      return warnOnce(state, msg.senderJid, `Sala cheia (${cfg.maxPlayers}/${cfg.maxPlayers}). Fica para a próxima, *${msg.senderName}*.`, save);
    }
    if (state.status === 'PLAYING' && !canJoinLate(state)) {
      const limit = state.game === 'escalacao' ? `a ${cfg.joinUntil}ª rodada` : `${cfg.joinUntil} posições reveladas`;
      return warnOnce(state, msg.senderJid, `As inscrições fecharam (só dava para entrar até ${limit}).`, save);
    }
    const joined = newPlayer({ jid: msg.senderJid, name: msg.senderName });
    state.players.push(joined);
    if (state.game === 'escalacao' && state.status === 'PLAYING') {
      // Entrou atrasado: as posições que já passaram ficam com o pior valor do tema.
      const mode = getMode(state.modeId)!;
      state.picks[joined.jid] = SLOTS.map((_, i) =>
        i < state.round ? { name: 'Entrou depois', key: `late-${joined.jid}-${i}`, value: mode.penalty } : null,
      );
    }
    return save([react(msg, '✅')]);
  }

  if (norm === 'sair') {
    if (!player || player.jid === state.host.jid) return [];
    if (state.status === 'LOBBY') state.players = state.players.filter((p) => p !== player);
    else player.missed = 99; // fica fora da conta de "todos responderam"
    return save([text(`*${firstName(player.name)}* saiu da sala.`)]);
  }

  if (state.status === 'LOBBY') {
    if (!isHost) return [];
    if (state.game === 'escalacao') {
      const choice = parseModeChoice(norm, deps.rng);
      if (choice) {
        state.modeId = choice.mode.id;
        state.randomMode = choice.random;
        state.options = { blind: choice.twists.blind, turnSeconds: choice.twists.fast ? 40 : cfg.seconds };
        return save([react(msg, '✅')]);
      }
    } else if (['futebol', 'geral', 'aleatorio', 'conhecimentos gerais'].includes(norm)) {
      const cat = parseCategory(norm);
      state.category = cat === 'aleatorio' ? null : cat;
      return save([react(msg, '✅')]);
    }
    if (['comecar', 'começar', 'iniciar', 'valendo', 'bora'].includes(norm)) {
      if (state.players.length < cfg.minPlayers) {
        return [text(`Precisa de pelo menos ${cfg.minPlayers} jogadores. Mandem *entrar*.`)];
      }
      return save(state.game === 'escalacao' ? startEscalacao(state, deps) : startTop10(state, deps));
    }
    return [];
  }

  if (state.status !== 'PLAYING' || !player) return [];

  if (norm === 'pular' && isHost) {
    return save(state.game === 'escalacao' ? closeRound(state, deps, 'Rodada encerrada pelo anfitrião.') : finishTop10(state, deps, 'Encerrado pelo anfitrião.'));
  }

  return state.game === 'escalacao'
    ? escalacaoAnswer(state, player, msg, deps, save)
    : top10Answer(state, player, msg, deps, save);
}

/** Chamado pelo agendador (QStash) no prazo da rodada. `force` = simulador. */
export async function handlePartyTick(
  match: Session,
  token: string | null,
  deps: PartyDeps,
  force = false,
): Promise<Outgoing[]> {
  const state = match.state as PartyState;
  if (state.status !== 'PLAYING') return [];
  if (!force) {
    if (token !== state.timerToken) return []; // rodada já mudou
    if (state.deadline !== null && deps.now.getTime() < state.deadline - 1500) return [];
  }
  const out = closeOnTimeout(state, deps);
  state.updatedAt = deps.now.getTime();
  if (!(await deps.store.saveMatch(match))) throw new ConflictError();
  return out;
}

function closeOnTimeout(state: PartyState, deps: PartyDeps): Outgoing[] {
  return state.game === 'escalacao' ? closeRound(state, deps, 'Tempo esgotado.') : finishTop10(state, deps, 'Tempo esgotado.');
}

function canJoinLate(state: PartyState): boolean {
  const limit = PARTY_CONFIG[state.game].joinUntil;
  if (state.game === 'escalacao') return state.round < limit; // round é 0-based: rodadas 1 e 2
  return state.found.filter(Boolean).length < limit;
}

function warnOnce(state: PartyState, jid: string, message: string, save: (o: Outgoing[]) => Promise<Outgoing[]>) {
  if (state.warned.includes(jid)) return Promise.resolve([] as Outgoing[]);
  state.warned.push(jid);
  return save([text(message)]);
}

function schedule(state: PartyState, seconds: number, nowMs: number, groupKey: string): Outgoing {
  state.seq += 1;
  state.timerToken = `${groupKey}:${state.seq}`;
  state.deadline = nowMs + seconds * 1000;
  return { type: 'schedule', delaySeconds: seconds + 1, token: state.timerToken };
}

function rulesText(state: PartyState): string {
  const cfg = PARTY_CONFIG[state.game];
  const common = [
    `Até ${cfg.maxPlayers} jogadores. Para jogar, mande *entrar*.`,
    `Dá para entrar até ${state.game === 'escalacao' ? `a ${cfg.joinUntil}ª rodada` : `a ${cfg.joinUntil}ª posição revelada`}.`,
    'Respostas repetidas não valem: o que alguém já usou, ninguém mais usa.',
  ];
  if (state.game === 'escalacao') {
    return [
      `*${cfg.name}*`,
      'Todos escalam a mesma posição ao mesmo tempo: goleiro, 2 defensores, 2 meias e 1 atacante.',
      'Cada um manda 1 jogador por rodada. A rodada avança quando todos responderem ou o tempo acabar.',
      ...common,
      'No fim, soma os números do tema. Vence a maior soma (ou a menor, conforme o tema).',
    ].join('\n');
  }
  return [
    `*${cfg.name}*`,
    'O bot mostra um tema de ranking. Acerte itens da lista para revelar a posição.',
    'Ninguém responde duas vezes seguidas: espere outra pessoa responder.',
    ...common,
    'Vence quem acertar mais posições.',
  ].join('\n');
}

function boardImage(state: PartyState, final: boolean): Outgoing {
  if (state.game === 'escalacao') return { type: 'image', image: { kind: 'partyTable', state: structuredClone(state) } };
  const list = getTop10List(state.listId)!;
  return { type: 'image', image: { kind: 'top10Board', state: structuredClone(state), list, final } };
}

// ---------- Escalação em Grupo ----------

function startEscalacao(state: EscalacaoParty, deps: PartyDeps): Outgoing[] {
  let mode = getMode(state.modeId);
  if (!mode) {
    mode = randomMode(deps.rng);
    state.modeId = mode.id;
    state.randomMode = true;
  }
  state.restrictions = drawRestrictions(mode, deps.rng);
  state.status = 'PLAYING';
  state.round = 0;
  state.warned = [];
  for (const p of state.players) state.picks[p.jid] = SLOTS.map(() => null);
  const label = state.randomMode ? `🎲 Tema sorteado: *${mode.name}*` : `Tema: *${mode.name}*`;
  const extras = [state.options.blind ? 'às cegas' : '', state.options.turnSeconds !== PARTY_CONFIG.escalacao.seconds ? 'relâmpago' : '']
    .filter(Boolean)
    .join(', ');
  return [
    {
      type: 'image',
      image: { kind: 'partyTable', state: structuredClone(state) },
      caption: `${label}${extras ? ` (${extras})` : ''} · ${mode.tagline.split(' · ')[0]} · ${mode.direction === 'high' ? 'maior' : 'menor'} soma vence\n${state.players.length} jogadores. Valendo!`,
    },
    text(roundPrompt(state, mode)),
    schedule(state, state.options.turnSeconds ?? PARTY_CONFIG.escalacao.seconds, deps.now.getTime(), 'esc'),
  ];
}

function roundPrompt(state: EscalacaoParty, mode: GameMode): string {
  const slot = POSITION_LABEL[SLOTS[state.round]];
  const secs = state.options.turnSeconds ?? PARTY_CONFIG.escalacao.seconds;
  return (
    `*Rodada ${state.round + 1}/${SLOTS.length} · ${slot.toUpperCase()}*\n` +
    restrictionLine(state.restrictions[state.round]) +
    `Cada um manda 1 ${slot}. Nomes já usados não valem. Tempo: ${secs}s.` +
    (state.round === 0 ? `\nTema: ${mode.name}.` : '')
  );
}

function activePlayers(state: PartyState): PartyPlayer[] {
  return state.players.filter((p) => p.missed < 2);
}

async function escalacaoAnswer(
  state: EscalacaoParty,
  player: PartyPlayer,
  msg: IncomingMessage,
  deps: PartyDeps,
  save: (o: Outgoing[]) => Promise<Outgoing[]>,
): Promise<Outgoing[]> {
  const picks = state.picks[player.jid];
  if (!picks || picks[state.round] !== null) return []; // já respondeu nesta rodada
  if (!looksLikePlayerName(msg.text)) return [];
  const mode = getMode(state.modeId)!;
  const who = firstName(player.name);

  let profile;
  try {
    profile = await deps.lookup(msg.text.trim());
  } catch (error) {
    console.error('lookup failed', error);
    return [text(`*${who}*, a consulta falhou. Manda o nome de novo.`)];
  }
  if (!profile) return [text(`❌ *${who}*: não achei "${msg.text.trim()}". Manda outro.`)];

  const key = normalize(profile.name);
  const typed = normalize(msg.text);
  if (state.used.includes(key) || state.used.includes(typed)) {
    const owner = state.players.find((p) => state.picks[p.jid]?.some((x) => x && (x.key === key || x.aliases?.includes(typed))));
    return [text(`❌ *${who}*: ${profile.name} já foi escalado${owner ? ` por ${firstName(owner.name)}` : ''}. Manda outro.`)];
  }
  const verdict = checkPick(profile, SLOTS[state.round], state.restrictions[state.round], mode, deps.now);
  if (!verdict.ok) return [text(`❌ *${who}*: ${verdict.reason} Manda outro.`)];

  picks[state.round] = { name: profile.name, key, value: verdict.value, ...(typed !== key ? { aliases: [typed] } : {}) };
  state.used.push(key);
  if (typed !== key) state.used.push(typed);
  player.missed = 0;

  const waiting = activePlayers(state).filter((p) => state.picks[p.jid][state.round] === null);
  if (waiting.length > 0) return save([react(msg, '✅')]);
  return save([react(msg, '✅'), ...closeRound(state, deps, 'Todos responderam.')]);
}

function totalOf(state: EscalacaoParty, jid: string): number {
  return (state.picks[jid] ?? []).reduce((acc, p) => acc + (p?.value ?? 0), 0);
}

export function standings(state: EscalacaoParty): Array<{ player: PartyPlayer; total: number }> {
  const mode = getMode(state.modeId)!;
  return state.players
    .map((player) => ({ player, total: totalOf(state, player.jid) }))
    .sort((a, b) => (mode.direction === 'high' ? b.total - a.total : a.total - b.total));
}

function closeRound(state: EscalacaoParty, deps: PartyDeps, reason: string): Outgoing[] {
  const mode = getMode(state.modeId)!;
  const missing: string[] = [];
  for (const p of state.players) {
    const picks = state.picks[p.jid];
    if (picks && picks[state.round] === null) {
      picks[state.round] = { name: 'Sem resposta', key: `none-${p.jid}-${state.round}`, value: mode.penalty };
      p.missed += 1;
      if (p.missed < 99) missing.push(firstName(p.name));
    }
  }
  const note = missing.length ? `\nSem resposta (pior valor do tema): ${missing.join(', ')}.` : '';

  if (state.round === SLOTS.length - 1) return finishEscalacao(state, deps, `${reason}${note}`);

  const finished = state.round + 1;
  state.round += 1;
  state.warned = [];
  return [
    {
      type: 'image',
      image: { kind: 'partyTable', state: structuredClone(state) },
      caption: `${reason} Fim da rodada ${finished}.${note}`,
    },
    text(roundPrompt(state, mode)),
    schedule(state, state.options.turnSeconds ?? PARTY_CONFIG.escalacao.seconds, deps.now.getTime(), 'esc'),
  ];
}

function finishEscalacao(state: EscalacaoParty, deps: PartyDeps, reason: string): Outgoing[] {
  const mode = getMode(state.modeId)!;
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const table = standings(state);
  const lines = table.map((row, i) => `${i + 1}º ${row.player.name} — ${formatNumber(row.total)} ${mode.unit}`);
  const top = table[0];
  const tied = table.filter((r) => r.total === top.total);
  const headline =
    tied.length > 1
      ? `🏆 Empate no topo: ${tied.map((r) => `*${r.player.name}*`).join(' e ')}.`
      : `🏆 *${top.player.name}* venceu com ${formatNumber(top.total)} ${mode.unit}.`;
  pendingResults.set(state, table.map((r) => ({
    player: { jid: r.player.jid, name: r.player.name },
    result: r.total === top.total ? (tied.length > 1 ? 'draw' : 'win') : 'loss',
  })));
  return [
    {
      type: 'image',
      image: { kind: 'partyTable', state: structuredClone(state) },
      caption: `${reason}\n\n${headline}\n${lines.join('\n')}\n\nMande *abrir sala* para jogar de novo.`,
    },
  ];
}

// ---------- Top 10 ----------

function startTop10(state: Top10Party, deps: PartyDeps): Outgoing[] {
  const pool = TOP10_LISTS.filter((l) => !state.category || l.category === state.category);
  const list = pool[Math.floor(deps.rng() * pool.length)];
  state.listId = list.id;
  state.category = list.category;
  state.found = list.items.map(() => null);
  state.status = 'PLAYING';
  state.warned = [];
  const secs = PARTY_CONFIG.top10.seconds;
  return [
    {
      type: 'image',
      image: { kind: 'top10Board', state: structuredClone(state), list, final: false },
      caption:
        `*Top ${list.items.length}: ${list.title}*\n` +
        'Mandem palpites. Cada acerto revela a posição.\n' +
        `Ninguém responde duas vezes seguidas: espere outra pessoa. Tempo: ${Math.round(secs / 60)} min.`,
    },
    schedule(state, secs, deps.now.getTime(), 'top'),
  ];
}

const LEADING_ARTICLE = /^(o|a|os|as) /;

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

/** Índice do item que o palpite acerta, ou -1. Tolera erro de digitação em nomes longos. */
export function matchTop10(list: Top10List, guess: string): number {
  const g = normalize(guess).replace(LEADING_ARTICLE, '');
  if (!g) return -1;
  const forms = list.items.map((item) => [item.name, ...(item.aliases ?? [])].map((f) => normalize(f)));
  const exact = forms.findIndex((fs) => fs.includes(g));
  if (exact !== -1) return exact;
  const tolerance = g.length >= 9 ? 2 : g.length >= 5 ? 1 : 0;
  if (tolerance === 0) return -1;
  return forms.findIndex((fs) => fs.some((f) => f.length >= 5 && editDistance(f, g) <= tolerance));
}

async function top10Answer(
  state: Top10Party,
  player: PartyPlayer,
  msg: IncomingMessage,
  deps: PartyDeps,
  save: (o: Outgoing[]) => Promise<Outgoing[]>,
): Promise<Outgoing[]> {
  if (!looksLikePlayerName(msg.text)) return [];
  const list = getTop10List(state.listId)!;
  const who = firstName(player.name);

  if (state.lastJid === player.jid) {
    return warnOnce(state, player.jid, `*${who}*, espere outra pessoa responder antes do próximo palpite.`, save);
  }

  const index = matchTop10(list, msg.text);
  const guessKey = index === -1 ? normalize(msg.text).replace(LEADING_ARTICLE, '') : `#${index}`;
  if (state.guesses.includes(guessKey)) {
    if (index !== -1) return [text(`*${list.items[index].name}* já foi revelado (${rankLabel(list, index)}).`)];
    return [text(`*${msg.text.trim()}* já foi tentado. Não conta como palpite.`)];
  }

  state.guesses.push(guessKey);
  state.lastJid = player.jid;
  state.warned = []; // alguém respondeu: libera quem estava esperando

  if (index === -1) return save([react(msg, '❌')]);

  state.found[index] = { jid: player.jid, name: player.name };
  player.hits += 1;
  player.score += 1;
  player.lastHitAt = deps.now.getTime();
  const item = list.items[index];
  const out: Outgoing[] = [text(`✅ *${who}* acertou: *${rankLabel(list, index)}* — ${item.name}${item.detail ? ` (${item.detail})` : ''}`)];

  const foundCount = state.found.filter(Boolean).length;
  if (foundCount === list.items.length) return save([...out, ...finishTop10(state, deps, 'Lista completa!')]);
  if (foundCount === Math.ceil(list.items.length / 2)) out.push(boardImage(state, false));
  return save(out);
}

function rankLabel(list: Top10List, index: number): string {
  const rank = list.items[index].rank;
  const tie = list.items.filter((i) => i.rank === rank).length > 1;
  return `${rank}º lugar${tie ? ' (empate)' : ''}`;
}

function finishTop10(state: Top10Party, deps: PartyDeps, reason: string): Outgoing[] {
  const list = getTop10List(state.listId)!;
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const ranked = [...state.players].sort((a, b) => b.hits - a.hits || a.lastHitAt - b.lastHitAt);
  const best = ranked[0];
  const tied = ranked.filter((p) => p.hits === best.hits && p.lastHitAt === best.lastHitAt);
  const lines = ranked.map((p, i) => `${i + 1}º ${p.name} — ${p.hits} acerto${p.hits === 1 ? '' : 's'}`);
  const headline =
    best.hits === 0
      ? 'Ninguém acertou nada desta vez.'
      : tied.length > 1
        ? `🏆 Empate: ${tied.map((p) => `*${p.name}*`).join(' e ')}.`
        : `🏆 *${best.name}* venceu com ${best.hits} acerto${best.hits === 1 ? '' : 's'}.`;
  pendingResults.set(
    state,
    ranked.map((p) => ({
      player: { jid: p.jid, name: p.name },
      result: best.hits > 0 && p.hits === best.hits && p.lastHitAt === best.lastHitAt ? (tied.length > 1 ? 'draw' : 'win') : 'loss',
    })),
  );
  return [
    {
      type: 'image',
      image: { kind: 'top10Board', state: structuredClone(state), list, final: true },
      caption: `${reason}\n\n${headline}\n${lines.join('\n')}\nFonte: ${list.source}.\n\nMande *top 10* para outra lista.`,
    },
  ];
}

// ---------- Resultado ----------

/**
 * Resultados calculados no fim da sala. São gravados no ranking só depois que
 * o estado final foi salvo (para não contar duas vezes se houver conflito).
 */
const pendingResults = new WeakMap<PartyState, Array<{ player: MatchPlayer; result: 'win' | 'draw' | 'loss' }>>();

async function finishAndSave(
  state: PartyState,
  deps: PartyDeps,
  save: (o: Outgoing[]) => Promise<Outgoing[]>,
  reason: string,
): Promise<Outgoing[]> {
  const out = state.game === 'escalacao' ? finishEscalacao(state, deps, reason) : finishTop10(state, deps, reason);
  return save(out);
}

/** Depois de salvar o estado final, grava vitórias/derrotas no ranking do grupo. */
export async function recordPartyIfFinished(match: Session, store: Store): Promise<void> {
  const state = match.state as PartyState;
  const rows = pendingResults.get(state);
  if (state.status !== 'FINISHED' || !rows) return;
  pendingResults.delete(state);
  await store.recordResults(match.groupJid, rows);
}

export { TOP10_CATEGORIES };
