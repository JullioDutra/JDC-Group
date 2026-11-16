import type { JudgeTeam, TeamJudge } from '../party/common';
import { extractJson, hasMaritacaKey, maritacaJson } from './maritaca';

const JUDGE_PROMPT = `Você é um comentarista de futebol imparcial julgando um desafio entre amigos.
Dois times de 6 jogadores (goleiro, 2 defensores, 2 meias, 1 atacante) foram montados, cada jogador vindo de um clube sorteado.
Compare os times considerando cada jogador no auge da carreira, o equilíbrio entre as posições e se cada um joga na posição em que foi escalado.
Vaga com "—" está vazia e pesa muito contra.

Responda SOMENTE com JSON: {"vencedor": 1, "motivo": "até 2 frases curtas, citando nomes"}
Use "vencedor": 1 ou 2. Use 0 só se os times forem realmente equivalentes.`;

function describe(team: JudgeTeam, n: number): string {
  return `Time ${n} (${team.player}):\n${team.lineup.map((l) => `- ${l.position}: ${l.name}${l.club ? ` (${l.club})` : ''}`).join('\n')}`;
}

/** Juiz pela IA (Maritaca). Lança erro em falha; o motor cai na regra de reserva. */
export const maritacaJudge: TeamJudge = async (teams) => {
  const content = await maritacaJson(JUDGE_PROMPT, `${describe(teams[0], 1)}\n\n${describe(teams[1], 2)}`, 300);
  const raw = extractJson(content) as { vencedor?: unknown; motivo?: unknown };
  const reason = typeof raw.motivo === 'string' && raw.motivo.trim() ? raw.motivo.trim().slice(0, 300) : 'Decisão da IA.';
  const v = Number(raw.vencedor);
  return { winner: v === 1 ? 0 : v === 2 ? 1 : 'draw', reason };
};

export function defaultJudge(): TeamJudge | undefined {
  return hasMaritacaKey() ? maritacaJudge : undefined;
}
