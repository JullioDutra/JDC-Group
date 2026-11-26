import { parseInfoboxNational } from './sources';

/**
 * Estatísticas da carreira pela Wikipédia em inglês (rodada 17): a tabela
 * "Appearances and goals by club, season and competition" (linha "Career
 * total", todas as competições) e a seleção principal da caixa de informação.
 * A data vem do aviso "{{updated|match played 21 November 2026}}".
 */
export interface WikiStats {
  clubApps: number;
  clubGoals: number;
  clubAssists?: number;
  intlCaps?: number;
  intlGoals?: number;
  /** Data do último jogo contado (AAAA-MM-DD), se a página disser. */
  asOf?: string;
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

/** "21 November 2026" / "November 21, 2026" → 2026-11-21. */
export function englishDate(text: string): string | null {
  const t = text.toLowerCase();
  let m = t.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (m && MONTHS.includes(m[2])) return `${m[3]}-${String(MONTHS.indexOf(m[2]) + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = t.match(/([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (m && MONTHS.includes(m[1])) return `${m[3]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  return null;
}

/** Tabela inteira a partir da posição da legenda ("|+ ..."), até o "|}" que a fecha. */
function tableAround(text: string, at: number): string | null {
  const start = text.lastIndexOf('{|', at);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length - 1; i++) {
    if (text.startsWith('{|', i)) {
      depth++;
      i++;
    } else if (text.startsWith('|}', i)) {
      depth--;
      i++;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** Números de uma linha da tabela (ignora "—", notas e atributos). */
function rowNumbers(row: string): number[] {
  const clean = row.replace(/\{\{efn[^}]*\}\}|<ref[^>]*\/>|<ref[^>]*>[\s\S]*?<\/ref>|\{\{sfn[^}]*\}\}/g, '').replace(/(colspan|rowspan|style|class|align)\s*=\s*"?[^|"!\n]*"?\s*\|/gi, '');
  const out: number[] = [];
  for (const cell of clean.split(/\|\||!!|\n[|!]/)) {
    const c = cell.replace(/^[\s|!]+/, '').replace(/'''?/g, '').trim();
    if (/^\d{1,3}(,\d{3})*$|^\d+$/.test(c)) out.push(Number(c.replace(/,/g, '')));
  }
  return out;
}

/** Títulos das colunas do grupo "Total" (Apps/Goals/Assists), pelo cabeçalho. */
function totalColumns(table: string): string[] {
  const lines = table.split('\n');
  const head1 = lines.find((l) => /!.*colspan\s*=\s*"?\d"?\s*\|\s*Total/i.test(l) || /^!.*\bTotal\b/i.test(l));
  const span = Number(head1?.match(/colspan\s*=\s*"?(\d)"?\s*\|\s*Total/i)?.[1] ?? 2);
  // Segunda linha de cabeçalho: "!Division!!Apps!!Goals..." (ou um "!" por linha).
  const idx = lines.findIndex((l) => /^!\s*(Division|League|Apps)/i.test(l) || /!!\s*Apps/i.test(l));
  let subs: string[] = [];
  if (idx >= 0) {
    if (lines[idx].includes('!!')) subs = lines[idx].replace(/^!/, '').split('!!').map((s) => s.trim());
    else for (let i = idx; i < lines.length && lines[i].startsWith('!'); i++) subs.push(lines[i].replace(/^!/, '').trim());
  }
  const named = subs.filter((s) => /^(apps|goals|assists)$/i.test(s.replace(/\[\[[^\]|]*\||\]\]|'''?/g, '')));
  return named.length >= span ? named.slice(-span).map((s) => s.toLowerCase()) : ['apps', 'goals'];
}

/** Total da carreira em clubes (todas as competições) e a seleção principal. */
export function parseWikiStats(wikitext: string): WikiStats | null {
  const caption = wikitext.search(/\|\+\s*Appearances and goals by club/i);
  if (caption < 0) return null;
  const table = tableAround(wikitext, caption);
  if (!table) return null;
  const rows = table.split(/\n\|-[^\n]*/);
  const total = rows.find((r) => /Career total/i.test(r));
  if (!total) return null;
  const nums = rowNumbers(total.slice(total.search(/Career total/i) + 'Career total'.length));
  const cols = totalColumns(table);
  if (nums.length < cols.length) return null;
  const last = nums.slice(-cols.length);
  const pick = (name: string) => (cols.includes(name) ? last[cols.indexOf(name)] : undefined);
  const apps = pick('apps');
  const goals = pick('goals');
  if (apps === undefined || goals === undefined || apps <= 0 || goals > apps * 3) return null;
  const out: WikiStats = { clubApps: apps, clubGoals: goals };
  const assists = pick('assists');
  if (assists !== undefined) out.clubAssists = assists;
  const national = parseInfoboxNational(wikitext);
  if (national) {
    out.intlCaps = national.caps;
    out.intlGoals = national.goals;
  }
  const before = wikitext.slice(Math.max(0, caption - 600), caption);
  const updated = before.match(/\{\{\s*updated\s*\|([^}]*)\}\}/i)?.[1] ?? before.match(/As of[^\n]*?(\d{1,2}\s+[A-Za-z]+\s+\d{4}|[A-Za-z]+\s+\d{1,2},\s+\d{4})/i)?.[1];
  const asOf = updated ? englishDate(updated) : null;
  if (asOf) out.asOf = asOf;
  return out;
}
