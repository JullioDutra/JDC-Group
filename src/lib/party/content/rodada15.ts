import type { Top10Item, Top10List } from '../../game/types';
import type { ConexoesPuzzle } from './conexoes';
import type { SurvivorList } from './sobrevivente';

/**
 * Rodada 15 (26/11/2026): mais listas fechadas e conferidas.
 * Fontes (seção 32 do plano), lidas no texto original da Wikipédia em inglês
 * em 26/11/2026:
 * - "List of men's footballers with 100 or more international caps" e
 *   "... with 50 or more international goals" (atualizadas em 17/11/2026,
 *   números da FIFA);
 * - súmulas das finais (as mesmas escalações conferidas do Que Time);
 * - finais de Copa do Mundo e campeões da Copa das Confederações.
 */

const it = (rank: number, name: string, detail: string, aliases: string[] = []): Top10Item => ({ rank, name, detail, ...(aliases.length ? { aliases } : {}) });

// ---------- Top 10 ----------
export const TOP10_R15: Top10List[] = [
  {
    id: 'mais-jogos-selecao-2026',
    category: 'futebol',
    title: 'Jogadores com mais jogos por seleções (até 17/11/2026)',
    source: 'FIFA, pela lista da Wikipédia atualizada em 17/11/2026',
    items: [
      it(1, 'Cristiano Ronaldo', 'Portugal · 234 jogos', ['cr7', 'cristiano']),
      it(2, 'Lionel Messi', 'Argentina · 208 jogos', ['messi']),
      it(2, 'Luka Modrić', 'Croácia · 208 jogos', ['modric']),
      it(4, 'Bader Al-Mutawa', 'Kuwait · 202 jogos', ['al mutawa', 'mutawa']),
      it(5, 'Soh Chin Ann', 'Malásia · 195 jogos', ['soh chin ann']),
      it(6, 'Hassan Al-Haydos', 'Catar · 194 jogos', ['al haydos', 'haydos']),
      it(7, 'Ahmed Kano', 'Omã · 193 jogos', ['kano']),
      it(8, 'Ahmed Hassan', 'Egito · 184 jogos', ['ahmed hassan']),
      it(9, 'Andrés Guardado', 'México · 182 jogos', ['guardado']),
      it(10, 'Maynor Figueroa', 'Honduras · 181 jogos', ['figueroa']),
    ],
  },
  {
    id: 'artilheiros-selecoes-2026',
    category: 'futebol',
    title: 'Maiores artilheiros de seleções (até 17/11/2026)',
    source: 'FIFA, pela lista da Wikipédia atualizada em 17/11/2026',
    items: [
      it(1, 'Cristiano Ronaldo', 'Portugal · 146 gols', ['cr7', 'cristiano']),
      it(2, 'Lionel Messi', 'Argentina · 126 gols', ['messi']),
      it(3, 'Ali Daei', 'Irã · 108 gols', ['daei']),
      it(4, 'Sunil Chhetri', 'Índia · 95 gols', ['chhetri']),
      it(5, 'Romelu Lukaku', 'Bélgica · 94 gols', ['lukaku']),
      it(6, 'Harry Kane', 'Inglaterra · 93 gols', ['kane']),
      it(7, 'Robert Lewandowski', 'Polônia · 92 gols', ['lewandowski']),
      it(8, 'Mokhtar Dahari', 'Malásia · 89 gols', ['dahari']),
      it(9, 'Ali Mabkhout', 'Emirados Árabes · 85 gols', ['mabkhout']),
      it(10, 'Ferenc Puskás', 'Hungria · 84 gols', ['puskas']),
    ],
  },
];

// ---------- Sobrevivente ----------
/** Titulares: nome completo e o sobrenome (ou o nome pelo qual é chamado). */
const players = (names: string[]): Array<[string, ...string[]]> =>
  names.map((n) => {
    const parts = n.split(' ');
    const last = parts[parts.length - 1];
    return parts.length > 1 && last.length > 2 ? [n, last] : [n];
  });

export const SURVIVOR_R15: SurvivorList[] = [
  {
    id: 's-finalistas-copa', category: 'futebol', level: 2, title: 'seleções que já disputaram uma final de Copa do Mundo (até 2026)',
    items: [
      ['Uruguai'], ['Argentina'], ['Itália', 'italia'], ['Tchecoslováquia', 'tchecoslovaquia', 'checoslovaquia'], ['Hungria'], ['Brasil'],
      ['Alemanha', 'alemanha ocidental'], ['Suécia', 'suecia'], ['Inglaterra'], ['Holanda', 'paises baixos'], ['França', 'franca'], ['Espanha'], ['Croácia', 'croacia'],
    ],
  },
  {
    id: 's-confederacoes', category: 'futebol', level: 2, title: 'seleções campeãs da Copa das Confederações (1992 a 2017)',
    items: [['Argentina'], ['Dinamarca'], ['Brasil'], ['México', 'mexico'], ['França', 'franca'], ['Alemanha']],
  },
  {
    id: 's-espanha-2026', category: 'futebol', level: 3, title: 'titulares da Espanha na final da Copa de 2026 (1 x 0 na Argentina)',
    items: [
      ['Unai Simón', 'unai simon', 'simon', 'unai'], ['Pedro Porro', 'porro'], ['Cubarsí', 'cubarsi', 'pau cubarsi'], ['Laporte', 'aymeric laporte'],
      ['Cucurella', 'marc cucurella'], ['Rodri'], ['Dani Olmo', 'olmo'], ['Fabián Ruiz', 'fabian ruiz', 'fabian'], ['Lamine Yamal', 'yamal', 'lamine'],
      ['Oyarzabal', 'mikel oyarzabal'], ['Álex Baena', 'alex baena', 'baena'],
    ],
  },
  {
    id: 's-argentina-2022', category: 'futebol', level: 3, title: 'titulares da Argentina na final da Copa de 2022 (contra a França)',
    items: [
      ['Emiliano Martínez', 'emiliano martinez', 'dibu', 'dibu martinez'], ...players(['Molina', 'Romero', 'Otamendi', 'Tagliafico', 'De Paul']),
      ['Enzo Fernández', 'enzo fernandez', 'enzo'], ['Mac Allister', 'alexis mac allister'], ['Messi', 'lionel messi'], ['Julián Álvarez', 'julian alvarez', 'alvarez'],
      ['Di María', 'di maria', 'angel di maria'],
    ],
  },
  {
    id: 's-flamengo-2019', category: 'futebol', level: 2, title: 'titulares do Flamengo na final da Libertadores de 2019 (2 x 1 no River Plate)',
    items: [
      ['Diego Alves'], ['Rafinha'], ['Rodrigo Caio'], ['Pablo Marí', 'pablo mari', 'mari'], ['Filipe Luís', 'filipe luis'], ['Willian Arão', 'willian arao', 'arao'],
      ['Gerson'], ['Everton Ribeiro'], ['Arrascaeta', 'de arrascaeta', 'giorgian de arrascaeta'], ['Bruno Henrique'], ['Gabigol', 'gabriel barbosa', 'gabriel'],
    ],
  },
  {
    id: 's-palmeiras-2021', category: 'futebol', level: 2, title: 'titulares do Palmeiras na final da Libertadores de 2021 (2 x 1 no Flamengo)',
    items: [
      ['Weverton'], ['Mayke'], ['Gustavo Gómez', 'gustavo gomez'], ['Luan'], ['Piquerez', 'joaquin piquerez'], ['Danilo'], ['Zé Rafael', 'ze rafael'],
      ['Gustavo Scarpa', 'scarpa'], ['Raphael Veiga', 'veiga'], ['Dudu'], ['Rony'],
    ],
  },
];

// ---------- Conexões ----------
export const CONEXOES_R15: ConexoesPuzzle[] = [
  {
    id: 'cx-r15-finais-2026',
    category: 'futebol',
    groups: [
      { label: 'Titulares da Espanha na final da Copa de 2026', items: ['Unai Simón', 'Cucurella', 'Rodri', 'Oyarzabal'] },
      { label: 'Titulares do PSG na final da Champions de 2026', items: ['Safonov', 'Hakimi', 'Vitinha', 'Kvaratskhelia'] },
      { label: 'Titulares do Crystal Palace na final da Conference de 2026', items: ['Dean Henderson', 'Lacroix', 'Wharton', 'Kamada'] },
      { label: 'Titulares do Flamengo na final da Libertadores de 2025', items: ['Rossi', 'Varela', 'Jorginho', 'Carrascal'] },
    ],
  },
  {
    id: 'cx-r15-recordes',
    category: 'futebol',
    groups: [
      { label: 'No top 10 de jogos por seleção', items: ['Modrić', 'Al-Mutawa', 'Guardado', 'Maynor Figueroa'] },
      { label: 'No top 10 de gols por seleção', items: ['Ali Daei', 'Chhetri', 'Lukaku', 'Puskás'] },
      { label: 'No top 10 de gols em Copas', items: ['Klose', 'Just Fontaine', 'Kocsis', 'Klinsmann'] },
      { label: 'Brasileiros que ganharam a Bola de Ouro', items: ['Rivaldo', 'Ronaldinho', 'Kaká', 'Ronaldo Fenômeno'] },
    ],
  },
  {
    id: 'cx-r15-europa',
    category: 'futebol',
    groups: [
      { label: 'Titulares do Bayern campeão da Champions de 2013', items: ['Dante', 'Robben', 'Ribéry', 'Mandžukić'] },
      { label: 'Titulares do Chelsea campeão da Champions de 2021', items: ['Azpilicueta', 'Kanté', 'Mount', 'Werner'] },
      { label: 'Titulares do Real Madrid campeão da Champions de 2022', items: ['Militão', 'Casemiro', 'Benzema', 'Courtois'] },
      { label: 'Titulares da Inter campeã da Champions de 2010', items: ['Júlio César', 'Maicon', 'Cambiasso', 'Milito'] },
    ],
  },
  {
    id: 'cx-r15-libertadores',
    category: 'futebol',
    groups: [
      { label: 'Titulares do Palmeiras na final da Libertadores de 2020', items: ['Weverton', 'Gustavo Gómez', 'Zé Rafael', 'Rony'] },
      { label: 'Titulares do Flamengo na final da Libertadores de 2019', items: ['Diego Alves', 'Rafinha', 'Pablo Marí', 'Gerson'] },
      { label: 'Titulares do Atlético-MG na final da Libertadores de 2013', items: ['Victor', 'Réver', 'Ronaldinho Gaúcho', 'Jô'] },
      { label: 'Titulares do Internacional na final da Libertadores de 2010', items: ['Bolívar', 'Guiñazú', "D'Alessandro", 'Rafael Sóbis'] },
    ],
  },
];
