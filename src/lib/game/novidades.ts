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
    // Repete a Cravada de 27/11: a versão anterior durou pouco e quase nenhum grupo viu.
    id: '2026-11-27b',
    date: '27/11',
    items: [
      { head: 'Jogo novo: Cravada', lines: ['Mande: abrir cravada. O bot dá um ranking', 'e pede uma posição: quem é o 35º?'] },
      { head: 'Cravada com imagens', lines: ['Pergunta, revelação com a régua da lista,', 'o palpite de cada um e os temas.'] },
      { head: 'Como pontua', lines: ['1 palpite por pessoa. Cravou: 100; perto', 'vale mais; fora da lista: 0.'] },
      { head: 'Escolha o tema', lines: ['abrir cravada artilheiros, premier,', 'brasileirão... (temas da cravada).'] },
    ],
  },
  {
    id: '2026-11-27',
    date: '27/11',
    items: [
      { head: 'Jogo novo: Cravada', lines: ['Mande: abrir cravada. O bot dá um ranking', 'e pede uma posição: quem é o 35º?'] },
      { head: 'Como pontua', lines: ['1 palpite por pessoa. Cravou: 100; perto', 'vale mais; fora da lista: 0.'] },
      { head: 'Cravada: 98 listas', lines: ['Artilheiros, Bola de Ouro 2026, tabelas', 'de 2025/26, seleções e transferências.'] },
      { head: 'Escolha o tema', lines: ['abrir cravada artilheiros, premier,', 'brasileirão... (temas da cravada).'] },
    ],
  },
  {
    // Repete os itens de 26/11d: com os jogos pausados, quase nenhum grupo viu.
    id: '2026-11-26e',
    date: '26/11',
    items: [
      { head: 'Goleiro com número', lines: ['Garçons e Artilheiros: goleiro sem dado', 'conta 0 em vez de travar a rodada.'] },
      { head: 'Rosto Borrado: fotos novas', lines: ['O admin põe e tira fotos pela página;', 'as novas já entram no sorteio.'] },
      { head: 'Números da carreira com fonte', lines: ['Jogos e gols pela Wikipédia (clubes +', 'seleção), atualizados até novembro de 2026.'] },
      { head: 'O número não muda mais', lines: ['O mesmo jogador tem o mesmo número', 'em todas as partidas.'] },
      { head: 'FICHA mostra a fonte', lines: ['Mande: ficha Messi', 'e veja de onde vem cada número.'] },
    ],
  },
  {
    id: '2026-11-26d',
    date: '26/11',
    items: [
      { head: 'Números da carreira com fonte', lines: ['Jogos e gols pela Wikipédia (clubes +', 'seleção), atualizados até novembro de 2026.'] },
      { head: 'O número não muda mais', lines: ['O mesmo jogador tem o mesmo número', 'em todas as partidas.'] },
      { head: 'FICHA mostra a fonte', lines: ['Mande: ficha Messi', 'e veja de onde vem cada número.'] },
    ],
  },
  {
    id: '2026-11-26c',
    date: '26/11',
    items: [
      { head: 'Menos "não achei a carreira"', lines: ['Jogador conhecido pelo apelido (ex.: Egídio)', 'agora é achado no Wikidata e na Wikipédia.'] },
      { head: 'Fonte fora do ar não trava', lines: ['Se o Wikidata não responder, vale o jogador', 'que a IA reconhece.'] },
      { head: 'Anagrama: tema Copa 2026', lines: ['Mande: abrir anagrama copa 2026.'] },
      { head: 'Impostor: tema Copa 2026', lines: ['Mande: abrir impostor copa 2026.', 'Sedes, mascotes, craques e estreantes.'], games: ['impostor'] },
      { head: 'Mais Copa 2026 nos jogos', lines: ['Mascotes, bola, sedes, estreantes, show', 'da final e seleção do torneio.'] },
      { head: 'Quem é: 3 fichas novas', lines: ['Cubarsí, Olise e Bellingham.'] },
    ],
  },
  {
    id: '2026-11-26b',
    date: '26/11',
    items: [
      { head: 'Jogador fora da base: Wikidata', lines: ['Quem a base não tem é buscado na hora.', 'Ex.: Leônidas da Silva já entra conferido.'] },
      { head: 'Seleção pela Wikipédia', lines: ['Temas 7 e 8: jogos e gols pela seleção', 'vêm da Wikipédia, não mais da IA.'] },
      { head: 'Posição conferida', lines: ['Se o Wikidata não tem a posição da rodada,', 'a Wikipédia confirma (ex.: Havertz no ataque).'] },
      { head: 'Que Time: +11 e 3 correções', lines: ['Chelsea 2025, Real 2022 e 2024, Bayern 2013...', 'City 2023, Galo 2013 e Botafogo 2024 corrigidos.'] },
      { head: 'Listas novas', lines: ['Top 10: mais jogos e mais gols por seleção.', 'Sobrevivente +6 e Conexões +4.'] },
      { head: 'Quem é sem cola', lines: ['Dica que trazia a resposta foi reescrita;', 'apelido citado na dica não vale sozinho.'] },
    ],
  },
  {
    id: '2026-11-26',
    date: '26/11',
    items: [
      { head: 'Clube conferido em 2 fontes', lines: ['Wikidata e, se faltar, a Wikipédia.', 'Ex.: Fábio no Fluminense agora vale.'] },
      { head: 'Passagem inventada não vale', lines: ['Ficha que só a IA tinha é conferida.', 'Ex.: Domingos da Guia no Milan não vale.'] },
      { head: 'Seleção não é clube', lines: ['A seleção saiu da lista de clubes', 'que aparece na recusa e na FICHA.'] },
      { head: 'Sem fonte: não gasta tentativa', lines: ['Carreira que não dá para conferir:', 'o bot avisa e você manda outro.'] },
      { head: 'Conteúdo de 2025/26', lines: ['Finais da Champions, Liga Europa,', 'Conference e Libertadores; janela de 2026.'] },
      { head: 'Que Time: 3 escalações novas', lines: ['Espanha 2026, Flamengo 2025 e Palace 2026.'] },
    ],
  },
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

/** Versão mais nova com algo para o grupo (o grupo só de Impostor pula as que não mexem no Impostor). */
export function latestNewsFor(onlyImpostor: boolean): News | null {
  return NEWS.find((n) => newsFor(n, onlyImpostor).length > 0) ?? null;
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
