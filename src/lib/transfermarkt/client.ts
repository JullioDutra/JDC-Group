/**
 * Cliente do Transfermarkt (rodada 17, decisão do dono do bot em 26/11/2026).
 *
 * Regras de boa vizinhança, fixas no código:
 * - um pedido por vez, com intervalo mínimo (padrão 4 s) entre eles;
 * - User-Agent do bot, com o endereço do projeto (nada de se passar por navegador);
 * - respeita o robots.txt: caminho proibido não é pedido;
 * - 429/503: espera e tenta de novo poucas vezes; 403 ou bloqueio repetido: PARA
 *   (TmBlocked). Não há troca de IP, proxy ou disfarce para contornar bloqueio.
 * Usado só pelo script de atualização (scripts/tm-sync.ts), nunca no meio de
 * uma partida: o jogo lê a base gerada (dados.ts).
 */

export const TM_BASE = 'https://www.transfermarkt.com';
export const TM_USER_AGENT = 'DueloDeCraquesBot/1.0 (+https://duelo-de-craques-peach.vercel.app; atualização lenta de dados de jogadores)';

export type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

/** O site recusou (403) ou continua limitando: a atualização para aqui. */
export class TmBlocked extends Error {}
/** O robots.txt não permite este caminho: o dado fica de fora. */
export class TmDisallowed extends Error {}

/** Regras do robots.txt para o nosso agente (grupo do bot ou "*"). */
export function parseRobots(text: string, agent = 'duelodecraquesbot'): Array<{ allow: boolean; path: string }> {
  const groups: Array<{ agents: string[]; rules: Array<{ allow: boolean; path: string }> }> = [];
  let current: { agents: string[]; rules: Array<{ allow: boolean; path: string }> } | null = null;
  let lastWasAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (current && (key === 'allow' || key === 'disallow')) current.rules.push({ allow: key === 'allow', path: value });
    }
  }
  const mine = groups.filter((g) => g.agents.some((a) => a !== '*' && agent.includes(a)));
  const chosen = mine.length ? mine : groups.filter((g) => g.agents.includes('*'));
  return chosen.flatMap((g) => g.rules);
}

/** O caminho pode ser pedido? (vale a regra mais longa que casar; empate: allow). */
export function robotsAllows(rules: Array<{ allow: boolean; path: string }>, path: string): boolean {
  let best: { allow: boolean; len: number } | null = null;
  for (const r of rules) {
    if (!r.path) continue;
    const pattern = new RegExp('^' + r.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
    if (!pattern.test(path)) continue;
    const len = r.path.length;
    if (!best || len > best.len || (len === best.len && r.allow)) best = { allow: r.allow, len };
  }
  return best ? best.allow : true;
}

export interface TmClientOptions {
  fetcher?: Fetcher;
  /** Intervalo mínimo entre pedidos (ms). Nunca menos de 2 s. */
  intervalMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

export class TmClient {
  private fetcher: Fetcher;
  private interval: number;
  private sleep: (ms: number) => Promise<void>;
  private now: () => number;
  private last = 0;
  private rules: Array<{ allow: boolean; path: string }> | null = null;
  /** Pedidos feitos (para o relatório). */
  requests = 0;

  constructor(opts: TmClientOptions = {}) {
    this.fetcher = opts.fetcher ?? fetch;
    this.interval = Math.max(2_000, opts.intervalMs ?? 4_000);
    this.sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.now = opts.now ?? Date.now;
  }

  private async pace() {
    const wait = this.last + this.interval - this.now();
    if (wait > 0) await this.sleep(wait);
    this.last = this.now();
  }

  private async raw(url: string, accept: string): Promise<Response> {
    await this.pace();
    this.requests++;
    return this.fetcher(url, { headers: { 'user-agent': TM_USER_AGENT, accept, 'accept-language': 'en' }, redirect: 'follow', signal: AbortSignal.timeout(20_000) });
  }

  private async robots() {
    if (this.rules) return this.rules;
    const res = await this.raw(`${TM_BASE}/robots.txt`, 'text/plain');
    if (res.status === 403) throw new TmBlocked('o Transfermarkt recusou o acesso (403) já no robots.txt');
    this.rules = res.ok ? parseRobots(await res.text()) : [];
    return this.rules;
  }

  /** Pede uma página (texto). 404 = null. 429/503: espera e tenta 2 vezes; 403 ou insistência: TmBlocked. */
  async get(path: string, accept = 'text/html'): Promise<string | null> {
    if (!robotsAllows(await this.robots(), path)) throw new TmDisallowed(`robots.txt não permite ${path}`);
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await this.raw(`${TM_BASE}${path}`, accept);
      if (res.status === 404) return null;
      if (res.status === 403) throw new TmBlocked(`o Transfermarkt recusou o acesso (403) em ${path}`);
      if (res.status === 429 || res.status === 503) {
        const after = Number(res.headers.get('retry-after'));
        await this.sleep(Math.min(120, Number.isFinite(after) && after > 0 ? after : 30 * (attempt + 1)) * 1000);
        continue;
      }
      if (!res.ok) throw new Error(`Transfermarkt respondeu ${res.status} em ${path}`);
      return res.text();
    }
    throw new TmBlocked(`o Transfermarkt continua limitando (429/503) em ${path}`);
  }

  async json<T>(path: string): Promise<T | null> {
    const text = await this.get(path, 'application/json');
    if (text === null) return null;
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`resposta não é JSON em ${path}`);
    }
  }
}
