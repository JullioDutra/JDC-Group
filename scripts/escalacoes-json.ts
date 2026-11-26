/** Escalações do Que Time em JSON (id → titulares), para o conferidor: npx tsx scripts/escalacoes-json.ts > escalacoes.json */
import { LINEUPS } from '../src/lib/party/content/lineups';
console.log(JSON.stringify(Object.fromEntries(LINEUPS.map((l) => [l.id, l.lines.flat()])), null, 1));
