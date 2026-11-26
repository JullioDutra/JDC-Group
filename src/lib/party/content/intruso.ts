/**
 * "Intruso": 5 nomes, 4 têm algo em comum e 1 não. Curadoria: o motivo tem
 * que ser verificável e estável (com data de corte quando puder mudar).
 */
import type { ContentCategory } from '../../game/types';
import { INTRUSO_GERAIS } from './intruso-gerais';
import { INTRUSO_R11 } from './rodada11';
import { INTRUSO_R14 } from './rodada14';

export interface IntrusoSet {
  id: string;
  /** Sem categoria = futebol. */
  category?: ContentCategory;
  /** Os 4 que pertencem ao grupo. */
  members: string[];
  intruder: string;
  /** Justificativa mostrada no fim: o que os 4 têm em comum. */
  reason: string;
}

export const INTRUSO_SETS: IntrusoSet[] = [
  {
    id: 'penta-2002',
    members: ['Cafu', 'Roberto Carlos', 'Ronaldinho', 'Rivaldo'],
    intruder: 'Juninho Pernambucano',
    reason: 'Os outros quatro foram campeões da Copa de 2002. Juninho Pernambucano não estava no grupo do penta.',
  },
  {
    id: 'bola-de-ouro-br',
    members: ['Kaká', 'Ronaldinho', 'Rivaldo', 'Ronaldo'],
    intruder: 'Neymar',
    reason: 'Os outros quatro ganharam a Bola de Ouro (Ronaldo em 1997 e 2002, Rivaldo em 1999, Ronaldinho em 2005, Kaká em 2007). Neymar nunca ganhou.',
  },
  {
    id: 'real-madrid-br',
    members: ['Ronaldo', 'Kaká', 'Roberto Carlos', 'Marcelo'],
    intruder: 'Ronaldinho',
    reason: 'Os outros quatro jogaram no Real Madrid. Ronaldinho brilhou no rival, o Barcelona.',
  },
  {
    id: 'barcelona-br',
    members: ['Ronaldinho', 'Rivaldo', 'Romário', 'Ronaldo'],
    intruder: 'Kaká',
    reason: 'Os outros quatro jogaram no Barcelona. Kaká jogou no Milan e no Real Madrid, mas nunca no Barça.',
  },
  {
    id: 'goleiros-campeoes',
    members: ['Gilmar', 'Félix', 'Taffarel', 'Marcos'],
    intruder: 'Júlio César',
    reason: 'Os outros quatro foram goleiros titulares do Brasil em títulos de Copa (1958/62, 1970, 1994 e 2002). Júlio César nunca foi campeão do mundo.',
  },
  {
    id: 'flamengo',
    members: ['Zico', 'Romário', 'Adriano', 'Ronaldinho'],
    intruder: 'Pelé',
    reason: 'Os outros quatro jogaram no Flamengo. Pelé só jogou no Santos e no New York Cosmos.',
  },
  {
    id: 'santos',
    members: ['Pelé', 'Neymar', 'Robinho', 'Diego'],
    intruder: 'Kaká',
    reason: 'Os outros quatro foram revelados pelo Santos. Kaká foi revelado pelo São Paulo.',
  },
  {
    id: 'corinthians',
    members: ['Sócrates', 'Ronaldo', 'Tevez', 'Rivellino'],
    intruder: 'Romário',
    reason: 'Os outros quatro jogaram no Corinthians. Romário nunca vestiu a camisa do Timão.',
  },
  {
    id: 'tecnicos-campeoes',
    members: ['Feola', 'Zagallo', 'Parreira', 'Felipão'],
    intruder: 'Tite',
    reason: 'Os outros quatro foram técnicos do Brasil campeão do mundo (1958, 1970, 1994 e 2002). Tite não ganhou Copa.',
  },
  {
    id: 'bola-de-ouro-mundo',
    members: ['Messi', 'Cristiano Ronaldo', 'Modrić', 'Benzema'],
    intruder: 'Salah',
    reason: 'Os outros quatro ganharam a Bola de Ouro (Modrić em 2018, Benzema em 2022). Salah não tinha ganhado até 2025.',
  },
  {
    id: 'ingleses',
    members: ['Arsenal', 'Chelsea', 'Liverpool', 'Everton'],
    intruder: 'Celtic',
    reason: 'Os outros quatro são clubes ingleses. O Celtic é escocês, de Glasgow.',
  },
  {
    id: 'estadios-sp',
    members: ['Morumbi', 'Allianz Parque', 'Neo Química Arena', 'Pacaembu'],
    intruder: 'Vila Belmiro',
    reason: 'Os outros quatro ficam na cidade de São Paulo. A Vila Belmiro fica em Santos.',
  },
  {
    id: 'africanas',
    members: ['Nigéria', 'Camarões', 'Gana', 'Senegal'],
    intruder: 'Jamaica',
    reason: 'Os outros quatro são seleções africanas. A Jamaica fica no Caribe.',
  },
  {
    id: 'laterais-esquerdos',
    members: ['Roberto Carlos', 'Marcelo', 'Filipe Luís', 'Júnior'],
    intruder: 'Cafu',
    reason: 'Os outros quatro foram laterais-esquerdos. Cafu era lateral-direito.',
  },
  {
    id: 'campeoes-copa-2022',
    members: ['Brasil', 'Alemanha', 'Uruguai', 'Inglaterra'],
    intruder: 'Holanda',
    reason: 'Os outros quatro já tinham sido campeões do mundo até 2022. A Holanda perdeu três finais (1974, 1978 e 2010).',
  },
  {
    id: 'champions-2025',
    members: ['Real Madrid', 'Barcelona', 'Bayern', 'Liverpool'],
    intruder: 'Atlético de Madrid',
    reason: 'Os outros quatro já tinham ganhado a Champions até 2025. O Atlético de Madrid perdeu três finais (1974, 2014 e 2016).',
  },
  // ---------- Futebol: mais difíceis ----------
  {
    id: 'bicampeoes-copa-2026',
    members: ['Uruguai', 'França', 'Espanha', 'Argentina'],
    intruder: 'Inglaterra',
    reason: 'Os outros quatro têm pelo menos dois títulos mundiais (até 2026; a Espanha foi bi em 2026). A Inglaterra tem um, de 1966.',
  },
  {
    id: 'juventus',
    members: ['Zidane', 'Pirlo', 'Buffon', 'Del Piero'],
    intruder: 'Maldini',
    reason: 'Os outros quatro jogaram na Juventus. Maldini jogou a carreira inteira no Milan.',
  },
  {
    id: 'clube-unico',
    members: ['Maldini', 'Totti', 'Puyol', 'Giggs'],
    intruder: 'Gerrard',
    reason: 'Os outros quatro jogaram a carreira inteira em um só clube. Gerrard saiu do Liverpool e foi para o LA Galaxy.',
  },
  {
    id: 'bola-de-ouro-ingleses',
    members: ['Stanley Matthews', 'Bobby Charlton', 'Kevin Keegan', 'Michael Owen'],
    intruder: 'Wayne Rooney',
    reason: 'Os outros quatro são ingleses que ganharam a Bola de Ouro. Rooney nunca ganhou (Harry Kane foi o quinto inglês, em 2026).',
  },
  {
    id: 'chuteira-de-ouro-copa',
    members: ['Ronaldo', 'Klose', 'James Rodríguez', 'Harry Kane'],
    intruder: 'Neymar',
    reason: 'Os outros quatro foram artilheiros de uma Copa (2002, 2006, 2014 e 2018). Neymar nunca foi.',
  },
  {
    id: 'tecnicos-selecao',
    members: ['Tite', 'Felipão', 'Dunga', 'Mano Menezes'],
    intruder: 'Abel Ferreira',
    reason: 'Os outros quatro foram técnicos da Seleção Brasileira. Abel Ferreira nunca treinou a Seleção.',
  },
  {
    id: 'estadios-copa-2014',
    members: ['Maracanã', 'Mineirão', 'Arena Corinthians', 'Arena da Amazônia'],
    intruder: 'Morumbi',
    reason: 'Os outros quatro foram sedes da Copa de 2014. O Morumbi ficou de fora.',
  },
  {
    id: 'alemaes',
    members: ['Bayern', 'Borussia Dortmund', 'Schalke 04', 'Werder Bremen'],
    intruder: 'Ajax',
    reason: 'Os outros quatro são clubes alemães. O Ajax é holandês.',
  },
  {
    id: 'argentina-2022',
    members: ['Messi', 'Di María', 'Enzo Fernández', 'Julián Álvarez'],
    intruder: 'Higuaín',
    reason: 'Os outros quatro foram campeões do mundo com a Argentina em 2022. Higuaín já tinha deixado a seleção.',
  },
  {
    id: 'psg-br',
    members: ['Ronaldinho', 'Neymar', 'Thiago Silva', 'Marquinhos'],
    intruder: 'Kaká',
    reason: 'Os outros quatro jogaram no PSG. Kaká nunca jogou lá.',
  },
  {
    id: 'revelados-gremio',
    members: ['Ronaldinho', 'Arthur', 'Everton Cebolinha', 'Lucas Leiva'],
    intruder: 'Alisson',
    reason: 'Os outros quatro foram revelados pelo Grêmio. Alisson foi revelado pelo rival, o Internacional.',
  },
  {
    id: 'tetra-libertadores-2025',
    members: ['Independiente', 'Boca Juniors', 'Peñarol', 'Flamengo'],
    intruder: 'São Paulo',
    reason: 'Os outros quatro têm 4 ou mais Libertadores (até 2025). O São Paulo tem 3.',
  },
  // ---------- Política (só quando pedido: "abrir intruso política") ----------
  {
    id: 'g7', category: 'politica',
    members: ['Japão', 'Alemanha', 'Canadá', 'Itália'],
    intruder: 'Rússia',
    reason: 'Os outros quatro fazem parte do G7. A Rússia foi suspensa do antigo G8 em 2014, após a anexação da Crimeia.',
  },
  {
    id: 'conselho-seguranca', category: 'politica',
    members: ['Estados Unidos', 'China', 'Rússia', 'França'],
    intruder: 'Alemanha',
    reason: 'Os outros quatro são membros permanentes do Conselho de Segurança da ONU (com o Reino Unido). A Alemanha não tem assento permanente.',
  },
  {
    id: 'brics-2011', category: 'politica',
    members: ['Brasil', 'Índia', 'China', 'África do Sul'],
    intruder: 'Argentina',
    reason: 'Os outros quatro estavam no BRICS original (com a Rússia, desde 2011). A Argentina foi convidada em 2023 e recusou.',
  },
  {
    id: 'mandato-interrompido', category: 'politica',
    members: ['Deodoro da Fonseca', 'Jânio Quadros', 'Fernando Collor', 'Dilma Rousseff'],
    intruder: 'Juscelino Kubitschek',
    reason: 'Os outros quatro não terminaram o mandato (renúncia ou impeachment). JK governou até o fim, de 1956 a 1961.',
  },
  {
    id: 'mulheres-no-poder', category: 'politica',
    members: ['Dilma Rousseff', 'Cristina Kirchner', 'Michelle Bachelet', 'Angela Merkel'],
    intruder: 'Hillary Clinton',
    reason: 'As outras quatro chefiaram o governo de seus países. Hillary Clinton perdeu a eleição presidencial de 2016.',
  },
  {
    id: 'presidentes-militares', category: 'politica',
    members: ['Castello Branco', 'Costa e Silva', 'Médici', 'Geisel'],
    intruder: 'José Sarney',
    reason: 'Os outros quatro foram presidentes da ditadura militar. Sarney foi o primeiro civil a assumir depois dela, em 1985.',
  },

  {
    id: 'euro', category: 'politica',
    members: ['Portugal', 'Espanha', 'Itália', 'Alemanha'],
    intruder: 'Reino Unido',
    reason: 'Os outros quatro usam o euro. O Reino Unido manteve a libra e saiu da União Europeia em 2020.',
  },
  {
    id: 'armas-nucleares', category: 'politica',
    members: ['Índia', 'Paquistão', 'Israel', 'Coreia do Norte'],
    intruder: 'Irã',
    reason: 'Os outros quatro têm armas nucleares segundo o SIPRI (2025). O Irã não tem arsenal nuclear estimado.',
  },
  // ---------- Geral ----------
  {
    id: 'planetas-gasosos', category: 'geral',
    members: ['Júpiter', 'Saturno', 'Urano', 'Netuno'],
    intruder: 'Marte',
    reason: 'Os outros quatro são planetas gigantes gasosos/gelados. Marte é rochoso.',
  },
  {
    id: 'fronteira-brasil', category: 'geral',
    members: ['Argentina', 'Uruguai', 'Paraguai', 'Bolívia'],
    intruder: 'Chile',
    reason: 'Os outros quatro fazem fronteira com o Brasil. Na América do Sul, só Chile e Equador não fazem.',
  },
  {
    id: 'capitais-nordeste', category: 'geral',
    members: ['Recife', 'Salvador', 'Fortaleza', 'São Luís'],
    intruder: 'Belém',
    reason: 'As outras quatro são capitais do Nordeste. Belém é capital do Pará, no Norte.',
  },
  {
    id: 'linguas-onu', category: 'geral',
    members: ['Inglês', 'Francês', 'Espanhol', 'Árabe'],
    intruder: 'Português',
    reason: 'As outras quatro são línguas oficiais da ONU (com russo e chinês). O português não é.',
  },
  {
    id: 'sete-maravilhas', category: 'geral',
    members: ['Cristo Redentor', 'Machu Picchu', 'Coliseu', 'Taj Mahal'],
    intruder: 'Torre Eiffel',
    reason: 'As outras quatro estão entre as Sete Maravilhas do Mundo Moderno (eleitas em 2007). A Torre Eiffel não está.',
  },
  // ---------- Conhecimentos gerais (lote 2) ----------
  {
    id: 'capitais-nao-maiores', category: 'geral',
    members: ['Brasília', 'Camberra', 'Ottawa', 'Washington'],
    intruder: 'Lima',
    reason: 'As outras quatro são capitais que NÃO são a maior cidade do país. Lima é a maior cidade do Peru.',
  },
  {
    id: 'mamiferos-marinhos', category: 'geral',
    members: ['Baleia', 'Golfinho', 'Foca', 'Peixe-boi'],
    intruder: 'Tubarão',
    reason: 'Os outros quatro são mamíferos. O tubarão é um peixe.',
  },
  {
    id: 'gases-nobres', category: 'geral',
    members: ['Hélio', 'Neônio', 'Argônio', 'Criptônio'],
    intruder: 'Hidrogênio',
    reason: 'Os outros quatro são gases nobres. O hidrogênio não é.',
  },
  {
    id: 'sem-mar', category: 'geral',
    members: ['Bolívia', 'Paraguai', 'Suíça', 'Áustria'],
    intruder: 'Uruguai',
    reason: 'Os outros quatro não têm saída para o mar. O Uruguai tem litoral no Atlântico.',
  },
  {
    id: 'machado-obras', category: 'geral',
    members: ['Dom Casmurro', 'Quincas Borba', 'Memórias Póstumas de Brás Cubas', 'O Alienista'],
    intruder: 'O Cortiço',
    reason: 'Os outros quatro são de Machado de Assis. O Cortiço é de Aluísio Azevedo.',
  },
  {
    id: 'impressionistas', category: 'geral',
    members: ['Monet', 'Renoir', 'Degas', 'Pissarro'],
    intruder: 'Picasso',
    reason: 'Os outros quatro são pintores impressionistas. Picasso é do cubismo.',
  },
  {
    id: 'cordas', category: 'geral',
    members: ['Violino', 'Viola', 'Violoncelo', 'Contrabaixo'],
    intruder: 'Clarinete',
    reason: 'Os outros quatro são instrumentos de corda. O clarinete é de sopro.',
  },
  {
    id: 'romanicas', category: 'geral',
    members: ['Português', 'Espanhol', 'Italiano', 'Romeno'],
    intruder: 'Alemão',
    reason: 'As outras quatro são línguas latinas (românicas). O alemão é germânico.',
  },
  {
    id: 'estados-norte', category: 'geral',
    members: ['Acre', 'Amapá', 'Roraima', 'Tocantins'],
    intruder: 'Maranhão',
    reason: 'Os outros quatro ficam na Região Norte. O Maranhão é do Nordeste.',
  },
  {
    id: 'nordicos', category: 'geral',
    members: ['Noruega', 'Suécia', 'Dinamarca', 'Finlândia'],
    intruder: 'Holanda',
    reason: 'Os outros quatro são países nórdicos (com a Islândia). A Holanda não é.',
  },
  {
    id: 'niemeyer', category: 'geral',
    members: ['Catedral de Brasília', 'Congresso Nacional', 'MAC de Niterói', 'Igreja da Pampulha'],
    intruder: 'MASP',
    reason: 'As outras quatro são obras de Oscar Niemeyer. O MASP é de Lina Bo Bardi.',
  },
  {
    id: 'bossa-nova', category: 'geral',
    members: ['Tom Jobim', 'João Gilberto', 'Vinicius de Moraes', 'Nara Leão'],
    intruder: 'Raul Seixas',
    reason: 'Os outros quatro são nomes da bossa nova. Raul Seixas é do rock.',
  },
  {
    id: 'sedes-olimpicas', category: 'geral',
    members: ['Atenas', 'Sydney', 'Pequim', 'Barcelona'],
    intruder: 'Madri',
    reason: 'As outras quatro já sediaram Olimpíadas de Verão. Madri tentou várias vezes e nunca conseguiu.',
  },
  {
    id: 'citricas', category: 'geral',
    members: ['Laranja', 'Limão', 'Tangerina', 'Toranja'],
    intruder: 'Maçã',
    reason: 'As outras quatro são frutas cítricas. A maçã não é.',
  },
  {
    id: 'lipossoluveis', category: 'geral',
    members: ['Vitamina A', 'Vitamina D', 'Vitamina E', 'Vitamina K'],
    intruder: 'Vitamina C',
    reason: 'As outras quatro são vitaminas lipossolúveis (dissolvem em gordura). A vitamina C dissolve em água.',
  },
  {
    id: 'ex-colonias-pt', category: 'historia',
    members: ['Angola', 'Moçambique', 'Cabo Verde', 'Timor-Leste'],
    intruder: 'Senegal',
    reason: 'Os outros quatro foram colônias portuguesas. O Senegal foi colônia francesa.',
  },
  {
    id: 'mercosul', category: 'politica',
    members: ['Brasil', 'Argentina', 'Uruguai', 'Paraguai'],
    intruder: 'Chile',
    reason: 'Os outros quatro fundaram o Mercosul em 1991. O Chile é só associado.',
  },
  // 2026 (pesquisa de 18/11/2026)
  {
    id: 'campeoes-ligas-2026',
    members: ['Arsenal', 'Barcelona', 'Inter de Milão', 'Bayern'],
    intruder: 'Real Madrid',
    reason: 'Os outros quatro foram campeões nacionais em 2025/26 (Inglaterra, Espanha, Itália e Alemanha). O Real Madrid não ganhou o Espanhol.',
  },
  {
    id: 'artilheiros-copa-2026',
    members: ['Mbappé', 'Messi', 'Haaland', 'Bellingham'],
    intruder: 'Vinícius Júnior',
    reason: 'Os outros quatro fizeram 7 ou mais gols na Copa de 2026 (Mbappé 10, Messi 8, Haaland e Bellingham 7). Vinícius ficou abaixo disso.',
  },
  {
    id: 'campeoes-europa-2026',
    members: ['PSG', 'Aston Villa', 'Crystal Palace', 'Chelsea'],
    intruder: 'Arsenal',
    reason: 'PSG (Champions 2026), Aston Villa (Liga Europa 2026), Crystal Palace (Conference 2026) e Chelsea (Mundial de 2025) ganharam torneios internacionais. O Arsenal perdeu a final da Champions.',
  },
  // ---------- Rodada 4 (19/11/2026) ----------
  {
    id: 'semis-copa-2026',
    members: ['Espanha', 'Argentina', 'Inglaterra', 'França'],
    intruder: 'Brasil',
    reason: 'Os outros quatro foram semifinalistas da Copa de 2026. O Brasil caiu nas oitavas, para a Noruega.',
  },
  {
    id: 'estreantes-2026',
    members: ['Cabo Verde', 'Curaçao', 'Jordânia', 'Uzbequistão'],
    intruder: 'Haiti',
    reason: 'Os outros quatro estrearam em Copas em 2026. O Haiti já tinha jogado a Copa de 1974.',
  },
  {
    id: 'nordeste-campeoes',
    members: ['Bahia', 'Vitória', 'Ceará', 'Fortaleza'],
    intruder: 'Náutico',
    reason: 'Os outros quatro já ganharam a Copa do Nordeste (em 2026 o Vitória chegou ao 5º título, igualando o Bahia). O Náutico nunca ganhou.',
  },
  {
    id: 'supercopa-campeoes',
    members: ['Corinthians', 'Flamengo', 'Palmeiras', 'São Paulo'],
    intruder: 'Botafogo',
    reason: 'Os outros quatro já ganharam a Supercopa do Brasil (o Corinthians foi bi em 2026, sobre o Flamengo). O Botafogo perdeu a de 2025.',
  },
  {
    id: 'mundial-clubes-br',
    members: ['Santos', 'Flamengo', 'Grêmio', 'Internacional'],
    intruder: 'Atlético-MG',
    reason: 'Os outros quatro foram campeões do mundo (Santos em 1962 e 1963, Flamengo em 1981, Grêmio em 1983, Inter em 2006). O Atlético-MG nunca ganhou.',
  },
  {
    id: 'brasileirao-anos-2020',
    members: ['Flamengo', 'Atlético-MG', 'Palmeiras', 'Botafogo'],
    intruder: 'São Paulo',
    reason: 'Os outros quatro foram campeões brasileiros nos anos 2020 (Flamengo em 2020 e 2025, Atlético-MG em 2021, Palmeiras em 2022 e 2023, Botafogo em 2024). O último título do São Paulo foi em 2008.',
  },
  {
    id: 'nunca-na-copa',
    members: ['Venezuela', 'Índia', 'Finlândia', 'Luxemburgo'],
    intruder: 'Islândia',
    reason: 'Os outros quatro nunca jogaram uma Copa do Mundo (até 2026). A Islândia jogou a de 2018, na Rússia.',
  },
  {
    id: 'artemis-2',
    category: 'geral',
    members: ['Reid Wiseman', 'Victor Glover', 'Christina Koch', 'Jeremy Hansen'],
    intruder: 'Marcos Pontes',
    reason: 'Os outros quatro foram a tripulação da Artemis II, que deu a volta na Lua em abril de 2026. Marcos Pontes, o primeiro astronauta brasileiro, foi à Estação Espacial em 2006.',
  },
  {
    id: 'oscar-internacional-br',
    category: 'geral',
    members: ['O Pagador de Promessas', 'O Quatrilho', 'Central do Brasil', 'Ainda Estou Aqui'],
    intruder: 'Cidade de Deus',
    reason: 'Os outros quatro foram indicados ao Oscar de filme estrangeiro/internacional (e Ainda Estou Aqui ganhou, em 2025). Cidade de Deus teve 4 indicações, mas não nessa categoria.',
  },
  {
    id: 'campeoes-bbb',
    category: 'geral',
    members: ['Juliette', 'Davi', 'Jean Wyllys', 'Ana Paula Renault'],
    intruder: 'Gil do Vigor',
    reason: 'Os outros quatro ganharam o BBB (Jean Wyllys no 5, Juliette no 21, Davi no 24 e Ana Paula Renault no 26). Gil do Vigor ficou em 4º no BBB 21.',
  },
  {
    id: 'nobel-paz',
    category: 'historia',
    members: ['Nelson Mandela', 'Malala', 'Martin Luther King', 'Navi Pillay'],
    intruder: 'Gandhi',
    reason: 'Os outros quatro ganharam o Nobel da Paz (Navi Pillay em 2026). Gandhi foi indicado cinco vezes e nunca ganhou.',
  },
  {
    id: 'campeoes-f1',
    category: 'geral',
    members: ['Ayrton Senna', 'Nelson Piquet', 'Emerson Fittipaldi', 'Kimi Antonelli'],
    intruder: 'Rubens Barrichello',
    reason: 'Os outros quatro foram campeões mundiais de Fórmula 1 (Kimi Antonelli em 2026). Rubinho foi vice duas vezes, em 2002 e 2004.',
  },
  // Fora do futebol (rodada 10).
  ...INTRUSO_GERAIS,
  ...INTRUSO_R11,
  ...INTRUSO_R14,
];

export function getIntrusoSet(id: string): IntrusoSet | undefined {
  return INTRUSO_SETS.find((s) => s.id === id);
}
