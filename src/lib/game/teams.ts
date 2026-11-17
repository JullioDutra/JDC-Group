import { containsPhrase, normalize } from './text';

export interface Team {
  id: string;
  name: string;
  /** Formas normalizadas pelas quais o time pode aparecer na ficha do jogador. */
  aliases: string[];
  /** Termos que, se presentes, indicam OUTRO time (ex.: "Inter Miami"). */
  not?: string[];
  colors: [string, string];
  /**
   * Nível de dificuldade no sorteio: 1 = gigantes (temas normais),
   * 2 = conhecidos (extra "difícil" e Melhor Time), 3 = raiz (Melhor Time difícil).
   */
  tier: 1 | 2 | 3;
}

const club = (
  id: string,
  name: string,
  colors: [string, string],
  aliases: string[] = [],
  not?: string[],
): Team => ({ id, name, colors, aliases: [normalize(name), ...aliases], not, tier: 1 });

/** Clube sem cor definida (as cores não aparecem nas imagens). */
const c = (id: string, name: string, tier: 1 | 2 | 3, aliases: string[] = [], not?: string[]): Team => ({
  id,
  name,
  colors: ['#FFFFFF', '#111111'],
  aliases: [normalize(name), ...aliases],
  not,
  tier,
});

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
  // Europa e outros (nível 2: ampliam o sorteio do Melhor Time e do extra "difícil")
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
].map((t) =>
  ['fenerbahce', 'galatasaray', 'napoli', 'roma', 'sevilla', 'valencia', 'marseille', 'lyon', 'monaco', 'sporting', 'celtic', 'al-nassr', 'al-hilal'].includes(t.id)
    ? { ...t, tier: 2 as const }
    : t,
);

/**
 * Ampliação do sorteio (a IA confere na ficha se o jogador passou pelo clube).
 * "not" evita confusão entre homônimos (Racing x Racing Strasbourg, Nacional x Atlético Nacional...).
 */
CLUBS.push(
  // Brasil — Série A/B e tradicionais
  c('athletico-pr', 'Athletico-PR', 2, ['athletico paranaense', 'atletico paranaense', 'atletico pr', 'furacao']),
  c('bahia', 'Bahia', 2, ['ec bahia', 'esporte clube bahia']),
  c('vitoria', 'Vitória', 2, ['ec vitoria'], ['guimaraes', 'setubal', 'espirito santo']),
  c('sport', 'Sport', 2, ['sport recife', 'sport club do recife'], ['internacional', 'corinthians', 'sporting', 'boys', 'rio grande']),
  c('ceara', 'Ceará', 2, ['ceara sc']),
  c('fortaleza', 'Fortaleza', 2, ['fortaleza ec']),
  c('goias', 'Goiás', 2, ['goias ec']),
  c('coritiba', 'Coritiba', 2, ['coxa']),
  c('bragantino', 'Red Bull Bragantino', 2, ['bragantino', 'rb bragantino']),
  c('america-mg', 'América-MG', 2, ['america mineiro', 'america mg'], ['cali', 'mexico', 'rn', 'rj']),
  c('atletico-go', 'Atlético-GO', 3, ['atletico goianiense', 'atletico go']),
  c('juventude', 'Juventude', 3, ['ec juventude']),
  c('chapecoense', 'Chapecoense', 3, ['chape']),
  c('ponte-preta', 'Ponte Preta', 3),
  c('guarani', 'Guarani', 3, ['guarani fc'], ['paraguai', 'asuncion', 'assuncao']),
  c('portuguesa', 'Portuguesa', 3, ['portuguesa de desportos', 'lusa'], ['santista', 'rj']),
  c('nautico', 'Náutico', 3, ['clube nautico capibaribe']),
  c('santa-cruz', 'Santa Cruz', 3, ['santa cruz fc'], ['tenerife', 'rs']),
  c('paysandu', 'Paysandu', 3),
  c('remo', 'Remo', 3, ['clube do remo']),
  c('criciuma', 'Criciúma', 3),
  c('avai', 'Avaí', 3),
  c('figueirense', 'Figueirense', 3),
  c('cuiaba', 'Cuiabá', 3),
  c('mirassol', 'Mirassol', 3),
  // Argentina, Uruguai e América do Sul
  c('independiente', 'Independiente', 2, ['ca independiente'], ['del valle', 'medellin', 'santa fe', 'rivadavia', 'petrolero']),
  c('racing', 'Racing', 2, ['racing club', 'racing avellaneda'], ['strasbourg', 'santander', 'genk', 'montevideo', 'ferrol', 'lens', 'paris', 'cordoba']),
  c('san-lorenzo', 'San Lorenzo', 2, ['san lorenzo de almagro']),
  c('estudiantes', 'Estudiantes', 2, ['estudiantes de la plata'], ['merida', 'tecos', 'rio cuarto', 'caseros']),
  c('velez', 'Vélez Sarsfield', 2, ['velez']),
  c('newells', "Newell's Old Boys", 2, ['newells', 'newell s old boys']),
  c('rosario-central', 'Rosario Central', 3),
  c('lanus', 'Lanús', 3),
  c('penarol', 'Peñarol', 2),
  c('nacional-uru', 'Nacional', 2, ['club nacional', 'nacional de montevideo', 'nacional montevideu'], ['atletico nacional', 'nacional sp', 'madeira', 'nacional am', 'asuncion', 'potosi', 'patos']),
  c('atletico-nacional', 'Atlético Nacional', 2, ['atletico nacional medellin']),
  c('millonarios', 'Millonarios', 3),
  c('america-cali', 'América de Cali', 3, ['america cali']),
  c('colo-colo', 'Colo-Colo', 2, ['colo colo']),
  c('universidad-chile', 'Universidad de Chile', 3, ['u de chile', 'universidad de chile']),
  c('olimpia', 'Olimpia', 3, ['club olimpia'], ['honduras', 'tegucigalpa']),
  c('cerro-porteno', 'Cerro Porteño', 3, ['cerro porteno']),
  c('ldu', 'LDU Quito', 3, ['liga de quito', 'ldu']),
  c('barcelona-sc', 'Barcelona de Guayaquil', 3, ['barcelona sc', 'barcelona de guayaquil']),
  c('independiente-valle', 'Independiente del Valle', 3, ['del valle']),
  c('alianza-lima', 'Alianza Lima', 3),
  c('universitario', 'Universitario', 3, ['universitario de deportes'], ['sucre', 'pando']),
  // México e Estados Unidos
  c('club-america', 'América (México)', 2, ['club america', 'america mexico', 'club de futbol america'], ['mineiro', 'cali', 'rn']),
  c('chivas', 'Chivas', 2, ['guadalajara', 'cd guadalajara'], ['usa']),
  c('cruz-azul', 'Cruz Azul', 3),
  c('tigres', 'Tigres', 3, ['tigres uanl']),
  c('monterrey', 'Monterrey', 3, ['cf monterrey', 'rayados']),
  c('pumas', 'Pumas', 3, ['pumas unam', 'unam']),
  c('inter-miami', 'Inter Miami', 2),
  c('la-galaxy', 'LA Galaxy', 2, ['los angeles galaxy', 'galaxy']),
  c('ny-red-bulls', 'New York Red Bulls', 3, ['ny red bulls', 'red bulls', 'metrostars']),
  c('orlando-city', 'Orlando City', 3),
  c('nycfc', 'New York City', 3, ['nycfc', 'new york city fc']),
  // Inglaterra
  c('newcastle', 'Newcastle', 2, ['newcastle united'], ['jets']),
  c('aston-villa', 'Aston Villa', 2),
  c('west-ham', 'West Ham', 2, ['west ham united']),
  c('everton', 'Everton', 2, [], ['vina del mar', 'chile']),
  c('leeds', 'Leeds United', 2, ['leeds']),
  c('nottingham', 'Nottingham Forest', 3, ['nottingham']),
  c('leicester', 'Leicester City', 2, ['leicester']),
  c('southampton', 'Southampton', 3),
  c('fulham', 'Fulham', 3),
  c('wolves', 'Wolverhampton', 3, ['wolves', 'wolverhampton wanderers']),
  c('crystal-palace', 'Crystal Palace', 3),
  c('brighton', 'Brighton', 3, ['brighton hove albion']),
  // Espanha
  c('athletic', 'Athletic Bilbao', 2, ['athletic club', 'bilbao']),
  c('real-sociedad', 'Real Sociedad', 2),
  c('villarreal', 'Villarreal', 2),
  c('betis', 'Real Betis', 2, ['betis']),
  c('celta', 'Celta de Vigo', 3, ['celta']),
  c('deportivo', 'Deportivo La Coruña', 3, ['deportivo la coruna', 'deportivo'], ['cali', 'tachira', 'alaves', 'quito', 'saprissa', 'toluca', 'municipal']),
  c('espanyol', 'Espanyol', 3),
  c('malaga', 'Málaga', 3),
  // Itália
  c('lazio', 'Lazio', 2),
  c('fiorentina', 'Fiorentina', 2),
  c('atalanta', 'Atalanta', 2),
  c('torino', 'Torino', 3),
  c('parma', 'Parma', 3),
  c('sampdoria', 'Sampdoria', 3),
  c('udinese', 'Udinese', 3),
  c('bologna', 'Bologna', 3),
  // Alemanha
  c('leverkusen', 'Bayer Leverkusen', 2, ['leverkusen']),
  c('schalke', 'Schalke 04', 2, ['schalke']),
  c('wolfsburg', 'Wolfsburg', 3, ['vfl wolfsburg']),
  c('hamburgo', 'Hamburgo', 3, ['hamburger sv', 'hamburg']),
  c('werder', 'Werder Bremen', 3, ['werder', 'bremen']),
  c('stuttgart', 'Stuttgart', 3, ['vfb stuttgart']),
  c('eintracht', 'Eintracht Frankfurt', 3, ['frankfurt'], ['braunschweig']),
  c('leipzig', 'RB Leipzig', 2, ['leipzig']),
  c('gladbach', 'Borussia Mönchengladbach', 3, ['monchengladbach', 'gladbach']),
  // França e Portugal
  c('lille', 'Lille', 3),
  c('nice', 'Nice', 3, ['ogc nice']),
  c('rennes', 'Rennes', 3),
  c('bordeaux', 'Bordeaux', 3, ['girondins de bordeaux']),
  c('saint-etienne', 'Saint-Étienne', 3, ['saint etienne', 'st etienne']),
  c('braga', 'Braga', 3, ['sc braga', 'sporting braga']),
  // Holanda, Escócia, Turquia, Leste Europeu, Bélgica, Áustria, Suíça
  c('psv', 'PSV', 2, ['psv eindhoven']),
  c('feyenoord', 'Feyenoord', 2),
  c('rangers', 'Rangers', 3, ['glasgow rangers'], ['queens park', 'qpr', 'texas', 'new york']),
  c('besiktas', 'Beşiktaş', 3, ['besiktas']),
  c('trabzonspor', 'Trabzonspor', 3),
  c('zenit', 'Zenit', 2, ['zenit sao petersburgo', 'zenit saint petersburg']),
  c('cska', 'CSKA Moscou', 3, ['cska moscow', 'cska moscou'], ['sofia']),
  c('spartak', 'Spartak Moscou', 3, ['spartak moscow', 'spartak moscou'], ['trnava']),
  c('shakhtar', 'Shakhtar Donetsk', 2, ['shakhtar']),
  c('dynamo-kiev', 'Dínamo de Kiev', 3, ['dynamo kyiv', 'dynamo kiev', 'dinamo kiev', 'dinamo de kiev']),
  c('olympiacos', 'Olympiacos', 3, ['olympiakos']),
  c('panathinaikos', 'Panathinaikos', 3),
  c('anderlecht', 'Anderlecht', 3),
  c('brugge', 'Club Brugge', 3, ['brugge', 'bruges']),
  c('salzburg', 'RB Salzburg', 3, ['salzburg', 'red bull salzburg']),
  c('basel', 'Basel', 3, ['basileia', 'fc basel']),
  // Ásia e Oriente Médio
  c('al-ittihad', 'Al-Ittihad', 3, ['al ittihad']),
  c('al-ahli', 'Al-Ahli', 3, ['al ahli'], ['al ahly', 'doha', 'dubai']),
  c('al-sadd', 'Al-Sadd', 3, ['al sadd']),
  c('kashima', 'Kashima Antlers', 3, ['kashima']),
  c('vissel-kobe', 'Vissel Kobe', 3, ['vissel']),
  c('guangzhou', 'Guangzhou Evergrande', 3, ['guangzhou']),
);

const nation = (id: string, name: string, colors: [string, string], aliases: string[] = [], tier: 1 | 2 | 3 = 1): Team => ({
  id,
  name,
  colors,
  aliases: [normalize(name), ...aliases],
  tier,
});

/** Seleção sem cor definida. */
const n = (id: string, name: string, tier: 1 | 2 | 3, aliases: string[] = [], not?: string[]): Team => ({
  id,
  name,
  colors: ['#FFFFFF', '#111111'],
  aliases: [normalize(name), ...aliases],
  not,
  tier,
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
  n('mexico', 'México', 2, ['mexicano']),
  n('eua', 'Estados Unidos', 2, ['eua', 'usa', 'estadunidense', 'norte americano']),
  n('japao', 'Japão', 2, ['japones']),
  n('coreia-sul', 'Coreia do Sul', 2, ['sul coreano', 'coreia'], ['norte']),
  n('nigeria', 'Nigéria', 2, ['nigeriano']),
  n('camaroes', 'Camarões', 2, ['camaronense', 'camaroes']),
  n('gana', 'Gana', 2, ['ganes', 'ganense']),
  n('senegal', 'Senegal', 2, ['senegales']),
  n('costa-marfim', 'Costa do Marfim', 2, ['marfinense']),
  n('marrocos', 'Marrocos', 2, ['marroquino']),
  n('egito', 'Egito', 3, ['egipcio']),
  n('argelia', 'Argélia', 3, ['argelino']),
  n('suecia', 'Suécia', 2, ['sueco']),
  n('dinamarca', 'Dinamarca', 2, ['dinamarques']),
  n('noruega', 'Noruega', 3, ['noruegues']),
  n('polonia', 'Polônia', 2, ['polones']),
  n('servia', 'Sérvia', 2, ['servio']),
  n('suica', 'Suíça', 2, ['suico']),
  n('austria', 'Áustria', 3, ['austriaco']),
  n('turquia', 'Turquia', 3, ['turco']),
  n('russia', 'Rússia', 3, ['russo']),
  n('ucrania', 'Ucrânia', 3, ['ucraniano']),
  n('grecia', 'Grécia', 3, ['grego']),
  n('escocia', 'Escócia', 3, ['escoces']),
  n('gales', 'País de Gales', 3, ['gales', 'gales'], []),
  n('irlanda', 'Irlanda', 3, ['irlandes'], ['norte']),
  n('tchequia', 'República Tcheca', 3, ['tchequia', 'tcheco', 'republica checa']),
  n('chile', 'Chile', 2, ['chileno']),
  n('paraguai', 'Paraguai', 2, ['paraguaio']),
  n('peru', 'Peru', 3, ['peruano']),
  n('equador', 'Equador', 3, ['equatoriano']),
  n('venezuela', 'Venezuela', 3, ['venezuelano']),
  n('bolivia', 'Bolívia', 3, ['boliviano']),
  n('costa-rica', 'Costa Rica', 3, ['costarriquenho']),
  n('australia', 'Austrália', 3, ['australiano']),
  n('arabia', 'Arábia Saudita', 3, ['saudita']),
  n('ira', 'Irã', 3, ['iraniano', 'ira']),
  n('canada', 'Canadá', 3, ['canadense']),
];

/**
 * Sorteia clubes ou seleções até o nível pedido: 1 = só os gigantes
 * (padrão dos temas), 2 = inclui os conhecidos, 3 = vale tudo.
 */
export function drawTeams(pool: Team[], count: number, rng: () => number, level: 1 | 2 | 3): Team[] {
  return drawDistinct(pool.filter((t) => t.tier <= level), count, rng);
}

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

/** Clube ou seleção pelo nome digitado (nome ou apelido exato, sem acento). */
export function findTeamByName(raw: string): Team | undefined {
  const value = normalize(raw);
  if (!value) return undefined;
  return [...CLUBS, ...NATIONS].find((t) => normalize(t.name) === value || t.aliases.includes(value));
}

/** Regiões para temas que só fazem sentido com certos clubes (Brasileirão, Libertadores, Champions). */
const BR_IDS = 'flamengo palmeiras corinthians sao-paulo santos gremio internacional atletico-mg cruzeiro vasco fluminense botafogo athletico-pr bahia vitoria sport ceara fortaleza goias coritiba bragantino america-mg atletico-go juventude chapecoense ponte-preta guarani portuguesa nautico santa-cruz paysandu remo criciuma avai figueirense cuiaba mirassol'.split(' ');
const SA_IDS = [...BR_IDS, ...'boca river independiente racing san-lorenzo estudiantes velez newells rosario-central lanus penarol nacional-uru atletico-nacional millonarios america-cali colo-colo universidad-chile olimpia cerro-porteno ldu barcelona-sc independiente-valle alianza-lima universitario'.split(' ')];
const EU_IDS = 'real-madrid barcelona atletico-madrid manchester-united manchester-city liverpool chelsea arsenal tottenham bayern dortmund juventus milan inter psg porto benfica ajax fenerbahce galatasaray napoli roma sevilla valencia marseille lyon monaco sporting celtic newcastle aston-villa west-ham everton leeds nottingham leicester southampton fulham wolves crystal-palace brighton athletic real-sociedad villarreal betis celta deportivo espanyol malaga lazio fiorentina atalanta torino parma sampdoria udinese bologna leverkusen schalke wolfsburg hamburgo werder stuttgart eintracht leipzig gladbach lille nice rennes bordeaux saint-etienne braga psv feyenoord rangers besiktas trabzonspor zenit cska spartak shakhtar dynamo-kiev olympiacos panathinaikos anderlecht brugge salzburg basel'.split(' ');

export type ClubRegion = 'br' | 'sa' | 'eu';
const REGIONS: Record<ClubRegion, Set<string>> = { br: new Set(BR_IDS), sa: new Set(SA_IDS), eu: new Set(EU_IDS) };

export function clubsIn(region: ClubRegion | undefined): Team[] {
  return region ? CLUBS.filter((t) => REGIONS[region].has(t.id)) : CLUBS;
}
