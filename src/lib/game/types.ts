export type Position = 'GOL' | 'DEF' | 'MEI' | 'ATA';

/** Formação 1-2-2-1: seis escolhas por jogador. */
export const SLOTS: Position[] = ['GOL', 'DEF', 'DEF', 'MEI', 'MEI', 'ATA'];

export const POSITION_LABEL: Record<Position, string> = {
  GOL: 'goleiro',
  DEF: 'defensor',
  MEI: 'meia',
  ATA: 'atacante',
};

export type MetricKey =
  | 'careerGoals'
  | 'careerAssists'
  | 'peakValueEurM'
  | 'age'
  | 'heightCm'
  | 'intlCaps'
  | 'intlGoals'
  | 'worldCupGoals'
  | 'uclGoals'
  | 'titles'
  | 'careerApps'
  | 'brasileiraoGoals'
  | 'libertadoresGoals'
  | 'worldCupsPlayed'
  | 'debutYear'
  | 'clubsCount'
  | 'marketValueEurM'
  | 'careerCards';

/** Ficha de um jogador de futebol, devolvida pela IA e guardada em cache. */
export interface PlayerProfile {
  exists: boolean;
  name: string;
  /** Nome completo de registro (quando a fonte informa). Apelidos não entram. */
  fullName?: string;
  /** Outros nomes aceitos (rótulos em outras línguas, nome completo). */
  aliases?: string[];
  /** Id na base de jogadores (Wikidata "Q..." ou "ai:..."). */
  id?: string;
  positions: Position[];
  nationality: string | null;
  birthDate: string | null; // AAAA-MM-DD
  clubs: string[];
  heightCm: number | null;
  careerGoals: number | null;
  careerAssists: number | null;
  peakValueEurM: number | null;
  intlCaps: number | null;
  intlGoals: number | null;
  worldCupGoals: number | null;
  uclGoals: number | null;
  titles: number | null;
  careerApps: number | null;
  brasileiraoGoals: number | null;
  libertadoresGoals: number | null;
  worldCupsPlayed: number | null;
  debutYear: number | null;
  /** Valor de mercado atual (mi €); 0 para quem parou de jogar. */
  marketValueEurM?: number | null;
  /** Cartões na carreira (amarelos + vermelhos). Opcional: fichas antigas em cache não têm. */
  careerCards?: number | null;
  /** Data da conferência dos números corrigidos à mão (AAAA-MM-DD), se houver. */
  manualAt?: string;
}

export type RestrictionKind = 'none' | 'club' | 'country';

export interface Restriction {
  kind: RestrictionKind;
  /** id do clube/seleção em teams.ts */
  teamId?: string;
}

export interface Pick {
  name: string;
  key: string; // nome normalizado, para detectar repetição
  value: number;
  /** Outras formas pelas quais o mesmo jogador foi pedido (ex.: o que foi digitado). */
  aliases?: string[];
}

export type Side = 0 | 1; // 0 = anfitrião, 1 = desafiante

export type MatchStatus = 'LOBBY' | 'MODE_SELECT' | 'PLAYING' | 'FINISHED' | 'CANCELLED';

export interface MatchPlayer {
  jid: string;
  name: string;
}

/** Variações que o anfitrião pode ligar junto com o tema. */
export interface MatchOptions {
  /** Números escondidos até o apito final. */
  blind?: boolean;
  /** Segundos por jogada (padrão 90; relâmpago 45). */
  turnSeconds?: number;
  /** "iniciar aleatório": o tema é sorteado assim que alguém aceita, sem menu. */
  autoRandom?: boolean;
  /** "difícil": sorteio com clubes/seleções de nível 2. */
  hard?: boolean;
  /** Só clubes de uma liga ("1 brasileirão"): br, eng, esp, ita, ger, fra, arg. */
  league?: 'br' | 'eng' | 'esp' | 'ita' | 'ger' | 'fra' | 'arg';
}

export interface MatchState {
  status: MatchStatus;
  /** Opcional para manter compatibilidade com partidas já gravadas. */
  options?: MatchOptions;
  players: [MatchPlayer, MatchPlayer | null];
  modeId: string | null;
  /** Uma restrição por rodada (índice = slot). */
  restrictions: Restriction[];
  /** picks[lado][slot] */
  picks: [Array<Pick | null>, Array<Pick | null>];
  round: number; // 0..5
  turn: Side;
  /** Momento (ms) em que a vez atual começou — usado pelo comando "tempo". */
  turnStartedAt: number;
  createdAt: number;
  updatedAt: number;
  winner: Side | 'draw' | null;
  /** turnStartedAt da vez em que já avisamos "não é sua vez" (1 aviso por vez). */
  nudgedAt?: number;
  /** Prazo automático da vez (QStash): fim da vez e o token do agendamento. */
  deadline?: number | null;
  timerToken?: string | null;
  seq?: number;
  /** Vezes seguidas que cada lado estourou o tempo (3 = derrota por W.O.). */
  misses?: [number, number];
}

export interface Match {
  id: string;
  groupJid: string;
  version: number;
  state: MatchState;
}

// ---------- Modo em Grupo (salas) ----------

export type PartyGame =
  | 'escalacao'
  | 'top10'
  | 'quetime'
  | 'quemeh'
  | 'intruso'
  | 'melhortime'
  | 'emoji'
  | 'relampago'
  | 'alfabeto'
  | 'chute'
  | 'bandeira'
  | 'sobrevivente'
  | 'conexoes'
  | 'stop'
  | 'draft'
  | 'linha'
  | 'fato'
  | 'carreira'
  | 'ponte'
  | 'grade'
  | 'penaltis'
  | 'leilao'
  | 'anagrama'
  | 'top100'
  | 'impostor'
  | 'rosto';

export interface PartyPlayer {
  jid: string;
  name: string;
  score: number;
  /** Rodadas seguidas sem responder; 2 ou mais = ausente (sai da conta de "todos"). */
  missed: number;
  hits: number;
  lastHitAt: number;
}

export interface PartyBase {
  kind: 'party';
  game: PartyGame;
  status: 'LOBBY' | 'PLAYING' | 'FINISHED' | 'CANCELLED';
  host: MatchPlayer;
  players: PartyPlayer[];
  createdAt: number;
  updatedAt: number;
  /** Prazo da rodada atual e o token do agendamento (QStash) que vai fechá-la. */
  deadline: number | null;
  timerToken: string | null;
  seq: number;
  /** Jids que já foram avisados nesta rodada (evita repetir aviso). */
  warned: string[];
  /** Pausa entre rodadas: a resposta foi revelada e a próxima ainda não começou. */
  intermission?: boolean;
}

export interface EscalacaoParty extends PartyBase {
  game: 'escalacao';
  modeId: string | null;
  randomMode: boolean;
  options: MatchOptions;
  restrictions: Restriction[];
  round: number;
  /** picks[jid][slot] */
  picks: Record<string, Array<Pick | null>>;
  /** Chaves normalizadas de tudo que já foi escalado na partida (respostas únicas). */
  used: string[];
}

export interface Top10Item {
  name: string;
  aliases?: string[];
  detail?: string;
  /** Posição oficial (empates repetem a posição). */
  rank: number;
}

export type ContentCategory = 'futebol' | 'geral' | 'politica' | 'historia' | 'anime';

export interface Top10List {
  id: string;
  category: ContentCategory;
  title: string;
  source: string;
  items: Top10Item[];
}

export interface Top10Party extends PartyBase {
  game: 'top10';
  category: Top10List['category'] | null;
  listId: string | null;
  /** Quem acertou cada item (índice = item da lista). */
  found: Array<{ jid: string; name: string } | null>;
  /** Palpites já usados (certos e errados), normalizados: não podem se repetir. */
  guesses: string[];
  /** Quem mandou o último palpite válido: não pode mandar dois seguidos. */
  lastJid: string | null;
}

/** Quiz em rodadas ("Que time é esse?" e "Quem é?"): corrida, 1 tentativa por rodada. */
export interface QuizParty extends PartyBase {
  game: 'quetime' | 'quemeh' | 'emoji' | 'relampago' | 'bandeira';
  /** Categoria do conteúdo; null = padrão do jogo (sem política). */
  category: ContentCategory | null;
  round: number; // -1 no lobby
  totalRounds: number;
  /** Ids do conteúdo sorteado para cada rodada. */
  order: string[];
  /** Quem é?: dica atual (0 a 4). */
  clue: number;
  /** Quem já gastou a tentativa nesta rodada. */
  attempts: string[];
  /** Palpites já usados nesta rodada (normalizados): não podem se repetir. */
  guesses: string[];
  /** Rodada resolvida (alguém acertou tudo). */
  solved: boolean;
  /** Pontos marcados na rodada atual, para a revelação. */
  roundHits: Array<{ jid: string; name: string; points: number; label: string }>;
}

/** Intruso: 5 nomes; os jogadores marcam X em quem pertence ao grupo; o que sobra é o palpite de intruso. */
export interface IntrusoParty extends PartyBase {
  game: 'intruso';
  /** Categoria escolhida; null = futebol e geral. */
  category: ContentCategory | null;
  round: number; // -1 no lobby
  totalRounds: number;
  order: string[];
  /** Nomes da rodada, na ordem exibida (A, B, C...). */
  options: string[];
  intruderIndex: number;
  /** X marcados nesta rodada (índice da opção e quem marcou). */
  marks: Array<{ index: number; jid: string; name: string }>;
  /** Quem marcou por último: não pode marcar duas vezes seguidas. */
  lastJid: string | null;
}

/** Escolha do Melhor Time: jogador, clube da rodada e "força" (pico de valor, para o desempate sem IA). */
export interface DraftPick {
  name: string;
  key: string;
  club: string;
  strength: number;
  aliases?: string[];
}

/**
 * Melhor Time (1 x 1): a cada rodada sorteia um clube; cada um escolhe um
 * jogador que passou por ele e a posição que quer preencher, em qualquer ordem.
 * No fim, a IA ou a votação do grupo decide o melhor time.
 */
export interface MelhorTimeParty extends PartyBase {
  game: 'melhortime';
  judge: 'ia' | 'votacao';
  /** "difícil": sorteia também clubes de nível 3. */
  hard?: boolean;
  phase: 'draft' | 'voting' | 'done';
  round: number; // -1 no lobby, 0..5
  clubs: string[];
  /** picks[jid][slot] (slot = índice em SLOTS) */
  picks: Record<string, Array<DraftPick | null>>;
  /** Quem está na vez (índice em players). */
  turn: number;
  used: string[];
  votes: Record<string, number>;
  verdict: { winner: number | 'draw'; reason: string } | null;
}

/** Alfabeto: categoria + letra por rodada; 1 nome por pessoa, ninguém repete. */
export interface AlfabetoParty extends PartyBase {
  game: 'alfabeto';
  round: number;
  totalRounds: number;
  rounds: Array<{ kind: 'pos' | 'nation' | 'club'; value: string; label: string; letter: string }>;
  /** Resposta aceita de cada um nesta rodada. */
  answers: Record<string, { name: string; key: string; order: number }>;
  used: string[];
}

/** Chute Certo: cada um manda um número diferente; vence o mais perto. */
export interface ChuteParty extends PartyBase {
  game: 'chute';
  category: ContentCategory | null;
  round: number;
  totalRounds: number;
  order: string[];
  /** Palpites desta rodada (jid → número) e ordem de chegada. */
  guesses: Record<string, number>;
  arrival: string[];
}

/**
 * Sobrevivente: categoria fechada ("capitais da América do Sul"); na ordem da
 * sala, cada um diz um item novo. Errou, repetiu ou estourou o tempo: perde vida.
 */
export interface SobreviventeParty extends PartyBase {
  game: 'sobrevivente';
  category: ContentCategory | null;
  /** Ids das categorias, da mais fácil para a mais difícil (uma por volta). */
  order: string[];
  /** Volta atual (índice em order). Também serve de "rodada" para a entrada tardia. */
  round: number;
  totalRounds: number;
  /** Índice (em players) de quem está na vez. */
  turn: number;
  lives: Record<string, number>;
  /** Itens já ditos na categoria atual (índices na lista). */
  used: number[];
  /** Quem já jogou nesta volta. */
  played: string[];
  /** Respostas certas de cada um (desempate). */
  answers: Record<string, number>;
  /** Ordem de eliminação (o último eliminado fica em 2º). */
  out: string[];
}

/** Conexões: 16 nomes, 4 grupos escondidos de 4. Cada um manda 4 números. */
export interface ConexoesParty extends PartyBase {
  game: 'conexoes';
  category: ContentCategory | null;
  round: number;
  totalRounds: number;
  order: string[];
  /** Os 16 nomes da rodada, embaralhados (o número exibido é índice + 1). */
  tiles: string[];
  /** Grupos achados (índice no puzzle) e por quem (null = revelado pelo bot). */
  solved: Array<{ group: number; jid: string | null; name: string }>;
  /** Erros de cada um nesta rodada (3 = sem palpites). */
  errors: Record<string, number>;
  /** Combinações erradas já tentadas (não contam de novo). */
  tried: string[];
  lastJid: string | null;
}

/** Stop coletivo (Adedonha): letra + categorias; resposta igual à de quem mandou antes não vale. */
export interface StopParty extends PartyBase {
  game: 'stop';
  round: number;
  totalRounds: number;
  letters: string[];
  /** Ids das categorias de cada rodada. */
  cats: string[][];
  /** Ficha de cada um nesta rodada (na ordem das categorias) e ordem de chegada. */
  sheets: Record<string, string[]>;
  arrival: string[];
  /** Alguém já mandou a ficha: o prazo encurtou. */
  stopped: boolean;
  /** "abrir stop futebol" / "abrir stop geral"; sem filtro: a mistura de sempre. */
  category?: 'futebol' | 'geral' | null;
}

/** Draft da Resenha: até 8 pessoas, ordem em serpente, a IA valida, o grupo vota. */
export interface DraftParty extends PartyBase {
  game: 'draft';
  phase: 'draft' | 'voting';
  round: number;
  totalRounds: number;
  /** Regra de cada rodada: posição + restrição (letra, clube ou seleção). */
  rules: Array<{ pos: Position; kind: 'letter' | 'club' | 'nation' | 'none'; value: string; label: string }>;
  /** Ordem de quem escolhe nesta rodada (serpente) e quem está na vez. */
  sequence: string[];
  pick: number;
  picks: Record<string, Array<{ name: string; key: string } | null>>;
  used: string[];
  /** Votos: quem votou → índice do time (em players). */
  votes: Record<string, number>;
}

/** Jogos em que todos respondem a mesma pergunta (Linha do Tempo, Fato ou Fake). */
export interface RodadaParty extends PartyBase {
  game: 'linha' | 'fato';
  category: ContentCategory | null;
  round: number;
  totalRounds: number;
  /** Linha do Tempo: ids dos 4 eventos de cada rodada, separados por vírgula. Fato ou Fake: id da afirmação. */
  order: string[];
  answers: Record<string, string>;
  arrival: string[];
}

/** Ficha mínima de um jogador da base, guardada no estado (não precisa buscar de novo). */
export interface BaseCard {
  id: string;
  name: string;
  /** Nomes que valem como resposta (nome completo e nomes famosos aceitos). */
  names: string[];
}

/** Carreira: o bot mostra a trajetória; dicas extras saem com o tempo; o primeiro que acertar leva. */
export interface CarreiraParty extends PartyBase {
  game: 'carreira';
  round: number;
  totalRounds: number;
  cards: Array<BaseCard & { path: string[]; clues: string[] }>;
  /** Dica atual (0 = só a trajetória). */
  clue: number;
  /** Quem já palpitou nesta dica e palpites já ditos (normalizados). */
  attempts: string[];
  guesses: string[];
  solved: boolean;
}

/** Ponte: 4 clubes; cite quem passou por eles. 1 palpite por pessoa por rodada (4 clubes = máximo). */
export interface PonteParty extends PartyBase {
  game: 'ponte';
  round: number;
  totalRounds: number;
  /** Clubes de cada rodada (ids de time) e um exemplo que passou pelos 4. */
  rounds: Array<{ clubs: string[]; example: string; exampleId: string }>;
  /** O palpite de cada um nesta rodada (1 por pessoa). */
  best: Record<string, { name: string; hits: number }>;
  /** Jogadores já citados nesta rodada (ninguém repete). */
  used: string[];
}

/** Grade 3x3 (1 x 1): linhas = clubes, colunas = seleções; 3 casas em linha vence. */
export interface GradeParty extends PartyBase {
  game: 'grade';
  rows: string[];
  cols: string[];
  /** 9 casas (linha * 3 + coluna): dono e jogador. */
  cells: Array<{ jid: string; name: string } | null>;
  /** Índice (em players) de quem joga. */
  turn: number;
  used: string[];
  /** Vezes seguidas que a vez passou sem casa marcada (4 = fim). */
  idle: number;
  round: number;
}

/** Pênaltis (1 x 1): 5 cobranças para cada; cada cobrança tem uma regra. */
export interface PenaltisParty extends PartyBase {
  game: 'penaltis';
  kicks: Array<{ jid: string; pos: Position; kind: 'club' | 'nation'; teamId: string; label: string; result: 'gol' | 'defendeu' | null; answer?: string }>;
  /** Cobrança atual (índice em kicks). */
  kick: number;
  used: string[];
  round: number;
}

/**
 * Impostor: todos recebem no privado o mesmo segredo, menos o
 * impostor (só o tema). Dicas de 1 palavra em 2 voltas, debate, votação
 * (2º turno no empate) e, se pegarem o impostor, o palpite final dele.
 */
export interface ImpostorParty extends PartyBase {
  game: 'impostor';
  /** Tema escolhido no comando ("craque brasileiro"); null = mistura. */
  theme: string | null;
  /** Segredo sorteado (id em content/impostor). */
  secretId: string;
  /** Jid do impostor. */
  impostor: string;
  /** Ordem da mesa (jids). */
  order: string[];
  /** Volta das dicas (0 ou 1) e posição na ordem. */
  lap: number;
  turn: number;
  phase: 'cards' | 'clues' | 'debate' | 'voting' | 'runoff' | 'guess';
  /** Dicas dadas (word null = passou o tempo). */
  clues: Array<{ jid: string; lap: number; word: string | null }>;
  /** Votos da votação (quem votou -> em quem) e do 2º turno. */
  votes: Record<string, string>;
  runoffVotes: Record<string, string>;
  /** Empatados que vão para o 2º turno. */
  runoff: string[];
  /** Vezes que o debate ganhou tempo extra ("mais tempo"). */
  extended?: number;
  /** Cédula da votação (jids, na ordem dos números). */
  ballot: string[];
  /** "abrir impostor rápido": 25 s por dica. */
  fast: boolean;
  round: number;
  totalRounds: number;
}

/** Top 100 do dia: uma lista de 100 por dia; cada acerto vale a posição. */
export interface Top100Party extends PartyBase {
  game: 'top100';
  listId: string;
  /** Dia (horário de Brasília) da lista: o grupo só joga uma vez por dia. */
  day: string;
  /** Quem acertou cada posição (índice = item da lista). */
  found: Array<{ jid: string; name: string } | null>;
  /** Vidas (palpites errados que ainda pode dar). */
  lives: Record<string, number>;
  /** Palpites errados já ditos (não gastam vida de novo). */
  misses: string[];
  round: number;
}

/** Anagrama: letras embaralhadas + tema; o primeiro que acertar leva. */
export interface AnagramaParty extends PartyBase {
  game: 'anagrama';
  category: ContentCategory | null;
  /** Tema escolhido no comando ("capital", "clube do exterior"); null = mistura. */
  theme?: string | null;
  round: number;
  totalRounds: number;
  order: string[];
  /** Letras embaralhadas da rodada (como aparecem no grupo). */
  scrambled: string;
  /** A dica (primeira letra) já saiu. */
  hint: boolean;
  /** Tentativas de cada um nesta rodada. */
  tries: Record<string, number>;
  solved: boolean;
}

/**
 * Rosto Borrado: foto de um craque com SÓ o rosto borrado. O borrão diminui
 * em 3 etapas; o primeiro que acertar o nome leva mais pontos quanto mais cedo.
 */
export interface RostoParty extends PartyBase {
  game: 'rosto';
  round: number;
  totalRounds: number;
  /** Ids das fotos (Wikidata "Q...") na ordem das rodadas. */
  order: string[];
  /** Etapa do borrão nesta rodada: 0 = forte, 1 = médio, 2 = leve. */
  level: number;
  /** Tentativas de cada um nesta rodada. */
  tries: Record<string, number>;
  solved: boolean;
}

/** Leilão de Craques: orçamento, lances no chat, overall escondido até o fim. */
export interface LeilaoParty extends PartyBase {
  game: 'leilao';
  /** "overall" (soma do overall escondido) ou "votacao" (o grupo vota no melhor time). Partidas antigas: overall. */
  mode?: 'overall' | 'votacao';
  /** Leilão rolando ou votação aberta (só no modo votação). */
  phase?: 'auction' | 'voting';
  /** Lote atual (índice em lots). */
  round: number;
  totalRounds: number;
  lots: Array<{ id: string; name: string; positions: Position[]; nationality: string | null; path: string[]; overall: number }>;
  budget: Record<string, number>;
  /** Times: um craque por posição (slot = a posição que ele ocupa). */
  squads: Record<string, Array<{ name: string; positions: Position[]; slot?: Position; overall: number; price: number }>>;
  /** Maior lance do lote atual. */
  bid: { jid: string; name: string; value: number } | null;
  /** Votos (quem votou -> índice do time), no modo votação. */
  votes?: Record<string, number>;
}

export type PartyState =
  | EscalacaoParty
  | Top10Party
  | QuizParty
  | IntrusoParty
  | MelhorTimeParty
  | AlfabetoParty
  | ChuteParty
  | SobreviventeParty
  | ConexoesParty
  | StopParty
  | DraftParty
  | RodadaParty
  | CarreiraParty
  | PonteParty
  | GradeParty
  | PenaltisParty
  | LeilaoParty
  | AnagramaParty
  | Top100Party
  | ImpostorParty
  | RostoParty;

export type SessionState = MatchState | PartyState;

export interface Session {
  id: string;
  groupJid: string;
  version: number;
  state: SessionState;
}

export function isParty(state: SessionState): state is PartyState {
  return (state as PartyState).kind === 'party';
}

export interface RankingRow {
  jid: string;
  name: string;
  games: number;
  wins: number;
  draws: number;
  losses: number;
}

/** Mensagem recebida do WhatsApp, já normalizada pelo adaptador. */
export interface IncomingMessage {
  /** Id da mensagem no WhatsApp (usado também para reagir a ela). */
  id: string;
  groupJid: string;
  groupName?: string;
  senderJid: string;
  /** Outros ids do mesmo remetente (número e @lid), quando a Evolution manda os dois. */
  senderAliases?: string[];
  /**
   * Id do remetente exatamente como veio na chave da mensagem (pode ser @lid).
   * Reações precisam dele: com outro id, o WhatsApp mostra uma bolha vazia.
   */
  keyParticipant?: string;
  senderName: string;
  text: string;
  /** Quem foi marcado com @ na mensagem (ids do WhatsApp). */
  mentions?: string[];
  /** Autor da mensagem respondida (quando a mensagem é uma resposta). */
  quotedParticipant?: string;
  /** Mensagem no privado do bot (groupJid = a conversa com a pessoa). Só o Impostor usa. */
  private?: boolean;
}

/** O que o motor quer mandar de volta para o grupo. */
export type Outgoing =
  | { type: 'text'; text: string }
  | { type: 'image'; image: ImageSpec; caption?: string }
  /** Reação (ex.: ✅) na mensagem de um jogador: confirma sem poluir o grupo. */
  | { type: 'react'; messageId: string; senderJid: string; emoji: string; participant?: string }
  /** Agenda o fim da rodada (QStash). Não é enviado ao grupo. */
  | { type: 'schedule'; delaySeconds: number; token: string }
  /** Mensagem no privado de uma pessoa (o segredo do Impostor). name = para avisar no grupo se falhar. */
  | { type: 'dm'; to: string; text: string; name: string };

export type ImageSpec =
  | { kind: 'challenge'; host: string }
  | { kind: 'modes' }
  | { kind: 'help' }
  | { kind: 'kickoff'; state: MatchState }
  | { kind: 'pitch'; state: MatchState }
  /** start: posição do primeiro da lista (11 no "ranking B"); more: há gente depois do 10º. */
  | { kind: 'ranking'; groupName: string; rows: RankingRow[]; season?: number; since?: string; start?: number; more?: boolean }
  | {
      kind: 'season';
      groupName: string;
      season: number;
      startedAt: string;
      endedAt: string;
      rows: RankingRow[];
      matches: number;
      highlights: Array<{ label: string; name: string; value: string }>;
      games?: Array<{ name: string; count: number }>;
    }
  | { kind: 'partyLobby'; state: PartyState }
  | { kind: 'partyTable'; state: EscalacaoParty }
  | { kind: 'top10Board'; state: Top10Party; list: Top10List; final: boolean }
  | { kind: 'lineupQuiz'; state: QuizParty; lines: string[][] }
  | { kind: 'partyScore'; state: PartyState; title: string; final: boolean }
  | { kind: 'intrusoBoard'; state: IntrusoParty; reason: string; reveal: boolean }
  | { kind: 'draftBoard'; state: MelhorTimeParty }
  | { kind: 'flagQuiz'; state: QuizParty; flag: FlagSpec }
  | { kind: 'conexoesBoard'; state: ConexoesParty; reveal: boolean }
  | { kind: 'gradeBoard'; state: GradeParty; final: boolean }
  | { kind: 'top100Board'; state: Top100Party; final: boolean }
  | { kind: 'textBoard'; game: PartyGame; title: string; subtitle: string; rows: Array<{ head: string; lines: string[]; color?: string; highlight?: boolean }> }
  /** Rosto Borrado: level 0 a 2 = borrão (forte a leve), 3 = foto limpa (revelação, com o nome em `answer`). */
  | { kind: 'faceQuiz'; photoId: string; level: number; round: number; total: number; answer?: string; /** Preenchidos na hora de renderizar: a foto (data URI) e o tamanho dela. */ photo?: string; photoW?: number; photoH?: number };

/** Bandeira desenhada só com formas (faixas, círculo, cruz, triângulo, cantão). */
export interface FlagSpec {
  /** Faixas: direção, cores e pesos (padrão: iguais). */
  dir: 'h' | 'v';
  colors: string[];
  weights?: number[];
  /** Círculo: cor, centro horizontal (0 a 1) e diâmetro em fração da altura. */
  circle?: { color: string; cx?: number; size?: number };
  /** Cruz nórdica (deslocada), centralizada de ponta a ponta ou curta (Suíça); contorno opcional. */
  cross?: { color: string; kind: 'nordic' | 'center' | 'plus'; outline?: string };
  /** Triângulo encostado no mastro: cor e quanto da largura ocupa. */
  triangle?: { color: string; depth?: number };
  /** Faixa vertical no mastro (Emirados): cor e fração da largura. */
  hoist?: { color: string; width: number };
  /** Cantão (canto superior esquerdo) com uma bandeira simples dentro. */
  canton?: { flag: FlagSpec; width: number; height: number };
  /** Losango central (Brasil). */
  diamond?: { color: string };
}
