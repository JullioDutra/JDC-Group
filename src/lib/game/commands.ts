/**
 * Lista única de comandos: alimenta a imagem da ajuda e o texto (plano B
 * quando a imagem não sai). Mudou um comando? Muda aqui.
 */
export const GROUP_GAMES: Array<[command: string, what: string]> = [
  ['abrir sala', 'Escalação em Grupo'],
  ['top 10', 'acertem o ranking'],
  ['abrir que time é esse', 'time e ano pela escalação'],
  ['abrir quem é', 'o craque pelas dicas'],
  ['abrir intruso', 'quem não pertence'],
  ['abrir emoji', 'adivinhe pelo emoji'],
  ['abrir relâmpago', 'perguntas rápidas'],
  ['abrir alfabeto', 'letra + clube ou seleção'],
  ['abrir chute certo', 'o número mais perto'],
  ['abrir bandeiraço', 'de que país é?'],
  ['abrir sobrevivente', 'errou, perde vida'],
  ['abrir conexões', '4 grupos escondidos'],
  ['abrir stop', 'a Adedonha do grupo'],
  ['abrir draft', 'draft e o grupo vota'],
  ['abrir linha do tempo', 'ponha em ordem'],
  ['abrir fato ou fake', 'verdade ou mito?'],
];

export const DUEL_COMMANDS: Array<[command: string, what: string]> = [
  ['iniciar jogo', 'desafio 1 x 1'],
  ['iniciar aleatório', 'tema sorteado'],
  ['iniciar melhor time', 'clubes sorteados'],
  ['aceitar', 'entra no desafio'],
];

export const IN_GAME_COMMANDS = ['entrar', 'sair', 'começar', 'próxima', 'placar', 'pular', 'encerrar', 'tempo', 'cancelar'];

export const CATEGORIES_LINE = 'Categorias: some futebol, geral, história, anime ou política ao comando (ex.: abrir relâmpago geral). Política só quando pedida.';

export const NAMES_LINE = 'Jogador: vale o nome famoso, o completo ou o sobrenome. Apelido e erro de digitação não valem.';

/** Ajuda em texto (plano B da imagem). */
export function helpText(gameName: string): string {
  return [
    `*${gameName}* — comandos`,
    '',
    '*Em grupo* (mande o comando; quem quer jogar manda *entrar*; o anfitrião manda *começar*)',
    ...GROUP_GAMES.map(([c, w]) => `• *${c}* — ${w}`),
    '',
    '*1 x 1*',
    ...DUEL_COMMANDS.map(([c, w]) => `• *${c}* — ${w}`),
    '',
    `*Durante o jogo:* ${IN_GAME_COMMANDS.map((c) => `*${c}*`).join(' · ')}`,
    '',
    CATEGORIES_LINE,
    NAMES_LINE,
    '',
    '*Geral:* *regras* · *modos* · *ranking* · *desativar jogos* (admin)',
  ].join('\n');
}
