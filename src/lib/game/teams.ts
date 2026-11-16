import { containsPhrase, normalize } from './text';

export interface Team {
  id: string;
  name: string;
  /** Formas normalizadas pelas quais o time pode aparecer na ficha do jogador. */
  aliases: string[];
  /** Termos que, se presentes, indicam OUTRO time (ex.: "Inter Miami"). */
  not?: string[];
  colors: [string, string];
}

const club = (
  id: string,
  name: string,
  colors: [string, string],
  aliases: string[] = [],
  not?: string[],
): Team => ({ id, name, colors, aliases: [normalize(name), ...aliases], not });

export const CLUBS: Team[] = [
  // Brasil
  club('flamengo', 'Flamengo', ['#C8102E', '#111111']),
  club('palmeiras', 'Palmeiras', ['#006437', '#FFFFFF']),
  club('corinthians', 'Corinthians', ['#111111', '#FFFFFF']),
  club('sao-paulo', 'São Paulo', ['#E30613', '#111111'], ['sao paulo fc', 'spfc']),
  club('santos', 'Santos', ['#FFFFFF', '#111111'], [], ['santos laguna']),
  club('gremio', 'Grêmio', ['#0D80BF', '#111111'], [], ['barueri', 'novorizontino', 'prudente', 'osasco', 'anapolis']),
  club('internacional', 'Internacional', ['#E5050F', '#FFFFFF'], ['sport club internacional'], ['limeira']),
  club('atletico-mg', 'Atlético-MG', ['#111111', '#FFFFFF'], ['atletico mineiro', 'atletico mg', 'galo']),
  club('cruzeiro', 'Cruzeiro', ['#003DA5', '#FFFFFF']),
  club('vasco', 'Vasco', ['#111111', '#FFFFFF'], ['vasco da gama']),
  club('fluminense', 'Fluminense', ['#7A1F3D', '#00693E']),
  club('botafogo', 'Botafogo', ['#111111', '#FFFFFF'], [], ['botafogo sp', 'botafogo pb']),
  // Europa
  club('real-madrid', 'Real Madrid', ['#FFFFFF', '#FEBE10'], [], ['castilla']),
  club('barcelona', 'Barcelona', ['#A50044', '#004D98'], ['fc barcelona'], ['guayaquil', 'barcelona sc', 'barcelona b']),
  club('atletico-madrid', 'Atlético de Madrid', ['#CB3524', '#FFFFFF'], ['atletico madrid', 'atletico de madri']),
  club('manchester-united', 'Manchester United', ['#DA291C', '#FBE122'], ['man united', 'manchester utd']),
  club('manchester-city', 'Manchester City', ['#6CABDD', '#1C2C5B'], ['man city']),
  club('liverpool', 'Liverpool', ['#C8102E', '#00B2A9'], [], ['montevideo', 'montevideu']),
  club('chelsea', 'Chelsea', ['#034694', '#FFFFFF']),
  club('arsenal', 'Arsenal', ['#EF0107', '#FFFFFF'], [], ['sarandi', 'tula']),
  club('tottenham', 'Tottenham', ['#132257', '#FFFFFF'], ['tottenham hotspur']),
  club('bayern', 'Bayern de Munique', ['#DC052D', '#0066B2'], ['bayern munique', 'bayern munich', 'bayern munchen', 'bayern']),
  club('dortmund', 'Borussia Dortmund', ['#FDE100', '#111111'], ['dortmund']),
  club('juventus', 'Juventus', ['#111111', '#FFFFFF']),
  club('milan', 'Milan', ['#FB090B', '#111111'], ['ac milan'], ['inter']),
  club('inter', 'Inter de Milão', ['#0068A8', '#111111'], ['inter milan', 'internazionale', 'inter de milao', 'inter'], ['miami', 'limeira']),
  club('psg', 'PSG', ['#004170', '#DA291C'], ['paris saint germain', 'paris sg']),
  club('porto', 'Porto', ['#00428C', '#FFFFFF'], ['fc porto']),
  club('benfica', 'Benfica', ['#E83030', '#FFFFFF']),
  club('ajax', 'Ajax', ['#D2122E', '#FFFFFF']),
  // Américas
  club('boca', 'Boca Juniors', ['#103F79', '#F3B229'], ['boca']),
  club('river', 'River Plate', ['#FFFFFF', '#E4002B'], ['river'], ['montevideo', 'montevideu']),
  // Europa e outros (ampliam o sorteio do Melhor Time)
  club('fenerbahce', 'Fenerbahçe', ['#163962', '#FFED00']),
  club('galatasaray', 'Galatasaray', ['#A90432', '#FDB912']),
  club('napoli', 'Napoli', ['#12A0D7', '#FFFFFF'], ['napoles']),
  club('roma', 'Roma', ['#8E1F2F', '#F0BC42'], ['as roma']),
  club('sevilla', 'Sevilla', ['#FFFFFF', '#D71A28'], ['sevilha']),
  club('valencia', 'Valencia', ['#FFFFFF', '#EE3524'], ['valencia cf']),
  club('marseille', 'Olympique de Marseille', ['#2FAEE0', '#FFFFFF'], ['marseille', 'olympique marselha', 'marselha']),
  club('lyon', 'Lyon', ['#1B2F6A', '#DA291C'], ['olympique lyonnais', 'olympique de lyon']),
  club('monaco', 'Monaco', ['#E30613', '#FFFFFF'], ['as monaco']),
  club('sporting', 'Sporting', ['#008057', '#FFFFFF'], ['sporting cp', 'sporting lisboa'], ['cristal', 'gijon', 'kansas', 'braga']),
  club('celtic', 'Celtic', ['#018749', '#FFFFFF']),
  club('al-nassr', 'Al-Nassr', ['#FFE100', '#1E3D8F'], ['al nassr']),
  club('al-hilal', 'Al-Hilal', ['#005EB8', '#FFFFFF'], ['al hilal']),
];

const nation = (id: string, name: string, colors: [string, string], aliases: string[] = []): Team => ({
  id,
  name,
  colors,
  aliases: [normalize(name), ...aliases],
});

export const NATIONS: Team[] = [
  nation('brasil', 'Brasil', ['#FFDF00', '#009C3B'], ['brasileiro', 'brasileira', 'brazil']),
  nation('argentina', 'Argentina', ['#75AADB', '#FFFFFF'], ['argentino', 'argentina']),
  nation('franca', 'França', ['#0055A4', '#EF4135'], ['frances', 'francesa', 'france']),
  nation('alemanha', 'Alemanha', ['#FFFFFF', '#111111'], ['alemao', 'alema', 'germany']),
  nation('italia', 'Itália', ['#0066CC', '#FFFFFF'], ['italiano', 'italiana', 'italy']),
  nation('espanha', 'Espanha', ['#AA151B', '#F1BF00'], ['espanhol', 'espanhola', 'spain']),
  nation('portugal', 'Portugal', ['#DA291C', '#046A38'], ['portugues', 'portuguesa']),
  nation('inglaterra', 'Inglaterra', ['#FFFFFF', '#CF081F'], ['ingles', 'inglesa', 'england']),
  nation('holanda', 'Holanda', ['#F36C21', '#FFFFFF'], ['holandes', 'holandesa', 'paises baixos', 'netherlands']),
  nation('uruguai', 'Uruguai', ['#5CBFEB', '#FFFFFF'], ['uruguaio', 'uruguaia', 'uruguay']),
  nation('colombia', 'Colômbia', ['#FCD116', '#003893'], ['colombiano', 'colombiana']),
  nation('belgica', 'Bélgica', ['#E30613', '#FDDA24'], ['belga', 'belgium']),
  nation('croacia', 'Croácia', ['#FF0000', '#FFFFFF'], ['croata', 'croatia']),
];

export function getTeam(id: string | undefined): Team | undefined {
  if (!id) return undefined;
  return CLUBS.find((t) => t.id === id) ?? NATIONS.find((t) => t.id === id);
}

function matches(team: Team, raw: string): boolean {
  const value = normalize(raw);
  if (!value) return false;
  if (team.not?.some((n) => containsPhrase(value, n))) return false;
  return team.aliases.some((alias) => containsPhrase(value, alias));
}

export function playedForClub(team: Team, clubs: string[]): boolean {
  return clubs.some((c) => matches(team, c));
}

export function isFromNation(team: Team, nationality: string | null): boolean {
  return nationality ? matches(team, nationality) : false;
}

/** Sorteia `count` itens distintos. `rng` injetável para testes. */
export function drawDistinct<T>(pool: T[], count: number, rng: () => number = Math.random): T[] {
  const copy = [...pool];
  const out: T[] = [];
  while (out.length < count && copy.length) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
}
