import type { ContentCategory, Top10Item, Top10List } from '../../game/types';
import type { Card } from './cards';
import type { ChuteQuestion } from './chute';
import type { ConexoesPuzzle } from './conexoes';
import type { FactCard } from './fato';
import type { IntrusoSet } from './intruso';
import type { TimelineEvent } from './linha';
import type { SurvivorList } from './sobrevivente';

/**
 * Rodada 11 (21/11/2026): história e anime nos jogos em que faltavam, e o
 * conteúdo da temporada 2025/26. Fontes no plano (seção 27.5): páginas da
 * Wikipédia em inglês conferidas em 21/11/2026, que citam FIFA, UEFA, as
 * ligas, o COI e o Box Office Mojo. Nada de competição ainda em andamento.
 */

// ---------- Emoji: história ----------
export const EMOJI_R11: Card[] = [
  { id: 'e-h-independencia', category: 'historia', prompt: '🇧🇷 🐴 🗡️ 🏞️ 📢 (1822)', answer: 'Independência do Brasil', aliases: ['independencia', 'grito do ipiranga', 'grito da independencia', 'independencia do brasil'] },
  { id: 'e-h-lei-aurea', category: 'historia', prompt: '👸 ✍️ ⛓️ 💥 🕊️ (Brasil, 1888)', answer: 'Lei Áurea', aliases: ['lei aurea', 'abolicao', 'abolicao da escravatura', 'fim da escravidao'] },
  { id: 'e-h-lua', category: 'historia', prompt: '🧑‍🚀 🚀 🌕 👣 🇺🇸 (1969)', answer: 'Chegada do homem à Lua', aliases: ['homem na lua', 'chegada a lua', 'apollo 11', 'pouso na lua', 'chegada do homem a lua'] },
  { id: 'e-h-muro', category: 'historia', prompt: '🧱 🇩🇪 🔨 🎉 (1989)', answer: 'Queda do Muro de Berlim', aliases: ['muro de berlim', 'queda do muro', 'queda do muro de berlim'] },
  { id: 'e-h-america', category: 'historia', prompt: '⛵ ⛵ ⛵ 🇪🇸 🌎 🧭 (1492)', answer: 'Chegada de Colombo à América', aliases: ['descobrimento da america', 'descoberta da america', 'chegada de colombo', 'colombo', 'chegada de colombo a america'] },
  { id: 'e-h-brasil-1500', category: 'historia', prompt: '⛵ 🇵🇹 🌴 🏹 🇧🇷 (1500)', answer: 'Descobrimento do Brasil', aliases: ['descoberta do brasil', 'chegada dos portugueses', 'cabral', 'descobrimento do brasil'] },
  { id: 'e-h-francesa', category: 'historia', prompt: '🇫🇷 👑 🔪 🏰 🥖 (1789)', answer: 'Revolução Francesa', aliases: ['revolucao francesa', 'queda da bastilha'] },
  { id: 'e-h-hiroshima', category: 'historia', prompt: '✈️ 💣 ☢️ 🍄 🇯🇵 (1945)', answer: 'Bomba de Hiroshima', aliases: ['hiroshima', 'bomba atomica', 'hiroshima e nagasaki', 'bomba atomica de hiroshima'] },
  { id: 'e-h-tiradentes', category: 'historia', prompt: '🦷 🔧 ⚖️ 🪢 ⛰️ (Inconfidência Mineira)', answer: 'Tiradentes', aliases: ['joaquim jose da silva xavier'] },
  { id: 'e-h-cleopatra', category: 'historia', prompt: '👑 🐍 🏺 🇪🇬 👸 (rainha)', answer: 'Cleópatra', aliases: ['cleopatra'] },
  { id: 'e-h-napoleao', category: 'historia', prompt: '🇫🇷 👑 ⚔️ 🐎 🏝️ (imperador)', answer: 'Napoleão', aliases: ['napoleao', 'napoleao bonaparte', 'bonaparte'] },
  { id: 'e-h-santos-dumont', category: 'historia', prompt: '🇧🇷 ✈️ 🎩 🗼 ⌚ (inventor)', answer: 'Santos Dumont', aliases: ['alberto santos dumont'] },
  { id: 'e-h-gandhi', category: 'historia', prompt: '🇮🇳 🕊️ 👓 🧵 🚶 (líder pacifista)', answer: 'Gandhi', aliases: ['mahatma gandhi'] },
  { id: 'e-h-mandela', category: 'historia', prompt: '🇿🇦 ⛓️ 🏝️ 2️⃣7️⃣ ✊🏿 (preso por 27 anos)', answer: 'Nelson Mandela', aliases: ['mandela'] },
  { id: 'e-h-1-guerra', category: 'historia', prompt: '🌍 🪖 1️⃣ 🔫 🚂 (1914)', answer: 'Primeira Guerra Mundial', aliases: ['primeira guerra', '1a guerra', 'i guerra mundial', 'grande guerra', '1a guerra mundial'] },
  { id: 'e-h-2-guerra', category: 'historia', prompt: '🌍 🪖 2️⃣ ✈️ 💣 (1939)', answer: 'Segunda Guerra Mundial', aliases: ['segunda guerra', '2a guerra', 'ii guerra mundial', '2a guerra mundial'] },
  { id: 'e-h-peste', category: 'historia', prompt: '🐀 🦠 ⚰️ 🇪🇺 ⬛ (século 14)', answer: 'Peste Negra', aliases: ['peste bubonica', 'peste'] },
  { id: 'e-h-industrial', category: 'historia', prompt: '🏭 🚂 ⚙️ 💨 🇬🇧 (século 18)', answer: 'Revolução Industrial', aliases: ['revolucao industrial'] },
  { id: 'e-h-familia-real', category: 'historia', prompt: '👑 🇵🇹 ⛵ 🌊 🇧🇷 (1808)', answer: 'Chegada da Família Real', aliases: ['chegada da familia real', 'familia real', 'vinda da familia real', 'familia real portuguesa'] },
  { id: 'e-h-republica', category: 'historia', prompt: '🎖️ 🐴 👑 ❌ 🇧🇷 (15 de novembro de 1889)', answer: 'Proclamação da República', aliases: ['proclamacao da republica', 'republica'] },
  { id: 'e-h-diretas', category: 'historia', prompt: '🗳️ 📣 🟨 👥 🇧🇷 (1984)', answer: 'Diretas Já', aliases: ['diretas ja', 'diretas'] },
  { id: 'e-h-gengis', category: 'historia', prompt: '🐎 🏹 🛡️ 🌏 👑 (império mongol)', answer: 'Gengis Khan', aliases: ['genghis khan', 'gengis'] },
];

// ---------- Linha do Tempo: anime (anos de estreia no Japão) ----------
const e = (id: string, category: ContentCategory, year: number, text: string): TimelineEvent => ({ id, category, year, text });

export const TIMELINE_R11: TimelineEvent[] = [
  e('t-a-astro-boy', 'anime', 1963, 'Estreia o anime de Astro Boy, um dos primeiros da TV japonesa'),
  e('t-a-doraemon-manga', 'anime', 1969, 'Começa o mangá de Doraemon'),
  e('t-a-db-manga', 'anime', 1984, 'Começa o mangá de Dragon Ball, de Akira Toriyama'),
  e('t-a-ghibli', 'anime', 1985, 'É fundado o Studio Ghibli'),
  e('t-a-db-anime', 'anime', 1986, 'Estreia no Japão o anime de Dragon Ball'),
  e('t-a-akira', 'anime', 1988, 'Estreia o filme Akira'),
  e('t-a-dbz', 'anime', 1989, 'Estreia no Japão Dragon Ball Z'),
  e('t-a-sailor', 'anime', 1992, 'Estreia no Japão o anime de Sailor Moon'),
  e('t-a-cdz-brasil', 'anime', 1994, 'Os Cavaleiros do Zodíaco estreiam no Brasil, na TV Manchete'),
  e('t-a-evangelion', 'anime', 1995, 'Estreia Neon Genesis Evangelion'),
  e('t-a-pokemon-jogo', 'anime', 1996, 'Pokémon Red e Green são lançados no Japão'),
  e('t-a-pokemon-anime', 'anime', 1997, 'Estreia no Japão o anime de Pokémon'),
  e('t-a-op-manga', 'anime', 1997, 'Começa o mangá de One Piece'),
  e('t-a-op-anime', 'anime', 1999, 'Estreia no Japão o anime de One Piece'),
  e('t-a-chihiro', 'anime', 2001, 'Estreia A Viagem de Chihiro, do Studio Ghibli'),
  e('t-a-naruto', 'anime', 2002, 'Estreia no Japão o anime de Naruto'),
  e('t-a-bleach', 'anime', 2004, 'Estreia no Japão o anime de Bleach'),
  e('t-a-death-note', 'anime', 2006, 'Estreia o anime de Death Note'),
  e('t-a-shippuden', 'anime', 2007, 'Estreia Naruto Shippuden'),
  e('t-a-fma', 'anime', 2009, 'Estreia Fullmetal Alchemist: Brotherhood'),
  e('t-a-hxh', 'anime', 2011, 'Estreia a versão mais famosa do anime de Hunter x Hunter'),
  e('t-a-aot', 'anime', 2013, 'Estreia o anime de Attack on Titan'),
  e('t-a-dbs', 'anime', 2015, 'Estreia Dragon Ball Super'),
  e('t-a-mha', 'anime', 2016, 'Estreia o anime de My Hero Academia'),
  e('t-a-demon-slayer', 'anime', 2019, 'Estreia o anime de Demon Slayer'),
  e('t-a-jjk', 'anime', 2020, 'Estreia o anime de Jujutsu Kaisen'),
  e('t-a-chainsaw', 'anime', 2022, 'Estreia o anime de Chainsaw Man'),
  e('t-a-frieren', 'anime', 2023, 'Estreia o anime de Frieren'),
  e('t-a-solo-leveling', 'anime', 2024, 'Estreia o anime de Solo Leveling'),
];

// ---------- Intruso: história e anime ----------
export const INTRUSO_R11: IntrusoSet[] = [
  { id: 'in-h2-republica-velha', category: 'historia', members: ['Deodoro da Fonseca', 'Floriano Peixoto', 'Prudente de Morais', 'Campos Sales'], intruder: 'Juscelino Kubitschek', reason: 'Os outros quatro governaram na República Velha (1889 a 1930). JK foi presidente de 1956 a 1961.' },
  { id: 'in-h2-deuses-gregos', category: 'historia', members: ['Zeus', 'Atena', 'Apolo', 'Poseidon'], intruder: 'Júpiter', reason: 'Os outros quatro são deuses gregos. Júpiter é o nome romano do Zeus.' },
  { id: 'in-h2-cidades-gregas', category: 'historia', members: ['Atenas', 'Esparta', 'Tebas', 'Corinto'], intruder: 'Cartago', reason: 'Os outros quatro eram cidades-estado da Grécia Antiga. Cartago ficava no norte da África, na atual Tunísia.' },
  { id: 'in-h2-militares', category: 'historia', members: ['Castelo Branco', 'Costa e Silva', 'Médici', 'Geisel'], intruder: 'Tancredo Neves', reason: 'Os outros quatro foram presidentes do regime militar (1964 a 1985). Tancredo foi eleito em 1985, mas morreu antes da posse.' },
  { id: 'in-h2-conflitos-brasil', category: 'historia', members: ['Guerra do Paraguai', 'Guerra de Canudos', 'Guerra do Contestado', 'Revolução Farroupilha'], intruder: 'Guerra do Vietnã', reason: 'Os outros quatro foram conflitos com o Brasil envolvido. A do Vietnã foi no Sudeste Asiático.' },
  { id: 'in-h2-seculo-18', category: 'historia', members: ['Revolução Francesa', 'Independência dos EUA', 'Inconfidência Mineira', 'Revolução Industrial'], intruder: 'Revolução Russa', reason: 'Os outros quatro começaram no século 18. A Revolução Russa foi em 1917.' },
  { id: 'in-h2-astronomia', category: 'historia', members: ['Galileu', 'Newton', 'Copérnico', 'Kepler'], intruder: 'Freud', reason: 'Os outros quatro mudaram a astronomia e a física entre os séculos 16 e 17. Freud criou a psicanálise, no fim do século 19.' },
  { id: 'in-h2-invencoes', category: 'historia', members: ['Máquina a vapor', 'Tear mecânico', 'Locomotiva', 'Telégrafo'], intruder: 'Internet', reason: 'Os outros quatro são invenções dos séculos 18 e 19, da Revolução Industrial. A internet é do fim do século 20.' },
  { id: 'in-a2-agua', category: 'anime', members: ['Squirtle', 'Psyduck', 'Magikarp', 'Totodile'], intruder: 'Pikachu', reason: 'Os outros quatro são Pokémon do tipo água. Pikachu é elétrico.' },
  { id: 'in-a2-hokages', category: 'anime', members: ['Hashirama', 'Minato', 'Tsunade', 'Kakashi'], intruder: 'Itachi', reason: 'Os outros quatro foram Hokage da Vila da Folha, em Naruto. Itachi nunca foi.' },
  { id: 'in-a2-akatsuki', category: 'anime', members: ['Itachi', 'Kisame', 'Deidara', 'Pain'], intruder: 'Gaara', reason: 'Os outros quatro foram da Akatsuki. Gaara virou o Kazekage da Vila da Areia.' },
  { id: 'in-a2-viloes-dbz', category: 'anime', members: ['Freeza', 'Cell', 'Majin Boo', 'Raditz'], intruder: 'Kuririn', reason: 'Os outros quatro foram vilões de Dragon Ball Z. Kuririn é amigo do Goku desde criança.' },
  { id: 'in-a2-demon-slayer', category: 'anime', members: ['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke'], intruder: 'Edward Elric', reason: 'Os outros quatro são de Demon Slayer. Edward Elric é de Fullmetal Alchemist.' },
  { id: 'in-a2-aot', category: 'anime', members: ['Eren', 'Mikasa', 'Armin', 'Levi'], intruder: 'Light', reason: 'Os outros quatro são de Attack on Titan. Light é de Death Note.' },
  { id: 'in-a2-ouro', category: 'anime', members: ['Mu', 'Aldebaran', 'Shaka', 'Camus'], intruder: 'Seiya', reason: 'Os outros quatro são Cavaleiros de Ouro. Seiya é Cavaleiro de Bronze (Pégaso).' },
  { id: 'in-a2-mha', category: 'anime', members: ['Deku', 'Bakugo', 'Todoroki', 'All Might'], intruder: 'Saitama', reason: 'Os outros quatro são de My Hero Academia. Saitama é de One Punch Man.' },
];

// ---------- Conexões: história e anime ----------
export const CONEXOES_R11: ConexoesPuzzle[] = [
  {
    id: 'cx-h2-brasil',
    category: 'historia',
    groups: [
      { label: 'Presidentes do regime militar', items: ['Castelo Branco', 'Costa e Silva', 'Médici', 'Geisel'] },
      { label: 'Abolicionistas', items: ['Joaquim Nabuco', 'José do Patrocínio', 'André Rebouças', 'Luís Gama'] },
      { label: 'Revoltas do Período Regencial', items: ['Cabanagem', 'Sabinada', 'Balaiada', 'Farroupilha'] },
      { label: 'Bandeirantes', items: ['Borba Gato', 'Fernão Dias', 'Raposo Tavares', 'Anhanguera'] },
    ],
  },
  {
    id: 'cx-h2-antiguidade',
    category: 'historia',
    groups: [
      { label: 'Filósofos gregos', items: ['Sócrates', 'Platão', 'Aristóteles', 'Diógenes'] },
      { label: 'Imperadores romanos', items: ['Augusto', 'Nero', 'Calígula', 'Trajano'] },
      { label: 'Faraós do Egito', items: ['Tutancâmon', 'Ramsés II', 'Quéops', 'Akhenaton'] },
      { label: 'Deuses gregos', items: ['Zeus', 'Atena', 'Apolo', 'Hermes'] },
    ],
  },
  {
    id: 'cx-h2-mundo',
    category: 'historia',
    groups: [
      { label: 'Líderes dos Aliados na 2ª Guerra', items: ['Churchill', 'Roosevelt', 'Stalin', 'De Gaulle'] },
      { label: 'Navegadores portugueses', items: ['Vasco da Gama', 'Cabral', 'Bartolomeu Dias', 'Fernão de Magalhães'] },
      { label: 'Cientistas', items: ['Galileu', 'Newton', 'Darwin', 'Einstein'] },
      { label: 'Inventores', items: ['Graham Bell', 'Edison', 'Santos Dumont', 'Gutenberg'] },
    ],
  },
  {
    id: 'cx-a2-shonen',
    category: 'anime',
    groups: [
      { label: 'Time 7 de Naruto', items: ['Naruto', 'Sasuke', 'Sakura', 'Kakashi'] },
      { label: 'Tripulação do Chapéu de Palha', items: ['Luffy', 'Zoro', 'Nami', 'Sanji'] },
      { label: 'Saiyajins', items: ['Goku', 'Vegeta', 'Gohan', 'Trunks'] },
      { label: 'Caçadores de onis de Demon Slayer', items: ['Tanjiro', 'Zenitsu', 'Inosuke', 'Giyu'] },
    ],
  },
  {
    id: 'cx-a2-pokemon',
    category: 'anime',
    groups: [
      { label: 'Pokémon de fogo', items: ['Charmander', 'Vulpix', 'Growlithe', 'Ponyta'] },
      { label: 'Pokémon de água', items: ['Squirtle', 'Psyduck', 'Magikarp', 'Lapras'] },
      { label: 'Pokémon elétricos', items: ['Pikachu', 'Voltorb', 'Jolteon', 'Magnemite'] },
      { label: 'Pokémon de planta', items: ['Bulbasaur', 'Oddish', 'Bellsprout', 'Chikorita'] },
    ],
  },
  {
    id: 'cx-a2-classicos',
    category: 'anime',
    groups: [
      { label: 'Cavaleiros de Bronze', items: ['Seiya', 'Shiryu', 'Hyoga', 'Shun'] },
      { label: 'Cavaleiros de Ouro', items: ['Mu', 'Aldebaran', 'Shaka', 'Milo'] },
      { label: 'Vilões de Dragon Ball Z', items: ['Freeza', 'Cell', 'Majin Boo', 'Raditz'] },
      { label: 'Personagens de Death Note', items: ['Light', 'L', 'Ryuk', 'Misa'] },
    ],
  },
];

// ---------- Sobrevivente: história e anime ----------
const one = (xs: string[]): Array<[string]> => xs.map((x) => [x]);

export const SURVIVOR_R11: SurvivorList[] = [
  {
    id: 's-h2-militares', category: 'historia', level: 2, title: 'os 5 presidentes do regime militar (1964 a 1985)',
    items: [['Castelo Branco', 'castello branco'], ['Costa e Silva'], ['Médici', 'medici', 'emilio medici'], ['Geisel', 'ernesto geisel'], ['Figueiredo', 'joao figueiredo']],
  },
  {
    id: 's-h2-novas-maravilhas', category: 'historia', level: 1, title: 'as 7 novas maravilhas do mundo (eleição de 2007)',
    items: [
      ['Cristo Redentor', 'cristo'], ['Machu Picchu'], ['Coliseu', 'coliseu de roma'], ['Taj Mahal'],
      ['Chichén Itzá', 'chichen itza'], ['Petra'], ['Muralha da China', 'grande muralha', 'grande muralha da china'],
    ],
  },
  {
    id: 's-h2-republica-velha', category: 'historia', level: 3, title: 'os presidentes da República Velha (1889 a 1930)',
    items: [
      ['Deodoro da Fonseca', 'deodoro', 'marechal deodoro'], ['Floriano Peixoto', 'floriano'], ['Prudente de Morais', 'prudente'],
      ['Campos Sales'], ['Rodrigues Alves'], ['Afonso Pena'], ['Nilo Peçanha', 'nilo pecanha'], ['Hermes da Fonseca', 'hermes'],
      ['Venceslau Brás', 'venceslau bras', 'wenceslau braz'], ['Delfim Moreira'], ['Epitácio Pessoa', 'epitacio pessoa'],
      ['Artur Bernardes', 'arthur bernardes'], ['Washington Luís', 'washington luis'],
    ],
  },
  {
    id: 's-h2-olimpo', category: 'historia', level: 2, title: 'os deuses do Olimpo, na mitologia grega',
    items: one(['Zeus', 'Hera', 'Poseidon', 'Deméter', 'Atena', 'Apolo', 'Ártemis', 'Ares', 'Afrodite', 'Hefesto', 'Hermes', 'Héstia', 'Dionísio']).map(
      ([x]) => [x, x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()] as [string, string],
    ),
  },
  {
    id: 's-h2-mercosul', category: 'historia', level: 1, title: 'os 4 países que fundaram o Mercosul, em 1991',
    items: one(['Brasil', 'Argentina', 'Uruguai', 'Paraguai']),
  },
  {
    id: 's-a2-hokages', category: 'anime', level: 2, title: 'os 7 Hokage da Vila da Folha, em Naruto',
    items: [['Hashirama', 'hashirama senju'], ['Tobirama', 'tobirama senju'], ['Hiruzen', 'hiruzen sarutobi', 'sarutobi'], ['Minato', 'minato namikaze'], ['Tsunade'], ['Kakashi', 'kakashi hatake'], ['Naruto', 'naruto uzumaki']],
  },
  {
    id: 's-a2-iniciais-kanto', category: 'anime', level: 1, title: 'os Pokémon iniciais de Kanto e as suas evoluções',
    items: one(['Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon', 'Charizard', 'Squirtle', 'Wartortle', 'Blastoise']),
  },
  {
    id: 's-a2-regioes', category: 'anime', level: 2, title: 'as regiões dos jogos principais de Pokémon (de Kanto a Paldea)',
    items: [['Kanto'], ['Johto'], ['Hoenn'], ['Sinnoh'], ['Unova', 'isshu'], ['Kalos'], ['Alola'], ['Galar'], ['Paldea']],
  },
  {
    id: 's-a2-sagas-dbz', category: 'anime', level: 1, title: 'as 4 grandes sagas de Dragon Ball Z',
    items: [['Saiyajins', 'saga dos saiyajins', 'saiyajin'], ['Freeza', 'saga de freeza', 'frieza'], ['Cell', 'saga de cell', 'androides', 'saga dos androides'], ['Majin Boo', 'saga de majin boo', 'boo', 'buu']],
  },
];

// ---------- Chute Certo: anime e temporada 2025/26 ----------
export const CHUTE_R11: ChuteQuestion[] = [
  { id: 'c-a2-naruto', category: 'anime', prompt: 'Quantos episódios tem Naruto (a primeira série, sem o Shippuden)?', answer: 220, unit: 'episódios' },
  { id: 'c-a2-shippuden', category: 'anime', prompt: 'Quantos episódios tem Naruto Shippuden?', answer: 500, unit: 'episódios' },
  { id: 'c-a2-dbz', category: 'anime', prompt: 'Quantos episódios tem Dragon Ball Z?', answer: 291, unit: 'episódios' },
  { id: 'c-a2-db', category: 'anime', prompt: 'Quantos episódios tem o Dragon Ball clássico (antes do Z)?', answer: 153, unit: 'episódios' },
  { id: 'c-a2-gt', category: 'anime', prompt: 'Quantos episódios tem Dragon Ball GT?', answer: 64, unit: 'episódios' },
  { id: 'c-a2-death-note', category: 'anime', prompt: 'Quantos episódios tem o anime de Death Note?', answer: 37, unit: 'episódios' },
  { id: 'c-a2-fmab', category: 'anime', prompt: 'Quantos episódios tem Fullmetal Alchemist: Brotherhood?', answer: 64, unit: 'episódios' },
  { id: 'c-a2-evangelion', category: 'anime', prompt: 'Quantos episódios tem a série de TV de Neon Genesis Evangelion?', answer: 26, unit: 'episódios' },
  { id: 'c-a2-pokedex', category: 'anime', prompt: 'Quantos Pokémon existiam até a 9ª geração (Scarlet e Violet, com as expansões)?', answer: 1025, unit: 'Pokémon' },
  { id: 'c-a2-hokage', category: 'anime', prompt: 'Naruto vira Hokage. De que número ele é na lista dos Hokage?', answer: 7, unit: 'º Hokage' },
  { id: 'c-2026-kane', category: 'futebol', prompt: 'Quantos gols Harry Kane fez na Bundesliga 2025/26?', answer: 36, unit: 'gols' },
  { id: 'c-2026-haaland', category: 'futebol', prompt: 'Quantos gols Haaland fez na Premier League 2025/26?', answer: 27, unit: 'gols' },
  { id: 'c-2026-mbappe-ucl', category: 'futebol', prompt: 'Quantos gols Mbappé fez na Champions League 2025/26?', answer: 15, unit: 'gols' },
  { id: 'c-2026-mbappe-liga', category: 'futebol', prompt: 'Quantos gols Mbappé fez no Campeonato Espanhol 2025/26?', answer: 25, unit: 'gols' },
  { id: 'c-2026-espanha-sofreu', category: 'futebol', prompt: 'Quantos gols a Espanha sofreu na Copa do Mundo de 2026 inteira?', answer: 1, unit: 'gol' },
  { id: 'c-2026-igor-thiago', category: 'futebol', prompt: 'Quantos gols o brasileiro Igor Thiago, do Brentford, fez na Premier League 2025/26?', answer: 22, unit: 'gols' },
  { id: 'c-2026-barca-titulos', category: 'futebol', prompt: 'Quantos títulos espanhóis o Barcelona tinha depois da temporada 2025/26?', answer: 29, unit: 'títulos' },
  { id: 'c-2026-noruega-ouros', category: 'geral', prompt: 'Quantas medalhas de ouro a Noruega ganhou nos Jogos de Inverno de Milão-Cortina 2026?', answer: 18, unit: 'ouros' },
];

// ---------- Fato ou Fake: temporada 2025/26 ----------
const f = (id: string, category: ContentCategory, fact: boolean, text: string, why: string): FactCard => ({ id, category, fact, text, why });

export const FACTS_R11: FactCard[] = [
  f('ff-r11-rodri', 'futebol', true, 'Rodri foi eleito o melhor jogador da Copa de 2026.', 'Ganhou a Bola de Ouro da Copa, com a Espanha campeã. O melhor goleiro foi Unai Simón.'),
  f('ff-r11-espanha-1-gol', 'futebol', true, 'A Espanha sofreu só 1 gol na Copa de 2026 inteira.', 'Defesa quase perfeita. Na final, 1 a 0 na Argentina, na prorrogação.'),
  f('ff-r11-franca-3', 'futebol', false, 'A França ficou em 3º lugar na Copa de 2026.', 'A Inglaterra ficou em 3º; a França, em 4º.'),
  f('ff-r11-fair-play', 'futebol', true, 'A Holanda ganhou o prêmio Fair Play da Copa de 2026.', 'É o prêmio da seleção mais disciplinada do torneio.'),
  f('ff-r11-kane-36', 'futebol', true, 'Harry Kane fez 36 gols na Bundesliga 2025/26.', 'Foi o artilheiro com folga: o 2º, Deniz Undav, do Stuttgart, fez 19.'),
  f('ff-r11-haaland', 'futebol', true, 'Haaland foi o artilheiro da Premier League 2025/26.', 'Fez 27 gols: a terceira Chuteira de Ouro da Premier dele em quatro temporadas.'),
  f('ff-r11-lautaro', 'futebol', true, 'Lautaro Martínez foi o artilheiro do Italiano 2025/26, e a Inter foi campeã.', 'Fez 17 gols. Foi o 21º título italiano da Inter.'),
  f('ff-r11-lepaul', 'futebol', false, 'Mbappé foi o artilheiro do Campeonato Francês 2025/26.', 'Mbappé joga na Espanha. O artilheiro da Ligue 1 foi Esteban Lepaul, do Rennes, com 21 gols.'),
  f('ff-r11-mbappe-liga', 'futebol', true, 'Mbappé foi o artilheiro do Espanhol 2025/26, mas o campeão foi o Barcelona.', 'Fez 25 gols pelo Real Madrid. O Barça ganhou o seu 29º título.'),
  f('ff-r11-igor-thiago', 'futebol', true, 'Um brasileiro foi o vice-artilheiro da Premier League 2025/26.', 'Igor Thiago, do Brentford, fez 22 gols. Só Haaland (27) fez mais.'),
  f('ff-r11-ucl-artilheiro', 'futebol', false, 'Harry Kane foi o artilheiro da Champions 2025/26.', 'Ficou em 2º, com 14. O artilheiro foi Mbappé, com 15.'),
  f('ff-r11-noruega', 'geral', true, 'A Noruega ficou em 1º no quadro de medalhas de Milão-Cortina 2026.', 'Foram 18 ouros, 12 pratas e 11 bronzes. Os EUA ficaram em 2º.'),
  f('ff-r11-italia', 'geral', true, 'A Itália, dona da casa, ganhou 10 ouros em Milão-Cortina 2026.', 'Ficou em 4º no quadro, com 10 ouros, 6 pratas e 14 bronzes.'),
  f('ff-r11-zootopia', 'geral', false, '"Zootopia 2" foi a maior bilheteria do cinema mundial em 2025.', 'Foi a 2ª. A maior foi a animação chinesa "Ne Zha 2", com mais de 2 bilhões de dólares.'),
  f('ff-r11-demon-slayer', 'anime', true, 'Um filme de anime ficou entre as 10 maiores bilheterias do mundo em 2025.', '"Demon Slayer: Castelo Infinito" foi o 7º, com perto de 800 milhões de dólares.'),
];

// ---------- Quiz Relâmpago: temporada 2025/26 ----------
export const RELAMPAGO_R11: Card[] = [
  { id: 'r-r11-kane', category: 'futebol', prompt: 'Quem foi o artilheiro da Bundesliga 2025/26, com 36 gols?', answer: 'Harry Kane', aliases: ['kane'] },
  { id: 'r-r11-haaland', category: 'futebol', prompt: 'Quem foi o artilheiro da Premier League 2025/26?', answer: 'Erling Haaland', aliases: ['haaland'] },
  { id: 'r-r11-lautaro', category: 'futebol', prompt: 'Quem foi o artilheiro do Campeonato Italiano 2025/26?', answer: 'Lautaro Martínez', aliases: ['lautaro', 'lautaro martinez'] },
  { id: 'r-r11-lepaul', category: 'futebol', prompt: 'Qual atacante do Rennes foi o artilheiro da Ligue 1 2025/26?', answer: 'Esteban Lepaul', aliases: ['lepaul'] },
  { id: 'r-r11-mbappe-liga', category: 'futebol', prompt: 'Quem foi o artilheiro do Campeonato Espanhol 2025/26?', answer: 'Kylian Mbappé', aliases: ['mbappe', 'kylian mbappe'] },
  { id: 'r-r11-mbappe-ucl', category: 'futebol', prompt: 'Quem foi o artilheiro da Champions League 2025/26, com 15 gols?', answer: 'Kylian Mbappé', aliases: ['mbappe', 'kylian mbappe'] },
  { id: 'r-r11-premier', category: 'futebol', prompt: 'Qual clube foi campeão inglês em 2025/26?', answer: 'Arsenal' },
  { id: 'r-r11-laliga', category: 'futebol', prompt: 'Qual clube foi campeão espanhol em 2025/26?', answer: 'Barcelona', aliases: ['barca', 'fc barcelona'] },
  { id: 'r-r11-bundesliga', category: 'futebol', prompt: 'Qual clube foi campeão alemão em 2025/26?', answer: 'Bayern de Munique', aliases: ['bayern', 'bayern munique', 'bayern munich'] },
  { id: 'r-r11-ligue1', category: 'futebol', prompt: 'Qual clube foi campeão francês em 2025/26?', answer: 'PSG', aliases: ['paris saint germain', 'paris'] },
  { id: 'r-r11-igor-thiago', category: 'futebol', prompt: 'Qual atacante brasileiro do Brentford foi o vice-artilheiro da Premier League 2025/26?', answer: 'Igor Thiago' },
  { id: 'r-r11-fair-play', category: 'futebol', prompt: 'Qual seleção ganhou o prêmio Fair Play da Copa de 2026?', answer: 'Holanda', aliases: ['paises baixos', 'holanda'] },
  { id: 'r-r11-noruega', category: 'geral', prompt: 'Que país terminou em 1º no quadro de medalhas dos Jogos de Inverno de Milão-Cortina 2026?', answer: 'Noruega' },
  { id: 'r-r11-ne-zha', category: 'geral', prompt: 'Qual animação chinesa foi a maior bilheteria do cinema mundial em 2025?', answer: 'Ne Zha 2', aliases: ['ne zha', 'nezha 2', 'nezha'] },
  { id: 'r-r11-demon-slayer', category: 'anime', prompt: 'Qual filme de anime ficou entre as 10 maiores bilheterias do mundo em 2025?', answer: 'Demon Slayer: Castelo Infinito', aliases: ['demon slayer', 'castelo infinito', 'kimetsu no yaiba', 'demon slayer castelo infinito'] },
];

// ---------- Top 10 ----------
const it = (rank: number, name: string, detail?: string, aliases?: string[]): Top10Item => ({
  rank, name, ...(detail ? { detail } : {}), ...(aliases ? { aliases } : {}),
});
const seq = (...items: Array<[string, string?, string[]?]>): Top10Item[] =>
  items.map(([name, detail, aliases], i) => it(i + 1, name, detail, aliases));

export const TOP10_R11: Top10List[] = [
  // ---------- Futebol: artilheiros da temporada 2025/26 ----------
  {
    id: 'artilheiros-premier-2026', category: 'futebol',
    title: 'Artilheiros da Premier League 2025/26',
    source: 'Premier League, via Wikipédia (temporada encerrada em maio de 2026)',
    items: [
      it(1, 'Erling Haaland', '27 gols · Manchester City', ['haaland']),
      it(2, 'Igor Thiago', '22 gols · Brentford'),
      it(3, 'Antoine Semenyo', '17 gols · Bournemouth/Manchester City', ['semenyo']),
      it(4, 'Ollie Watkins', '16 gols · Aston Villa', ['watkins']),
      it(5, 'Morgan Gibbs-White', '15 gols · Nottingham Forest', ['gibbs white', 'gibbs-white']),
      it(5, 'João Pedro', '15 gols · Chelsea', ['joao pedro']),
      it(7, 'Dominic Calvert-Lewin', '14 gols · Leeds', ['calvert lewin', 'calvert-lewin']),
      it(7, 'Viktor Gyökeres', '14 gols · Arsenal', ['gyokeres']),
      it(9, 'Eli Junior Kroupi', '13 gols · Bournemouth', ['kroupi']),
      it(9, 'Danny Welbeck', '13 gols · Brighton', ['welbeck']),
    ],
  },
  {
    id: 'artilheiros-laliga-2026', category: 'futebol',
    title: 'Artilheiros do Campeonato Espanhol 2025/26',
    source: 'LaLiga, via Wikipédia (temporada encerrada em maio de 2026)',
    items: [
      it(1, 'Kylian Mbappé', '25 gols · Real Madrid', ['mbappe']),
      it(2, 'Vedat Muriqi', '23 gols · Mallorca', ['muriqi']),
      it(3, 'Ante Budimir', '17 gols · Osasuna', ['budimir']),
      it(4, 'Ferran Torres', '16 gols · Barcelona', ['ferran']),
      it(4, 'Vinícius Júnior', '16 gols · Real Madrid', ['vinicius', 'vini jr', 'vinicius junior']),
      it(4, 'Lamine Yamal', '16 gols · Barcelona', ['yamal', 'lamine']),
      it(7, 'Mikel Oyarzabal', '15 gols · Real Sociedad', ['oyarzabal']),
      it(8, 'Borja Iglesias', '14 gols · Celta', ['borja']),
      it(8, 'Robert Lewandowski', '14 gols · Barcelona', ['lewandowski']),
      it(8, 'Toni Martínez', '14 gols · Alavés', ['toni martinez']),
    ],
  },
  {
    id: 'artilheiros-italiano-2026', category: 'futebol',
    title: 'Os 7 maiores artilheiros do Italiano 2025/26',
    source: 'Lega Serie A, via Wikipédia (depois do 7º, sete empatados com 10 gols)',
    items: [
      it(1, 'Lautaro Martínez', '17 gols · Inter', ['lautaro']),
      it(2, 'Anastasios Douvikas', '14 gols · Como', ['douvikas']),
      it(2, 'Donyell Malen', '14 gols · Roma', ['malen']),
      it(4, 'Marcus Thuram', '13 gols · Inter', ['thuram']),
      it(5, 'Rasmus Højlund', '12 gols · Napoli', ['hojlund', 'rasmus hojlund']),
      it(5, 'Nico Paz', '12 gols · Como', ['paz']),
      it(7, 'Giovanni Simeone', '11 gols · Torino', ['simeone', 'gio simeone']),
    ],
  },
  {
    id: 'artilheiros-bundesliga-2026', category: 'futebol',
    title: 'Os 7 maiores artilheiros da Bundesliga 2025/26',
    source: 'DFL, via Wikipédia (temporada encerrada em maio de 2026)',
    items: [
      it(1, 'Harry Kane', '36 gols · Bayern', ['kane']),
      it(2, 'Deniz Undav', '19 gols · Stuttgart', ['undav']),
      it(3, 'Serhou Guirassy', '17 gols · Borussia Dortmund', ['guirassy']),
      it(4, 'Patrik Schick', '16 gols · Leverkusen', ['schick']),
      it(5, 'Luis Díaz', '15 gols · Bayern', ['luis diaz', 'lucho diaz']),
      it(5, 'Michael Olise', '15 gols · Bayern', ['olise']),
      it(7, 'Andrej Kramarić', '14 gols · Hoffenheim', ['kramaric']),
    ],
  },
  {
    id: 'artilheiros-ligue1-2026', category: 'futebol',
    title: 'Os 7 maiores artilheiros da Ligue 1 2025/26',
    source: 'LFP, via Wikipédia (temporada encerrada em maio de 2026)',
    items: [
      it(1, 'Esteban Lepaul', '21 gols · Angers/Rennes', ['lepaul']),
      it(2, 'Mason Greenwood', '16 gols · Olympique de Marseille', ['greenwood']),
      it(2, 'Joaquín Panichelli', '16 gols · Strasbourg', ['panichelli']),
      it(4, 'Folarin Balogun', '13 gols · Monaco', ['balogun']),
      it(5, 'Odsonne Édouard', '12 gols · Lens', ['edouard']),
      it(5, 'Wesley Saïd', '12 gols · Lens', ['wesley said', 'said']),
      it(5, 'Lassine Sinayoko', '12 gols · Auxerre', ['sinayoko']),
    ],
  },
  {
    id: 'artilheiros-ucl-2026', category: 'futebol',
    title: 'Artilheiros da Champions League 2025/26',
    source: 'UEFA, via Wikipédia (depois do 9º, sete empatados com 6 gols)',
    items: [
      it(1, 'Kylian Mbappé', '15 gols · Real Madrid', ['mbappe']),
      it(2, 'Harry Kane', '14 gols · Bayern', ['kane']),
      it(3, 'Anthony Gordon', '10 gols · Newcastle', ['gordon']),
      it(3, 'Khvicha Kvaratskhelia', '10 gols · PSG', ['kvaratskhelia', 'kvara']),
      it(3, 'Julián Alvarez', '10 gols · Atlético de Madrid', ['julian alvarez', 'alvarez']),
      it(6, 'Erling Haaland', '8 gols · Manchester City', ['haaland']),
      it(6, 'Ousmane Dembélé', '8 gols · PSG', ['dembele']),
      it(8, 'Victor Osimhen', '7 gols · Galatasaray', ['osimhen']),
      it(8, 'Luis Díaz', '7 gols · Bayern', ['luis diaz', 'lucho diaz']),
    ],
  },
  // ---------- Gerais ----------
  {
    id: 'inverno-2026-quadro', category: 'geral',
    title: 'Quadro de medalhas de Milão-Cortina 2026 (os 10 primeiros)',
    source: 'COI, via Wikipédia (ordem: ouro, prata, bronze)',
    items: seq(
      ['Noruega', '18 ouros'],
      ['Estados Unidos', '12 ouros', ['eua', 'usa']],
      ['Holanda', '10 ouros', ['paises baixos']],
      ['Itália', '10 ouros', ['italia']],
      ['Alemanha', '8 ouros'],
      ['França', '8 ouros', ['franca']],
      ['Suécia', '8 ouros', ['suecia']],
      ['Suíça', '6 ouros', ['suica']],
      ['Áustria', '5 ouros', ['austria']],
      ['Japão', '5 ouros', ['japao']],
    ),
  },
  {
    id: 'bilheterias-2025', category: 'geral',
    title: 'As 10 maiores bilheterias do cinema mundial em 2025',
    source: 'Box Office Mojo / The Numbers, via Wikipédia ("2025 in film")',
    items: seq(
      ['Ne Zha 2', 'China', ['ne zha', 'nezha 2']],
      ['Zootopia 2', 'Disney', ['zootopia']],
      ['Avatar: Fogo e Cinzas', '20th Century', ['avatar', 'avatar 3', 'avatar fogo e cinzas', 'fogo e cinzas']],
      ['Lilo & Stitch', 'Disney (live-action)', ['lilo e stitch', 'lilo stitch', 'stitch']],
      ['Um Filme Minecraft', 'Warner', ['minecraft', 'filme minecraft']],
      ['Jurassic World: Recomeço', 'Universal', ['jurassic world', 'jurassic world recomeco', 'recomeco']],
      ['Demon Slayer: Castelo Infinito', 'anime', ['demon slayer', 'castelo infinito', 'kimetsu no yaiba']],
      ['Como Treinar o Seu Dragão', 'Universal (live-action)', ['como treinar o seu dragao', 'como treinar seu dragao']],
      ['F1: O Filme', 'Warner/Apple', ['f1', 'f1 o filme']],
      ['Superman', 'Warner'],
    ),
  },
  {
    id: 'sedes-olimpiadas-1988-2024', category: 'geral',
    title: 'Sedes das Olimpíadas de verão, de 1988 a 2024, em ordem',
    source: 'COI (Tóquio 2020 foi disputada em 2021)',
    items: seq(
      ['Seul', '1988', ['seoul']],
      ['Barcelona', '1992'],
      ['Atlanta', '1996'],
      ['Sydney', '2000', ['sidney']],
      ['Atenas', '2004'],
      ['Pequim', '2008', ['beijing']],
      ['Londres', '2012'],
      ['Rio de Janeiro', '2016', ['rio']],
      ['Tóquio', '2020', ['toquio']],
      ['Paris', '2024'],
    ),
  },
  // ---------- História ----------
  {
    id: 'imperadores-romanos-10', category: 'historia',
    title: 'Os 10 primeiros imperadores romanos, em ordem',
    source: 'De Augusto (27 a.C.) a Tito (79 d.C.); 69 d.C. foi o "ano dos quatro imperadores"',
    items: seq(
      ['Augusto', '27 a.C.', ['otaviano', 'otaviano augusto']],
      ['Tibério', '14', ['tiberio']],
      ['Calígula', '37', ['caligula']],
      ['Cláudio', '41', ['claudio']],
      ['Nero', '54'],
      ['Galba', '68'],
      ['Otão', '69', ['otao', 'oto', 'otho']],
      ['Vitélio', '69', ['vitelio']],
      ['Vespasiano', '69'],
      ['Tito', '79'],
    ),
  },
  {
    id: 'presidentes-brasil-1-10', category: 'historia',
    title: 'Os 10 primeiros presidentes do Brasil, em ordem',
    source: 'Lista oficial da Presidência (Rodrigues Alves, eleito de novo em 1918, morreu antes da posse)',
    items: seq(
      ['Deodoro da Fonseca', '1889', ['deodoro', 'marechal deodoro']],
      ['Floriano Peixoto', '1891', ['floriano']],
      ['Prudente de Morais', '1894', ['prudente']],
      ['Campos Sales', '1898'],
      ['Rodrigues Alves', '1902'],
      ['Afonso Pena', '1906'],
      ['Nilo Peçanha', '1909', ['nilo pecanha']],
      ['Hermes da Fonseca', '1910', ['hermes']],
      ['Venceslau Brás', '1914', ['venceslau bras', 'wenceslau braz']],
      ['Delfim Moreira', '1918'],
    ),
  },
  {
    id: 'presidentes-eua-1-10', category: 'historia',
    title: 'Os 10 primeiros presidentes dos Estados Unidos, em ordem',
    source: 'Casa Branca (de 1789 a 1845)',
    items: seq(
      ['George Washington', '1789', ['washington']],
      ['John Adams', '1797'],
      ['Thomas Jefferson', '1801', ['jefferson']],
      ['James Madison', '1809', ['madison']],
      ['James Monroe', '1817', ['monroe']],
      ['John Quincy Adams', '1825', ['quincy adams']],
      ['Andrew Jackson', '1829', ['jackson']],
      ['Martin Van Buren', '1837', ['van buren']],
      ['William Henry Harrison', '1841', ['harrison', 'william harrison']],
      ['John Tyler', '1841', ['tyler']],
    ),
  },
  {
    id: 'papas-ate-2025', category: 'historia',
    title: 'Os 10 papas mais recentes (do atual para trás)',
    source: 'Santa Sé (Leão XIV foi eleito em maio de 2025)',
    items: seq(
      ['Leão XIV', '2025', ['leao xiv', 'leao 14', 'robert prevost', 'prevost']],
      ['Francisco', '2013', ['papa francisco', 'bergoglio']],
      ['Bento XVI', '2005', ['bento 16', 'ratzinger']],
      ['João Paulo II', '1978', ['joao paulo ii', 'joao paulo 2', 'joao paulo segundo']],
      ['João Paulo I', '1978', ['joao paulo i', 'joao paulo 1', 'joao paulo primeiro']],
      ['Paulo VI', '1963', ['paulo 6', 'paulo sexto']],
      ['João XXIII', '1958', ['joao xxiii', 'joao 23']],
      ['Pio XII', '1939', ['pio 12']],
      ['Pio XI', '1922', ['pio 11']],
      ['Bento XV', '1914', ['bento 15']],
    ),
  },
  {
    id: 'homens-na-lua', category: 'historia',
    title: 'Os 10 primeiros homens a pisar na Lua, em ordem',
    source: 'NASA (Apollo 11 a 16, de 1969 a 1972)',
    items: seq(
      ['Neil Armstrong', 'Apollo 11', ['armstrong']],
      ['Buzz Aldrin', 'Apollo 11', ['aldrin']],
      ['Pete Conrad', 'Apollo 12', ['conrad']],
      ['Alan Bean', 'Apollo 12', ['bean']],
      ['Alan Shepard', 'Apollo 14', ['shepard']],
      ['Edgar Mitchell', 'Apollo 14', ['mitchell']],
      ['David Scott', 'Apollo 15', ['scott']],
      ['James Irwin', 'Apollo 15', ['irwin']],
      ['John Young', 'Apollo 16', ['young']],
      ['Charles Duke', 'Apollo 16', ['duke']],
    ),
  },
  {
    id: 'monarcas-britanicos-vitoria', category: 'historia',
    title: 'Os monarcas britânicos desde a rainha Vitória, em ordem',
    source: 'Casa Real britânica (até 2026)',
    items: seq(
      ['Vitória', '1837', ['rainha vitoria', 'vitoria']],
      ['Eduardo VII', '1901', ['eduardo 7']],
      ['Jorge V', '1910', ['jorge 5', 'george v']],
      ['Eduardo VIII', '1936', ['eduardo 8']],
      ['Jorge VI', '1936', ['jorge 6', 'george vi']],
      ['Elizabeth II', '1952', ['elizabeth', 'rainha elizabeth', 'elizabeth 2']],
      ['Carlos III', '2022', ['charles', 'charles iii', 'carlos 3', 'rei charles']],
    ),
  },
  {
    id: 'esposas-henrique-viii', category: 'historia',
    title: 'As 6 esposas de Henrique VIII, em ordem',
    source: 'Casa Real britânica',
    items: seq(
      ['Catarina de Aragão', '1509', ['catarina de aragao']],
      ['Ana Bolena', '1533', ['anne boleyn', 'bolena']],
      ['Joana Seymour', '1536', ['jane seymour', 'seymour']],
      ['Ana de Cleves', '1540', ['anne of cleves', 'cleves']],
      ['Catarina Howard', '1540', ['catherine howard', 'howard']],
      ['Catarina Parr', '1543', ['catherine parr', 'parr']],
    ),
  },
  {
    id: 'sedes-olimpiadas-1948-1984', category: 'historia',
    title: 'Sedes das Olimpíadas de verão de 1948 a 1984, em ordem',
    source: 'COI (os Jogos voltaram em 1948, depois da 2ª Guerra)',
    items: seq(
      ['Londres', '1948'],
      ['Helsinque', '1952', ['helsinki']],
      ['Melbourne', '1956'],
      ['Roma', '1960'],
      ['Tóquio', '1964', ['toquio']],
      ['Cidade do México', '1968', ['mexico', 'cidade do mexico']],
      ['Munique', '1972'],
      ['Montreal', '1976'],
      ['Moscou', '1980'],
      ['Los Angeles', '1984'],
    ),
  },
  // ---------- Anime ----------
  {
    id: 'pokedex-1-10', category: 'anime',
    title: 'Os 10 primeiros Pokémon da Pokédex, em ordem',
    source: 'The Pokémon Company (Pokédex nacional)',
    items: seq(
      ['Bulbasaur', '#1'], ['Ivysaur', '#2'], ['Venusaur', '#3'], ['Charmander', '#4'], ['Charmeleon', '#5'],
      ['Charizard', '#6'], ['Squirtle', '#7'], ['Wartortle', '#8'], ['Blastoise', '#9'], ['Caterpie', '#10'],
    ),
  },
  {
    id: 'iniciais-johto', category: 'anime',
    title: 'Os iniciais de Johto e as suas evoluções, na ordem da Pokédex',
    source: 'The Pokémon Company (Pokédex nacional, do #152 ao #160)',
    items: seq(
      ['Chikorita', '#152'], ['Bayleef', '#153'], ['Meganium', '#154'], ['Cyndaquil', '#155'], ['Quilava', '#156'],
      ['Typhlosion', '#157'], ['Totodile', '#158'], ['Croconaw', '#159'], ['Feraligatr', '#160'],
    ),
  },
  {
    id: 'hokages', category: 'anime',
    title: 'Os Hokage da Vila da Folha, em ordem (Naruto)',
    source: 'Mangá de Naruto e Boruto',
    items: seq(
      ['Hashirama Senju', '1º', ['hashirama']],
      ['Tobirama Senju', '2º', ['tobirama']],
      ['Hiruzen Sarutobi', '3º', ['hiruzen', 'sarutobi']],
      ['Minato Namikaze', '4º', ['minato']],
      ['Tsunade', '5º'],
      ['Kakashi Hatake', '6º', ['kakashi']],
      ['Naruto Uzumaki', '7º', ['naruto']],
    ),
  },
  {
    id: 'regioes-pokemon', category: 'anime',
    title: 'As regiões dos jogos principais de Pokémon, em ordem de geração',
    source: 'The Pokémon Company (da 1ª à 9ª geração)',
    items: seq(['Kanto', '1ª'], ['Johto', '2ª'], ['Hoenn', '3ª'], ['Sinnoh', '4ª'], ['Unova', '5ª', ['isshu']], ['Kalos', '6ª'], ['Alola', '7ª'], ['Galar', '8ª'], ['Paldea', '9ª']),
  },
  {
    id: 'chapeu-palha-ordem', category: 'anime',
    title: 'Os tripulantes do Chapéu de Palha, na ordem em que entraram (sem o Luffy)',
    source: 'Mangá de One Piece (até 2025)',
    items: seq(['Zoro', '1º'], ['Nami', '2º'], ['Usopp', '3º'], ['Sanji', '4º'], ['Chopper', '5º'], ['Robin', '6º', ['nico robin']], ['Franky', '7º'], ['Brook', '8º'], ['Jinbe', '9º', ['jimbei']]),
  },
  {
    id: 'sagas-dbz', category: 'anime',
    title: 'As 4 grandes sagas de Dragon Ball Z, em ordem',
    source: 'Anime de Dragon Ball Z (1989 a 1996)',
    items: seq(
      ['Saga dos Saiyajins', '1ª', ['saiyajins', 'saiyajin']],
      ['Saga de Freeza', '2ª', ['freeza', 'frieza']],
      ['Saga de Cell', '3ª', ['cell', 'androides', 'saga dos androides']],
      ['Saga de Majin Boo', '4ª', ['majin boo', 'boo', 'buu']],
    ),
  },
];
