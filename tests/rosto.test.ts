import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { Outgoing, RostoParty } from '../src/lib/game/types';
import { blurredFace, portraitCrop, setPhotoFetcher } from '../src/lib/images/facePhoto';
import { renderImage } from '../src/lib/images/render';
import { ROSTOS, getRosto, rostoCredit } from '../src/lib/party/content/rostos';
import { parsePartyStart } from '../src/lib/party/engine';
import { ROSTO_POINTS, ROSTO_TRIES, rostoHit } from '../src/lib/party/rosto';
import { MemoryStore } from '../src/lib/store/memory';
import { imageMime } from '../src/lib/whatsapp';
import { asText } from './helpers';

const LICENSE = /^(CC BY(-SA)? [0-9.]+( [a-z]+)?|CC0|Domínio público)$/;

test('Rosto Borrado: fotos com licença livre, crédito e rosto dentro da foto', () => {
  // Em andamento: as fotos entram depois da revisão (meta: 100 ou mais).
  assert.ok(ROSTOS.length >= 3, `só ${ROSTOS.length} fotos`);
  assert.equal(new Set(ROSTOS.map((r) => r.id)).size, ROSTOS.length, 'id repetido');
  for (const r of ROSTOS) {
    assert.match(r.url, /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//, r.id);
    assert.match(r.license, LICENSE, `${r.id}: licença ${r.license}`);
    assert.ok(r.author.trim(), `${r.id}: sem autor`);
    assert.ok(r.name.trim(), r.id);
    const [x, y, w, h] = r.face;
    assert.ok(x >= 0 && y >= 0 && w > 0.05 && h > 0.03 && x + w <= 1.001 && y + h <= 1.001, `${r.id}: rosto fora da foto`);
    assert.match(rostoCredit(r), /Wikimedia Commons \(rosto borrado pelo bot\)$/);
  }
});

test('Rosto Borrado: comandos e acerto pelo nome, apelido ou erro de digitação', () => {
  for (const cmd of ['abrir rosto borrado', 'jogar rosto borrado', 'abrir foto borrada', 'abrir fotos borradas', 'abrir cara borrada']) {
    assert.deepEqual(parsePartyStart(cmd), { game: 'rosto', rest: '' }, cmd);
  }
  assert.equal(parsePartyStart('rosto borrado'), null, 'sem "abrir" é conversa');
  const messi = getRosto('Q615')!;
  for (const guess of ['Messi', 'messi', 'Lionel Messi', 'Leo Messi', 'Messsi']) assert.ok(rostoHit(messi, guess), guess);
  for (const guess of ['Ronaldo', 'Neymar', 'Me']) assert.ok(!rostoHit(messi, guess), guess);
});

test('Rosto Borrado: recorte em retrato e borrão só no rosto', async () => {
  // Retrato 4:5 em volta do rosto, sem sair da foto.
  const crop = portraitCrop(960, 1440, { face: [0.3, 0.1, 0.35, 0.25] });
  assert.ok(crop.left >= 0 && crop.top >= 0 && crop.left + crop.width <= 960 && crop.top + crop.height <= 1440);
  assert.ok(Math.abs(crop.width / crop.height - 0.8) < 0.01);
  // Foto de teste: metade de cima branca, de baixo preta, com um "rosto" listrado no meio.
  const W = 600;
  const H = 800;
  const stripes = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#3a6"/>` +
      Array.from({ length: 7 }, (_, i) => `<rect x="${220 + i * 24}" y="160" width="12" height="180" fill="${i % 2 ? '#000' : '#fff'}"/>`).join('') +
      `</svg>`,
  );
  const src = await sharp(stripes).jpeg().toBuffer();
  const box = { face: [220 / W, 160 / H, 160 / W, 180 / H] as [number, number, number, number] };
  const clear = await blurredFace(src, box, 3, 320, 400);
  const blurred = await blurredFace(src, box, 0, 320, 400);
  assert.equal(imageMime(blurred).mimetype, 'image/jpeg');
  const meta = await sharp(blurred).metadata();
  assert.equal(meta.width, 320);
  assert.equal(meta.height, 400);
  // As listras do rosto somem (variação cai muito); o canto, longe do rosto, fica igual.
  const crop2 = portraitCrop(W, H, box);
  const fx = Math.round(((220 + 80 - crop2.left) / crop2.width) * 320);
  const fy = Math.round(((160 + 90 - crop2.top) / crop2.height) * 400);
  const region = async (img: Buffer, left: number, top: number) =>
    (await sharp(img).extract({ left, top, width: 30, height: 30 }).greyscale().stats()).channels[0].stdev;
  assert.ok((await region(blurred, fx - 15, fy - 15)) < (await region(clear, fx - 15, fy - 15)) / 2, 'o rosto foi borrado');
  const corner = async (img: Buffer) => (await sharp(img).extract({ left: 0, top: 370, width: 20, height: 20 }).stats()).channels[1].mean;
  assert.ok(Math.abs((await corner(blurred)) - (await corner(clear))) < 3, 'fora do rosto não muda');
});

test('Rosto Borrado: imagem em JPEG; sem foto, o cartão avisa', async () => {
  const fake = await sharp({ create: { width: 960, height: 1440, channels: 3, background: '#556677' } }).jpeg().toBuffer();
  setPhotoFetcher(async () => fake);
  const img = await renderImage({ kind: 'faceQuiz', photoId: ROSTOS[0].id, level: 0, round: 1, total: 8 });
  assert.equal(imageMime(img).mimetype, 'image/jpeg');
  setPhotoFetcher(async () => {
    throw new Error('sem rede');
  });
  const err = console.error;
  console.error = () => undefined;
  try {
    const offline = await renderImage({ kind: 'faceQuiz', photoId: ROSTOS[0].id, level: 1, round: 1, total: 8 });
    assert.equal(imageMime(offline).mimetype, 'image/jpeg');
  } finally {
    console.error = err;
    setPhotoFetcher(null);
  }
  // As outras imagens do jogo continuam em PNG.
  assert.equal(imageMime(await renderImage({ kind: 'modes' })).mimetype, 'image/png');
});

test('Rosto Borrado: partida (borrão diminui, pontos por etapa, revelação)', async () => {
  const G = 'rosto@g.us';
  const store = new MemoryStore();
  let id = 0;
  let clock = Date.parse('2026-11-21T12:00:00Z');
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date(clock) };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick(G, null, deps, true);
  const state = async () => (await store.getActiveMatch(G))!.state as RostoParty;

  await say('Ana', 'ativar jogos');
  const lobby = await say('Ana', 'abrir rosto borrado');
  assert.match(asText(lobby), /Rosto Borrado/);
  await say('Bia', 'entrar');
  const start = await say('Ana', 'começar');
  const first = start.find((o) => o.type === 'image' && o.image.kind === 'faceQuiz');
  assert.ok(first && first.type === 'image' && first.image.kind === 'faceQuiz' && first.image.level === 0);
  assert.match(first.caption ?? '', new RegExp(`Foto 1/${Math.min(8, ROSTOS.length)}.*Vale \\*100\\*`, 's'));
  assert.match(first.caption ?? '', /Wikimedia Commons/);

  let s = await state();
  const photo = getRosto(s.order[0])!;
  const other = ROSTOS.find((r) => r.id !== photo.id && !rostoHit(photo, r.name))!;
  // Erro: ❌. Conversa não gasta tentativa.
  assert.match(asText(await say('Bia', other.name)), /react:❌/);
  assert.equal(asText(await say('Bia', 'kkkkk')), '');
  // Prazo: borrão médio, agora vale 70.
  clock += 16_000;
  const mid = await tick();
  const midImg = mid.find((o) => o.type === 'image');
  assert.ok(midImg && midImg.type === 'image' && midImg.image.kind === 'faceQuiz' && midImg.image.level === 1);
  assert.match(midImg.caption ?? '', /Agora vale \*70\*/);
  // Acerto no médio: +70 e a foto limpa com o nome.
  const hit = await say('Ana', photo.name);
  assert.match(asText(hit), /acertou \(\+70\)/);
  const reveal = hit.find((o) => o.type === 'image' && o.image.kind === 'faceQuiz');
  assert.ok(reveal && reveal.type === 'image' && reveal.image.kind === 'faceQuiz' && reveal.image.level === 3);
  s = await state();
  assert.equal(s.players.find((p) => p.name === 'Ana')!.score, ROSTO_POINTS[1]);

  // Próxima foto (nos testes não há pausa entre rodadas): 3 tentativas por pessoa.
  assert.ok(hit.some((o) => o.type === 'image' && o.image.kind === 'faceQuiz' && o.image.round === 2 && o.image.level === 0));
  s = await state();
  const photo2 = getRosto(s.order[1])!;
  const wrong = ['Zico', 'Romário', 'Garrincha', 'Tostão', 'Falcão'].filter((n) => !rostoHit(photo2, n));
  for (let i = 0; i < ROSTO_TRIES; i++) await say('Bia', wrong[i]);
  assert.equal(asText(await say('Bia', photo2.name)), '', 'sem tentativa sobrando');
  // Ninguém acerta: três prazos e revela.
  for (const _ of [1, 2]) {
    clock += 16_000;
    await tick();
  }
  clock += 16_000;
  assert.match(asText(await tick()), new RegExp(`Ninguém acertou\\. Era \\*${photo2.name}\\*`));
});
