import { formatNumber, normalize } from '../game/text';
import { POSITION_LABEL } from '../game/types';
import type { Store } from '../store/types';
import { queryKeys, queryTokens } from './keys';
import { mergeDuplicates, statOf } from './lookup';
import { rankCandidates } from './rank';
import { STAT_KEYS, type ManualEntry, type PlayerRecord, type StatKey } from './types';

/**
 * Dados à mão (frente F1): o admin confere um número (no Transfermarkt, por
 * exemplo) e corrige. O número manual vale mais que o do Wikidata e o da IA,
 * guarda a fonte e a data, e a carga do Wikidata nunca apaga.
 *
 * Comandos no grupo:
 *   ficha Rogério Ceni                 (qualquer pessoa)
 *   corrigir Rogério Ceni gols 131     (só admin)
 *   corrigir Neymar valor atual 60 fonte Transfermarkt
 *   corrigir Neymar gols apagar        (volta para o número automático)
 *   nome famoso Gabigol = Gabriel Barbosa   (só admin)
 */

/** Nome do dado no comando → chave. As mais longas primeiro ("gols selecao" antes de "gols"). */
export const STAT_WORDS: Array<[string, StatKey]> = [
  ['gols de falta', 'freeKickGoals'],
  ['gols em finais', 'finalGoals'],
  ['gols em final', 'finalGoals'],
  ['gols de penalti', 'penaltyGoals'],
  ['gols na selecao', 'intlGoals'],
  ['gols selecao', 'intlGoals'],
  ['jogos na selecao', 'intlCaps'],
  ['jogos selecao', 'intlCaps'],
  ['gols em copa', 'worldCupGoals'],
  ['gols copa', 'worldCupGoals'],
  ['gols na champions', 'uclGoals'],
  ['gols champions', 'uclGoals'],
  ['gols na libertadores', 'libertadoresGoals'],
  ['gols libertadores', 'libertadoresGoals'],
  ['gols no brasileirao', 'brasileiraoGoals'],
  ['gols brasileirao', 'brasileiraoGoals'],
  ['cartoes amarelos e vermelhos', 'careerCards'],
  ['cartoes', 'careerCards'],
  ['cartao', 'careerCards'],
  ['valor atual', 'marketValueEurM'],
  ['valor maximo', 'peakValueEurM'],
  ['maior valor', 'peakValueEurM'],
  ['pico', 'peakValueEurM'],
  ['valor', 'marketValueEurM'],
  ['assistencias', 'careerAssists'],
  ['assist', 'careerAssists'],
  ['gols', 'careerGoals'],
  ['jogos', 'careerApps'],
  ['titulos', 'titles'],
  ['copas', 'worldCupsPlayed'],
  ['altura', 'heightCm'],
  ['estreia', 'debutYear'],
];

export const STAT_LABEL: Record<StatKey, string> = {
  careerGoals: 'gols na carreira',
  careerAssists: 'assistências',
  peakValueEurM: 'maior valor (mi €)',
  intlCaps: 'jogos pela seleção',
  intlGoals: 'gols pela seleção',
  worldCupGoals: 'gols em Copas',
  uclGoals: 'gols na Champions',
  titles: 'títulos',
  careerApps: 'jogos na carreira',
  brasileiraoGoals: 'gols no Brasileirão',
  libertadoresGoals: 'gols na Libertadores',
  worldCupsPlayed: 'Copas disputadas',
  heightCm: 'altura (cm)',
  debutYear: 'ano de estreia',
  marketValueEurM: 'valor atual (mi €)',
  careerCards: 'cartões (amarelos + vermelhos)',
  freeKickGoals: 'gols de falta',
  finalGoals: 'gols em finais',
  penaltyGoals: 'gols de pênalti',
};

/** "180", "1.234", "60,5" → número. */
export function parseValue(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, '');
  if (!/^\d[\d.,]*$/.test(t)) return null;
  // "1.234" (milhar) vs "60,5" / "60.5" (decimal)
  const normalized = /^\d{1,3}(\.\d{3})+$/.test(t) ? t.replace(/\./g, '') : t.replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export interface CorrectionCommand {
  player: string;
  stat: StatKey;
  /** null = apagar a correção. */
  value: number | null;
  source: string;
}

/** "corrigir <jogador> <dado> <valor|apagar> [fonte X]" (texto já normalizado). */
export function parseCorrection(norm: string): CorrectionCommand | null {
  const m = norm.match(/^corrigir (.+)$/);
  if (!m) return null;
  let body = m[1];
  let source = 'Transfermarkt';
  const src = body.match(/^(.*) fonte (.+)$/);
  if (src) {
    body = src[1];
    source = src[2].trim().slice(0, 40);
  }
  const words = body.split(' ');
  const last = words.pop() ?? '';
  const value = last === 'apagar' ? null : parseValue(last);
  if (value === null && last !== 'apagar') return null;
  const rest = words.join(' ');
  for (const [word, stat] of STAT_WORDS) {
    if (rest.endsWith(` ${word}`)) {
      const player = rest.slice(0, -word.length - 1).trim();
      return player ? { player, stat, value, source } : null;
    }
  }
  return null;
}

/** "nome famoso <apelido> = <jogador>" */
export function parseFamousName(raw: string): { alias: string; player: string } | null {
  const m = raw.trim().match(/^nome famoso\s+(.+?)\s*=\s*(.+)$/i);
  if (!m) return null;
  const alias = m[1].trim().slice(0, 40);
  const player = m[2].trim();
  return alias && player ? { alias, player } : null;
}

/** Fichas para um nome digitado (ou id do Wikidata "Q123"), das mais prováveis para as menos. */
export async function findRecords(store: Store, query: string, limit = 3): Promise<PlayerRecord[]> {
  const q = query.trim();
  if (/^q\d+$/i.test(q) || q.startsWith('ai:')) {
    const r = await store.getPlayer(q.startsWith('ai:') ? q : q.toUpperCase());
    return r ? [r] : [];
  }
  const n = normalize(q);
  let candidates = await store.findPlayers(queryKeys(n), 80);
  const tokens = queryTokens(n);
  if (tokens.length > 1) candidates = [...candidates, ...(await store.findPlayers(tokens, 80))];
  const ranked = rankCandidates(candidates, n);
  const top = ranked.slice(0, limit).map((r) => r.record);
  if (top[0]) {
    try {
      top[0] = await mergeDuplicates(store, top[0], candidates);
    } catch (error) {
      console.error('juntar duplicadas falhou', error);
    }
  }
  return top.filter((r, i) => i === 0 || r.id !== top[0].id);
}

const brDate = (iso: string) => iso.split('-').reverse().join('/');

/** Ficha em texto para o grupo. */
export function formatCard(r: PlayerRecord): string {
  const lines = [`*${r.name}*${r.aliases.length ? ` (${r.aliases.slice(0, 3).join(', ')})` : ''}`];
  const meta = [
    r.birthDate ? `nasceu em ${brDate(r.birthDate)}` : '',
    r.nationality ?? '',
    r.positions.map((p) => POSITION_LABEL[p]).join('/'),
  ].filter(Boolean);
  if (meta.length) lines.push(meta.join(' · '));
  if (r.clubs.length) lines.push(`Clubes: ${r.clubs.slice(0, 10).join(', ')}${r.clubs.length > 10 ? '…' : ''}`);
  const nums: string[] = [];
  for (const k of STAT_KEYS) {
    const manual = r.manual?.stats?.[k];
    const value = k === 'heightCm' ? (manual?.value ?? r.heightCm ?? statOf(r, k)) : k === 'debutYear' ? (manual?.value ?? r.debutYear ?? statOf(r, k)) : statOf(r, k);
    if (value === null || value === undefined) continue;
    const tag = manual ? ` ✍️ ${manual.source}, ${brDate(manual.at)}` : '';
    nums.push(`• ${STAT_LABEL[k]}: ${formatNumber(value)}${tag}`);
  }
  if (nums.length) lines.push(nums.join('\n'));
  lines.push(`_id ${r.id.startsWith('ai:') ? 'pesquisado pela IA' : r.id}_`);
  return lines.join('\n');
}

export async function applyCorrection(store: Store, cmd: CorrectionCommand, today: string): Promise<string> {
  const [record, ...others] = await findRecords(store, cmd.player, 3);
  if (!record) return `Não achei "${cmd.player}" na base. Confira o nome (vale o nome completo ou o id Q do Wikidata).`;
  const entry: ManualEntry | null = cmd.value === null ? null : { value: cmd.value, source: cmd.source, at: today };
  await store.setManualStat(record.id, cmd.stat, entry);
  const homonyms = others.filter((o) => normalize(o.name) === normalize(record.name));
  const warn = homonyms.length
    ? `\nAtenção: há outro ${record.name} na base (${homonyms.map((h) => h.id).join(', ')}). Se era ele, mande o comando com o id: *corrigir ${homonyms[0].id} ...*`
    : '';
  if (!entry) return `✅ ${record.name}: ${STAT_LABEL[cmd.stat]} volta para o número automático.${warn}`;
  return `✅ ${record.name}: ${STAT_LABEL[cmd.stat]} = *${formatNumber(entry.value)}* (${entry.source}, ${brDate(today)}). Vale para todos os grupos.${warn}`;
}

export async function applyFamousName(store: Store, cmd: { alias: string; player: string }): Promise<string> {
  const [record] = await findRecords(store, cmd.player, 1);
  if (!record) return `Não achei "${cmd.player}" na base.`;
  await store.addManualAlias(record.id, cmd.alias);
  return `✅ "${cmd.alias}" agora vale como nome de *${record.name}* (${record.birthDate?.slice(0, 4) ?? 's/ data'}).`;
}

/**
 * Lote (CSV ou colado): uma linha por correção, "jogador; dado; valor; data; fonte".
 * Data e fonte são opcionais (padrão: hoje e Transfermarkt).
 */
export async function applyBatch(store: Store, textBlock: string, today: string): Promise<Array<{ line: string; result: string }>> {
  const out: Array<{ line: string; result: string }> = [];
  for (const raw of textBlock.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || /^jogador\s*[;,]/i.test(line)) continue;
    const parts = line.split(/[;\t]/).map((p) => p.trim());
    const [player, statWord, valueRaw, date, source] = parts;
    const stat = STAT_WORDS.find(([w]) => w === normalize(statWord ?? ''))?.[1] ?? (STAT_KEYS as string[]).find((k) => k === statWord) as StatKey | undefined;
    const value = valueRaw ? parseValue(valueRaw) : null;
    if (!player || !stat || value === null) {
      out.push({ line, result: 'linha inválida (use: jogador; dado; valor; data; fonte)' });
      continue;
    }
    const at = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : date && /^\d{2}\/\d{2}\/\d{4}$/.test(date) ? date.split('/').reverse().join('-') : today;
    const [record] = await findRecords(store, player, 1);
    if (!record) {
      out.push({ line, result: 'jogador não encontrado' });
      continue;
    }
    await store.setManualStat(record.id, stat, { value, source: source || 'Transfermarkt', at });
    out.push({ line, result: `ok: ${record.name} (${record.id}) ${STAT_LABEL[stat]} = ${value}` });
  }
  return out;
}
