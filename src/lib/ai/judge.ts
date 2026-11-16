import type { JudgeTeam, TeamJudge, WordCheck } from '../party/common';
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

const WORDS_PROMPT = `Você é o juiz de uma partida de Stop (Adedonha) em português do Brasil.
Para cada item, diga se a palavra é um exemplo válido e real da categoria e começa com a letra pedida.
Seja justo: aceite grafias comuns e nomes populares; recuse palavras inventadas ou de outra categoria.
Responda SOMENTE com JSON: {"validas": [true, false, ...]} na mesma ordem dos itens.`;

/** Juiz de palavras do Stop (Maritaca), em lote: 1 chamada por rodada. */
export const maritacaWordCheck: WordCheck = async (letter, items) => {
  const list = items.map((it, i) => `${i + 1}. categoria: ${it.category} · palavra: ${it.word}`).join('\n');
  const content = await maritacaJson(WORDS_PROMPT, `Letra: ${letter}\n${list}`, 60 + items.length * 8);
  const raw = extractJson(content) as { validas?: unknown };
  const arr = Array.isArray(raw.validas) ? raw.validas : [];
  return items.map((_, i) => arr[i] === true);
};

export function defaultWordCheck(): WordCheck | undefined {
  return hasMaritacaKey() ? maritacaWordCheck : undefined;
}
