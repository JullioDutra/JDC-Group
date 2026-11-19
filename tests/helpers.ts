import { MODES } from '../src/lib/game/modes';

// Testes antigos: sem a pausa entre rodadas (tests/pausa.test.ts testa a pausa).
process.env.PARTY_PAUSE ??= '0';
import type { Outgoing } from '../src/lib/game/types';

/** Resumo legível do que o bot mandaria ao grupo. */
export const asText = (out: Outgoing[]) =>
  out
    .map((o) => {
      if (o.type === 'text') return o.text;
      if (o.type === 'image') return `[img:${o.image.kind}] ${o.caption ?? ''}`;
      if (o.type === 'react') return `[react:${o.emoji}]`;
      if (o.type === 'dm') return `[dm:${o.name}]`; // o conteúdo do privado não aparece no grupo
      return `[timer:${o.delaySeconds}s]`;
    })
    .join('\n');

/**
 * Os temas do jogo sempre sorteiam clube ou seleção. Os testes do motor usam o
 * elenco de demonstração (poucos jogadores), então liberam as restrições.
 */
const FORMERLY_FREE = ['artilheiros', 'garcons', 'gigantes', 'copa', 'champions', 'rodados', 'incansaveis', 'brasileirao', 'libertadores'];

export function freePlayForTests(): void {
  for (const m of MODES) if (FORMERLY_FREE.includes(m.id)) (m as { restriction: string }).restriction = 'none';
}
