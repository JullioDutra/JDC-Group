import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage } from '../src/lib/game/engine';
import type { Outgoing, RostoParty } from '../src/lib/game/types';
import { renderImage } from '../src/lib/images/render';
import { applyClubCorrection, applyCorrection, applyPositionCorrection, cardView } from '../src/lib/players/admin';
import type { PlayerRecord } from '../src/lib/players/types';
import { setWikiStats } from '../src/lib/players/wikistats';
import { ROSTOS, rostoPool } from '../src/lib/party/content/rostos';
import { addRosto, cleanAliases, deleteRosto, listAdminRostos, parseFaces, prepareUpload, updateRosto } from '../src/lib/party/rosto-admin';
import { getStore } from '../src/lib/store';
import { MemoryStore } from '../src/lib/store/memory';
import { imageMime } from '../src/lib/whatsapp';
import { asText } from './helpers';

/**
 * Pedidos do admin (26/11/2026): "uma página web para eu corrigir um valor
 * quando precisar, com pesquisa por nome" e "colocar e excluir fotos do
 * Rosto Borrado".
 */

const photoB64 = async (w = 900, h = 600) =>
  `data:image/jpeg;base64,${(await sharp({ create: { width: w, height: h, channels: 3, background: '#3a6' } }).jpeg().toBuffer()).toString('base64')}`;

test('Página de jogadores: cada número com a fonte que vale hoje', async () => {
  const store = new MemoryStore();
  const r: PlayerRecord = {
    id: 'Q1249859', name: 'Rogério Ceni', aliases: [], positions: ['GOL'], nationality: 'Brasil', birthDate: '1973-01-22', heightCm: 188,
    clubs: ['São Paulo'], debutYear: 1990, sitelinks: 48, stats: { titles: 18 }, source: 'wikidata',
  };
  await store.upsertPlayers([r]);
  setWikiStats([{ qid: 'Q1249859', title: 'Rogério Ceni', read: '2026-11-26', clubApps: 1197, clubGoals: 131, intlCaps: 17, intlGoals: 0, asOf: '2015-12-06' }]);
  try {
    await applyCorrection(store, { player: 'Q1249859', stat: 'careerAssists', value: 9, source: 'Transfermarkt' }, '2026-11-26');
    const v = cardView((await store.getPlayer('Q1249859'))!);
    const f = (stat: string) => v.fields.find((x) => x.stat === stat)!;
    assert.deepEqual([f('careerGoals').value, f('careerGoals').origin, f('careerGoals').source], [131, 'wikipedia', 'Wikipédia · até 06/12/2015']);
    assert.deepEqual([f('careerAssists').value, f('careerAssists').origin, f('careerAssists').source], [9, 'admin', 'Transfermarkt · 26/11/2026']);
    assert.deepEqual([f('titles').value, f('titles').origin], [18, 'base']);
    assert.deepEqual([f('uclGoals').value, f('uclGoals').origin], [null, 'nenhuma']);
    assert.equal(v.fields.length, 19, 'todos os dados aparecem, até os vazios (para preencher)');
    assert.deepEqual(v.positions, ['goleiro']);
  } finally {
    setWikiStats(null);
  }
  // Clube e posição que faltam, pelo id (o que a página manda).
  assert.match(await applyClubCorrection(store, { player: 'Q1249859', club: 'Sinop', source: 'admin' }, '2026-11-26'), /Não conheço o clube|confirmada/);
  assert.match(await applyPositionCorrection(store, { player: 'Q1249859', position: 'ATA', source: 'admin' }, '2026-11-26'), /atacante/);
  assert.deepEqual((await store.getPlayer('Q1249859'))!.positions, ['GOL', 'ATA']);
  assert.match(await applyPositionCorrection(store, { player: 'Q1249859', position: 'GOL', source: 'admin' }, '2026-11-26'), /já joga/);
});

test('Rosto Borrado: rostos marcados à mão e foto preparada (sem metadados, até 1280 px)', async () => {
  assert.deepEqual(parseFaces([[0.1, 0.2, 0.1, 0.15]]), [[0.1, 0.2, 0.1, 0.15]]);
  assert.deepEqual(parseFaces([[0.95, 0.9, 0.2, 0.2]]), [[0.95, 0.9, 0.05, 0.1]], 'caixa que passa da borda é cortada');
  assert.equal(parseFaces([[0.1, 0.1, 0.001, 0.1]]), null, 'caixa minúscula');
  assert.equal(parseFaces('x'), null);
  assert.equal(parseFaces(Array.from({ length: 31 }, () => [0.1, 0.1, 0.1, 0.1])), null);
  assert.deepEqual(cleanAliases('Leo Messi, lionel messi; LEO MESSI, x'), ['Leo Messi', 'lionel messi']);
  const big = await prepareUpload(await photoB64(3000, 2000));
  const meta = await sharp(big).metadata();
  assert.deepEqual([meta.format, meta.width, meta.height, meta.exif], ['jpeg', 1280, 853, undefined]);
  await assert.rejects(prepareUpload(await photoB64(150, 150)), /pequena/);
  await assert.rejects(prepareUpload('data:image/jpeg;base64,AAAA'), /não consegui abrir/);
});

test('Rosto Borrado: enviar, esconder, remarcar e excluir pela página', async () => {
  const store = new MemoryStore();
  assert.equal((await rostoPool(store)).length, ROSTOS.length, 'sem nada no banco: as fixas');
  const up = await addRosto(store, { name: 'Endrick', aliases: 'Endrick Felipe', credit: 'Foto do grupo', faces: [[0.4, 0.1, 0.1, 0.15]], image: await photoB64() });
  assert.match(up.id, /^up:[0-9a-f]{12}$/);
  await assert.rejects(addRosto(store, { name: 'Endrick', faces: [], image: await photoB64() }), /marque pelo menos um rosto/);
  await assert.rejects(addRosto(store, { name: 'E', faces: [[0.1, 0.1, 0.1, 0.1]], image: await photoB64() }), /nome/);

  let pool = await rostoPool(store);
  assert.equal(pool.length, ROSTOS.length + 1);
  const mine = pool.find((p) => p.id === up.id)!;
  assert.deepEqual([mine.name, mine.aliases, mine.upload, mine.credit], ['Endrick', ['Endrick Felipe'], true, 'Foto do grupo']);

  // Foto fixa: esconder e remarcar os rostos (a foto continua a do Commons).
  const fixed = ROSTOS[0];
  await updateRosto(store, fixed.id, { hidden: true });
  pool = await rostoPool(store);
  assert.ok(!pool.some((p) => p.id === fixed.id), 'escondida sai do sorteio');
  await updateRosto(store, fixed.id, { hidden: false, faces: [[0.3, 0.1, 0.2, 0.2]] });
  pool = await rostoPool(store);
  assert.deepEqual(pool.find((p) => p.id === fixed.id)!.faces, [[0.3, 0.1, 0.2, 0.2]]);
  assert.equal(pool.find((p) => p.id === fixed.id)!.author, fixed.author, 'crédito do Commons continua');

  // Excluir: a enviada some; a fixa só fica escondida.
  assert.match(await deleteRosto(store, fixed.id), /escondida/);
  assert.ok((await listAdminRostos(store)).find((p) => p.id === fixed.id)!.hidden);
  assert.match(await deleteRosto(store, up.id), /excluída/);
  assert.ok(!(await listAdminRostos(store)).some((p) => p.id === up.id));
  assert.equal(await store.getRostoJpg(up.id), null);
});

test('Rosto Borrado: a foto enviada entra na partida, com crédito e imagem do banco', async () => {
  const store = getStore(); // a imagem lê a foto do mesmo banco do jogo
  const up = await addRosto(store, { name: 'Estêvão', aliases: 'Estevão Willian', credit: 'Fulano', faces: [[0.4, 0.1, 0.12, 0.18]], image: await photoB64() });
  for (const r of ROSTOS) await updateRosto(store, r.id, { hidden: true }); // só a enviada no sorteio
  try {
    const G = 'rosto-admin@g.us';
    let id = 0;
    const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date('2026-11-26T12:00:00Z') };
    const say = (who: string, text: string): Promise<Outgoing[]> => handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps);
    await say('Ana', 'ativar jogos');
    await say('Ana', 'abrir rosto borrado');
    await say('Bia', 'entrar');
    const start = await say('Ana', 'começar');
    const first = start.find((o) => o.type === 'image' && o.image.kind === 'faceQuiz');
    assert.ok(first && first.type === 'image' && first.image.kind === 'faceQuiz');
    assert.equal(first.image.photoId, up.id);
    assert.match(first.caption ?? '', /Foto: Fulano \(rosto borrado pelo bot\)/);
    const s = (await store.getActiveMatch(G))!.state as RostoParty;
    assert.equal(s.photos?.[0].name, 'Estêvão', 'a partida guarda a foto sorteada');
    const img = await renderImage(first.image);
    assert.equal(imageMime(img).mimetype, 'image/jpeg');
    assert.ok(img.length > 20_000, 'a foto do banco foi desenhada no cartão');
    const hit = await say('Bia', 'Estevão Willian');
    assert.match(asText(hit), /acertou \(\+100\).*Estêvão/s);
  } finally {
    for (const r of ROSTOS) await store.deleteRostoPhoto(r.id);
    await store.deleteRostoPhoto(up.id);
  }
});
