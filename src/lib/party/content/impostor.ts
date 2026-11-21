import type { ContentCategory } from '../../game/types';
import { normalize } from '../../game/text';
import { ANAGRAM_ONLY, ANAGRAM_THEMES } from './anagramas';
import { ANAGRAM_LABELS, EXTRA_NAMES, NEW_THEMES, type ImpostorThemeDef } from './impostor-temas';

/**
 * Segredos do Impostor. Mesmo critério do Anagrama: se alguém do
 * grupo não reconheceria, não entra. Cada segredo sabe as palavras que
 * entregariam o nome (proibidas na dica) e os apelidos aceitos no palpite
 * final do impostor.
 *
 * Temas: os do Anagrama (com nomes a mais, que só o Impostor usa) e temas
 * próprios (aqui e em impostor-temas.ts). O grupo escolhe o tema na frente
 * do comando ("abrir impostor filmes") ou uma mistura: "futebol", "geral"
 * (tudo que não é futebol) ou "tudo". Sem tema: futebol, ou geral no grupo
 * que só tem o Impostor ("ativar impostor").
 */
export interface ImpostorSecret {
  id: string;
  theme: string;
  category: ContentCategory;
  name: string;
  aliases: string[];
  /** Pedaços do nome e dos apelidos (normalizados, 3+ letras ou ano de 2 dígitos): não valem como dica. */
  forbidden: string[];
}

/** Misturas pedidas no comando: "abrir impostor futebol", "... geral" (tudo que não é futebol) e "... tudo". */
export const IMPOSTOR_FUTEBOL = 'futebol';
export const IMPOSTOR_GERAL = 'geral';
export const IMPOSTOR_TUDO = 'tudo';
const MIXES: Record<string, string[]> = {
  [IMPOSTOR_FUTEBOL]: ['futebol', 'do futebol', 'futebol misturado', 'so futebol'],
  [IMPOSTOR_GERAL]: ['geral', 'gerais', 'conhecimentos gerais', 'temas gerais', 'sem futebol'],
  [IMPOSTOR_TUDO]: ['tudo', 'misturado', 'todos', 'todos os temas', 'qualquer', 'aleatorio'],
};

/** Nomes a mais nos temas de futebol do Anagrama (rodada 7; os da rodada 8 estão em impostor-temas.ts). */
const EXTRA: Record<string, string> = {
  'craque brasileiro':
    'Lucas Paquetá|paqueta, Gabriel Jesus, Roberto Firmino|firmino, Philippe Coutinho|coutinho, Paulo Henrique Ganso|ganso, Oscar, Willian, ' +
    'Ederson, Thiago Silva, Fernandinho, Juninho Pernambucano|juninho, Edmundo, Raí, Leonardo, Denílson, Zé Roberto, Lúcio, ' +
    'Luís Fabiano, Dida, Careca, Falcão, Jairzinho, Rivellino|rivelino, Tostão, Nilton Santos, Éder Militão|militao, Bruno Guimarães, ' +
    'Gabriel Martinelli|martinelli, Estêvão',
  'craque do mundo':
    "Drogba, Eto'o|etoo, Rooney, Gerrard, Lampard, Shevchenko, Figo|luis figo, Eusébio, Puskás, Van Basten, Bergkamp, Robben, Ribéry, " +
    'Kroos|toni kroos, Sergio Ramos, Casillas, Son|heung-min son, Pedri, Platini, Roberto Baggio|baggio, Del Piero, Maldini, Cannavaro, ' +
    'Batistuta, Riquelme, Di María, Agüero, Cavani, Valderrama, Kvaratskhelia|kvara',
  'clube brasileiro':
    'Santa Cruz, Náutico, Paysandu, Remo, Portuguesa, América Mineiro|america mg, Avaí, Criciúma, Figueirense, ' +
    'Atlético Goianiense|atletico go, Cuiabá, Mirassol',
  'clube do exterior':
    'PSG|paris saint-germain, Olympique de Marseille|marseille|marselha, Lyon, Sporting|sporting lisboa, PSV, Al-Hilal, Al-Nassr, ' +
    'Inter Miami, Newcastle, Aston Villa, Bayer Leverkusen|leverkusen, RB Leipzig|leipzig, Valencia, Villarreal, Betis|real betis, ' +
    'Fiorentina, Atalanta, Fenerbahçe, Celtic, Independiente',
  'seleção':
    'Brasil, Gana, Costa do Marfim, Egito, Austrália, Coreia do Sul, Arábia Saudita, Irã, Canadá, Peru, Venezuela, Turquia, Suíça, ' +
    'Polônia, Sérvia',
  'técnico':
    'Mano Menezes|mano, Muricy Ramalho|muricy, Filipe Luís, Arsène Wenger|wenger, Alex Ferguson|ferguson, Luis Enrique, Arteta, ' +
    'Xabi Alonso, Scaloni, Bielsa, Joel Santana, Sampaoli',
  'estádio':
    'Serra Dourada, Arruda, Ilha do Retiro, Couto Pereira, Independência, Barradão, Arena Pernambuco, Arena Pantanal, Arena da Amazônia',
};

/** Edições de Copa do Mundo mais lembradas no Brasil (sede e campeão: FIFA). 2026 fica de fora (sem fonte conferida). */
const COPAS = [1950, 1958, 1962, 1970, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022]
  .map((y) => {
    const yy = String(y % 100).padStart(2, '0');
    return `Copa de ${y}|copa ${y}|copa ${yy}|${y}|${yy}`;
  })
  .join(', ');

/** Temas que só o Impostor tem. */
const OWN_THEMES: ImpostorThemeDef[] = [
  {
    theme: 'estádio do mundo', category: 'futebol', label: 'estádios do mundo',
    keys: ['estadios do mundo', 'estadio do mundo', 'estadios de fora', 'estadios gringos', 'estadios da europa'],
    list:
      'Camp Nou, Santiago Bernabéu|bernabeu, Old Trafford, Anfield, Wembley, San Siro|giuseppe meazza, Allianz Arena, La Bombonera|bombonera, ' +
      'Monumental de Núñez|monumental, Estádio Azteca|azteca, Signal Iduna Park|westfalenstadion, Parc des Princes, Centenário, ' +
      'Stamford Bridge, Emirates, Etihad, Metropolitano|wanda metropolitano, Estádio da Luz|da luz, Lusail, Mestalla',
  },
  {
    theme: 'competição', category: 'futebol', label: 'competições',
    keys: ['competicoes', 'competicao', 'campeonatos', 'campeonato', 'torneios', 'torneio', 'tacas'],
    list:
      'Copa do Mundo, Libertadores, Champions League|champions|liga dos campeoes, Copa do Brasil, Brasileirão|brasileiro, Copa América, ' +
      'Eurocopa|euro, Sul-Americana|sulamericana, Mundial de Clubes|mundial, Premier League|premier, La Liga|campeonato espanhol, ' +
      'Bundesliga, Paulistão|paulista, Carioca|cariocao, Copa do Nordeste|nordestao, Recopa, Liga das Nações|nations league, ' +
      'Olimpíadas|olimpiada|jogos olimpicos',
  },
  {
    theme: 'lance do futebol', category: 'futebol', label: 'lances',
    keys: ['lances', 'lance', 'jogadas', 'jogada', 'dribles', 'drible', 'lances do futebol'],
    list:
      'Bicicleta, Chapéu, Caneta, Elástico, Lambreta, Paradinha, Pedalada, Trivela, Voleio, Cavadinha, Letra, Carretilha, ' +
      'Gol olímpico, Peixinho, Drible da vaca, Gol contra, Pênalti, Escanteio, Impedimento, Cartão vermelho, Carrinho, Cabeçada, ' +
      'Hat-trick|hat trick, Gol de placa',
  },
  {
    theme: 'edição da Copa', category: 'futebol', label: 'Copas do Mundo',
    keys: ['copas', 'copa', 'copas do mundo', 'copa do mundo', 'edicoes da copa', 'edicao da copa'],
    list: COPAS,
  },
  {
    theme: 'lugar', category: 'geral', label: 'lugares',
    keys: ['lugares', 'lugar', 'locais', 'local'],
    list:
      'Praia, Hospital, Escola, Aeroporto, Supermercado, Academia, Igreja, Cinema, Restaurante, Shopping, Padaria, Farmácia, ' +
      'Prisão|cadeia|presidio, Hotel, Rodoviária, Parque de diversões, Zoológico, Biblioteca, Delegacia, Salão de beleza, ' +
      'Posto de gasolina, Churrascaria, Balada, Estádio',
  },
];

const ORDER = ['futebol', 'geral', 'anime', 'historia'];
const withExtra = (t: ImpostorThemeDef): ImpostorThemeDef => {
  const extra = [EXTRA[t.theme], EXTRA_NAMES[t.theme]].filter(Boolean).join(', ');
  return extra ? { ...t, list: `${t.list}, ${extra}` } : t;
};

/** Temas do Impostor e como o grupo pede cada um ("coisa do futebol" fica de fora: genérico demais para blefar). */
export const IMPOSTOR_THEMES: ImpostorThemeDef[] = [
  ...ANAGRAM_THEMES.filter((t) => t.theme !== 'coisa do futebol' && !ANAGRAM_ONLY.includes(t.theme)).map((t) => ({ ...t, label: ANAGRAM_LABELS[t.theme] })),
  ...OWN_THEMES,
  ...NEW_THEMES,
]
  .map(withExtra)
  .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));

/** Como o tema aparece na lista ("seleções", "heróis e vilões"). */
export const themeLabel = (t: ImpostorThemeDef) => t.label ?? t.keys[0];

const slug = (x: string) => normalize(x).replace(/\s+/g, '-');

/**
 * Partes que entregam o segredo: o nome e cada apelido inteiros (mesmo curtos:
 * "U2", "Ka"), cada palavra de 3+ letras e anos de 2 dígitos ("70").
 */
const forbiddenOf = (forms: string[]) =>
  [
    ...new Set([
      ...forms.map((f) => f.replace(/\s+/g, '')).filter(Boolean),
      ...forms.flatMap((f) => f.split(' ')).filter((w) => w.length >= 3 || /^\d{2}$/.test(w)),
    ]),
  ];

export const IMPOSTOR_SECRETS: ImpostorSecret[] = (() => {
  const seen = new Set<string>();
  return IMPOSTOR_THEMES.flatMap((t) =>
    t.list.split(',').flatMap((raw) => {
      const [name, ...aliases] = raw.split('|').map((x) => x.trim());
      const id = `imp-${slug(t.theme)}-${slug(name)}`;
      if (!name || seen.has(id)) return []; // nome a mais que o Anagrama já tinha
      seen.add(id);
      return [{ id, theme: t.theme, category: t.category, name, aliases, forbidden: forbiddenOf([name, ...aliases].map(normalize)) }];
    }),
  );
})();

export function getImpostorSecret(id: string): ImpostorSecret | undefined {
  return IMPOSTOR_SECRETS.find((s) => s.id === id);
}

/** Segredos de uma partida: o tema pedido ou uma mistura. Sem tema (null): futebol. */
export function impostorPool(theme: string | null): ImpostorSecret[] {
  if (theme === IMPOSTOR_TUDO) return IMPOSTOR_SECRETS;
  if (theme === IMPOSTOR_GERAL) return IMPOSTOR_SECRETS.filter((s) => s.category !== 'futebol');
  if (theme && theme !== IMPOSTOR_FUTEBOL) return IMPOSTOR_SECRETS.filter((s) => s.theme === theme);
  return IMPOSTOR_SECRETS.filter((s) => s.category === 'futebol');
}

/** Como o tema aparece na sala: o nome do tema, a mistura ou nada (sem tema = futebol misturado). */
export function impostorThemeLabel(theme: string | null): string | null {
  if (theme === IMPOSTOR_FUTEBOL) return 'futebol (misturado)';
  if (theme === IMPOSTOR_GERAL) return 'temas gerais (misturado)';
  if (theme === IMPOSTOR_TUDO) return 'tudo misturado';
  return theme;
}

/** Tema pedido no comando ("clubes", "craques do mundo", "futebol", "geral", "tudo"), ou undefined. */
export function findImpostorTheme(raw: string): string | undefined {
  const key = normalize(raw);
  const mix = Object.entries(MIXES).find(([, keys]) => keys.includes(key));
  if (mix) return mix[0];
  return IMPOSTOR_THEMES.find((t) => t.keys.includes(key) || normalize(t.theme) === key || normalize(themeLabel(t)) === key)?.theme;
}
