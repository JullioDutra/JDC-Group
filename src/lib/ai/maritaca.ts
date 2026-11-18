import type { PlayerProfile, Position } from '../game/types';

const SYSTEM_PROMPT = `Você é o banco de dados de um jogo de conhecimentos de futebol.
Recebe um nome digitado por um jogador (pode ter erro de digitação, apelido ou só o sobrenome) e devolve a ficha do futebolista profissional (masculino ou feminino, de qualquer época) mais provável.

Responda SOMENTE com um objeto JSON, sem texto fora dele, neste formato:
{
  "exists": true,
  "name": "nome pelo qual é mais conhecido no Brasil",
  "fullName": "nome completo de registro",
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
- Vale o nome pelo qual o jogador é conhecido (ex.: Ronaldinho, Hulk), o nome completo ou partes coerentes dele (o sobrenome, como "Sule" para Niklas Süle; nome + sobrenome). Pode ser jogador pouco conhecido ou de outra época.
- NÃO corrija erro de digitação e NÃO interprete apelido informal (ex.: "R9", "Fenômeno", "CR7", "Ronaldiho"): nesses casos responda {"exists": false}.
- Responda {"exists": false} também quando não houver futebolista profissional com esse nome (pessoa inventada, de outro esporte, técnico que nunca jogou, palavra aleatória).
- Nunca troque por um jogador de nome diferente só porque é mais famoso.
- positions: 1 ou 2 grupos em que o jogador realmente atuou. Zagueiros e laterais = DEF; volantes, meias e alas = MEI; pontas, segundos atacantes e centroavantes = ATA.
- careerGoals / careerAssists: jogos oficiais na carreira profissional, clubes + seleção principal.
- peakValueEurM: maior valor de mercado da carreira, em milhões de euros (referência Transfermarkt).
- intlCaps / intlGoals: jogos e gols pela seleção principal.
- worldCupGoals: gols em Copas do Mundo. uclGoals: gols na Champions League / Copa dos Campeões da Europa (sem fases preliminares).
- titles: títulos oficiais como profissional (clubes + seleção principal).
- careerApps: jogos oficiais na carreira profissional (clubes + seleção principal).
- brasileiraoGoals: gols na Série A do Campeonato Brasileiro (0 se nunca jogou nela). libertadoresGoals: gols na Copa Libertadores.
- worldCupsPlayed: quantas Copas do Mundo disputou entrando em campo. debutYear: ano da estreia como profissional.
- Use números inteiros (peakValueEurM pode ter decimal). Para os números, dê o valor real ou a melhor estimativa que você conseguir; use null só se não tiver nenhuma noção. Zero só quando o valor real for zero.`;

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
    fullName: typeof r.fullName === 'string' && r.fullName.trim() ? r.fullName.trim().slice(0, 80) : undefined,
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

type ChatMessage = { role: 'system' | 'user'; content: string };

class RetryableError extends Error {}

/**
 * Uma conversa com a Maritaca (API compatível com OpenAI), pedindo JSON.
 * Se o modelo principal demorar (15 s) ou der erro 5xx, tenta uma vez no
 * modelo rápido (MARITACA_FAST_MODEL, padrão sabiazinho-4, 10 s). Em 17-18/11
 * foram 6 estouros de tempo e um 502 que deixaram jogada sem resposta.
 */
async function complete(messages: ChatMessage[], opts: { maxTokens: number; temperature: number }): Promise<string> {
  const baseUrl = (process.env.MARITACA_BASE_URL || 'https://chat.maritaca.ai/api').replace(/\/$/, '');
  const once = async (model: string, timeoutMs: number): Promise<string> => {
    const call = (json: boolean) =>
      fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.MARITACA_API_KEY}` },
        body: JSON.stringify({
          model,
          temperature: opts.temperature,
          max_tokens: opts.maxTokens,
          ...(json ? { response_format: { type: 'json_object' } } : {}),
          messages,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    let response: Response;
    try {
      response = await call(true);
      // Se o modo JSON não for aceito pelo modelo, tenta sem ele (o prompt já exige JSON).
      if (response.status === 400 || response.status === 422) response = await call(false);
    } catch (error) {
      throw new RetryableError(`Maritaca não respondeu: ${(error as Error).name}`);
    }
    if (response.status >= 500 || response.status === 429) throw new RetryableError(`Maritaca respondeu ${response.status}`);
    if (!response.ok) throw new Error(`Maritaca respondeu ${response.status}: ${(await response.text()).slice(0, 200)}`);
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new RetryableError('Maritaca devolveu resposta vazia');
    return content;
  };
  const main = process.env.MARITACA_MODEL || 'sabia-4';
  const fast = process.env.MARITACA_FAST_MODEL || 'sabiazinho-4';
  try {
    return await once(main, 15_000);
  } catch (error) {
    if (!(error instanceof RetryableError) || fast === main) throw error;
    console.error(`IA principal falhou (${error.message}); tentando o modelo rápido`);
    return once(fast, 10_000);
  }
}

/** Chamada genérica que pede JSON (juiz, dado focado). Devolve o texto da resposta. */
export async function maritacaJson(system: string, user: string, maxTokens = 400): Promise<string> {
  return complete(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { maxTokens, temperature: 0.2 },
  );
}

function userMessage(query: string, hint?: string): string {
  const name = `Nome digitado: "${query.replace(/"/g, '')}"`;
  if (!hint) return name;
  return (
    `${name}\nContexto da jogada: o jogador procurado é ${hint.replace(/"/g, '')}.\n` +
    'Se mais de um futebolista tiver esse nome ou apelido, devolva o que se encaixa no contexto ' +
    '(ex.: "Victor" + goleiro do Atlético-MG = Victor Bagy). Se nenhum se encaixar, devolva o mais conhecido.'
  );
}

/** Consulta a Maritaca. Lança erro em falha de rede/formato. */
export async function lookupWithMaritaca(query: string, hint?: string): Promise<PlayerProfile | null> {
  const content = await complete(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage(query, hint) },
    ],
    { maxTokens: 800, temperature: 0 },
  );
  return parseProfile(extractJson(content));
}
