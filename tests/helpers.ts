import type { Outgoing } from '../src/lib/game/types';

/** Resumo legível do que o bot mandaria ao grupo. */
export const asText = (out: Outgoing[]) =>
  out
    .map((o) => {
      if (o.type === 'text') return o.text;
      if (o.type === 'image') return `[img:${o.image.kind}] ${o.caption ?? ''}`;
      if (o.type === 'react') return `[react:${o.emoji}]`;
      return `[timer:${o.delaySeconds}s]`;
    })
    .join('\n');
