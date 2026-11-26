/**
 * Inventário do conteúdo por jogo (rodada 15): total, por assunto e quantos
 * itens citam 2025 ou 2026. Toda rodada de conteúdo começa por aqui (plano,
 * seção 32.5). Uso: npm run inventario
 */
import { CARDS } from '../src/lib/party/content/cards';
import { CHUTE_QUESTIONS } from '../src/lib/party/content/chute';
import { CONEXOES } from '../src/lib/party/content/conexoes';
import { FACTS } from '../src/lib/party/content/fato';
import { ANAGRAMS } from '../src/lib/party/content/anagramas';
import { IMPOSTOR_SECRETS } from '../src/lib/party/content/impostor';
import { INTRUSO_SETS } from '../src/lib/party/content/intruso';
import { LINEUPS } from '../src/lib/party/content/lineups';
import { TIMELINE } from '../src/lib/party/content/linha';
import { SURVIVOR_LISTS } from '../src/lib/party/content/sobrevivente';
import { STOP_CATEGORIES } from '../src/lib/party/content/stop';
import { TOP100_LISTS } from '../src/lib/party/content/top100';
import { WHOIS } from '../src/lib/party/content/whois';
import { TOP10_LISTS } from '../src/lib/party/top10-lists';

const recent = (x: unknown) => /202[56]/.test(JSON.stringify(x));
const games: Array<[string, readonly object[]]> = [
  ['Quem é', WHOIS], ['Emoji', CARDS.emoji], ['Quiz Relâmpago', CARDS.relampago], ['Fato ou Fake', FACTS], ['Chute Certo', CHUTE_QUESTIONS],
  ['Linha do Tempo', TIMELINE], ['Intruso', INTRUSO_SETS], ['Conexões', CONEXOES], ['Sobrevivente', SURVIVOR_LISTS], ['Top 10', TOP10_LISTS],
  ['Top 100', TOP100_LISTS], ['Anagrama', ANAGRAMS], ['Impostor', IMPOSTOR_SECRETS], ['Que Time', LINEUPS],
];
const rows = games.map(([name, items]) => {
  const by: Record<string, number> = {};
  for (const i of items) {
    const cat = (i as { category?: string }).category ?? 'futebol';
    by[cat] = (by[cat] ?? 0) + 1;
  }
  return { name, total: items.length, recent: items.filter(recent).length, by };
});
console.log('| Jogo | Total | 2025/26 | Por assunto |\n|---|---|---|---|');
for (const r of rows.sort((a, b) => a.total - b.total)) {
  console.log(`| ${r.name} | ${r.total} | ${r.recent} | ${Object.entries(r.by).map(([k, v]) => `${k} ${v}`).join(', ')} |`);
}
console.log(`\nStop: ${STOP_CATEGORIES.length} categorias.`);
console.log('Os três mais magros (comece por eles):', rows.slice(0, 3).map((r) => r.name).join(', '));
