import type { ContentCategory } from '../../game/types';

/**
 * Cartas de pergunta-e-resposta curta: Emoji (adivinhe pelo emoji) e Quiz
 * Relâmpago. Curadoria: resposta única e estável (com data quando precisa).
 */
export interface Card {
  id: string;
  category: ContentCategory;
  prompt: string;
  answer: string;
  aliases?: string[];
}

export const EMOJI_CARDS: Card[] = [
  // Futebol: clubes pelos mascotes e apelidos
  { id: 'e-galo', category: 'futebol', prompt: '🐓 ⚫ ⚪ (clube brasileiro)', answer: 'Atlético-MG', aliases: ['atletico mineiro', 'atletico mg', 'galo'] },
  { id: 'e-porco', category: 'futebol', prompt: '🐷 💚 ⚪ (clube brasileiro)', answer: 'Palmeiras', aliases: ['verdao'] },
  { id: 'e-raposa', category: 'futebol', prompt: '🦊 💙 ⭐ (clube brasileiro)', answer: 'Cruzeiro' },
  { id: 'e-peixe', category: 'futebol', prompt: '🐟 ⚪ ⚫ (clube brasileiro)', answer: 'Santos' },
  { id: 'e-urubu', category: 'futebol', prompt: '🦅 🔴 ⚫ (clube brasileiro)', answer: 'Flamengo', aliases: ['mengao'] },
  { id: 'e-tricolor-gaucho', category: 'futebol', prompt: '🤺 💙 🖤 🤍 (clube gaúcho, mascote mosqueteiro)', answer: 'Grêmio', aliases: ['gremio'] },
  { id: 'e-saci', category: 'futebol', prompt: '🧢 🔴 ⚪ 🦵 (clube gaúcho, mascote de uma perna só)', answer: 'Internacional', aliases: ['inter'] },
  { id: 'e-bacalhau', category: 'futebol', prompt: '⚓ ⚫ ⚪ ⛵ (clube carioca)', answer: 'Vasco', aliases: ['vasco da gama'] },
  { id: 'e-zebra', category: 'futebol', prompt: '🦓 🇮🇹 ⚫ ⚪ (clube italiano)', answer: 'Juventus', aliases: ['juve'] },
  { id: 'e-red-devils', category: 'futebol', prompt: '😈 🔴 🏴 (clube inglês)', answer: 'Manchester United', aliases: ['man united', 'united'] },
  { id: 'e-gunners', category: 'futebol', prompt: '🔫 🔴 ⚪ (clube de Londres)', answer: 'Arsenal' },
  { id: 'e-merengue', category: 'futebol', prompt: '👑 ⚪ 🇪🇸 (clube espanhol)', answer: 'Real Madrid', aliases: ['real'] },
  // Futebol: jogadores
  { id: 'e-pele', category: 'futebol', prompt: '👑 ⚽ 🇧🇷 3️⃣', answer: 'Pelé', aliases: ['pele', 'rei pele'] },
  { id: 'e-cr7', category: 'futebol', prompt: '7️⃣ 🇵🇹 🏝️ 💪', answer: 'Cristiano Ronaldo', aliases: ['cr7', 'cristiano'] },
  { id: 'e-messi', category: 'futebol', prompt: '🐐 🇦🇷 🔟 🏆', answer: 'Lionel Messi', aliases: ['messi'] },
  { id: 'e-ronaldinho', category: 'futebol', prompt: '😁 🦷 ⚽ 🇧🇷 🔟', answer: 'Ronaldinho', aliases: ['ronaldinho gaucho', 'r10'] },
  { id: 'e-zlatan', category: 'futebol', prompt: '🦁 🇸🇪 🥋 ⚽', answer: 'Ibrahimović', aliases: ['ibrahimovic', 'zlatan'] },
  { id: 'e-garrincha', category: 'futebol', prompt: '🐦 🦵 🌀 🇧🇷 (anos 60)', answer: 'Garrincha' },
  // Geral: filmes e desenhos
  { id: 'e-titanic', category: 'geral', prompt: '🚢 🧊 💔 🎻', answer: 'Titanic' },
  { id: 'e-rei-leao', category: 'geral', prompt: '🦁 👑 🌅 🐗', answer: 'O Rei Leão', aliases: ['rei leao'] },
  { id: 'e-jurassic', category: 'geral', prompt: '🦖 🏝️ 🧬 🚙', answer: 'Jurassic Park' },
  { id: 'e-harry', category: 'geral', prompt: '⚡ 👓 🧙 🦉', answer: 'Harry Potter' },
  { id: 'e-frozen', category: 'geral', prompt: '❄️ 👸 👸 ⛄', answer: 'Frozen' },
  { id: 'e-fantasma', category: 'geral', prompt: '👻 🚫 🔫 🚒', answer: 'Os Caça-Fantasmas', aliases: ['caca fantasmas', 'ghostbusters'] },
  { id: 'e-chocolate', category: 'geral', prompt: '🍫 🏭 🎫 ✨', answer: 'A Fantástica Fábrica de Chocolate', aliases: ['fantastica fabrica de chocolate', 'fabrica de chocolate'] },
  { id: 'e-tubarao', category: 'geral', prompt: '🦈 🏖️ 🩸 🚤', answer: 'Tubarão', aliases: ['jaws'] },
  { id: 'e-matrix', category: 'geral', prompt: '💊 🔴 🔵 🕶️ 💻', answer: 'Matrix' },
  { id: 'e-tropa', category: 'geral', prompt: '💀 🗡️ 🚓 🇧🇷 (filme brasileiro)', answer: 'Tropa de Elite' },
  { id: 'e-cidade-deus', category: 'geral', prompt: '🐔 📷 🏘️ 🇧🇷 (filme brasileiro)', answer: 'Cidade de Deus' },
  // Animes
  { id: 'e-naruto', category: 'anime', prompt: '🍥 🦊 🍜 👊', answer: 'Naruto' },
  { id: 'e-onepiece', category: 'anime', prompt: '🏴‍☠️ 👒 🍖 🌊', answer: 'One Piece' },
  { id: 'e-dragonball', category: 'anime', prompt: '🐉 🟠 ⭐ 🥋', answer: 'Dragon Ball' },
  { id: 'e-deathnote', category: 'anime', prompt: '📓 💀 🍎 🖊️', answer: 'Death Note' },
  { id: 'e-demonslayer', category: 'anime', prompt: '👹 🗡️ 🌊 🌸', answer: 'Demon Slayer', aliases: ['kimetsu no yaiba'] },
  { id: 'e-pokemon', category: 'anime', prompt: '⚡ 🐭 🔴 ⚪ 🎒', answer: 'Pokémon', aliases: ['pokemon'] },
  { id: 'e-cdz', category: 'anime', prompt: '♐ 🛡️ ⭐ 🥊 (anos 80)', answer: 'Os Cavaleiros do Zodíaco', aliases: ['cavaleiros do zodiaco', 'saint seiya'] },
  // Filmes e desenhos (lote 2)
  { id: 'e-avatar', category: 'geral', prompt: '🔵 👽 🌳 🏹', answer: 'Avatar' },
  { id: 'e-toy-story', category: 'geral', prompt: '🤠 🚀 🧸 👦', answer: 'Toy Story' },
  { id: 'e-nemo', category: 'geral', prompt: '🐠 🔍 🌊 👨‍👦', answer: 'Procurando Nemo', aliases: ['nemo', 'finding nemo'] },
  { id: 'e-star-wars', category: 'geral', prompt: '⭐ ⚔️ 🌌 🤖', answer: 'Star Wars', aliases: ['guerra nas estrelas'] },
  { id: 'e-aneis', category: 'geral', prompt: '💍 🌋 🧙 🧝', answer: 'O Senhor dos Anéis', aliases: ['senhor dos aneis'] },
  { id: 'e-et', category: 'geral', prompt: '👽 🚲 🌕 ☎️', answer: 'E.T.', aliases: ['et', 'e t', 'et o extraterrestre'] },
  { id: 'e-aranha', category: 'geral', prompt: '🕷️ 🧑 🏙️ 🕸️', answer: 'Homem-Aranha', aliases: ['homem aranha', 'spider man', 'spiderman'] },
  { id: 'e-shrek', category: 'geral', prompt: '🟢 👹 🐴 👸', answer: 'Shrek' },
  { id: 'e-carros', category: 'geral', prompt: '🚗 ⚡ 🏁 🏆 (animação)', answer: 'Carros', aliases: ['cars'] },
  { id: 'e-up', category: 'geral', prompt: '🎈 🏠 👴 👦', answer: 'Up', aliases: ['up altas aventuras'] },
  { id: 'e-pantera', category: 'geral', prompt: '🐆 ⚫ 👑 🌍', answer: 'Pantera Negra', aliases: ['black panther'] },
  { id: 'e-bela-fera', category: 'geral', prompt: '🌹 👸 🐻 🏰', answer: 'A Bela e a Fera', aliases: ['bela e a fera'] },
  { id: 'e-piratas', category: 'geral', prompt: '🏴‍☠️ 🚢 💀 🍾 (com Johnny Depp)', answer: 'Piratas do Caribe', aliases: ['piratas do caribe'] },
  { id: 'e-compadecida', category: 'geral', prompt: '😇 😈 ⚖️ 🌵 (filme brasileiro)', answer: 'O Auto da Compadecida', aliases: ['auto da compadecida'] },
  { id: 'e-central', category: 'geral', prompt: '🚉 ✉️ 👦 🇧🇷 (filme brasileiro)', answer: 'Central do Brasil' },
  { id: 'e-ainda-estou', category: 'geral', prompt: '🏠 👩 📸 🏆 (filme brasileiro do Oscar 2025)', answer: 'Ainda Estou Aqui' },
];

export const RELAMPAGO_CARDS: Card[] = [
  // Futebol (recentes, conferidos em nov/2026)
  { id: 'r-copa-2026', category: 'futebol', prompt: 'Qual seleção ganhou a Copa do Mundo de 2026?', answer: 'Espanha' },
  { id: 'r-gol-2026', category: 'futebol', prompt: 'Quem fez o gol do título da Copa de 2026, na prorrogação contra a Argentina?', answer: 'Ferran Torres', aliases: ['ferran'] },
  { id: 'r-ucl-2026', category: 'futebol', prompt: 'Qual clube ganhou a Champions League 2025/26?', answer: 'PSG', aliases: ['paris saint germain', 'paris'] },
  { id: 'r-liberta-2025', category: 'futebol', prompt: 'Qual clube ganhou a Libertadores de 2025?', answer: 'Flamengo', aliases: ['mengao'] },
  { id: 'r-bola-2026', category: 'futebol', prompt: 'Quem ganhou a Bola de Ouro de 2026?', answer: 'Harry Kane', aliases: ['kane'] },
  { id: 'r-bola-2025', category: 'futebol', prompt: 'Quem ganhou a Bola de Ouro de 2025?', answer: 'Ousmane Dembélé', aliases: ['dembele'] },
  { id: 'r-sede-2010', category: 'futebol', prompt: 'Qual país sediou a Copa do Mundo de 2010?', answer: 'África do Sul', aliases: ['africa do sul'] },
  { id: 'r-sede-1950', category: 'futebol', prompt: 'Quem ganhou a Copa de 1950, o "Maracanazo"?', answer: 'Uruguai' },
  { id: 'r-camp-nou', category: 'futebol', prompt: 'Em que cidade fica o Camp Nou?', answer: 'Barcelona' },
  { id: 'r-anfield', category: 'futebol', prompt: 'Anfield é o estádio de qual clube?', answer: 'Liverpool' },
  { id: 'r-bombonera', category: 'futebol', prompt: 'La Bombonera é o estádio de qual clube?', answer: 'Boca Juniors', aliases: ['boca'] },
  { id: 'r-7a1', category: 'futebol', prompt: 'Em que estádio foi o 7 a 1 da Alemanha sobre o Brasil?', answer: 'Mineirão', aliases: ['mineirao'] },
  { id: 'r-mao-deus', category: 'futebol', prompt: 'Contra qual seleção Maradona fez o gol da "mão de Deus"?', answer: 'Inglaterra' },
  { id: 'r-cabecada', category: 'futebol', prompt: 'Em quem Zidane deu a cabeçada na final de 2006?', answer: 'Materazzi' },
  // Geral
  { id: 'r-camberra', category: 'geral', prompt: 'Qual é a capital da Austrália?', answer: 'Camberra', aliases: ['canberra'] },
  { id: 'r-vaticano', category: 'geral', prompt: 'Qual é o menor país do mundo?', answer: 'Vaticano' },
  { id: 'r-au', category: 'geral', prompt: 'Qual elemento químico tem o símbolo Au?', answer: 'Ouro' },
  { id: 'r-mona-lisa', category: 'geral', prompt: 'Quem pintou a Mona Lisa?', answer: 'Leonardo da Vinci', aliases: ['da vinci', 'leonardo'] },
  { id: 'r-chernobyl', category: 'geral', prompt: 'Em que país fica Chernobyl?', answer: 'Ucrânia', aliases: ['ucrania'] },
  { id: 'r-maior-oceano', category: 'geral', prompt: 'Qual é o maior oceano do planeta?', answer: 'Pacífico', aliases: ['pacifico'] },
  { id: 'r-femur', category: 'geral', prompt: 'Qual é o maior osso do corpo humano?', answer: 'Fêmur', aliases: ['femur'] },
  { id: 'r-machado', category: 'geral', prompt: 'Quem escreveu "Dom Casmurro"?', answer: 'Machado de Assis', aliases: ['machado'] },
  // História
  { id: 'r-primeiro-presidente', category: 'historia', prompt: 'Quem foi o primeiro presidente do Brasil?', answer: 'Deodoro da Fonseca', aliases: ['deodoro', 'marechal deodoro'] },
  { id: 'r-lei-aurea', category: 'historia', prompt: 'Quem assinou a Lei Áurea?', answer: 'Princesa Isabel', aliases: ['isabel'] },
  { id: 'r-clt', category: 'historia', prompt: 'Qual presidente criou a CLT, em 1943?', answer: 'Getúlio Vargas', aliases: ['getulio', 'vargas'] },
  { id: 'r-brasilia', category: 'historia', prompt: 'Qual presidente construiu Brasília?', answer: 'Juscelino Kubitschek', aliases: ['jk', 'juscelino'] },
  { id: 'r-muro', category: 'historia', prompt: 'Em que ano caiu o Muro de Berlim?', answer: '1989' },
  { id: 'r-lua', category: 'historia', prompt: 'Quem foi o primeiro ser humano a pisar na Lua?', answer: 'Neil Armstrong', aliases: ['armstrong'] },
  { id: 'r-mandela', category: 'historia', prompt: 'Qual líder sul-africano passou 27 anos preso?', answer: 'Nelson Mandela', aliases: ['mandela'] },
  // Política (só quando pedido)
  { id: 'r-ai5', category: 'politica', prompt: 'Qual ato institucional de 1968 endureceu a ditadura militar?', answer: 'AI-5', aliases: ['ai 5', 'ai5', 'ato institucional 5'] },
  { id: 'r-stf', category: 'politica', prompt: 'Quantos ministros tem o STF?', answer: '11', aliases: ['onze'] },
  { id: 'r-deputados', category: 'politica', prompt: 'Quantos deputados federais tem a Câmara?', answer: '513' },
  { id: 'r-senadores', category: 'politica', prompt: 'Quantos senadores tem o Brasil?', answer: '81' },
  { id: 'r-bancada-2022', category: 'politica', prompt: 'Qual partido elegeu a maior bancada da Câmara em 2022?', answer: 'PL', aliases: ['partido liberal'] },
  { id: 'r-collor-direto', category: 'politica', prompt: 'Quem foi o primeiro presidente eleito por voto direto depois da ditadura?', answer: 'Fernando Collor', aliases: ['collor'] },
  { id: 'r-brexit', category: 'politica', prompt: 'Qual país saiu da União Europeia em 2020?', answer: 'Reino Unido', aliases: ['inglaterra', 'gra bretanha'] },
  { id: 'r-obama', category: 'politica', prompt: 'Quem foi o primeiro presidente negro dos Estados Unidos?', answer: 'Barack Obama', aliases: ['obama'] },
  { id: 'r-impeachment', category: 'politica', prompt: 'Qual presidente sofreu impeachment em 2016?', answer: 'Dilma Rousseff', aliases: ['dilma'] },
  { id: 'r-diretas', category: 'politica', prompt: 'Como se chamou o movimento de 1984 pelas eleições diretas para presidente?', answer: 'Diretas Já', aliases: ['diretas ja', 'diretas'] },
  // Conhecimentos gerais (lote 2)
  { id: 'r-g-ottawa', category: 'geral', prompt: 'Qual é a capital do Canadá?', answer: 'Ottawa', aliases: ['otawa'] },
  { id: 'r-g-ancara', category: 'geral', prompt: 'Qual é a capital da Turquia?', answer: 'Ancara', aliases: ['ankara'] },
  { id: 'r-g-rabat', category: 'geral', prompt: 'Qual é a capital do Marrocos?', answer: 'Rabat' },
  { id: 'r-g-wellington', category: 'geral', prompt: 'Qual é a capital da Nova Zelândia?', answer: 'Wellington' },
  { id: 'r-g-reykjavik', category: 'geral', prompt: 'Qual é a capital da Islândia?', answer: 'Reykjavík', aliases: ['reykjavik', 'reiquiavique'] },
  { id: 'r-g-palmas', category: 'geral', prompt: 'Qual é a capital do Tocantins?', answer: 'Palmas' },
  { id: 'r-g-porto-velho', category: 'geral', prompt: 'Porto Velho é capital de qual estado?', answer: 'Rondônia', aliases: ['rondonia'] },
  { id: 'r-g-floripa', category: 'geral', prompt: 'Qual é a capital de Santa Catarina?', answer: 'Florianópolis', aliases: ['florianopolis', 'floripa'] },
  { id: 'r-g-sergipe', category: 'geral', prompt: 'Qual é o menor estado do Brasil em área?', answer: 'Sergipe' },
  { id: 'r-g-argentina-area', category: 'geral', prompt: 'Qual é o segundo maior país da América do Sul em área?', answer: 'Argentina' },
  { id: 'r-g-aconcagua', category: 'geral', prompt: 'Qual é a montanha mais alta da América do Sul?', answer: 'Aconcágua', aliases: ['aconcagua'] },
  { id: 'r-g-saara', category: 'geral', prompt: 'Qual é o maior deserto quente do mundo?', answer: 'Saara', aliases: ['sahara'] },
  { id: 'r-g-machu', category: 'geral', prompt: 'Em que país fica Machu Picchu?', answer: 'Peru' },
  { id: 'r-g-bota', category: 'geral', prompt: 'Qual país tem o formato de uma bota?', answer: 'Itália', aliases: ['italia'] },
  { id: 'r-g-angola', category: 'geral', prompt: 'Qual é a língua oficial de Angola?', answer: 'Português', aliases: ['portugues'] },
  { id: 'r-g-iene', category: 'geral', prompt: 'Qual é a moeda do Japão?', answer: 'Iene', aliases: ['yen', 'ien'] },
  { id: 'r-g-india', category: 'geral', prompt: 'Qual é o país mais populoso do mundo (desde 2023)?', answer: 'Índia', aliases: ['india'] },
  { id: 'r-g-marte', category: 'geral', prompt: 'Qual planeta é chamado de planeta vermelho?', answer: 'Marte' },
  { id: 'r-g-nitrogenio', category: 'geral', prompt: 'Qual é o gás mais abundante na atmosfera?', answer: 'Nitrogênio', aliases: ['nitrogenio', 'azoto'] },
  { id: 'r-g-mercurio', category: 'geral', prompt: 'Qual metal é líquido em temperatura ambiente?', answer: 'Mercúrio', aliases: ['mercurio'] },
  { id: 'r-g-h2o', category: 'geral', prompt: 'Qual é a fórmula química da água?', answer: 'H2O', aliases: ['h 2 o'] },
  { id: 'r-g-baleia', category: 'geral', prompt: 'Qual é o maior animal do mundo?', answer: 'Baleia-azul', aliases: ['baleia azul'] },
  { id: 'r-g-guepardo', category: 'geral', prompt: 'Qual é o animal terrestre mais rápido?', answer: 'Guepardo', aliases: ['chita', 'cheetah'] },
  { id: 'r-g-pele', category: 'geral', prompt: 'Qual é o maior órgão do corpo humano?', answer: 'Pele' },
  { id: 'r-g-pancreas', category: 'geral', prompt: 'Qual órgão produz a insulina?', answer: 'Pâncreas', aliases: ['pancreas'] },
  { id: 'r-g-vitamina-d', category: 'geral', prompt: 'Qual vitamina o corpo produz com a luz do sol?', answer: 'Vitamina D', aliases: ['d'] },
  { id: 'r-g-cromossomos', category: 'geral', prompt: 'Quantos cromossomos tem uma célula humana comum?', answer: '46', aliases: ['quarenta e seis'] },
  { id: 'r-g-ebulicao', category: 'geral', prompt: 'A que temperatura a água ferve ao nível do mar, em °C?', answer: '100', aliases: ['cem'] },
  { id: 'r-g-darwin', category: 'geral', prompt: 'Quem propôs a teoria da evolução por seleção natural?', answer: 'Charles Darwin', aliases: ['darwin'] },
  { id: 'r-g-pasteur', category: 'geral', prompt: 'Que cientista criou a vacina contra a raiva?', answer: 'Louis Pasteur', aliases: ['pasteur'] },
  { id: 'r-g-sputnik', category: 'geral', prompt: 'Qual foi o primeiro satélite artificial?', answer: 'Sputnik', aliases: ['sputnik 1'] },
  { id: 'r-g-camoes', category: 'geral', prompt: 'Quem escreveu "Os Lusíadas"?', answer: 'Luís de Camões', aliases: ['camoes', 'luis de camoes'] },
  { id: 'r-g-tarsila', category: 'geral', prompt: 'Quem pintou o "Abaporu"?', answer: 'Tarsila do Amaral', aliases: ['tarsila'] },
  { id: 'r-g-van-gogh', category: 'geral', prompt: 'Quem pintou "A Noite Estrelada"?', answer: 'Van Gogh', aliases: ['vincent van gogh'] },
  { id: 'r-g-jobim', category: 'geral', prompt: 'Quem compôs "Garota de Ipanema" com Vinicius de Moraes?', answer: 'Tom Jobim', aliases: ['jobim', 'antonio carlos jobim'] },
  { id: 'r-g-pequeno-principe', category: 'geral', prompt: 'Quem escreveu "O Pequeno Príncipe"?', answer: 'Antoine de Saint-Exupéry', aliases: ['saint exupery', 'exupery'] },
  { id: 'r-g-rosa', category: 'geral', prompt: 'Quem escreveu "Grande Sertão: Veredas"?', answer: 'Guimarães Rosa', aliases: ['guimaraes rosa', 'joao guimaraes rosa'] },
  { id: 'r-g-queen', category: 'geral', prompt: 'Qual banda gravou "Bohemian Rhapsody"?', answer: 'Queen' },
  { id: 'r-g-piano', category: 'geral', prompt: 'Qual instrumento tem 88 teclas?', answer: 'Piano' },
  { id: 'r-g-volei', category: 'geral', prompt: 'Quantos jogadores um time de vôlei tem em quadra?', answer: '6', aliases: ['seis'] },
  // História (lote 2)
  { id: 'r-h-pedro1', category: 'historia', prompt: 'Quem foi o primeiro imperador do Brasil?', answer: 'Dom Pedro I', aliases: ['pedro i', 'pedro 1', 'd pedro i'] },
  { id: 'r-h-isabel', category: 'historia', prompt: 'Qual princesa assinou a Lei Áurea?', answer: 'Princesa Isabel', aliases: ['isabel'] },
  { id: 'r-h-zumbi', category: 'historia', prompt: 'Quem foi o último líder do Quilombo dos Palmares?', answer: 'Zumbi', aliases: ['zumbi dos palmares'] },
  { id: 'r-h-gama', category: 'historia', prompt: 'Que navegador português abriu o caminho marítimo para as Índias?', answer: 'Vasco da Gama' },
  { id: 'r-h-jk', category: 'historia', prompt: 'Qual presidente construiu Brasília?', answer: 'Juscelino Kubitschek', aliases: ['jk', 'juscelino'] },
  { id: 'r-h-salvador', category: 'historia', prompt: 'Qual foi a primeira capital do Brasil?', answer: 'Salvador' },
  { id: 'r-h-napoleao', category: 'historia', prompt: 'Que imperador francês foi derrotado em Waterloo?', answer: 'Napoleão', aliases: ['napoleao', 'napoleao bonaparte'] },
  { id: 'r-h-gandhi', category: 'historia', prompt: 'Quem liderou a independência da Índia pela não violência?', answer: 'Gandhi', aliases: ['mahatma gandhi'] },
];

export const CARDS = { emoji: EMOJI_CARDS, relampago: RELAMPAGO_CARDS };

export function getCard(id: string): Card | undefined {
  return EMOJI_CARDS.find((c) => c.id === id) ?? RELAMPAGO_CARDS.find((c) => c.id === id);
}
