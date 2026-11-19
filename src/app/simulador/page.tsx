import type { Metadata } from 'next';
import { loadBrasileirao } from '@/lib/sim/data';
import BrasileiraoSimulator from './BrasileiraoSimulator';

/** A página é refeita no máximo a cada hora, com a tabela mais nova da fonte. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Simulador do Brasileirão 2026 · quem cai?',
  description: 'Marque os resultados das últimas rodadas e veja a tabela final e a chance de cada time cair, ir para o G4 ou ser campeão.',
};

export default async function Page() {
  return <BrasileiraoSimulator data={await loadBrasileirao()} />;
}
