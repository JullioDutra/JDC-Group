import { type SimData, pct, remaining, shortDate, simulate, standings } from './brasileirao';

/** "simulador", "quem cai", "brasileirão", "simulador do brasileirão", "z4"... */
export const SIM_COMMAND = /^(simulador( do brasileirao)?|simular( o)? brasileirao|brasileirao|tabela do brasileirao|quem cai|quem vai cair|z4)$/;

/** Resposta do grupo: chance de cair, de título e de G4, e o link da página. */
export function simulatorText(data: SimData, siteUrl: string): string {
  const odds = simulate(data);
  const table = standings(data);
  const open = remaining(data).length;
  const list = (key: 'z4' | 'title' | 'g4', min = 0) =>
    table
      .filter((r) => odds[r.id][key] > min && (key !== 'g4' || odds[r.id][key] < 1))
      .sort((a, b) => odds[b.id][key] - odds[a.id][key])
      .map((r) => `${r.name} ${pct(odds[r.id][key])}`)
      .join(' · ');
  const lines = [
    '📊 *Brasileirão 2026: quem cai?*',
    open
      ? `Faltam ${open} jogos (dados de ${shortDate(data.update)}, ${data.source}). Chances em 5.000 simulações:`
      : `Campeonato encerrado (dados de ${shortDate(data.update)}, ${data.source}).`,
    '',
    `⬇️ *Cair*: ${list('z4') || 'ninguém mais corre risco'}`,
    `🏆 *Título*: ${list('title')}`,
  ];
  const g4 = list('g4');
  if (g4) lines.push(`🔵 *Briga pelo G4*: ${g4}`);
  lines.push('', `Marque os jogos que faltam e veja a sua tabela final: ${siteUrl}/simulador`);
  return lines.join('\n');
}
