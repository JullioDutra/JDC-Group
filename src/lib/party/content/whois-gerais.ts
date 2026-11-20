import type { WhoIsCard } from './whois';

/**
 * "Quem é?" fora do futebol (rodada 10): gerais, história e anime.
 * Dicas da mais difícil para a mais fácil; só fatos estáveis.
 */
export const WHOIS_GERAIS: WhoIsCard[] = [
  // ---------- Gerais ----------
  {
    id: 'silvio-santos', category: 'geral', answer: 'Silvio Santos', aliases: ['silvio', 'senor abravanel'],
    clues: [
      'Nasceu no Rio de Janeiro, em 1930, filho de imigrantes judeus.',
      'Começou a vida como camelô nas ruas do Rio.',
      'Fundou uma das maiores emissoras de TV do país.',
      'Ficou famoso por jogar aviõezinhos de dinheiro para a plateia.',
      'Dono do SBT, apresentou o seu programa nas noites de domingo por décadas.',
    ],
  },
  {
    id: 'xuxa', category: 'geral', answer: 'Xuxa', aliases: ['xuxa meneghel', 'maria da graca meneghel'],
    clues: [
      'Nasceu em Santa Rosa, no Rio Grande do Sul, em 1963.',
      'Foi modelo antes de virar apresentadora.',
      'Começou na TV Manchete e foi para a Globo em 1986.',
      'Apresentou o Xou da ... e cantou "Ilariê".',
      'É chamada de Rainha dos Baixinhos.',
    ],
  },
  {
    id: 'roberto-carlos-cantor', category: 'geral', answer: 'Roberto Carlos', aliases: ['rei roberto carlos'],
    clues: [
      'Nasceu em Cachoeiro de Itapemirim, no Espírito Santo, em 1941.',
      'Liderou a Jovem Guarda nos anos 60, com Erasmo Carlos.',
      'Gravou "Detalhes", "Emoções" e "Como É Grande o Meu Amor por Você".',
      'Todo fim de ano tem especial na Globo.',
      'É chamado de Rei da música brasileira.',
    ],
  },
  {
    id: 'anitta', category: 'geral', answer: 'Anitta', aliases: ['larissa de macedo machado'],
    clues: [
      'Nasceu no Rio de Janeiro, em 1993, e cresceu em Honório Gurgel.',
      'Começou cantando funk e ficou famosa com "Show das Poderosas".',
      'Canta em português, espanhol e inglês.',
      'Em 2022, "Envolver" chegou ao topo mundial do Spotify.',
      'É a cantora brasileira mais famosa da sua geração no mundo, a "Poderosa".',
    ],
  },
  {
    id: 'ivete', category: 'geral', answer: 'Ivete Sangalo', aliases: ['ivete'],
    clues: [
      'Nasceu em Juazeiro, na Bahia, em 1972.',
      'Começou a carreira como vocalista da Banda Eva.',
      'Cantou "Sorte Grande" ("poeira, poeira, poeira").',
      'Rainha do axé, puxa trio no carnaval de Salvador.',
      'Apresenta programas na Globo e é conhecida como "Veveta".',
    ],
  },
  {
    id: 'gisele', category: 'geral', answer: 'Gisele Bündchen', aliases: ['gisele', 'gisele bundchen'],
    clues: [
      'Nasceu em Horizontina, no Rio Grande do Sul, em 1980.',
      'Foi descoberta num shopping de São Paulo, aos 14 anos.',
      'Desfilou por anos como "anjo" da Victoria\'s Secret.',
      'Foi casada com o jogador de futebol americano Tom Brady.',
      'É a modelo brasileira mais famosa do mundo.',
    ],
  },
  {
    id: 'rebeca-andrade', category: 'geral', answer: 'Rebeca Andrade', aliases: ['rebeca'],
    clues: [
      'Nasceu em Guarulhos, em 1999.',
      'Começou num projeto social e teve três cirurgias no joelho.',
      'Ganhou ouro no salto em Tóquio e no solo em Paris.',
      'Fez uma apresentação ao som de "Baile de Favela".',
      'Ginasta, é a maior medalhista olímpica da história do Brasil.',
    ],
  },
  {
    id: 'paulo-coelho', category: 'geral', answer: 'Paulo Coelho', aliases: ['coelho'],
    clues: [
      'Nasceu no Rio de Janeiro, em 1947.',
      'Escreveu letras de música com Raul Seixas, como "Gita".',
      'Fez o Caminho de Santiago e escreveu "O Diário de um Mago".',
      'Entrou para a Academia Brasileira de Letras em 2002.',
      'Autor de "O Alquimista", um dos livros mais vendidos do mundo.',
    ],
  },
  {
    id: 'tom-jobim', category: 'geral', answer: 'Tom Jobim', aliases: ['jobim', 'antonio carlos jobim'],
    clues: [
      'Nasceu no Rio de Janeiro, em 1927, e foi pianista de boate.',
      'O aeroporto internacional do Rio leva o seu nome.',
      'Compôs "Águas de Março" e gravou com Frank Sinatra.',
      'Parceiro de Vinicius de Moraes.',
      'Um dos pais da bossa nova, autor de "Garota de Ipanema".',
    ],
  },
  {
    id: 'fernanda-montenegro', category: 'geral', answer: 'Fernanda Montenegro', aliases: ['fernanda'],
    clues: [
      'Nasceu no Rio de Janeiro, em 1929.',
      'Fez teatro por décadas e muitas novelas na Globo.',
      'É mãe de outra atriz famosa, que também foi indicada ao Oscar.',
      'Foi a primeira brasileira indicada ao Oscar de melhor atriz.',
      'Viveu Dora em "Central do Brasil".',
    ],
  },
  {
    id: 'michael-jackson', category: 'geral', answer: 'Michael Jackson', aliases: ['jackson', 'mj'],
    clues: [
      'Nasceu em Gary, nos Estados Unidos, em 1958.',
      'Começou criança num grupo com os irmãos.',
      'Gravou um clipe no Pelourinho, em Salvador, e numa favela do Rio.',
      'O seu álbum "Thriller" é o mais vendido da história.',
      'O Rei do Pop, famoso pelo "moonwalk".',
    ],
  },
  {
    id: 'freddie-mercury', category: 'geral', answer: 'Freddie Mercury', aliases: ['freddie', 'mercury', 'farrokh bulsara'],
    clues: [
      'Nasceu em Zanzibar, na atual Tanzânia, em 1946.',
      'Antes de ficar famoso, estudou design gráfico em Londres.',
      'Fez um dos shows mais lembrados do Rock in Rio de 1985.',
      'Brilhou no Live Aid, em Wembley, no mesmo ano.',
      'Vocalista do Queen, cantou "Bohemian Rhapsody".',
    ],
  },
  {
    id: 'elvis', category: 'geral', answer: 'Elvis Presley', aliases: ['elvis'],
    clues: [
      'Nasceu em Tupelo, no Mississippi, em 1935.',
      'Serviu o exército americano na Alemanha.',
      'Viveu na mansão Graceland, em Memphis.',
      'Cantou "Love Me Tender" e "Jailhouse Rock".',
      'É chamado de Rei do Rock.',
    ],
  },
  {
    id: 'chaplin', category: 'geral', answer: 'Charlie Chaplin', aliases: ['chaplin', 'charles chaplin', 'carlitos'],
    clues: [
      'Nasceu em Londres, em 1889.',
      'Fez fama em Hollywood no tempo do cinema mudo.',
      'Dirigiu "Tempos Modernos" e "O Grande Ditador".',
      'O seu personagem andava com chapéu-coco, bengala e bigodinho.',
      'No Brasil, o personagem era chamado de Carlitos.',
    ],
  },
  {
    id: 'walt-disney', category: 'geral', answer: 'Walt Disney', aliases: ['disney'],
    clues: [
      'Nasceu em Chicago, em 1901.',
      'Ganhou mais Oscars que qualquer outra pessoa.',
      'Produziu "Branca de Neve e os Sete Anões" (1937).',
      'Abriu um parque na Califórnia em 1955.',
      'Criou o Mickey Mouse.',
    ],
  },
  {
    id: 'steve-jobs', category: 'geral', answer: 'Steve Jobs', aliases: ['jobs'],
    clues: [
      'Nasceu em São Francisco, em 1955, e foi adotado.',
      'Foi demitido da própria empresa e voltou anos depois.',
      'Comprou a Pixar, que fez "Toy Story".',
      'Apresentou o iPhone em 2007.',
      'Fundou a Apple com Steve Wozniak.',
    ],
  },
  {
    id: 'bill-gates', category: 'geral', answer: 'Bill Gates', aliases: ['gates'],
    clues: [
      'Nasceu em Seattle, em 1955.',
      'Largou a faculdade de Harvard.',
      'Criou uma fundação com a então esposa, Melinda.',
      'Foi por anos o homem mais rico do mundo.',
      'Fundou a Microsoft, do Windows.',
    ],
  },
  {
    id: 'taylor-swift', category: 'geral', answer: 'Taylor Swift', aliases: ['taylor'],
    clues: [
      'Nasceu na Pensilvânia, em 1989, e cresceu numa fazenda de árvores de Natal.',
      'Começou cantando música country em Nashville.',
      'Regravou os próprios álbuns, com "(Taylor\'s Version)" no nome.',
      'A sua turnê "The Eras Tour" foi a mais lucrativa da história.',
      'Os fãs se chamam "swifties".',
    ],
  },
  {
    id: 'picasso', category: 'geral', answer: 'Pablo Picasso', aliases: ['picasso'],
    clues: [
      'Nasceu em Málaga, na Espanha, em 1881.',
      'Viveu a maior parte da vida na França.',
      'Teve uma "fase azul" e uma "fase rosa".',
      'Pintou "Guernica", sobre um bombardeio na Guerra Civil Espanhola.',
      'Um dos criadores do cubismo.',
    ],
  },
  {
    id: 'van-gogh', category: 'geral', answer: 'Vincent van Gogh', aliases: ['van gogh', 'vincent'],
    clues: [
      'Nasceu na Holanda, em 1853.',
      'Vendeu quase nenhum quadro em vida e era sustentado pelo irmão, Theo.',
      'Cortou parte da própria orelha.',
      'Pintou uma série de quadros de girassóis.',
      'Autor de "A Noite Estrelada".',
    ],
  },
  {
    id: 'beethoven', category: 'geral', answer: 'Beethoven', aliases: ['ludwig van beethoven'],
    clues: [
      'Nasceu em Bonn, na Alemanha, em 1770.',
      'Viveu e trabalhou em Viena.',
      'Continuou compondo depois de ficar totalmente surdo.',
      'A sua Nona Sinfonia tem a "Ode à Alegria".',
      'Compôs "Für Elise" ("Para Elisa").',
    ],
  },
  {
    id: 'shakespeare', category: 'geral', answer: 'William Shakespeare', aliases: ['shakespeare'],
    clues: [
      'Nasceu em Stratford-upon-Avon, na Inglaterra, em 1564.',
      'Era ator e sócio de um teatro em Londres, o Globe.',
      'Escreveu "Macbeth" e "Otelo".',
      'Criou a frase "Ser ou não ser, eis a questão".',
      'Autor de "Romeu e Julieta".',
    ],
  },
  // ---------- História ----------
  {
    id: 'napoleao', category: 'historia', answer: 'Napoleão Bonaparte', aliases: ['napoleao', 'bonaparte'],
    clues: [
      'Nasceu na Córsega, em 1769.',
      'Fez carreira como general na Revolução Francesa.',
      'Coroou a si mesmo imperador em 1804.',
      'A sua invasão de Portugal fez a família real fugir para o Brasil.',
      'Derrotado em Waterloo, morreu exilado em Santa Helena.',
    ],
  },
  {
    id: 'cleopatra', category: 'historia', answer: 'Cleópatra', aliases: ['cleopatra'],
    clues: [
      'Descendia de um general de Alexandre, o Grande.',
      'Falava várias línguas e governou a partir de Alexandria.',
      'Teve um filho com Júlio César.',
      'Aliou-se a Marco Antônio contra Roma e perdeu.',
      'A última rainha do Egito antigo; a tradição diz que morreu picada por uma cobra.',
    ],
  },
  {
    id: 'julio-cesar', category: 'historia', answer: 'Júlio César', aliases: ['julio cesar', 'caio julio cesar'],
    clues: [
      'Conquistou a Gália, a atual França.',
      'Atravessou o rio Rubicão com o exército: "a sorte está lançada".',
      'Teve um romance com Cleópatra.',
      'Disse "vim, vi e venci".',
      'Ditador romano, assassinado no Senado em 44 a.C. ("Até tu, Brutus?").',
    ],
  },
  {
    id: 'colombo', category: 'historia', answer: 'Cristóvão Colombo', aliases: ['colombo', 'cristovao colombo'],
    clues: [
      'Nasceu em Gênova, por volta de 1451.',
      'Queria chegar às Índias navegando para o oeste.',
      'Foi financiado pelos reis da Espanha.',
      'Viajou com as caravelas Santa Maria, Pinta e Niña.',
      'Chegou à América em 1492.',
    ],
  },
  {
    id: 'cabral', category: 'historia', answer: 'Pedro Álvares Cabral', aliases: ['cabral', 'pedro alvares cabral'],
    clues: [
      'Nasceu em Belmonte, Portugal, por volta de 1467.',
      'Comandava uma frota a caminho das Índias.',
      'Pero Vaz de Caminha escreveu uma carta sobre a sua viagem.',
      'Desembarcou onde hoje fica Porto Seguro, na Bahia.',
      'Chegou ao Brasil em 22 de abril de 1500.',
    ],
  },
  {
    id: 'dom-pedro-i', category: 'historia', answer: 'Dom Pedro I', aliases: ['pedro i', 'dom pedro primeiro'],
    clues: [
      'Nasceu perto de Lisboa, em 1798, e veio criança para o Brasil.',
      'Também foi rei de Portugal, como Pedro IV.',
      'Disse que ficaria no Brasil, no "Dia do Fico".',
      'Abdicou em 1831 em favor do filho de 5 anos.',
      'Proclamou a Independência às margens do Ipiranga, em 1822.',
    ],
  },
  {
    id: 'joana-darc', category: 'historia', answer: 'Joana d\'Arc', aliases: ['joana darc', 'joana d arc'],
    clues: [
      'Era uma camponesa francesa, nascida por volta de 1412.',
      'Dizia ouvir vozes de santos.',
      'Liderou tropas na Guerra dos Cem Anos, contra a Inglaterra.',
      'Foi queimada em Rouen, em 1431, aos 19 anos.',
      'Virou santa e é chamada de Donzela de Orléans.',
    ],
  },
  {
    id: 'lincoln', category: 'historia', answer: 'Abraham Lincoln', aliases: ['lincoln'],
    clues: [
      'Nasceu numa cabana de madeira no Kentucky, em 1809.',
      'Foi advogado antes da política.',
      'Fez o discurso de Gettysburg.',
      'Presidente dos Estados Unidos na Guerra Civil, acabou com a escravidão.',
      'Foi assassinado num teatro, em 1865.',
    ],
  },
  {
    id: 'elizabeth-ii', category: 'historia', answer: 'Elizabeth II', aliases: ['rainha elizabeth', 'elizabeth', 'rainha elizabeth ii'],
    clues: [
      'Nasceu em Londres, em 1926.',
      'Serviu como mecânica de caminhões na Segunda Guerra.',
      'Foi coroada em 1953, numa cerimônia transmitida pela TV.',
      'Criava cães da raça corgi.',
      'Rainha do Reino Unido por 70 anos, morreu em 2022.',
    ],
  },
  {
    id: 'galileu', category: 'historia', answer: 'Galileu Galilei', aliases: ['galileu', 'galileo'],
    clues: [
      'Nasceu em Pisa, em 1564.',
      'Teria jogado objetos do alto de uma torre famosa da sua cidade.',
      'Descobriu as quatro maiores luas de Júpiter.',
      'Foi julgado pela Inquisição por dizer que a Terra gira em torno do Sol.',
      'Apontou o telescópio para o céu e é chamado de pai da ciência moderna.',
    ],
  },
  {
    id: 'anne-frank', category: 'historia', answer: 'Anne Frank', aliases: ['anne', 'anna frank'],
    clues: [
      'Nasceu em Frankfurt, na Alemanha, em 1929.',
      'A família se mudou para a Holanda.',
      'Passou dois anos escondida num anexo secreto em Amsterdã.',
      'Morreu num campo de concentração, em 1945.',
      'O diário que escreveu escondida virou um dos livros mais lidos do mundo.',
    ],
  },
  {
    id: 'lampiao', category: 'historia', answer: 'Lampião', aliases: ['lampiao', 'virgulino ferreira da silva', 'virgulino'],
    clues: [
      'Nasceu em Pernambuco, em 1898, com o nome de Virgulino.',
      'O apelido viria do clarão do tiro da sua arma.',
      'Andava com chapéu de couro em meia-lua.',
      'Foi morto com o seu bando em Angicos, Sergipe, em 1938.',
      'O "Rei do Cangaço", companheiro de Maria Bonita.',
    ],
  },
  {
    id: 'marco-polo', category: 'historia', answer: 'Marco Polo', aliases: ['polo'],
    clues: [
      'Nasceu em Veneza, em 1254.',
      'Viajou com o pai e o tio pela Rota da Seda.',
      'Contou as suas aventuras quando estava preso, em Gênova.',
      'Serviu ao imperador mongol Kublai Khan.',
      'O mercador veneziano que contou à Europa como era a China.',
    ],
  },
  {
    id: 'alexandre-o-grande', category: 'historia', answer: 'Alexandre, o Grande', aliases: ['alexandre o grande', 'alexandre', 'alexandre magno'],
    clues: [
      'Nasceu na Macedônia, em 356 a.C.',
      'Teve Aristóteles como professor.',
      'Fundou uma cidade no Egito com o seu nome, famosa pela biblioteca.',
      'Conquistou o Império Persa e chegou até a Índia.',
      'Rei da Macedônia, morreu aos 32 anos, na Babilônia.',
    ],
  },
  {
    id: 'anita-garibaldi', category: 'historia', answer: 'Anita Garibaldi', aliases: ['anita'],
    clues: [
      'Nasceu em Santa Catarina, em 1821.',
      'Lutou na Revolução Farroupilha.',
      'Casou com um revolucionário italiano.',
      'Também lutou pela unificação da Itália.',
      'É chamada de "Heroína dos Dois Mundos".',
    ],
  },
  // ---------- Anime ----------
  {
    id: 'goku', category: 'anime', answer: 'Goku', aliases: ['son goku', 'kakarotto', 'kakaroto'],
    clues: [
      'Foi mandado para a Terra ainda bebê, numa cápsula espacial.',
      'Tem um nome de nascimento que o rival vive repetindo.',
      'Viaja numa nuvem voadora e treinou com o Mestre Kame.',
      'Vira Super Saiyajin e solta o Kamehameha.',
      'Protagonista de Dragon Ball.',
    ],
  },
  {
    id: 'naruto', category: 'anime', answer: 'Naruto', aliases: ['naruto uzumaki', 'uzumaki'],
    clues: [
      'Cresceu sozinho e era rejeitado pelos moradores da sua vila.',
      'Ama lamen.',
      'Tem a raposa de nove caudas selada dentro de si.',
      'O seu maior sonho é virar Hokage da Vila da Folha.',
      'Ninja de cabelo loiro e roupa laranja, dá nome ao anime.',
    ],
  },
  {
    id: 'luffy', category: 'anime', answer: 'Luffy', aliases: ['monkey d luffy', 'monkey d. luffy'],
    clues: [
      'Tem uma cicatriz embaixo do olho esquerdo.',
      'O avô é um famoso vice-almirante da Marinha.',
      'Comeu uma fruta que deixou o corpo dele de borracha.',
      'Usa um chapéu de palha que ganhou de Shanks.',
      'Quer ser o Rei dos Piratas em One Piece.',
    ],
  },
  {
    id: 'pikachu', category: 'anime', answer: 'Pikachu', aliases: ['pika'],
    clues: [
      'Não gosta de ficar dentro da pokébola.',
      'Tem bochechas vermelhas que soltam faíscas.',
      'Evolui com uma pedra do trovão, mas o mais famoso nunca quis.',
      'É o companheiro inseparável de Ash.',
      'Pokémon elétrico e amarelo, mascote da franquia.',
    ],
  },
  {
    id: 'seiya', category: 'anime', answer: 'Seiya', aliases: ['seiya de pegaso', 'pegaso'],
    clues: [
      'Treinou na Grécia com a mestra Marin.',
      'Vive procurando a irmã desaparecida.',
      'O seu golpe é o Meteoro.',
      'Defende Saori, a reencarnação de Atena.',
      'O Cavaleiro de Bronze de Pégaso, em Os Cavaleiros do Zodíaco.',
    ],
  },
  {
    id: 'tanjiro', category: 'anime', answer: 'Tanjiro', aliases: ['tanjiro kamado', 'kamado'],
    clues: [
      'Vendia carvão nas montanhas.',
      'Tem um faro muito apurado.',
      'Usa brincos com desenho de cartas hanafuda.',
      'A irmã mais nova, Nezuko, virou demônio.',
      'Protagonista de Demon Slayer, usa a respiração da água.',
    ],
  },
  {
    id: 'sailor-moon', category: 'anime', answer: 'Sailor Moon', aliases: ['usagi', 'serena', 'usagi tsukino'],
    clues: [
      'É uma estudante desastrada que adora comer e dormir.',
      'Ganhou poderes de uma gata falante chamada Luna.',
      'Usa o cabelo preso em dois coques, as "odangos".',
      'Diz "Em nome da Lua, eu vou te castigar!".',
      'A guerreira mais famosa dos anos 90, do anime com o seu nome.',
    ],
  },
  {
    id: 'light-yagami', category: 'anime', answer: 'Light Yagami', aliases: ['light', 'kira', 'yagami'],
    clues: [
      'É o melhor aluno do Japão e filho de um policial.',
      'Encontrou um caderno que caiu do mundo dos shinigamis.',
      'Anda acompanhado pelo shinigami Ryuk.',
      'O mundo o chama de Kira.',
      'O dono do Death Note, rival de L.',
    ],
  },
  {
    id: 'eren', category: 'anime', answer: 'Eren Yeager', aliases: ['eren', 'eren jaeger', 'eren yeager'],
    clues: [
      'Viu a mãe ser devorada quando era criança.',
      'Entrou para a Tropa de Exploração.',
      'Cresceu atrás de muralhas gigantes.',
      'Descobriu que podia se transformar em titã.',
      'Protagonista de Attack on Titan (Shingeki no Kyojin).',
    ],
  },
  {
    id: 'doraemon', category: 'anime', answer: 'Doraemon', aliases: [],
    clues: [
      'Veio do século 22.',
      'Tem medo de ratos, porque um deles comeu as suas orelhas.',
      'Adora dorayaki, um doce japonês.',
      'Tira invenções de um bolso mágico na barriga.',
      'Gato-robô azul, ajuda o menino Nobita.',
    ],
  },
  {
    id: 'vegeta', category: 'anime', answer: 'Vegeta', aliases: ['principe vegeta'],
    clues: [
      'É o príncipe de um povo guerreiro cujo planeta foi destruído.',
      'Chegou à Terra como vilão, com Nappa.',
      'Casou com Bulma e é pai de Trunks.',
      'Vive tentando superar quem ele chama de Kakarotto.',
      'O rival eterno de Goku, em Dragon Ball.',
    ],
  },
  {
    id: 'sasuke', category: 'anime', answer: 'Sasuke', aliases: ['sasuke uchiha', 'uchiha'],
    clues: [
      'O irmão mais velho acabou com o clã inteiro.',
      'Tem o Sharingan nos olhos.',
      'Fugiu da vila atrás de poder e vingança.',
      'É o último Uchiha da sua geração.',
      'Melhor amigo e rival de Naruto.',
    ],
  },
  {
    id: 'zoro', category: 'anime', answer: 'Zoro', aliases: ['roronoa zoro', 'zorro'],
    clues: [
      'Tem cabelo verde e uma cicatriz sobre o olho esquerdo.',
      'Se perde com muita facilidade.',
      'Luta com três espadas, uma delas na boca.',
      'Quer ser o maior espadachim do mundo.',
      'O primeiro a entrar na tripulação de Luffy, em One Piece.',
    ],
  },
  {
    id: 'ash', category: 'anime', answer: 'Ash', aliases: ['ash ketchum', 'satoshi'],
    clues: [
      'Saiu de casa aos 10 anos, numa jornada.',
      'Nunca tira o boné.',
      'É de Pallet e foi aluno do Professor Carvalho.',
      'Sonha em ser um mestre Pokémon.',
      'O treinador do Pikachu.',
    ],
  },
  {
    id: 'kakashi', category: 'anime', answer: 'Kakashi', aliases: ['kakashi hatake', 'hatake'],
    clues: [
      'Usa uma máscara que cobre metade do rosto.',
      'Sempre chega atrasado, com uma desculpa esfarrapada.',
      'Tem um Sharingan só no olho esquerdo, presente de um amigo.',
      'Mais tarde virou o Sexto Hokage.',
      'Professor do Time 7: Naruto, Sasuke e Sakura.',
    ],
  },
  {
    id: 'l-death-note', category: 'anime', answer: 'L', aliases: ['l lawliet', 'ryuzaki', 'detetive l'],
    clues: [
      'Senta encolhido, com os joelhos no peito.',
      'Come doces o tempo todo.',
      'Esconde do mundo o rosto e o nome verdadeiro.',
      'É considerado o maior detetive do mundo.',
      'Rival de Light, em Death Note.',
    ],
  },
];
