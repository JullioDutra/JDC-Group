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
      const carga = (await store.getImportState('wikidata')) as
        | { part?: number; plan?: Array<{ label: string }>; cursor?: string; done?: boolean; errors?: number }
        | null;
      if (carga) {
        out.carga = { parte: carga.plan?.[carga.part ?? 0]?.label ?? null, cursor: carga.cursor, terminou: !!carga.done, errosSeguidos: carga.errors ?? 0 };
      }
    } catch {
      out.banco = 'erro';
    }
  }
  return NextResponse.json(out, { headers: { 'cache-control': 'no-store' } });
}
