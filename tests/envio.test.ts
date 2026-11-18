import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dispatch } from '../src/lib/dispatch';
import type { Outgoing } from '../src/lib/game/types';
import { imageAsText } from '../src/lib/images/fallback';
import type { WhatsAppProvider } from '../src/lib/whatsapp';

function fakeProvider(failImages: number) {
  const sent: string[] = [];
  let imageCalls = 0;
  let recovered = 0;
  const provider: WhatsAppProvider = {
    parseWebhook: () => null,
    async sendText(_g, text) {
      sent.push(`text:${text}`);
    },
    async sendImage(_g, _png, caption) {
      imageCalls++;
      if (imageCalls <= failImages) throw new Error('WhatsApp gateway 500: Connection Closed');
      sent.push(`image:${caption ?? ''}`);
    },
    async sendReaction() {},
    async recover() {
      recovered++;
      return true;
    },
  };
  return { provider, sent, stats: () => ({ imageCalls, recovered }) };
}

const lobby: Outgoing = {
  type: 'image',
  image: {
    kind: 'partyLobby',
    state: {
      kind: 'party', game: 'fato', status: 'LOBBY', host: { jid: 'a', name: 'Ana' }, players: [{ jid: 'a', name: 'Ana', score: 0, missed: 0, hits: 0, lastHitAt: 0 }],
      createdAt: 0, updatedAt: 0, deadline: null, timerToken: null, seq: 0, warned: [], category: null, round: -1, totalRounds: 10, order: [], answers: {}, arrival: [],
    },
  },
  caption: 'Sala aberta: Fato ou Fake',
};

test('imagem falha uma vez: a segunda tentativa resolve', async () => {
  const { provider, sent, stats } = fakeProvider(1);
  await dispatch(provider, 'g', [lobby, { type: 'text', text: 'depois' }], 'https://x', async () => undefined);
  assert.deepEqual(sent, ['image:Sala aberta: Fato ou Fake', 'text:depois']);
  assert.deepEqual(stats(), { imageCalls: 2, recovered: 0 });
});

test('imagem não sai: pede recuperação, manda em texto e o resto do envio continua', async () => {
  const { provider, sent, stats } = fakeProvider(99);
  await dispatch(provider, 'g', [lobby, { type: 'text', text: 'Rodada 1' }], 'https://x', async () => undefined);
  assert.equal(stats().recovered, 1);
  assert.match(sent[0], /^text:Sala aberta: Fato ou Fake\n\nJogadores \(1\): Ana$/);
  assert.equal(sent[1], 'text:Rodada 1', 'a próxima mensagem saiu mesmo com a imagem falhando');
});

test('plano B em texto: tabuleiro do Conexões numerado', () => {
  const text = imageAsText({
    kind: 'conexoesBoard',
    reveal: false,
    state: {
      kind: 'party', game: 'conexoes', status: 'PLAYING', host: { jid: 'a', name: 'Ana' }, players: [], createdAt: 0, updatedAt: 0,
      deadline: null, timerToken: null, seq: 0, warned: [], category: null, round: 0, totalRounds: 1, order: ['cx-selecao'],
      tiles: ['Gilmar', 'Feola', 'Pelé', 'Leônidas'], solved: [], errors: {}, tried: [], lastJid: null,
    },
  });
  assert.equal(text, '1. Gilmar\n2. Feola\n3. Pelé\n4. Leônidas');
});

test('ajuda: vira imagem (com texto de reserva) e renderiza', async () => {
  const { renderImage } = await import('../src/lib/images/render');
  const { handleMessage } = await import('../src/lib/game/engine');
  const { MemoryStore } = await import('../src/lib/store/memory');
  const { createLookup } = await import('../src/lib/ai');
  const store = new MemoryStore();
  const deps = { store, lookup: createLookup(store, async () => null) };
  await handleMessage({ id: '1', groupJid: 'g@g.us', senderJid: 'a@s', senderName: 'Ana', text: 'ativar jogos' }, deps);
  const out = await handleMessage({ id: '2', groupJid: 'g@g.us', senderJid: 'a@s', senderName: 'Ana', text: 'ajuda' }, deps);
  assert.equal(out[0].type, 'image');
  assert.ok((await renderImage({ kind: 'help' })).length > 10_000);
  assert.match(imageAsText({ kind: 'help' }) ?? '', /abrir fato ou fake/);
});
