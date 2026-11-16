/**
 * "Que time é esse?": escalações titulares de jogos marcantes.
 * Curadoria: só entra time com escalação conferida (final/jogo citado em `match`).
 * As linhas vão do goleiro ao ataque, como aparecem no campinho.
 */
export interface Lineup {
  id: string;
  /** Nome do time como o bot revela. */
  team: string;
  /** Formas aceitas para o time (normalizadas na comparação). */
  aliases: string[];
  year: number;
  /** Jogo de referência, mostrado na revelação. */
  match: string;
  lines: string[][];
}

export const LINEUPS: Lineup[] = [
  {
    id: 'brasil-1970', team: 'Brasil', aliases: ['brasil', 'selecao brasileira', 'selecao'], year: 1970,
    match: 'final da Copa de 1970, 4 x 1 na Itália',
    lines: [['Félix'], ['Carlos Alberto', 'Brito', 'Piazza', 'Everaldo'], ['Clodoaldo', 'Gérson'], ['Jairzinho', 'Tostão', 'Pelé', 'Rivellino']],
  },
  {
    id: 'brasil-1958', team: 'Brasil', aliases: ['brasil', 'selecao brasileira', 'selecao'], year: 1958,
    match: 'final da Copa de 1958, 5 x 2 na Suécia',
    lines: [['Gilmar'], ['Djalma Santos', 'Bellini', 'Orlando', 'Nilton Santos'], ['Zito', 'Didi'], ['Garrincha', 'Vavá', 'Pelé', 'Zagallo']],
  },
  {
    id: 'brasil-1994', team: 'Brasil', aliases: ['brasil', 'selecao brasileira', 'selecao'], year: 1994,
    match: 'final da Copa de 1994, contra a Itália (pênaltis)',
    lines: [['Taffarel'], ['Jorginho', 'Aldair', 'Márcio Santos', 'Branco'], ['Mauro Silva', 'Dunga', 'Mazinho', 'Zinho'], ['Bebeto', 'Romário']],
  },
  {
    id: 'brasil-2002', team: 'Brasil', aliases: ['brasil', 'selecao brasileira', 'selecao'], year: 2002,
    match: 'final da Copa de 2002, 2 x 0 na Alemanha',
    lines: [['Marcos'], ['Lúcio', 'Edmílson', 'Roque Júnior'], ['Cafu', 'Gilberto Silva', 'Kléberson', 'Roberto Carlos'], ['Ronaldinho', 'Rivaldo'], ['Ronaldo']],
  },
  {
    id: 'argentina-1986', team: 'Argentina', aliases: ['argentina'], year: 1986,
    match: 'final da Copa de 1986, 3 x 2 na Alemanha Ocidental',
    lines: [['Pumpido'], ['Cuciuffo', 'Brown', 'Ruggeri', 'Olarticoechea'], ['Giusti', 'Batista', 'Enrique', 'Burruchaga'], ['Maradona', 'Valdano']],
  },
  {
    id: 'argentina-2022', team: 'Argentina', aliases: ['argentina'], year: 2022,
    match: 'final da Copa de 2022, contra a França (pênaltis)',
    lines: [['Emiliano Martínez'], ['Molina', 'Romero', 'Otamendi', 'Tagliafico'], ['De Paul', 'Enzo Fernández', 'Mac Allister'], ['Messi', 'Julián Álvarez', 'Di María']],
  },
  {
    id: 'holanda-1974', team: 'Holanda', aliases: ['holanda', 'paises baixos'], year: 1974,
    match: 'final da Copa de 1974, contra a Alemanha Ocidental',
    lines: [['Jongbloed'], ['Suurbier', 'Rijsbergen', 'Haan', 'Krol'], ['Jansen', 'Neeskens', 'Van Hanegem'], ['Rep', 'Cruyff', 'Rensenbrink']],
  },
  {
    id: 'italia-2006', team: 'Itália', aliases: ['italia'], year: 2006,
    match: 'final da Copa de 2006, contra a França (pênaltis)',
    lines: [['Buffon'], ['Zambrotta', 'Cannavaro', 'Materazzi', 'Grosso'], ['Gattuso', 'Pirlo'], ['Camoranesi', 'Totti', 'Perrotta'], ['Toni']],
  },
  {
    id: 'espanha-2010', team: 'Espanha', aliases: ['espanha'], year: 2010,
    match: 'final da Copa de 2010, 1 x 0 na Holanda',
    lines: [['Casillas'], ['Sergio Ramos', 'Piqué', 'Puyol', 'Capdevila'], ['Busquets', 'Xabi Alonso'], ['Pedro', 'Xavi', 'Iniesta'], ['Villa']],
  },
  {
    id: 'alemanha-2014', team: 'Alemanha', aliases: ['alemanha'], year: 2014,
    match: 'final da Copa de 2014, 1 x 0 na Argentina',
    lines: [['Neuer'], ['Lahm', 'Boateng', 'Hummels', 'Höwedes'], ['Schweinsteiger', 'Kramer'], ['Müller', 'Kroos', 'Özil'], ['Klose']],
  },
  {
    id: 'franca-2018', team: 'França', aliases: ['franca'], year: 2018,
    match: 'final da Copa de 2018, 4 x 2 na Croácia',
    lines: [['Lloris'], ['Pavard', 'Varane', 'Umtiti', 'Lucas Hernández'], ['Kanté', 'Pogba'], ['Mbappé', 'Griezmann', 'Matuidi'], ['Giroud']],
  },
  {
    id: 'barcelona-2009', team: 'Barcelona', aliases: ['barcelona', 'barca', 'fc barcelona'], year: 2009,
    match: 'final da Champions de 2009, 2 x 0 no Manchester United',
    lines: [['Valdés'], ['Puyol', 'Touré', 'Piqué', 'Sylvinho'], ['Xavi', 'Busquets', 'Iniesta'], ['Messi', "Eto'o", 'Henry']],
  },
  {
    id: 'barcelona-2011', team: 'Barcelona', aliases: ['barcelona', 'barca', 'fc barcelona'], year: 2011,
    match: 'final da Champions de 2011, 3 x 1 no Manchester United',
    lines: [['Valdés'], ['Daniel Alves', 'Piqué', 'Mascherano', 'Abidal'], ['Xavi', 'Busquets', 'Iniesta'], ['Pedro', 'Messi', 'Villa']],
  },
  {
    id: 'manchester-united-1999', team: 'Manchester United', aliases: ['manchester united', 'man united', 'united', 'manchester utd'], year: 1999,
    match: 'final da Champions de 1999, 2 x 1 no Bayern',
    lines: [['Schmeichel'], ['Gary Neville', 'Johnsen', 'Stam', 'Irwin'], ['Beckham', 'Butt'], ['Giggs', 'Blomqvist'], ['Yorke', 'Cole']],
  },
  {
    id: 'liverpool-2005', team: 'Liverpool', aliases: ['liverpool'], year: 2005,
    match: 'final da Champions de 2005 em Istambul, contra o Milan (pênaltis)',
    lines: [['Dudek'], ['Finnan', 'Carragher', 'Hyypiä', 'Traoré'], ['Xabi Alonso', 'Gerrard'], ['Luis García', 'Riise', 'Kewell'], ['Baroš']],
  },
  {
    id: 'milan-2007', team: 'Milan', aliases: ['milan', 'ac milan'], year: 2007,
    match: 'final da Champions de 2007, 2 x 1 no Liverpool',
    lines: [['Dida'], ['Oddo', 'Nesta', 'Maldini', 'Jankulovski'], ['Gattuso', 'Pirlo', 'Ambrosini'], ['Seedorf', 'Kaká'], ['Inzaghi']],
  },
  {
    id: 'chelsea-2012', team: 'Chelsea', aliases: ['chelsea'], year: 2012,
    match: 'final da Champions de 2012, contra o Bayern (pênaltis)',
    lines: [['Čech'], ['Bosingwa', 'David Luiz', 'Cahill', 'Ashley Cole'], ['Mikel', 'Lampard'], ['Kalou', 'Mata', 'Bertrand'], ['Drogba']],
  },
  {
    id: 'real-madrid-2017', team: 'Real Madrid', aliases: ['real madrid', 'real'], year: 2017,
    match: 'final da Champions de 2017, 4 x 1 na Juventus',
    lines: [['Keylor Navas'], ['Carvajal', 'Varane', 'Sergio Ramos', 'Marcelo'], ['Casemiro', 'Kroos', 'Modrić'], ['Isco'], ['Benzema', 'Cristiano Ronaldo']],
  },
  {
    id: 'liverpool-2019', team: 'Liverpool', aliases: ['liverpool'], year: 2019,
    match: 'final da Champions de 2019, 2 x 0 no Tottenham',
    lines: [['Alisson'], ['Alexander-Arnold', 'Matip', 'Van Dijk', 'Robertson'], ['Henderson', 'Fabinho', 'Wijnaldum'], ['Salah', 'Firmino', 'Mané']],
  },
  {
    id: 'bayern-2020', team: 'Bayern de Munique', aliases: ['bayern', 'bayern de munique', 'bayern munique', 'bayern munich'], year: 2020,
    match: 'final da Champions de 2020, 1 x 0 no PSG',
    lines: [['Neuer'], ['Kimmich', 'Boateng', 'Alaba', 'Davies'], ['Thiago', 'Goretzka'], ['Gnabry', 'Müller', 'Coman'], ['Lewandowski']],
  },
  {
    id: 'flamengo-1981', team: 'Flamengo', aliases: ['flamengo', 'mengao', 'fla'], year: 1981,
    match: 'Mundial de 1981, 3 x 0 no Liverpool',
    lines: [['Raul'], ['Leandro', 'Marinho', 'Mozer', 'Júnior'], ['Andrade', 'Adílio', 'Zico'], ['Tita', 'Nunes', 'Lico']],
  },
  {
    id: 'flamengo-2019', team: 'Flamengo', aliases: ['flamengo', 'mengao', 'fla'], year: 2019,
    match: 'final da Libertadores de 2019, 2 x 1 no River Plate',
    lines: [['Diego Alves'], ['Rafinha', 'Rodrigo Caio', 'Pablo Marí', 'Filipe Luís'], ['Willian Arão', 'Gerson'], ['Everton Ribeiro', 'Arrascaeta'], ['Bruno Henrique', 'Gabigol']],
  },
  {
    id: 'sao-paulo-2005', team: 'São Paulo', aliases: ['sao paulo', 'spfc', 'tricolor paulista'], year: 2005,
    match: 'Mundial de 2005, 1 x 0 no Liverpool',
    lines: [['Rogério Ceni'], ['Fabão', 'Lugano', 'Edcarlos'], ['Cicinho', 'Mineiro', 'Josué', 'Júnior'], ['Danilo'], ['Aloísio', 'Amoroso']],
  },
  {
    id: 'corinthians-2012', team: 'Corinthians', aliases: ['corinthians', 'timao', 'corintians'], year: 2012,
    match: 'Mundial de 2012, 1 x 0 no Chelsea',
    lines: [['Cássio'], ['Alessandro', 'Chicão', 'Paulo André', 'Fábio Santos'], ['Ralf', 'Paulinho'], ['Jorge Henrique', 'Danilo', 'Emerson Sheik'], ['Guerrero']],
  },
  {
    id: 'brasil-1982', team: 'Brasil', aliases: ['brasil', 'selecao brasileira', 'selecao'], year: 1982,
    match: 'jogo contra a Itália na Copa de 1982 (a "Tragédia do Sarriá")',
    lines: [['Valdir Peres'], ['Leandro', 'Oscar', 'Luizinho', 'Júnior'], ['Toninho Cerezo', 'Falcão', 'Sócrates', 'Zico'], ['Serginho', 'Éder']],
  },
  {
    id: 'uruguai-1950', team: 'Uruguai', aliases: ['uruguai', 'celeste'], year: 1950,
    match: 'jogo decisivo da Copa de 1950 no Maracanã, 2 x 1 no Brasil',
    lines: [['Máspoli'], ['Matías González', 'Tejera'], ['Gambetta', 'Obdulio Varela', 'Rodríguez Andrade'], ['Ghiggia', 'Julio Pérez', 'Míguez', 'Schiaffino', 'Morán']],
  },
  {
    id: 'inter-2010', team: 'Inter de Milão', aliases: ['inter', 'inter de milao', 'internazionale', 'inter milan'], year: 2010,
    match: 'final da Champions de 2010, 2 x 0 no Bayern',
    lines: [['Júlio César'], ['Maicon', 'Lúcio', 'Samuel', 'Chivu'], ['Zanetti', 'Cambiasso'], ['Eto\'o', 'Sneijder', 'Pandev'], ['Milito']],
  },
  {
    id: 'porto-2004', team: 'Porto', aliases: ['porto', 'fc porto'], year: 2004,
    match: 'final da Champions de 2004, 3 x 0 no Monaco',
    lines: [['Vítor Baía'], ['Paulo Ferreira', 'Jorge Costa', 'Ricardo Carvalho', 'Nuno Valente'], ['Costinha', 'Pedro Mendes', 'Maniche'], ['Deco'], ['Carlos Alberto', 'Derlei']],
  },
  {
    id: 'manchester-united-2008', team: 'Manchester United', aliases: ['manchester united', 'man united', 'united', 'manchester utd'], year: 2008,
    match: 'final da Champions de 2008, contra o Chelsea (pênaltis)',
    lines: [['Van der Sar'], ['Brown', 'Ferdinand', 'Vidić', 'Evra'], ['Hargreaves', 'Scholes', 'Carrick'], ['Cristiano Ronaldo', 'Rooney', 'Tevez']],
  },
  {
    id: 'barcelona-2015', team: 'Barcelona', aliases: ['barcelona', 'barca', 'fc barcelona'], year: 2015,
    match: 'final da Champions de 2015, 3 x 1 na Juventus',
    lines: [['Ter Stegen'], ['Daniel Alves', 'Piqué', 'Mascherano', 'Jordi Alba'], ['Rakitić', 'Busquets', 'Iniesta'], ['Messi', 'Suárez', 'Neymar']],
  },
  {
    id: 'real-madrid-2014', team: 'Real Madrid', aliases: ['real madrid', 'real'], year: 2014,
    match: 'final da Champions de 2014, 4 x 1 no Atlético de Madrid (a "Décima")',
    lines: [['Casillas'], ['Carvajal', 'Varane', 'Sergio Ramos', 'Fábio Coentrão'], ['Khedira', 'Modrić', 'Di María'], ['Bale', 'Benzema', 'Cristiano Ronaldo']],
  },
  {
    id: 'palmeiras-2021', team: 'Palmeiras', aliases: ['palmeiras', 'verdao'], year: 2021,
    match: 'final da Libertadores de 2021, 2 x 1 no Flamengo',
    lines: [['Weverton'], ['Mayke', 'Gustavo Gómez', 'Luan', 'Piquerez'], ['Danilo', 'Zé Rafael'], ['Gustavo Scarpa', 'Raphael Veiga', 'Dudu'], ['Rony']],
  },
  {
    id: 'flamengo-2022', team: 'Flamengo', aliases: ['flamengo', 'mengao', 'fla'], year: 2022,
    match: 'final da Libertadores de 2022, 1 x 0 no Athletico-PR',
    lines: [['Santos'], ['Rodinei', 'David Luiz', 'Léo Pereira', 'Filipe Luís'], ['Thiago Maia', 'João Gomes'], ['Everton Ribeiro', 'Arrascaeta'], ['Gabigol', 'Pedro']],
  },
];

export function getLineup(id: string): Lineup | undefined {
  return LINEUPS.find((l) => l.id === id);
}
