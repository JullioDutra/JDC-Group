/** Cria as tabelas no Neon: DATABASE_URL=... npm run db:migrate */
import { NeonStore } from '../src/lib/store/neon';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error('Defina DATABASE_URL.');
  process.exit(1);
}
new NeonStore(url).migrate().then(() => console.log('Tabelas criadas/atualizadas.'));
