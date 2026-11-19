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

export const ANAGRAMS: AnagramWord[] = [
  ...words('futebol', 'clube brasileiro', 'Flamengo, Palmeiras, Corinthians, Santos, Grêmio, Internacional|inter, Cruzeiro, Botafogo, Fluminense, Vasco, Bahia, Sport, Fortaleza, Ceará, Coritiba, Athletico|athletico paranaense, Juventude, Chapecoense|chape, Bragantino, Náutico, Guarani, Paysandu, Remo, Criciúma, Figueirense, Cuiabá, Mirassol, Ponte Preta'),
  ...words('futebol', 'clube do exterior', 'Barcelona, Liverpool, Chelsea, Arsenal, Juventus, Milan, Benfica, Porto, Ajax, Napoli, Sevilla, Valencia, Marseille, Monaco, Tottenham, Everton, Celtic, River Plate|river, Galatasaray, Atalanta, Lazio, Feyenoord, Boca Juniors|boca, Peñarol|penarol, Independiente'),
  ...words('futebol', 'craque brasileiro', 'Ronaldinho, Romário, Neymar, Rivaldo, Garrincha, Ronaldo, Adriano, Casemiro, Marquinhos, Alisson, Richarlison, Raphinha, Endrick, Rodrygo, Bebeto, Rivellino, Sócrates, Taffarel, Marcelo, Robinho, Jairzinho, Tostão, Roberto Carlos, Daniel Alves, Rogério Ceni, Vinícius Júnior|vinicius junior|vini jr'),
  ...words('futebol', 'craque do mundo', 'Maradona, Mbappé, Haaland, Zidane, Beckham, Ibrahimovic, Lewandowski, Modric, Benzema, Salah, Iniesta, Platini, Cruyff, Beckenbauer, Bellingham, Griezmann, Pirlo, Totti, Buffon, Henry, Neuer, Lamine Yamal|yamal, Cristiano Ronaldo, Messi'),
  ...words('futebol', 'seleção', 'Argentina, Alemanha, Uruguai, Inglaterra, Portugal, Espanha, França, Holanda, Croácia, Bélgica, Marrocos, Colômbia, Paraguai, Equador, México, Senegal, Camarões, Nigéria, Noruega, Dinamarca, Suécia, Itália, Escócia, Japão'),
  ...words('futebol', 'coisa do futebol', 'Goleiro, Zagueiro, Escanteio, Impedimento, Pênalti, Artilheiro, Lateral, Volante, Carrinho, Chuteira, Travessão, Estádio, Torcida, Árbitro, Bandeirinha, Prorrogação, Campeonato, Gandula, Vestiário, Uniforme'),
  ...words('geral', 'capital', 'Brasília, Montevidéu, Lisboa, Madri, Paris, Londres, Berlim, Tóquio, Pequim, Moscou, Camberra, Ottawa, Santiago, Bogotá, Caracas, Cairo, Atenas, Buenos Aires, Washington, Assunção'),
  ...words('geral', 'estado brasileiro', 'Pernambuco, Amazonas, Maranhão, Tocantins, Rondônia, Roraima, Sergipe, Alagoas, Paraíba, Rio Grande do Norte, Mato Grosso, Santa Catarina, Espírito Santo, Minas Gerais, Piauí'),
  ...words('geral', 'cidade brasileira', 'Florianópolis, Salvador, Curitiba, Manaus, Recife, Belém, Natal, Teresina, Campinas, Gramado, Petrópolis, Aracaju, Maceió, Goiânia, Uberlândia'),
  ...words('geral', 'animal', 'Elefante, Girafa, Jacaré, Tartaruga, Leopardo, Cachorro, Golfinho, Borboleta, Camaleão, Pinguim, Tamanduá, Capivara, Papagaio, Crocodilo, Hipopótamo, Rinoceronte, Canguru, Tubarão, Coruja, Morcego'),
  ...words('geral', 'fruta ou comida', 'Abacaxi, Morango, Melancia, Laranja, Goiaba, Jabuticaba, Maracujá, Feijoada, Brigadeiro, Coxinha, Pastel, Tapioca, Churrasco, Pamonha, Lasanha, Macarrão, Chocolate, Pipoca, Sorvete, Mandioca'),
  ...words('geral', 'profissão', 'Engenheiro, Professor, Advogado, Enfermeiro, Bombeiro, Jornalista, Cozinheiro, Carpinteiro, Dentista, Veterinário, Arquiteto, Motorista, Fotógrafo, Eletricista, Astronauta'),
  ...words('geral', 'artista brasileiro', 'Anitta, Ivete Sangalo, Caetano Veloso, Djavan, Ludmilla, Marília Mendonça, Alcione, Xuxa, Chico Buarque, Gilberto Gil, Rita Lee, Cazuza, Tim Maia, Roberto Carlos|rei roberto, Zeca Pagodinho'),
  // Rodada 4 (19/11/2026): temas novos
  ...words('geral', 'país', 'Austrália, Canadá, Egito, Grécia, Índia, Irlanda, Jamaica, Nicarágua, Polônia, Rússia, Suíça, Tailândia, Turquia, Venezuela, Vietnã|vietna, Indonésia, Finlândia, Islândia, Quênia|quenia'),
  ...words('geral', 'esporte', 'Basquete, Vôlei|volei, Handebol, Natação, Ciclismo, Atletismo, Ginástica, Esgrima, Judô|judo, Boxe, Surfe|surf, Skate, Tênis|tenis, Golfe|golf, Xadrez, Badminton, Beisebol, Canoagem'),
  ...words('futebol', 'estádio brasileiro', 'Maracanã, Mineirão, Morumbi|morumbis, Pacaembu, Beira-Rio|beira rio, Castelão, Arruda, Vila Belmiro, Fonte Nova, São Januário, Couto Pereira, Barradão, Independência, Engenhão|nilton santos, Serra Dourada, Mangueirão'),
  ...words('futebol', 'técnico', 'Felipão|scolari|luiz felipe scolari, Zagallo, Telê Santana|tele, Parreira, Tite, Dunga, Luxemburgo, Abel Ferreira|abel, Jorge Jesus, Ancelotti, Guardiola, Mourinho, Klopp, Cuca, Renato Gaúcho|renato portaluppi, Dorival'),
  ...words('geral', 'novela', 'Pantanal, Avenida Brasil, Vale Tudo, Tieta, Roque Santeiro, O Clone, Terra Nostra, Senhora do Destino, Mulheres Apaixonadas, Explode Coração, O Rei do Gado|rei do gado, Fina Estampa, Laços de Família, Por Amor, Caminho das Índias'),
];

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
