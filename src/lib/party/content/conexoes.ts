import type { ContentCategory } from '../../game/types';

/**
 * Conexões: 16 nomes em 4 grupos de 4, do mais fácil ao mais difícil.
 * Curadoria: nenhum nome pode caber em dois grupos (conferido um a um).
 */
export interface ConexoesPuzzle {
  id: string;
  category: ContentCategory;
  groups: Array<{ label: string; items: [string, string, string, string] }>;
}

export const CONEXOES: ConexoesPuzzle[] = [
  // ---------- Futebol ----------
  {
    id: 'cx-selecao',
    category: 'futebol',
    groups: [
      { label: 'Goleiros do Brasil campeões do mundo', items: ['Gilmar', 'Félix', 'Taffarel', 'Marcos'] },
      { label: 'Técnicos do Brasil campeões do mundo', items: ['Feola', 'Zagallo', 'Parreira', 'Felipão'] },
      { label: 'Camisas 10 do Brasil em Copas', items: ['Pelé', 'Zico', 'Rivaldo', 'Neymar'] },
      { label: 'Brasileiros artilheiros de uma Copa', items: ['Leônidas', 'Ademir', 'Vavá', 'Ronaldo'] },
    ],
  },
  {
    id: 'cx-brasileiros-europa',
    category: 'futebol',
    groups: [
      { label: 'Brasileiros que jogaram no Real Madrid', items: ['Marcelo', 'Vinicius Jr', 'Casemiro', 'Rodrygo'] },
      { label: 'Brasileiros que jogaram no PSG', items: ['Raí', 'Marquinhos', 'Lucas Moura', 'Neymar'] },
      { label: 'Brasileiros que jogaram no Milan', items: ['Cafu', 'Dida', 'Serginho', 'Pato'] },
      { label: 'Brasileiros que jogaram na Inter de Milão', items: ['Adriano', 'Júlio César', 'Maicon', 'Lúcio'] },
    ],
  },
  {
    id: 'cx-copa-objetos',
    category: 'futebol',
    groups: [
      { label: 'Mascotes de clubes brasileiros', items: ['Galo', 'Raposa', 'Porco', 'Peixe'] },
      { label: 'Mascotes de Copa do Mundo', items: ['Zakumi', 'Fuleco', 'Zabivaka', 'Goleo'] },
      { label: 'Bolas de Copa do Mundo', items: ['Jabulani', 'Brazuca', 'Telstar', 'Al Rihla'] },
      { label: 'Nomes oficiais de estádios brasileiros', items: ['Mário Filho', 'Magalhães Pinto', 'Cícero Pompeu de Toledo', 'José Pinheiro Borda'] },
    ],
  },
  {
    id: 'cx-apelidos',
    category: 'futebol',
    groups: [
      { label: 'Apelidos de seleções', items: ['Azzurra', 'Albiceleste', 'Celeste', 'Laranja Mecânica'] },
      { label: 'Craques com apelido no diminutivo', items: ['Ronaldinho', 'Juninho', 'Zinho', 'Robinho'] },
      { label: 'Técnicos portugueses que dirigiram clubes brasileiros', items: ['Jorge Jesus', 'Abel Ferreira', 'Artur Jorge', 'Vítor Pereira'] },
      { label: 'Goleiros que faziam gols', items: ['Rogério Ceni', 'Chilavert', 'Higuita', 'Jorge Campos'] },
    ],
  },
  {
    id: 'cx-europa',
    category: 'futebol',
    groups: [
      { label: 'Bola de Ouro entre 2000 e 2004', items: ['Figo', 'Owen', 'Nedved', 'Shevchenko'] },
      { label: 'Campeões do mundo pela Itália em 2006', items: ['Materazzi', 'Pirlo', 'Buffon', 'Totti'] },
      { label: 'Campeões do mundo pela França em 2018', items: ['Griezmann', 'Mbappé', 'Giroud', 'Dembélé'] },
      { label: 'Holandeses que jogaram no Milan', items: ['Gullit', 'Van Basten', 'Rijkaard', 'Seedorf'] },
    ],
  },
  {
    id: 'cx-clubes',
    category: 'futebol',
    groups: [
      { label: 'Clubes de Londres', items: ['Arsenal', 'Chelsea', 'Tottenham', 'West Ham'] },
      { label: 'Clubes portugueses', items: ['Benfica', 'Porto', 'Sporting', 'Braga'] },
      { label: 'Clubes holandeses', items: ['Ajax', 'PSV', 'Feyenoord', 'AZ'] },
      { label: 'Clubes argentinos', items: ['Boca Juniors', 'River Plate', 'Racing', 'Independiente'] },
    ],
  },

  // ---------- Conhecimentos gerais ----------
  {
    id: 'cx-ceu',
    category: 'geral',
    groups: [
      { label: 'Planetas', items: ['Marte', 'Vênus', 'Júpiter', 'Saturno'] },
      { label: 'Deuses gregos', items: ['Zeus', 'Hera', 'Atena', 'Apolo'] },
      { label: 'Metais', items: ['Ouro', 'Prata', 'Ferro', 'Cobre'] },
      { label: 'Notas musicais', items: ['Ré', 'Mi', 'Fá', 'Lá'] },
    ],
  },
  {
    id: 'cx-brasil',
    category: 'geral',
    groups: [
      { label: 'Biomas brasileiros', items: ['Cerrado', 'Caatinga', 'Pampa', 'Pantanal'] },
      { label: 'Rios brasileiros', items: ['Tietê', 'São Francisco', 'Xingu', 'Tocantins'] },
      { label: 'Escritores brasileiros', items: ['Drummond', 'Clarice Lispector', 'Graciliano Ramos', 'Guimarães Rosa'] },
      { label: 'Pratos típicos brasileiros', items: ['Acarajé', 'Tacacá', 'Feijoada', 'Moqueca'] },
    ],
  },
  {
    id: 'cx-ciencia',
    category: 'geral',
    groups: [
      { label: 'Unidades de base do Sistema Internacional', items: ['Kelvin', 'Ampere', 'Mol', 'Candela'] },
      { label: 'Ossos do corpo humano', items: ['Fêmur', 'Tíbia', 'Úmero', 'Clavícula'] },
      { label: 'Gases nobres', items: ['Hélio', 'Neônio', 'Argônio', 'Xenônio'] },
      { label: 'Cientistas com Prêmio Nobel', items: ['Einstein', 'Marie Curie', 'Niels Bohr', 'Alexander Fleming'] },
    ],
  },
  {
    id: 'cx-pop',
    category: 'geral',
    groups: [
      { label: 'Beatles', items: ['John', 'Paul', 'George', 'Ringo'] },
      { label: 'Os Trapalhões', items: ['Didi', 'Dedé', 'Mussum', 'Zacarias'] },
      { label: 'Personagens do Sítio do Picapau Amarelo', items: ['Emília', 'Narizinho', 'Pedrinho', 'Visconde'] },
      { label: 'Tartarugas Ninja', items: ['Leonardo', 'Michelangelo', 'Donatello', 'Rafael'] },
    ],
  },
  {
    id: 'cx-historia-br',
    category: 'historia',
    groups: [
      { label: 'Revoltas do Período Regencial', items: ['Cabanagem', 'Sabinada', 'Balaiada', 'Malês'] },
      { label: 'Guerras e conflitos do Brasil', items: ['Canudos', 'Contestado', 'Cisplatina', 'Paraguai'] },
      { label: 'Tratados', items: ['Tordesilhas', 'Madri', 'Petrópolis', 'Versalhes'] },
      { label: 'Presidentes da República Velha', items: ['Deodoro', 'Floriano', 'Campos Sales', 'Washington Luís'] },
    ],
  },

  // ---------- Política (só quando pedida) ----------
  {
    id: 'cx-politica',
    category: 'politica',
    groups: [
      { label: 'Siglas de partidos', items: ['PT', 'PL', 'MDB', 'PSDB'] },
      { label: 'Presidentes que saíram por renúncia ou impeachment', items: ['Collor', 'Dilma', 'Jânio', 'Deodoro'] },
      { label: 'Planos econômicos', items: ['Cruzado', 'Verão', 'Bresser', 'Real'] },
      { label: 'Palácios e residências oficiais em Brasília', items: ['Planalto', 'Alvorada', 'Jaburu', 'Granja do Torto'] },
    ],
  },

  // ---------- Animes ----------
  {
    id: 'cx-animes',
    category: 'anime',
    groups: [
      { label: 'Naruto', items: ['Sasuke', 'Sakura', 'Kakashi', 'Itachi'] },
      { label: 'One Piece', items: ['Zoro', 'Nami', 'Sanji', 'Usopp'] },
      { label: 'Dragon Ball', items: ['Vegeta', 'Gohan', 'Piccolo', 'Kuririn'] },
      { label: 'Cavaleiros do Zodíaco', items: ['Seiya', 'Shiryu', 'Hyoga', 'Shun'] },
    ],
  },
  // ---------- Conhecimentos gerais (lote 2) ----------
  {
    id: 'cx-mundo',
    category: 'geral',
    groups: [
      { label: 'Capitais europeias', items: ['Lisboa', 'Viena', 'Praga', 'Oslo'] },
      { label: 'Moedas', items: ['Iene', 'Rublo', 'Rúpia', 'Peso'] },
      { label: 'Rios', items: ['Nilo', 'Danúbio', 'Reno', 'Volga'] },
      { label: 'Línguas oficiais da ONU', items: ['Árabe', 'Chinês', 'Russo', 'Francês'] },
    ],
  },
  {
    id: 'cx-musica',
    category: 'geral',
    groups: [
      { label: 'Instrumentos de sopro', items: ['Flauta', 'Trompete', 'Saxofone', 'Clarinete'] },
      { label: 'Ritmos brasileiros', items: ['Samba', 'Forró', 'Frevo', 'Baião'] },
      { label: 'Nomes da Tropicália', items: ['Caetano', 'Gilberto Gil', 'Gal Costa', 'Tom Zé'] },
      { label: 'Bandas do rock brasileiro dos anos 80', items: ['Legião Urbana', 'Titãs', 'Paralamas', 'Barão Vermelho'] },
    ],
  },
  {
    id: 'cx-corpo',
    category: 'geral',
    groups: [
      { label: 'Órgãos', items: ['Fígado', 'Baço', 'Pâncreas', 'Rim'] },
      { label: 'Sentidos', items: ['Tato', 'Olfato', 'Paladar', 'Audição'] },
      { label: 'Doenças causadas por vírus', items: ['Gripe', 'Sarampo', 'Dengue', 'Catapora'] },
      { label: 'Músculos', items: ['Bíceps', 'Tríceps', 'Glúteo', 'Deltoide'] },
    ],
  },
  {
    id: 'cx-brasil-mapa',
    category: 'geral',
    groups: [
      { label: 'Capitais do Nordeste', items: ['Natal', 'Recife', 'Maceió', 'Teresina'] },
      { label: 'Estados da Região Norte', items: ['Acre', 'Pará', 'Amapá', 'Roraima'] },
      { label: 'Ilhas brasileiras', items: ['Fernando de Noronha', 'Ilhabela', 'Marajó', 'Ilha Grande'] },
      { label: 'Cachoeiras e quedas brasileiras', items: ['Iguaçu', 'Caracol', 'Itiquira', 'Véu da Noiva'] },
    ],
  },
  // ---------- Rodada 4 (19/11/2026) ----------
  {
    id: 'cx-copa-2026',
    category: 'futebol',
    groups: [
      { label: 'Semifinalistas da Copa de 2026', items: ['Espanha', 'Argentina', 'Inglaterra', 'França'] },
      { label: 'Adversários do Brasil na Copa de 2026', items: ['Marrocos', 'Haiti', 'Escócia', 'Japão'] },
      { label: 'Cidades-sede da Copa de 2026 nos EUA', items: ['Miami', 'Houston', 'Atlanta', 'Seattle'] },
      { label: 'Estreantes em Copas em 2026', items: ['Cabo Verde', 'Curaçao', 'Jordânia', 'Uzbequistão'] },
    ],
  },
  {
    id: 'cx-tecnicos',
    category: 'futebol',
    groups: [
      { label: 'Técnicos da seleção entre 2006 e 2024', items: ['Dunga', 'Mano Menezes', 'Tite', 'Dorival'] },
      { label: 'Campeões da Champions como técnico', items: ['Guardiola', 'Mourinho', 'Klopp', 'Zidane'] },
      { label: 'Campeões da Copa do Mundo como técnico', items: ['Scaloni', 'Deschamps', 'Löw', 'De la Fuente'] },
      { label: 'Técnicos argentinos em clubes brasileiros', items: ['Sampaoli', 'Coudet', 'Vojvoda', 'Zubeldía'] },
    ],
  },
  {
    id: 'cx-apelidos-clubes',
    category: 'futebol',
    groups: [
      { label: 'Apelidos do Palmeiras', items: ['Verdão', 'Porco', 'Palestra', 'Academia'] },
      { label: 'Apelidos do Flamengo', items: ['Mengão', 'Urubu', 'Mais Querido', 'Mengo'] },
      { label: 'Apelidos do Corinthians', items: ['Timão', 'Coringão', 'Todo-Poderoso', 'Bando de Loucos'] },
      { label: 'Apelidos do Vasco', items: ['Gigante da Colina', 'Cruzmaltino', 'Bacalhau', 'Vascão'] },
    ],
  },
  {
    id: 'cx-cores-clubes',
    category: 'futebol',
    groups: [
      { label: 'Clubes alvinegros', items: ['Corinthians', 'Botafogo', 'Santos', 'Atlético-MG'] },
      { label: 'Clubes rubro-negros', items: ['Flamengo', 'Sport', 'Vitória', 'Athletico'] },
      { label: 'Clubes tricolores', items: ['São Paulo', 'Fluminense', 'Grêmio', 'Bahia'] },
      { label: 'Clubes alviverdes', items: ['Palmeiras', 'Coritiba', 'Goiás', 'Chapecoense'] },
    ],
  },
  {
    id: 'cx-estadios-europa',
    category: 'futebol',
    groups: [
      { label: 'Estádios de clubes ingleses', items: ['Anfield', 'Old Trafford', 'Stamford Bridge', 'Emirates'] },
      { label: 'Estádios de clubes espanhóis', items: ['Camp Nou', 'Bernabéu', 'Mestalla', 'Metropolitano'] },
      { label: 'Estádios de clubes alemães', items: ['Allianz Arena', 'Signal Iduna Park', 'Veltins-Arena', 'BayArena'] },
      { label: 'Estádios de clubes italianos', items: ['San Siro', 'Diego Armando Maradona', 'Artemio Franchi', 'Olímpico de Roma'] },
    ],
  },
  {
    id: 'cx-linguas',
    category: 'geral',
    groups: [
      { label: 'Países que falam inglês', items: ['Jamaica', 'Nigéria', 'Nova Zelândia', 'Gana'] },
      { label: 'Países que falam espanhol', items: ['Bolívia', 'Cuba', 'Guatemala', 'Equador'] },
      { label: 'Países que falam português', items: ['Angola', 'Moçambique', 'Cabo Verde', 'Timor-Leste'] },
      { label: 'Países que falam francês', items: ['Senegal', 'Haiti', 'Mônaco', 'Costa do Marfim'] },
    ],
  },
  {
    id: 'cx-tv',
    category: 'geral',
    groups: [
      { label: 'Novelas da Globo', items: ['Avenida Brasil', 'Vale Tudo', 'O Clone', 'Senhora do Destino'] },
      { label: 'Vilãs de novela', items: ['Odete Roitman', 'Carminha', 'Nazaré Tedesco', 'Flora'] },
      { label: 'Apresentadores de programa de auditório', items: ['Faustão', 'Silvio Santos', 'Gugu', 'Luciano Huck'] },
      { label: 'Campeões do BBB', items: ['Juliette', 'Davi', 'Jean Wyllys', 'Arthur Aguiar'] },
    ],
  },
  {
    id: 'cx-musica-br',
    category: 'geral',
    groups: [
      { label: 'Duplas sertanejas', items: ['Chitãozinho & Xororó', 'Jorge & Mateus', 'Henrique & Juliano', 'Maiara & Maraisa'] },
      { label: 'Cantores de pagode', items: ['Thiaguinho', 'Péricles', 'Belo', 'Ferrugem'] },
      { label: 'Cantoras de axé', items: ['Ivete Sangalo', 'Claudia Leitte', 'Daniela Mercury', 'Margareth Menezes'] },
      { label: 'Cantoras de funk', items: ['Anitta', 'Valesca Popozuda', 'Tati Quebra Barraco', 'MC Carol'] },
    ],
  },
  {
    id: 'cx-disney',
    category: 'geral',
    groups: [
      { label: 'Personagens de Toy Story', items: ['Woody', 'Buzz', 'Jessie', 'Rex'] },
      { label: 'Princesas da Disney', items: ['Ariel', 'Bela', 'Jasmine', 'Mulan'] },
      { label: 'Vilões da Disney', items: ['Úrsula', 'Scar', 'Jafar', 'Malévola'] },
      { label: 'Anões da Branca de Neve', items: ['Mestre', 'Dunga', 'Atchim', 'Soneca'] },
    ],
  },
  {
    id: 'cx-herois',
    category: 'geral',
    groups: [
      { label: 'Vingadores', items: ['Homem de Ferro', 'Thor', 'Hulk', 'Capitão América'] },
      { label: 'Liga da Justiça', items: ['Batman', 'Superman', 'Mulher-Maravilha', 'Aquaman'] },
      { label: 'Vilões do Batman', items: ['Coringa', 'Pinguim', 'Charada', 'Bane'] },
      { label: 'X-Men', items: ['Wolverine', 'Ciclope', 'Tempestade', 'Jean Grey'] },
    ],
  },
  {
    id: 'cx-cozinha',
    category: 'geral',
    groups: [
      { label: 'Doces brasileiros', items: ['Brigadeiro', 'Beijinho', 'Quindim', 'Paçoca'] },
      { label: 'Queijos', items: ['Brie', 'Gorgonzola', 'Parmesão', 'Coalho'] },
      { label: 'Tipos de massa', items: ['Penne', 'Fusilli', 'Talharim', 'Farfalle'] },
      { label: 'Temperos', items: ['Orégano', 'Cominho', 'Páprica', 'Açafrão'] },
    ],
  },
  {
    id: 'cx-esportes',
    category: 'geral',
    groups: [
      { label: 'Termos do futebol', items: ['Impedimento', 'Escanteio', 'Pênalti', 'Tiro de meta'] },
      { label: 'Termos do basquete', items: ['Enterrada', 'Rebote', 'Garrafão', 'Toco'] },
      { label: 'Termos do vôlei', items: ['Manchete', 'Levantamento', 'Cortada', 'Líbero'] },
      { label: 'Termos do tênis', items: ['Break point', 'Smash', 'Voleio', 'Tie-break'] },
    ],
  },
];

export function getConexoes(id: string): ConexoesPuzzle | undefined {
  return CONEXOES.find((p) => p.id === id);
}
