import { parse } from 'node-html-parser';
import { isYouthOrReserve } from '../players/wikidata';

/**
 * Leitura das páginas do Transfermarkt. Tudo é conferido antes de virar dado:
 * se a página não tiver o formato esperado, o resultado é null (nada é
 * gravado) e o relatório da atualização mostra o jogador como "sem leitura".
 */

/** "1.234" → 1234; "3.456'" → 3456; "-" → 0. */
export function tmNumber(text: string): number | null {
  const t = text.trim();
  if (!t || t === '-' || t === '–') return 0;
  const digits = t.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}

export interface CareerTotals {
  apps: number;
  goals: number | null;
  assists: number | null;
  yellow: number | null;
  secondYellow: number | null;
  red: number | null;
  minutes: number | null;
}

/** Nome da coluna pelo título (o Transfermarkt usa ícones com title). */
function columnKey(title: string): keyof CareerTotals | null {
  const t = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Goleiro (gols sofridos, jogos sem sofrer gol), gol contra e gol de pênalti não são "gols".
  if (/conceded|gegentor|clean sheet|zu null|sofrid|sem sofrer|own goal|eigentor|gols? contra|penalt|elfmeter/.test(t)) return null;
  if (/appearance|einsatze|einsatz|^apps?$|^jogos$|partidas|^convoca/.test(t)) return 'apps';
  if (/second yellow|yellow-red|gelb-rot|gelbrot|segundo amarelo|amarelo-vermelho|amarelo vermelho/.test(t)) return 'secondYellow';
  if (/yellow|gelb|amarelo/.test(t)) return 'yellow';
  if (/red card|^red|rot|vermelho/.test(t)) return 'red';
  if (/assist|vorlage/.test(t)) return 'assists';
  if (/per goal|pro tor|por gol/.test(t)) return null;
  if (/minutes|minuten|minutos/.test(t)) return 'minutes';
  if (/^goals?$|goals scored|^tore$|^gols?$|gols marcados/.test(t)) return 'goals';
  return null;
}

/**
 * Totais da carreira na página de dados detalhados ("leistungsdatendetails"):
 * a linha de total no rodapé da tabela, casada com os títulos do cabeçalho.
 */
export function parseCareerTotals(html: string): CareerTotals | null {
  const root = parse(html);
  for (const table of root.querySelectorAll('table')) {
    const foot = table.querySelector('tfoot tr');
    const head = table.querySelector('thead tr');
    if (!foot || !head) continue;
    const titles = head.querySelectorAll('th').map((th) => (th.querySelector('[title]')?.getAttribute('title') ?? th.getAttribute('title') ?? th.text).trim());
    const cells = foot.querySelectorAll('td').map((td) => td.text.trim());
    // As colunas numéricas ficam à direita: alinha rodapé e cabeçalho pelo fim.
    const offset = titles.length - cells.length;
    const out: Partial<Record<keyof CareerTotals, number | null>> = {};
    cells.forEach((cell, i) => {
      const key = columnKey(titles[i + offset] ?? '');
      if (key && out[key] === undefined) out[key] = tmNumber(cell);
    });
    if (typeof out.apps === 'number' && out.apps > 0) {
      return { apps: out.apps, goals: out.goals ?? null, assists: out.assists ?? null, yellow: out.yellow ?? null, secondYellow: out.secondYellow ?? null, red: out.red ?? null, minutes: out.minutes ?? null };
    }
  }
  return null;
}

interface TransferJson {
  transfers?: Array<{ from?: { clubName?: string }; to?: { clubName?: string }; dateUnformatted?: string; date?: string; upcoming?: boolean }>;
}

const NOT_A_CLUB = /without club|vereinslos|retired|karriereende|career break|pause|unknown|unbekannt|^\?$/i;

/** Clubes profissionais pelo histórico de transferências (empréstimos contam; base e time B não). */
export function parseTransferClubs(json: TransferJson | null): string[] | null {
  const list = json?.transfers;
  if (!Array.isArray(list)) return null;
  const sorted = list.filter((t) => !t.upcoming).sort((a, b) => String(a.dateUnformatted ?? '').localeCompare(String(b.dateUnformatted ?? '')));
  const out: string[] = [];
  const add = (name: string | undefined) => {
    const n = name?.trim();
    if (!n || NOT_A_CLUB.test(n) || isYouthOrReserve(n) || out.includes(n)) return;
    out.push(n);
  };
  sorted.forEach((t, i) => {
    if (i === 0) add(t.from?.clubName);
    add(t.to?.clubName);
  });
  return out;
}

interface MarketJson {
  list?: Array<{ y?: number }>;
}

/** Valor de mercado atual (o último ponto) e o maior da carreira, em milhões de euros. */
export function parseMarketValue(json: MarketJson | null): { current: number; peak: number } | null {
  const values = (json?.list ?? []).map((p) => p.y).filter((y): y is number => typeof y === 'number' && y >= 0);
  if (!values.length) return null;
  const m = (v: number) => Math.round(v / 100_000) / 10;
  return { current: m(values[values.length - 1]), peak: m(Math.max(...values)) };
}
