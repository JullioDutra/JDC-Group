import type { Outgoing } from './types';
import { LEAGUES, getTeam, type LeagueId } from './teams';

/**
 * Comando "ligas": as ligas do filtro dos temas de clube (rodada 13). Mostra
 * quantos clubes cada uma tem e exemplos de grandes, médios e raiz.
 */
export const LIGAS_COMMAND = /^(ligas|ligas disponiveis|quais ligas|lista de ligas|ligas do filtro)$/;

const HOW: Record<LeagueId, string> = {
  br: 'brasileirão',
  eng: 'premier',
  esp: 'la liga',
  ita: 'série a',
  ger: 'bundesliga',
  fra: 'ligue 1',
  arg: 'argentino',
};

const names = (ids: string[], max: number) => {
  const list = ids.map((id) => getTeam(id)?.name).filter((n): n is string => !!n);
  return list.slice(0, max).join(', ') + (list.length > max ? '…' : '');
};

export function ligasRows() {
  return (Object.keys(LEAGUES) as LeagueId[]).map((id) => {
    const { label, tiers } = LEAGUES[id];
    const total = tiers.flat().length;
    return {
      head: `${label} · ${total} clubes`,
      lines: [`Grandes: ${names(tiers[0], 4)}`, `Médios: ${names(tiers[1], 3)}`, `Raiz: ${names(tiers[2], 3)}`, `Peça: 1 ${HOW[id]}`],
    };
  });
}

export function ligasOutgoing(): Outgoing {
  const list = (Object.keys(LEAGUES) as LeagueId[]).map((id) => `*${HOW[id]}* (${LEAGUES[id].tiers.flat().length})`).join(' · ');
  return {
    type: 'image',
    image: {
      kind: 'textBoard',
      game: 'escalacao',
      pill: 'Ligas',
      title: 'Ligas do filtro',
      subtitle: 'Vale em todo tema de clube, no 1 x 1 e na sala',
      rows: ligasRows(),
    },
    caption:
      `⚽ *Ligas para os temas de clube*: ${list}.\n` +
      'Mande o tema + a liga: *abrir sala 1 brasileirão*, *3 premier*, *aleatório la liga*. Com *difícil*, mais clubes raiz.',
  };
}
