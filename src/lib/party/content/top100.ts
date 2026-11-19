import type { ContentCategory, Top10Item } from '../../game/types';
import { TOP100_WIKI } from './top100-wiki';

/**
 * Top 100 do dia: uma lista de 100 por dia, a mesma para todos os grupos.
 * Cada acerto vale a posição do item (o 87º vale 87 pontos). Fonte e data
 * no título, como no Top 10.
 */
export interface Top100List {
  id: string;
  category: ContentCategory;
  title: string;
  source: string;
  /** 'pessoas': vale o sobrenome (regra de nomes do jogo); 'coisas': nome exato ou apelido. */
  kind: 'pessoas' | 'coisas';
  items: Top10Item[];
}

/** "A, B|apelido, C" → itens 1, 2, 3... */
const ordered = (list: string): Top10Item[] =>
  list.split(',').map((raw, i) => {
    const [name, ...aliases] = raw.split('|').map((x) => x.trim());
    return { rank: i + 1, name, ...(aliases.length ? { aliases } : {}) };
  });

const ELEMENTOS: Top100List = {
  id: 'elementos-1-100',
  category: 'geral',
  title: 'Os 100 primeiros elementos da tabela periódica (pelo número atômico)',
  source: 'IUPAC',
  kind: 'coisas',
  items: ordered(
    'Hidrogênio, Hélio, Lítio, Berílio, Boro, Carbono, Nitrogênio|azoto, Oxigênio, Flúor, Neônio|neon, Sódio, Magnésio, Alumínio, Silício, Fósforo, Enxofre, Cloro, Argônio|argon, Potássio, Cálcio, ' +
      'Escândio, Titânio, Vanádio, Cromo, Manganês, Ferro, Cobalto, Níquel, Cobre, Zinco, Gálio, Germânio, Arsênio|arsenico, Selênio, Bromo, Criptônio|kriptonio|cripton, Rubídio, Estrôncio, Ítrio, Zircônio, ' +
      'Nióbio, Molibdênio, Tecnécio, Rutênio, Ródio, Paládio, Prata, Cádmio, Índio, Estanho, Antimônio, Telúrio, Iodo, Xenônio|xenon, Césio, Bário, Lantânio, Cério, Praseodímio, Neodímio, ' +
      'Promécio, Samário, Európio, Gadolínio, Térbio, Disprósio, Hólmio, Érbio, Túlio, Itérbio, Lutécio, Háfnio, Tântalo, Tungstênio|volframio|wolfram, Rênio, Ósmio, Irídio, Platina, Ouro, Mercúrio, ' +
      'Tálio, Chumbo, Bismuto, Polônio, Astato, Radônio|radon, Frâncio, Rádio, Actínio, Tório, Protactínio, Urânio, Netúnio, Plutônio, Amerício, Cúrio, Berquélio, Califórnio, Einstênio, Férmio',
  ),
};

const POKEMON: Top100List = {
  id: 'pokemon-1-100',
  category: 'anime',
  title: 'Os 100 primeiros Pokémon da Pokédex',
  source: 'Pokédex nacional (Kanto)',
  kind: 'coisas',
  items: ordered(
    'Bulbasaur, Ivysaur, Venusaur, Charmander, Charmeleon, Charizard, Squirtle, Wartortle, Blastoise, Caterpie, Metapod, Butterfree, Weedle, Kakuna, Beedrill, Pidgey, Pidgeotto, Pidgeot, Rattata, Raticate, ' +
      'Spearow, Fearow, Ekans, Arbok, Pikachu, Raichu, Sandshrew, Sandslash, Nidoran fêmea|nidoran f, Nidorina, Nidoqueen, Nidoran macho|nidoran m, Nidorino, Nidoking, Clefairy, Clefable, Vulpix, Ninetales, Jigglypuff, Wigglytuff, ' +
      'Zubat, Golbat, Oddish, Gloom, Vileplume, Paras, Parasect, Venonat, Venomoth, Diglett, Dugtrio, Meowth, Persian, Psyduck, Golduck, Mankey, Primeape, Growlithe, Arcanine, Poliwag, ' +
      'Poliwhirl, Poliwrath, Abra, Kadabra, Alakazam, Machop, Machoke, Machamp, Bellsprout, Weepinbell, Victreebel, Tentacool, Tentacruel, Geodude, Graveler, Golem, Ponyta, Rapidash, Slowpoke, Slowbro, ' +
      "Magnemite, Magneton, Farfetch'd|farfetchd, Doduo, Dodrio, Seel, Dewgong, Grimer, Muk, Shellder, Cloyster, Gastly, Haunter, Gengar, Onix, Drowzee, Hypno, Krabby, Kingler, Voltorb",
  ),
};

export const TOP100_LISTS: Top100List[] = [...TOP100_WIKI, ELEMENTOS, POKEMON];

export function getTop100(id: string | null): Top100List | undefined {
  return TOP100_LISTS.find((l) => l.id === id);
}

/** Dia no horário de Brasília (AAAA-MM-DD): o "hoje" do jogo. */
export function dayKey(now: Date): string {
  return new Date(now.getTime() - 3 * 3600_000).toISOString().slice(0, 10);
}

/** Lista do dia: a mesma para todos os grupos; gira pela lista inteira. */
export function listOfDay(now: Date): Top100List {
  const days = Math.floor(Date.parse(`${dayKey(now)}T00:00:00Z`) / 86_400_000);
  return TOP100_LISTS[days % TOP100_LISTS.length];
}
