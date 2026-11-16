import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import { normalize } from '../src/lib/game/text';
import type { ConexoesParty, DraftParty, Outgoing, QuizParty, RodadaParty, SobreviventeParty, StopParty } from '../src/lib/game/types';
import { CONEXOES, getConexoes } from '../src/lib/party/content/conexoes';
import { FACTS, getFact } from '../src/lib/party/content/fato';
import { FLAGS, getFlag } from '../src/lib/party/content/flags';
import { TIMELINE, getEvent } from '../src/lib/party/content/linha';
import { SURVIVOR_LISTS, getSurvivorList } from '../src/lib/party/content/sobrevivente';
import { STOP_CATEGORIES } from '../src/lib/party/content/stop';
import { parseFour } from '../src/lib/party/conexoes';
import { parsePartyStart } from '../src/lib/party/engine';
import { parseFact, parseOrder } from '../src/lib/party/rodada';
import { parseSheet } from '../src/lib/party/stop';
import { MemoryStore } from '../src/lib/store/memory';
import { asText } from './helpers';

const G = 'jogos2@g.us';

function setup(checkWords?: (l: string, items: Array<{ category: string; word: string }>) => Promise<boolean[]>) {
  const store = new MemoryStore();
  let id = 0;
  const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0, now: () => new Date('2026-11-16T12:00:00Z'), checkWords };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick(G, null, deps, true);
  const session = async () => (await store.getActiveMatch(G))!;
  const patch = async <T>(fn: (s: T) => void) => {
    const m = await session();
    fn(m.state as T);
    await store.saveMatch(m);
  };
  return { store, say, tick, session, patch };
}

async function open(say: (w: string, t: string) => Promise<Outgoing[]>, command: string, extra: string[] = []) {
  await say('Ana', 'ativar grupo');
  await say('Ana', command);
  await say('Bia', 'entrar');
  for (const p of extra) await say(p, 'entrar');
  return asText(await say('Ana', 'começar'));
}

test('conteúdo dos jogos novos: ids únicos e regras de curadoria', () => {
  const unique = (xs: Array<{ id: string }>) => new Set(xs.map((x) => x.id)).size === xs.length;
  assert.ok(unique(FLAGS) && unique(SURVIVOR_LISTS) && unique(CONEXOES) && unique(TIMELINE) && unique(FACTS) && unique(STOP_CATEGORIES));
  assert.ok(FLAGS.length >= 50 && SURVIVOR_LISTS.length >= 25 && CONEXOES.length >= 12 && TIMELINE.length >= 90 && FACTS.length >= 45);
  // Bandeiras: respostas únicas e cada região tem o bastante para uma partida.
  assert.equal(new Set(FLAGS.map((f) => normalize(f.answer))).size, FLAGS.length);
  assert.ok(FLAGS.filter((f) => f.region === 'sul').length >= 2 && FLAGS.filter((f) => f.region === 'europa').length >= 4);
  // Conexões: 4 grupos de 4 e nenhum nome repetido no tabuleiro.
  for (const p of CONEXOES) {
    const all = p.groups.flatMap((g) => g.items.map((i) => normalize(i)));
    assert.equal(p.groups.length, 4, p.id);
    assert.equal(new Set(all).size, 16, `nome repetido em ${p.id}`);
  }
  // Sobrevivente: nenhum item repetido dentro da lista.
  for (const l of SURVIVOR_LISTS) {
    const names = l.items.map((i) => normalize(i[0]));
    assert.equal(new Set(names).size, names.length, l.id);
  }
});

test('comandos dos jogos novos', () => {
  assert.deepEqual(parsePartyStart('abrir bandeiraco'), { game: 'bandeira', rest: '' });
  assert.deepEqual(parsePartyStart('abrir sobrevivente geral'), { game: 'sobrevivente', rest: 'geral' });
  assert.deepEqual(parsePartyStart('jogar conexoes anime'), { game: 'conexoes', rest: 'anime' });
  assert.deepEqual(parsePartyStart('abrir adedonha'), { game: 'stop', rest: '' });
  assert.deepEqual(parsePartyStart('abrir draft da resenha'), { game: 'draft', rest: '' });
  assert.deepEqual(parsePartyStart('abrir linha do tempo historia'), { game: 'linha', rest: 'historia' });
  assert.deepEqual(parsePartyStart('abrir fato ou fake politica'), { game: 'fato', rest: 'politica' });
  assert.equal(parsePartyStart('fato ou fake'), null);
  assert.deepEqual(parseFour('1 5, 9-13'), [1, 5, 9, 13]);
  assert.equal(parseFour('1 1 2 3'), null);
  assert.equal(parseFour('1 2 3 17'), null);
  assert.equal(parseOrder('c a d b'), 'CADB');
  assert.equal(parseOrder('AABC'), null);
  assert.equal(parseFact('Mentira'), 'fake');
  assert.equal(parseFact('é fato'), 'fato');
  assert.deepEqual(parseSheet('Maria, -, macaco, manga, médico', 5), ['Maria', '', 'macaco', 'manga', 'médico']);
  assert.equal(parseSheet('Maria, Marrocos', 5), null);
});

test('Bandeiraço: imagem da bandeira, começa pela América do Sul, aceita apelido', async () => {
  const { say, session } = setup();
  await open(say, 'abrir bandeiraço');
  const s = (await session()).state as QuizParty;
  assert.equal(s.order.length, 10);
  assert.ok(s.order.slice(0, 2).every((id) => getFlag(id)!.region === 'sul'));
  assert.ok(s.order.slice(2, 6).every((id) => getFlag(id)!.region === 'europa'));
  const flag = getFlag(s.order[0])!;
  const out = asText(await say('Bia', flag.aliases?.[0] ?? flag.answer));
  assert.match(out, new RegExp(`✅ \\*Bia\\* acertou: \\*${flag.answer}\\*`));
});

test('Sobrevivente: só quem está na vez; errou perde vida; repetido perde vida; último de pé vence', async () => {
  const { say, patch } = setup();
  await open(say, 'abrir sobrevivente');
  await patch<SobreviventeParty>((s) => {
    s.order = ['s-planetas', 's-signos'];
    s.totalRounds = 2;
  });
  assert.deepEqual(await say('Bia', 'Marte'), [], 'não é a vez da Bia');
  assert.match(asText(await say('Ana', 'Marte')), /\[react:✅\][\s\S]*Vez de \*Bia\*/);
  // Todos jogaram: troca a categoria (volta 2) e a vez volta para a Ana.
  assert.match(asText(await say('Bia', 'marte')), /❌ Bia: \*Marte\* já foi dito\. Perdeu uma vida \(resta 1\)\.[\s\S]*Volta 2\/2[\s\S]*Vez de \*Ana\*/);
  assert.match(asText(await say('Ana', 'Plutão')), /❌ Ana: "Plutão" não está na lista\. Perdeu uma vida[\s\S]*Vez de \*Bia\*/);
  const end = asText(await say('Bia', 'Netuno'));
  assert.match(end, /❌ Bia: "Netuno" não está na lista\. Está fora\.[\s\S]*🏆 \*Ana\* é o último de pé!/);
  void getSurvivorList;
});

test('Conexões: grupo certo pontua, "quase" avisa 3 de 4, combinação repetida não conta', async () => {
  const { say, session, patch } = setup();
  await open(say, 'abrir conexões futebol');
  await patch<ConexoesParty>((s) => {
    const p = getConexoes('cx-selecao')!;
    s.order = ['cx-selecao'];
    s.totalRounds = 1;
    s.tiles = p.groups.flatMap((g) => g.items); // 1–4 goleiros, 5–8 técnicos, 9–12 camisas 10, 13–16 artilheiros
  });
  assert.match(asText(await say('Bia', '1 2 3 5')), /Quase, \*Bia\*: 3 dos 4 são do mesmo grupo\. Restam 2 erros\./);
  assert.match(asText(await say('Ana', '5 3 2 1')), /já foi tentada/);
  assert.match(asText(await say('Ana', '4 3 2 1')), /✅ \*Ana\* achou: \*Goleiros do Brasil campeões do mundo\* \(\+100\)/);
  assert.match(asText(await say('Bia', '1 6 7 8')), /grupo já achado/);
  await say('Bia', '5 6 7 8');
  const end = asText(await say('Ana', '9 10 11 12'));
  assert.match(end, /Tabuleiro resolvido\.[\s\S]*Brasileiros artilheiros de uma Copa[\s\S]*🏆 \*Ana\* venceu com 300 pontos/);
  assert.equal(await session(), null);
});

test('Stop: letra, lista, IA e resposta repetida (quem mandou depois leva zero)', async () => {
  const asked: string[] = [];
  const { say, patch } = setup(async (_l, items) => items.map((it) => (asked.push(it.word), it.word === 'Mamute de pelúcia' ? false : it.word === 'Mexilhão')));
  await open(say, 'abrir stop', ['Caio']);
  await patch<StopParty>((s) => {
    s.letters = ['M'];
    s.cats = [['nome', 'pais', 'animal', 'fruta', 'time']];
    s.totalRounds = 1;
  });
  const first = asText(await say('Ana', 'Maria, Marrocos, Mexilhão, manga, Milan'));
  assert.match(first, /STOP! \*Ana\* mandou\. Os outros têm 20s\./);
  await say('Bia', 'Mário, marrocos, macaco, Banana, Mamute de pelúcia');
  const end = asText(await say('Caio', 'Marcos, México, -, melão, Manchester United'));
  assert.match(end, /Todos mandaram\./);
  assert.match(end, /Ana · 50/);
  assert.match(end, /Bia · 20/); // Mário + macaco; Marrocos repetida; Banana letra errada; time inexistente
  assert.match(end, /Caio · 40/);
  assert.deepEqual(asked, ['Mexilhão']); // só o que não está nas listas vai para a IA
});

test('Draft da Resenha: serpente, regra da rodada, sem repetir, votação sem votar no próprio', async () => {
  const { say, session, patch, tick } = setup();
  await open(say, 'abrir draft');
  await patch<DraftParty>((s) => {
    s.rules = [
      { pos: 'ATA', kind: 'none', value: '', label: 'atacante' },
      { pos: 'ATA', kind: 'letter', value: 'R', label: 'atacante com a letra R' },
    ];
    s.totalRounds = 2;
  });
  assert.deepEqual(await say('Bia', 'Neymar'), [], 'não é a vez da Bia');
  assert.match(asText(await say('Ana', 'Neymar')), /\[react:✅\][\s\S]*Vez de \*Bia\*/);
  assert.match(asText(await say('Bia', 'neymar')), /já foi escolhido/);
  assert.match(asText(await say('Bia', 'Messi')), /\[react:✅\][\s\S]*Rodada 2\/2[\s\S]*Vez de \*Bia\*/); // serpente: Bia repete
  assert.match(asText(await say('Bia', 'Haaland')), /não começa com R/);
  await say('Bia', 'Romário');
  const voting = asText(await say('Ana', 'Ronaldo'));
  assert.match(voting, /Votação!/);
  assert.match(asText(await say('Ana', '1')), /não vale votar no próprio time/);
  await say('Zé', '2');
  await say('Lia', '2');
  const end = asText(await tick());
  assert.match(end, /🏆 \*Bia\* montou o melhor time \(2 votos\)/);
  assert.equal((await session()), null);
});

test('Linha do Tempo: pontos por posição e bônus de ordem perfeita', async () => {
  const { say, patch } = setup();
  await open(say, 'abrir linha do tempo');
  await patch<RodadaParty>((s) => {
    s.order = ['t-cabral,t-lua,t-aurea,t-independencia'];
    s.totalRounds = 1;
  });
  void getEvent;
  await say('Ana', 'ADCB'); // 1500, 1822, 1888, 1969 → perfeito
  const end = asText(await say('Bia', 'A B C D'));
  assert.match(end, /Ordem certa: \*ADCB\*[\s\S]*Ana: ADCB \(4\/4\) \+150\nBia: ABCD \(2\/4\) \+50/);
});

test('Fato ou Fake: quem acerta pontua e o primeiro ganha bônus', async () => {
  const { say, patch } = setup();
  await open(say, 'abrir fato ou fake', ['Caio']);
  await patch<RodadaParty>((s) => {
    s.order = ['ff-muralha'];
    s.totalRounds = 1;
  });
  assert.equal(getFact('ff-muralha')!.fact, false);
  await say('Bia', 'fake');
  await say('Ana', 'fato');
  const end = asText(await say('Caio', 'mentira'));
  assert.match(end, /É \*FAKE\*\.[\s\S]*Acertaram: Bia, Caio[\s\S]*🏆 \*Bia\* venceu com 120 pontos/);
});
