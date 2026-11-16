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
];

export function getConexoes(id: string): ConexoesPuzzle | undefined {
  return CONEXOES.find((p) => p.id === id);
}
