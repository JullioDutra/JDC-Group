import type { ContentCategory } from '../../game/types';

/**
 * Anagrama: palavras para embaralhar, por tema. O tema aparece junto das
 * letras ("clube brasileiro", "animal"...). Respostas sem ambiguidade; quando
 * o nome tem duas palavras, cada uma é embaralhada separada.
 */
export interface AnagramWord {
  id: string;
  category: ContentCategory;
  theme: string;
  answer: string;
  aliases?: string[];
}

const words = (category: ContentCategory, theme: string, list: string): AnagramWord[] =>
  list.split(',').map((raw) => {
    const [answer, ...aliases] = raw.split('|').map((x) => x.trim());
    const slug = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
    const id = `an-${slug(theme)}-${slug(answer)}`;
    return { id, category, theme, answer, ...(aliases.length ? { aliases } : {}) };
  });

/**
 * Temas que dá para escolher no comando ("abrir anagrama capitais"). Só nomes
 * conhecidos: se alguém do grupo não reconheceria, não entra.
 */
export interface AnagramTheme {
  /** Nome do tema, como aparece na rodada. */
  theme: string;
  category: ContentCategory;
  /** Como o grupo pede o tema (sem acento). */
  keys: string[];
  /**
   * Palavras: "Resposta|apelido, Outra". No Anagrama só vale a resposta exata;
   * o apelido serve para o palpite final do Impostor, que usa as mesmas listas.
   */
  list: string;
}

export const ANAGRAM_THEMES: AnagramTheme[] = [
  {
    theme: 'clube brasileiro', category: 'futebol', keys: ['clubes', 'clube', 'times', 'time', 'clubes brasileiros', 'times brasileiros'],
    list: 'Flamengo, Palmeiras, Corinthians, Santos, Grêmio, Internacional|inter, Cruzeiro, Botafogo, Fluminense, Vasco, Bahia, Sport, Fortaleza, Ceará, Coritiba, Athletico|athletico paranaense, São Paulo, Vitória, Goiás, Chapecoense|chape, Juventude, Bragantino, Atlético Mineiro|atletico mg|galo, Ponte Preta, Guarani',
  },
  {
    theme: 'clube do exterior', category: 'futebol', keys: ['clubes de fora', 'times de fora', 'clubes do exterior', 'times do exterior', 'clubes gringos', 'times gringos', 'exterior', 'gringos', 'europa'],
    list: 'Barcelona, Liverpool, Chelsea, Arsenal, Juventus, Milan, Benfica, Porto, Ajax, Napoli, Real Madrid, Bayern de Munique|bayern, Manchester United, Manchester City, Tottenham, Inter de Milão|inter, Boca Juniors|boca, River Plate|river, Roma, Atlético de Madrid|atletico madrid, Borussia Dortmund|dortmund|borussia, Sevilla|sevilha, Lazio, Galatasaray, Peñarol|penarol, Monaco',
  },
  {
    theme: 'craque brasileiro', category: 'futebol', keys: ['craques', 'craque', 'jogadores', 'craques brasileiros', 'jogadores brasileiros'],
    list: 'Ronaldinho, Romário, Neymar, Rivaldo, Garrincha, Ronaldo, Adriano, Casemiro, Marquinhos, Alisson, Richarlison, Raphinha, Endrick, Rodrygo, Bebeto, Sócrates, Taffarel, Marcelo, Robinho, Daniel Alves, Rogério Ceni, Vinícius Júnior|vinicius junior|vini jr, Kaká, Zico, Pelé, Cafu, Júlio César, Hulk, Gabigol, Roberto Carlos',
  },
  {
    theme: 'craque do mundo', category: 'futebol', keys: ['craques do mundo', 'craques de fora', 'jogadores de fora', 'craques gringos', 'jogadores gringos'],
    list: 'Maradona, Mbappé, Haaland, Zidane, Beckham, Ibrahimovic, Lewandowski, Modric, Benzema, Salah, Iniesta, Cruyff, Beckenbauer, Bellingham, Griezmann, Pirlo, Totti, Buffon, Henry, Neuer, Lamine Yamal|yamal, Cristiano Ronaldo, Messi, Suárez, De Bruyne, Xavi, Dembélé, Harry Kane|kane',
  },
  {
    theme: 'seleção', category: 'futebol', keys: ['selecoes', 'selecao', 'paises da copa'],
    list: 'Argentina, Alemanha, Uruguai, Inglaterra, Portugal, Espanha, França, Holanda, Croácia, Bélgica, Marrocos, Colômbia, Paraguai, Equador, México, Senegal, Camarões, Nigéria, Noruega, Dinamarca, Suécia, Itália, Escócia, Japão, Estados Unidos, Chile',
  },
  {
    theme: 'coisa do futebol', category: 'futebol', keys: ['termos', 'coisas do futebol', 'termos do futebol', 'futebol raiz'],
    list: 'Goleiro, Zagueiro, Escanteio, Impedimento, Pênalti, Artilheiro, Lateral, Volante, Carrinho, Chuteira, Travessão, Estádio, Torcida, Árbitro, Bandeirinha, Prorrogação, Campeonato, Gandula, Vestiário, Uniforme',
  },
  {
    theme: 'técnico', category: 'futebol', keys: ['tecnicos', 'tecnico', 'treinadores', 'treinador'],
    list: 'Felipão|scolari|luiz felipe scolari, Zagallo, Telê Santana|tele, Parreira, Tite, Dunga, Luxemburgo, Abel Ferreira|abel, Jorge Jesus, Ancelotti, Guardiola, Mourinho, Klopp, Cuca, Renato Gaúcho|renato portaluppi, Dorival, Simeone, Diniz',
  },
  {
    theme: 'estádio', category: 'futebol', keys: ['estadios', 'estadio'],
    list: 'Maracanã, Mineirão, Morumbi|morumbis, Pacaembu, Beira-Rio|beira rio, Castelão, Vila Belmiro, Fonte Nova, São Januário, Engenhão|nilton santos, Mané Garrincha, Arena da Baixada, Arena do Grêmio, Itaquerão|neo quimica arena|arena corinthians, Arena MRV, Allianz Parque|nubank parque',
  },
  {
    theme: 'país', category: 'geral', keys: ['paises', 'pais'],
    list: 'Austrália, Canadá, Egito, Grécia, Índia, Irlanda, Jamaica, Rússia, Suíça, Tailândia, Turquia, Venezuela, Vietnã|vietna, China, Bolívia, Peru, Cuba, Israel, Ucrânia, Polônia, Áustria, Nova Zelândia, Islândia',
  },
  {
    theme: 'capital', category: 'geral', keys: ['capitais', 'capital'],
    list: 'Brasília, Montevidéu, Lisboa, Madri, Paris, Londres, Berlim, Tóquio, Pequim, Moscou, Roma, Santiago, Bogotá, Cairo, Atenas, Buenos Aires, Washington, Lima, Amsterdã|amsterda|amsterdam, Havana, Caracas, Assunção',
  },
  {
    theme: 'estado brasileiro', category: 'geral', keys: ['estados', 'estado', 'estados brasileiros'],
    list: 'Pernambuco, Amazonas, Maranhão, Tocantins, Rondônia, Roraima, Sergipe, Alagoas, Paraíba, Rio Grande do Norte, Mato Grosso, Santa Catarina, Espírito Santo, Minas Gerais, Piauí, Rio de Janeiro, Rio Grande do Sul, Mato Grosso do Sul, Pará, Amapá, Acre',
  },
  {
    theme: 'cidade brasileira', category: 'geral', keys: ['cidades', 'cidade', 'cidades brasileiras'],
    list: 'Florianópolis, Salvador, Curitiba, Manaus, Recife, Belém, Natal, Teresina, Campinas, Gramado, Petrópolis, Aracaju, Maceió, Goiânia, Uberlândia, Porto Alegre, Belo Horizonte, João Pessoa, Foz do Iguaçu, Ribeirão Preto',
  },
  {
    theme: 'animal', category: 'geral', keys: ['animais', 'animal', 'bichos', 'bicho'],
    list: 'Elefante, Girafa, Jacaré, Tartaruga, Leopardo, Cachorro, Golfinho, Borboleta, Camaleão, Pinguim, Tamanduá, Capivara, Papagaio, Crocodilo, Hipopótamo, Rinoceronte, Canguru, Tubarão, Coruja, Morcego, Cavalo, Macaco',
  },
  {
    theme: 'fruta ou comida', category: 'geral', keys: ['comidas', 'comida', 'frutas', 'fruta'],
    list: 'Abacaxi, Morango, Melancia, Laranja, Goiaba, Jabuticaba, Maracujá, Feijoada, Brigadeiro, Coxinha, Pastel, Tapioca, Churrasco, Pamonha, Lasanha, Macarrão, Chocolate, Pipoca, Sorvete, Mandioca, Banana, Hambúrguer|hamburguer',
  },
  {
    theme: 'profissão', category: 'geral', keys: ['profissoes', 'profissao'],
    list: 'Engenheiro, Professor, Advogado, Enfermeiro, Bombeiro, Jornalista, Cozinheiro, Carpinteiro, Dentista, Veterinário, Arquiteto, Motorista, Fotógrafo, Eletricista, Astronauta, Policial, Médico, Cabeleireiro',
  },
  {
    theme: 'artista brasileiro', category: 'geral', keys: ['artistas', 'artista', 'cantores', 'cantor', 'cantoras', 'musica', 'musicas'],
    list: 'Anitta, Ivete Sangalo, Caetano Veloso, Djavan, Ludmilla, Marília Mendonça, Alcione, Xuxa, Chico Buarque, Gilberto Gil, Rita Lee, Cazuza, Tim Maia, Roberto Carlos|rei roberto, Zeca Pagodinho, Gusttavo Lima, Luan Santana, Pabllo Vittar, Marisa Monte, Elis Regina, Seu Jorge, Wesley Safadão|safadao',
  },
  {
    theme: 'esporte', category: 'geral', keys: ['esportes', 'esporte', 'modalidades'],
    list: 'Basquete, Vôlei|volei, Handebol, Natação, Ciclismo, Atletismo, Ginástica, Judô|judo, Boxe, Surfe|surf, Skate, Tênis|tenis, Golfe|golf, Xadrez, Beisebol, Futsal, Karatê|karate, Esgrima',
  },
  {
    theme: 'novela', category: 'geral', keys: ['novelas', 'novela'],
    list: 'Pantanal, Avenida Brasil, Vale Tudo, O Clone, Senhora do Destino, Mulheres Apaixonadas, Fina Estampa, Laços de Família, Por Amor, Caminho das Índias, O Rei do Gado|rei do gado, A Favorita|favorita, Amor à Vida, Império, Terra Nostra, Cheias de Charme',
  },
  {
    theme: 'filme', category: 'geral', keys: ['filmes', 'filme', 'cinema'],
    list: 'Titanic, Avatar, Matrix, Shrek, Frozen, Toy Story, Rocky, Tubarão, Gladiador, Coringa, Barbie, Oppenheimer, Cidade de Deus, Tropa de Elite, Central do Brasil, Harry Potter, Star Wars, Jurassic Park, Procurando Nemo, Ainda Estou Aqui',
  },
  // Rodada 11: história e anime (o Impostor já tem os seus temas desses assuntos, com mais nomes).
  {
    theme: 'figura histórica', category: 'historia', keys: ['historia', 'historicos', 'figuras historicas', 'figura historica', 'personagens historicos'],
    list: 'Tiradentes, Napoleão, Cleópatra, Gandhi, Mandela, Lincoln, Einstein, Colombo, Cabral, Galileu, Newton, Darwin, Churchill, Zumbi, Getúlio Vargas, Princesa Isabel, Santos Dumont, Júlio César, Tutancâmon, Marco Polo, Vasco da Gama, Juscelino, Lampião, Maria Antonieta, Aristóteles, Platão, Michelangelo, Beethoven',
  },
  {
    theme: 'personagem de anime', category: 'anime', keys: ['anime', 'animes', 'personagens de anime', 'personagem de anime', 'otaku'],
    list: 'Goku, Naruto, Luffy, Pikachu, Vegeta, Sasuke, Ichigo, Seiya, Tanjiro, Nezuko, Zoro, Kakashi, Itachi, Gohan, Saitama, Mikasa, Eren, Sanji, Hinata, Sakura, Piccolo, Freeza, Doraemon, Totoro, Bulma, Kuririn, Shiryu, Hyoga',
  },
];

/** Temas do Anagrama que o Impostor não herda (ele já tem os seus, com outros nomes). */
export const ANAGRAM_ONLY = ['figura histórica', 'personagem de anime'];

export const ANAGRAMS: AnagramWord[] = ANAGRAM_THEMES.flatMap((t) => words(t.category, t.theme, t.list));

/** Tema pedido no comando ("capitais", "clubes de fora"), ou undefined. */
export function findAnagramTheme(raw: string): AnagramTheme | undefined {
  const key = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  return ANAGRAM_THEMES.find((t) => t.keys.includes(key) || t.theme.normalize('NFD').replace(/[̀-ͯ]/g, '') === key);
}


export function getAnagram(id: string): AnagramWord | undefined {
  return ANAGRAMS.find((a) => a.id === id);
}

/** Tira acento e põe em maiúscula: é como as letras aparecem. */
export const plainUpper = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

/**
 * Embaralha cada palavra (de 3 letras ou mais) até ficar diferente da
 * original. Letras separadas por espaço; palavras separadas por " / ".
 */
export function scramble(answer: string, rng: () => number): string {
  return plainUpper(answer)
    .split(/\s+/)
    .map((word) => {
      const letters = word.replace(/[^A-Z]/g, '').split('');
      if (letters.length < 3) return letters.join(' ');
      let out = letters;
      for (let tries = 0; tries < 10 && out.join('') === letters.join(''); tries++) {
        out = [...letters];
        for (let i = out.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [out[i], out[j]] = [out[j], out[i]];
        }
      }
      if (out.join('') === letters.join('')) out = [...letters.slice(1), letters[0]];
      return out.join(' ');
    })
    .join('  /  ');
}
