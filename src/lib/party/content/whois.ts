/**
 * "Quem é?": cada ficha tem 5 dicas, da mais difícil para a mais fácil.
 * Curadoria: só fatos estáveis e conferidos (nada que mude com a temporada).
 */
import type { ContentCategory } from '../../game/types';

export interface WhoIsCard {
  id: string;
  /** Sem categoria = futebol. */
  category?: ContentCategory;
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
  // ---------- Futebol: lendas mais difíceis ----------
  {
    id: 'cruyff', answer: 'Johan Cruyff', aliases: ['cruyff', 'cruijff'],
    clues: [
      'Nasceu em Amsterdã, em 1947.',
      'Símbolo do "futebol total".',
      'Vice-campeão do mundo com a "Laranja Mecânica" em 1974.',
      'Ganhou três Bolas de Ouro.',
      'Ídolo do Ajax e técnico do "Dream Team" do Barcelona.',
    ],
  },
  {
    id: 'beckenbauer', answer: 'Franz Beckenbauer', aliases: ['beckenbauer', 'kaiser'],
    clues: [
      'Nasceu em Munique, em 1945.',
      'Zagueiro que saía jogando, o líbero mais famoso da história.',
      'Ídolo do Bayern.',
      'Campeão do mundo como jogador em 1974 e como técnico em 1990.',
      'O Kaiser.',
    ],
  },
  {
    id: 'puskas', answer: 'Puskás', aliases: ['ferenc puskas', 'puskas'],
    clues: [
      'Nasceu em Budapeste, em 1927.',
      'Brilhou no Honvéd antes de deixar a Hungria.',
      'Vice-campeão do mundo em 1954 com a seleção húngara.',
      'Fez história no Real Madrid ao lado de Di Stéfano.',
      'O prêmio da FIFA de gol mais bonito leva o nome dele.',
    ],
  },
  {
    id: 'eusebio', answer: 'Eusébio', aliases: ['eusebio', 'pantera negra'],
    clues: [
      'Nasceu em Moçambique, em 1942.',
      'Defendeu a seleção de Portugal.',
      'Artilheiro da Copa de 1966, com 9 gols.',
      'Maior ídolo da história do Benfica.',
      'A Pantera Negra.',
    ],
  },
  {
    id: 'di-stefano', answer: 'Di Stéfano', aliases: ['alfredo di stefano', 'di stefano'],
    clues: [
      'Nasceu em Buenos Aires, em 1926.',
      'Jogou no River Plate e no Millonarios.',
      'Defendeu mais de uma seleção na carreira, incluindo a Espanha.',
      'Ganhou as cinco primeiras Copas dos Campeões da Europa (1956 a 1960).',
      'A "Saeta Rubia", lenda do Real Madrid.',
    ],
  },
  {
    id: 'socrates', answer: 'Sócrates', aliases: ['socrates', 'doutor socrates', 'doutor'],
    clues: [
      'Nasceu em Belém do Pará, em 1954.',
      'Formado em medicina.',
      'Capitão da Seleção na Copa de 1982.',
      'Liderou a Democracia Corinthiana.',
      'O Doutor, famoso pelo calcanhar.',
    ],
  },
  {
    id: 'riquelme', answer: 'Riquelme', aliases: ['juan roman riquelme', 'roman'],
    clues: [
      'Nasceu em 1978, na Grande Buenos Aires.',
      'Meia clássico, camisa 10, famoso pela pausa.',
      'Passou pelo Barcelona e brilhou no Villarreal.',
      'Ganhou três Libertadores como jogador.',
      'Ídolo do Boca Juniors, eleito presidente do clube em 2023.',
    ],
  },
  {
    id: 'totti', answer: 'Totti', aliases: ['francesco totti'],
    clues: [
      'Nasceu em Roma, em 1976.',
      'Jogou a carreira inteira em um só clube.',
      'Campeão do mundo em 2006.',
      'Campeão italiano em 2001.',
      'O eterno capitão da Roma.',
    ],
  },
  {
    id: 'pirlo', answer: 'Pirlo', aliases: ['andrea pirlo'],
    clues: [
      'Nasceu em 1979, perto de Brescia.',
      'Volante criativo, o "regista".',
      'Passou pela Inter, mas brilhou no Milan.',
      'Campeão do mundo em 2006.',
      'Ganhou quatro títulos italianos seguidos pela Juventus.',
    ],
  },
  {
    id: 'rivellino', answer: 'Rivellino', aliases: ['rivelino', 'roberto rivellino'],
    clues: [
      'Nasceu em São Paulo, em 1946.',
      'Canhoto de chute fortíssimo, a "Patada Atômica".',
      'Campeão do mundo em 1970.',
      'Jogou no Fluminense depois de sair de seu primeiro clube.',
      'Ídolo do Corinthians, famoso pelo elástico.',
    ],
  },
  {
    id: 'falcao', answer: 'Falcão', aliases: ['paulo roberto falcao', 'falcao'],
    clues: [
      'Nasceu em 1953, em Abelardo Luz (SC).',
      'Volante elegante, de passe longo.',
      'Titular da Seleção de 1982.',
      'Tricampeão brasileiro pelo Internacional.',
      'O "Rei de Roma".',
    ],
  },
  {
    id: 'valderrama', answer: 'Valderrama', aliases: ['carlos valderrama', 'el pibe'],
    clues: [
      'Nasceu em Santa Marta, em 1961.',
      'Meia de passe refinado e cabeleira inconfundível.',
      'Jogou na França, na Espanha e nos Estados Unidos.',
      'Disputou as Copas de 1990, 1994 e 1998.',
      'O "Pibe", maior ídolo da seleção da Colômbia.',
    ],
  },
  // ---------- História e política ("abrir quem é história") ----------
  {
    id: 'getulio', category: 'historia', answer: 'Getúlio Vargas', aliases: ['getulio', 'vargas'],
    clues: [
      'Nasceu em São Borja (RS), em 1882.',
      'Chegou ao poder com a Revolução de 1930.',
      'Instaurou o Estado Novo em 1937.',
      'Criou a CLT em 1943.',
      'Deixou uma carta-testamento em 1954: "saio da vida para entrar na história".',
    ],
  },
  {
    id: 'jk', category: 'historia', answer: 'Juscelino Kubitschek', aliases: ['jk', 'juscelino'],
    clues: [
      'Nasceu em Diamantina (MG), em 1902.',
      'Foi prefeito de Belo Horizonte e criou a Pampulha.',
      'Governou de 1956 a 1961.',
      'Prometeu "50 anos em 5".',
      'Construiu Brasília.',
    ],
  },
  {
    id: 'tiradentes', category: 'historia', answer: 'Tiradentes', aliases: ['joaquim jose da silva xavier'],
    clues: [
      'Era alferes e também trabalhava arrancando dentes.',
      'Participou de uma conspiração contra a Coroa portuguesa.',
      'O movimento era a Inconfidência Mineira.',
      'Foi enforcado em 21 de abril de 1792.',
      'Joaquim José da Silva Xavier.',
    ],
  },
  {
    id: 'dom-pedro-ii', category: 'historia', answer: 'Dom Pedro II', aliases: ['pedro ii', 'pedro segundo', 'd pedro ii'],
    clues: [
      'Nasceu no Rio de Janeiro, em 1825.',
      'Assumiu o trono ainda adolescente, com a antecipação da maioridade.',
      'Governou por quase 50 anos.',
      'Foi deposto pela Proclamação da República, em 1889.',
      'Último imperador do Brasil.',
    ],
  },
  {
    id: 'princesa-isabel', category: 'historia', answer: 'Princesa Isabel', aliases: ['isabel'],
    clues: [
      'Nasceu em 1846, no Rio de Janeiro.',
      'Filha de Dom Pedro II.',
      'Assumiu a regência do Império algumas vezes.',
      'Assinou a Lei do Ventre Livre em 1871.',
      'Assinou a Lei Áurea em 1888.',
    ],
  },
  {
    id: 'zumbi', category: 'historia', answer: 'Zumbi dos Palmares', aliases: ['zumbi'],
    clues: [
      'Nasceu em Alagoas no século XVII.',
      'Liderou a resistência contra a escravidão.',
      'Comandou o maior quilombo do Brasil colonial.',
      'Foi morto em 20 de novembro de 1695.',
      'A data da morte virou o Dia da Consciência Negra.',
    ],
  },
  {
    id: 'ulysses', category: 'historia', answer: 'Ulysses Guimarães', aliases: ['ulysses', 'ulisses guimaraes'],
    clues: [
      'Deputado federal por São Paulo por décadas.',
      'Foi a principal voz da oposição ao regime militar no MDB.',
      'Ganhou o apelido de "Senhor Diretas".',
      'Presidiu a Assembleia Nacional Constituinte.',
      'Chamou a Constituição de 1988 de "Constituição Cidadã".',
    ],
  },
  {
    id: 'chico-mendes', category: 'historia', answer: 'Chico Mendes', aliases: ['chico'],
    clues: [
      'Nasceu no Acre, em 1944.',
      'Era seringueiro.',
      'Virou líder sindical e ambientalista na Amazônia.',
      'Lutou pelas reservas extrativistas.',
      'Foi assassinado em Xapuri, em 1988.',
    ],
  },
  {
    id: 'mandela', category: 'historia', answer: 'Nelson Mandela', aliases: ['mandela', 'madiba'],
    clues: [
      'Nasceu em 1918.',
      'Advogado e líder contra o apartheid.',
      'Passou 27 anos preso.',
      'Ganhou o Nobel da Paz em 1993.',
      'Primeiro presidente negro da África do Sul (1994).',
    ],
  },
  {
    id: 'gandhi', category: 'historia', answer: 'Gandhi', aliases: ['mahatma gandhi', 'mohandas gandhi'],
    clues: [
      'Nasceu em 1869.',
      'Advogado formado em Londres, atuou na África do Sul.',
      'Pregava a resistência pela não violência.',
      'Liderou a independência da Índia, em 1947.',
      'Foi assassinado em 1948. Chamado de "Mahatma".',
    ],
  },
  {
    id: 'mlk', category: 'historia', answer: 'Martin Luther King', aliases: ['martin luther king jr', 'luther king', 'mlk'],
    clues: [
      'Nasceu em Atlanta, em 1929.',
      'Era pastor batista.',
      'Liderou o movimento pelos direitos civis nos EUA.',
      'Discursou "I Have a Dream" em 1963.',
      'Nobel da Paz em 1964; foi assassinado em 1968.',
    ],
  },
  {
    id: 'churchill', category: 'historia', answer: 'Winston Churchill', aliases: ['churchill'],
    clues: [
      'Nasceu em 1874, num palácio.',
      'Ganhou o Nobel de Literatura em 1953.',
      'Prometeu "sangue, trabalho, lágrimas e suor".',
      'Liderou o Reino Unido na Segunda Guerra.',
      'Primeiro-ministro britânico de charuto inseparável.',
    ],
  },
  {
    id: 'che', category: 'historia', answer: 'Che Guevara', aliases: ['che', 'ernesto guevara'],
    clues: [
      'Nasceu na Argentina, em 1928.',
      'Formou-se em medicina e viajou de moto pela América do Sul.',
      'Foi um dos líderes da Revolução Cubana.',
      'Foi morto na Bolívia, em 1967.',
      'Seu rosto de boina virou uma das fotos mais reproduzidas do mundo.',
    ],
  },
  {
    id: 'fidel', category: 'historia', answer: 'Fidel Castro', aliases: ['fidel'],
    clues: [
      'Nasceu em 1926.',
      'Era advogado.',
      'Liderou a revolução que derrubou Batista em 1959.',
      'Governou seu país até 2008, quando passou o poder ao irmão.',
      'Líder da Revolução Cubana.',
    ],
  },
  {
    id: 'merkel', category: 'historia', answer: 'Angela Merkel', aliases: ['merkel'],
    clues: [
      'Nasceu em 1954 e cresceu na Alemanha Oriental.',
      'É doutora em química quântica.',
      'Foi a primeira mulher a chefiar o governo de seu país.',
      'Governou de 2005 a 2021.',
      'Chanceler da Alemanha por 16 anos.',
    ],
  },
  // ---------- Conhecimentos gerais ----------
  {
    id: 'santos-dumont', category: 'geral', answer: 'Santos Dumont', aliases: ['santos dumont', 'dumont', 'alberto santos dumont'],
    clues: [
      'Nasceu em Minas Gerais, em 1873, numa cidade que hoje leva o seu nome.',
      'Viveu boa parte da vida em Paris e ajudou a popularizar o relógio de pulso.',
      'Contornou a Torre Eiffel com um dirigível em 1901.',
      'Em 1906, voou com o 14-Bis diante de uma multidão em Paris.',
      'É chamado no Brasil de Pai da Aviação.',
    ],
  },
  {
    id: 'niemeyer', category: 'geral', answer: 'Oscar Niemeyer', aliases: ['niemeyer', 'oscar niemeyer'],
    clues: [
      'Nasceu no Rio de Janeiro, em 1907, e trabalhou até depois dos 100 anos.',
      'Ganhou o Prêmio Pritzker em 1988.',
      'Projetou o conjunto da Pampulha, em Belo Horizonte.',
      'Desenhou o Museu de Arte Contemporânea de Niterói, em forma de disco voador.',
      'É o arquiteto dos principais prédios de Brasília.',
    ],
  },
  {
    id: 'tarsila', category: 'geral', answer: 'Tarsila do Amaral', aliases: ['tarsila', 'tarsila do amaral'],
    clues: [
      'Nasceu em Capivari (SP), em 1886.',
      'Foi casada com o escritor Oswald de Andrade.',
      'Pintou "Operários" em 1933.',
      'Sua obra inspirou o Movimento Antropofágico.',
      'Pintou o "Abaporu", o quadro brasileiro mais famoso.',
    ],
  },
  {
    id: 'machado', category: 'geral', answer: 'Machado de Assis', aliases: ['machado', 'machado de assis'],
    clues: [
      'Nasceu no Morro do Livramento, no Rio de Janeiro, em 1839.',
      'Foi o primeiro presidente da Academia Brasileira de Letras.',
      'Escreveu "O Alienista" e "Quincas Borba".',
      'Criou a personagem Capitu e a dúvida mais famosa da literatura nacional.',
      'É o autor de "Dom Casmurro".',
    ],
  },
  {
    id: 'curie', category: 'geral', answer: 'Marie Curie', aliases: ['curie', 'marie curie', 'madame curie'],
    clues: [
      'Nasceu em Varsóvia, em 1867.',
      'Foi a primeira mulher a ganhar um Prêmio Nobel.',
      'É a única pessoa premiada com o Nobel em duas ciências diferentes (Física e Química).',
      'Batizou um elemento em homenagem ao seu país natal, o polônio.',
      'Descobriu o rádio e estudou a radioatividade.',
    ],
  },
  {
    id: 'einstein', category: 'geral', answer: 'Albert Einstein', aliases: ['einstein', 'albert einstein'],
    clues: [
      'Nasceu em Ulm, na Alemanha, em 1879.',
      'Trabalhou num escritório de patentes em Berna enquanto fazia física nas horas vagas.',
      'Ganhou o Nobel de 1921 pelo efeito fotoelétrico, e não pela teoria que o deixou famoso.',
      'A foto dele mostrando a língua é uma das mais conhecidas do século 20.',
      'Criou a teoria da relatividade e a fórmula E = mc².',
    ],
  },
  {
    id: 'da-vinci', category: 'geral', answer: 'Leonardo da Vinci', aliases: ['da vinci', 'leonardo', 'leonardo da vinci'],
    clues: [
      'Nasceu em 1452, na Toscana.',
      'Escrevia as anotações espelhadas, da direita para a esquerda.',
      'Desenhou máquinas voadoras e o "Homem Vitruviano".',
      'Pintou "A Última Ceia" numa parede em Milão.',
      'Pintou a Mona Lisa.',
    ],
  },
  {
    id: 'chico', category: 'geral', answer: 'Chico Buarque', aliases: ['chico', 'chico buarque'],
    clues: [
      'Nasceu no Rio de Janeiro, em 1944, filho do historiador Sérgio Buarque de Holanda.',
      'Ganhou o Prêmio Camões em 2019 e escreveu o romance "Budapeste".',
      'Teve canções censuradas na ditadura e usou o pseudônimo Julinho da Adelaide.',
      'Compôs "Construção" e "Cálice" (esta com Gilberto Gil).',
      'Estourou em 1966 com "A Banda".',
    ],
  },
  {
    id: 'clarice', category: 'geral', answer: 'Clarice Lispector', aliases: ['clarice', 'clarice lispector'],
    clues: [
      'Nasceu na Ucrânia, em 1920, e chegou ao Brasil ainda bebê.',
      'Cresceu no Recife e depois morou no Rio de Janeiro.',
      'Escreveu "A Paixão segundo G.H.".',
      'Criou a personagem Macabéa.',
      'É a autora de "A Hora da Estrela".',
    ],
  },
  {
    id: 'carmen', category: 'geral', answer: 'Carmen Miranda', aliases: ['carmen miranda', 'carmen'],
    clues: [
      'Nasceu em Portugal, em 1909, e cresceu no Rio de Janeiro.',
      'Era chamada de "A Pequena Notável".',
      'Fez carreira em Hollywood nos anos 1940.',
      'Ficou famosa pelo turbante cheio de frutas.',
      'Cantava "O que é que a baiana tem?".',
    ],
  },
  {
    id: 'tesla', category: 'geral', answer: 'Nikola Tesla', aliases: ['tesla', 'nikola tesla'],
    clues: [
      'Nasceu em 1856, onde hoje é a Croácia.',
      'Trabalhou para Thomas Edison e depois virou seu rival.',
      'Defendia a corrente alternada na "guerra das correntes".',
      'A unidade de densidade de fluxo magnético leva o seu sobrenome.',
      'Dá nome a uma famosa marca de carros elétricos.',
    ],
  },
  {
    id: 'newton', category: 'geral', answer: 'Isaac Newton', aliases: ['newton', 'isaac newton'],
    clues: [
      'Nasceu na Inglaterra, em 1643.',
      'Foi diretor da Casa da Moeda inglesa.',
      'Criou o cálculo (ao mesmo tempo que Leibniz).',
      'Escreveu os "Principia" e as três leis do movimento.',
      'Diz a lenda que uma maçã o levou à lei da gravitação.',
    ],
  },
  {
    id: 'frida', category: 'geral', answer: 'Frida Kahlo', aliases: ['frida', 'frida kahlo'],
    clues: [
      'Nasceu no México, em 1907.',
      'Sofreu um grave acidente de ônibus aos 18 anos.',
      'Foi casada com o muralista Diego Rivera.',
      'Pintou dezenas de autorretratos.',
      'É lembrada pelas sobrancelhas unidas e pelas flores no cabelo.',
    ],
  },
  {
    id: 'senna', category: 'geral', answer: 'Ayrton Senna', aliases: ['senna', 'ayrton senna'],
    clues: [
      'Nasceu em São Paulo, em 1960.',
      'Começou no kart e estreou na Fórmula 1 pela Toleman, em 1984.',
      'Ganhou a primeira corrida debaixo de chuva, em Portugal, em 1985.',
      'Foi tricampeão mundial pela McLaren (1988, 1990 e 1991).',
      'Morreu em Ímola, em 1994, e o "Tema da Vitória" virou a sua trilha.',
    ],
  },

  {
    id: 'lamine-yamal', answer: 'Lamine Yamal', aliases: ['yamal', 'lamine'],
    clues: [
      'Nasceu em 2007, em Esplugues de Llobregat, na Espanha.',
      'Ponta canhoto, revelado nas categorias de base do Barcelona (La Masia).',
      'Campeão da Eurocopa de 2024, aos 17 anos, e da Copa do Mundo de 2026.',
      'Foi 3º na Bola de Ouro de 2026 e ganhou o Troféu Kopa de melhor jovem.',
      'Camisa 10 do Barcelona, empatado com Haaland como o mais valioso do mundo (Transfermarkt, 2026).',
    ],
  },
  {
    id: 'harry-kane', answer: 'Harry Kane', aliases: ['kane'],
    clues: [
      'Nasceu em Londres, em 1993.',
      'Centroavante, foi emprestado a Leyton Orient, Millwall, Norwich e Leicester no começo da carreira.',
      'É o maior artilheiro da história da seleção inglesa e do Tottenham.',
      'Foi para o Bayern de Munique em 2023 e lá ganhou o primeiro título da carreira.',
      'Ganhou a Bola de Ouro de 2026.',
    ],
  },
  {
    id: 'rodri', answer: 'Rodri', aliases: ['rodrigo hernandez', 'rodrigo hernandez cascante'],
    clues: [
      'Nasceu em Madri, em 1996.',
      'Volante, revelado pelo Villarreal; também jogou no Atlético de Madrid.',
      'Fez o gol do título da Champions de 2023, pelo Manchester City, contra a Inter.',
      'Ganhou a Bola de Ouro de 2024.',
      'Melhor jogador da Copa do Mundo de 2026, campeão com a Espanha.',
    ],
  },
];

export function getWhoIs(id: string): WhoIsCard | undefined {
  return WHOIS.find((c) => c.id === id);
}
