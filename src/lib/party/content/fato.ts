import type { ContentCategory } from '../../game/types';
import { FACTS_GERAIS } from './fato-gerais';

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
  // Conhecimentos gerais (lote 2)
  f('ff-girafa', 'geral', true, 'A girafa tem o mesmo número de vértebras no pescoço que o ser humano.', 'São 7 nos dois. As da girafa é que são enormes.'),
  f('ff-cachorro', 'geral', false, 'Cachorros enxergam só em preto e branco.', 'Eles veem cores, principalmente azul e amarelo; só têm dificuldade com vermelho e verde.'),
  f('ff-unhas', 'geral', false, 'Unhas e cabelo continuam crescendo depois da morte.', 'A pele se retrai ao desidratar e dá essa impressão.'),
  f('ff-chiclete', 'geral', false, 'Chiclete engolido fica 7 anos no estômago.', 'Ele não é digerido, mas sai normalmente em poucos dias.'),
  f('ff-lua', 'geral', true, 'Da Terra, vemos sempre a mesma face da Lua.', 'A Lua gira em torno de si no mesmo tempo em que dá a volta na Terra.'),
  f('ff-diamante', 'geral', true, 'Diamante e grafite (o do lápis) são feitos do mesmo elemento.', 'Os dois são carbono puro, só arrumado de jeitos diferentes.'),
  f('ff-morcego', 'geral', false, 'Morcegos são cegos.', 'Todos enxergam; muitos usam também a ecolocalização.'),
  f('ff-sydney', 'geral', false, 'Sydney é a capital da Austrália.', 'A capital é Camberra, criada justamente para encerrar a briga entre Sydney e Melbourne.'),
  f('ff-luz-sol', 'geral', true, 'A luz do Sol leva cerca de 8 minutos para chegar à Terra.', 'Pouco mais de 8 minutos e 20 segundos, em média.'),
  f('ff-cerebro', 'geral', true, 'O cérebro em si não sente dor.', 'Ele não tem receptores de dor; a dor de cabeça vem de membranas, vasos e músculos em volta.'),
  f('ff-ouro', 'geral', true, 'Dá para comer ouro.', 'Folhas de ouro comestível são usadas em doces e não fazem mal em pequena quantidade.'),
  f('ff-tubarao', 'geral', true, 'O esqueleto do tubarão não tem ossos.', 'É todo de cartilagem.'),
  f('ff-mosca', 'geral', false, 'A mosca doméstica vive só 24 horas.', 'Vive cerca de um mês. Quem vive pouquíssimo é o adulto da efemérida.'),
  f('ff-everest-cresce', 'geral', true, 'O Everest ainda está crescendo.', 'Alguns milímetros por ano, empurrado pelo choque das placas da Índia e da Ásia.'),
  f('ff-portugues-9', 'geral', true, 'O português é língua oficial em nove países.', 'Brasil, Portugal, Angola, Moçambique, Cabo Verde, Guiné-Bissau, São Tomé e Príncipe, Timor-Leste e Guiné Equatorial.'),
  f('ff-polvo-tinta', 'geral', false, 'Todo animal com tentáculos solta tinta.', 'Águas-vivas, por exemplo, não soltam. Polvos e lulas, sim.'),
  // 2025-2026 (pesquisa de 18/11/2026)
  f('ff-espanha-penaltis-2026', 'futebol', false, 'A Espanha ganhou a Copa de 2026 nos pênaltis.', 'Foi 1 a 0 na prorrogação, gol de Ferran Torres aos 106 minutos, contra a Argentina.'),
  f('ff-mbappe-recorde', 'futebol', true, 'Depois da Copa de 2026, Mbappé é o maior artilheiro da história das Copas.', 'Chegou a 22 gols, um a mais que Messi (21). Klose, com 16, caiu para 3º.'),
  f('ff-messi-maior-artilheiro', 'futebol', false, 'Depois da Copa de 2026, Messi é o maior artilheiro da história das Copas.', 'Messi tem 21; Mbappé passou com 22.'),
  f('ff-brasil-noruega', 'futebol', true, 'O Brasil foi eliminado pela Noruega na Copa de 2026.', 'Perdeu por 2 a 1 nas oitavas, com dois gols de Haaland.'),
  f('ff-kane-bola', 'futebol', true, 'Harry Kane ganhou a Bola de Ouro de 2026.', 'Foi a primeira dele. Mbappé ficou em 2º e Lamine Yamal em 3º.'),
  f('ff-psg-final-2026', 'futebol', false, 'O PSG venceu o Arsenal no tempo normal na final da Champions de 2026.', 'Foi 1 a 1 e o PSG ganhou nos pênaltis (4 a 3), em Budapeste.'),
  f('ff-cr7-seis-copas', 'futebol', true, 'Cristiano Ronaldo marcou gol em seis Copas do Mundo diferentes.', 'Marcou em todas de 2006 a 2026, um recorde.'),
  f('ff-copa-64-jogos', 'futebol', false, 'A Copa de 2026 teve 64 jogos, como as anteriores.', 'Com 48 seleções foram 104 jogos e 308 gols, recorde de gols numa Copa.'),
  f('ff-arsenal-2026', 'futebol', true, 'O Arsenal foi campeão inglês em 2025/26.', 'Acabou com um jejum de mais de 20 anos sem o título.'),
  f('ff-liberta-2026-fla', 'futebol', false, 'A final da Libertadores de 2026 é Palmeiras x Flamengo.', 'É Palmeiras x Estudiantes, em Montevidéu. O Estudiantes eliminou o Flamengo na semifinal.'),
  f('ff-azteca-abertura', 'futebol', true, 'A abertura da Copa de 2026 foi no Estádio Azteca.', 'México 2 x 0 África do Sul. O Azteca já tinha recebido jogos das Copas de 1970 e 1986.'),
  f('ff-chelsea-mundial', 'futebol', true, 'O Chelsea ganhou o primeiro Mundial de Clubes com 32 times, em 2025.', 'Venceu o PSG por 3 a 0 na final, nos EUA.'),
  f('ff-flamengo-tetra', 'futebol', true, 'O Flamengo é o clube brasileiro com mais Libertadores.', 'Com o título de 2025, chegou a 4. São Paulo, Santos, Grêmio e Palmeiras têm 3.'),
  f('ff-cdb-jogo-unico', 'futebol', true, 'A final da Copa do Brasil de 2026 é em jogo único.', 'É a primeira vez: Palmeiras x Grêmio, em Brasília, em 6 de dezembro.'),
  f('ff-psg-bi', 'futebol', true, 'O PSG ganhou a Champions duas vezes seguidas, em 2025 e 2026.', 'Em 2025 bateu a Inter por 5 a 0; em 2026, o Arsenal nos pênaltis.'),
  f('ff-lula-4', 'politica', true, 'Lula foi eleito presidente pela quarta vez em 2026.', 'Venceu em 2002, 2006, 2022 e 2026, este no 2º turno contra Flávio Bolsonaro, com 51,79% dos votos válidos.'),
  // Mais 2026 (pesquisa de 19/11/2026)
  f('ff-braathen', 'geral', true, 'O Brasil ganhou a primeira medalha olímpica de inverno em 2026, e foi de ouro.', 'Lucas Pinheiro Braathen venceu o slalom gigante em Milão-Cortina, à frente de Marco Odermatt.'),
  f('ff-celtics-2026', 'geral', false, 'O Boston Celtics ganhou a NBA em 2026.', 'Foram os New York Knicks, que bateram o Spurs por 4 a 1 e acabaram com 53 anos de jejum.'),
  f('ff-agente-secreto', 'geral', false, '"O Agente Secreto" ganhou o Oscar de filme internacional em 2026.', 'Foi indicado, mas quem ganhou foi "Valor Sentimental", da Noruega.'),
  f('ff-bbb26-premio', 'geral', true, 'A campeã do BBB 26 recebeu o maior prêmio da história do programa.', 'Ana Paula Renault levou R$ 5,7 milhões, com 75,94% dos votos.'),
  f('ff-viradouro', 'geral', true, 'A Viradouro ganhou o Carnaval do Rio de 2026 por apenas 0,1 ponto.', 'Fez 270 pontos, contra 269,9 da Beija-Flor.'),
  f('ff-alcaraz-2026', 'geral', true, 'Alcaraz venceu Djokovic na final do Australian Open de 2026.', 'Com isso completou o Grand Slam de carreira, o mais jovem a conseguir.'),
  f('ff-patriots-2026', 'geral', false, 'O New England Patriots ganhou o Super Bowl de 2026.', 'Perdeu para o Seattle Seahawks por 29 a 13. O MVP foi o running back Kenneth Walker III.'),
  f('ff-verstappen-2026', 'geral', false, 'Max Verstappen foi campeão da Fórmula 1 em 2026.', 'O campeão foi o italiano Kimi Antonelli, da Mercedes.'),
  f('ff-corinthians-cdb-2025', 'futebol', true, 'O Corinthians ganhou a Copa do Brasil de 2025 em cima do Vasco.', '0 a 0 em casa e 2 a 1 no Maracanã: o quarto título do clube.'),
  f('ff-psg-intercontinental', 'futebol', true, 'O PSG ganhou a Copa Intercontinental de 2025 contra o Flamengo.', '1 a 1 e vitória nos pênaltis, em Doha. O goleiro Safonov defendeu quatro cobranças.'),
  f('ff-carioca-2026', 'futebol', false, 'O Fluminense ganhou o Carioca de 2026.', 'O Flamengo foi campeão nos pênaltis (5 a 4), o seu 40º título estadual.'),
  // Copa 2026 e prêmios (rodada 3)
  f('ff-brasil-grupo-2026', 'futebol', true, 'O Brasil terminou em 1º no seu grupo da Copa de 2026.', '7 pontos: 1 x 1 com o Marrocos, 3 x 0 no Haiti e 3 x 0 na Escócia.'),
  f('ff-argentina-semi-2026', 'futebol', false, 'A Argentina eliminou a França na semifinal da Copa de 2026.', 'Eliminou a Inglaterra (2 a 1). A França caiu para a Espanha.'),
  f('ff-dembele-dobradinha', 'futebol', true, 'Dembélé ganhou a Bola de Ouro e o The Best em 2025.', 'Bola de Ouro em setembro e The Best da FIFA em dezembro, em Doha.'),
  f('ff-messi-top5-2026', 'futebol', true, 'Messi ficou entre os 5 primeiros da Bola de Ouro de 2026.', 'Foi o 5º, aos 39 anos.'),
  f('ff-vini-top10-2026', 'futebol', false, 'Vinícius Júnior ficou no top 10 da Bola de Ouro de 2026.', 'Ficou em 17º. O top 10 teve Kane, Mbappé, Yamal, Rodri, Messi, Kvaratskhelia, Dembélé, Haaland, Olise e Fabián Ruiz.'),
  f('ff-cabo-verde-2026', 'futebol', true, 'Cabo Verde disputou sua primeira Copa do Mundo em 2026.', 'Liderou o grupo das eliminatórias à frente de Camarões e caiu no grupo da Espanha.'),
  // 2026, rodada 4
  f('ff-supercopa-2026', 'futebol', true, 'O Corinthians ganhou a Supercopa do Brasil de 2026 em cima do Flamengo.', '2 a 0, no Mané Garrincha, em Brasília. Foi o segundo título (o primeiro foi em 1991).'),
  f('ff-recopa-2026', 'futebol', false, 'O Flamengo ganhou a Recopa Sul-Americana de 2026.', 'Perdeu para o Lanús: 1 a 0 na Argentina e 3 a 2 na prorrogação, no Maracanã.'),
  f('ff-vitoria-nordeste-2026', 'futebol', true, 'Com o título de 2026, o Vitória igualou o Bahia como maior campeão da Copa do Nordeste.', 'São 5 títulos para cada um.'),
  f('ff-feminino-publico-2026', 'futebol', true, 'A final do Brasileirão Feminino de 2026 bateu o recorde de público da competição.', '49.405 pessoas no MorumBIS, no título do São Paulo sobre o Corinthians.'),
  f('ff-serie-b-mata-mata', 'futebol', true, 'Em 2026, a Série B passou a ter mata-mata para definir parte dos acessos.', 'Campeão e vice sobem direto; do 3º ao 6º colocado disputam as outras duas vagas.'),
  f('ff-palmeiras-8-final', 'futebol', true, 'A final da Libertadores de 2026 é a 8ª da história do Palmeiras.', 'O time passou por LDU e Fluminense, as duas vezes nos pênaltis.'),
  f('ff-neymar-ciclo-2026', 'futebol', true, 'Depois da Copa de 2026, Ancelotti disse que o ciclo de Neymar na seleção tinha chegado ao fim.', 'Foi em entrevista no fim de julho de 2026, ao falar da renovação do time.'),
  f('ff-swiatek-wimbledon-2026', 'geral', false, 'Iga Swiatek ganhou Wimbledon em 2026.', 'Quem ganhou foi a tcheca Linda Noskova, de 21 anos, contra a também tcheca Karolina Muchová. Swiatek tinha ganhado em 2025.'),
  f('ff-bad-bunny-2026', 'geral', true, 'Em 2026, um álbum em espanhol ganhou o Grammy de álbum do ano pela primeira vez.', '"DeBÍ TiRAR MáS FOTOS", de Bad Bunny.'),
  f('ff-artemis-pouso-2026', 'geral', false, 'Os astronautas da Artemis II pousaram na Lua em 2026.', 'Eles deram a volta na Lua sem pousar e voltaram à Terra em 10 de abril. O pouso ficou para uma missão futura.'),
  f('ff-eurovision-2026', 'geral', true, 'A Bulgária ganhou o Eurovision pela primeira vez em 2026.', 'Com Dara e a música "Bangaranga", na final em Viena.'),
  // Fora do futebol (rodada 10).
  ...FACTS_GERAIS,
];

export function getFact(id: string): FactCard | undefined {
  return FACTS.find((x) => x.id === id);
}
