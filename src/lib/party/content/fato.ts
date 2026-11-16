import type { ContentCategory } from '../../game/types';

/**
 * Fato ou Fake: afirmações curtas, verdadeiras ou falsas, com a explicação que
 * aparece na revelação. Boa parte é mito famoso (o que torna o jogo divertido).
 */
export interface FactCard {
  id: string;
  category: ContentCategory;
  text: string;
  fact: boolean;
  why: string;
}

const f = (id: string, category: ContentCategory, fact: boolean, text: string, why: string): FactCard => ({ id, category, fact, text, why });

export const FACTS: FactCard[] = [
  // Mitos e curiosidades
  f('ff-muralha', 'geral', false, 'A Muralha da China dá para ver do espaço a olho nu.', 'Ela é comprida, mas estreita demais. Astronautas já confirmaram que não dá para ver da órbita sem ajuda.'),
  f('ff-napoleao', 'geral', false, 'Napoleão era muito baixinho.', 'Tinha cerca de 1,69 m, média para a época. A fama veio de propaganda inglesa e da confusão entre polegadas francesas e inglesas.'),
  f('ff-peixe-memoria', 'geral', false, 'Peixe-dourado tem memória de 3 segundos.', 'Experimentos mostram que eles lembram de coisas por meses.'),
  f('ff-raio', 'geral', false, 'Um raio nunca cai duas vezes no mesmo lugar.', 'Cai, sim. O Empire State é atingido dezenas de vezes por ano.'),
  f('ff-cerebro10', 'geral', false, 'Usamos só 10% do cérebro.', 'Exames de imagem mostram atividade em praticamente todas as áreas ao longo do dia.'),
  f('ff-polvo', 'geral', true, 'O polvo tem três corações.', 'Dois bombeiam sangue para as brânquias e um para o resto do corpo.'),
  f('ff-banana', 'geral', true, 'A banana é levemente radioativa.', 'Por causa do potássio-40. A dose é minúscula e inofensiva.'),
  f('ff-mel', 'geral', true, 'Mel bem guardado pode durar milhares de anos.', 'Acharam mel comestível em tumbas egípcias.'),
  f('ff-everest', 'geral', true, 'O Everest é a montanha mais alta acima do nível do mar.', 'São 8.849 m. Medida da base ao topo, o Mauna Kea, no Havaí, é maior.'),
  f('ff-sangue-azul', 'geral', false, 'O sangue nas veias é azul até encostar no oxigênio.', 'O sangue é sempre vermelho; as veias só parecem azuis através da pele.'),
  f('ff-camaleao', 'geral', false, 'O camaleão muda de cor para se camuflar no ambiente.', 'Ele muda principalmente por temperatura, humor e comunicação.'),
  f('ff-avestruz', 'geral', false, 'O avestruz enterra a cabeça na areia quando tem medo.', 'Ele abaixa a cabeça para cuidar dos ovos no ninho, que fica num buraco no chão.'),
  f('ff-vikings', 'historia', false, 'Os vikings usavam capacetes com chifres.', 'Nenhum capacete com chifres foi achado. A imagem vem de óperas do século 19.'),
  f('ff-cleopatra', 'historia', true, 'Cleópatra viveu mais perto da chegada do homem à Lua do que da construção da Grande Pirâmide.', 'A pirâmide é de cerca de 2560 a.C.; Cleópatra morreu em 30 a.C.'),
  f('ff-oxford', 'historia', true, 'A Universidade de Oxford é mais antiga que o Império Asteca.', 'Oxford já dava aulas em 1096; Tenochtitlán foi fundada em 1325.'),
  f('ff-einstein-mat', 'historia', false, 'Einstein foi reprovado em matemática na escola.', 'Ele era ótimo em matemática. O mito vem de uma confusão com a escala de notas suíça.'),
  f('ff-colombo-terra', 'historia', false, 'Na época de Colombo, quase todo mundo achava que a Terra era plana.', 'Os estudiosos sabiam que ela era redonda desde a Grécia antiga. A discussão era sobre o tamanho.'),
  f('ff-dumont', 'historia', true, 'Santos Dumont voou com o 14-Bis em Paris, diante de testemunhas, em 1906.', 'O voo de 23 de outubro de 1906 foi oficial, com público e comissão.'),
  f('ff-pedro-ii', 'historia', true, 'Dom Pedro II tinha 5 anos quando virou imperador.', 'Dom Pedro I abdicou em 1831; o filho só assumiu de fato em 1840, aos 14.'),
  f('ff-brasilia-capital', 'historia', false, 'O Rio de Janeiro foi a primeira capital do Brasil.', 'A primeira foi Salvador (1549–1763).'),
  f('ff-everest-brasil', 'geral', false, 'O ponto mais alto do Brasil é o Pico da Bandeira.', 'É o Pico da Neblina, no Amazonas, com 2.995 m.'),
  f('ff-amazonas', 'geral', true, 'O Rio Amazonas despeja mais água no mar do que qualquer outro rio do mundo.', 'Responde por cerca de 20% da água doce que chega aos oceanos.'),
  f('ff-tomate', 'geral', true, 'Botanicamente, o tomate é uma fruta.', 'Ele vem da flor e carrega as sementes.'),
  f('ff-morango', 'geral', false, 'Botanicamente, o morango é uma baga.', 'Não é. A banana, curiosamente, é.'),
  f('ff-vidro', 'geral', false, 'O vidro é um líquido que escorre devagar com os séculos.', 'Vidro é um sólido amorfo. Janelas antigas são irregulares porque eram feitas assim.'),
  f('ff-agua-quente', 'geral', true, 'Em certas condições, água quente congela mais rápido que água fria.', 'É o efeito Mpemba, observado em experimentos, mas ainda discutido.'),

  // Futebol
  f('ff-pele-gols', 'futebol', true, 'Pelé ganhou 3 Copas do Mundo como jogador.', '1958, 1962 e 1970. É o único com três.'),
  f('ff-brasil-todas', 'futebol', true, 'O Brasil é a única seleção que jogou todas as Copas do Mundo.', 'Disputou todas, de 1930 a 2026.'),
  f('ff-ronaldo-2002', 'futebol', true, 'Ronaldo fez os dois gols da final de 2002.', 'Brasil 2 x 0 Alemanha, em Yokohama.'),
  f('ff-zidane-2006', 'futebol', true, 'Zidane foi expulso na final da Copa de 2006.', 'Pela cabeçada em Materazzi, na prorrogação.'),
  f('ff-maracana-1950', 'futebol', false, 'A final de 1950 foi um jogo com mata-mata e prorrogação.', 'Aquela Copa terminou num quadrangular. Brasil x Uruguai foi o último jogo, que decidiu o título.'),
  f('ff-copa-2026', 'futebol', true, 'A Copa de 2026 foi a primeira com 48 seleções.', 'Antes eram 32 (de 1998 a 2022).'),
  f('ff-amarelo', 'futebol', true, 'A camisa amarela da Seleção nasceu de um concurso, depois do Maracanazo.', 'Em 1953, um concurso escolheu o uniforme; o vencedor foi o gaúcho Aldyr Garcia Schlee.'),
  f('ff-cartoes', 'futebol', true, 'Os cartões amarelo e vermelho estrearam na Copa de 1970.', 'Ideia do árbitro inglês Ken Aston, inspirada em um semáforo.'),
  f('ff-penalti', 'futebol', false, 'O pênalti existe desde as primeiras regras do futebol, de 1863.', 'Só foi criado em 1891.'),
  f('ff-zico-copa', 'futebol', false, 'Zico foi campeão do mundo pela Seleção.', 'Jogou 1978, 1982 e 1986 e não ganhou nenhuma.'),
  f('ff-gol-goleiro', 'futebol', true, 'Rogério Ceni fez mais de 100 gols na carreira.', 'Foram 131, quase todos de falta e pênalti.'),

  // Política (só quando pedida)
  f('ff-voto-obrigatorio', 'politica', true, 'No Brasil, o voto é facultativo para quem tem 16 e 17 anos.', 'Também para maiores de 70 e analfabetos.'),
  f('ff-senado-mandato', 'politica', true, 'O mandato de senador dura 8 anos.', 'E o Senado se renova a cada 4 anos, alternando um terço e dois terços.'),
  f('ff-deputados', 'politica', true, 'A Câmara dos Deputados tem 513 cadeiras.', 'Número em vigor desde as eleições de 1994.'),
  f('ff-presidente-idade', 'politica', false, 'Para ser presidente no Brasil, basta ter 30 anos.', 'A idade mínima é 35 anos.'),
  f('ff-urna', 'politica', true, 'A urna eletrônica começou a ser usada no Brasil em 1996.', 'Nas eleições municipais daquele ano, em parte das cidades.'),
  f('ff-vice-dilma', 'politica', true, 'Michel Temer foi vice de Dilma nos dois mandatos.', 'Eleito com ela em 2010 e 2014; assumiu em 2016.'),
  f('ff-ditadura-presidentes', 'politica', true, 'A ditadura militar teve cinco generais na Presidência.', 'Castelo Branco, Costa e Silva, Médici, Geisel e Figueiredo.'),
  f('ff-tancredo', 'politica', false, 'Tancredo Neves chegou a tomar posse como presidente.', 'Ficou doente na véspera e morreu sem assumir. Quem tomou posse foi Sarney.'),
  f('ff-mulheres-voto', 'politica', true, 'As mulheres votam no Brasil desde 1932.', 'O Código Eleitoral daquele ano garantiu o voto feminino.'),
  f('ff-stf', 'politica', true, 'O STF tem 11 ministros.', 'Indicados pelo presidente e aprovados pelo Senado.'),
  f('ff-brasilia-plano', 'politica', true, 'O plano de Brasília tem formato que lembra um avião.', 'O Plano Piloto de Lúcio Costa tem duas asas e um eixo central.'),
  f('ff-constituicao-1988-emendas', 'politica', false, 'A Constituição de 1988 nunca foi alterada.', 'Já recebeu mais de 130 emendas.'),
];

export function getFact(id: string): FactCard | undefined {
  return FACTS.find((x) => x.id === id);
}
