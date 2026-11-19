import { IMPOSTOR_SECRETS } from './impostor';

/**
 * Stop (Adedonha): categorias e listas de palavras aceitas na hora.
 * Palavra fora da lista vai para a IA (se houver chave da Maritaca); sem IA,
 * só vale o que está na lista. As listas não precisam ser completas, só generosas.
 */
export interface StopCategory {
  id: string;
  label: string;
  /** Como validar: lista curada (+ IA), clube/seleção, jogador (IA de jogadores) ou nome próprio (qualquer nome). */
  kind: 'list' | 'team' | 'player' | 'name';
  words?: string[];
}

const split = (s: string) => s.split(',').map((w) => w.trim()).filter(Boolean);

/** Nomes e apelidos de temas do Impostor: base generosa para as categorias novas (rodada 9). */
const fromImpostor = (...themes: string[]) =>
  IMPOSTOR_SECRETS.filter((x) => themes.includes(x.theme)).flatMap((x) => [x.name, ...x.aliases]);

const OBJETOS_EXTRA = split(`
agulha, alicate, almofada, anel, apito, balde, bacia, banco, bandeja, baú, bengala, bola, bolsa, borracha, caderno, cadeado, caixa, calculadora,
caneca, caneta, carteira, celular, chave, chaleira, cinzeiro, colher, copo, corda, cuia, dado, escada, escova, esponja, estojo, faca, fita,
fósforo, frigideira, funil, garfo, garrafa, gaveta, guarda-chuva, isqueiro, jarra, lanterna, lápis, livro, lixeira, lupa, mala, martelo, mochila,
navalha, notebook, óculos, panela, pente, pincel, prato, prego, quadro, régua, relógio, rodo, sabonete, serrote, tesoura, tigela, tijolo, tomada,
travessa, vaso, vela, xícara, zíper
`);
const CORPO_EXTRA = split(`
abdômen, axila, barriga, bíceps, boca, braço, cabeça, canela, cintura, clavícula, coxa, dedão, esôfago, gengiva, joelho, lábio, mandíbula, mão,
nádega, nuca, olho, osso, palma, pálpebra, panturrilha, pâncreas, pé, peito, pele, perna, quadril, rótula, sangue, tendão, tórax, traqueia,
tríceps, umbigo, unha, útero, veia, virilha
`);
const CARROS_EXTRA = split(`
Audi, BMW, BYD, Chevrolet, Citroën, Dodge, Ferrari, Fiat, Ford, Honda, Hyundai, Jeep, Kia, Lamborghini, Land Rover, Mercedes, Mitsubishi,
Nissan, Peugeot, Porsche, Renault, Tesla, Toyota, Volkswagen, Volvo, Agile, Astra, Bravo, Cobalt, Cruze, Doblò, Duster, Elantra, Fox, Gurgel,
Jetta, Kicks, Lancer, Marea, Meriva, Mobi, Nivus, Pajero, Prisma, Punto, Ranger, Spin, Tempra, Tiguan, Tracker, Up, Vectra, Versa, Virtus,
Yaris, Zafira
`);

const PAISES = split(`
Afeganistão, África do Sul, Albânia, Alemanha, Andorra, Angola, Antígua e Barbuda, Arábia Saudita, Argélia, Argentina, Armênia, Austrália, Áustria, Azerbaijão,
Bahamas, Bangladesh, Barbados, Barein, Bélgica, Belize, Benin, Bielorrússia, Bolívia, Bósnia, Botsuana, Brasil, Brunei, Bulgária, Burkina Faso, Burundi, Butão,
Cabo Verde, Camarões, Camboja, Canadá, Catar, Cazaquistão, Chade, Chile, China, Chipre, Colômbia, Comores, Congo, Coreia do Norte, Coreia do Sul, Costa do Marfim,
Costa Rica, Croácia, Cuba, Dinamarca, Djibuti, Dominica, Egito, El Salvador, Emirados Árabes Unidos, Equador, Eritreia, Eslováquia, Eslovênia, Espanha, Estados Unidos,
Estônia, Eswatini, Etiópia, Fiji, Filipinas, Finlândia, França, Gabão, Gâmbia, Gana, Geórgia, Granada, Grécia, Guatemala, Guiana, Guiné, Guiné-Bissau,
Guiné Equatorial, Haiti, Holanda, Honduras, Hungria, Iêmen, Índia, Indonésia, Irã, Iraque, Irlanda, Islândia, Israel, Itália, Jamaica, Japão, Jordânia,
Kiribati, Kosovo, Kuwait, Laos, Lesoto, Letônia, Líbano, Libéria, Líbia, Liechtenstein, Lituânia, Luxemburgo, Macedônia do Norte, Madagascar, Malásia, Malawi,
Maldivas, Mali, Malta, Marrocos, Maurício, Mauritânia, México, Mianmar, Micronésia, Moçambique, Moldávia, Mônaco, Mongólia, Montenegro, Namíbia, Nauru, Nepal,
Nicarágua, Níger, Nigéria, Noruega, Nova Zelândia, Omã, Países Baixos, Palau, Palestina, Panamá, Papua-Nova Guiné, Paquistão, Paraguai, Peru, Polônia, Portugal,
Quênia, Quirguistão, Reino Unido, Inglaterra, Escócia, País de Gales, República Centro-Africana, República Dominicana, República Tcheca, Tchéquia, Romênia, Ruanda,
Rússia, Samoa, San Marino, Santa Lúcia, São Cristóvão e Névis, São Tomé e Príncipe, São Vicente e Granadinas, Seicheles, Senegal, Serra Leoa, Sérvia, Singapura,
Síria, Somália, Sri Lanka, Sudão, Sudão do Sul, Suécia, Suíça, Suriname, Tailândia, Taiwan, Tajiquistão, Tanzânia, Timor-Leste, Togo, Tonga, Trinidad e Tobago,
Tunísia, Turcomenistão, Turquia, Tuvalu, Ucrânia, Uganda, Uruguai, Uzbequistão, Vanuatu, Vaticano, Venezuela, Vietnã, Zâmbia, Zimbábue
`);

const CIDADES = split(`
Aracaju, Belém, Belo Horizonte, Boa Vista, Brasília, Campo Grande, Cuiabá, Curitiba, Florianópolis, Fortaleza, Goiânia, João Pessoa, Macapá, Maceió, Manaus,
Natal, Palmas, Porto Alegre, Porto Velho, Recife, Rio Branco, Rio de Janeiro, Salvador, São Luís, São Paulo, Teresina, Vitória, Campinas, Santos, Guarulhos,
Osasco, Sorocaba, Ribeirão Preto, Uberlândia, Uberaba, Juiz de Fora, Contagem, Betim, Londrina, Maringá, Joinville, Blumenau, Caxias do Sul, Pelotas, Niterói,
Petrópolis, Duque de Caxias, Nova Iguaçu, Feira de Santana, Vitória da Conquista, Ilhéus, Caruaru, Petrolina, Olinda, Mossoró, Campina Grande, Juazeiro do Norte,
Sobral, Imperatriz, Santarém, Marabá, Anápolis, Dourados, Foz do Iguaçu, Cascavel, Ponta Grossa, Chapecó, Itajaí, Balneário Camboriú, Gramado, Bauru, Piracicaba,
Jundiaí, Franca, Limeira, Americana, Taubaté, São José dos Campos, Mogi das Cruzes, Santo André, São Bernardo do Campo, Diadema, Barueri, Volta Redonda,
Montes Claros, Ipatinga, Governador Valadares, Divinópolis, Poços de Caldas, Ouro Preto, Paraty, Angra dos Reis, Búzios, Cabo Frio, Macaé, Campos dos Goytacazes,
Vila Velha, Serra, Cariacica, Lisboa, Porto, Madri, Barcelona, Paris, Londres, Roma, Milão, Berlim, Munique, Amsterdã, Bruxelas, Viena, Praga, Varsóvia, Moscou,
Atenas, Istambul, Dublin, Edimburgo, Manchester, Liverpool, Nova York, Los Angeles, Chicago, Miami, Boston, Washington, Toronto, Montreal, Vancouver, Cidade do México,
Buenos Aires, Montevidéu, Santiago, Lima, Bogotá, Caracas, Quito, La Paz, Assunção, Tóquio, Pequim, Xangai, Hong Kong, Seul, Bangkok, Nova Délhi, Mumbai, Dubai,
Cairo, Joanesburgo, Cidade do Cabo, Sydney, Melbourne, Auckland, Marrakech, Casablanca, Nápoles, Turim, Florença, Veneza, Sevilha, Valência, Bilbao, Marselha, Lyon
`);

const ANIMAIS = split(`
abelha, águia, alce, alpaca, anta, antílope, aranha, arara, ariranha, avestruz, babuíno, bacalhau, bagre, baleia, barata, beija-flor, besouro, bicho-preguiça, bode,
boi, borboleta, búfalo, burro, cabra, cachorro, cão, cacatua, camaleão, camarão, camelo, canguru, capivara, caracol, caranguejo, carneiro, castor, cavalo, cavalo-marinho,
cegonha, centopeia, chimpanzé, chinchila, cigarra, cisne, coala, cobra, codorna, coelho, coruja, corvo, crocodilo, cupim, cutia, dromedário, elefante, ema, enguia,
escorpião, esquilo, estrela-do-mar, faisão, falcão, flamingo, foca, formiga, furão, gafanhoto, gaivota, galinha, galo, gambá, ganso, garça, gato, gavião, gazela,
girafa, golfinho, gorila, guaxinim, guepardo, hamster, hiena, hipopótamo, iguana, jabuti, jacaré, jaguar, jaguatirica, javali, jiboia, joaninha, jumento, lagarta,
lagartixa, lagarto, lagosta, lebre, leão, leão-marinho, leopardo, lesma, libélula, lince, lobo, lontra, louva-a-deus, lula, macaco, mamute, marimbondo, mariposa,
marreco, morcego, mosca, mosquito, mula, muriçoca, naja, narval, numbat, onça, orangotango, orca, ornitorrinco, ostra, ouriço, ovelha, panda, pantera, papagaio,
pardal, pato, pavão, peixe, pelicano, periquito, perereca, perdiz, peru, pinguim, piolho, piranha, polvo, pombo, porco, porco-espinho, preá, pulga, puma, quati,
quero-quero, rã, raposa, rato, rena, rinoceronte, robalo, rouxinol, sabiá, salamandra, salmão, sapo, sardinha, sagui, siri, sucuri, suricato, tamanduá, tartaruga,
tatu, texugo, tigre, tilápia, toupeira, touro, tubarão, tucano, tucunaré, urso, urubu, vaca, vagalume, veado, víbora, vespa, xexéu, zebra, zebu
`);

const FRUTAS = split(`
abacate, abacaxi, abiu, açaí, acerola, ameixa, amora, araçá, atemoia, banana, bacuri, cacau, cajá, caju, cambuci, caqui, carambola, cereja, coco, cupuaçu,
damasco, figo, framboesa, fruta-do-conde, goiaba, graviola, groselha, jabuticaba, jaca, jambo, jenipapo, kiwi, laranja, lima, limão, lichia, maçã, mamão, manga,
mangaba, maracujá, melancia, melão, mexerica, mirtilo, morango, nectarina, nêspera, pequi, pera, pêssego, pitanga, pitaia, pinha, pupunha, romã, seriguela,
siriguela, tamarindo, tangerina, tâmara, umbu, uva, uvaia, bergamota, ponkan, cranberry, toranja, marmelo, oliva, azeitona
`);

const PROFISSOES = split(`
açougueiro, administrador, advogado, agricultor, agrônomo, alfaiate, analista, arqueólogo, arquiteto, artista, astronauta, astrônomo, atleta, ator, atriz, auditor,
babá, bailarino, bancário, barbeiro, bibliotecário, biólogo, bombeiro, borracheiro, cabeleireiro, caixa, camareiro, caminhoneiro, cantor, carpinteiro, carteiro,
cientista, cineasta, cirurgião, contador, costureira, cozinheiro, chef, dançarino, delegado, dentista, deputado, designer, desenvolvedor, detetive, diplomata, diretor,
eletricista, economista, editor, empresário, encanador, enfermeiro, engenheiro, escritor, escultor, estilista, farmacêutico, faxineiro, feirante, filósofo, físico,
fisioterapeuta, florista, fotógrafo, frentista, garçom, gari, geólogo, gerente, goleiro, guarda, guia, historiador, instrutor, jardineiro, jogador, jornalista, juiz,
lavrador, leiloeiro, locutor, maestro, manicure, maquiador, marceneiro, marinheiro, matemático, mecânico, médico, metalúrgico, meteorologista, militar, modelo,
motorista, músico, nutricionista, oceanógrafo, oftalmologista, operário, padeiro, pastor, pedagogo, pedreiro, pescador, piloto, pintor, policial, porteiro,
prefeito, professor, programador, promotor, psicólogo, psiquiatra, publicitário, químico, radialista, recepcionista, repórter, sacerdote, salva-vidas, sapateiro,
secretário, segurança, senador, serralheiro, sociólogo, soldado, taxista, técnico, tradutor, treinador, tenente, urbanista, vendedor, vereador, veterinário,
vigia, vigilante, vidraceiro, violinista, zelador, zootecnista
`);

const CORES = split(`
amarelo, âmbar, anil, azul, azul-marinho, bege, bordô, branco, bronze, caqui, carmim, castanho, cereja, chumbo, ciano, cinza, cobre, coral, creme, dourado, escarlate,
esmeralda, fúcsia, gelo, grafite, índigo, jade, laranja, lavanda, lilás, magenta, marfim, marrom, mostarda, mogno, ocre, oliva, ouro, pérola, petróleo, prata, preto,
púrpura, rosa, roxo, rubi, salmão, sépia, terracota, turquesa, uva, verde, vermelho, vinho, violeta, xadrez
`);

const COMIDAS = split(`
acarajé, açaí, almôndega, arroz, baião de dois, bacalhoada, barreado, batata, bife, biscoito, bolo, brigadeiro, bruschetta, buchada, burrito, cachorro-quente,
caldo verde, canjica, canelone, carbonara, caruru, churrasco, coxinha, cuscuz, dobradinha, empada, empadão, enchilada, escondidinho, esfiha, espaguete, farofa,
feijão, feijoada, frango, galinhada, goulash, hambúrguer, homus, jambalaya, kibe, lasanha, macarrão, maniçoba, mingau, moqueca, mousse, nhoque, omelete, ovo,
paçoca, paella, pamonha, panqueca, pão, pão de queijo, pastel, pavê, peixe frito, picanha, pirão, pizza, polenta, pudim, quentão, queijo, quiche, quindim,
ravióli, risoto, rabada, rocambole, salada, salame, salpicão, sanduíche, sarapatel, sashimi, sopa, strogonoff, estrogonofe, sushi, tacacá, taco, tapioca,
torta, torresmo, tutu, vatapá, virado à paulista, waffle, xinxim, yakisoba, zabaione
`);

export const STOP_CATEGORIES: StopCategory[] = [
  { id: 'nome', label: 'Nome', kind: 'name' },
  { id: 'pais', label: 'País', kind: 'list', words: PAISES },
  { id: 'cidade', label: 'Cidade', kind: 'list', words: [...CIDADES] },
  { id: 'animal', label: 'Animal', kind: 'list', words: ANIMAIS },
  { id: 'fruta', label: 'Fruta', kind: 'list', words: FRUTAS },
  { id: 'profissao', label: 'Profissão', kind: 'list', words: PROFISSOES },
  { id: 'cor', label: 'Cor', kind: 'list', words: CORES },
  { id: 'comida', label: 'Comida', kind: 'list', words: COMIDAS },
  { id: 'time', label: 'Time de futebol', kind: 'team' },
  { id: 'jogador', label: 'Jogador de futebol', kind: 'player' },
  // Rodada 9: listas a partir dos temas do Impostor (o que faltar vai para a IA, como nas outras).
  { id: 'marca', label: 'Marca', kind: 'list', words: [...fromImpostor('marca', 'carro'), ...CARROS_EXTRA] },
  { id: 'objeto', label: 'Objeto', kind: 'list', words: [...fromImpostor('objeto da casa', 'instrumento musical'), ...OBJETOS_EXTRA] },
  { id: 'corpo', label: 'Parte do corpo', kind: 'list', words: [...fromImpostor('parte do corpo'), ...CORPO_EXTRA] },
  { id: 'filme', label: 'Filme ou série', kind: 'list', words: fromImpostor('filme', 'série') },
  { id: 'carro', label: 'Carro', kind: 'list', words: [...fromImpostor('carro'), ...CARROS_EXTRA] },
  { id: 'bebida', label: 'Bebida', kind: 'list', words: fromImpostor('bebida') },
  { id: 'esporte', label: 'Esporte', kind: 'list', words: fromImpostor('esporte') },
  {
    id: 'artista', label: 'Cantor ou banda', kind: 'list',
    words: fromImpostor('artista brasileiro', 'cantor internacional', 'banda brasileira', 'banda internacional'),
  },
];

export function getStopCategory(id: string): StopCategory | undefined {
  return STOP_CATEGORIES.find((c) => c.id === id);
}

/** Letras com bastante palavra em todas as categorias. */
export const STOP_LETTERS = 'ABCDEFGLMNPRSTV'.split('');
