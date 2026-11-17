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
      out.jogadoresNaBase = await getStore().countPlayers();
      out.banco = 'ok';
    } catch {
      out.banco = 'erro';
    }
  }
  return NextResponse.json(out, { headers: { 'cache-control': 'no-store' } });
}
