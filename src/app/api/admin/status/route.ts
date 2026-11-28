import { NextResponse } from 'next/server';
import { publicOrigin } from '@/lib/scheduler';
import { hasMaritacaKey } from '@/lib/ai/maritaca';
import { secretMatches } from '@/lib/auth';
import { adminNumbers } from '@/lib/owners';
import { hasScheduler } from '@/lib/scheduler';
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

  report.scheduler = hasScheduler()
    ? { provider: 'qstash', signingKeys: Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY), publicUrl: process.env.PUBLIC_APP_URL ?? 'derivado da requisição' }
    : 'sem QStash: rodadas vencidas fecham na próxima mensagem';

  const evo = evolutionConfig();
  const admins = adminNumbers();
  report.admins = admins.length
    ? `${admins.length} número(s) de admin configurado(s)`
    : 'ATENÇÃO: ADMIN_NUMBERS vazio, ninguém consegue ativar jogoss';
  if (process.env.WHATSAPP_PROVIDER === 'zapi') report.whatsapp = { provider: 'zapi' };
  else if (!evo.url || !evo.instance) report.whatsapp = { provider: 'evolution', configured: false };
  else {
    const whatsapp: Record<string, unknown> = { provider: 'evolution', instance: evo.instance };
    try {
      whatsapp.connection = await evolutionConnectionState();
      const hook = await evolutionWebhook();
      const host = new URL(publicOrigin(request)).host;
      whatsapp.webhook = hook?.url
        ? { enabled: hook.enabled, pointsToThisApp: hook.url.includes(host), events: hook.events }
        : 'nenhum webhook configurado na instância';
    } catch (error) {
      whatsapp.error = (error as Error).message.slice(0, 160);
    }
    report.whatsapp = whatsapp;
  }

  if (hasDatabase()) {
    try {
      const store = getStore();
      report.players = {
        base: await store.countPlayers(),
        carga: await store.getImportState('wikidata'),
        buscas24h: await store.lookupSummary(24),
      };
    } catch (error) {
      report.players = `erro: ${(error as Error).message.slice(0, 120)}`;
    }
  }

  return NextResponse.json(report);
}
