/**
 * Lista única de comandos: alimenta a imagem da ajuda e o texto (plano B
 * quando a imagem não sai). Mudou um comando? Muda aqui.
 */
export const GROUP_GAMES: Array<[command: string, what: string]> = [
  ['abrir sala', 'Escalação em Grupo · ex.: 1 brasileirão'],
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
  ['abrir stop', 'a Adedonha (+ futebol ou geral)'],
  ['abrir draft', 'draft e o grupo vota'],
  ['abrir linha do tempo', 'ponha em ordem'],
  ['abrir fato ou fake', 'verdade ou mito?'],
  ['abrir carreira', 'de quem é a trajetória?'],
  ['abrir ponte', 'quem passou pelos 4 clubes'],
  ['abrir leilão', 'monte o time com 100 moedas'],
  ['abrir anagrama', '+ tema: clubes, capitais, filmes…'],
  ['abrir impostor', 'blefe: achem o impostor'],
  ['abrir rosto borrado', 'quem é o craque da foto?'],
  ['top 100', 'a lista do dia (1 vez por dia)'],
];

export const DUEL_COMMANDS: Array<[command: string, what: string]> = [
  ['iniciar jogo', 'desafio 1 x 1'],
  ['iniciar aleatório', 'tema sorteado'],
  ['iniciar melhor time', 'clubes sorteados'],
  ['desafio grade', 'jogo da velha: clubes, ligas, títulos'],
  ['desafio pênaltis', '5 cobranças + morte súbita'],
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
    '*Jogadores:* *ficha <nome>* mostra a ficha e os números · admin: *corrigir <nome> <dado> <valor>*, *nome famoso <apelido> = <nome>*',
    '*Geral:* *regras* · *modos* · *ranking* (da temporada, top 10) · *ranking b* (11º ao 20º) · *campeões* (campeão de cada temporada) · *temas do anagrama* · *simulador* (Brasileirão 2026: quem cai)',
    '*Admin:* *virada de temporada* (imagem com os melhores e ranking zerado) · *resetar top 100* (libera mais um Top 100 hoje) · *bloquear próxima @pessoa* / *liberar próxima @pessoa* / *bloqueados* · *ativar impostor* (grupo só com o Impostor, para grupo que não é de futebol) · *desativar jogos*',
  ].join('\n');
}
