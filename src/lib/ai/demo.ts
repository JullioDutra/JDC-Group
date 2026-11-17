import { normalize } from '../game/text';
import type { PlayerProfile, Position } from '../game/types';

/**
 * MODO DEMO — usado só quando MARITACA_API_KEY não está configurada.
 * Elenco reduzido com números aproximados, para testar o fluxo do jogo
 * (simulador web e desenvolvimento local). Não é fonte de verdade.
 */
type Row = [
  name: string, aliases: string, positions: Position[], nationality: string, birthDate: string, clubs: string[],
  heightCm: number, goals: number, assists: number, peakValue: number, caps: number, intlGoals: number,
  wcGoals: number, uclGoals: number, titles: number,
  apps: number, brasileiraoGoals: number, libertadoresGoals: number, worldCups: number, debutYear: number,
];

const ROWS: Row[] = [
  ['Rogério Ceni', 'ceni', ['GOL'], 'Brasil', '1973-01-22', ['Sinop', 'São Paulo'], 188, 131, 5, 5, 16, 0, 0, 0, 18, 1237, 64, 14, 0, 1990],
  ['Manuel Neuer', 'neuer', ['GOL'], 'Alemanha', '1986-03-27', ['Schalke 04', 'Bayern de Munique'], 193, 0, 5, 45, 124, 0, 0, 0, 30, 870, 0, 0, 4, 2006],
  ['Alisson', 'alisson becker', ['GOL'], 'Brasil', '1992-10-02', ['Internacional', 'Roma', 'Liverpool'], 193, 1, 3, 90, 70, 0, 0, 0, 12, 560, 0, 0, 3, 2013],
  ['Ter Stegen', 'marc andre ter stegen', ['GOL'], 'Alemanha', '1992-04-30', ['Borussia Mönchengladbach', 'Barcelona'], 187, 0, 4, 90, 40, 0, 0, 0, 17, 560, 0, 0, 0, 2010],
  ['Sergio Ramos', 'ramos', ['DEF'], 'Espanha', '1986-03-30', ['Sevilla', 'Real Madrid', 'PSG', 'Monterrey'], 184, 140, 45, 70, 180, 23, 0, 15, 25, 950, 0, 0, 4, 2004],
  ['Roberto Carlos', '', ['DEF'], 'Brasil', '1973-04-10', ['Palmeiras', 'Inter de Milão', 'Real Madrid', 'Fenerbahçe', 'Corinthians'], 168, 113, 100, 25, 125, 11, 1, 16, 20, 950, 5, 0, 3, 1991],
  ['Marcelo', '', ['DEF'], 'Brasil', '1988-05-12', ['Fluminense', 'Real Madrid', 'Olympiacos'], 174, 60, 110, 70, 58, 6, 0, 9, 28, 750, 4, 1, 1, 2005],
  ['Piqué', 'gerard pique', ['DEF'], 'Espanha', '1987-02-02', ['Manchester United', 'Zaragoza', 'Barcelona'], 194, 60, 15, 50, 102, 5, 0, 16, 35, 700, 0, 0, 3, 2006],
  ['Koeman', 'ronald koeman', ['DEF', 'MEI'], 'Holanda', '1963-03-21', ['Groningen', 'Ajax', 'PSV', 'Barcelona', 'Feyenoord'], 181, 250, 60, 10, 78, 14, 0, 12, 20, 780, 0, 0, 1, 1980],
  ['Iniesta', 'andres iniesta', ['MEI'], 'Espanha', '1984-05-11', ['Barcelona', 'Vissel Kobe'], 171, 95, 190, 70, 131, 13, 2, 11, 37, 880, 0, 0, 3, 2002],
  ['Kaká', 'kaka', ['MEI'], 'Brasil', '1982-04-22', ['São Paulo', 'Milan', 'Real Madrid', 'Orlando City'], 186, 230, 160, 60, 92, 29, 1, 30, 12, 780, 23, 2, 3, 2001],
  ['Zico', '', ['MEI'], 'Brasil', '1953-03-03', ['Flamengo', 'Udinese', 'Kashima Antlers'], 172, 520, 200, 5, 71, 48, 5, 0, 16, 900, 135, 16, 3, 1971],
  ['Lampard', 'frank lampard', ['MEI'], 'Inglaterra', '1978-06-20', ['West Ham', 'Chelsea', 'Manchester City', 'New York City'], 184, 300, 180, 45, 106, 29, 0, 23, 13, 920, 0, 0, 3, 1995],
  ['De Bruyne', 'kevin de bruyne', ['MEI'], 'Bélgica', '1991-06-28', ['Genk', 'Chelsea', 'Wolfsburg', 'Manchester City', 'Napoli'], 181, 190, 300, 150, 110, 30, 2, 16, 20, 780, 0, 0, 3, 2008],
  ['Pedri', '', ['MEI'], 'Espanha', '2002-11-25', ['Las Palmas', 'Barcelona'], 174, 35, 30, 140, 40, 3, 0, 3, 6, 260, 0, 0, 1, 2019],
  ['Cristiano Ronaldo', 'cr7 ronaldo cristiano', ['ATA'], 'Portugal', '1985-02-05', ['Sporting', 'Manchester United', 'Real Madrid', 'Juventus', 'Al-Nassr'], 187, 950, 250, 120, 220, 140, 8, 140, 35, 1290, 0, 0, 6, 2002],
  ['Messi', 'lionel messi', ['ATA', 'MEI'], 'Argentina', '1987-06-24', ['Barcelona', 'PSG', 'Inter Miami'], 170, 880, 390, 180, 195, 114, 13, 129, 46, 1130, 0, 0, 6, 2004],
  ['Pelé', 'pele', ['ATA'], 'Brasil', '1940-10-23', ['Santos', 'New York Cosmos'], 173, 760, 300, 5, 92, 77, 12, 0, 40, 1360, 0, 0, 4, 1956],
  ['Romário', 'romario', ['ATA'], 'Brasil', '1966-01-29', ['Vasco', 'PSV', 'Barcelona', 'Flamengo', 'Valencia', 'Fluminense'], 167, 750, 150, 15, 70, 55, 5, 9, 25, 1000, 154, 6, 2, 1985],
  ['Neymar', 'neymar jr', ['ATA'], 'Brasil', '1992-02-05', ['Santos', 'Barcelona', 'PSG', 'Al-Hilal'], 175, 450, 280, 180, 128, 79, 8, 43, 30, 740, 40, 14, 3, 2009],
  ['Lamine Yamal', 'yamal', ['ATA'], 'Espanha', '2007-07-13', ['Barcelona'], 180, 45, 50, 200, 25, 6, 0, 8, 6, 150, 0, 0, 1, 2023],
  ['Alexis Sánchez', 'alexis sanchez', ['MEI', 'ATA'], 'Chile', '1988-12-19', ['Colo-Colo', 'Udinese', 'River Plate', 'Barcelona', 'Arsenal', 'Manchester United', 'Inter de Milão', 'Olympique de Marseille'], 169, 290, 150, 60, 165, 51, 1, 15, 15, 760, 0, 0, 2, 2005],
  ['Haaland', 'erling haaland', ['ATA'], 'Noruega', '2000-07-21', ['Molde', 'RB Salzburg', 'Borussia Dortmund', 'Manchester City'], 195, 330, 60, 200, 45, 50, 0, 55, 10, 360, 0, 0, 1, 2016],
  ['Ronaldo', 'ronaldo fenomeno r9', ['ATA'], 'Brasil', '1976-09-18', ['Cruzeiro', 'PSV', 'Barcelona', 'Inter de Milão', 'Real Madrid', 'Milan', 'Corinthians'], 183, 414, 100, 50, 98, 62, 15, 14, 18, 520, 12, 0, 4, 1993],
];

const PROFILES: Array<{ keys: string[]; profile: PlayerProfile }> = ROWS.map((r) => ({
  keys: [normalize(r[0]), ...normalize(r[1]).split(' ').filter(Boolean)],
  profile: {
    exists: true, name: r[0], aliases: normalize(r[1]).split(' ').filter(Boolean), positions: r[2], nationality: r[3], birthDate: r[4], clubs: r[5], heightCm: r[6],
    careerGoals: r[7], careerAssists: r[8], peakValueEurM: r[9], intlCaps: r[10], intlGoals: r[11],
    worldCupGoals: r[12], uclGoals: r[13], titles: r[14],
    careerApps: r[15], brasileiraoGoals: r[16], libertadoresGoals: r[17], worldCupsPlayed: r[18], debutYear: r[19],
  },
}));

export const DEMO_PLAYER_NAMES = ROWS.map((r) => r[0]);

export async function lookupDemo(query: string): Promise<PlayerProfile | null> {
  const q = normalize(query);
  const exact = PROFILES.find((p) => p.keys[0] === q);
  if (exact) return exact.profile;
  const words = q.split(' ');
  const partial = PROFILES.find((p) => words.every((w) => p.keys.some((k) => k.split(' ').includes(w))));
  return partial?.profile ?? null;
}
