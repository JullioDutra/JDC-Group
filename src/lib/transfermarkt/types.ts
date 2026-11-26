/** Ficha de um jogador vinda do Transfermarkt (base gerada pelo scripts/tm-sync.ts). */
export interface TmPlayer {
  /** Q-id do Wikidata (a ligação com a nossa base, pela propriedade P2446). */
  qid: string;
  /** Código do jogador no Transfermarkt. */
  tmId: string;
  name: string;
  /** Data da leitura (AAAA-MM-DD). */
  at: string;
  /** Clubes profissionais pelo histórico de transferências (com empréstimos), na ordem. */
  clubs: string[];
  /** Totais da carreira (todas as competições, clubes e seleção) e valores em milhões de euros. */
  stats: Partial<Record<'careerApps' | 'careerGoals' | 'careerAssists' | 'careerCards' | 'marketValueEurM' | 'peakValueEurM', number>>;
}

/** Jogador a atualizar: quem a gente procura e onde. */
export interface TmTarget {
  qid: string;
  tmId: string;
  name: string;
  sitelinks?: number;
}
