import type { PlayerProfile, Position } from '../game/types';

const SYSTEM_PROMPT = `Você é o banco de dados de um jogo de conhecimentos de futebol.
Recebe um nome digitado por um jogador (pode ter erro de digitação, apelido ou só o sobrenome) e devolve a ficha do futebolista profissional (masculino ou feminino, de qualquer época) mais provável.

Responda SOMENTE com um objeto JSON, sem texto fora dele, neste formato:
{
  "exists": true,
  "name": "nome pelo qual é mais conhecido no Brasil",
  "positions": ["GOL" | "DEF" | "MEI" | "ATA"],
  "nationality": "país da seleção que defende, em português",
  "birthDate": "AAAA-MM-DD",
  "clubs": ["todos os clubes profissionais da carreira, nome usual em português, sem time B/base"],
  "heightCm": 0,
  "careerGoals": 0,
  "careerAssists": 0,
  "peakValueEurM": 0,
  "intlCaps": 0,
  "intlGoals": 0,
  "worldCupGoals": 0,
  "uclGoals": 0,
  "titles": 0,
  "careerApps": 0,
  "brasileiraoGoals": 0,
  "libertadoresGoals": 0,
  "worldCupsPlayed": 0,
  "debutYear": 0
}

Regras:
- Se o nome não corresponder a nenhum futebolista profissional real (pessoa inventada, de outro esporte, técnico que nunca jogou, palavra aleatória), responda {"exists": false}. Na dúvida, prefira {"exists": false} a inventar.
- positions: 1 ou 2 grupos em que o jogador realmente atuou. Zagueiros e laterais = DEF; volantes, meias e alas = MEI; pontas, segundos atacantes e centroavantes = ATA.
- careerGoals / careerAssists: jogos oficiais na carreira profissional, clubes + seleção principal.
- peakValueEurM: maior valor de mercado da carreira, em milhões de euros (referência Transfermarkt).
- intlCaps / intlGoals: jogos e gols pela seleção principal.
- worldCupGoals: gols em Copas do Mundo. uclGoals: gols na Champions League / Copa dos Campeões da Europa (sem fases preliminares).
- titles: títulos oficiais como profissional (clubes + seleção principal).
- careerApps: jogos oficiais na carreira profissional (clubes + seleção principal).
- brasileiraoGoals: gols na Série A do Campeonato Brasileiro (0 se nunca jogou nela). libertadoresGoals: gols na Copa Libertadores.
- worldCupsPlayed: quantas Copas do Mundo disputou entrando em campo. debutYear: ano da estreia como profissional.
- Use números inteiros (peakValueEurM pode ter decimal). Se você realmente não souber um dado, use null — nunca chute. Zero só quando o valor real for zero.`;

const POSITIONS: Position[] = ['GOL', 'DEF', 'MEI', 'ATA'];

function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return null;
}

/** Extrai o primeiro objeto JSON de uma resposta que pode vir com cerca de código. */
export function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('resposta da IA sem JSON');
  return JSON.parse(text.slice(start, end + 1));
}

/** Valida e saneia a ficha. null = jogador não existe. */
export function parseProfile(raw: unknown): PlayerProfile | null {
  if (!raw || typeof raw !== 'object') throw new Error('ficha inválida');
  const r = raw as Record<string, unknown>;
  if (r.exists !== true) return null;
  const name = typeof r.name === 'string' ? r.name.trim() : '';
  const positions = Array.isArray(r.positions)
    ? POSITIONS.filter((p) => (r.positions as unknown[]).includes(p))
    : [];
  if (!name || positions.length === 0) return null;
  const birthDate = typeof r.birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.birthDate) ? r.birthDate : null;
  return {
    exists: true,
    name: name.slice(0, 40),
    positions,
    nationality: typeof r.nationality === 'string' ? r.nationality : null,
    birthDate,
    clubs: Array.isArray(r.clubs) ? r.clubs.filter((c): c is string => typeof c === 'string').slice(0, 40) : [],
    heightCm: num(r.heightCm),
    careerGoals: num(r.careerGoals),
    careerAssists: num(r.careerAssists),
    peakValueEurM: num(r.peakValueEurM),
    intlCaps: num(r.intlCaps),
    intlGoals: num(r.intlGoals),
    worldCupGoals: num(r.worldCupGoals),
    uclGoals: num(r.uclGoals),
    titles: num(r.titles),
    careerApps: num(r.careerApps),
    brasileiraoGoals: num(r.brasileiraoGoals),
    libertadoresGoals: num(r.libertadoresGoals),
    worldCupsPlayed: num(r.worldCupsPlayed),
    debutYear: num(r.debutYear),
  };
}

export function hasMaritacaKey(): boolean {
  return Boolean(process.env.MARITACA_API_KEY);
}

/** Consulta a Maritaca (API compatível com OpenAI). Lança erro em falha de rede/formato. */
async function chat(query: string, jsonMode: boolean): Promise<Response> {
  const baseUrl = (process.env.MARITACA_BASE_URL || 'https://chat.maritaca.ai/api').replace(/\/$/, '');
  return fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.MARITACA_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.MARITACA_MODEL || 'sabia-4',
      temperature: 0,
      max_tokens: 800,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Nome digitado: "${query.replace(/"/g, '')}"` },
      ],
    }),
    signal: AbortSignal.timeout(15_000),
  });
}

/** Consulta a Maritaca (API compatível com OpenAI). Lança erro em falha de rede/formato. */
export async function lookupWithMaritaca(query: string): Promise<PlayerProfile | null> {
  let response = await chat(query, true);
  // Se o modo JSON não for aceito pelo modelo, tenta de novo sem ele (o prompt já exige JSON).
  if (response.status === 400 || response.status === 422) response = await chat(query, false);
  if (!response.ok) {
    throw new Error(`Maritaca respondeu ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Maritaca devolveu resposta vazia');
  return parseProfile(extractJson(content));
}
