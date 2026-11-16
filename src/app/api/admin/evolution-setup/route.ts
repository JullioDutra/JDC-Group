import { NextResponse } from 'next/server';
import { secretMatches } from '@/lib/auth';
import { evolutionConfig, evolutionSetupInstance } from '@/lib/whatsapp/evolution';

export const runtime = 'nodejs';

/**
 * Virada do número: aponta o webhook da instância EVOLUTION_INSTANCE para este
 * app e liga a leitura de grupos. Só mexe nessa instância.
 *
 * POST /api/admin/evolution-setup
 * Authorization: Bearer ADMIN_KEY
 * { "confirmInstance": "<nome exato da instância>" }
 *
 * A confirmação evita apontar por engano a instância do bot pessoal.
 */
export async function POST(request: Request) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!secretMatches(bearer, process.env.ADMIN_KEY)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { instance, url } = evolutionConfig();
  if (!instance || !url) return NextResponse.json({ error: 'EVOLUTION_API_URL/EVOLUTION_INSTANCE não configurados' }, { status: 400 });
  if (!process.env.WEBHOOK_SECRET) return NextResponse.json({ error: 'WEBHOOK_SECRET não configurado' }, { status: 400 });

  const body = (await request.json().catch(() => null)) as { confirmInstance?: string } | null;
  if (body?.confirmInstance !== instance) {
    return NextResponse.json(
      { error: `Confirme mandando {"confirmInstance": "${instance}"} — é a instância que terá o webhook trocado.` },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  const webhookUrl = `${origin}/api/webhook?token=${encodeURIComponent(process.env.WEBHOOK_SECRET)}`;
  try {
    const { groupsIgnoreWasOn } = await evolutionSetupInstance(webhookUrl);
    return NextResponse.json({
      ok: true,
      instance,
      webhook: `${origin}/api/webhook?token=***`,
      events: ['MESSAGES_UPSERT'],
      groupsIgnore: groupsIgnoreWasOn ? 'estava ligado; desliguei para o jogo ler os grupos' : 'já estava desligado',
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message.slice(0, 300) }, { status: 502 });
  }
}
