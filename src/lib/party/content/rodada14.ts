import type { ContentCategory } from '../../game/types';
import type { Card } from './cards';
import type { ConexoesPuzzle } from './conexoes';
import type { FactCard } from './fato';
import type { IntrusoSet } from './intruso';
import type { TimelineEvent } from './linha';
import type { WhoIsCard } from './whois';

/**
 * Rodada 14 (26/11/2026): o que de 2025/26 ainda faltava nos jogos.
 * Fontes (seção 31 do plano), conferidas em 26/11/2026 nas páginas da
 * Wikipédia em inglês, que citam UEFA, FIFA e CONMEBOL:
 * - 2026 FIFA World Cup final; 2026 UEFA Champions League final;
 *   2026 UEFA Europa League final; 2026 UEFA Conference League final;
 *   2025 Copa Libertadores final (placar, gols, escalações, estádio);
 * - caixas de informação de Enzo Fernández, Morgan Rogers, Elliot Anderson,
 *   Yan Diomande, Bradley Barcola, Bruno Guimarães e Ayyoub Bouaddi (clube
 *   desde 2026).
 * Nada de competição em andamento (Brasileirão 2026, final da Libertadores
 * 2026, Copa do Brasil 2026).
 */

// ---------- Quiz Relâmpago ----------
export const RELAMPAGO_R14: Card[] = [
  { id: 'r-r14-villa', category: 'futebol', prompt: 'Qual clube inglês ganhou a Liga Europa 2025/26, com 3 a 0 no Freiburg?', answer: 'Aston Villa', aliases: ['villa'] },
  { id: 'r-r14-istambul', category: 'futebol', prompt: 'Em que cidade foi a final da Liga Europa de 2026?', answer: 'Istambul', aliases: ['istanbul'] },
  { id: 'r-r14-mateta', category: 'futebol', prompt: 'Quem fez o gol do Crystal Palace na final da Conference League de 2026?', answer: 'Jean-Philippe Mateta', aliases: ['mateta'] },
  { id: 'r-r14-rayo', category: 'futebol', prompt: 'Contra quem o Crystal Palace ganhou a final da Conference League de 2026?', answer: 'Rayo Vallecano', aliases: ['rayo'] },
  { id: 'r-r14-havertz', category: 'futebol', prompt: 'Quem fez o gol do Arsenal, aos 6 minutos, na final da Champions de 2026?', answer: 'Kai Havertz', aliases: ['havertz'] },
  { id: 'r-r14-enzo-vermelho', category: 'futebol', prompt: 'Qual argentino foi expulso na final da Copa de 2026?', answer: 'Enzo Fernández', aliases: ['enzo', 'enzo fernandez'] },
  { id: 'r-r14-danilo', category: 'futebol', prompt: 'Qual zagueiro fez, de cabeça, o gol do título do Flamengo na Libertadores de 2025?', answer: 'Danilo', aliases: ['danilo luiz da silva'] },
  { id: 'r-r14-lima', category: 'futebol', prompt: 'Em que cidade foi a final da Libertadores de 2025, Flamengo x Palmeiras?', answer: 'Lima', aliases: [] },
  { id: 'r-r14-rogers', category: 'futebol', prompt: 'Qual meia inglês trocou o Aston Villa pelo Chelsea na janela de 2026?', answer: 'Morgan Rogers', aliases: ['rogers'] },
  { id: 'r-r14-bruno-g', category: 'futebol', prompt: 'Qual meia brasileiro trocou o Newcastle pelo Arsenal em 2026?', answer: 'Bruno Guimarães', aliases: ['bruno guimaraes'] },
  { id: 'r-r14-barcola', category: 'futebol', prompt: 'Qual atacante francês trocou o PSG pelo Liverpool em 2026?', answer: 'Bradley Barcola', aliases: ['barcola'] },
  { id: 'r-r14-diomande', category: 'futebol', prompt: 'Para qual clube o atacante Yan Diomande foi em 2026, saindo do RB Leipzig?', answer: 'Real Madrid', aliases: ['real'] },
];

// ---------- Fato ou Fake ----------
const f = (id: string, category: ContentCategory, fact: boolean, text: string, why: string): FactCard => ({ id, category, fact, text, why });

export const FACTS_R14: FactCard[] = [
  f('ff-r14-villa', 'futebol', true, 'O Aston Villa ganhou a Liga Europa 2025/26 com 3 a 0 no Freiburg.', 'Gols de Tielemans, Buendía e Morgan Rogers, em Istambul.'),
  f('ff-r14-palace-penaltis', 'futebol', false, 'O Crystal Palace ganhou a Conference League 2025/26 nos pênaltis.', 'Ganhou no tempo normal: 1 a 0 no Rayo Vallecano, gol de Mateta, em Leipzig.'),
  f('ff-r14-palace-1o', 'futebol', true, 'A Conference League de 2026 foi o primeiro título europeu da história do Crystal Palace.', 'Foi 1 a 0 no Rayo Vallecano, em 27 de maio de 2026.'),
  f('ff-r14-argentina-chutes', 'futebol', false, 'A Argentina chutou várias vezes ao gol nos 90 minutos da final da Copa de 2026.', 'Não chutou nenhuma vez: foi a primeira seleção a passar o tempo normal de uma final de Copa sem finalizar.'),
  f('ff-r14-enzo', 'futebol', true, 'Enzo Fernández foi expulso na final da Copa de 2026.', 'Levou o 2º amarelo numa entrada em Cubarsí, nos acréscimos do tempo normal.'),
  f('ff-r14-gabriel', 'futebol', true, 'O zagueiro brasileiro Gabriel Magalhães perdeu o último pênalti do Arsenal na final da Champions de 2026.', 'O PSG ganhou por 4 a 3 nos pênaltis, depois do 1 a 1 em Budapeste.'),
  f('ff-r14-bruno-g', 'futebol', true, 'Bruno Guimarães saiu do Newcastle para o Arsenal na janela de 2026.', 'Foi uma das maiores contratações do meio do ano na Premier League.'),
  f('ff-r14-barcola', 'futebol', false, 'Barcola trocou o PSG pelo Real Madrid em 2026.', 'Foi para o Liverpool. Quem chegou ao Real Madrid foi Yan Diomande, do RB Leipzig.'),
  f('ff-r14-danilo', 'futebol', true, 'O Flamengo ganhou a Libertadores de 2025 com um gol de cabeça do zagueiro Danilo.', '1 a 0 no Palmeiras, em Lima. Foi o 4º título do Flamengo.'),
  f('ff-r14-istambul', 'futebol', false, 'A final da Liga Europa de 2026 foi em Londres.', 'Foi em Istambul, no estádio do Beşiktaş.'),
];

// ---------- Emoji ----------
export const EMOJI_R14: Card[] = [
  { id: 'e-r14-villa', category: 'futebol', prompt: '🦁 🍷 🏆 🇹🇷 (Liga Europa 2026)', answer: 'Aston Villa', aliases: ['villa'] },
  { id: 'e-r14-palace', category: 'futebol', prompt: '🦅 🔴🔵 🏆 🇩🇪 (Conference League 2026)', answer: 'Crystal Palace', aliases: ['palace'] },
  { id: 'e-r14-flamengo', category: 'futebol', prompt: '🔴⚫ 🏆 🇵🇪 4️⃣ (Libertadores 2025)', answer: 'Flamengo', aliases: ['mengao', 'fla'] },
  { id: 'e-r14-haaland', category: 'futebol', prompt: '🇳🇴 🤖 ⚽⚽ 🇧🇷 ✈️ (Copa 2026)', answer: 'Haaland', aliases: ['erling haaland'] },
  { id: 'e-r14-espanha', category: 'futebol', prompt: '🇪🇸 🧱 1️⃣ 🏆 🌎 (só 1 gol sofrido na Copa 2026)', answer: 'Espanha', aliases: ['selecao espanhola'] },
  { id: 'e-r14-enzo', category: 'futebol', prompt: '🇦🇷 🔵 ➡️ 🩵 💸 (janela de 2026)', answer: 'Enzo Fernández', aliases: ['enzo', 'enzo fernandez'] },
  { id: 'e-r14-bruno-g', category: 'futebol', prompt: '🇧🇷 ⚫⚪ ➡️ 🔴 💣 (janela de 2026)', answer: 'Bruno Guimarães', aliases: ['bruno guimaraes'] },
  { id: 'e-r14-knicks', category: 'geral', prompt: '🗽 🏀 🏆 5️⃣3️⃣ (NBA 2026)', answer: 'New York Knicks', aliases: ['knicks'] },
  { id: 'e-r14-noruega', category: 'geral', prompt: '🇳🇴 ❄️ 🥇 1️⃣8️⃣ (Milão-Cortina 2026)', answer: 'Noruega', aliases: [] },
];

// ---------- Quem é? (fatos que não mudam com a temporada) ----------
export const WHOIS_R14: WhoIsCard[] = [
  {
    id: 'danilo-2025', answer: 'Danilo', aliases: ['danilo luiz da silva'],
    clues: [
      'Nasceu em Bicas, Minas Gerais, em 1991.',
      'Lateral-direito que virou zagueiro.',
      'Jogou no Porto, Real Madrid, Manchester City e Juventus.',
      'Fez gol em duas finais de Libertadores: pelo Santos, em 2011, e 14 anos depois.',
      'Fez de cabeça o gol do título do Flamengo na Libertadores de 2025, contra o Palmeiras.',
    ],
  },
  {
    id: 'tielemans', answer: 'Youri Tielemans', aliases: ['tielemans'],
    clues: [
      'Nasceu na Bélgica, em 1997.',
      'Meia revelado pelo Anderlecht.',
      'Passou pelo Monaco antes de ir para a Inglaterra.',
      'Fez o gol do título da Copa da Inglaterra de 2021, pelo Leicester.',
      'Abriu o placar na final da Liga Europa de 2026, no 3 a 0 do Aston Villa sobre o Freiburg.',
    ],
  },
  {
    id: 'mateta', answer: 'Jean-Philippe Mateta', aliases: ['mateta'],
    clues: [
      'Centroavante francês nascido em 1997.',
      'Passou pelo Lyon e pelo Mainz, da Alemanha.',
      'Prata nos Jogos Olímpicos de Paris 2024, com a França.',
      'Campeão da Copa da Inglaterra de 2025 com o Crystal Palace.',
      'Fez o gol do 1 a 0 no Rayo Vallecano: o primeiro título europeu do Crystal Palace.',
    ],
  },
  {
    id: 'unai-simon', answer: 'Unai Simón', aliases: ['unai simon', 'unai'],
    clues: [
      'Nasceu no País Basco, em 1997.',
      'Goleiro do Athletic Bilbao.',
      'Campeão da Eurocopa de 2024.',
      'Luva de Ouro da Copa de 2026.',
      'Goleiro titular da Espanha campeã do mundo em 2026.',
    ],
  },
];

// ---------- Linha do Tempo ----------
const ev = (id: string, category: ContentCategory, year: number, text: string): TimelineEvent => ({ id, category, year, text });

export const TIMELINE_R14: TimelineEvent[] = [
  ev('t-r14-santos-2011', 'futebol', 2011, 'Santos ganha a Libertadores com gols de Neymar e Danilo na final'),
  ev('t-r14-leicester-fa', 'futebol', 2021, 'Leicester ganha a primeira Copa da Inglaterra, gol de Tielemans'),
  ev('t-r14-fla-2025', 'futebol', 2025, 'Flamengo ganha a 4ª Libertadores: 1 a 0 no Palmeiras, em Lima'),
  ev('t-r14-palace', 'futebol', 2026, 'Crystal Palace ganha o primeiro título europeu, a Conference League'),
  ev('t-r14-villa', 'futebol', 2026, 'Aston Villa ganha a Liga Europa: 3 a 0 no Freiburg, em Istambul'),
  ev('t-r14-noruega', 'futebol', 2026, 'Brasil cai nas oitavas da Copa: 2 a 1 para a Noruega, 2 gols de Haaland'),
  ev('t-r14-enzo-city', 'futebol', 2026, 'Enzo Fernández sai do Chelsea para o Manchester City'),
];

// ---------- Intruso ----------
export const INTRUSO_R14: IntrusoSet[] = [
  {
    id: 'in-r14-palace', category: 'futebol', members: ['Dean Henderson', 'Lacroix', 'Wharton', 'Mateta'], intruder: 'Eze',
    reason: 'Os outros quatro foram titulares do Crystal Palace na final da Conference de 2026. Eze já estava no Arsenal, que perdeu a final da Champions.',
  },
  {
    id: 'in-r14-fla-2025', category: 'futebol', members: ['Rossi', 'Danilo', 'Jorginho', 'Arrascaeta'], intruder: 'Gabigol',
    reason: 'Os outros quatro foram titulares do Flamengo na final da Libertadores de 2025. Gabigol saiu do Flamengo no fim de 2024.',
  },
  {
    id: 'in-r14-espanha-final', category: 'futebol', members: ['Unai Simón', 'Cubarsí', 'Rodri', 'Lamine Yamal'], intruder: 'Pedri',
    reason: 'Os outros quatro começaram a final da Copa de 2026. Pedri entrou no 2º tempo, no lugar de Fabián Ruiz.',
  },
  {
    id: 'in-r14-janela', category: 'futebol', members: ['Morgan Rogers', 'Barcola', 'Bruno Guimarães', 'Elliot Anderson'], intruder: 'Lamine Yamal',
    reason: 'Os outros quatro trocaram de clube na janela do meio de 2026. Yamal continuou no Barcelona.',
  },
];

// ---------- Conexões ----------
export const CONEXOES_R14: ConexoesPuzzle[] = [
  {
    id: 'cx-r14-temporada',
    category: 'futebol',
    groups: [
      { label: 'Campeões nacionais 2025/26', items: ['Arsenal', 'Barcelona', 'Inter', 'Bayern'] },
      { label: 'Artilheiros das ligas 2025/26', items: ['Haaland', 'Mbappé', 'Lautaro', 'Kane'] },
      { label: 'Fizeram gol em finais europeias de 2026', items: ['Havertz', 'Dembélé', 'Buendía', 'Mateta'] },
      { label: 'Trocaram de clube na janela de 2026', items: ['Morgan Rogers', 'Barcola', 'Yan Diomande', 'Bruno Guimarães'] },
    ],
  },
  {
    id: 'cx-r14-copa',
    category: 'futebol',
    groups: [
      { label: 'Semifinalistas da Copa 2026', items: ['Espanha', 'Argentina', 'Inglaterra', 'França'] },
      { label: 'Premiados da Copa 2026', items: ['Rodri', 'Unai Simón', 'Cubarsí', 'Mbappé'] },
      { label: 'Cidades-sede da Copa 2026', items: ['Toronto', 'Guadalajara', 'Seattle', 'Miami'] },
      { label: 'Titulares do Flamengo na final da Libertadores 2025', items: ['Rossi', 'Léo Pereira', 'Pulgar', 'Bruno Henrique'] },
    ],
  },
];
