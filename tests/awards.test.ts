import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleMessage } from '../src/lib/game/engine';
import type { IncomingMessage } from '../src/lib/game/types';
import { MemoryStore } from '../src/lib/store/memory';
import { evolution } from '../src/lib/whatsapp/evolution';
import { AWARD_CATEGORIES } from '../src/lib/awards/categories';
import { asText } from './helpers';

function setup() {
  const store = new MemoryStore();
  let seq = 0;
  const deps = { store, lookup: async () => null, canManageGroup: (id: string) => id === 'admin@s', now: () => new Date('2026-11-23T14:00:00Z') };
  const say = (text: string, extra: Partial<IncomingMessage> = {}) => handleMessage({
    id: `msg${++seq}`, groupJid: 'grupo@g.us', senderJid: 'pessoa@s', senderName: 'Pessoa', text, ...extra,
  }, deps);
  const admin = (text: string) => say(text, { senderJid: 'admin@s' });
  return { store, say, admin, deps };
}

test('desligado por padrão; só admin explícito ativa; jogos e grupos são independentes', async () => {
  const { store, say, admin, deps } = setup();
  assert.deepEqual(await say('indicar "Vai ganhar" "Mark"'), []);
  assert.match(asText(await say('ativar melhores do ano')), /Só o admin/);
  assert.equal(await store.isAwardsActive('grupo@g.us'), false);
  assert.match(asText(await handleMessage({ id: 'no-auth', groupJid: 'grupo@g.us', senderJid: 'x', senderName: 'X', text: 'ativar melhores do ano' }, { ...deps, canManageGroup: undefined })), /Só o admin/);
  await admin('ativar jogos');
  assert.equal(await store.isAwardsActive('grupo@g.us'), false);
  await admin('desativar jogos');
  await admin('Ativar melhores do ano');
  assert.equal(await store.isGroupActive('grupo@g.us'), false);
  assert.equal(await store.isAwardsActive('grupo@g.us'), true);
  assert.deepEqual(await say('indicar "Frase" "Autor"', { groupJid: 'outro@g.us' }), []);
  assert.match(asText(await say('indicar "Frase" "Autor"')), /registrada/);
});

test('aliases de admin funcionam e comandos privados não ativam', async () => {
  const { store, say } = setup();
  await say('ativar melhores do ano', { senderAliases: ['admin@s'], private: true });
  assert.equal(await store.isAwardsActive('grupo@g.us'), false);
  await say('ativar melhores do ano', { senderAliases: ['admin@s'] });
  assert.equal(await store.isAwardsActive('grupo@g.us'), true);
});

test('indicação manual preserva conteúdo e autoria; todas as 22 categorias; validação', async () => {
  const { store, say, admin } = setup();
  await admin('ativar melhores do ano');
  assert.equal(AWARD_CATEGORIES.length, 22);
  assert.match(asText(await say('indicar “O Santos vai ganhar!” “MarK”')), /A classificar/);
  let rows = await store.listNominations('grupo@g.us', 100, 0);
  assert.equal(rows[0].text, 'O Santos vai ganhar!');
  assert.equal(rows[0].author, 'MarK');
  assert.equal(rows[0].submittedBy, 'pessoa@s');
  assert.equal(rows[0].sourceMessageId, undefined);
  for (let n = 1; n <= 22; n++) assert.match(asText(await say(`indicar "Motivo ${n}" "Autor" categoria ${n}`)), /registrada/);
  for (const cmd of ['indicar "" "A"', 'indicar "x" " "', 'indicar "x"', 'indicar "x" "a" categoria 0', 'indicar "x" "a" categoria 23', 'indicar "x" "a" categoria 1.5', `indicar "${'x'.repeat(1001)}" "A"`, 'indicar mensagem']) {
    const result = asText(await say(cmd));
    assert.doesNotMatch(result, /registrada/);
    assert.ok(result.length);
  }
  rows = await store.listNominations('grupo@g.us', 100, 0);
  assert.equal(rows.length, 23);
});

test('resposta registra a mensagem e o autor originais, sem confundir quem indicou', async () => {
  const { store, say, admin } = setup();
  await admin('ativar melhores do ano');
  assert.match(asText(await say('indicar mensagem categoria 10', {
    quotedText: 'Minha frase original', quotedMessageId: 'original', quotedParticipant: 'autor@lid', quotedAuthorName: 'Autor',
  })), /registrada/);
  const [row] = await store.listNominations('grupo@g.us', 5, 0);
  assert.equal(row.author, 'Autor');
  assert.equal(row.authorJid, 'autor@lid');
  assert.equal(row.sourceMessageId, 'original');
  assert.equal(row.text, 'Minha frase original');
  assert.equal(row.submittedName, 'Pessoa');
  assert.equal(row.category, 10);
  assert.match(asText(await say('indicar mensagem', { quotedParticipant: 'autor@lid', quotedMessageId: 'media' })), /Não recebi/);
});

test('Evolution extrai texto e contexto de respostas, inclusive mensagens temporárias', () => {
  const original = { ephemeralMessage: { message: { extendedTextMessage: { text: 'Texto original' } } } };
  const payload = { event: 'messages.upsert', data: {
    key: { id: 'command', remoteJid: 'grupo@g.us', participant: 'pessoa@lid' }, pushName: 'Pessoa',
    message: { ephemeralMessage: { message: { extendedTextMessage: { text: 'indicar mensagem', contextInfo: {
      participant: 'autor@lid', stanzaId: 'original', quotedMessage: original, mentionedJid: ['outra@lid'],
    } } } } },
  } };
  const msg = evolution.parseWebhook(payload)!;
  assert.equal(msg.quotedText, 'Texto original');
  assert.equal(msg.quotedMessageId, 'original');
  assert.equal(msg.quotedParticipant, 'autor@lid');
  assert.equal(msg.senderJid, 'pessoa@lid');
  assert.deepEqual(msg.mentions, ['outra@lid']);
});

test('duplicatas e concorrência não repetem ou perdem indicações; isolamento por grupo', async () => {
  const { store, say, admin } = setup();
  await admin('ativar melhores do ano');
  const concurrent = await Promise.all(Array.from({ length: 12 }, (_, n) => say(`indicar "Frase ${n}" "Autor"`)));
  assert.equal(concurrent.filter(out => /registrada/.test(asText(out))).length, 12);
  assert.match(asText(await say('indicar "frase 0" "autor" categoria 10')), /já foi/);
  await say('indicar "Webhook 1" "Autor"', { id: 'same' });
  assert.match(asText(await say('indicar "Webhook 2" "Autor"', { id: 'same' })), /já foi/);
  const quote = { quotedText: 'Texto', quotedParticipant: 'autor@s', quotedMessageId: 'source' };
  await say('indicar mensagem', quote);
  assert.match(asText(await say('indicar mensagem categoria 10', { ...quote, senderJid: 'outra@s' })), /já foi/);
  assert.equal((await store.listNominations('grupo@g.us', 100, 0)).length, 14);
  await say('ativar melhores do ano', { senderJid: 'admin@s', groupJid: 'outro@g.us' });
  assert.match(asText(await say('indicar mensagem', { ...quote, groupJid: 'outro@g.us' })), /registrada/);
});

test('fechar e reabrir preserva histórico; classificação restrita ao admin e ao grupo', async () => {
  const { store, say, admin } = setup();
  await admin('ativar melhores do ano');
  await say('indicar "Frase" "Autor"');
  assert.match(asText(await say('desativar melhores do ano')), /Só o admin/);
  assert.match(asText(await say('classificar indicação 1 categoria 10')), /Só o admin/);
  await admin('desativar melhores do ano');
  assert.deepEqual(await say('indicar "Outra" "Autor"'), []);
  assert.match(asText(await say('indicações melhores do ano')), /coleta fechada[\s\S]*Frase/);
  assert.match(asText(await admin('classificar indicação 1 categoria 10')), /Pérola/);
  assert.match(asText(await say('classificar indicação 1 categoria 2', { senderJid: 'admin@s', groupJid: 'outro@g.us' })), /não encontrada/);
  await admin('ativar melhores do ano');
  assert.match(asText(await say('indicar "Frase" "Autor"')), /já foi/);
  assert.equal((await store.listNominations('grupo@g.us', 100, 0))[0].category, 10);
});

test('coleta encerrada entre validação e inserção não grava', async () => {
  const { store, say, admin } = setup();
  await admin('ativar melhores do ano');
  const add = store.addNomination.bind(store);
  store.addNomination = async (input) => { await store.setAwardsActive(input.groupJid, false, 'admin@s'); return add(input); };
  assert.match(asText(await say('indicar "Texto" "Autor"')), /não foi registrada/);
  assert.equal((await store.listNominations('grupo@g.us', 10, 0)).length, 0);
});

test('consulta paginada e ajuda exclusiva, sem imagens novas ou alteração na partida', async () => {
  const { store, say, admin } = setup();
  await admin('ativar jogos');
  await say('iniciar jogo');
  const before = await store.getActiveMatch('grupo@g.us');
  await admin('ativar melhores do ano');
  for (let n = 1; n <= 6; n++) await say(`indicar "Frase ${n}" "Autor"`);
  const page1 = asText(await say('indicações melhores do ano'));
  assert.match(page1, /página 1/);
  assert.match(page1, /melhores do ano 2/);
  assert.doesNotMatch(page1, /Frase 6/);
  assert.match(asText(await say('indicações melhores do ano 2')), /Frase 6/);
  assert.match(asText(await say('indicações melhores do ano 0')), /Informe/);
  assert.match(asText(await say('indicações melhores do ano 3')), /Nenhuma/);
  assert.match(asText(await say('ajuda melhores do ano')), /22\. Lá Ele/);
  assert.doesNotMatch(asText(await say('ajuda texto')), /melhores do ano/i);
  assert.deepEqual(await say('ajuda'), [{ type: 'image', image: { kind: 'help' }, caption: 'Mande o comando do jogo. Dúvida sobre um jogo? Abra a sala e mande *regras*.' }]);
  assert.deepEqual(await store.getActiveMatch('grupo@g.us'), before);
  assert.deepEqual(await store.getRanking('grupo@g.us', 100), []);
});
