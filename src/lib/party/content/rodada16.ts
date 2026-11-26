import type { ContentCategory, Top10Item, Top10List } from '../../game/types';
import type { Card } from './cards';
import type { ConexoesPuzzle } from './conexoes';
import type { FactCard } from './fato';
import type { IntrusoSet } from './intruso';
import type { TimelineEvent } from './linha';
import type { SurvivorList } from './sobrevivente';
import type { WhoIsCard } from './whois';

/**
 * Rodada 16 (26/11/2026): mais Copa do Mundo de 2026 nos jogos.
 * Fonte: página "2026 FIFA World Cup" da Wikipédia em inglês, lida no texto
 * original em 26/11/2026 (sedes e capacidades da FIFA, estreantes, prêmios,
 * seleção do torneio, mascotes, bola, cerimônias, público), e as caixas de
 * informação de Cubarsí, Olise e Bellingham.
 */

const it = (rank: number, name: string, detail: string, aliases: string[] = []): Top10Item => ({ rank, name, detail, ...(aliases.length ? { aliases } : {}) });

// ---------- Top 10 ----------
export const TOP10_R16: Top10List[] = [
  {
    id: 'estadios-copa-2026',
    category: 'futebol',
    title: 'Os 10 maiores estádios da Copa do Mundo de 2026 (capacidade da FIFA)',
    source: 'FIFA, pela página da Copa de 2026 na Wikipédia',
    items: [
      it(1, 'Estadio Azteca', 'Cidade do México · 80.824', ['azteca']),
      it(2, 'MetLife Stadium', 'Nova York/Nova Jersey · 80.663 (a final)', ['metlife']),
      it(3, 'AT&T Stadium', 'Dallas · 70.649', ['at&t', 'att stadium']),
      it(4, 'SoFi Stadium', 'Los Angeles · 70.492', ['sofi']),
      it(5, 'Arrowhead Stadium', 'Kansas City · 69.045', ['arrowhead']),
      it(6, "Levi's Stadium", 'São Francisco · 68.827', ['levis', 'levis stadium']),
      it(7, 'NRG Stadium', 'Houston · 68.777', ['nrg']),
      it(8, 'Lincoln Financial Field', 'Filadélfia · 68.324', ['lincoln financial']),
      it(9, 'Mercedes-Benz Stadium', 'Atlanta · 68.239', ['mercedes benz', 'mercedes-benz']),
      it(10, 'Lumen Field', 'Seattle · 66.925', ['lumen']),
    ],
  },
];

// ---------- Sobrevivente ----------
export const SURVIVOR_R16: SurvivorList[] = [
  {
    id: 's-sedes-copa-2026', category: 'futebol', level: 2, title: 'as 16 cidades-sede da Copa do Mundo de 2026',
    items: [
      ['Cidade do México', 'cidade do mexico', 'mexico city'], ['Guadalajara'], ['Monterrey'], ['Toronto'], ['Vancouver'],
      ['Nova York/Nova Jersey', 'nova york', 'nova jersey', 'new york', 'east rutherford'], ['Los Angeles', 'inglewood'], ['Dallas', 'arlington'],
      ['Houston'], ['Kansas City'], ['Atlanta'], ['Miami'], ['Seattle'], ['Filadélfia', 'filadelfia', 'philadelphia'], ['Boston', 'foxborough'],
      ['São Francisco', 'sao francisco', 'san francisco', 'santa clara'],
    ],
  },
  {
    id: 's-estreantes-copa-2026', category: 'futebol', level: 3, title: 'as 4 seleções estreantes na Copa do Mundo de 2026',
    items: [['Cabo Verde'], ['Curaçao', 'curacao'], ['Jordânia', 'jordania'], ['Uzbequistão', 'uzbequistao']],
  },
  {
    id: 's-selecao-torneio-2026', category: 'futebol', level: 3, title: 'a seleção do torneio da Copa de 2026 (votação da FIFA)',
    items: [
      ['Vozinha'], ['Cucurella', 'marc cucurella'], ['Lisandro Martínez', 'lisandro martinez', 'lisandro'], ['Upamecano', 'dayot upamecano'],
      ['Pedro Porro', 'porro'], ['Bellingham', 'jude bellingham'], ['Rodri'], ['Olise', 'michael olise'], ['Mbappé', 'mbappe', 'kylian mbappe'],
      ['Haaland', 'erling haaland'], ['Messi', 'lionel messi'],
    ],
  },
];

// ---------- Quem é? ----------
export const WHOIS_R16: WhoIsCard[] = [
  {
    id: 'cubarsi', answer: 'Pau Cubarsí', aliases: ['cubarsi', 'cubarsí'],
    clues: [
      'Nasceu em Bescanó, na Catalunha, em janeiro de 2007.',
      'Zagueiro que passou pela base do Girona antes de chegar a La Masia.',
      'Estreou no time principal do Barça com 16 anos.',
      'Titular na final da Copa de 2026, contra a Argentina.',
      'Eleito o melhor jovem da Copa de 2026, com a Espanha campeã.',
    ],
  },
  {
    id: 'olise', answer: 'Michael Olise', aliases: ['olise'],
    clues: [
      'Nasceu em Londres, em 2001, mas joga pela França.',
      'Começou a carreira profissional no Reading.',
      'Saiu do Crystal Palace para o Bayern de Munique em 2024.',
      'Ponta canhoto, também joga como meia-atacante.',
      'Escolhido para a seleção do torneio da Copa de 2026.',
    ],
  },
  {
    id: 'bellingham', answer: 'Jude Bellingham', aliases: ['bellingham'],
    clues: [
      'Nasceu em Stourbridge, na Inglaterra, em 2003.',
      'O Birmingham aposentou a camisa 22 dele quando ele saiu, aos 17 anos.',
      'Passou pelo Borussia Dortmund antes de ir para o Real Madrid, em 2023.',
      'Fez 7 gols na Copa de 2026: o recorde da Inglaterra numa Copa só.',
      'Meia do Real Madrid e da seleção inglesa, Chuteira de Bronze da Copa de 2026.',
    ],
  },
];

// ---------- Emoji ----------
export const EMOJI_R16: Card[] = [
  { id: 'e-r16-maple', category: 'futebol', prompt: '🫎 🇨🇦 ⚽ (mascote da Copa de 2026)', answer: 'Maple', aliases: [] },
  { id: 'e-r16-zayu', category: 'futebol', prompt: '🐆 🇲🇽 ⚽ (mascote da Copa de 2026)', answer: 'Zayu', aliases: [] },
  { id: 'e-r16-clutch', category: 'futebol', prompt: '🦅 🇺🇸 ⚽ (mascote da Copa de 2026)', answer: 'Clutch', aliases: [] },
  { id: 'e-r16-cabo-verde', category: 'futebol', prompt: '🏝️ 🆕 🌍 ⚽ (estreante na Copa de 2026, gol mais bonito do torneio)', answer: 'Cabo Verde', aliases: [] },
  { id: 'e-r16-italia', category: 'futebol', prompt: '🍕 🏆🏆🏆🏆 ❌❌❌ (fora de três Copas seguidas)', answer: 'Itália', aliases: ['italia'] },
  { id: 'e-r16-shakira', category: 'geral', prompt: '💃 🇨🇴 🎤 ⏸️ 🏆 (show do intervalo da final da Copa de 2026)', answer: 'Shakira', aliases: [] },
];

// ---------- Quiz Relâmpago ----------
export const RELAMPAGO_R16: Card[] = [
  { id: 'r-r16-mascotes', category: 'futebol', prompt: 'Qual é o mascote canadense da Copa de 2026, um alce?', answer: 'Maple', aliases: [] },
  { id: 'r-r16-zayu', category: 'futebol', prompt: 'Qual é o mascote mexicano da Copa de 2026, uma onça?', answer: 'Zayu', aliases: [] },
  { id: 'r-r16-bola', category: 'futebol', prompt: 'Como se chama a bola da Copa de 2026?', answer: 'Trionda', aliases: ['adidas trionda'] },
  { id: 'r-r16-azteca', category: 'futebol', prompt: 'Em que estádio foi o jogo de abertura da Copa de 2026?', answer: 'Estadio Azteca', aliases: ['azteca'] },
  { id: 'r-r16-mil', category: 'futebol', prompt: 'Que jogo de 2026, em Monterrey, foi o milésimo da história das Copas?', answer: 'Tunísia x Japão', aliases: ['tunisia x japao', 'tunisia e japao', 'japao x tunisia'] },
  { id: 'r-r16-gol-copa', category: 'futebol', prompt: 'De que seleção estreante foi o gol mais bonito da Copa de 2026?', answer: 'Cabo Verde', aliases: [] },
  { id: 'r-r16-italia', category: 'futebol', prompt: 'Quem tirou a Itália da Copa de 2026, na final da repescagem europeia?', answer: 'Bósnia', aliases: ['bosnia', 'bosnia e herzegovina'] },
  { id: 'r-r16-bola-prata', category: 'futebol', prompt: 'Quem ganhou a Bola de Prata (2º melhor jogador) da Copa de 2026?', answer: 'Lionel Messi', aliases: ['messi'] },
  { id: 'r-r16-chuteira-bronze', category: 'futebol', prompt: 'Qual inglês foi o 3º artilheiro da Copa de 2026, com 7 gols?', answer: 'Jude Bellingham', aliases: ['bellingham'] },
  { id: 'r-r16-goleiro-cv', category: 'futebol', prompt: 'Qual goleiro de Cabo Verde entrou na seleção do torneio da Copa de 2026?', answer: 'Vozinha', aliases: [] },
  { id: 'r-r16-show', category: 'geral', prompt: 'Qual banda coreana cantou no show do intervalo da final da Copa de 2026?', answer: 'BTS', aliases: [] },
];

// ---------- Fato ou Fake ----------
const f = (id: string, category: ContentCategory, fact: boolean, text: string, why: string): FactCard => ({ id, category, fact, text, why });

export const FACTS_R16: FactCard[] = [
  f('ff-r16-estreantes', 'futebol', true, 'Cabo Verde, Curaçao, Jordânia e Uzbequistão estrearam em Copas em 2026.', 'Foram as quatro estreantes da primeira Copa com 48 seleções.'),
  f('ff-r16-italia', 'futebol', true, 'A Itália ficou fora da terceira Copa seguida em 2026.', 'Perdeu a final da repescagem europeia para a Bósnia, nos pênaltis. Nenhum outro campeão mundial ficou fora de três seguidas.'),
  f('ff-r16-show', 'futebol', true, 'A final da Copa de 2026 teve show no intervalo, como o Super Bowl.', 'Foi o primeiro da história das Copas: Madonna, Shakira e BTS foram as atrações principais.'),
  f('ff-r16-publico', 'futebol', true, 'A Copa de 2026 bateu o recorde de público da história das Copas.', 'Foram cerca de 7 milhões de pessoas nos estádios; o recorde anterior era da Copa de 1994, também nos EUA.'),
  f('ff-r16-mascotes', 'futebol', false, 'A Copa de 2026 teve um mascote só, um alce.', 'Foram três, um de cada país-sede: Maple (alce, Canadá), Zayu (onça, México) e Clutch (águia-careca, EUA).'),
  f('ff-r16-bola-ouro', 'futebol', false, 'Mbappé foi eleito o melhor jogador da Copa de 2026.', 'Mbappé foi o artilheiro, com 10 gols, e ganhou a Bola de Bronze. A Bola de Ouro foi do espanhol Rodri.'),
  f('ff-r16-capital', 'futebol', true, 'A Cidade do México foi a única capital dos três países-sede a receber jogos da Copa de 2026.', 'Washington e Ottawa ficaram de fora da lista de sedes.'),
  f('ff-r16-abertura', 'futebol', false, 'A Copa de 2026 começou em Nova York.', 'A abertura foi no Estadio Azteca, na Cidade do México, em 11 de junho. Em Nova York/Nova Jersey foi a final.'),
];

// ---------- Linha do Tempo ----------
const ev = (id: string, category: ContentCategory, year: number, text: string): TimelineEvent => ({ id, category, year, text });

export const TIMELINE_R16: TimelineEvent[] = [
  ev('t-r16-sedes', 'futebol', 2022, 'A FIFA anuncia as 16 cidades-sede da Copa de 2026'),
  ev('t-r16-mil', 'futebol', 2026, 'O milésimo jogo da história das Copas: Tunísia x Japão, em Monterrey'),
  ev('t-r16-italia', 'futebol', 2026, 'A Itália fica fora da terceira Copa seguida'),
];

// ---------- Intruso ----------
export const INTRUSO_R16: IntrusoSet[] = [
  {
    id: 'in-r16-estreantes', category: 'futebol', members: ['Cabo Verde', 'Curaçao', 'Jordânia', 'Uzbequistão'], intruder: 'Noruega',
    reason: 'Os outros quatro estrearam em Copas em 2026. A Noruega voltou depois de ficar fora desde 1998.',
  },
  {
    id: 'in-r16-estadios', category: 'futebol', members: ['Estadio Azteca', 'MetLife Stadium', 'SoFi Stadium', 'BC Place'], intruder: 'Maracanã',
    reason: 'Os outros quatro foram estádios da Copa de 2026. O Maracanã foi da Copa de 2014.',
  },
  {
    id: 'in-r16-show', category: 'geral', members: ['Madonna', 'Shakira', 'BTS', 'Justin Bieber'], intruder: 'Robbie Williams',
    reason: 'Os outros quatro cantaram no show do intervalo da final da Copa de 2026. Robbie Williams cantou na cerimônia de encerramento, antes do jogo.',
  },
];

// ---------- Conexões ----------
export const CONEXOES_R16: ConexoesPuzzle[] = [
  {
    id: 'cx-r16-copa-2026',
    category: 'futebol',
    groups: [
      { label: 'Estreantes na Copa de 2026', items: ['Cabo Verde', 'Curaçao', 'Jordânia', 'Uzbequistão'] },
      { label: 'Na seleção do torneio da Copa de 2026', items: ['Vozinha', 'Upamecano', 'Olise', 'Lisandro Martínez'] },
      { label: 'Estádios da Copa de 2026', items: ['Azteca', 'MetLife', 'SoFi', 'BC Place'] },
      { label: 'Cidades-sede da Copa de 2026', items: ['Vancouver', 'Monterrey', 'Houston', 'Boston'] },
    ],
  },
  {
    id: 'cx-r16-festa-2026',
    category: 'geral',
    groups: [
      { label: 'Show do intervalo da final da Copa de 2026', items: ['Madonna', 'Shakira', 'BTS', 'Justin Bieber'] },
      { label: 'Cerimônia de encerramento da Copa de 2026', items: ['Laura Pausini', 'Robbie Williams', 'Post Malone', 'Nicole Scherzinger'] },
      { label: 'Mascotes e bola da Copa de 2026', items: ['Maple', 'Zayu', 'Clutch', 'Trionda'] },
      { label: 'Prêmios individuais da Copa de 2026', items: ['Rodri', 'Unai Simón', 'Cubarsí', 'Mbappé'] },
    ],
  },
];
