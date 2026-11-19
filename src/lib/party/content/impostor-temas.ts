import type { ContentCategory } from '../../game/types';

/**
 * Temas e nomes a mais do Impostor (rodada 8). Formato das listas, como no
 * Anagrama: "Nome|apelido aceito|outro apelido, Outro nome". Vírgula separa
 * os segredos, então nenhum nome leva vírgula.
 *
 * Critério: só nome que um grupo brasileiro comum reconhece. Nada de 2026
 * sem fonte, nada que muda (clube atual, cargo atual), sem política atual e
 * sem religião.
 */
export interface ImpostorThemeDef {
  theme: string;
  category: ContentCategory;
  /** Como o grupo pede o tema (sem acento). */
  keys: string[];
  list: string;
  /** Como o tema aparece na lista de temas (com acento). Sem ele, a 1ª chave. */
  label?: string;
}

/** Nomes a mais nos temas que já existiam (futebol e gerais). */
export const EXTRA_NAMES: Record<string, string> = {
  'craque brasileiro':
    'Júnior, Leandro, Toninho Cerezo|cerezo, Djalma Santos, Didi, Vavá, Ademir da Guia, Roberto Dinamite|dinamite, Evair, Edílson, ' +
    'Juninho Paulista, Gilberto Silva, Kléberson, Mauro Silva, Branco, Jorginho, Müller, Viola, Túlio Maravilha|tulio, ' +
    'Marcelinho Carioca|marcelinho, Ricardinho, Alex|alex de souza, Diego Ribas, Elano, Diego Souza, Hernanes, Lucas Moura, ' +
    'Douglas Costa, Everton Ribeiro, Bruno Henrique, Dudu, Raphael Veiga|veiga, Savinho, João Pedro, Neto',
  'craque do mundo':
    'Raúl, Fernando Torres|torres, David Villa|villa, Ballack, Klose, Thomas Müller, Lahm, Schweinsteiger, Özil, Hazard, Lukaku, ' +
    'Van Persie, Sneijder, Seedorf, Gullit, Rijkaard, Koeman, Nedved, Stoichkov, Hagi, Weah, Okocha, Yaya Touré, Sadio Mané|mane, ' +
    'Kanté, Pogba, Vieira, Thuram, Rummenigge, Gerd Müller, Matthäus, Paolo Rossi, Bale, Saka, Foden, Valverde, Musiala, Rodri, ' +
    'Osimhen, Rashford',
  'estado brasileiro': 'Bahia, Ceará, Goiás, Paraná, São Paulo, Distrito Federal|df',
  'país':
    'Japão, Coreia do Sul, México, Estados Unidos|eua, Argentina, Chile, Colômbia, Uruguai, Paraguai, Portugal, Espanha, França, ' +
    'Itália, Alemanha, Inglaterra, Holanda, Bélgica, Marrocos, África do Sul, Nigéria, Arábia Saudita, Emirados Árabes, Catar, ' +
    'Irã, Filipinas, Indonésia, Cingapura, Noruega, Suécia, Dinamarca, Finlândia, Croácia, Haiti, Angola, Moçambique, Cabo Verde, ' +
    'Escócia, Coreia do Norte, Equador',
  capital:
    'Ottawa, Cidade do México, Quito, La Paz, Nairóbi, Nova Délhi, Bangkok, Seul, Canberra, Dublin, Bruxelas, Viena, Praga, ' +
    'Varsóvia, Budapeste, Estocolmo, Oslo, Copenhague, Helsinque, Ancara, Teerã, Bagdá, Riad, Doha, Abu Dhabi, Luanda, Maputo, ' +
    'Dacar, Rabat, Kingston, Manila, Jacarta, Hanói, Berna, Edimburgo, Cidade do Panamá',
  'cidade brasileira':
    'São Paulo, Rio de Janeiro, Fortaleza, Santos, Niterói, Juiz de Fora, Londrina, Maringá, Joinville, Blumenau, Caxias do Sul, ' +
    'Pelotas, Campina Grande, Feira de Santana, Vitória, São Luís, Cuiabá, Campo Grande, Porto Velho, Macapá, Boa Vista, ' +
    'Rio Branco, Palmas, Sorocaba, Jundiaí, Bauru, Ouro Preto, Paraty, Búzios, Porto Seguro, Bonito, Balneário Camboriú, ' +
    'Caruaru, Mossoró, Juazeiro do Norte, Olinda, Ilhéus, Parintins, Santarém, Brasília',
  animal:
    'Leão, Tigre, Urso, Lobo, Raposa, Cobra, Baleia, Polvo, Galinha, Vaca, Porco, Ovelha, Coelho, Gato, Rato, Sapo, Abelha, ' +
    'Formiga, Aranha, Zebra, Camelo, Panda, Coala, Águia, Pavão, Arara, Tucano, Onça-pintada|onca, Bicho-preguiça|preguica, ' +
    'Mico-leão-dourado|mico, Lhama, Avestruz, Flamingo, Gorila, Esquilo, Peixe-palhaço',
  'fruta ou comida':
    'Manga, Uva, Maçã, Pera, Kiwi, Mamão, Caju, Acerola, Pitanga, Cupuaçu, Graviola, Limão, Coco, Abacate, Pêssego, Ameixa, ' +
    'Cereja, Melão, Tangerina|mexerica|bergamota, Pizza, Sushi, Cachorro-quente, Strogonoff|estrogonofe, Batata frita, Omelete, ' +
    'Panqueca, Esfiha, Kibe, Empada, Sanduíche, Bolo, Biscoito|bolacha, Pão, Queijo, Ovo, Salada, Sopa, Miojo, Pipoca doce',
  'profissão':
    'Pedreiro, Padeiro, Açougueiro, Garçom, Piloto, Comissário de bordo, Juiz, Psicólogo, Farmacêutico, Mecânico, Encanador, ' +
    'Pintor, Costureira, Manicure, Taxista, Carteiro, Gari, Porteiro, Segurança, Vendedor, Programador, Ator, Jogador de futebol, ' +
    'Árbitro, Fisioterapeuta, Nutricionista, Personal trainer, Detetive, Bibliotecário, Agricultor, Pescador, Cientista, Contador, ' +
    'Diplomata, Salva-vidas, Palhaço, Mágico, Babá, Frentista, Entregador',
  'artista brasileiro':
    'Ney Matogrosso, Milton Nascimento, Gal Costa, Maria Bethânia, Raul Seixas, Renato Russo, Cássia Eller, Jorge Ben Jor|jorge ben, ' +
    'Alceu Valença, Luiz Gonzaga, Zezé Di Camargo, Leonardo, Paula Fernandes, Michel Teló, Thiaguinho, Péricles, Belo, ' +
    'Alexandre Pires, Ferrugem, Iza, Pitty, Lulu Santos, Fábio Jr., Vanessa da Mata, Ana Carolina, Emicida, Criolo, Mano Brown, ' +
    'Joelma, Sandy, Claudia Leitte, Daniela Mercury, Bell Marques, Léo Santana, Xand Avião, Alok, Jão, Luísa Sonza, Pedro Sampaio, ' +
    'Ana Castela, Simone Mendes, Lauana Prado, Henrique e Juliano, Jorge e Mateus, Maiara e Maraisa, Chitãozinho e Xororó, ' +
    'Bruno e Marrone, Zé Neto e Cristiano',
  esporte:
    'Futebol, Fórmula 1|f1, MMA, Polo aquático, Remo, Canoagem, Hipismo, Rúgbi|rugby, Hóquei, Badminton, Tênis de mesa|pingue-pongue, ' +
    'Escalada, Paraquedismo, Vela, Triatlo, Maratona, Levantamento de peso, Taekwondo, Capoeira, Jiu-jítsu, Muay thai, Sinuca, ' +
    'Boliche, Futevôlei, Beach tennis, Motocross, Snowboard, Esqui, Patinação, Futebol americano, Críquete, Dardos, Kart',
  novela:
    'A Próxima Vítima, Roque Santeiro, O Bem-Amado, Tieta, Explode Coração, O Cravo e a Rosa, Chocolate com Pimenta, Belíssima, ' +
    'Paraíso Tropical, Duas Caras, A Força do Querer, Totalmente Demais, Malhação, Rebelde, Carrossel, Chiquititas, ' +
    'Cúmplices de um Resgate, Escrava Isaura, Xica da Silva, Renascer, Mulheres de Areia, A Indomada, Quatro por Quatro, ' +
    'Celebridade, Da Cor do Pecado, América, Insensato Coração, Salve Jorge, Amor de Mãe, A Viagem, O Clone',
  filme:
    'O Poderoso Chefão, Pulp Fiction, Forrest Gump, O Rei Leão, Os Vingadores|vingadores, Velozes e Furiosos, Missão Impossível, ' +
    'De Volta para o Futuro, E.T., Jumanji, Esqueceram de Mim, Karatê Kid, Top Gun, Piratas do Caribe, O Senhor dos Anéis, ' +
    'Crepúsculo, Jogos Vorazes, Interestelar, A Origem, Clube da Luta, O Auto da Compadecida|auto da compadecida, ' +
    'Minha Mãe é uma Peça, Se Eu Fosse Você, Carandiru, Bacurau, Que Horas Ela Volta?, Up, Divertida Mente, Carros, Moana, ' +
    'Encanto, Madagascar, A Era do Gelo, Os Incríveis, Monstros S.A., O Exorcista, It: A Coisa, Invocação do Mal, Pânico, ' +
    'Parasita, Duna, Ghost, Uma Linda Mulher, Mamma Mia!, Kung Fu Panda, Os Smurfs, Homem-Aranha',
  lugar:
    'Faculdade, Escritório, Praça, Feira, Lavanderia, Barbearia, Pet shop, Museu, Teatro, Circo, Cassino, Camping, Fazenda, ' +
    'Cruzeiro, Estação de metrô, Ponto de ônibus, Lan house, Karaokê, Piscina, Sauna, Elevador, Garagem, Cemitério, Consultório, ' +
    'Clube, Velório, Casamento, Feira livre, Sorveteria, Aquário',
};

/** Rótulo com acento dos temas do Anagrama (a 1ª chave não tem acento). */
export const ANAGRAM_LABELS: Record<string, string> = {
  'clube brasileiro': 'clubes',
  'clube do exterior': 'clubes de fora',
  'craque brasileiro': 'craques',
  'craque do mundo': 'craques do mundo',
  'seleção': 'seleções',
  'técnico': 'técnicos',
  'estádio': 'estádios',
  'país': 'países',
  capital: 'capitais',
  'estado brasileiro': 'estados',
  'cidade brasileira': 'cidades',
  animal: 'animais',
  'fruta ou comida': 'comidas',
  'profissão': 'profissões',
  'artista brasileiro': 'artistas',
  esporte: 'esportes',
  novela: 'novelas',
  filme: 'filmes',
};

/** Temas novos (rodada 8): 5 de futebol, 27 gerais, anime e história. */
export const NEW_THEMES: ImpostorThemeDef[] = [
  // ---------- Futebol ----------
  {
    theme: 'goleiro', category: 'futebol', label: 'goleiros',
    keys: ['goleiros', 'goleiro', 'arqueiros', 'arqueiro'],
    list:
      'Taffarel, Dida, Marcos|sao marcos, Rogério Ceni|ceni, Júlio César, Alisson, Ederson, Cássio, Weverton, Fábio, Victor, ' +
      'Diego Alves, Zetti, Gilmar, Emerson Leão|leao, Buffon, Casillas, Neuer, Courtois, Oliver Kahn|kahn, ' +
      'Peter Schmeichel|schmeichel, Higuita, Chilavert, Dibu Martínez|emiliano martinez, Ter Stegen, Oblak, Lev Yashin|yashin, ' +
      'Keylor Navas|navas, Bono|bounou, Donnarumma, Hugo Lloris|lloris, Van der Sar, Cech|petr cech, Barbosa',
  },
  {
    theme: 'craque argentino', category: 'futebol', label: 'argentinos',
    keys: ['argentinos', 'argentino', 'craques argentinos', 'jogadores argentinos', 'hermanos'],
    list:
      'Maradona, Messi, Batistuta, Riquelme, Di María, Agüero, Tévez, Crespo, Verón, Zanetti, Mascherano, Higuaín, Dybala, ' +
      'Lautaro Martínez|lautaro, Julián Álvarez, Kempes, Caniggia, Palermo, Sorín, Enzo Fernández, Mac Allister, Otamendi, ' +
      'Gallardo, Redondo, Burruchaga, Valdano, Simeone, Cambiasso, Pastore, Lavezzi, Ariel Ortega|ortega, Saviola, Aimar, ' +
      'Dibu Martínez',
  },
  {
    theme: 'gringo do Brasileirão', category: 'futebol', label: 'gringos do Brasileirão',
    keys: ['gringos do brasileirao', 'gringo do brasileirao', 'estrangeiros', 'estrangeiros do brasileirao', 'gringos no brasil'],
    list:
      "Arrascaeta, Petković|pet|petkovic, Conca, D'Alessandro|dale, Valdivia, Guerrero, Tévez, Gamarra, Lugano, Loco Abreu|abreu, " +
      'Seedorf, Forlán, Gustavo Gómez, Germán Cano|cano, Luis Suárez, Payet, Memphis Depay|memphis, Calleri, Montillo, ' +
      'Freddy Rincón|rincon, Cueva, Rodrigo Garro|garro, Vegetti, Jhon Arias|arias, Sorín, Lucas Barrios',
  },
  {
    theme: 'gíria do futebol', category: 'futebol', label: 'gírias',
    keys: ['girias', 'giria', 'girias do futebol', 'expressoes', 'expressoes do futebol'],
    list:
      'Frango, Zebra, Freguês, Chocolate, Pipoqueiro, Perna de pau, Chuveirinho, Pelada, Várzea, Tapetão, Retranca, Catimba, ' +
      'Cai-cai, Banheira, Gaveta, Lavada, Virada, Mão de alface, Fominha, Camisa 12, Lei do ex, Bola nas costas, Ferrolho, ' +
      'Gol de honra, Clássico, Goleada, Cera, Tabelinha, Furada, Rebaixamento, Torcida organizada, Uniforme reserva',
  },
  {
    theme: 'narrador e comentarista', category: 'futebol', label: 'narradores',
    keys: ['narradores', 'narrador', 'comentaristas', 'comentarista', 'jornalistas esportivos', 'jornalistas'],
    list:
      'Galvão Bueno|galvao, Cléber Machado, Luis Roberto, Milton Leite, Casagrande, Neto|craque neto, ' +
      'Arnaldo Cezar Coelho|arnaldo, Caio Ribeiro, Silvio Luiz, José Trajano|trajano, Juca Kfouri|juca, Mauro Cezar, Renata Fan, ' +
      'Milton Neves, Tiago Leifert|leifert, Everaldo Marques, PVC|paulo vinicius coelho, Alex Escobar|escobar, Fiori Gigliotti, ' +
      'Osmar Santos, José Silvério, Benjamin Back|benja, Ana Thaís Matos, Mauro Naves, Denílson',
  },
  // ---------- Gerais ----------
  {
    theme: 'personagem de desenho', category: 'geral', label: 'desenhos',
    keys: ['desenhos', 'desenho', 'personagens de desenho', 'desenho animado', 'desenhos animados', 'cartoon'],
    list:
      'Bob Esponja, Patrick Estrela|patrick, Mickey, Minnie, Pato Donald|donald, Pateta, Pernalonga, Patolino, Piu-Piu, Frajola, ' +
      'Tom|gato tom, Jerry, Scooby-Doo|scooby, Salsicha, Homer Simpson|homer, Bart Simpson|bart, Pica-Pau, Popeye, Garfield, ' +
      'Snoopy, Charlie Brown, Peppa Pig|peppa, Dora Aventureira|dora, Ben 10, Fred Flintstone|fred, Mônica, Cebolinha, Cascão, ' +
      'Magali, Chico Bento, Pantera Cor-de-Rosa, Johnny Bravo, Papa-Léguas, Coiote, Zé Colmeia, Manda-Chuva, Mutley, ' +
      'Dick Vigarista, Lindinha, Florzinha, Docinho, Galinha Pintadinha',
  },
  {
    theme: 'herói ou vilão', category: 'geral', label: 'heróis e vilões',
    keys: ['herois', 'heroi', 'super-herois', 'super herois', 'super-heroi', 'viloes', 'vilao', 'herois e viloes'],
    list:
      'Homem-Aranha, Batman, Superman, Mulher-Maravilha, Homem de Ferro, Capitão América, Thor, Hulk, Pantera Negra, Wolverine, ' +
      'Flash, Aquaman, Lanterna Verde, Viúva Negra, Doutor Estranho, Deadpool, Capitã Marvel, Homem-Formiga, Coringa, Thanos, ' +
      'Mulher-Gato, Robin, Groot, Venom, Magneto, Loki, Arlequina, Duende Verde, Lex Luthor, Tempestade, Ciclope, ' +
      'Gavião Arqueiro, Feiticeira Escarlate, Visão, Batgirl, Pinguim, Mulher Invisível, Tocha Humana',
  },
  {
    theme: 'série', category: 'geral', label: 'séries',
    keys: ['series', 'serie', 'seriados', 'seriado', 'series de tv'],
    list:
      'Friends, Breaking Bad, Game of Thrones, La Casa de Papel, Stranger Things, The Office, Round 6, Chaves, ' +
      'Todo Mundo Odeia o Chris, Os Simpsons, Grey’s Anatomy|greys anatomy, Prison Break, The Walking Dead, Peaky Blinders, Dark, ' +
      'Lost, Two and a Half Men, How I Met Your Mother, The Last of Us, Wandinha, Dexter, Supernatural, The Crown, Narcos, ' +
      'Vikings, The Big Bang Theory|big bang theory, Elite, Bridgerton, Cobra Kai, The Boys, House of the Dragon, ' +
      'Sex and the City, Chapolin, Sintonia, Cidade dos Homens, Sob Pressão, Família Soprano|sopranos, House, Lúcifer, ' +
      'Black Mirror, Euphoria, Um Maluco no Pedaço, Arquivo X',
  },
  {
    theme: 'personagem de filme', category: 'geral', label: 'personagens de filme',
    keys: ['personagens de filme', 'personagem de filme', 'personagens', 'personagem'],
    list:
      'Harry Potter, Darth Vader, Jack Sparrow, Indiana Jones, Rocky Balboa, Forrest Gump, James Bond|007, ' +
      'Exterminador do Futuro, Buzz Lightyear, Woody, Simba, Nemo, Elsa, Gandalf, Frodo, Yoda, Hannibal Lecter, Neo, John Wick, ' +
      'Rambo, E.T.|et, King Kong, Godzilla, Chucky, Freddy Krueger, Jason, Wall-E, Dory, Hermione, Voldemort, Gollum, Shrek, ' +
      'Capitão Nascimento, Zé Pequeno, João Grilo, Chicó, Dona Hermínia, Tony Montana, Vito Corleone, Marty McFly, Jack Dawson, ' +
      'Mary Poppins, Willy Wonka',
  },
  {
    theme: 'ator de Hollywood', category: 'geral', label: 'atores de Hollywood',
    keys: ['atores de hollywood', 'ator de hollywood', 'hollywood', 'atores gringos', 'atrizes de hollywood', 'atrizes gringas'],
    list:
      'Leonardo DiCaprio|dicaprio, Brad Pitt, Tom Cruise, Johnny Depp, Will Smith, Angelina Jolie, Scarlett Johansson, ' +
      'Keanu Reeves, Dwayne Johnson|the rock, Morgan Freeman, Denzel Washington, Robert De Niro, Al Pacino, Tom Hanks, Jim Carrey, ' +
      'Adam Sandler, Jackie Chan, Arnold Schwarzenegger|schwarzenegger, Sylvester Stallone|stallone, Vin Diesel, Jennifer Aniston, ' +
      'Julia Roberts, Meryl Streep, Nicole Kidman, Margot Robbie, Zendaya, Robert Downey Jr., Chris Hemsworth, Ryan Reynolds, ' +
      'Jennifer Lawrence, Eddie Murphy, Bruce Willis, Harrison Ford, Samuel L. Jackson, Anne Hathaway, Emma Watson, Jason Statham',
  },
  {
    theme: 'ator ou atriz brasileira', category: 'geral', label: 'atores brasileiros',
    keys: ['atores', 'ator', 'atrizes', 'atriz', 'atores brasileiros', 'atrizes brasileiras'],
    list:
      'Tony Ramos, Fernanda Montenegro, Lázaro Ramos, Wagner Moura, Rodrigo Santoro, Glória Pires, Antônio Fagundes, Selton Mello, ' +
      'Taís Araújo, Juliana Paes, Bruna Marquezine, Grazi Massafera, Cauã Reymond, Reynaldo Gianecchini, Marcos Palmeira, ' +
      'Deborah Secco, Paolla Oliveira, Fernanda Torres, Marieta Severo, Lima Duarte, Stênio Garcia, Susana Vieira, Alexandre Nero, ' +
      'Vladimir Brichta, Matheus Nachtergaele, Débora Falabella, Mateus Solano, Camila Pitanga, Malu Mader, Murilo Benício, ' +
      'Tarcísio Meira, Vera Fischer, Giovanna Antonelli, Adriana Esteves, Regina Casé',
  },
  {
    theme: 'apresentador de TV', category: 'geral', label: 'apresentadores de TV',
    keys: ['apresentadores', 'apresentador', 'apresentadoras', 'apresentadora', 'tv', 'televisao'],
    list:
      'Faustão, Silvio Santos, Xuxa, Luciano Huck|huck, Ana Maria Braga, Fátima Bernardes, Gugu, Ratinho, Datena, ' +
      'Serginho Groisman, Pedro Bial, Hebe Camargo|hebe, Angélica, Eliana, Marcos Mion|mion, Rodrigo Faro, Raul Gil, Jô Soares, ' +
      'Celso Portiolli, Luciana Gimenez, Sônia Abrão, Chacrinha, William Bonner|bonner, Cid Moreira, Glória Maria, Maju Coutinho, ' +
      'Patrícia Poeta, Ana Hickmann, Tiago Leifert, Carlos Alberto de Nóbrega',
  },
  {
    theme: 'comediante', category: 'geral', label: 'comediantes',
    keys: ['comediantes', 'comediante', 'humoristas', 'humorista', 'comedia'],
    list:
      'Renato Aragão|didi, Chico Anysio, Tom Cavalcante, Paulo Gustavo, Whindersson Nunes|whindersson, Fábio Porchat|porchat, ' +
      'Marcelo Adnet|adnet, Tatá Werneck|tata, Leandro Hassum|hassum, Mussum, Zacarias, Dedé Santana|dede, Danilo Gentili|gentili, ' +
      'Rafinha Bastos, Ary Toledo, Costinha, Ronald Golias|golias, Dercy Gonçalves|dercy, Bussunda, Hélio de la Peña, ' +
      'Cláudio Manoel, Marcelo Madureira, Ingrid Guimarães, Paulo Vieira, Thiago Ventura, Afonso Padilha, Rodrigo Sant’Anna, ' +
      'Ceará|wellington muniz, Carlos Alberto de Nóbrega, Fabiana Karla',
  },
  {
    theme: 'cantor internacional', category: 'geral', label: 'cantores internacionais',
    keys: ['cantores internacionais', 'cantor internacional', 'cantoras internacionais', 'musica internacional', 'pop'],
    list:
      'Michael Jackson, Madonna, Beyoncé, Rihanna, Taylor Swift, Lady Gaga, Bruno Mars, Ed Sheeran, Justin Bieber, Adele, ' +
      'Elvis Presley|elvis, Shakira, Britney Spears, Bob Marley, Frank Sinatra, Eminem, Dua Lipa, The Weeknd, Billie Eilish, ' +
      'Bad Bunny, Drake, Katy Perry, Ariana Grande, Whitney Houston, Celine Dion, Mariah Carey, Stevie Wonder, Freddie Mercury, ' +
      'John Lennon, Elton John, David Bowie, Ricky Martin, Enrique Iglesias, Luis Fonsi, Jennifer Lopez, Snoop Dogg, Harry Styles, ' +
      'Olivia Rodrigo, Selena Gomez, Miley Cyrus',
  },
  {
    theme: 'banda brasileira', category: 'geral', label: 'bandas brasileiras',
    keys: ['bandas brasileiras', 'banda brasileira', 'bandas', 'banda', 'grupos musicais', 'pagode'],
    list:
      'Legião Urbana, Mamonas Assassinas|mamonas, Titãs, Paralamas do Sucesso|paralamas, Skank, Jota Quest, ' +
      'Charlie Brown Jr.|charlie brown, Barão Vermelho, Capital Inicial, Os Mutantes|mutantes, Sepultura, Raimundos, ' +
      'Engenheiros do Hawaii|engenheiros, Kid Abelha, RPM, Ira!, Los Hermanos, NX Zero, Restart, Fresno, CPM 22, Detonautas, ' +
      'Natiruts, Tribalistas, Exaltasamba, Raça Negra, Só Pra Contrariar|spc, Molejo, Grupo Revelação|revelacao, Pixote, ' +
      'Turma do Pagode, Sorriso Maroto, Fundo de Quintal, Roupa Nova, Biquini Cavadão|biquini, Ultraje a Rigor|ultraje, ' +
      'É o Tchan|tchan, Calcinha Preta, Banda Eva, Chiclete com Banana|chiclete, Olodum, Harmonia do Samba, Psirico',
  },
  {
    theme: 'banda internacional', category: 'geral', label: 'bandas internacionais',
    keys: ['bandas internacionais', 'banda internacional', 'bandas gringas', 'rock'],
    list:
      'The Beatles|beatles, Queen, Coldplay, Bon Jovi, AC/DC, Guns N’ Roses|guns n roses|guns, Metallica, Nirvana, ' +
      'Rolling Stones, U2, Maroon 5, Linkin Park, Red Hot Chili Peppers|red hot, Iron Maiden, Pink Floyd, Led Zeppelin, ABBA, ' +
      'Backstreet Boys, Spice Girls, BTS, Oasis, Green Day, Foo Fighters, Imagine Dragons, Black Eyed Peas, Kiss, Aerosmith, ' +
      'The Police, Scorpions, Evanescence, Arctic Monkeys, Bee Gees, One Direction, Jonas Brothers, RBD, Destiny’s Child, ' +
      'Blink-182, Simple Plan',
  },
  {
    theme: 'atleta brasileiro', category: 'geral', label: 'atletas brasileiros',
    keys: ['atletas', 'atleta', 'atletas brasileiros', 'esportistas', 'esportistas brasileiros'],
    list:
      'Ayrton Senna|senna, Guga|gustavo kuerten, Rebeca Andrade, Oscar Schmidt, Hortência, Popó, Anderson Silva, Rayssa Leal|rayssa, ' +
      'Gabriel Medina|medina, Ítalo Ferreira, Daiane dos Santos, Bernardinho, Giba, Nelson Piquet|piquet, ' +
      'Emerson Fittipaldi|fittipaldi, Rubens Barrichello|barrichello, Cesar Cielo|cielo, Robert Scheidt, Arthur Zanetti, ' +
      'Maurren Maggi, Thiago Braz, Isaquias Queiroz, Bia Haddad, João Fonseca, Hugo Calderano, Adhemar Ferreira da Silva, ' +
      'Magic Paula, José Aldo, Vitor Belfort, Mayra Aguiar, Rafaela Silva, Ana Marcela Cunha, Gustavo Borges, Fabiana Murer, ' +
      'Joaquim Cruz, Felipe Massa, Diego Hypólito, Bob Burnquist, Sarah Menezes',
  },
  {
    theme: 'atleta do mundo', category: 'geral', label: 'atletas do mundo',
    keys: ['atletas do mundo', 'atletas gringos', 'esportistas gringos', 'esportistas do mundo'],
    list:
      'Michael Jordan, LeBron James, Usain Bolt, Michael Phelps, Serena Williams, Roger Federer, Rafael Nadal, Novak Djokovic, ' +
      'Muhammad Ali, Mike Tyson, Tiger Woods, Lewis Hamilton, Michael Schumacher|schumacher, Max Verstappen, Simone Biles, ' +
      'Kobe Bryant, Stephen Curry, Tom Brady, Conor McGregor, Valentino Rossi, Carl Lewis, Nadia Comaneci, Shaquille O’Neal|shaq, ' +
      'Magic Johnson, Floyd Mayweather, Carlos Alcaraz|alcaraz, Kelly Slater, Fernando Alonso, Ronda Rousey, Manny Pacquiao, ' +
      'Venus Williams',
  },
  {
    theme: 'ponto turístico', category: 'geral', label: 'pontos turísticos',
    keys: ['pontos turisticos', 'ponto turistico', 'monumentos', 'monumento', 'turismo', 'viagem'],
    list:
      'Torre Eiffel, Cristo Redentor, Estátua da Liberdade, Coliseu, Pirâmides do Egito|piramides, Muralha da China, Big Ben, ' +
      'Machu Picchu, Taj Mahal, Pão de Açúcar, Cataratas do Iguaçu, Torre de Pisa, Sagrada Família, Times Square, Burj Khalifa, ' +
      'Ópera de Sydney, Stonehenge, Chichén Itzá, Lençóis Maranhenses, Fernando de Noronha, Pelourinho, Elevador Lacerda, ' +
      'Avenida Paulista, Copacabana, Ilha de Páscoa, Monte Everest|everest, Grand Canyon, Golden Gate, Arco do Triunfo, ' +
      'Museu do Louvre|louvre, Disney, Las Vegas, Petra, Acrópole, Ponte Estaiada, Escadaria Selarón',
  },
  {
    theme: 'objeto da casa', category: 'geral', label: 'objetos da casa',
    keys: ['objetos', 'objeto', 'objetos da casa', 'casa', 'eletrodomesticos', 'eletrodomestico'],
    list:
      'Geladeira, Fogão, Micro-ondas, Sofá, Cama, Televisão, Ventilador, Ar-condicionado, Liquidificador, Máquina de lavar, ' +
      'Ferro de passar, Espelho, Travesseiro, Controle remoto, Chuveiro, Vaso sanitário, Panela de pressão, Cafeteira, ' +
      'Torradeira, Aspirador de pó, Guarda-roupa, Escova de dentes, Toalha, Abajur, Despertador, Tapete, Cortina, Vassoura, ' +
      'Mesa, Cadeira, Rede, Air fryer, Varal, Sanduicheira, Filtro de barro, Pregador',
  },
  {
    theme: 'meio de transporte', category: 'geral', label: 'transportes',
    keys: ['transportes', 'transporte', 'veiculos', 'veiculo', 'meios de transporte'],
    list:
      'Avião, Helicóptero, Navio, Bicicleta, Moto, Ônibus, Metrô, Trem, Caminhão, Táxi, Patinete, Skate, Barco, Submarino, ' +
      'Foguete, Balão, Carroça, Teleférico, Ambulância, Jet ski, Lancha, Trator, Bonde, Canoa, Carro de bombeiro, Viatura, ' +
      'Van escolar, Mototáxi, Planador, Disco voador',
  },
  {
    theme: 'marca', category: 'geral', label: 'marcas',
    keys: ['marcas', 'marca', 'empresas', 'empresa'],
    list:
      'Coca-Cola, Nike, Adidas, Apple, Samsung, McDonald’s|mcdonalds|mc donalds, Havaianas, Natura, Nestlé, Google, Amazon, ' +
      'Netflix, Ferrari, Lego, Disney, Puma, Pepsi, Heineken, Guaraná Antarctica, Brahma, Skol, Itaú, Bradesco, Nubank, ' +
      'Magazine Luiza|magalu, Mercado Livre, iFood, Burger King, Starbucks, Toyota, Volkswagen, Fiat, Chevrolet, Sony, Microsoft, ' +
      'Petrobras, Correios, O Boticário|boticario, Casas Bahia, Ypê, Bombril, Nescau, Toddy',
  },
  {
    theme: 'carro', category: 'geral', label: 'carros',
    keys: ['carros', 'carro', 'modelos de carro', 'automoveis'],
    list:
      'Fusca, Gol, Uno, Kombi, Opala, Chevette, Monza, Brasília, Santana, Escort, Corsa, Celta, Palio, Saveiro, Strada, Toro, ' +
      'Hilux, Civic, Corolla, HB20, Onix, Ford Ka|ka, Fiesta, EcoSport, Golf, Parati, Voyage, Del Rey, Maverick, Belina, Variant, ' +
      'Mustang, S10, Compass, Renegade, Kwid, Sandero, Polo, T-Cross, Creta, Camaro',
  },
  {
    theme: 'comida brasileira', category: 'geral', label: 'comidas brasileiras',
    keys: ['comidas brasileiras', 'comida brasileira', 'comida tipica', 'pratos', 'prato', 'culinaria'],
    list:
      'Feijoada, Acarajé, Pão de queijo, Coxinha, Brigadeiro, Pastel, Tapioca, Moqueca, Vatapá, Churrasco, Farofa, Pamonha, ' +
      'Cuscuz, Baião de dois, Tacacá, Açaí, Quindim, Pudim, Paçoca, Beijinho, Arroz carreteiro, Galinhada, Escondidinho, ' +
      'Bolinho de chuva, Canjica, Pé de moleque, Cocada, Romeu e Julieta, X-tudo, Caruru, Sarapatel, Buchada, Carne de sol, ' +
      'Picanha, Maniçoba, Pirão, Bobó de camarão, Empadão, Bauru, Misto-quente, Virado à paulista, Feijão tropeiro, Torresmo',
  },
  {
    theme: 'bebida', category: 'geral', label: 'bebidas',
    keys: ['bebidas', 'bebida', 'drinks', 'drink'],
    list:
      'Cerveja, Caipirinha, Café, Chimarrão, Guaraná, Suco de laranja, Vinho, Cachaça, Refrigerante, Água de coco, Tereré, ' +
      'Whisky|uisque, Vodka, Tequila, Champanhe, Chá, Leite, Chocolate quente, Milk-shake, Energético, Caldo de cana, Cappuccino, ' +
      'Batida, Quentão, Saquê, Gin tônica, Limonada, Vitamina, Mate gelado, Chope, Sangria, Mojito',
  },
  {
    theme: 'parte do corpo', category: 'geral', label: 'corpo humano',
    keys: ['corpo humano', 'corpo', 'partes do corpo', 'parte do corpo', 'anatomia'],
    list:
      'Coração, Pulmão, Cérebro, Joelho, Cotovelo, Ombro, Umbigo, Orelha, Nariz, Língua, Dente, Unha, Cabelo, Sobrancelha, ' +
      'Tornozelo, Calcanhar, Costela, Estômago, Fígado, Rim, Pescoço, Queixo, Bochecha, Dedo, Barriga, Bumbum, Cílios, Pulso, ' +
      'Testa, Coluna',
  },
  {
    theme: 'roupa ou acessório', category: 'geral', label: 'roupas',
    keys: ['roupas', 'roupa', 'acessorios', 'acessorio', 'moda', 'roupas e acessorios'],
    list:
      'Camiseta, Calça jeans, Bermuda, Chinelo, Tênis, Boné, Óculos, Relógio, Gravata, Terno, Vestido, Saia, Biquíni, Sunga, ' +
      'Jaqueta, Moletom, Cachecol, Luva, Meia, Cinto, Pijama, Chapéu, Bolsa, Mochila, Brinco, Colar, Anel, Pulseira, Sutiã, ' +
      'Cueca, Salto alto, Galocha, Avental, Uniforme escolar',
  },
  {
    theme: 'instrumento musical', category: 'geral', label: 'instrumentos',
    keys: ['instrumentos', 'instrumento', 'instrumentos musicais', 'instrumento musical'],
    list:
      'Violão, Guitarra, Bateria, Piano, Teclado, Violino, Flauta, Saxofone, Trompete, Pandeiro, Cavaquinho, Sanfona, Berimbau, ' +
      'Tamborim, Surdo, Cuíca, Agogô, Harpa, Gaita, Contrabaixo, Ukulele, Triângulo, Xilofone, Clarinete, Trombone, Tuba, ' +
      'Atabaque, Zabumba, Viola caipira, Banjo, Reco-reco, Chocalho',
  },
  {
    theme: 'brincadeira ou brinquedo', category: 'geral', label: 'brincadeiras',
    keys: ['brincadeiras', 'brincadeira', 'brinquedos', 'brinquedo', 'infancia'],
    list:
      'Pipa, Pião, Bolinha de gude, Ioiô, Amarelinha, Pega-pega, Esconde-esconde, Queimada, Pular corda, Boneca, Bambolê, ' +
      'Peteca, Quebra-cabeça, Dominó, Damas, Xadrez, Banco Imobiliário, Uno, Cabo de guerra, Passa anel, Batata quente, ' +
      'Futebol de botão, Pebolim|toto, Taco|bets, Polícia e ladrão, Estátua, Cama elástica, Massinha, Cubo mágico, Escorregador, ' +
      'Gangorra, Balanço, Lego, Twister, Detetive',
  },
  {
    theme: 'festa ou data', category: 'geral', label: 'festas e datas',
    keys: ['festas', 'festa', 'datas', 'data', 'feriados', 'feriado', 'datas comemorativas'],
    list:
      'Natal, Ano Novo|reveillon, Carnaval, Páscoa, Festa Junina|sao joao, Halloween|dia das bruxas, Dia das Mães, Dia dos Pais, ' +
      'Dia dos Namorados, Aniversário, Casamento, Formatura, Chá de bebê, Dia das Crianças, Black Friday, Oktoberfest, ' +
      'Festival de Parintins, Círio de Nazaré, Dia do Trabalho, Sete de Setembro|independencia, Chá revelação, ' +
      'Despedida de solteiro, Batizado, Bodas de ouro, Amigo secreto, Festa à fantasia, Churrasco de domingo, Dia do Amigo',
  },
  {
    theme: 'app ou rede social', category: 'geral', label: 'apps e redes sociais',
    keys: ['apps', 'app', 'aplicativos', 'aplicativo', 'redes sociais', 'rede social', 'internet'],
    list:
      'WhatsApp, Instagram, TikTok, Facebook, YouTube, Twitter|x, Spotify, Uber, iFood, Google Maps, Waze, Tinder, Telegram, ' +
      'LinkedIn, Pinterest, Snapchat, Kwai, Discord, Twitch, Shopee, Duolingo, ChatGPT, Zoom, Gmail, Netflix, Orkut, MSN, ' +
      'Messenger, Threads, CapCut',
  },
  {
    theme: 'videogame', category: 'geral', label: 'videogames',
    keys: ['videogames', 'videogame', 'games', 'game', 'jogos de videogame', 'gamer'],
    list:
      'Super Mario|mario, Sonic, Pac-Man, Tetris, Minecraft, Fortnite, GTA, Free Fire, Counter-Strike|cs, League of Legends|lol, ' +
      'The Sims, Pokémon, Zelda, God of War, Call of Duty, FIFA|ea fc, Mortal Kombat, Street Fighter, Among Us, Roblox, ' +
      'Candy Crush, Angry Birds, Resident Evil, Crash Bandicoot|crash, Donkey Kong, Clash Royale, Rocket League, Mario Kart, ' +
      'Halo, PES|winning eleven, Guitar Hero, Just Dance, Need for Speed, Subway Surfers, Elden Ring, Red Dead Redemption',
  },
  // ---------- Anime e história ----------
  {
    theme: 'personagem de anime', category: 'anime', label: 'animes',
    keys: ['animes', 'anime', 'personagens de anime', 'personagem de anime', 'otaku'],
    list:
      'Goku, Naruto, Luffy, Pikachu, Vegeta, Sasuke, Ichigo, Seiya, Light Yagami|light, Tanjiro, Nezuko, Gon, Zoro, Kakashi, ' +
      'Itachi, Gohan, Sailor Moon, Ash, Edward Elric, Saitama, Deku, All Might, Mikasa, Levi, Eren, Yugi, Shinji, Sanji, Nami, ' +
      'Hinata, Sakura, Piccolo, Freeza, Kenshin, Ikki, Shiryu, Hyoga, Shun, Doraemon, Totoro, Gojo',
  },
  {
    theme: 'personagem histórico', category: 'historia', label: 'história',
    keys: ['historia', 'historicos', 'personagens historicos', 'personagem historico', 'figuras historicas'],
    list:
      'Tiradentes, Dom Pedro I, Dom Pedro II, Princesa Isabel, Getúlio Vargas|vargas, Zumbi dos Palmares|zumbi, Napoleão, ' +
      'Cleópatra, Júlio César, Gandhi, Martin Luther King, Nelson Mandela|mandela, Abraham Lincoln|lincoln, Albert Einstein|einstein, ' +
      'Leonardo da Vinci|da vinci, Cristóvão Colombo|colombo, Pedro Álvares Cabral|cabral, Santos Dumont, Joana d’Arc, ' +
      'Rainha Elizabeth II|elizabeth, Alexandre o Grande, Galileu Galilei|galileu, Isaac Newton|newton, Charles Darwin|darwin, ' +
      'Marie Curie, Juscelino Kubitschek|jk, Lampião, Maria Bonita, Chico Mendes, Anita Garibaldi, Duque de Caxias, ' +
      'Marco Polo, Gengis Khan, Frida Kahlo, Beethoven, Mozart, Shakespeare, Machado de Assis, Carmen Miranda',
  },
];
