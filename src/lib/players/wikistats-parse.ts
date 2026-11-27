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

/**
 * Tabela inteira a partir da posição da legenda ("|+ ..."), até o "|}" que a
 * fecha. Só vale "{|" e "|}" no começo da linha: dentro das células aparecem
 * coisas como "{{ref label|A|}}", que não fecham nada (Ricardo Carvalho).
 */
function tableAround(text: string, at: number): string | null {
  let start = text.lastIndexOf('{|', at);
  while (start > 0 && !/\n[ \t]*$/.test(text.slice(Math.max(0, start - 8), start))) start = text.lastIndexOf('{|', start - 1);
  if (start < 0) return null;
  let depth = 0;
  let pos = start;
  while (pos < text.length) {
    const end = text.indexOf('\n', pos);
    const line = text.slice(pos, end < 0 ? text.length : end).trimStart();
    if (line.startsWith('{|')) depth++;
    else if (line.startsWith('|}')) {
      depth--;
      if (depth === 0) return text.slice(start, (end < 0 ? text.length : end));
    }
    if (end < 0) break;
    pos = end + 1;
  }
  return null;
}

/** Cabeçalho da tabela: as linhas antes da primeira linha de dados ("|..."). */
function headerOf(table: string): string {
  const lines = table.split('\n');
  const first = lines.findIndex((l, i) => i > 0 && /^\|(?![-+}])/.test(l.trim()));
  return lines.slice(0, first < 0 ? lines.length : first).join('\n');
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

/** Primeira tabela logo abaixo de um título (antes do próximo título), se tiver jeito de tabela de temporadas. */
function tableUnder(wikitext: string, heading: number): number {
  const after = heading + 3;
  const start = wikitext.indexOf('{|', after);
  const nextHeading = wikitext.slice(after).search(/\n==/);
  if (start < 0 || (nextHeading >= 0 && start > after + nextHeading)) return -1;
  const head = headerOf(wikitext.slice(start, start + 4000));
  return /\bSeason\b/i.test(head) && /\bApps\b/i.test(head) && /\bTotal\b/i.test(head) ? start : -1;
}

/**
 * Onde está a tabela de clubes: pela legenda ("Appearances and goals by club,
 * season and competition" ou "Club appearances and goals by season...") ou,
 * sem legenda, a primeira tabela logo abaixo do título "Club" da seção
 * "Career statistics" (Ribéry, Puskás) ou do título "Club statistics" (páginas
 * de jogadores japoneses). Sem legenda, a tabela precisa ter Temporada, Apps e
 * o grupo Total no cabeçalho (tabela só da liga não conta a carreira inteira).
 */
function clubTableAt(wikitext: string): number | null {
  const caption = wikitext.search(/\|\+[^\n]*?\bappearances and goals by (club|season)\b/i);
  if (caption >= 0) return caption;
  const section = wikitext.search(/(?:^|\n)==\s*(Career statistics|Statistics|Player statistics)\s*==/i);
  if (section >= 0) {
    const sub = wikitext.slice(section).search(/\n===\s*Club( career| statistics)?\s*===/i);
    const at = sub >= 0 ? tableUnder(wikitext, section + sub + 1) : -1;
    if (at >= 0) return at;
  }
  const club = wikitext.search(/(?:^|\n)==\s*Club (career )?statistics\s*==/i);
  const at = club >= 0 ? tableUnder(wikitext, club + 1) : -1;
  return at >= 0 ? at : null;
}

/**
 * Linha do total da carreira: "Career total" (ou "Total career") ou, sem ela,
 * a última linha da tabela chamada só "Total" ocupando 3 colunas ou mais
 * (Clube + Temporada + Divisão: Giggs, Lineker), se o cabeçalho tiver o grupo
 * Total. O "Total" de 2 colunas é o de um clube só.
 */
function careerTotalRow(table: string, rows: string[]): string | null {
  const label = /\b(Career totals?|Total career)\b/i;
  const career = rows.find((r) => label.test(r));
  if (career) {
    const m = career.match(label)!;
    return career.slice(m.index! + m[0].length);
  }
  if (!/\bTotal\b/i.test(headerOf(table))) return null;
  const last = rows[rows.length - 1]?.trim() ?? '';
  const m = last.match(/^!\s*colspan\s*=\s*"?([3-9])"?\s*\|\s*'*Totals?'*\s*(?=\n|!!|\|\|)/i);
  return m ? last.slice(m[0].length) : null;
}

/** Total da carreira em clubes (todas as competições) e a seleção principal. */
export function parseWikiStats(raw: string): WikiStats | null {
  // Comentários escondidos ("<!--Serie A stats only-->") grudam nos números.
  const wikitext = raw.replace(/<!--[\s\S]*?-->/g, '');
  const caption = clubTableAt(wikitext);
  if (caption === null) return null;
  const table = tableAround(wikitext, caption);
  if (!table) return null;
  const rows = table.split(/\n\|-[^\n]*/);
  const total = careerTotalRow(table, rows);
  if (total === null) return null;
  const nums = rowNumbers(total);
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
  const updated =
    before.match(/\{\{\s*updated\s*\|([^}]*)\}\}/i)?.[1] ??
    before.match(/(?:As of|Updated (?:to|as of|on)?)[^\n]*?(\d{1,2}\s+[A-Za-z]+\s+\d{4}|[A-Za-z]+\s+\d{1,2},\s+\d{4})/i)?.[1];
  const asOf = updated ? englishDate(updated) : null;
  if (asOf) out.asOf = asOf;
  return out;
}
