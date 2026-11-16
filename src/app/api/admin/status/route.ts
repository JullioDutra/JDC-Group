import { NextResponse } from 'next/server';
import { hasMaritacaKey } from '@/lib/ai/maritaca';
import { secretMatches } from '@/lib/auth';
import { getStore, hasDatabase } from '@/lib/store';
import { evolutionConfig, evolutionConnectionState, evolutionWebhook } from '@/lib/whatsapp/evolution';

export const runtime = 'nodejs';

/**
 * Diagnóstico para a virada do número: banco, IA e Evolution (estado da
 * conexão e para onde o webhook da instância aponta). Nunca devolve segredos.
 * GET /api/admin/status   (Authorization: Bearer ADMIN_KEY)
 */
export async function GET(request: Request) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!secretMatches(bearer, process.env.ADMIN_KEY)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const report: Record<string, unknown> = {};

  if (!hasDatabase()) report.database = 'não configurado (estado em memória)';
  else {
    try {
      await getStore().isGroupActive('status-check');
      report.database = 'ok';
    } catch (error) {
      report.database = `erro: ${(error as Error).message.slice(0, 120)}`;
    }
  }

  report.ai = hasMaritacaKey()
    ? { provider: 'maritaca', model: process.env.MARITACA_MODEL || 'sabia-4' }
    : 'modo demo (MARITACA_API_KEY ausente)';

  const evo = evolutionConfig();
  report.owners = process.env.OWNER_NUMBERS ? 'restrito a OWNER_NUMBERS' : 'qualquer pessoa pode ativar grupos';
  if (process.env.WHATSAPP_PROVIDER === 'zapi') report.whatsapp = { provider: 'zapi' };
  else if (!evo.url || !evo.instance) report.whatsapp = { provider: 'evolution', configured: false };
  else {
    const whatsapp: Record<string, unknown> = { provider: 'evolution', instance: evo.instance };
    try {
      whatsapp.connection = await evolutionConnectionState();
      const hook = await evolutionWebhook();
      const host = new URL(request.url).host;
      whatsapp.webhook = hook?.url
        ? { enabled: hook.enabled, pointsToThisApp: hook.url.includes(host), events: hook.events }
        : 'nenhum webhook configurado na instância';
    } catch (error) {
      whatsapp.error = (error as Error).message.slice(0, 160);
    }
    report.whatsapp = whatsapp;
  }

  return NextResponse.json(report);
}
