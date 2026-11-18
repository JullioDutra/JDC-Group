import { NextResponse } from 'next/server';
import { secretMatches } from '@/lib/auth';
import { STAT_WORDS, applyBatch, applyCorrection, applyFamousName, findRecords, formatCard } from '@/lib/players/admin';
import type { StatKey } from '@/lib/players/types';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 60;

const authorized = (request: Request) =>
  secretMatches(request.headers.get('authorization')?.replace(/^Bearer /, ''), process.env.ADMIN_KEY);

/**
 * Dados à mão (Authorization: Bearer ADMIN_KEY).
 *
 * GET  /api/admin/players/manual?q=rogerio ceni   fichas (com fonte e data dos números manuais)
 * POST {"csv": "jogador; dado; valor; data; fonte\n..."}   lote
 * POST {"player": "Rogério Ceni", "stat": "gols", "value": 131, "source": "Transfermarkt"}   um número
 * POST {"player": "...", "stat": "gols", "value": null}   apaga a correção
 * POST {"alias": "Gabigol", "player": "Gabriel Barbosa"}   nome famoso aceito
 */
export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const q = new URL(request.url).searchParams.get('q') ?? '';
  if (!q.trim()) return NextResponse.json({ error: 'mande ?q=nome' }, { status: 400 });
  const records = await findRecords(getStore(), q, 5);
  return NextResponse.json({ records, text: records.map((r) => formatCard(r)) });
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    csv?: string;
    player?: string;
    stat?: string;
    value?: number | string | null;
    source?: string;
    alias?: string;
  };
  const store = getStore();
  const today = new Date().toISOString().slice(0, 10);
  if (typeof body.csv === 'string') {
    const results = await applyBatch(store, body.csv.slice(0, 200_000), today);
    return NextResponse.json({ ok: true, linhas: results.length, results });
  }
  if (body.alias && body.player) {
    return NextResponse.json({ ok: true, result: await applyFamousName(store, { alias: body.alias, player: body.player }) });
  }
  if (body.player && body.stat) {
    const word = body.stat.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const stat = (STAT_WORDS.find(([w]) => w === word)?.[1] ?? word) as StatKey;
    const value = body.value === null || body.value === undefined || body.value === '' ? null : Number(String(body.value).replace(',', '.'));
    if (value !== null && !(Number.isFinite(value) && value >= 0)) return NextResponse.json({ error: 'valor inválido' }, { status: 400 });
    const result = await applyCorrection(store, { player: body.player, stat, value, source: body.source || 'Transfermarkt' }, today);
    return NextResponse.json({ ok: true, result });
  }
  return NextResponse.json({ error: 'nada para fazer: mande csv, ou player+stat+value, ou alias+player' }, { status: 400 });
}
