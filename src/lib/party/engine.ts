import { ConflictError } from '../game/conflict';
import { FAST_TURN_SECONDS, GameMode, MODES, getMode, parseModeChoice, randomMode } from '../game/modes';
import { firstName, formatNumber, isChatter as isChatterText, looksLikePlayerName, normalize } from '../game/text';
import {
  EscalacaoParty,
  IncomingMessage,
  IntrusoParty,
  QuizParty,
  RodadaParty,
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
import { checkPick, drawRestrictions, playContext, restrictionLine } from '../game/validate';
import type { Store } from '../store/types';
import {
  LEADING_ARTICLE,
  PARTY_CONFIG,
  PartyDeps,
  activePlayers,
  editDistance,
  finishByScore,
  pauseBeforeNext,
  pendingResults,
  react,
  schedule,
  text,
  warnOnce,
} from './common';
import { CHUTE_QUESTIONS } from './content/chute';
import { EMOJI_CARDS, RELAMPAGO_CARDS } from './content/cards';
import { INTRUSO_SETS } from './content/intruso';
import { WHOIS } from './content/whois';
import type { ContentCategory } from '../game/types';
import { TOP10_CATEGORIES, TOP10_LISTS, getTop10List, top10Theme } from './top10-lists';
import { melhorTimeAnswer, melhorTimeTimeout, melhorTimeVote, newMelhorTime, startMelhorTime } from './melhortime';
import { ALFABETO_RULES, alfabetoAnswer, closeAlfabetoRound, finishAlfabeto, newAlfabeto, openAlfabetoRound, startAlfabeto } from './alfabeto';
import { CHUTE_RULES, chuteAnswer, closeChuteRound, finishChute, newChute, openChuteRound, startChute } from './chute';
import { INTRUSO_RULES, finishIntruso, intrusoAnswer, intrusoTimeout, newIntruso, openIntrusoRound, revealRound, startIntruso } from './intruso';
import { SOBREVIVENTE_RULES, finishSobrevivente, newSobrevivente, sobreviventeAnswer, sobreviventeTimeout, startSobrevivente } from './sobrevivente';
import { CONEXOES_RULES, closeConexoesRound, conexoesAnswer, newConexoes, openConexoesRound, startConexoes } from './conexoes';
import { STOP_RULES, closeStopRound, newStop, openStopRound, startStop, stopAnswer } from './stop';
import { DRAFT_RULES, closeVoting, draftAnswer, draftRows, draftTimeout, draftVote, newDraft, startDraft } from './draft';
import { FATO_RULES, LINHA_RULES, closeRodadaRound, newRodada, openRodadaRound, rodadaAnswer, startRodada } from './rodada';
import { CONEXOES } from './content/conexoes';
import { FACTS } from './content/fato';
import { TIMELINE } from './content/linha';
import { SURVIVOR_LISTS } from './content/sobrevivente';
import { closeQuizRound, finishQuiz, newQuiz, openQuizRound, quizAnswer, quizRules, quizTimeout, scoreImage, startQuiz } from './quiz';
import { MODULES, isBaseGame, moduleBoard, moduleOf } from './modules';
import { anagramThemesText, newAnagrama } from './anagrama';
import { matchTop100, newTop100, playedTodayKey } from './top100';
import { dayKey, getTop100 } from './content/top100';
import { ANAGRAMS, findAnagramTheme } from './content/anagramas';
import { ONE_X_ONE, freshFirst, freshPick } from './common';

const LOBBY_TTL_MS = 15 * 60_000;
const IDLE_TTL_MS = 20 * 60_000;

/**
 * Modo em Grupo: uma sala onde quem manda "entrar" joga.
 * Regras comuns: 1 resposta por jogador por rodada, nada se repete na partida,
 * limite de jogadores por jogo e entrada tardia só até a 2ª rodada.
 */

// ---------- Início ----------

/** "abrir sala", "jogo em grupo", "escalação em grupo" (+ tema) · "top 10" (+ categoria). */
export function parsePartyStart(norm: string): { game: PartyGame; rest: string } | null {
  // Só abre sala se o que vier depois for vazio ou uma opção válida: assim
  // "top 10 melhores do mundo" ou "abrir sala de aula" na conversa não abrem nada.
  const top = norm.match(/^(abrir )?top ?10( (.*))?$/);
  if (top) {
    const rest = top[3] ?? '';
    const ok = !rest || ['futebol', 'geral', 'conhecimentos gerais', 'politica', 'aleatorio', 'aleatoria', 'surpresa'].includes(rest);
    return ok ? { game: 'top10', rest } : null;
  }
  // Quiz: exige "abrir"/"jogar" na frente, porque "que time é esse?" e "quem é?" aparecem na conversa.
  if (/^(abrir|jogar) (o )?que time e esse$/.test(norm) || /^(abrir|jogar) qual e o time$/.test(norm)) return { game: 'quetime', rest: '' };
  const cats = '(futebol|geral|historia|politica|anime)';
  const qe = norm.match(new RegExp(`^(abrir|jogar) quem e( o craque)?( ${cats})?$`));
  if (qe) return { game: 'quemeh', rest: qe[4] ?? '' };
  const em = norm.match(new RegExp(`^(abrir|jogar) (o )?emoji( ${cats})?$`));
  if (em) return { game: 'emoji', rest: em[4] ?? '' };
  if (/^(abrir|jogar) (o )?alfabeto$/.test(norm)) return { game: 'alfabeto', rest: '' };
  const ch = norm.match(new RegExp(`^(abrir|jogar) (o )?chute certo( ${cats})?$`));
  if (ch) return { game: 'chute', rest: ch[4] ?? '' };
  const rl = norm.match(new RegExp(`^(abrir|jogar) (o )?(quiz )?relampago( ${cats})?$`));
  if (rl) return { game: 'relampago', rest: rl[5] ?? '' };
  const intr = norm.match(/^(abrir|jogar) (o )?(intruso|quem nao pertence)( (futebol|geral|politica))?$/);
  if (intr) return { game: 'intruso', rest: intr[5] ?? '' };
  if (/^(abrir|jogar) (o )?(bandeiraco|bandeiras|bandeira)$/.test(norm)) return { game: 'bandeira', rest: '' };
  const sv = norm.match(new RegExp(`^(abrir|jogar) (o )?sobrevivente( ${cats})?$`));
  if (sv) return { game: 'sobrevivente', rest: sv[4] ?? '' };
  const cx = norm.match(new RegExp(`^(abrir|jogar) (o )?(conexoes|jogo das conexoes)( ${cats})?$`));
  if (cx) return { game: 'conexoes', rest: cx[5] ?? '' };
  if (/^(abrir|jogar) (o )?(stop|adedonha|adedanha)$/.test(norm)) return { game: 'stop', rest: '' };
  if (/^(abrir|jogar) (o )?draft( da resenha)?$/.test(norm)) return { game: 'draft', rest: '' };
  const lt = norm.match(new RegExp(`^(abrir|jogar) (a )?linha do tempo( ${cats})?$`));
  if (lt) return { game: 'linha', rest: lt[4] ?? '' };
  const ff = norm.match(new RegExp(`^(abrir|jogar) (o )?fato ou fake( ${cats})?$`));
  if (ff) return { game: 'fato', rest: ff[4] ?? '' };
  // Jogos gerados da base de jogadores.
  if (/^(abrir|jogar) (a )?carreira$/.test(norm)) return { game: 'carreira', rest: '' };
  if (/^(abrir|jogar) (a )?ponte$/.test(norm)) return { game: 'ponte', rest: '' };
  if (/^(abrir|jogar) (o )?leilao( de craques)?$/.test(norm)) return { game: 'leilao', rest: '' };
  if (/^((abrir|jogar) )?(o )?top ?100( do dia)?$/.test(norm) || norm === 'desafio do dia') return { game: 'top100', rest: '' };
  const ana = norm.match(/^(abrir|jogar) (o )?anagramas?(?: (?:de |do |da |dos |das )?(.+))?$/);
  if (ana) return { game: 'anagrama', rest: ana[3] ?? '' };
  if (/^(abrir|jogar|desafio) (a )?(grade|grade 3x3|grade 3 x 3|jogo da velha)$/.test(norm)) return { game: 'grade', rest: '' };
  if (/^(abrir|jogar|desafio) (os )?(penaltis|penalti|disputa de penaltis)$/.test(norm)) return { game: 'penaltis', rest: '' };
  const mt = norm.match(/^(iniciar|abrir|jogar|desafio) (o )?melhor time((?: (?:ia|votacao|grupo|dificil))*)$/);
  if (mt) return { game: 'melhortime', rest: mt[3].trim() };
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
      options: { blind: choice?.twists.blind ?? false, turnSeconds: choice?.twists.fast ? 40 : PARTY_CONFIG.escalacao.seconds, hard: choice?.twists.hard ?? false },
      restrictions: [],
      round: -1,
      picks: {},
      used: [],
    };
  } else if (start.game === 'melhortime') {
    const words = start.rest.split(' ');
    state = {
      ...base('melhortime', host, nowMs),
      ...newMelhorTime(words.includes('votacao') || words.includes('grupo') ? 'votacao' : 'ia', words.includes('dificil')),
    };
  } else if (start.game === 'top100') {
    // Uma vez por dia em cada grupo.
    const day = dayKey(deps.now);
    const seen = await deps.store.getSeen(msg.groupJid, 'top100').catch(() => [] as string[]);
    if (seen.includes(playedTodayKey(day))) {
      return [text('O *Top 100 do Dia* de hoje já foi jogado neste grupo. Amanhã tem lista nova (vira à meia-noite de Brasília).')];
    }
    state = { ...base('top100', host, nowMs), ...newTop100(deps.now) } as PartyState;
  } else if (start.game === 'anagrama') {
    // "abrir anagrama capitais": tema escolhido; "futebol"/"geral": a categoria toda.
    const rest = start.rest.trim();
    const theme = rest && !['futebol', 'geral'].includes(rest) ? findAnagramTheme(rest) : undefined;
    if (rest && !['futebol', 'geral'].includes(rest) && !theme) return [text(anagramThemesText(`Não achei o tema "${rest}".`))];
    state = { ...base('anagrama', host, nowMs), ...newAnagrama(theme ? theme.category : contentCategory(rest, ANAGRAMS), theme?.theme ?? null) } as PartyState;
  } else if (MODULES[start.game]) {
    state = { ...base(start.game, host, nowMs), ...MODULES[start.game]!.create() } as PartyState;
  } else if (start.game === 'alfabeto') {
    state = { ...base('alfabeto', host, nowMs), ...newAlfabeto() };
  } else if (start.game === 'sobrevivente') {
    state = { ...base('sobrevivente', host, nowMs), ...newSobrevivente(contentCategory(start.rest, SURVIVOR_LISTS)) };
  } else if (start.game === 'conexoes') {
    state = { ...base('conexoes', host, nowMs), ...newConexoes(contentCategory(start.rest, CONEXOES, 1)) };
  } else if (start.game === 'stop') {
    state = { ...base('stop', host, nowMs), ...newStop() };
  } else if (start.game === 'draft') {
    state = { ...base('draft', host, nowMs), ...newDraft() };
  } else if (start.game === 'linha') {
    state = { ...base('linha', host, nowMs), ...newRodada('linha', contentCategory(start.rest, TIMELINE, 16)) };
  } else if (start.game === 'fato') {
    state = { ...base('fato', host, nowMs), ...newRodada('fato', contentCategory(start.rest, FACTS)) };
  } else if (start.game === 'chute') {
    state = { ...base('chute', host, nowMs), ...newChute(contentCategory(start.rest, CHUTE_QUESTIONS)) };
  } else if (start.game === 'intruso') {
    state = { ...base('intruso', host, nowMs), ...newIntruso(contentCategory(start.rest, INTRUSO_SETS)) };
  } else if (start.game === 'quetime' || start.game === 'quemeh' || start.game === 'emoji' || start.game === 'relampago' || start.game === 'bandeira') {
    const pool = start.game === 'quemeh' ? WHOIS : start.game === 'emoji' ? EMOJI_CARDS : start.game === 'relampago' ? RELAMPAGO_CARDS : [];
    state = { ...base(start.game, host, nowMs), ...newQuiz(start.game, contentCategory(start.rest, pool)) };
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
  if (state.game === 'melhortime') {
    return [
      `*Desafio: Melhor Time*`,
      `*${state.host.name}* quer jogo. O primeiro que mandar *aceitar* entra.`,
      state.judge === 'ia'
        ? 'Juiz: a IA. Para a votação do grupo decidir, o anfitrião manda *votação* antes.'
        : 'Juiz: votação de quem não jogar. Para a IA decidir, o anfitrião manda *ia* antes.',
    ].join('\n');
  }
  if (ONE_X_ONE.includes(state.game)) {
    return [`*Desafio: ${cfg.name}*`, `*${state.host.name}* quer jogo. O primeiro que mandar *aceitar* entra e a partida começa.`].join('\n');
  }
  const lines = [`*Sala aberta: ${cfg.name}*`, `Quem quiser jogar, mande *entrar* (até ${cfg.maxPlayers} pessoas).`];
  if (state.game === 'escalacao') {
    const mode = getMode(state.modeId);
    lines.push(
      mode
        ? `Tema: *${mode.name}*. ${state.host.name}, mande *começar* quando todos entrarem.`
        : `${state.host.name}, escolha o tema (número de 1 a ${MODES.length} ou *aleatório*) e mande *começar*.`,
    );
  } else if (state.game === 'top10') {
    lines.push(
      `${state.host.name}, escolha a categoria (*futebol*, *geral*, *política* ou *aleatório*) e mande *começar*.`,
    );
  } else {
    lines.push(`${state.host.name}, mande *começar* quando todos entrarem.`);
  }
  return lines.join('\n');
}

const CATEGORY_WORDS: Array<[string, ContentCategory]> = [
  ['fut', 'futebol'],
  ['polit', 'politica'],
  ['hist', 'historia'],
  ['anime', 'anime'],
  ['ger', 'geral'],
  ['conhec', 'geral'],
];

/** Categoria pedida no comando, só se o jogo tiver conteúdo suficiente nela; senão, mistura (sem política). */
function contentCategory(rest: string, pool: ReadonlyArray<{ category?: ContentCategory }>, min = 3): ContentCategory | null {
  const word = normalize(rest).split(' ')[0] ?? '';
  const cat = CATEGORY_WORDS.find(([prefix]) => word.startsWith(prefix))?.[1];
  if (!cat) return null;
  return pool.filter((x) => (x.category ?? 'futebol') === cat).length >= min ? cat : null;
}

function parseCategory(rest: string): Top10List['category'] | 'aleatorio' {
  if (rest.startsWith('fut')) return 'futebol';
  if (rest.startsWith('polit')) return 'politica';
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

  const save = async (raw: Outgoing[]): Promise<Outgoing[]> => {
    const out = skipPauseIfDisabled(state, deps, raw);
    state.updatedAt = nowMs;
    if (!(await deps.store.saveMatch(match))) throw new ConflictError();
    return out;
  };

  // Rodada vencida sem o agendador ter chegado: fecha antes de qualquer coisa.
  if (state.status === 'PLAYING' && state.deadline !== null && nowMs >= state.deadline) {
    return save(await closeOnTimeout(state, deps));
  }

  if (norm === 'regras') return [text(rulesText(state))];

  if (norm === 'encerrar' || norm === 'cancelar') {
    if (!isHost) return [];
    if (state.status === 'LOBBY') {
      state.status = 'CANCELLED';
      return save([text('Sala cancelada.')]);
    }
    if (state.game === 'melhortime') {
      state.status = 'CANCELLED';
      return save([text('Partida cancelada.')]);
    }
    return finishAndSave(state, deps, save, 'Partida encerrada pelo anfitrião.');
  }

  if (norm === 'placar' || norm === 'tabela' || norm === 'lista') {
    if (state.status !== 'PLAYING') return [];
    return [boardImage(state, false)];
  }

  const joinWords = ['entrar', 'entrar no jogo', 'eu', 'eu jogo', 'to dentro', 'quero jogar'];
  const oneXOne = ONE_X_ONE.includes(state.game);
  if (joinWords.includes(norm) || (oneXOne && norm === 'aceitar')) {
    if (player) {
      return oneXOne && player.jid === state.host.jid && state.status === 'LOBBY'
        ? [text('Você não pode aceitar o próprio desafio. Chama alguém.')]
        : [];
    }
    if (state.players.length >= cfg.maxPlayers) {
      if (oneXOne) return []; // desafio 1 x 1 já fechado
      return warnOnce(state, msg.senderJid, `Sala cheia (${cfg.maxPlayers}/${cfg.maxPlayers}). Fica para a próxima, *${msg.senderName}*.`, save);
    }
    if (state.status === 'PLAYING' && !canJoinLate(state)) {
      const limit = state.game === 'top10' ? `${cfg.joinUntil} posições reveladas` : `a ${cfg.joinUntil}ª rodada`;
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
    if (state.game === 'melhortime' && state.status === 'LOBBY' && state.players.length === 2) {
      return save([text(`*${joined.name}* aceitou.`), ...startMelhorTime(state, deps)]);
    }
    if (oneXOne && isBaseGame(state) && state.status === 'LOBBY' && state.players.length === 2) {
      return save([text(`*${joined.name}* aceitou.`), ...(await moduleOf(state).start(state, deps))]);
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
        state.options = { blind: choice.twists.blind, turnSeconds: choice.twists.fast ? 40 : cfg.seconds, hard: choice.twists.hard };
        return save([react(msg, '✅')]);
      }
    } else if (state.game === 'melhortime' && ['ia', 'votacao', 'votacao do grupo', 'grupo'].includes(norm)) {
      state.judge = norm === 'ia' ? 'ia' : 'votacao';
      return save([react(msg, '✅')]);
    } else if (state.game === 'top10' && ['futebol', 'geral', 'politica', 'aleatorio', 'conhecimentos gerais'].includes(norm)) {
      const cat = parseCategory(norm);
      state.category = cat === 'aleatorio' ? null : cat;
      return save([react(msg, '✅')]);
    }
    if (['comecar', 'começar', 'iniciar', 'valendo', 'bora'].includes(norm)) {
      if (state.players.length < cfg.minPlayers) {
        return [text(`Precisa de pelo menos ${cfg.minPlayers} jogadores. Mandem *entrar*.`)];
      }
      // Sem repetição: o sorteio prioriza o que este grupo ainda não viu neste jogo.
      const seen = await deps.store.getSeen(msg.groupJid, state.game).catch(() => [] as string[]);
      const sdeps: PartyDeps = { ...deps, seen };
      const begin = async (out: Outgoing[]) => {
        const result = await save(out);
        const items = seenItems(state);
        if (state.status === 'PLAYING' && items.length) await deps.store.markSeen(msg.groupJid, state.game, items).catch(() => undefined);
        return result;
      };
      if (isBaseGame(state)) return begin(await moduleOf(state).start(state, sdeps));
      if (state.game === 'escalacao') return begin(startEscalacao(state, sdeps));
      if (state.game === 'top10') return begin(startTop10(state, sdeps));
      if (state.game === 'intruso') return begin(startIntruso(state, sdeps));
      if (state.game === 'melhortime') return begin(startMelhorTime(state, sdeps));
      if (state.game === 'alfabeto') return begin(startAlfabeto(state, sdeps));
      if (state.game === 'chute') return begin(startChute(state, sdeps));
      if (state.game === 'sobrevivente') return begin(startSobrevivente(state, sdeps));
      if (state.game === 'conexoes') return begin(startConexoes(state, sdeps));
      if (state.game === 'stop') return begin(startStop(state, sdeps));
      if (state.game === 'draft') return begin(startDraft(state, sdeps));
      if (isRodada(state)) return begin(startRodada(state, sdeps));
      return begin(startQuiz(state, sdeps));
    }
    return [];
  }

  // Melhor Time: na votação, quem decide é quem NÃO jogou.
  if (state.status === 'PLAYING' && state.game === 'melhortime' && state.phase === 'voting') {
    return melhorTimeVote(state, msg, save);
  }

  // Draft da Resenha: na votação, qualquer pessoa do grupo vota.
  if (state.status === 'PLAYING' && state.game === 'draft' && state.phase === 'voting') {
    if (norm === 'pular' && isHost) return save(closeVoting(state, 'Votação encerrada pelo anfitrião.'));
    return draftVote(state, msg, save);
  }

  // Top 100 do Dia: quem mandar um palpite com o jogo rolando já entra.
  const top100Guess = (s: typeof state) =>
    s.game === 'top100' && (!isChatterText(msg.text) || matchTop100(getTop100(s.listId)!, msg.text).length > 0);
  if (state.status === 'PLAYING' && !player && state.game === 'top100' && top100Guess(state) && state.players.length < cfg.maxPlayers) {
    const joined = newPlayer({ jid: msg.senderJid, name: msg.senderName });
    state.players.push(joined);
    return moduleOf(state).answer(state, joined, msg, deps, save);
  }

  if (state.status !== 'PLAYING' || !player) return [];

  // Pausa entre rodadas: só "próxima" (de quem joga) adianta; o resto é ignorado.
  if (state.intermission) {
    if (NEXT_WORDS.includes(norm) || (norm === 'pular' && isHost)) return save(resumeNext(state, deps));
    return [];
  }

  // "próxima" no meio da rodada (anfitrião): revela e já abre a seguinte, sem pausa.
  if (NEXT_WORDS.includes(norm) && !isHost) return []; // comando, nunca palpite
  if (NEXT_WORDS.includes(norm) && isHost && !['melhortime', 'top10', 'sobrevivente', 'draft', 'grade', 'penaltis'].includes(state.game)) {
    const out = await skipRound(state, deps);
    if (state.status === 'PLAYING' && state.intermission) {
      const next = resumeNext(state, deps);
      return save([...out.filter((o) => o.type !== 'schedule' && !(o.type === 'text' && o.text.startsWith('Próxima rodada em'))), ...next]);
    }
    return save(out);
  }

  if (norm === 'pular' && isHost) {
    if (state.game === 'melhortime') return [];
    if (isBaseGame(state)) return save(moduleOf(state).skip(state, deps));
    if (state.game === 'escalacao') return save(closeRound(state, deps, 'Rodada encerrada pelo anfitrião.'));
    if (state.game === 'top10') return save(finishTop10(state, deps, 'Encerrado pelo anfitrião.'));
    if (state.game === 'intruso') return save(revealRound(state, deps, 'Rodada encerrada pelo anfitrião.'));
    if (state.game === 'alfabeto') return save(closeAlfabetoRound(state, deps, 'Rodada encerrada pelo anfitrião.'));
    if (state.game === 'chute') return save(closeChuteRound(state, deps, 'Rodada encerrada pelo anfitrião.'));
    if (state.game === 'sobrevivente') return save(sobreviventeTimeout(state, deps));
    if (state.game === 'conexoes') return save(closeConexoesRound(state, deps, 'Rodada encerrada pelo anfitrião.'));
    if (state.game === 'stop') return save(await closeStopRound(state, deps, 'Rodada encerrada pelo anfitrião.'));
    if (state.game === 'draft') return save(draftTimeout(state, deps));
    if (isRodada(state)) return save(closeRodadaRound(state, deps, 'Rodada encerrada pelo anfitrião.'));
    return save(closeQuizRound(state, deps, 'Rodada pulada pelo anfitrião.'));
  }

  if (isBaseGame(state)) return moduleOf(state).answer(state, player, msg, deps, save);
  if (state.game === 'escalacao') return escalacaoAnswer(state, player, msg, deps, save);
  if (state.game === 'top10') return top10Answer(state, player, msg, deps, save);
  if (state.game === 'intruso') return intrusoAnswer(state, player, msg, deps, save);
  if (state.game === 'melhortime') return melhorTimeAnswer(state, player, msg, deps, save);
  if (state.game === 'alfabeto') return alfabetoAnswer(state, player, msg, deps, save);
  if (state.game === 'chute') return chuteAnswer(state, player, msg, deps, save);
  if (state.game === 'sobrevivente') return sobreviventeAnswer(state, player, msg, deps, save);
  if (state.game === 'conexoes') return conexoesAnswer(state, player, msg, deps, save);
  if (state.game === 'stop') return stopAnswer(state, player, msg, deps, save);
  if (state.game === 'draft') return draftAnswer(state, player, msg, deps, save);
  if (isRodada(state)) return rodadaAnswer(state, player, msg, deps, save);
  return quizAnswer(state, player, msg, deps, save);
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
  const out = skipPauseIfDisabled(state, deps, await closeOnTimeout(state, deps));
  state.updatedAt = deps.now.getTime();
  if (!(await deps.store.saveMatch(match))) throw new ConflictError();
  return out;
}

/** Encerra a rodada atual como o "pular" do anfitrião. */
async function skipRound(state: PartyState, deps: PartyDeps): Promise<Outgoing[]> {
  const reason = 'Rodada encerrada pelo anfitrião.';
  if (isBaseGame(state)) return moduleOf(state).skip(state, deps);
  switch (state.game) {
    case 'escalacao':
      return closeRound(state, deps, reason);
    case 'intruso':
      return revealRound(state, deps, reason);
    case 'alfabeto':
      return closeAlfabetoRound(state, deps, reason);
    case 'chute':
      return closeChuteRound(state, deps, reason);
    case 'conexoes':
      return closeConexoesRound(state, deps, reason);
    case 'stop':
      return closeStopRound(state, deps, reason);
    case 'linha':
    case 'fato':
      return closeRodadaRound(state, deps, reason);
    case 'quetime':
    case 'quemeh':
    case 'emoji':
    case 'relampago':
    case 'bandeira':
      return closeQuizRound(state, deps, 'Rodada pulada pelo anfitrião.');
    default:
      return [];
  }
}

/** Fim da pausa entre rodadas: abre a próxima rodada do jogo. */
function resumeNext(state: PartyState, deps: PartyDeps): Outgoing[] {
  state.intermission = false;
  if (isBaseGame(state)) return moduleOf(state).resume?.(state, deps) ?? [];
  switch (state.game) {
    case 'escalacao': {
      const mode = getMode(state.modeId)!;
      return [text(roundPrompt(state, mode)), schedule(state, state.options.turnSeconds ?? PARTY_CONFIG.escalacao.seconds, deps.now.getTime(), 'esc')];
    }
    case 'quetime':
    case 'quemeh':
    case 'emoji':
    case 'relampago':
    case 'bandeira':
      return openQuizRound(state, deps);
    case 'chute':
      return openChuteRound(state, deps);
    case 'alfabeto':
      return openAlfabetoRound(state, deps);
    case 'intruso':
      return openIntrusoRound(state, deps);
    case 'conexoes':
      return openConexoesRound(state, deps);
    case 'stop':
      return openStopRound(state, deps);
    case 'linha':
    case 'fato':
      return openRodadaRound(state, deps);
    default:
      return [];
  }
}

/** PARTY_PAUSE=0 (testes antigos): sem pausa, a próxima rodada abre na hora. */
function skipPauseIfDisabled(state: PartyState, deps: PartyDeps, out: Outgoing[]): Outgoing[] {
  if (process.env.PARTY_PAUSE !== '0' || !state.intermission || state.status !== 'PLAYING') return out;
  const kept = out.filter((o) => o.type !== 'schedule' && !(o.type === 'text' && o.text.startsWith('Próxima rodada em')));
  return [...kept, ...resumeNext(state, deps)];
}

const NEXT_WORDS = ['proxima', 'proximo', 'prox', 'proxima rodada', 'proxima pergunta', 'seguir', 'next'];

async function closeOnTimeout(state: PartyState, deps: PartyDeps): Promise<Outgoing[]> {
  if (state.intermission) return resumeNext(state, deps);
  if (isBaseGame(state)) return moduleOf(state).timeout(state, deps);
  if (state.game === 'melhortime') return melhorTimeTimeout(state, deps);
  if (state.game === 'escalacao') return closeRound(state, deps, 'Tempo esgotado.');
  if (state.game === 'top10') return finishTop10(state, deps, 'Tempo esgotado.');
  if (state.game === 'intruso') return intrusoTimeout(state, deps);
  if (state.game === 'alfabeto') return closeAlfabetoRound(state, deps, 'Tempo esgotado.');
  if (state.game === 'chute') return closeChuteRound(state, deps, 'Tempo esgotado.');
  if (state.game === 'sobrevivente') return sobreviventeTimeout(state, deps);
  if (state.game === 'conexoes') return closeConexoesRound(state, deps, 'Tempo esgotado.');
  if (state.game === 'stop') return closeStopRound(state, deps, 'Tempo esgotado.');
  if (state.game === 'draft') return draftTimeout(state, deps);
  if (isRodada(state)) return closeRodadaRound(state, deps, 'Tempo esgotado.');
  return quizTimeout(state, deps);
}

function canJoinLate(state: PartyState): boolean {
  const limit = PARTY_CONFIG[state.game].joinUntil;
  if (state.game === 'melhortime') return false;
  if (state.game === 'top10') return state.found.filter(Boolean).length < limit;
  return state.round < limit; // round é 0-based: rodadas 1 e 2
}



function rulesText(state: PartyState): string {
  const cfg = PARTY_CONFIG[state.game];
  const common = [
    `Até ${cfg.maxPlayers} jogadores. Para jogar, mande *entrar*.`,
    `Dá para entrar até ${state.game === 'top10' ? `a ${cfg.joinUntil}ª posição revelada` : `a ${cfg.joinUntil}ª rodada`}.`,
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
  if (state.game === 'quetime' || state.game === 'quemeh' || state.game === 'emoji' || state.game === 'relampago' || state.game === 'bandeira') {
    return [`*${cfg.name}*`, ...quizRules(state), ...common.slice(0, 2)].join('\n');
  }
  if (isBaseGame(state)) {
    const own = moduleOf(state).rules;
    return ONE_X_ONE.includes(state.game)
      ? [`*${cfg.name}* (1 x 1)`, ...own].join('\n')
      : [`*${cfg.name}*`, ...own, common[0], common[1]].join('\n');
  }
  const extra: Partial<Record<PartyGame, string[]>> = {
    sobrevivente: SOBREVIVENTE_RULES,
    conexoes: CONEXOES_RULES,
    stop: STOP_RULES,
    draft: DRAFT_RULES,
    linha: LINHA_RULES,
    fato: FATO_RULES,
  };
  const own = extra[state.game];
  if (own) return [`*${cfg.name}*`, ...own, common[0], cfg.joinUntil > 0 ? common[1] : 'Ninguém entra depois de começar.'].join('\n');
  if (state.game === 'melhortime') {
    return [
      `*${cfg.name}* (1 x 1)`,
      'A cada rodada sai um clube. Na sua vez, escolha um jogador que passou por ele e a posição: *atacante Fulano*.',
      'A ordem das posições é livre: GOL, 2 DEF, 2 MEI e 1 ATA. Ninguém repete jogador.',
      state.judge === 'ia' ? 'No fim, a IA decide qual time ficou melhor.' : 'No fim, quem não jogou vota: *1* ou *2*.',
    ].join('\n');
  }
  if (state.game === 'alfabeto') return [`*${cfg.name}*`, ...ALFABETO_RULES, ...common.slice(0, 2)].join('\n');
  if (state.game === 'chute') return [`*${cfg.name}*`, ...CHUTE_RULES, ...common.slice(0, 2)].join('\n');
  if (state.game === 'intruso') {
    return [`*${cfg.name}*`, 'O bot mostra 5 nomes: 4 têm algo em comum e 1 é o intruso.', ...INTRUSO_RULES, ...common.slice(0, 2)].join('\n');
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
  if (isBaseGame(state)) return moduleBoard(state, final);
  if (state.game === 'escalacao') return { type: 'image', image: { kind: 'partyTable', state: structuredClone(state) } };
  if (state.game === 'melhortime') return { type: 'image', image: { kind: 'draftBoard', state: structuredClone(state) } };
  if (state.game === 'draft') {
    return { type: 'image', image: { kind: 'textBoard', game: 'draft', title: 'Os times', subtitle: `Rodada ${state.round + 1} de ${state.totalRounds}`, rows: draftRows(state, false) } };
  }
  if (state.game === 'conexoes' && !final) return { type: 'image', image: { kind: 'conexoesBoard', state: structuredClone(state), reveal: false } };
  if (state.game !== 'top10') return scoreImage(state, final);
  const list = getTop10List(state.listId)!;
  return { type: 'image', image: { kind: 'top10Board', state: structuredClone(state), list, final } };
}

// ---------- Escalação em Grupo ----------

function startEscalacao(state: EscalacaoParty, deps: PartyDeps): Outgoing[] {
  let mode = getMode(state.modeId);
  // Tema sorteado (ou nenhum): sorteia na hora, priorizando o que o grupo não jogou.
  if (!mode || state.randomMode) {
    // Tema que o grupo ainda não jogou primeiro.
    mode = (deps.seen?.length ? freshPick(MODES, (m) => `modo:${m.id}`, 1, deps.rng, deps.seen)[0] : undefined) ?? randomMode(deps.rng);
    state.modeId = mode.id;
    state.randomMode = true;
  }
  state.restrictions = drawRestrictions(mode, deps.rng, state.options.hard);
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
    profile = await deps.lookup(msg.text.trim(), playContext(SLOTS[state.round], state.restrictions[state.round], mode.metric));
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
    ...pauseBeforeNext(state, deps),
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

/**
 * Escolhe a lista do Top 10 sem repetir assunto: primeiro um tema que o grupo
 * ainda não jogou; acabados os temas, um tema que ainda tem lista nova (o
 * que foi jogado há mais tempo); só depois repete lista.
 */
export function pickTop10(pool: Top10List[], rng: () => number, seen: string[] = []): Top10List {
  const ids = new Set(pool.map((l) => l.id));
  const seenLists = seen.filter((id) => ids.has(id));
  if (!seenLists.length) return pool[Math.floor(rng() * pool.length)];
  // Tema de cada lista vista, na ordem em que foi vista (a última vez conta).
  const seenThemes = seenLists.map((id) => top10Theme(id));
  const themes = [...new Set(pool.map((l) => top10Theme(l.id)))];
  const seenThemeSet = new Set(seenThemes);
  const seenListSet = new Set(seenLists);
  const hasNewList = (t: string) => pool.some((l) => top10Theme(l.id) === t && !seenListSet.has(l.id));
  const rank = (t: string) => (!seenThemeSet.has(t) ? 0 : hasNewList(t) ? 1 : 2);
  const ordered = freshFirst(themes, rng, seenThemes)
    .map((t, i) => ({ t, i }))
    .sort((a, b) => rank(a.t) - rank(b.t) || a.i - b.i);
  const theme = ordered[0].t;
  const inTheme = pool.filter((l) => top10Theme(l.id) === theme).map((l) => l.id);
  const id = freshFirst(inTheme, rng, seenLists)[0];
  return pool.find((l) => l.id === id)!;
}

function startTop10(state: Top10Party, deps: PartyDeps): Outgoing[] {
  // "aleatório" sorteia entre futebol e geral; política só quando pedida.
  const pool = TOP10_LISTS.filter((l) =>
    state.category ? l.category === state.category : (TOP10_CATEGORIES as readonly string[]).includes(l.category),
  );
  const list = pickTop10(pool, deps.rng, deps.seen);
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

const AGAIN: Partial<Record<PartyGame, string>> = {
  conexoes: 'abrir conexões',
  stop: 'abrir stop',
  linha: 'abrir linha do tempo',
  fato: 'abrir fato ou fake',
};

function isRodada(state: PartyState): state is RodadaParty {
  return state.game === 'linha' || state.game === 'fato';
}

async function finishAndSave(
  state: PartyState,
  deps: PartyDeps,
  save: (o: Outgoing[]) => Promise<Outgoing[]>,
  reason: string,
): Promise<Outgoing[]> {
  const out = isBaseGame(state)
    ? moduleOf(state).finish(state, reason)
    : state.game === 'escalacao'
      ? finishEscalacao(state, deps, reason)
      : state.game === 'top10'
        ? finishTop10(state, deps, reason)
        : state.game === 'intruso'
          ? finishIntruso(state, reason)
          : state.game === 'melhortime'
            ? []
            : state.game === 'alfabeto'
              ? finishAlfabeto(state, reason)
              : state.game === 'chute'
                ? finishChute(state, reason)
                : state.game === 'sobrevivente'
                  ? finishSobrevivente(state, reason)
                  : state.game === 'draft'
                    ? closeVoting(state, reason)
                    : state.game === 'conexoes' || state.game === 'stop' || isRodada(state)
                      ? finishByScore(state, reason, AGAIN[state.game] ?? 'ajuda')
                      : finishQuiz(state, deps, reason);
  return save(out);
}

/** O que a partida que começou mostra (para o histórico "sem repetição" do grupo). */
function seenItems(state: PartyState): string[] {
  if (isBaseGame(state)) return moduleOf(state).seenItems(state);
  if (state.game === 'top10') return state.listId ? [state.listId] : [];
  // Jogos sem lista fixa: guarda o que foi sorteado (tema, letras, clubes, seleções).
  if (state.game === 'escalacao') return state.modeId ? [`modo:${state.modeId}`] : [];
  if (state.game === 'alfabeto') return state.rounds.flatMap((r) => [`${r.kind}:${r.value}`, `letra:${r.letter}`]);
  if (state.game === 'stop') return state.letters.map((l) => `letra:${l}`);
  if (state.game === 'draft') return state.rules.map((r) => `${r.kind}:${r.value}`);
  if (state.game === 'melhortime') return state.clubs.map((c) => `club:${c}`);
  return 'order' in state && Array.isArray(state.order) ? state.order : [];
}

/** Depois de salvar o estado final, grava vitórias/derrotas no ranking do grupo. */
export async function recordPartyIfFinished(match: Session, store: Store): Promise<void> {
  const state = match.state as PartyState;
  const rows = pendingResults.get(state);
  if (state.status !== 'FINISHED' || !rows) return;
  pendingResults.delete(state);
  await store.recordResults(match.groupJid, rows);
}

export { PARTY_CONFIG, TOP10_CATEGORIES };
export type { PartyDeps };
