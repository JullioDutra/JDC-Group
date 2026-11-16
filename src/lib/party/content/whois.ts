/**
 * "Quem é?": cada ficha tem 5 dicas, da mais difícil para a mais fácil.
 * Curadoria: só fatos estáveis e conferidos (nada que mude com a temporada).
 */
export interface WhoIsCard {
  id: string;
  answer: string;
  aliases: string[];
  clues: [string, string, string, string, string];
}

export const WHOIS: WhoIsCard[] = [
  {
    id: 'ronaldinho', answer: 'Ronaldinho', aliases: ['ronaldinho gaucho', 'r10', 'dinho'],
    clues: [
      'Nasceu em Porto Alegre, em 1980.',
      'Meia-atacante, famoso pelos dribles e pelo sorriso em campo.',
      'Campeão da Copa de 2002 e da Libertadores de 2013.',
      'Jogou no Grêmio, PSG, Barcelona, Milan, Flamengo e Atlético-MG.',
      'Bola de Ouro de 2005, camisa 10 do Barcelona.',
    ],
  },
  {
    id: 'ronaldo', answer: 'Ronaldo', aliases: ['ronaldo fenomeno', 'ronaldo nazario', 'r9', 'fenomeno'],
    clues: [
      'Nasceu no Rio de Janeiro, em 1976.',
      'Centroavante, revelado pelo Cruzeiro.',
      'Defendeu Barcelona, Inter de Milão, Real Madrid e Milan.',
      'Artilheiro da Copa de 2002, com 8 gols.',
      'Apelidado de Fenômeno, o R9.',
    ],
  },
  {
    id: 'kaka', answer: 'Kaká', aliases: ['kaka', 'ricardo kaka'],
    clues: [
      'Nasceu em 1982, no Distrito Federal.',
      'Meia revelado pelo São Paulo.',
      'Campeão da Champions de 2007.',
      'Jogou no Milan, Real Madrid e Orlando City.',
      'Bola de Ouro de 2007, camisa 22 do Milan.',
    ],
  },
  {
    id: 'zico', answer: 'Zico', aliases: ['galinho', 'galinho de quintino', 'arthur antunes coimbra'],
    clues: [
      'Nasceu em 1953, no Rio de Janeiro.',
      'Meia, camisa 10, mestre das cobranças de falta.',
      'Jogou na Udinese e no Kashima Antlers.',
      'Campeão da Libertadores e do Mundial de 1981.',
      'Maior ídolo da história do Flamengo, o Galinho de Quintino.',
    ],
  },
  {
    id: 'romario', answer: 'Romário', aliases: ['romario', 'baixinho'],
    clues: [
      'Nasceu em 1966, no Rio de Janeiro.',
      'Atacante, mestre da finalização dentro da área.',
      'Jogou no PSV, Barcelona e Valencia.',
      'Eleito o melhor do mundo pela FIFA em 1994.',
      'O Baixinho, campeão da Copa de 1994.',
    ],
  },
  {
    id: 'rogerio-ceni', answer: 'Rogério Ceni', aliases: ['rogerio ceni', 'ceni', 'm1to'],
    clues: [
      'Nasceu em 1973, em Pato Branco (PR).',
      'Goleiro que jogou praticamente a carreira inteira em um só clube.',
      'Campeão da Libertadores e do Mundial de 2005.',
      'Batia faltas e pênaltis.',
      'Goleiro com mais gols da história, ídolo do São Paulo.',
    ],
  },
  {
    id: 'cafu', answer: 'Cafu', aliases: ['marcos evangelista'],
    clues: [
      'Nasceu em 1970, em São Paulo.',
      'Lateral-direito incansável.',
      'Jogou no São Paulo, Palmeiras, Roma e Milan.',
      'Único jogador a disputar três finais de Copa seguidas (1994, 1998 e 2002).',
      'Capitão do pentacampeonato, levantou a taça em 2002.',
    ],
  },
  {
    id: 'pele', answer: 'Pelé', aliases: ['pele', 'edson arantes do nascimento', 'rei pele'],
    clues: [
      'Nasceu em 1940, em Três Corações (MG).',
      'Atacante que jogou no New York Cosmos no fim da carreira.',
      'Fez o milésimo gol em 1969, no Maracanã.',
      'Único jogador campeão de três Copas: 1958, 1962 e 1970.',
      'O Rei do futebol, ídolo do Santos.',
    ],
  },
  {
    id: 'garrincha', answer: 'Garrincha', aliases: ['mane garrincha', 'mane'],
    clues: [
      'Nasceu em 1933, em Pau Grande (RJ).',
      'Ponta-direita de dribles desconcertantes.',
      'Campeão das Copas de 1958 e 1962.',
      'Grande ídolo do Botafogo.',
      'O Anjo de Pernas Tortas.',
    ],
  },
  {
    id: 'marta', answer: 'Marta', aliases: ['marta vieira', 'marta silva'],
    clues: [
      'Nasceu em 1986, em Dois Riachos (AL).',
      'Atacante, camisa 10 da Seleção feminina.',
      'Maior artilheira da história das Copas do Mundo, entre homens e mulheres.',
      'Eleita seis vezes a melhor jogadora do mundo pela FIFA.',
      'A Rainha do futebol brasileiro.',
    ],
  },
  {
    id: 'messi', answer: 'Lionel Messi', aliases: ['messi', 'leo messi', 'lionel messi'],
    clues: [
      'Nasceu em Rosário, em 1987.',
      'Canhoto, revelado em La Masia.',
      'Jogou no PSG e no Inter Miami.',
      'Campeão da Copa de 2022.',
      'Recordista de Bolas de Ouro, ídolo do Barcelona.',
    ],
  },
  {
    id: 'cristiano-ronaldo', answer: 'Cristiano Ronaldo', aliases: ['cristiano', 'cr7', 'ronaldo cr7'],
    clues: [
      'Nasceu na Ilha da Madeira, em 1985.',
      'Revelado pelo Sporting.',
      'Jogou no Manchester United, Real Madrid, Juventus e Al-Nassr.',
      'Campeão da Eurocopa de 2016.',
      'O CR7.',
    ],
  },
  {
    id: 'maradona', answer: 'Maradona', aliases: ['diego maradona', 'diego armando maradona', 'dieguito'],
    clues: [
      'Nasceu em 1960, na província de Buenos Aires.',
      'Revelado pelo Argentinos Juniors; jogou no Boca, Barcelona e Sevilla.',
      'Ídolo eterno do Napoli.',
      'Campeão da Copa de 1986.',
      'Autor do gol da "mão de Deus".',
    ],
  },
  {
    id: 'zidane', answer: 'Zidane', aliases: ['zinedine zidane', 'zizou'],
    clues: [
      'Nasceu em Marselha, em 1972.',
      'Meia elegante que jogou no Cannes e no Bordeaux.',
      'Brilhou na Juventus e no Real Madrid.',
      'Fez dois gols de cabeça na final da Copa de 1998.',
      'Expulso na final de 2006 após uma cabeçada em Materazzi.',
    ],
  },
  {
    id: 'henry', answer: 'Thierry Henry', aliases: ['henry', 'titi'],
    clues: [
      'Nasceu em 1977, perto de Paris.',
      'Atacante revelado pelo Monaco.',
      'Jogou na Juventus, Barcelona e New York Red Bulls.',
      'Campeão da Copa de 1998.',
      'Maior artilheiro da história do Arsenal.',
    ],
  },
  {
    id: 'buffon', answer: 'Buffon', aliases: ['gianluigi buffon', 'gigi buffon'],
    clues: [
      'Nasceu em 1978, na Toscana.',
      'Goleiro revelado pelo Parma.',
      'Teve uma passagem pelo PSG.',
      'Campeão da Copa de 2006.',
      'Lenda da Juventus.',
    ],
  },
  {
    id: 'iniesta', answer: 'Iniesta', aliases: ['andres iniesta'],
    clues: [
      'Nasceu em 1984, em Fuentealbilla.',
      'Meia formado em La Masia.',
      'Terminou a carreira jogando no Japão e nos Emirados.',
      'Ídolo do Barcelona, ao lado de Xavi.',
      'Fez o gol do título da Espanha na final da Copa de 2010.',
    ],
  },
  {
    id: 'haaland', answer: 'Haaland', aliases: ['erling haaland', 'erling'],
    clues: [
      'Nasceu em Leeds, na Inglaterra, em 2000.',
      'Defende a seleção da Noruega.',
      'Passou pelo Molde, Salzburg e Borussia Dortmund.',
      'Fez 36 gols na Premier League 2022/23, sua primeira temporada na Inglaterra.',
      'Centroavante do Manchester City.',
    ],
  },
  {
    id: 'mbappe', answer: 'Mbappé', aliases: ['mbappe', 'kylian mbappe', 'kylian'],
    clues: [
      'Nasceu em Paris, em 1998.',
      'Revelado pelo Monaco.',
      'Campeão da Copa de 2018.',
      'Fez três gols na final da Copa de 2022.',
      'Saiu do PSG para o Real Madrid em 2024.',
    ],
  },
  {
    id: 'adriano', answer: 'Adriano', aliases: ['adriano imperador', 'imperador'],
    clues: [
      'Nasceu em 1982, no Rio de Janeiro.',
      'Centroavante canhoto de chute fortíssimo.',
      'Campeão da Copa América de 2004.',
      'Brilhou na Inter de Milão.',
      'O Imperador, revelado pelo Flamengo.',
    ],
  },
  {
    id: 'gabigol', answer: 'Gabigol', aliases: ['gabriel barbosa', 'gabi', 'gabigol'],
    clues: [
      'Nasceu em 1996, em São Bernardo do Campo.',
      'Revelado pelo Santos.',
      'Passou pela Inter de Milão e pelo Benfica.',
      'Fez os dois gols da virada na final da Libertadores de 2019.',
      'Ídolo do Flamengo, o Gabigol.',
    ],
  },
  {
    id: 'neymar', answer: 'Neymar', aliases: ['neymar jr', 'ney'],
    clues: [
      'Nasceu em Mogi das Cruzes, em 1992.',
      'Campeão da Libertadores de 2011.',
      'Jogou no Barcelona, PSG e Al-Hilal.',
      'Passou Pelé como artilheiro da Seleção em 2023.',
      'Camisa 10, revelado pelo Santos.',
    ],
  },
];

export function getWhoIs(id: string): WhoIsCard | undefined {
  return WHOIS.find((c) => c.id === id);
}
