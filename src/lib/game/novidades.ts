import type { Outgoing } from './types';

/**
 * Novidades com imagem (rodada 13). Toda atualização com mudança que o grupo
 * percebe ganha uma entrada aqui (regra no CLAUDE.md). Depois de publicar, a
 * imagem sai sozinha, uma vez por grupo, na primeira resposta do bot fora de
 * partida. Item com `games` só aparece onde o jogo existe: o grupo só de
 * Impostor recebe só os itens do Impostor.
 */
export interface NewsItem {
  head: string;
  lines: string[];
  /** Jogos do item ('impostor'...). Sem: vale para o grupo com todos os jogos. */
  games?: string[];
}

export interface News {
  /** Identificador da versão (também a chave do "já viu"). */
  id: string;
  /** Data mostrada na imagem (DD/MM). */
  date: string;
  items: NewsItem[];
}

/** Da mais nova para a mais antiga. Linha com até 48 letras (cabe sem cortar na imagem). */
export const NEWS_LINE_MAX = 48;
export const NEWS: News[] = [
  {
    id: '2026-11-25',
    date: '25/11',
    items: [
      {
        head: 'Escalação mais justa',
        lines: ['Clube conferido no Wikidata, na hora.', 'Quem nunca jogou lá não vale.', 'A recusa mostra os clubes do jogador.'],
      },
      { head: '3 tentativas por vez', lines: ['Nome inventado, repetido ou errado gasta 1.', 'Errou 3: fica com o pior valor do tema.'] },
      { head: 'Temas novos: 20, 21 e 22', lines: ['Rei da Falta: gols de falta.', 'Decisivo: gols em finais.', 'Dono da Marca: gols de pênalti.'] },
      { head: 'Ligas', lines: ['Mande LIGAS: as 7 ligas do filtro', 'e os clubes de cada uma.'] },
      { head: 'Impostor: detetive', lines: ['Com 2 impostores, um inocente é o detetive.', 'Voto de minerva 1 vez: decide sozinho.'], games: ['impostor'] },
      {
        head: 'Impostor: 2 impostores',
        lines: ['Com 7 ou mais: o anfitrião manda 2 IMPOSTORES.', 'O grupo só vence pegando os dois.'],
        games: ['impostor'],
      },
    ],
  },
];

export const NEWS_COMMAND = /^(novidades|o que mudou|o que tem de novo|atualizacoes|atualizacao|changelog)$/;
export const NEWS_SEEN_KIND = 'novidades';

/** Itens que valem para o grupo (só de Impostor: só os do Impostor). */
export function newsFor(news: News, onlyImpostor: boolean): NewsItem[] {
  return news.items.filter((i) => (onlyImpostor ? i.games?.includes('impostor') : true));
}

export function newsOutgoing(news: News, onlyImpostor: boolean): Outgoing | null {
  const items = newsFor(news, onlyImpostor);
  if (!items.length) return null;
  return {
    type: 'image',
    image: {
      kind: 'textBoard',
      game: onlyImpostor ? 'impostor' : 'escalacao',
      pill: 'Novidades',
      title: 'Novidades',
      subtitle: `Atualização de ${news.date} · mande NOVIDADES para ver de novo`,
      rows: items.map((i) => ({ head: i.head, lines: i.lines })),
    },
    caption: `🆕 *Novidades de ${news.date}*\n${items.map((i) => `• *${i.head}*: ${i.lines.join(' ')}`).join('\n')}`,
  };
}
