import type { ContentCategory } from '../../game/types';

/**
 * Sobrevivente: categorias FECHADAS e completas. Como errar tira vida, a lista
 * precisa ter todos os itens válidos (com grafias e apelidos comuns).
 * Nível 1 abre a partida; o 3 fica para o fim.
 */
export interface SurvivorList {
  id: string;
  category: ContentCategory;
  level: 1 | 2 | 3;
  title: string;
  /** Cada item: nome exibido e apelidos aceitos. */
  items: Array<[string, ...string[]]>;
}

const one = (names: string[]): Array<[string]> => names.map((n) => [n]);

export const SURVIVOR_LISTS: SurvivorList[] = [
  // ---------- Futebol ----------
  {
    id: 's-campeoes-copa', category: 'futebol', level: 1, title: 'seleções campeãs da Copa do Mundo (até 2026)',
    items: [['Brasil'], ['Alemanha', 'alemanha ocidental'], ['Itália', 'italia'], ['Argentina'], ['França', 'franca'], ['Uruguai'], ['Inglaterra'], ['Espanha']],
  },
  {
    id: 's-sedes-copa', category: 'futebol', level: 2, title: 'países que já sediaram (ou cossediaram) uma Copa do Mundo, até 2026',
    items: [
      ['Uruguai'], ['Itália', 'italia'], ['França', 'franca'], ['Brasil'], ['Suíça', 'suica'], ['Suécia', 'suecia'], ['Chile'], ['Inglaterra'],
      ['México', 'mexico'], ['Alemanha', 'alemanha ocidental'], ['Argentina'], ['Espanha'], ['Estados Unidos', 'eua', 'usa'],
      ['Coreia do Sul', 'coreia'], ['Japão', 'japao'], ['África do Sul', 'africa do sul'], ['Rússia', 'russia'], ['Catar', 'qatar'], ['Canadá', 'canada'],
    ],
  },
  {
    id: 's-copa-america', category: 'futebol', level: 2, title: 'seleções campeãs da Copa América (até 2024)',
    items: [['Argentina'], ['Uruguai'], ['Brasil'], ['Paraguai'], ['Chile'], ['Peru'], ['Colômbia', 'colombia'], ['Bolívia', 'bolivia']],
  },
  {
    id: 's-eurocopa', category: 'futebol', level: 2, title: 'seleções campeãs da Eurocopa (até 2024)',
    items: [
      ['União Soviética', 'uniao sovietica', 'urss'], ['Espanha'], ['Itália', 'italia'], ['Alemanha', 'alemanha ocidental'],
      ['Tchecoslováquia', 'tchecoslovaquia'], ['França', 'franca'], ['Países Baixos', 'holanda', 'paises baixos'], ['Dinamarca'], ['Grécia', 'grecia'], ['Portugal'],
    ],
  },
  {
    id: 's-libertadores', category: 'futebol', level: 3, title: 'clubes campeões da Libertadores (até 2025)',
    items: [
      ['Independiente'], ['Boca Juniors', 'boca'], ['River Plate', 'river'], ['Estudiantes'], ['Racing'], ['Argentinos Juniors'], ['Vélez Sarsfield', 'velez', 'velez sarsfield'],
      ['San Lorenzo'], ['Peñarol', 'penarol'], ['Nacional', 'nacional de montevideu', 'nacional uru'], ['Olimpia'], ['Atlético Nacional', 'atletico nacional'],
      ['Once Caldas'], ['Colo-Colo', 'colo colo'], ['LDU', 'ldu quito', 'liga de quito'], ['Santos'], ['Cruzeiro'], ['Flamengo'], ['Grêmio', 'gremio'],
      ['São Paulo', 'sao paulo'], ['Vasco', 'vasco da gama'], ['Palmeiras'], ['Internacional', 'inter'], ['Corinthians'], ['Atlético-MG', 'atletico mineiro', 'atletico mg', 'galo'],
      ['Fluminense'], ['Botafogo'],
    ],
  },
  {
    id: 's-champions', category: 'futebol', level: 3, title: 'clubes campeões da Copa/Liga dos Campeões da Europa (até 2026)',
    items: [
      ['Real Madrid'], ['Milan', 'ac milan'], ['Bayern de Munique', 'bayern'], ['Liverpool'], ['Barcelona', 'barca'], ['Ajax'], ['Inter de Milão', 'inter de milao', 'internazionale'],
      ['Manchester United', 'man united'], ['Juventus'], ['Benfica'], ['Chelsea'], ['Nottingham Forest'], ['Porto'], ['Celtic'], ['Hamburgo', 'hamburg', 'hamburger'],
      ['Steaua Bucareste', 'steaua'], ['Olympique de Marselha', 'marselha', 'olympique de marseille'], ['Feyenoord'], ['Aston Villa'], ['PSV', 'psv eindhoven'],
      ['Estrela Vermelha', 'estrela vermelha de belgrado', 'red star'], ['Borussia Dortmund', 'dortmund'], ['Manchester City', 'city', 'man city'], ['PSG', 'paris saint germain', 'paris saint-germain'],
    ],
  },
  {
    id: 's-premier', category: 'futebol', level: 2, title: 'clubes campeões da Premier League (desde 1992-93, até 2024-25)',
    items: [['Manchester United', 'man united'], ['Blackburn Rovers', 'blackburn'], ['Arsenal'], ['Chelsea'], ['Manchester City', 'city', 'man city'], ['Leicester City', 'leicester'], ['Liverpool']],
  },
  {
    id: 's-clubes-ibra', category: 'futebol', level: 3, title: 'clubes em que Ibrahimović jogou como profissional',
    items: [['Malmö', 'malmo'], ['Ajax'], ['Juventus'], ['Inter de Milão', 'inter de milao', 'inter'], ['Barcelona', 'barca'], ['Milan', 'ac milan'], ['PSG', 'paris saint germain'], ['Manchester United', 'man united'], ['LA Galaxy', 'galaxy']],
  },
  {
    id: 's-clubes-ronaldo', category: 'futebol', level: 2, title: 'clubes em que Ronaldo Fenômeno jogou como profissional',
    items: [['Cruzeiro'], ['PSV', 'psv eindhoven'], ['Barcelona', 'barca'], ['Inter de Milão', 'inter de milao', 'inter'], ['Real Madrid'], ['Milan', 'ac milan'], ['Corinthians']],
  },
  {
    id: 's-clubes-daniel-alves', category: 'futebol', level: 3, title: 'clubes em que Daniel Alves jogou como profissional',
    items: [['Bahia'], ['Sevilla', 'sevilha'], ['Barcelona', 'barca'], ['Juventus'], ['PSG', 'paris saint germain'], ['São Paulo', 'sao paulo'], ['Pumas', 'unam', 'pumas unam']],
  },
  {
    id: 's-bola-ouro-br', category: 'futebol', level: 1, title: 'brasileiros que ganharam a Bola de Ouro',
    items: [['Ronaldo', 'ronaldo fenomeno'], ['Rivaldo'], ['Ronaldinho', 'ronaldinho gaucho'], ['Kaká', 'kaka']],
  },

  // ---------- Geral ----------
  {
    id: 's-planetas', category: 'geral', level: 1, title: 'planetas do Sistema Solar',
    items: [['Mercúrio', 'mercurio'], ['Vênus', 'venus'], ['Terra'], ['Marte'], ['Júpiter', 'jupiter'], ['Saturno'], ['Urano'], ['Netuno']],
  },
  {
    id: 's-signos', category: 'geral', level: 1, title: 'signos do zodíaco',
    items: one(['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes']).map(
      ([n]) => [n, n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()] as [string, string],
    ),
  },
  {
    id: 's-maravilhas', category: 'geral', level: 2, title: 'as 7 novas maravilhas do mundo (eleição de 2007)',
    items: [
      ['Cristo Redentor'], ['Machu Picchu'], ['Chichén Itzá', 'chichen itza'], ['Coliseu', 'coliseu de roma'], ['Taj Mahal'],
      ['Grande Muralha da China', 'muralha da china', 'grande muralha'], ['Petra'],
    ],
  },
  {
    id: 's-arco-iris', category: 'geral', level: 1, title: 'cores do arco-íris',
    items: [['Vermelho'], ['Laranja', 'alaranjado'], ['Amarelo'], ['Verde'], ['Azul'], ['Anil', 'indigo', 'índigo'], ['Violeta', 'roxo']],
  },
  {
    id: 's-oceanos', category: 'geral', level: 1, title: 'oceanos da Terra',
    items: [['Pacífico', 'pacifico'], ['Atlântico', 'atlantico'], ['Índico', 'indico'], ['Ártico', 'artico', 'glacial artico'], ['Antártico', 'antartico', 'austral', 'glacial antartico']],
  },
  {
    id: 's-america-sul', category: 'geral', level: 1, title: 'países da América do Sul',
    items: [
      ['Brasil'], ['Argentina'], ['Uruguai'], ['Paraguai'], ['Chile'], ['Bolívia', 'bolivia'], ['Peru'], ['Equador'], ['Colômbia', 'colombia'],
      ['Venezuela'], ['Guiana'], ['Suriname'],
    ],
  },
  {
    id: 's-fronteira-br', category: 'geral', level: 2, title: 'países que fazem fronteira com o Brasil',
    items: [
      ['Argentina'], ['Uruguai'], ['Paraguai'], ['Bolívia', 'bolivia'], ['Peru'], ['Colômbia', 'colombia'], ['Venezuela'], ['Guiana'], ['Suriname'],
      ['França', 'franca', 'guiana francesa'],
    ],
  },
  {
    id: 's-capitais-sul', category: 'geral', level: 2, title: 'capitais da América do Sul',
    items: [
      ['Buenos Aires'], ['Brasília', 'brasilia'], ['Montevidéu', 'montevideu'], ['Assunção', 'assuncao'], ['Santiago'], ['La Paz'], ['Sucre'],
      ['Lima'], ['Quito'], ['Bogotá', 'bogota'], ['Caracas'], ['Georgetown'], ['Paramaribo'],
    ],
  },
  {
    id: 's-estados-br', category: 'geral', level: 1, title: 'estados do Brasil (e o DF)',
    items: [
      ['Acre'], ['Alagoas'], ['Amapá', 'amapa'], ['Amazonas'], ['Bahia'], ['Ceará', 'ceara'], ['Distrito Federal', 'df'], ['Espírito Santo', 'espirito santo'],
      ['Goiás', 'goias'], ['Maranhão', 'maranhao'], ['Mato Grosso'], ['Mato Grosso do Sul'], ['Minas Gerais', 'minas'], ['Pará', 'para'], ['Paraíba', 'paraiba'],
      ['Paraná', 'parana'], ['Pernambuco'], ['Piauí', 'piaui'], ['Rio de Janeiro'], ['Rio Grande do Norte'], ['Rio Grande do Sul'], ['Rondônia', 'rondonia'],
      ['Roraima'], ['Santa Catarina'], ['São Paulo', 'sao paulo'], ['Sergipe'], ['Tocantins'],
    ],
  },
  {
    id: 's-capitais-br', category: 'geral', level: 2, title: 'capitais dos estados brasileiros (e Brasília)',
    items: [
      ['Rio Branco'], ['Maceió', 'maceio'], ['Macapá', 'macapa'], ['Manaus'], ['Salvador'], ['Fortaleza'], ['Brasília', 'brasilia'], ['Vitória', 'vitoria'],
      ['Goiânia', 'goiania'], ['São Luís', 'sao luis'], ['Cuiabá', 'cuiaba'], ['Campo Grande'], ['Belo Horizonte', 'bh'], ['Belém', 'belem'],
      ['João Pessoa', 'joao pessoa'], ['Curitiba'], ['Recife'], ['Teresina'], ['Rio de Janeiro'], ['Natal'], ['Porto Alegre'], ['Porto Velho'],
      ['Boa Vista'], ['Florianópolis', 'florianopolis', 'floripa'], ['São Paulo', 'sao paulo'], ['Aracaju'], ['Palmas'],
    ],
  },
  {
    id: 's-nordeste', category: 'geral', level: 1, title: 'estados do Nordeste',
    items: [['Maranhão', 'maranhao'], ['Piauí', 'piaui'], ['Ceará', 'ceara'], ['Rio Grande do Norte'], ['Paraíba', 'paraiba'], ['Pernambuco'], ['Alagoas'], ['Sergipe'], ['Bahia']],
  },
  {
    id: 's-olimpiadas', category: 'geral', level: 3, title: 'cidades que sediaram Olimpíadas de Verão (até 2024)',
    items: [
      ['Atenas'], ['Paris'], ['St. Louis', 'saint louis', 'st louis'], ['Londres'], ['Estocolmo'], ['Antuérpia', 'antuerpia'], ['Amsterdã', 'amsterda', 'amsterdam'],
      ['Los Angeles'], ['Berlim'], ['Helsinque'], ['Melbourne'], ['Roma'], ['Tóquio', 'toquio'], ['Cidade do México', 'cidade do mexico'], ['Munique'],
      ['Montreal'], ['Moscou'], ['Seul'], ['Barcelona'], ['Atlanta'], ['Sydney'], ['Pequim'], ['Rio de Janeiro', 'rio'],
    ],
  },
  {
    id: 's-elementos-1letra', category: 'geral', level: 3, title: 'elementos químicos cujo símbolo tem uma letra só',
    items: [
      ['Hidrogênio', 'hidrogenio', 'h'], ['Boro', 'b'], ['Carbono', 'c'], ['Nitrogênio', 'nitrogenio', 'n'], ['Oxigênio', 'oxigenio', 'o'], ['Flúor', 'fluor', 'f'],
      ['Fósforo', 'fosforo', 'p'], ['Enxofre', 's'], ['Potássio', 'potassio', 'k'], ['Vanádio', 'vanadio', 'v'], ['Ítrio', 'itrio', 'y'], ['Iodo', 'i'],
      ['Tungstênio', 'tungstenio', 'w'], ['Urânio', 'uranio', 'u'],
    ],
  },
  {
    id: 's-g7', category: 'geral', level: 2, title: 'países do G7',
    items: [['Estados Unidos', 'eua'], ['Canadá', 'canada'], ['Reino Unido', 'inglaterra'], ['França', 'franca'], ['Alemanha'], ['Itália', 'italia'], ['Japão', 'japao']],
  },
  {
    id: 's-continentes', category: 'geral', level: 1, title: 'continentes (vale o modelo de 6 ou de 7)',
    items: [['América', 'america'], ['América do Norte', 'america do norte'], ['América do Sul', 'america do sul'], ['Europa'], ['Ásia', 'asia'], ['África', 'africa'], ['Oceania'], ['Antártida', 'antartida', 'antartica']],
  },

  {
    id: 's-lusofonia', category: 'geral', level: 2, title: 'países que têm o português como língua oficial',
    items: [
      ['Brasil'], ['Portugal'], ['Angola'], ['Moçambique', 'mocambique'], ['Cabo Verde'], ['Guiné-Bissau', 'guine bissau'],
      ['São Tomé e Príncipe', 'sao tome e principe', 'sao tome'], ['Timor-Leste', 'timor leste', 'timor'], ['Guiné Equatorial', 'guine equatorial'],
    ],
  },
  {
    id: 's-pecados', category: 'geral', level: 1, title: 'os sete pecados capitais',
    items: [['Gula'], ['Avareza', 'ganancia'], ['Luxúria', 'luxuria'], ['Ira', 'raiva'], ['Inveja'], ['Preguiça', 'preguica'], ['Soberba', 'orgulho', 'vaidade']],
  },
  {
    id: 's-reino-unido', category: 'geral', level: 1, title: 'nações que formam o Reino Unido',
    items: [['Inglaterra'], ['Escócia', 'escocia'], ['País de Gales', 'pais de gales', 'gales'], ['Irlanda do Norte']],
  },

  // ---------- Política (só quando pedida) ----------
  {
    id: 's-conselho-seguranca', category: 'politica', level: 2, title: 'membros permanentes do Conselho de Segurança da ONU',
    items: [['Estados Unidos', 'eua'], ['Rússia', 'russia'], ['China'], ['Reino Unido', 'inglaterra'], ['França', 'franca']],
  },
  {
    id: 's-presidentes-nova-republica', category: 'politica', level: 2, title: 'presidentes do Brasil desde 1985 (que tomaram posse)',
    items: [
      ['José Sarney', 'sarney', 'jose sarney'], ['Fernando Collor', 'collor'], ['Itamar Franco', 'itamar'], ['Fernando Henrique Cardoso', 'fhc', 'fernando henrique'],
      ['Lula', 'luiz inacio lula da silva'], ['Dilma Rousseff', 'dilma'], ['Michel Temer', 'temer'], ['Jair Bolsonaro', 'bolsonaro'],
    ],
  },
  {
    id: 's-presidentes-ditadura', category: 'politica', level: 3, title: 'presidentes do Brasil na ditadura militar, 1964–1985 (interinos e a junta de 1969 valem)',
    items: [
      ['Castelo Branco', 'castello branco'], ['Costa e Silva'], ['Médici', 'medici', 'emilio medici'], ['Geisel', 'ernesto geisel'], ['Figueiredo', 'joao figueiredo'],
      ['Ranieri Mazzilli', 'mazzilli'], ['Junta Militar', 'junta', 'junta militar de 1969'],
    ],
  },
  // ---------- Rodada 4 (19/11/2026) ----------
  {
    id: 's-campeoes-brasileiros', category: 'futebol', level: 2, title: 'clubes campeões brasileiros da Série A (até 2025, com Taça Brasil e Robertão)',
    items: [['Palmeiras'], ['Santos'], ['Flamengo'], ['Corinthians'], ['São Paulo', 'sao paulo'], ['Cruzeiro'], ['Vasco'], ['Fluminense'], ['Internacional', 'inter'], ['Atlético-MG', 'atletico mineiro', 'atletico mg', 'galo'], ['Grêmio', 'gremio'], ['Botafogo'], ['Bahia'], ['Sport'], ['Guarani'], ['Coritiba'], ['Athletico-PR', 'athletico', 'athletico paranaense', 'atletico paranaense', 'atletico pr']],
  },
  {
    id: 's-campeoes-copa-do-brasil', category: 'futebol', level: 2, title: 'clubes campeões da Copa do Brasil (até 2025)',
    items: [['Grêmio', 'gremio'], ['Cruzeiro'], ['Palmeiras'], ['Corinthians'], ['Flamengo'], ['Internacional', 'inter'], ['Criciúma', 'criciuma'], ['Juventude'], ['Sport'], ['Santo André', 'santo andre'], ['Paulista'], ['Fluminense'], ['Vasco'], ['Santos'], ['Atlético-MG', 'atletico mineiro', 'atletico mg', 'galo'], ['Athletico-PR', 'athletico', 'athletico paranaense', 'atletico paranaense', 'atletico pr'], ['São Paulo', 'sao paulo']],
  },
  {
    id: 's-bola-de-ouro-2000', category: 'futebol', level: 2, title: 'jogadores que ganharam a Bola de Ouro de 2000 a 2026',
    items: [['Figo', 'luis figo'], ['Owen', 'michael owen'], ['Ronaldo', 'ronaldo fenomeno'], ['Nedved', 'pavel nedved'], ['Shevchenko'], ['Ronaldinho'], ['Cannavaro', 'fabio cannavaro'], ['Kaká', 'kaka'], ['Cristiano Ronaldo', 'cr7'], ['Messi', 'lionel messi'], ['Modrić', 'modric', 'luka modric'], ['Benzema', 'karim benzema'], ['Rodri'], ['Dembélé', 'dembele', 'ousmane dembele'], ['Harry Kane', 'kane']],
  },
  {
    id: 's-penta-2002', category: 'futebol', level: 3, title: 'convocados do Brasil pentacampeão da Copa de 2002',
    items: [['Marcos'], ['Dida'], ['Rogério Ceni'], ['Cafu'], ['Belletti'], ['Lúcio'], ['Roque Júnior'], ['Edmílson'], ['Anderson Polga'], ['Roberto Carlos'], ['Júnior'], ['Gilberto Silva'], ['Kléberson'], ['Vampeta'], ['Ricardinho'], ['Juninho Paulista'], ['Kaká'], ['Ronaldinho'], ['Rivaldo'], ['Denílson'], ['Edílson'], ['Luizão'], ['Ronaldo']],
  },
  {
    id: 's-tetra-1994', category: 'futebol', level: 3, title: 'convocados do Brasil tetracampeão da Copa de 1994',
    items: [['Taffarel'], ['Zetti'], ['Gilmar Rinaldi'], ['Jorginho'], ['Cafu'], ['Aldair'], ['Márcio Santos'], ['Ricardo Rocha'], ['Ronaldão'], ['Branco'], ['Leonardo'], ['Mauro Silva'], ['Dunga'], ['Mazinho'], ['Raí'], ['Zinho'], ['Paulo Sérgio'], ['Viola'], ['Bebeto'], ['Romário'], ['Ronaldo'], ['Müller']],
  },
  {
    id: 's-estados-eua', category: 'geral', level: 3, title: 'estados dos Estados Unidos',
    items: [['Alabama'], ['Alasca', 'alaska'], ['Arizona'], ['Arkansas'], ['Califórnia', 'california'], ['Carolina do Norte', 'north carolina'], ['Carolina do Sul', 'south carolina'], ['Colorado'], ['Connecticut'], ['Dakota do Norte', 'north dakota'], ['Dakota do Sul', 'south dakota'], ['Delaware'], ['Flórida', 'florida'], ['Geórgia', 'georgia'], ['Havaí', 'havai', 'hawaii'], ['Idaho'], ['Illinois'], ['Indiana'], ['Iowa'], ['Kansas'], ['Kentucky'], ['Luisiana', 'louisiana'], ['Maine'], ['Maryland'], ['Massachusetts'], ['Michigan'], ['Minnesota'], ['Mississippi'], ['Missouri'], ['Montana'], ['Nebraska'], ['Nevada'], ['Nova Hampshire', 'new hampshire'], ['Nova Jersey', 'new jersey'], ['Nova York', 'new york'], ['Novo México', 'novo mexico', 'new mexico'], ['Ohio'], ['Oklahoma'], ['Oregon'], ['Pensilvânia', 'pensilvania', 'pennsylvania'], ['Rhode Island'], ['Tennessee'], ['Texas'], ['Utah'], ['Vermont'], ['Virgínia', 'virginia'], ['Virgínia Ocidental', 'virginia ocidental', 'west virginia'], ['Washington'], ['Wisconsin'], ['Wyoming']],
  },
  {
    id: 's-horoscopo-chines', category: 'geral', level: 1, title: 'animais do horóscopo chinês',
    items: [['Rato'], ['Boi', 'bufalo'], ['Tigre'], ['Coelho', 'lebre'], ['Dragão', 'dragao'], ['Serpente', 'cobra'], ['Cavalo'], ['Cabra', 'carneiro', 'ovelha', 'bode'], ['Macaco'], ['Galo'], ['Cão', 'cao', 'cachorro'], ['Porco', 'javali']],
  },
  {
    id: 's-planetas-anoes', category: 'geral', level: 3, title: 'planetas anões reconhecidos pela União Astronômica Internacional',
    items: [['Plutão', 'plutao'], ['Ceres'], ['Éris', 'eris'], ['Haumea'], ['Makemake']],
  },
];

/** Listas com menos itens que isso ficam fora do sorteio. */
const TOO_SHORT = 4;

export function survivorPool(category: ContentCategory | null): SurvivorList[] {
  return SURVIVOR_LISTS.filter(
    (l) => l.items.length >= TOO_SHORT && (category ? l.category === category : l.category !== 'politica'),
  );
}

export function getSurvivorList(id: string): SurvivorList | undefined {
  return SURVIVOR_LISTS.find((l) => l.id === id);
}
