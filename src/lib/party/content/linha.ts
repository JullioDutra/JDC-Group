import type { ContentCategory } from '../../game/types';

/**
 * Linha do Tempo: eventos com ano. A cada rodada saem 4 eventos de anos
 * diferentes e o grupo põe em ordem. Combinações aleatórias = repertório quase infinito.
 */
export interface TimelineEvent {
  id: string;
  category: ContentCategory;
  text: string;
  year: number;
}

const e = (id: string, category: ContentCategory, year: number, text: string): TimelineEvent => ({ id, category, year, text });

export const TIMELINE: TimelineEvent[] = [
  // História mundial
  e('t-roma', 'historia', 476, 'Queda do Império Romano do Ocidente'),
  e('t-gutenberg', 'historia', 1455, 'Gutenberg imprime a sua Bíblia'),
  e('t-colombo', 'historia', 1492, 'Colombo chega à América'),
  e('t-lutero', 'historia', 1517, 'Lutero publica as 95 teses'),
  e('t-shakespeare', 'historia', 1616, 'Morte de Shakespeare'),
  e('t-eua', 'historia', 1776, 'Independência dos Estados Unidos'),
  e('t-bastilha', 'historia', 1789, 'Queda da Bastilha (Revolução Francesa)'),
  e('t-waterloo', 'historia', 1815, 'Batalha de Waterloo'),
  e('t-darwin', 'historia', 1859, 'Darwin publica A Origem das Espécies'),
  e('t-lincoln', 'historia', 1865, 'Assassinato de Abraham Lincoln'),
  e('t-titanic', 'historia', 1912, 'Naufrágio do Titanic'),
  e('t-1guerra', 'historia', 1914, 'Começa a Primeira Guerra Mundial'),
  e('t-russa', 'historia', 1917, 'Revolução Russa'),
  e('t-crise29', 'historia', 1929, 'Quebra da Bolsa de Nova York'),
  e('t-2guerra-inicio', 'historia', 1939, 'Começa a Segunda Guerra Mundial'),
  e('t-hiroshima', 'historia', 1945, 'Bomba atômica em Hiroshima'),
  e('t-israel', 'historia', 1948, 'Criação do Estado de Israel'),
  e('t-china', 'historia', 1949, 'Revolução Chinesa (fundação da República Popular)'),
  e('t-cuba', 'historia', 1959, 'Revolução Cubana'),
  e('t-gagarin', 'historia', 1961, 'Gagarin, o primeiro homem no espaço'),
  e('t-jfk', 'historia', 1963, 'Assassinato de John Kennedy'),
  e('t-lua', 'historia', 1969, 'Chegada do homem à Lua'),
  e('t-muro', 'historia', 1989, 'Queda do Muro de Berlim'),
  e('t-urss', 'historia', 1991, 'Fim da União Soviética'),
  e('t-mandela', 'historia', 1994, 'Mandela eleito presidente da África do Sul'),
  e('t-11set', 'historia', 2001, 'Atentados de 11 de setembro'),
  e('t-euro', 'historia', 2002, 'Euro passa a circular como dinheiro'),
  e('t-obama', 'historia', 2008, 'Obama eleito presidente dos EUA'),
  e('t-pandemia', 'historia', 2020, 'OMS declara a pandemia de covid-19'),

  // História do Brasil
  e('t-cabral', 'historia', 1500, 'Cabral chega ao Brasil'),
  e('t-salvador', 'historia', 1549, 'Fundação de Salvador, primeira capital'),
  e('t-rio', 'historia', 1565, 'Fundação do Rio de Janeiro'),
  e('t-tiradentes', 'historia', 1792, 'Execução de Tiradentes'),
  e('t-corte', 'historia', 1808, 'Família real portuguesa chega ao Brasil'),
  e('t-independencia', 'historia', 1822, 'Independência do Brasil'),
  e('t-paraguai', 'historia', 1864, 'Começa a Guerra do Paraguai'),
  e('t-aurea', 'historia', 1888, 'Lei Áurea'),
  e('t-republica', 'historia', 1889, 'Proclamação da República'),
  e('t-canudos', 'historia', 1897, 'Fim da Guerra de Canudos'),
  e('t-semana22', 'historia', 1922, 'Semana de Arte Moderna'),
  e('t-vargas30', 'historia', 1930, 'Revolução de 1930 leva Vargas ao poder'),
  e('t-petrobras', 'historia', 1953, 'Criação da Petrobras'),
  e('t-vargas54', 'historia', 1954, 'Suicídio de Getúlio Vargas'),
  e('t-brasilia', 'historia', 1960, 'Inauguração de Brasília'),
  e('t-tancredo', 'historia', 1985, 'Morte de Tancredo Neves'),
  e('t-senna', 'historia', 1994, 'Morte de Ayrton Senna'),
  e('t-copa2014-sede', 'historia', 2014, 'Brasil sedia a Copa do Mundo'),
  e('t-rio2016', 'historia', 2016, 'Rio de Janeiro sedia as Olimpíadas'),

  // Política (só quando pedida)
  e('t-golpe64', 'politica', 1964, 'Golpe militar no Brasil'),
  e('t-ai5', 'politica', 1968, 'Decretado o AI-5'),
  e('t-anistia', 'politica', 1979, 'Lei da Anistia'),
  e('t-diretas', 'politica', 1984, 'Campanha das Diretas Já'),
  e('t-constituicao', 'politica', 1988, 'Promulgada a Constituição atual'),
  e('t-collor-eleito', 'politica', 1989, 'Collor vence a primeira eleição direta pós-ditadura'),
  e('t-impeachment-collor', 'politica', 1992, 'Impeachment de Collor'),
  e('t-plano-real', 'politica', 1994, 'Lançamento do Plano Real'),
  e('t-reeleicao', 'politica', 1997, 'Aprovada a emenda da reeleição'),
  e('t-lula-eleito', 'politica', 2002, 'Lula eleito presidente pela primeira vez'),
  e('t-mensalao', 'politica', 2005, 'Estoura o escândalo do mensalão'),
  e('t-lava-jato', 'politica', 2014, 'Começa a Operação Lava Jato'),
  e('t-dilma-impeachment', 'politica', 2016, 'Impeachment de Dilma Rousseff'),
  e('t-bolsonaro-eleito', 'politica', 2018, 'Bolsonaro eleito presidente'),
  e('t-8jan', 'politica', 2023, 'Ataques de 8 de janeiro em Brasília'),

  // Ciência, tecnologia e cultura
  e('t-telefone', 'geral', 1876, 'Graham Bell patenteia o telefone'),
  e('t-lampada', 'geral', 1879, 'Edison apresenta a lâmpada incandescente'),
  e('t-aviao', 'geral', 1906, 'Santos Dumont voa com o 14-Bis em Paris'),
  e('t-relatividade', 'geral', 1905, 'Einstein publica a relatividade restrita'),
  e('t-penicilina', 'geral', 1928, 'Fleming descobre a penicilina'),
  e('t-tv-br', 'geral', 1950, 'Primeira transmissão de TV no Brasil'),
  e('t-dna', 'geral', 1953, 'Descrita a estrutura do DNA'),
  e('t-sputnik', 'geral', 1957, 'Lançamento do Sputnik'),
  e('t-beatles', 'geral', 1962, 'Beatles lançam o primeiro single'),
  e('t-pc-ibm', 'geral', 1981, 'IBM lança o PC'),
  e('t-www', 'geral', 1991, 'Primeiro site da World Wide Web entra no ar'),
  e('t-dolly', 'geral', 1996, 'Nasce a ovelha Dolly, primeiro mamífero clonado'),
  e('t-google', 'geral', 1998, 'Fundação do Google'),
  e('t-wikipedia', 'geral', 2001, 'Lançamento da Wikipédia'),
  e('t-facebook', 'geral', 2004, 'Lançamento do Facebook'),
  e('t-youtube', 'geral', 2005, 'Lançamento do YouTube'),
  e('t-iphone', 'geral', 2007, 'Lançamento do primeiro iPhone'),
  e('t-whatsapp', 'geral', 2009, 'Lançamento do WhatsApp'),
  e('t-instagram', 'geral', 2010, 'Lançamento do Instagram'),
  e('t-chatgpt', 'geral', 2022, 'Lançamento do ChatGPT'),

  // Futebol
  e('t-copa30', 'futebol', 1930, 'Primeira Copa do Mundo, no Uruguai'),
  e('t-maracanazo', 'futebol', 1950, 'Maracanazo: Uruguai vence o Brasil no Maracanã'),
  e('t-copa58', 'futebol', 1958, 'Brasil ganha a primeira Copa, na Suécia'),
  e('t-santos-mundial', 'futebol', 1962, 'Santos de Pelé ganha o primeiro Mundial'),
  e('t-tri', 'futebol', 1970, 'Brasil tricampeão no México'),
  e('t-fla81', 'futebol', 1981, 'Flamengo de Zico campeão do mundo em Tóquio'),
  e('t-sarria', 'futebol', 1982, 'Tragédia do Sarriá: Itália elimina o Brasil'),
  e('t-mao-deus', 'futebol', 1986, 'Gol de mão de Maradona contra a Inglaterra'),
  e('t-tetra', 'futebol', 1994, 'Brasil tetracampeão nos EUA'),
  e('t-bosman', 'futebol', 1995, 'Lei Bosman muda o mercado europeu'),
  e('t-penta', 'futebol', 2002, 'Brasil pentacampeão na Coreia e no Japão'),
  e('t-7x1', 'futebol', 2014, 'Alemanha 7 x 1 Brasil'),
  e('t-chape', 'futebol', 2016, 'Acidente aéreo da Chapecoense'),
  e('t-var-copa', 'futebol', 2018, 'Primeira Copa com VAR'),
  e('t-messi-copa', 'futebol', 2022, 'Messi campeão do mundo no Catar'),
  // Ciência, tecnologia e cultura (lote 2)
  e('t-cinema', 'geral', 1895, 'Irmãos Lumière fazem a primeira sessão pública de cinema'),
  e('t-mona-roubo', 'geral', 1911, 'A Mona Lisa é roubada do Louvre'),
  e('t-radio-br', 'geral', 1922, 'Primeira transmissão de rádio no Brasil'),
  e('t-tv-cor', 'geral', 1972, 'Primeira transmissão em cores da TV brasileira'),
  e('t-walkman', 'geral', 1979, 'A Sony lança o Walkman'),
  e('t-cd', 'geral', 1982, 'O CD chega às lojas'),
  e('t-hubble', 'geral', 1990, 'Lançamento do telescópio Hubble'),
  e('t-genoma', 'geral', 2003, 'Concluído o Projeto Genoma Humano'),
  e('t-plutao', 'geral', 2006, 'Plutão deixa de ser considerado planeta'),
  e('t-bitcoin', 'geral', 2009, 'Criação do Bitcoin'),
  e('t-netflix-br', 'geral', 2011, 'A Netflix chega ao Brasil'),
  e('t-pix', 'geral', 2020, 'Lançamento do Pix'),
  // Recentes (pesquisa de 18/11/2026)
  e('t-neymar-psg', 'futebol', 2017, 'Neymar vai do Barcelona para o PSG por 222 milhões de euros'),
  e('t-fla-2019', 'futebol', 2019, 'Flamengo ganha a Libertadores e o Brasileirão no mesmo ano'),
  e('t-cr7-arabia', 'futebol', 2023, 'Cristiano Ronaldo vai para o Al-Nassr'),
  e('t-psg-ucl', 'futebol', 2025, 'PSG ganha a Champions pela primeira vez'),
  e('t-espanha-bi', 'futebol', 2026, 'Espanha bicampeã do mundo, com gol de Ferran Torres na prorrogação'),
  e('t-kane-bola', 'futebol', 2026, 'Harry Kane ganha a Bola de Ouro'),
  e('t-ainda-estou-oscar', 'geral', 2025, '"Ainda Estou Aqui" ganha o Oscar de filme internacional'),
  e('t-papa-leao', 'historia', 2025, 'Eleição do papa Leão XIV'),
  e('t-cop30', 'geral', 2025, 'Belém sedia a COP30'),
  e('t-lula-2026', 'politica', 2026, 'Lula é eleito presidente pela quarta vez'),
  // Mais 2026 (pesquisa de 19/11/2026)
  e('t-psg-intercontinental', 'futebol', 2025, 'PSG ganha a Copa Intercontinental contra o Flamengo, nos pênaltis'),
  e('t-braathen', 'geral', 2026, 'Lucas Pinheiro Braathen dá ao Brasil o 1º ouro em Olimpíadas de Inverno'),
  e('t-knicks', 'geral', 2026, 'New York Knicks ganham a NBA depois de 53 anos'),
  e('t-oscar-batalha', 'geral', 2026, '"Uma Batalha Após a Outra" ganha o Oscar de melhor filme'),
  e('t-viradouro', 'geral', 2026, 'Viradouro ganha o Carnaval do Rio por 0,1 ponto'),
  e('t-seahawks', 'geral', 2026, 'Seattle Seahawks ganham o Super Bowl LX'),
];

export function getEvent(id: string): TimelineEvent | undefined {
  return TIMELINE.find((x) => x.id === id);
}
