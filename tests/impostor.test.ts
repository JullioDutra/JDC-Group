import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { ImpostorParty, Outgoing } from '../src/lib/game/types';
import { IMPOSTOR_FUTEBOL, IMPOSTOR_GERAL, IMPOSTOR_SECRETS, IMPOSTOR_THEMES, IMPOSTOR_TUDO, findImpostorTheme, getImpostorSecret, impostorPool, themeLabel } from '../src/lib/party/content/impostor';
import { ANAGRAMS } from '../src/lib/party/content/anagramas';
import { IMPOSTOR_POINTS, givesAway } from '../src/lib/party/impostor';
import { parsePartyStart } from '../src/lib/party/engine';
import { MemoryStore } from '../src/lib/store/memory';
import { evolution } from '../src/lib/whatsapp/evolution';
import { asText } from './helpers';

const lcg = (seed: number) => () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const PEOPLE = ['Ana', 'Bia', 'Caio', 'Duda', 'Edu'];

/** Mesa de N pessoas (Ana é a anfitriã), já com a partida começada. */
async function table(n = 4, seed = 7, theme = '') {
  const store = new MemoryStore();
  const G = `imp${seed}${n}@g.us`;
  let id = 0;
  const deps = { store, lookup: createLookup(store, async () => null), now: () => new Date('2026-11-19T12:00:00Z'), rng: lcg(seed) };
  const all: Outgoing[] = [];
  const say = async (who: string, text: string) => {
    const out = await handleMessage({ id: `i${++id}`, groupJid: G, senderJid: `${who}@s.whatsapp.net`, senderName: who, text }, deps);
    all.push(...out);
    return out;
  };
  const tick = async () => {
    const out = await handleTick(G, null, deps, true);
    all.push(...out);
    return out;
  };
  const state = async () => (await store.getActiveMatch(G))?.state as ImpostorParty | undefined;
  await say('Ana', 'ativar jogos');
  await say('Ana', `abrir impostor${theme ? ` ${theme}` : ''}`);
  for (const p of PEOPLE.slice(1, n)) await say(p, 'entrar');
  const start = await say('Ana', 'começar');
  const s = (await state())!;
  const name = (jid: string) => jid.split('@')[0];
  return { store, G, say, tick, state, start, all, s, name, deps };
}

/** O que foi para o grupo (sem as mensagens do privado). */
const groupText = (out: Outgoing[]) => asText(out.filter((o) => o.type !== 'dm'));

test('Impostor: segredos só de nomes conhecidos, temas e palavras proibidas', () => {
  assert.ok(IMPOSTOR_SECRETS.length >= 150, `${IMPOSTOR_SECRETS.length} segredos`);
  assert.equal(new Set(IMPOSTOR_SECRETS.map((s) => s.id)).size, IMPOSTOR_SECRETS.length, 'ids únicos');
  assert.ok(IMPOSTOR_SECRETS.every((s) => s.forbidden.length > 0));
  assert.equal(findImpostorTheme('clubes'), 'clube brasileiro');
  assert.equal(findImpostorTheme('craques do mundo'), 'craque do mundo');
  assert.equal(findImpostorTheme('planetas'), undefined);
  const ronaldinho = IMPOSTOR_SECRETS.find((s) => s.name === 'Ronaldinho')!;
  assert.ok(givesAway(ronaldinho.id, 'Ronaldinho'));
  assert.ok(givesAway(ronaldinho.id, 'ronaldinhoo'));
  assert.ok(!givesAway(ronaldinho.id, 'drible'));
  const real = IMPOSTOR_SECRETS.find((s) => s.name === 'Real Madrid')!;
  assert.ok(givesAway(real.id, 'Madrid') && givesAway(real.id, 'real'));
  assert.deepEqual(parsePartyStart('abrir impostor'), { game: 'impostor', rest: '' });
  assert.deepEqual(parsePartyStart('abrir impostor clubes rapido'), { game: 'impostor', rest: 'clubes rapido' });
});

test('Impostor: cartas no privado, segredo nunca no grupo, dicas validadas, votação e palpite errado = vitória do grupo', async () => {
  const t = await table(4, 7, 'craques');
  const secret = getImpostorSecret(t.s.secretId)!;
  assert.equal(secret.theme, 'craque brasileiro');
  // Cartas: 4 no privado; o impostor recebe só o tema.
  const dms = t.start.filter((o) => o.type === 'dm');
  assert.equal(dms.length, 4);
  for (const d of dms) {
    if (d.type !== 'dm') continue;
    if (d.to === t.s.impostor) assert.match(d.text, /você é o \*IMPOSTOR\*[\s\S]*Tema: \*craque brasileiro\*/);
    else assert.match(d.text, new RegExp(`o segredo é \\*${secret.name}\\*`));
    if (d.to === t.s.impostor) assert.doesNotMatch(d.text, new RegExp(secret.name));
  }
  assert.notEqual(t.s.order[0], t.s.impostor, 'o impostor não abre a 1ª volta');
  assert.match(groupText(t.start), /Impostor\* valendo! 4 jogadores[\s\S]*Ordem da mesa[\s\S]*\[timer:16s\]/);

  // Pedir a carta de novo: reação + privado, nada no grupo.
  const again = await t.say('Bia', 'carta');
  assert.deepEqual(again.map((o) => o.type), ['react', 'dm']);

  // Cartas -> 1ª vez.
  assert.match(asText(await t.tick()), /Vez de \*\w+\* \(volta 1\/2 · 1\/4\)/);
  const first = t.name(t.s.order[0]);
  const second = t.name(t.s.order[1]);
  assert.deepEqual(await t.say(second, 'chute'), [], 'fora da vez: ignorado');
  assert.match(asText(await t.say(first, 'drible e gol')), /Só \*1 palavra\*/);
  assert.match(asText(await t.say(first, secret.name.split(' ')[0])), /entrega o segredo/);
  assert.match(asText(await t.say(first, 'velocidade')), /\[react:✅\][\s\S]*Vez de \*/);
  assert.match(asText(await t.say(second, 'Velocidade')), /já foi dita/);

  // Resto das 2 voltas: cada um uma palavra diferente; o último da volta 2 deixa o tempo acabar.
  let word = 0;
  for (let guard = 0; guard < 20; guard++) {
    const s = (await t.state())!;
    if (s.phase !== 'clues') break;
    if (s.lap === 1 && s.turn === s.order.length - 1) {
      assert.match(asText(await t.tick()), /não deu dica[\s\S]*Fim da volta 2|não deu dica[\s\S]*Debate/);
      break;
    }
    await t.say(t.name(s.order[s.turn]), `palavra${++word}`);
  }
  const debate = (await t.state())!;
  assert.equal(debate.phase, 'debate');
  assert.ok(debate.clues.some((c) => c.word === null), 'quem não deu dica fica com "—"');

  // Debate: só o anfitrião abre a votação antes.
  assert.deepEqual(await t.say('Bia', 'votar'), []);
  const vote = asText(await t.say('Ana', 'votar'));
  assert.match(vote, /Votação!\*[\s\S]*1 a 4[\s\S]*1\. \w+ — /);
  const ballot = (await t.state())!.ballot;
  const impostorNo = ballot.indexOf(t.s.impostor) + 1;
  const innocents = ballot.filter((j) => j !== t.s.impostor);

  // Votos: não vale em si mesmo; os inocentes votam no impostor; o impostor vota em alguém.
  const imp = t.name(t.s.impostor);
  assert.match(asText(await t.say(imp, String(impostorNo))), /não vale votar em si mesmo/);
  await t.say(imp, String(ballot.indexOf(innocents[0]) + 1));
  await t.say(t.name(innocents[0]), String(impostorNo));
  await t.say(t.name(innocents[1]), String(ballot.indexOf(innocents[2]) + 1)); // erra
  const caught = asText(await t.say(t.name(innocents[2]), String(impostorNo)));
  assert.match(caught, new RegExp(`Pegaram o impostor: \\*${imp}\\* \\(2 votos\\)[\\s\\S]*20s`));

  // Antes do fim, o segredo nunca apareceu no grupo.
  assert.doesNotMatch(groupText(t.all), new RegExp(secret.name, 'i'));

  // Palpite errado: vitória do grupo; +2 para quem votou certo, +1 para quem errou.
  const end = asText(await t.say(imp, 'Pelé Errado'));
  assert.match(end, /\[img:textBoard\][\s\S]*não é o segredo[\s\S]*Vitória do grupo[\s\S]*O segredo era \*/);
  const ranking = await t.store.getRanking(t.G, 10);
  assert.equal(ranking.find((r) => r.name === imp)?.losses, 1);
  assert.equal(ranking.filter((r) => r.wins === 1).length, 3, 'os 3 inocentes vencem');
  assert.match(end, new RegExp(`\\+${IMPOSTOR_POINTS.rightVote} [\\s\\S]*\\+${IMPOSTOR_POINTS.team} ${t.name(innocents[1])}`));
  assert.equal(await t.store.getActiveMatch(t.G), null);
});

/** Passa as 2 voltas (todo mundo dá uma palavra) e abre a votação pelo anfitrião. */
async function toVoting(t: Awaited<ReturnType<typeof table>>) {
  await t.tick();
  let word = 0;
  for (let guard = 0; guard < 20; guard++) {
    const s = (await t.state())!;
    if (s.phase !== 'clues') break;
    await t.say(t.name(s.order[s.turn]), `dica${++word}`);
  }
  await t.say('Ana', 'votar');
  return (await t.state())!.ballot;
}

test('Impostor: empate vai para o 2º turno; empate de novo = impostor escapa (+5)', async () => {
  const t = await table(4, 11);
  const ballot = await toVoting(t);
  const innocents = ballot.filter((j) => j !== t.s.impostor);
  const [x, y, z] = innocents;
  const no = (jid: string) => String(ballot.indexOf(jid) + 1);
  // 2 x 2 entre dois inocentes (x e y).
  await t.say(t.name(t.s.impostor), no(y));
  await t.say(t.name(x), no(y));
  await t.say(t.name(y), no(x));
  const runoff = asText(await t.say(t.name(z), no(x)));
  assert.match(runoff, /Empate!\* 2º turno[\s\S]*Os empatados não votam/);
  // No 2º turno, empatado não vota; os outros dois empatam de novo.
  assert.match(asText(await t.say(t.name(x), '2')), /quem está no 2º turno não vota/);
  await t.say(t.name(t.s.impostor), '1');
  const end = asText(await t.say(t.name(z), '2'));
  assert.match(end, /Empate de novo no 2º turno: o impostor escapa[\s\S]*ele vence a rodada/);
  assert.match(end, new RegExp(`\\+${IMPOSTOR_POINTS.escaped} `));
});

test('Impostor: votar num inocente deixa o impostor escapar; pego e acertando o segredo, ele rouba (+4)', async () => {
  const a = await table(4, 21);
  const ballot = await toVoting(a);
  const innocent = ballot.find((j) => j !== a.s.impostor)!;
  for (const jid of ballot) {
    const target = jid === innocent ? ballot.find((j) => j !== innocent && j !== jid)! : innocent;
    await a.say(a.name(jid), String(ballot.indexOf(target) + 1));
  }
  const s1 = await a.store.getActiveMatch(a.G);
  assert.equal(s1, null);
  assert.match(asText(a.all.slice(-1)), /era INOCENTE[\s\S]*ele vence a rodada/);

  const b = await table(4, 33);
  const ballot2 = await toVoting(b);
  const impNo = String(ballot2.indexOf(b.s.impostor) + 1);
  for (const jid of ballot2) if (jid !== b.s.impostor) await b.say(b.name(jid), impNo);
  await b.tick(); // fecha a votação (o impostor não votou)
  const secret = getImpostorSecret(b.s.secretId)!;
  const end = asText(await b.say(b.name(b.s.impostor), secret.name.toLowerCase()));
  assert.match(end, /acertou \*[^*]+\* e rouba a vitória/);
  assert.match(end, new RegExp(`\\+${IMPOSTOR_POINTS.stole} ${b.name(b.s.impostor)}`));
});

test('Impostor: se o impostor sai no meio, o grupo vence', async () => {
  // Semente em que o impostor não é a anfitriã (a anfitriã não pode sair da sala).
  let t = await table(5, 41);
  for (let seed = 42; t.s.impostor === 'Ana@s.whatsapp.net'; seed++) t = await table(5, seed);
  await t.tick();
  const imp = t.name(t.s.impostor);
  await t.say(imp, 'sair');
  // A próxima dica (ou o fim do tempo) percebe a fuga.
  const s = (await t.state())!;
  const out = asText(await t.say(t.name(s.order[s.turn]), 'fuga'));
  assert.match(out, /O impostor fugiu! Era \*/);
  assert.equal(await t.store.getActiveMatch(t.G), null);
});

test('Impostor no privado: "oi" de quem joga reenvia a carta; resto e quem não joga são ignorados', async () => {
  const t = await table(4, 51);
  const bia = 'Bia@s.whatsapp.net';
  const priv = (from: string, text: string) =>
    handleMessage({ id: `p${text}${from}`, groupJid: from, senderJid: from, senderName: 'X', text, private: true }, t.deps);
  const card = asText(await priv(bia, 'oi'));
  assert.match(card, /Impostor\*: (o segredo é|você é o \*IMPOSTOR)/);
  assert.deepEqual(await priv(bia, 'quem ganhou ontem?'), []);
  assert.deepEqual(await priv('Zeca@s.whatsapp.net', 'oi'), []);
  assert.deepEqual(await priv(bia, 'ativar jogos'), [], 'no privado nada mexe em grupo');

  // Webhook da Evolution: conversa privada vira mensagem com private: true.
  process.env.EVOLUTION_INSTANCE = 'jogos';
  const parsed = evolution.parseWebhook({
    event: 'messages.upsert',
    instance: 'jogos',
    data: { key: { remoteJid: '5511999@s.whatsapp.net', fromMe: false, id: 'PV1' }, pushName: 'Bia', message: { conversation: 'oi' } },
  });
  assert.equal(parsed?.private, true);
  assert.equal(parsed?.senderJid, '5511999@s.whatsapp.net');
  assert.equal(evolution.parseWebhook({ event: 'messages.upsert', instance: 'jogos', data: { key: { remoteJid: 'status@broadcast', fromMe: false, id: 'S1' }, message: { conversation: 'x' } } }), null);
});

// ---------- Rodada 7: mais conteúdo ----------

test('Impostor: 4 temas novos de futebol, temas gerais só quando pedidos e nomes a mais só no Impostor', async () => {
  const futebol = IMPOSTOR_SECRETS.filter((s) => s.category === 'futebol');
  const gerais = IMPOSTOR_SECRETS.filter((s) => s.category === 'geral');
  assert.ok(futebol.length >= 350, `${futebol.length} de futebol`);
  assert.ok(gerais.length >= 240, `${gerais.length} gerais`);
  for (const t of IMPOSTOR_THEMES) {
    const n = IMPOSTOR_SECRETS.filter((s) => s.theme === t.theme).length;
    assert.ok(n >= 15, `tema ${t.theme} tem só ${n}`);
  }
  assert.equal(new Set(IMPOSTOR_SECRETS.map((s) => s.id)).size, IMPOSTOR_SECRETS.length, 'ids únicos');
  assert.ok(!IMPOSTOR_THEMES.some((t) => t.theme === 'coisa do futebol'));
  // Os nomes a mais não vazam para o Anagrama.
  assert.ok(IMPOSTOR_SECRETS.some((s) => s.name === 'Lucas Paquetá'));
  assert.ok(!ANAGRAMS.some((a) => a.answer === 'Lucas Paquetá'));
  // Temas pedidos pelo nome.
  assert.equal(findImpostorTheme('copas'), 'edição da Copa');
  assert.equal(findImpostorTheme('estadios do mundo'), 'estádio do mundo');
  assert.equal(findImpostorTheme('lances'), 'lance do futebol');
  assert.equal(findImpostorTheme('competicoes'), 'competição');
  assert.equal(findImpostorTheme('lugares'), 'lugar');
  assert.equal(findImpostorTheme('filmes'), 'filme');
  assert.equal(findImpostorTheme('geral'), IMPOSTOR_GERAL);
  // Sem tema: só futebol; "geral": só os gerais.
  assert.ok(impostorPool(null).every((s) => s.category === 'futebol'));
  assert.ok(impostorPool(IMPOSTOR_GERAL).every((s) => s.category !== 'futebol'), '"geral" = tudo que não é futebol');
  assert.ok(impostorPool('lugar').every((s) => s.theme === 'lugar'));
  // Copa: o ano (inteiro ou de 2 dígitos) entrega; "tri" não.
  const copa70 = IMPOSTOR_SECRETS.find((s) => s.name === 'Copa de 1970')!;
  assert.ok(givesAway(copa70.id, '1970') && givesAway(copa70.id, '70'));
  assert.ok(!givesAway(copa70.id, 'tri') && !givesAway(copa70.id, 'Pelé'));
  const lance = IMPOSTOR_SECRETS.find((s) => s.name === 'Gol olímpico')!;
  assert.ok(givesAway(lance.id, 'olímpico') && !givesAway(lance.id, 'escanteio'));

  // No grupo: "temas do impostor" separa futebol e gerais; "abrir impostor geral" sorteia um tema geral.
  const t = await table(4, 11, 'geral');
  assert.equal(getImpostorSecret(t.s.secretId)!.category, 'geral');
  assert.equal(t.s.theme, IMPOSTOR_GERAL);
  const temas = asText(await t.say('Bia', 'temas do impostor'));
  assert.match(temas, /Futebol\*: [^\n]*estádios do mundo[^\n]*Copas do Mundo/);
  assert.match(temas, /Gerais\*: [^\n]*filmes[^\n]*lugares/);
  const f = await table(4, 12, 'futebol');
  assert.equal(f.s.theme, 'futebol', '"futebol" mistura os de futebol');
  assert.equal(getImpostorSecret(f.s.secretId)!.category, 'futebol');
  const c = await table(4, 13, 'copas rapido');
  assert.equal(getImpostorSecret(c.s.secretId)!.theme, 'edição da Copa');
  assert.equal(c.s.fast, true);
});

// ---------- Rodada 8: temas à escolha, grupo só de Impostor, ~2.300 segredos ----------

test('Impostor: 57 temas, misturas futebol/geral/tudo, nome curto proibido e sem diabinho', async () => {
  assert.ok(IMPOSTOR_SECRETS.length >= 2000, `${IMPOSTOR_SECRETS.length} segredos`);
  assert.ok(IMPOSTOR_THEMES.length >= 45, `${IMPOSTOR_THEMES.length} temas`);
  assert.equal(new Set(IMPOSTOR_SECRETS.map((s) => s.id)).size, IMPOSTOR_SECRETS.length, 'ids únicos');
  const keys = IMPOSTOR_THEMES.flatMap((t) => t.keys);
  assert.equal(new Set(keys).size, keys.length, 'nenhuma chave de tema repetida');
  for (const t of IMPOSTOR_THEMES) assert.ok(impostorPool(t.theme).length >= 15, `tema ${t.theme}`);
  // O que aparece na lista de temas funciona como comando ("abrir impostor festas e datas").
  for (const t of IMPOSTOR_THEMES) assert.equal(findImpostorTheme(themeLabel(t)), t.theme, `rótulo ${themeLabel(t)}`);
  assert.ok(IMPOSTOR_SECRETS.every((s) => s.forbidden.length > 0 && !s.name.includes(',')));
  // Misturas e temas pedidos pelo nome com ou sem acento.
  assert.equal(findImpostorTheme('futebol'), IMPOSTOR_FUTEBOL);
  assert.equal(findImpostorTheme('tudo'), IMPOSTOR_TUDO);
  assert.equal(findImpostorTheme('séries'), 'série');
  assert.equal(findImpostorTheme('heróis e vilões'), 'herói ou vilão');
  assert.equal(findImpostorTheme('gringos do brasileirão'), 'gringo do Brasileirão');
  assert.equal(findImpostorTheme('animes'), 'personagem de anime');
  assert.ok(impostorPool(IMPOSTOR_FUTEBOL).every((s) => s.category === 'futebol'));
  assert.equal(impostorPool(IMPOSTOR_TUDO).length, IMPOSTOR_SECRETS.length);
  assert.ok(impostorPool(IMPOSTOR_GERAL).some((s) => s.category === 'anime'), '"geral" inclui anime e história');
  // Nome de 2 letras também não vale como dica (U2, Ka).
  const u2 = IMPOSTOR_SECRETS.find((s) => s.name === 'U2')!;
  assert.ok(givesAway(u2.id, 'U2') && !givesAway(u2.id, 'Bono'));
  // "abrir impostor do futebol" = tema futebol.
  assert.deepEqual(parsePartyStart('abrir impostor do futebol'), { game: 'impostor', rest: 'futebol' });
  assert.deepEqual(parsePartyStart('abrir impostor de series'), { game: 'impostor', rest: 'series' });

  // Partida com tema escolhido na frente: carta e mensagens sem o 😈.
  const t = await table(4, 21, 'séries');
  assert.equal(getImpostorSecret(t.s.secretId)!.theme, 'série');
  const all = asText(t.start);
  assert.doesNotMatch(all, /😈/);
  assert.match(all, /🕵️ \*Impostor\* valendo![\s\S]*Tema: \*série\*/);
  const cards = t.start.flatMap((o) => (o.type === 'dm' ? [o.text] : [])).join('\n');
  assert.match(cards, /🎭 \*Impostor\*: você é o \*IMPOSTOR\*/);
  assert.doesNotMatch(cards, /😈/);
  assert.doesNotMatch(asText(await t.say('Bia', 'temas do impostor')), /😈/);
});

test('Grupo só de Impostor: "ativar impostor" (admin), padrão geral, outros jogos recusados e "ativar jogos" libera', async () => {
  const store = new MemoryStore();
  let id = 0;
  const deps = {
    store, lookup: createLookup(store, async () => null), now: () => new Date('2026-11-19T12:00:00Z'), rng: lcg(31),
    canManageGroup: (jid: string) => jid === 'Ana@s.whatsapp.net',
  };
  const G = 'amigos@g.us';
  const say = (who: string, text: string) =>
    handleMessage({ id: `g${++id}`, groupJid: G, senderJid: `${who}@s.whatsapp.net`, senderName: who, text }, deps);
  // Grupo desligado: só o admin ativa.
  assert.match(asText(await say('Bia', 'ativar impostor')), /Só o administrador/);
  assert.match(asText(await say('Ana', 'ativar só o impostor')), /Impostor\* ativado neste grupo[\s\S]*temas gerais/);
  // Ajuda, temas e regras do próprio Impostor.
  assert.match(asText(await say('Bia', 'ajuda')), /só este jogo está ativo/);
  assert.match(asText(await say('Bia', 'temas do impostor')), /Sem tema, neste grupo: \*geral\*/);
  assert.match(asText(await say('Bia', 'regras')), /Regras do Impostor/);
  // Outros jogos não abrem.
  for (const cmd of ['abrir top 10', 'iniciar jogo', 'abrir anagrama', 'top 100']) {
    assert.match(asText(await say('Bia', cmd)), /só o \*Impostor\* está ativo/, cmd);
  }
  assert.equal(await store.getActiveMatch(G), null);
  // Sem tema: geral (nada de futebol).
  await say('Ana', 'abrir impostor');
  for (const p of ['Bia', 'Caio', 'Duda']) await say(p, 'entrar');
  await say('Ana', 'começar');
  const st = (await store.getActiveMatch(G))!.state as ImpostorParty;
  assert.equal(st.theme, IMPOSTOR_GERAL);
  assert.notEqual(getImpostorSecret(st.secretId)!.category, 'futebol');
  await say('Ana', 'encerrar');
  // Futebol também dá, pedindo.
  await say('Ana', 'abrir impostor futebol');
  for (const p of ['Bia', 'Caio', 'Duda']) await say(p, 'entrar');
  await say('Ana', 'começar');
  const fut = (await store.getActiveMatch(G))!.state as ImpostorParty;
  assert.equal(getImpostorSecret(fut.secretId)!.category, 'futebol');
  await say('Ana', 'encerrar');
  // "ativar jogos" libera tudo de novo; sem tema volta a ser futebol.
  assert.match(asText(await say('Ana', 'ativar jogos')), /Todos os jogos[\s\S]*liberados/);
  assert.match(asText(await say('Bia', 'ajuda')), /img:help/);
  assert.match(asText(await say('Bia', 'abrir top 10')), /img:partyLobby/);
});

test('Impostor: debate de 60s (30s no rápido) e o anfitrião ainda pode encurtar com "votar"', async () => {
  for (const [theme, secs] of [['', 60], ['rapido', 30]] as const) {
    const t = await table(4, 41, theme);
    await t.tick();
    let word = 0;
    let out: Outgoing[] = [];
    for (let guard = 0; guard < 20; guard++) {
      const s = (await t.state())!;
      if (s.phase !== 'clues') break;
      out = await t.say(t.name(s.order[s.turn]), `pista${++word}`);
    }
    assert.equal((await t.state())!.phase, 'debate');
    assert.match(groupText(out), new RegExp(`Debate!\\* ${secs}s para acusar[\\s\\S]*\\[timer:${secs + 1}s\\]`), theme || 'normal');
    await t.say('Ana', 'votar');
    assert.equal((await t.state())!.phase, 'voting');
  }
});
