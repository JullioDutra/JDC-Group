import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { Outgoing, RostoParty } from '../src/lib/game/types';
import { blurredFaces, setPhotoFetcher, type Face } from '../src/lib/images/facePhoto';
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
    assert.ok(r.faces.length >= 1, `${r.id}: sem rosto`);
    for (const [x, y, w, h] of r.faces) assert.ok(x >= -0.01 && y >= -0.01 && w > 0.005 && h > 0.005 && x + w <= 1.01 && y + h <= 1.01, `${r.id}: rosto fora da foto`);
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

test('Rosto Borrado: foto inteira, todos os rostos borrados e o resto nítido', async () => {
  // Foto de teste em paisagem com dois "rostos" listrados.
  const W = 900;
  const H = 600;
  const stripes = (x0: number) =>
    Array.from({ length: 6 }, (_, i) => `<rect x="${x0 + i * 20}" y="150" width="10" height="140" fill="${i % 2 ? '#000' : '#fff'}"/>`).join('');
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#3a6"/>${stripes(150)}${stripes(600)}</svg>`);
  const src = await sharp(svg).jpeg().toBuffer();
  const faces: Face[] = [[150 / W, 150 / H, 120 / W, 140 / H], [600 / W, 150 / H, 120 / W, 140 / H]];
  const clear = await blurredFaces(src, faces, 3, 600, 600);
  const blurred = await blurredFaces(src, faces, 0, 600, 600);
  // Cabe sem cortar: paisagem 3:2 vira 600 x 400.
  assert.deepEqual([blurred.width, blurred.height], [600, 400]);
  assert.equal(imageMime(blurred.jpg).mimetype, 'image/jpeg');
  const s = 600 / W;
  const region = async (img: Buffer, cx: number, cy: number) =>
    (await sharp(img).extract({ left: Math.round(cx * s) - 15, top: Math.round(cy * s) - 15, width: 30, height: 30 }).greyscale().stats()).channels[0].stdev;
  for (const cx of [210, 660]) {
    assert.ok((await region(blurred.jpg, cx, 220)) < (await region(clear.jpg, cx, 220)) / 2, `rosto em x=${cx} borrado`);
  }
  const corner = async (img: Buffer) => (await sharp(img).extract({ left: 0, top: 370, width: 20, height: 20 }).stats()).channels[1].mean;
  assert.ok(Math.abs((await corner(blurred.jpg)) - (await corner(clear.jpg))) < 3, 'fora dos rostos não muda');
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
