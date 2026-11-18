import { NextResponse } from 'next/server';
import { getStore, hasDatabase } from '@/lib/store';
import { evolutionConfig, evolutionConnectionState } from '@/lib/whatsapp/evolution';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Saúde pública do bot, sem nenhum dado sensível: o WhatsApp do jogo está
 * conectado? O banco responde? GET /api/health
 */
export async function GET() {
  const out: Record<string, unknown> = { at: new Date().toISOString() };
  const evo = evolutionConfig();
  if (evo.url && evo.instance) {
    try {
      out.whatsapp = await evolutionConnectionState();
    } catch (error) {
      out.whatsapp = `erro: ${(error as Error).message.replace(/https?:\/\/\S+/g, '[url]').slice(0, 80)}`;
    }
  } else {
    out.whatsapp = 'não configurado';
  }
  if (hasDatabase()) {
    try {
      const store = getStore();
      out.jogadoresNaBase = await store.countPlayers();
      out.banco = 'ok';
      // Só contagens: como as buscas de jogador terminaram nas últimas 24 h.
      out.buscas24h = await store.lookupSummary(24);
      // Só contagens de partidas (nenhum grupo ou pessoa identificado).
      out.partidas = await store.matchStats();
      const carga = (await store.getImportState('wikidata')) as
        | {
            part?: number; plan?: Array<{ label: string }>; cursor?: string; done?: boolean; errors?: number;
            stopped?: boolean; callsToday?: number; callsDay?: string; nextAt?: string; chainError?: string; leaseUntil?: number;
          }
        | null;
      if (carga) {
        const today = new Date().toISOString().slice(0, 10);
        out.carga = {
          parte: carga.plan?.[carga.part ?? 0]?.label ?? null,
          cursor: carga.cursor,
          terminou: !!carga.done,
          parada: !!carga.stopped,
          errosSeguidos: carga.errors ?? 0,
          lotesHoje: carga.callsDay === today ? (carga.callsToday ?? 0) : 0,
          proximoLote: carga.nextAt ?? null,
          problemaNaCadeia: carga.chainError ? carga.chainError.replace(/https?:\/\/\S+/g, '[url]').slice(0, 80) : null,
        };
      }
    } catch {
      out.banco = 'erro';
    }
  }
  return NextResponse.json(out, { headers: { 'cache-control': 'no-store' } });
}
