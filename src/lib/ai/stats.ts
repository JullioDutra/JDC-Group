import type { PlayerRecord, StatKey } from '../players/types';
import { extractJson, hasMaritacaKey, maritacaJson } from './maritaca';

/**
 * Pergunta focada: com o jogador já identificado (nome completo, nascimento,
 * clubes), pede UM número só. A IA acerta muito mais assim do que quando
 * precisa preencher 17 campos de uma vez, e quase nunca deixa em branco.
 */
export type StatFetcher = (player: PlayerRecord, stat: StatKey) => Promise<number | null>;

export const STAT_QUESTION: Record<StatKey, string> = {
  careerGoals: 'gols oficiais na carreira profissional, somando clubes e seleção principal',
  careerAssists: 'assistências oficiais na carreira profissional, somando clubes e seleção principal',
  peakValueEurM: 'maior valor de mercado da carreira, em milhões de euros (referência Transfermarkt)',
  intlCaps: 'jogos pela seleção principal',
  intlGoals: 'gols pela seleção principal',
  worldCupGoals: 'gols em Copas do Mundo (fase final)',
  uclGoals: 'gols na Liga dos Campeões / Copa dos Campeões da Europa, sem fases preliminares',
  titles: 'títulos oficiais como profissional (clubes + seleção principal)',
  careerApps: 'jogos oficiais na carreira profissional, somando clubes e seleção principal',
  brasileiraoGoals: 'gols na Série A do Campeonato Brasileiro (0 se nunca jogou nela)',
  libertadoresGoals: 'gols na Copa Libertadores (0 se nunca jogou)',
  worldCupsPlayed: 'quantas Copas do Mundo disputou entrando em campo',
  heightCm: 'altura em centímetros',
  debutYear: 'ano da estreia como profissional',
  marketValueEurM: 'valor de mercado ATUAL, em milhões de euros (referência Transfermarkt); 0 se já parou de jogar',
};

const SYSTEM = `Você é um estatístico de futebol. Recebe um jogador já identificado e UM dado pedido.
Responda SOMENTE com JSON: {"valor": número ou null}.
Dê o número real; se não souber o exato, dê a sua melhor estimativa (é um jogo entre amigos, uma estimativa boa vale mais que nada).
Use null só se você não tiver nenhuma noção sobre esse jogador. Zero só quando o real for zero.
Goleiros também marcam gols (pênaltis e faltas): conte esses gols quando o dado for de gols.`;

export function describePlayer(p: PlayerRecord): string {
  const lines = [
    `Jogador: ${p.name}${p.aliases.length ? ` (também: ${p.aliases.slice(0, 4).join(', ')})` : ''}`,
    p.birthDate ? `Nascimento: ${p.birthDate}` : '',
    p.nationality ? `Seleção/país: ${p.nationality}` : '',
    p.positions.length ? `Posição: ${p.positions.join('/')}` : '',
    p.clubs.length ? `Clubes: ${p.clubs.slice(0, 15).join(', ')}` : '',
  ];
  return lines.filter(Boolean).join('\n');
}

export const maritacaStat: StatFetcher = async (player, stat) => {
  const anchor =
    stat === 'careerGoals' && player.anchors?.clubGoals
      ? `\nReferência do Wikidata (só ligas, pode estar incompleta): ${player.anchors.clubGoals} gols em ${player.anchors.clubApps} jogos por clubes.`
      : stat === 'careerApps' && player.anchors?.clubApps
        ? `\nReferência do Wikidata (só ligas, pode estar incompleta): ${player.anchors.clubApps} jogos por clubes.`
        : '';
  const content = await maritacaJson(SYSTEM, `${describePlayer(player)}${anchor}\n\nDado pedido: ${STAT_QUESTION[stat]}.`, 60);
  const raw = extractJson(content) as { valor?: unknown };
  const v = typeof raw.valor === 'number' ? raw.valor : typeof raw.valor === 'string' ? Number(raw.valor) : NaN;
  return Number.isFinite(v) && v >= 0 ? v : null;
};

export function defaultStatFetcher(): StatFetcher | undefined {
  return hasMaritacaKey() ? maritacaStat : undefined;
}
