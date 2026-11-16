import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage } from '../src/lib/game/engine';
import { MODES, metricValue, parseModeChoice } from '../src/lib/game/modes';
import { looksLikePlayerName } from '../src/lib/game/text';
import type { Outgoing, PlayerProfile } from '../src/lib/game/types';
import { MemoryStore } from '../src/lib/store/memory';
import { evolution } from '../src/lib/whatsapp/evolution';

const G = 'grupo@g.us';
const asText = (out: Outgoing[]) => out.map((o) => (o.type === 'text' ? o.text : `[img:${o.image.kind}] ${o.caption ?? ''}`)).join('\n');

function setup(opts: { owners?: string[]; store?: MemoryStore } = {}) {
  const store = opts.store ?? new MemoryStore();
  let id = 0;
  const lookup = createLookup(store, lookupDemo);
  const canManageGroup = opts.owners ? (jid: string) => opts.owners!.includes(jid) : undefined;
  const say = (who: string, text: string) =>
    handleMessage(
      { id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text },
      { store, lookup, rng: () => 0, canManageGroup, now: () => new Date('2026-11-16T12:00:00Z') },
    );
  return { store, say };
}

async function startMatch(say: (w: string, t: string) => Promise<Outgoing[]>, choice: string) {
  await say('Ana', 'ativar grupo');
  await say('Ana', 'iniciar jogo');
  await say('Bia', 'aceitar');
  return say('Ana', choice);
}

test('17 temas com números únicos e sequenciais', () => {
  assert.equal(MODES.length, 17);
  assert.deepEqual(MODES.map((m) => m.number), MODES.map((_, i) => i + 1));
  assert.equal(new Set(MODES.map((m) => m.id)).size, MODES.length);
});

test('escolha de tema com extras', () => {
  const r = () => 0;
  assert.deepEqual(parseModeChoice('3 cego', r)?.twists, { blind: true, fast: false });
  assert.equal(parseModeChoice('12 as cegas relampago', r)?.mode.id, 'rodados');
  assert.deepEqual(parseModeChoice('12 as cegas relampago', r)?.twists, { blind: true, fast: true });
  assert.equal(parseModeChoice('raiz', r)?.mode.number, 17);
  assert.equal(parseModeChoice('cego', r), undefined);
  assert.equal(parseModeChoice('99', r), undefined);
});

test('modo cego esconde números até o fim e revela no apito final', async () => {
  const { say } = setup();
  const kickoff = asText(await startMatch(say, '1 cego relampago'));
  assert.match(kickoff, /às cegas.*relâmpago 45s/);
  const pick = asText(await say('Ana', 'ceni'));
  assert.match(pick, /escalado! O número fica em segredo/);
  assert.doesNotMatch(pick, /131/);
  const round = asText(await say('Bia', 'neuer'));
  assert.match(round, /Placar escondido/);
  assert.doesNotMatch(round, /📊/);
  for (const [who, name] of [['Bia', 'Marcelo'], ['Ana', 'Sergio Ramos'], ['Ana', 'Koeman'], ['Bia', 'Roberto Carlos'], ['Bia', 'Kaká'], ['Ana', 'Zico'], ['Ana', 'Lampard'], ['Bia', 'Iniesta'], ['Bia', 'Pelé']]) {
    await say(who, name);
  }
  const end = asText(await say('Ana', 'cristiano ronaldo'));
  assert.match(end, /📊 Ana \*2\.291\* x \*1\.258\* Bia[\s\S]*Ana\* venceu/);
});

test('temas novos usam os campos novos (Rodados conta clubes)', async () => {
  const { say } = setup();
  await startMatch(say, '12');
  assert.match(asText(await say('Ana', 'Rogério Ceni')), /2 clubes/);
});

test('mensagens simultâneas: a segunda é reprocessada, não perdida', async () => {
  const { say } = setup();
  await startMatch(say, '1');
  // Ana escolhe e, ao mesmo tempo, Bia tenta escolher fora da vez: só a de Ana vale,
  // e nenhuma das duas se perde por conflito de gravação.
  const [a, b] = await Promise.all([say('Ana', 'ceni'), say('Ana', 'neuer')]);
  const all = asText([...a, ...b]);
  assert.match(all, /Rogério Ceni|Manuel Neuer/);
  assert.match(all, /Bia\*, mande o nome do seu goleiro/);
});

test('só o admin ativa/desativa grupo', async () => {
  const { say } = setup({ owners: ['Ana@s'] });
  assert.deepEqual(await say('Zé', 'ativar grupo'), []);
  assert.deepEqual(await say('Zé', 'iniciar jogo'), [], 'grupo continua desligado');
  assert.match(asText(await say('Ana', 'ativar grupo')), /ativado/);
  assert.match(asText(await say("Zé", "desativar grupo")), /Só um admin/);
  assert.match(asText(await say('Zé', 'iniciar jogo')), /img:challenge/, 'qualquer um joga');
});

test('valores implausíveis viram "sem dado confiável"', () => {
  const base = { exists: true, name: 'X', positions: ['ATA'], nationality: null, birthDate: null, clubs: ['A', 'B'] } as unknown as PlayerProfile;
  const now = new Date('2026-11-16T00:00:00Z');
  assert.equal(metricValue({ ...base, careerGoals: 5000 }, 'careerGoals', now), null);
  assert.equal(metricValue({ ...base, careerGoals: 800 }, 'careerGoals', now), 800);
  assert.equal(metricValue({ ...base, heightCm: 260 }, 'heightCm', now), null);
  assert.equal(metricValue({ ...base, debutYear: 2030 }, 'debutYear', now), null);
  assert.equal(metricValue(base, 'clubsCount', now), 2);
});

test('nomes com números curtos valem; frases com números não', () => {
  assert.equal(looksLikePlayerName('CR7'), true);
  assert.equal(looksLikePlayerName('R9'), true);
  assert.equal(looksLikePlayerName('10'), false);
  assert.equal(looksLikePlayerName('Messi 900 gols'), false);
});

test('Evolution: filtra instância, lê data.participant, mensagem temporária e prefere telefone ao @lid', () => {
  process.env.EVOLUTION_INSTANCE = 'jogos';
  const msg = (over: Record<string, unknown>, data: Record<string, unknown> = {}) => ({
    event: 'messages.upsert',
    instance: 'jogos',
    ...over,
    data: { key: { remoteJid: '123@g.us', fromMe: false, id: 'X1' }, pushName: 'Ana', message: { conversation: 'aceitar' }, ...data },
  });
  assert.equal(evolution.parseWebhook(msg({ instance: 'bot-pessoal' }, { participant: '5511@s.whatsapp.net' })), null);
  assert.equal(evolution.parseWebhook(msg({}, { participant: '5511@s.whatsapp.net' }))?.senderJid, '5511@s.whatsapp.net');
  const lid = evolution.parseWebhook(msg({}, {
    key: { remoteJid: '123@g.us', fromMe: false, id: 'X2', participant: '999@lid', participantAlt: '5511:3@s.whatsapp.net' },
  }));
  assert.equal(lid?.senderJid, '5511@s.whatsapp.net');
  const eph = evolution.parseWebhook(msg({}, {
    participant: '5511@s.whatsapp.net',
    message: { ephemeralMessage: { message: { extendedTextMessage: { text: 'iniciar jogo' } } } },
  }));
  assert.equal(eph?.text, 'iniciar jogo');
  assert.equal(evolution.parseWebhook({ ...msg({}, { participant: '5511@s.whatsapp.net' }), event: 'MESSAGES_UPSERT' })?.text, 'aceitar');
  assert.equal(evolution.parseWebhook(msg({}, { key: { remoteJid: '5511@s.whatsapp.net', fromMe: false, id: 'X3' } })), null, 'privado é ignorado');
  delete process.env.EVOLUTION_INSTANCE;
});

test('"iniciar aleatório" sorteia o tema assim que alguém aceita', async () => {
  const { say } = setup();
  await say('Ana', 'ativar grupo');
  assert.match(asText(await say('Ana', 'Iniciar jogo aleatório')), /tema surpresa/);
  const accepted = asText(await say('Bia', 'aceitar'));
  assert.match(accepted, /img:kickoff[\s\S]*🎲 Tema sorteado: \*Artilheiros\*[\s\S]*Rodada 1\/6 · GOLEIRO/);
});

test('"aleatório" no menu também avisa que o tema foi sorteado', async () => {
  const { say } = setup();
  assert.match(asText(await startMatch(say, 'aleatorio cego')), /🎲 Tema sorteado: \*Artilheiros\* \(às cegas/);
});

test('ordem estrita: três nomes seguidos do mesmo jogador contam uma vez só', async () => {
  const { say } = setup();
  await startMatch(say, '1');
  assert.match(asText(await say('Ana', 'ceni')), /Rogério Ceni[\s\S]*Bia/);
  assert.match(asText(await say('Ana', 'Sergio Ramos')), /Segura, \*Ana\*/);
  assert.deepEqual(await say('Ana', 'Koeman'), []);
  // A rodada dos defensores só abre depois que Bia escolhe o goleiro.
  assert.match(asText(await say('Bia', 'neuer')), /Rodada 2\/6 · DEFENSOR/);
});

test('em produção, sem ADMIN_NUMBERS ninguém ativa; com ele, só o admin', async () => {
  const { ownerCheck } = await import('../src/lib/owners');
  delete process.env.ADMIN_NUMBERS;
  delete process.env.OWNER_NUMBERS;
  assert.equal(ownerCheck()('5511999998888@s.whatsapp.net'), false);
  process.env.ADMIN_NUMBERS = '55 11 99999-8888';
  assert.equal(ownerCheck()('5511999998888@s.whatsapp.net'), true);
  assert.equal(ownerCheck()('5511000000000@s.whatsapp.net'), false);
  delete process.env.ADMIN_NUMBERS;
});
