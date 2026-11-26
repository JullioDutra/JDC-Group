import { NextResponse } from 'next/server';
import { secretMatches } from '@/lib/auth';
import { blurredFaces, forgetUpload, rostoSource } from '@/lib/images/facePhoto';
import { addRosto, deleteRosto, listAdminRostos, parseFaces, prepareUpload, updateRosto } from '@/lib/party/rosto-admin';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 60;

const authorized = (request: Request) =>
  secretMatches(request.headers.get('authorization')?.replace(/^Bearer /, ''), process.env.ADMIN_KEY);

const jpeg = (buf: Buffer) =>
  new NextResponse(new Uint8Array(buf), { headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, no-store' } });

/**
 * Fotos do Rosto Borrado (Authorization: Bearer ADMIN_KEY).
 *
 * GET  /api/admin/rostos                       todas as fotos (fixas e enviadas)
 * GET  /api/admin/rostos?id=up:...&img=1       a foto (JPEG)
 * GET  /api/admin/rostos?id=Q615&level=0       como o grupo vê (0 forte, 1 médio, 2 leve, 3 limpa)
 * POST {"action":"add","name":"Messi","aliases":"leo messi","credit":"...","faces":[[x,y,w,h]],"image":"data:image/jpeg;base64,..."}
 * POST {"action":"update","id":"...","faces":[...],"name":"..."}
 * POST {"action":"hide","id":"...","hidden":true}
 * POST {"action":"delete","id":"..."}          enviada: apaga; fixa: esconde
 * POST {"action":"preview","image":"...","faces":[...],"level":0}   prévia antes de salvar (JPEG)
 */
export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const id = params.get('id');
  const store = getStore();
  if (!id) return NextResponse.json({ photos: await listAdminRostos(store) });
  const photo = (await listAdminRostos(store)).find((r) => r.id === id);
  if (!photo) return NextResponse.json({ error: 'foto não encontrada' }, { status: 404 });
  const src = await rostoSource(id).catch(() => null);
  if (!src) return NextResponse.json({ error: 'não consegui baixar a foto' }, { status: 502 });
  if (params.get('img') === '1') return jpeg(src.jpg);
  const level = Math.max(0, Math.min(3, Number(params.get('level') ?? 0) || 0));
  return jpeg((await blurredFaces(src.jpg, photo.faces, level, 968, 900)).jpg);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown> & { action?: string; id?: string };
  const store = getStore();
  try {
    switch (body.action) {
      case 'add': {
        const photo = await addRosto(store, { name: body.name, aliases: body.aliases, credit: body.credit, faces: body.faces, image: body.image });
        return NextResponse.json({ ok: true, result: `✅ Foto de ${photo.name} entrou no Rosto Borrado.`, photo });
      }
      case 'update': {
        if (!body.id) throw new Error('falta o id');
        const photo = await updateRosto(store, body.id, { name: body.name, aliases: body.aliases, credit: body.credit, faces: body.faces });
        forgetUpload(body.id);
        return NextResponse.json({ ok: true, result: `✅ ${photo.name}: foto atualizada.`, photo });
      }
      case 'hide': {
        if (!body.id) throw new Error('falta o id');
        const photo = await updateRosto(store, body.id, { hidden: body.hidden === true });
        return NextResponse.json({ ok: true, result: photo.hidden ? `${photo.name}: foto escondida (não entra no sorteio).` : `${photo.name}: foto de volta no sorteio.`, photo });
      }
      case 'delete': {
        if (!body.id) throw new Error('falta o id');
        const result = await deleteRosto(store, body.id);
        forgetUpload(body.id);
        return NextResponse.json({ ok: true, result });
      }
      case 'preview': {
        const faces = parseFaces(body.faces) ?? [];
        const level = Math.max(0, Math.min(3, Number(body.level ?? 0) || 0));
        const src = body.image ? await prepareUpload(body.image) : body.id ? (await rostoSource(body.id))?.jpg : null;
        if (!src) throw new Error('mande a foto');
        return jpeg((await blurredFaces(src, faces, level, 968, 900)).jpg);
      }
      default:
        return NextResponse.json({ error: 'ação desconhecida (add, update, hide, delete, preview)' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'erro' }, { status: 400 });
  }
}
