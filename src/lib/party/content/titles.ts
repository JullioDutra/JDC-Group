/**
 * Títulos para a Grade 3x3 ("campeão do mundo", "Bola de Ouro", "campeão da
 * Champions", "campeão da Libertadores"). Listas curadas dos campeões mais
 * conhecidos: o nome vale junto com a seleção (Copa, Bola de Ouro) ou com o
 * clube do título (Champions, Libertadores), o que separa homônimos
 * ("Ronaldo" do Brasil ≠ Cristiano Ronaldo).
 *
 * As listas não têm todos os campeões. Quem não estiver nelas é conferido
 * pela IA (pergunta de sim ou não, guardada na base), e na dúvida não vale.
 */
export type TitleId = 'copa' | 'bola' | 'champions' | 'libertadores';

export interface TitleEntry {
  name: string;
  /** Id da seleção (teams.ts). */
  nation?: string;
  /** Id do clube com que ganhou (teams.ts). */
  club?: string;
}

const list = (names: string) => names.split(',').map((n) => n.trim()).filter(Boolean);
const forNation = (nation: string, names: string): TitleEntry[] => list(names).map((name) => ({ name, nation }));
const forClub = (club: string, names: string): TitleEntry[] => list(names).map((name) => ({ name, club }));

export const TITLE_INFO: Record<TitleId, { label: string; question: string }> = {
  copa: { label: 'Campeão do Mundo', question: 'foi campeão da Copa do Mundo (estava no elenco campeão)' },
  bola: { label: 'Bola de Ouro', question: 'ganhou a Bola de Ouro da France Football' },
  champions: { label: 'Campeão da Champions', question: 'foi campeão da Liga dos Campeões da Europa como jogador (estava no elenco campeão)' },
  libertadores: { label: 'Campeão da Libertadores', question: 'foi campeão da Copa Libertadores como jogador (estava no elenco campeão)' },
};

/** Elencos campeões do mundo (os nomes mais conhecidos de cada um). */
const COPA: TitleEntry[] = [
  ...forNation('brasil', 'Gilmar, Djalma Santos, Nilton Santos, Bellini, Orlando, Zito, Didi, Garrincha, Vavá, Pelé, Zagallo, Mauro Ramos, Amarildo, Zózimo, Jairzinho, Tostão, Rivellino, Gérson, Carlos Alberto Torres, Clodoaldo, Félix, Brito, Piazza, Everaldo, Paulo Cézar Caju, Dadá Maravilha, Emerson Leão'),
  ...forNation('brasil', 'Taffarel, Jorginho, Aldair, Márcio Santos, Branco, Leonardo, Mauro Silva, Dunga, Mazinho, Zinho, Raí, Bebeto, Romário, Ronaldo, Cafu, Müller, Viola, Paulo Sérgio, Ricardo Rocha, Ronaldão, Zetti'),
  ...forNation('brasil', 'Marcos, Lúcio, Roque Júnior, Edmílson, Roberto Carlos, Gilberto Silva, Kléberson, Ronaldinho, Rivaldo, Denílson, Juninho Paulista, Edílson, Luizão, Kaká, Belletti, Ricardinho, Vampeta, Anderson Polga, Dida, Rogério Ceni'),
  ...forNation('inglaterra', 'Gordon Banks, Bobby Moore, Bobby Charlton, Geoff Hurst, Martin Peters, Roger Hunt, Nobby Stiles, Jack Charlton, Alan Ball, Ray Wilson, George Cohen, Jimmy Greaves'),
  ...forNation('alemanha', 'Sepp Maier, Franz Beckenbauer, Gerd Müller, Paul Breitner, Berti Vogts, Wolfgang Overath, Uli Hoeneß, Rainer Bonhof, Jürgen Grabowski, Bernd Hölzenbein, Günter Netzer, Hans-Georg Schwarzenbeck'),
  ...forNation('alemanha', 'Lothar Matthäus, Jürgen Klinsmann, Rudi Völler, Andreas Brehme, Jürgen Kohler, Guido Buchwald, Bodo Illgner, Thomas Häßler, Pierre Littbarski, Klaus Augenthaler, Karl-Heinz Riedle, Stefan Reuter, Thomas Berthold, Olaf Thon'),
  ...forNation('alemanha', 'Manuel Neuer, Philipp Lahm, Jérôme Boateng, Mats Hummels, Benedikt Höwedes, Bastian Schweinsteiger, Sami Khedira, Toni Kroos, Thomas Müller, Mesut Özil, Miroslav Klose, Mario Götze, André Schürrle, Per Mertesacker, Lukas Podolski, Julian Draxler, Christoph Kramer, Matthias Ginter, Erik Durm, Kevin Großkreutz, Shkodran Mustafi, Roman Weidenfeller, Ron-Robert Zieler'),
  ...forNation('argentina', 'Mario Kempes, Daniel Passarella, Ubaldo Fillol, Osvaldo Ardiles, Leopoldo Luque, Alberto Tarantini, Daniel Bertoni, Américo Gallego, René Houseman, Norberto Alonso'),
  ...forNation('argentina', 'Diego Maradona, Jorge Valdano, Jorge Burruchaga, Oscar Ruggeri, Nery Pumpido, José Luis Brown, Sergio Batista, Ricardo Giusti, Héctor Enrique, Julio Olarticoechea, Claudio Borghi, Ricardo Bochini'),
  ...forNation('argentina', 'Emiliano Martínez, Nahuel Molina, Cristian Romero, Nicolás Otamendi, Nicolás Tagliafico, Marcos Acuña, Rodrigo De Paul, Enzo Fernández, Alexis Mac Allister, Leandro Paredes, Ángel Di María, Lionel Messi, Julián Álvarez, Lautaro Martínez, Paulo Dybala, Gonzalo Montiel, Germán Pezzella, Lisandro Martínez, Juan Foyth, Guido Rodríguez, Exequiel Palacios, Alejandro Gómez, Thiago Almada, Ángel Correa, Franco Armani, Gerónimo Rulli'),
  ...forNation('italia', 'Dino Zoff, Paolo Rossi, Marco Tardelli, Gaetano Scirea, Claudio Gentile, Bruno Conti, Antonio Cabrini, Fulvio Collovati, Alessandro Altobelli, Giancarlo Antognoni, Franco Baresi, Giuseppe Bergomi, Francesco Graziani'),
  ...forNation('italia', 'Gianluigi Buffon, Fabio Cannavaro, Marco Materazzi, Gianluca Zambrotta, Fabio Grosso, Andrea Pirlo, Gennaro Gattuso, Daniele De Rossi, Mauro Camoranesi, Simone Perrotta, Francesco Totti, Luca Toni, Alessandro Del Piero, Alberto Gilardino, Vincenzo Iaquinta, Filippo Inzaghi, Alessandro Nesta, Andrea Barzagli, Massimo Oddo, Cristian Zaccardo, Angelo Peruzzi, Marco Amelia'),
  ...forNation('franca', "Fabien Barthez, Lilian Thuram, Marcel Desailly, Laurent Blanc, Bixente Lizarazu, Didier Deschamps, Emmanuel Petit, Christian Karembeu, Zinédine Zidane, Youri Djorkaeff, Stéphane Guivarc'h, Thierry Henry, David Trezeguet, Robert Pires, Patrick Vieira, Frank Leboeuf, Christophe Dugarry, Alain Boghossian, Vincent Candela, Bernard Lama"),
  ...forNation('franca', "Hugo Lloris, Benjamin Pavard, Raphaël Varane, Samuel Umtiti, Lucas Hernández, N'Golo Kanté, Paul Pogba, Blaise Matuidi, Antoine Griezmann, Kylian Mbappé, Olivier Giroud, Ousmane Dembélé, Nabil Fekir, Corentin Tolisso, Steven N'Zonzi, Thomas Lemar, Florian Thauvin, Presnel Kimpembe, Benjamin Mendy, Djibril Sidibé, Adil Rami, Steve Mandanda, Alphonse Areola"),
  ...forNation('espanha', 'Iker Casillas, Sergio Ramos, Carles Puyol, Gerard Piqué, Joan Capdevila, Sergio Busquets, Xabi Alonso, Xavi, Andrés Iniesta, David Villa, Pedro, Fernando Torres, Cesc Fàbregas, Jesús Navas, David Silva, Juan Mata, Fernando Llorente, Raúl Albiol, Carlos Marchena, Álvaro Arbeloa, Javi Martínez, Pepe Reina, Víctor Valdés'),
  // Espanha 2026 (lista oficial de Luis de la Fuente, maio de 2026).
  ...forNation('espanha', 'Unai Simón, David Raya, Joan García, Marc Cucurella, Alejandro Grimaldo, Pau Cubarsí, Aymeric Laporte, Marc Pubill, Eric García, Marcos Llorente, Pedro Porro, Pedri, Fabián Ruiz, Martín Zubimendi, Gavi, Rodri, Mikel Merino, Álex Baena, Lamine Yamal, Dani Olmo, Mikel Oyarzabal, Nico Williams, Ferran Torres, Yeremy Pino, Borja Iglesias, Víctor Muñoz'),
  ...forNation('uruguai', 'Obdulio Varela, Alcides Ghiggia, Juan Alberto Schiaffino, Roque Máspoli, Óscar Míguez'),
];

/** Bola de Ouro (France Football), 1956 a 2026. */
const BOLA: TitleEntry[] = [
  { name: 'Stanley Matthews', nation: 'inglaterra' },
  { name: 'Alfredo Di Stéfano', nation: 'espanha' },
  { name: 'Raymond Kopa', nation: 'franca' },
  { name: 'Luis Suárez Miramontes', nation: 'espanha' },
  { name: 'Omar Sívori', nation: 'italia' },
  { name: 'Josef Masopust', nation: 'tchequia' },
  { name: 'Lev Yashin', nation: 'russia' },
  { name: 'Denis Law', nation: 'escocia' },
  { name: 'Eusébio', nation: 'portugal' },
  { name: 'Bobby Charlton', nation: 'inglaterra' },
  { name: 'Flórián Albert' },
  { name: 'George Best' },
  { name: 'Gianni Rivera', nation: 'italia' },
  { name: 'Gerd Müller', nation: 'alemanha' },
  { name: 'Johan Cruyff', nation: 'holanda' },
  { name: 'Franz Beckenbauer', nation: 'alemanha' },
  { name: 'Oleg Blokhin' },
  { name: 'Allan Simonsen', nation: 'dinamarca' },
  { name: 'Kevin Keegan', nation: 'inglaterra' },
  { name: 'Karl-Heinz Rummenigge', nation: 'alemanha' },
  { name: 'Paolo Rossi', nation: 'italia' },
  { name: 'Michel Platini', nation: 'franca' },
  { name: 'Igor Belanov' },
  { name: 'Ruud Gullit', nation: 'holanda' },
  { name: 'Marco van Basten', nation: 'holanda' },
  { name: 'Lothar Matthäus', nation: 'alemanha' },
  { name: 'Jean-Pierre Papin', nation: 'franca' },
  { name: 'Roberto Baggio', nation: 'italia' },
  { name: 'Hristo Stoichkov' },
  { name: 'George Weah' },
  { name: 'Matthias Sammer', nation: 'alemanha' },
  { name: 'Ronaldo', nation: 'brasil' },
  { name: 'Zinédine Zidane', nation: 'franca' },
  { name: 'Rivaldo', nation: 'brasil' },
  { name: 'Luís Figo', nation: 'portugal' },
  { name: 'Michael Owen', nation: 'inglaterra' },
  { name: 'Pavel Nedvěd', nation: 'tchequia' },
  { name: 'Andriy Shevchenko', nation: 'ucrania' },
  { name: 'Ronaldinho', nation: 'brasil' },
  { name: 'Fabio Cannavaro', nation: 'italia' },
  { name: 'Kaká', nation: 'brasil' },
  { name: 'Cristiano Ronaldo', nation: 'portugal' },
  { name: 'Lionel Messi', nation: 'argentina' },
  { name: 'Luka Modrić', nation: 'croacia' },
  { name: 'Karim Benzema', nation: 'franca' },
  { name: 'Rodri', nation: 'espanha' },
  { name: 'Ousmane Dembélé', nation: 'franca' },
  { name: 'Harry Kane', nation: 'inglaterra' },
];

/** Campeões da Champions (nomes mais conhecidos de cada clube campeão). */
const CHAMPIONS: TitleEntry[] = [
  ...forClub('real-madrid', 'Alfredo Di Stéfano, Ferenc Puskás, Paco Gento, Raymond Kopa, José Santamaría, Héctor Rial'),
  ...forClub('real-madrid', 'Raúl, Fernando Hierro, Roberto Carlos, Clarence Seedorf, Fernando Redondo, Predrag Mijatović, Fernando Morientes, Christian Panucci, Christian Karembeu, Manolo Sanchís, Guti, Iker Casillas, Míchel Salgado, Iván Helguera, Steve McManaman, Nicolas Anelka, Savio, Zinédine Zidane, Luís Figo, Claude Makélélé, Santiago Solari, Flávio Conceição'),
  ...forClub('real-madrid', 'Cristiano Ronaldo, Gareth Bale, Karim Benzema, Luka Modrić, Toni Kroos, Casemiro, Marcelo, Sergio Ramos, Raphaël Varane, Pepe, Dani Carvajal, Nacho, Isco, Lucas Vázquez, Marco Asensio, Keylor Navas, Ángel Di María, Xabi Alonso, Sami Khedira, Álvaro Morata, Danilo, James Rodríguez, Mateo Kovačić, Fábio Coentrão'),
  ...forClub('real-madrid', 'Thibaut Courtois, Vinícius Júnior, Rodrygo, Éder Militão, David Alaba, Federico Valverde, Eduardo Camavinga, Aurélien Tchouaméni, Ferland Mendy, Eden Hazard, Dani Ceballos, Jude Bellingham, Andriy Lunin, Antonio Rüdiger, Joselu, Brahim Díaz, Fran García, Arda Güler'),
  ...forClub('barcelona', 'Ronald Koeman, Hristo Stoichkov, Michael Laudrup, Pep Guardiola, Andoni Zubizarreta, José Mari Bakero, Txiki Begiristain, Julio Salinas, Eusebio Sacristán'),
  ...forClub('barcelona', "Ronaldinho, Samuel Eto'o, Deco, Carles Puyol, Xavi, Andrés Iniesta, Lionel Messi, Víctor Valdés, Juliano Belletti, Henrik Larsson, Rafael Márquez, Giovanni van Bronckhorst, Edmílson, Oleguer, Sylvinho, Ludovic Giuly, Thiago Motta, Mark van Bommel"),
  ...forClub('barcelona', 'Thierry Henry, Gerard Piqué, Sergio Busquets, Yaya Touré, Daniel Alves, Éric Abidal, Seydou Keita, Bojan, Pedro, David Villa, Javier Mascherano, Ibrahim Afellay, Maxwell, Adriano'),
  ...forClub('barcelona', 'Neymar, Luis Suárez, Ivan Rakitić, Jordi Alba, Marc-André ter Stegen, Claudio Bravo, Rafinha, Sergi Roberto, Jérémy Mathieu, Marc Bartra'),
  ...forClub('milan', 'Gianni Rivera, José Altafini, Cesare Maldini, Giovanni Trapattoni, Marco van Basten, Ruud Gullit, Frank Rijkaard, Franco Baresi, Paolo Maldini, Alessandro Costacurta, Mauro Tassotti, Carlo Ancelotti, Roberto Donadoni, Dejan Savićević, Daniele Massaro, Marcel Desailly, Zvonimir Boban, Demetrio Albertini, Christian Panucci'),
  ...forClub('milan', 'Andriy Shevchenko, Kaká, Andrea Pirlo, Clarence Seedorf, Gennaro Gattuso, Alessandro Nesta, Dida, Cafu, Rui Costa, Filippo Inzaghi, Rivaldo, Serginho, Kakha Kaladze, Massimo Ambrosini, Marek Jankulovski, Massimo Oddo, Alberto Gilardino, Cristian Brocchi'),
  ...forClub('inter', 'Giacinto Facchetti, Sandro Mazzola, Luis Suárez Miramontes, Mario Corso, Jair da Costa, Tarcisio Burgnich, Júlio César, Maicon, Lúcio, Walter Samuel, Javier Zanetti, Esteban Cambiasso, Wesley Sneijder, Diego Milito, Goran Pandev, Cristian Chivu, Dejan Stanković, Thiago Motta, Marco Materazzi, Mario Balotelli, Sulley Muntari, Iván Córdoba'),
  ...forClub('inter', "Samuel Eto'o"),
  ...forClub('bayern', 'Franz Beckenbauer, Gerd Müller, Sepp Maier, Uli Hoeneß, Paul Breitner, Karl-Heinz Rummenigge, Hans-Georg Schwarzenbeck, Oliver Kahn, Stefan Effenberg, Giovane Élber, Mehmet Scholl, Bixente Lizarazu, Willy Sagnol, Samuel Kuffour, Carsten Jancker, Hasan Salihamidžić, Claudio Pizarro, Owen Hargreaves'),
  ...forClub('bayern', 'Manuel Neuer, Philipp Lahm, Arjen Robben, Franck Ribéry, Bastian Schweinsteiger, Thomas Müller, Mario Mandžukić, Javi Martínez, Dante, Jérôme Boateng, David Alaba, Mario Gómez, Toni Kroos, Xherdan Shaqiri, Luiz Gustavo, Rafinha, Daniel van Buyten'),
  ...forClub('bayern', 'Robert Lewandowski, Joshua Kimmich, Alphonso Davies, Niklas Süle, Kingsley Coman, Serge Gnabry, Leon Goretzka, Thiago Alcântara, Ivan Perišić, Philippe Coutinho, Benjamin Pavard, Lucas Hernández, Corentin Tolisso'),
  ...forClub('liverpool', 'Kevin Keegan, Kenny Dalglish, Graeme Souness, Ian Rush, Alan Hansen, Bruce Grobbelaar, Phil Neal, Ray Clemence, Steven Gerrard, Xabi Alonso, Jamie Carragher, Sami Hyypiä, Jerzy Dudek, John Arne Riise, Dietmar Hamann, Vladimír Šmicer, Milan Baroš, Luis García, Harry Kewell, Djibril Cissé'),
  ...forClub('liverpool', 'Mohamed Salah, Sadio Mané, Roberto Firmino, Virgil van Dijk, Alisson, Trent Alexander-Arnold, Andrew Robertson, Jordan Henderson, Fabinho, Georginio Wijnaldum, James Milner, Divock Origi, Joël Matip, Joe Gomez, Xherdan Shaqiri, Naby Keïta, Alex Oxlade-Chamberlain, Dejan Lovren, Daniel Sturridge'),
  ...forClub('manchester-united', 'Bobby Charlton, George Best, Nobby Stiles, David Beckham, Ryan Giggs, Paul Scholes, Roy Keane, Andy Cole, Dwight Yorke, Teddy Sheringham, Ole Gunnar Solskjær, Peter Schmeichel, Jaap Stam, Gary Neville, Denis Irwin, Nicky Butt'),
  ...forClub('manchester-united', 'Cristiano Ronaldo, Wayne Rooney, Carlos Tevez, Rio Ferdinand, Nemanja Vidić, Edwin van der Sar, Patrice Evra, Michael Carrick, Owen Hargreaves, Wes Brown, Nani, Anderson, Park Ji-sung'),
  ...forClub('chelsea', 'Didier Drogba, Frank Lampard, John Terry, Petr Čech, Ashley Cole, Juan Mata, Ramires, Fernando Torres, John Obi Mikel, Salomon Kalou, José Bosingwa, Gary Cahill, Branislav Ivanović, Florent Malouda, Raul Meireles, David Luiz'),
  ...forClub('chelsea', "Mason Mount, N'Golo Kanté, Jorginho, Kai Havertz, Timo Werner, Christian Pulisic, Édouard Mendy, Thiago Silva, César Azpilicueta, Antonio Rüdiger, Andreas Christensen, Ben Chilwell, Reece James, Mateo Kovačić, Hakim Ziyech, Olivier Giroud, Callum Hudson-Odoi, Kepa Arrizabalaga, Emerson Palmieri, Marcos Alonso"),
  ...forClub('manchester-city', 'Erling Haaland, Kevin De Bruyne, Rodri, Bernardo Silva, İlkay Gündoğan, Jack Grealish, Phil Foden, Rúben Dias, Manuel Akanji, Nathan Aké, John Stones, Kyle Walker, Ederson, Riyad Mahrez, Julián Álvarez, Stefan Ortega, Kalvin Phillips, Aymeric Laporte, Sergio Gómez, Rico Lewis'),
  ...forClub('porto', 'Rabah Madjer, Paulo Futre, Juary, João Pinto, Deco, Ricardo Carvalho, Maniche, Derlei, Carlos Alberto, Paulo Ferreira, Vítor Baía, Costinha, Benni McCarthy, Jorge Costa, Nuno Valente, Dmitri Alenichev'),
  ...forClub('psg', 'Ousmane Dembélé, Achraf Hakimi, Marquinhos, Vitinha, João Neves, Khvicha Kvaratskhelia, Désiré Doué, Gianluigi Donnarumma, Nuno Mendes, Fabián Ruiz, Bradley Barcola, Gonçalo Ramos, Lee Kang-in, Willian Pacho, Warren Zaïre-Emery, Matvey Safonov, Lucas Beraldo, Lucas Hernández, Senny Mayulu'),
  ...forClub('ajax', 'Johan Cruyff, Johan Neeskens, Ruud Krol, Piet Keizer, Arie Haan, Johnny Rep, Edwin van der Sar, Edgar Davids, Clarence Seedorf, Frank Rijkaard, Patrick Kluivert, Marc Overmars, Jari Litmanen, Frank de Boer, Ronald de Boer, Danny Blind, Michael Reiziger, Nwankwo Kanu, Finidi George'),
  ...forClub('juventus', 'Michel Platini, Zbigniew Boniek, Paolo Rossi, Gaetano Scirea, Antonio Cabrini, Marco Tardelli, Alessandro Del Piero, Gianluca Vialli, Fabrizio Ravanelli, Didier Deschamps, Antonio Conte, Angelo Peruzzi, Ciro Ferrara, Paulo Sousa, Vladimir Jugović, Moreno Torricelli'),
  ...forClub('dortmund', 'Matthias Sammer, Andreas Möller, Karl-Heinz Riedle, Lars Ricken, Jürgen Kohler, Stéphane Chapuisat, Paulo Sousa, Paul Lambert, Stefan Klos, Stefan Reuter'),
  ...forClub('marseille', 'Fabien Barthez, Marcel Desailly, Rudi Völler, Basile Boli, Didier Deschamps, Abedi Pelé, Alen Bokšić, Franck Sauzée'),
];

/** Campeões da Libertadores (nomes mais conhecidos de cada clube campeão). */
const LIBERTADORES: TitleEntry[] = [
  ...forClub('flamengo', 'Zico, Júnior, Leandro, Adílio, Andrade, Nunes, Tita, Raul Plassmann, Mozer, Lico'),
  ...forClub('flamengo', 'Gabriel Barbosa, Bruno Henrique, Giorgian de Arrascaeta, Everton Ribeiro, Gerson, Filipe Luís, Rafinha, Rodrigo Caio, Pablo Marí, Diego Alves, Willian Arão, Diego Ribas, Vitinho, Reinier'),
  ...forClub('flamengo', 'Pedro, David Luiz, Thiago Maia, João Gomes, Arturo Vidal, Everton Cebolinha, Léo Pereira, Ayrton Lucas, Guillermo Varela, Santos, Rodinei'),
  ...forClub('flamengo', 'Danilo, Léo Ortiz, Alex Sandro, Jorginho, Erick Pulgar, Agustín Rossi, Nicolás de la Cruz, Jorge Carrascal, Saúl Ñíguez, Gonzalo Plata, Samuel Lino, Luiz Araújo'),
  ...forClub('palmeiras', 'Marcos, Francisco Arce, Júnior Baiano, Roque Júnior, César Sampaio, Zinho, Alex, Paulo Nunes, Oséas, Evair, Euller'),
  ...forClub('palmeiras', 'Weverton, Gustavo Gómez, Luan, Marcos Rocha, Mayke, Matías Viña, Joaquín Piquerez, Felipe Melo, Danilo, Zé Rafael, Raphael Veiga, Rony, Dudu, Breno Lopes, Gabriel Menino, Patrick de Paula, Willian, Deyverson, Luiz Adriano, Gustavo Scarpa'),
  ...forClub('sao-paulo', 'Zetti, Cafu, Raí, Müller, Palhinha, Ronaldão, Leonardo, Toninho Cerezo, Pintado, Elivélton'),
  ...forClub('sao-paulo', 'Rogério Ceni, Diego Lugano, Fabão, Cicinho, Josué, Mineiro, Danilo, Amoroso, Luizão, Grafite'),
  ...forClub('santos', 'Pelé, Coutinho, Pepe, Gilmar, Mauro Ramos, Zito, Mengálvio, Dorval, Lima'),
  ...forClub('santos', 'Neymar, Paulo Henrique Ganso, Elano, Arouca, Léo, Edu Dracena, Durval, Rafael Cabral, Danilo, Zé Eduardo, Alan Kardec'),
  ...forClub('gremio', 'Renato Gaúcho, Hugo De León, Tarciso, Mazarópi, Baltazar, China, Osvaldo'),
  ...forClub('gremio', 'Mário Jardel, Paulo Nunes, Danrlei, Dinho, Francisco Arce, Adílson, Carlos Miguel, Arílson, Roger'),
  ...forClub('gremio', 'Luan, Arthur, Pedro Geromel, Walter Kannemann, Marcelo Grohe, Edílson, Bruno Cortez, Ramiro, Fernandinho, Lucas Barrios, Everton Cebolinha, Jael, Michel'),
  ...forClub('cruzeiro', 'Nelinho, Jairzinho, Palhinha, Joãozinho, Dirceu Lopes, Raul Plassmann, Wilson Piazza, Dida, Marcelo Ramos, Elivélton, Ricardinho'),
  ...forClub('internacional', 'Fernandão, Rafael Sóbis, Iarley, Tinga, Clemer, Índio, Fabiano Eller, Ceará, Jorge Wagner, Bolívar, Andrés D\'Alessandro, Giuliano, Leandro Damião, Alecsandro, Kléber, Nei, Pablo Guiñazú, Sandro, Renan, Taison, Andrezinho'),
  ...forClub('corinthians', 'Cássio, Paulinho, Emerson Sheik, Danilo, Ralf, Alessandro, Chicão, Leandro Castán, Fábio Santos, Alex, Jorge Henrique, Liédson, Romarinho, Douglas'),
  ...forClub('atletico-mg', 'Ronaldinho, Jô, Bernard, Diego Tardelli, Victor, Réver, Leonardo Silva, Marcos Rocha, Richarlyson, Pierre, Josué, Guilherme, Luan, Alecsandro'),
  ...forClub('fluminense', 'Germán Cano, John Kennedy, Fábio, Nino, Felipe Melo, Marcelo, Samuel Xavier, André, Martinelli, Paulo Henrique Ganso, Keno, Jhon Arias, Diogo Barbosa, Lima, Guga, Alexsander'),
  ...forClub('botafogo', 'Luiz Henrique, Thiago Almada, Igor Jesus, Jefferson Savarino, Marlon Freitas, Gregore, Alex Telles, Bastos, Alexander Barboza, Vitinho, John, Júnior Santos, Tiquinho Soares, Cuiabano, Adryelson'),
  ...forClub('vasco', 'Carlos Germano, Juninho Pernambucano, Donizete, Luizão, Felipe, Pedrinho, Mauro Galvão, Odvan, Ramon, Luisinho, Válber'),
  ...forClub('boca', 'Juan Román Riquelme, Martín Palermo, Carlos Tevez, Jorge Bermúdez, Mauricio Serna, Óscar Córdoba, Sebastián Battaglia, Rolando Schiavi, Hugo Ibarra, Guillermo Barros Schelotto, Marcelo Delgado, Walter Samuel, Rodolfo Arruabarrena'),
  ...forClub('river', 'Enzo Francescoli, Hernán Crespo, Ariel Ortega, Marcelo Gallardo, Lucas Pratto, Juan Fernando Quintero, Gonzalo Martínez, Rafael Santos Borré, Leonardo Ponzio, Jonatan Maidana, Enzo Pérez, Franco Armani, Gonzalo Montiel, Norberto Alonso'),
];

export const TITLE_ENTRIES: Record<TitleId, TitleEntry[]> = {
  copa: COPA,
  bola: BOLA,
  champions: CHAMPIONS,
  libertadores: LIBERTADORES,
};

export const TITLE_IDS = Object.keys(TITLE_ENTRIES) as TitleId[];
