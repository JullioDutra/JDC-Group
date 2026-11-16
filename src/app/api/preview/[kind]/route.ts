import { SLOTS, type ImageSpec, type MatchState } from '@/lib/game/types';
import { renderImage } from '@/lib/images/render';

export const runtime = 'nodejs';

/** Imagens de exemplo (dados fixos) usadas na página inicial. */
const base: MatchState = {
  status: 'PLAYING',
  players: [{ jid: 'a', name: 'Rafa' }, { jid: 'b', name: 'Duda' }],
  modeId: 'artilheiros',
  restrictions: SLOTS.map(() => ({ kind: 'none' })),
  picks: [
    [{ name: 'Rogério Ceni', key: 'a', value: 131 }, { name: 'Sergio Ramos', key: 'b', value: 140 }, { name: 'Koeman', key: 'c', value: 250 }, null, null, null],
    [{ name: 'Neuer', key: 'd', value: 0 }, { name: 'Roberto Carlos', key: 'e', value: 113 }, { name: 'Marcelo', key: 'f', value: 60 }, { name: 'Kaká', key: 'g', value: 230 }, null, null],
  ],
  round: 3, turn: 0, turnStartedAt: 0, createdAt: 0, updatedAt: 0, winner: null,
};

const SPECS: Record<string, ImageSpec> = {
  desafio: { kind: 'challenge', host: 'Rafa' },
  temas: { kind: 'modes' },
  inicio: { kind: 'kickoff', state: base },
  campinho: { kind: 'pitch', state: base },
};

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const spec = SPECS[(await params).kind];
  if (!spec) return new Response('not found', { status: 404 });
  const png = await renderImage(spec);
  return new Response(new Uint8Array(png), {
    headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=3600, s-maxage=86400' },
  });
}
