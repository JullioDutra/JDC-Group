/** Categorias do dossiê Melhores do Ano 2026. Não são jogos nem itens da ajuda principal. */
export const AWARD_CATEGORIES = [
  ['Cartoleiro do Ano', 'Pessoa'],
  ['Nunca Critiquei (Mais Sensato)', 'Pessoa'],
  ['Rei das Fakes', 'Pessoa'],
  ['Dinizismo (Sem Argumentos)', 'Pessoa'],
  ['Prêmio Sormani (Quem Não Entende de Futebol)', 'Pessoa'],
  ['Prêmio Nuvem (Clubista do Ano)', 'Pessoa'],
  ['Prêmio Augusto Melo (Caloteiro)', 'Pessoa'],
  ['Melhor Nome do Grupo', 'Nome do grupo'],
  ['Vagabundo do Ano', 'Pessoa'],
  ['Pérola do Ano', 'Lance/frase'],
  ['Mico do Ano', 'Lance/frase'],
  ['Fala Bosta do Ano', 'Pessoa'],
  ['Aloprador do Ano (Quem Mais Encheu o Saco)', 'Pessoa'],
  ['Jantada do Ano', 'Lance/frase'],
  ['Rei das Tretas', 'Pessoa'],
  ['Vergonha do Ano', 'Lance/frase'],
  ['Zicador do Ano', 'Lance/frase'],
  ['Pau Mole do Ano', 'Lance/frase'],
  ['Mais Chato do Ano', 'Pessoa'],
  ['Iludido do Ano', 'Lance/frase'],
  ['Passa Pano', 'Lance/frase'],
  ['Lá Ele', 'Lance/frase'],
] as const;

export function categoryLabel(category: number | null): string {
  return category === null ? 'A classificar' : AWARD_CATEGORIES[category - 1][0];
}
