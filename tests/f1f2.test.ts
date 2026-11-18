import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { CarreiraParty, GradeParty, Outgoing, PenaltisParty, PonteParty } from '../src/lib/game/types';
import { dispatch } from '../src/lib/dispatch';
import { parseCorrection, parseFamousName, parseValue } from '../src/lib/players/admin';
import { secondsToNextDay, isStalled } from '../src/lib/players/importRunner';
import { anchorEstimate } from '../src/lib/players/lookup';
import { brazilLinked, rankCandidates } from '../src/lib/players/rank';
import type { PlayerRecord } from '../src/lib/players/types';
import { careerPath, clubLabel } from '../src/lib/party/basegames';
import { freshFirst, react } from '../src/lib/party/common';
import { parsePartyStart } from '../src/lib/party/engine';
import { buildGrid, hasLine, parseMove } from '../src/lib/party/grade';
import { featuresOf, parseCriterion, satisfies } from '../src/lib/party/gridCriteria';
import { TITLE_ENTRIES } from '../src/lib/party/content/titles';
import { getTeam } from '../src/lib/game/teams';
import { goals } from '../src/lib/party/penaltis';
import { PONTE_POINTS, ponteHits } from '../src/lib/party/ponte';
import { MemoryStore } from '../src/lib/store/memory';
import type { WhatsAppProvider } from '../src/lib/whatsapp';
import { asText } from './helpers';

const rec = (over: Partial<PlayerRecord> & Pick<PlayerRecord, 'id' | 'name'>): PlayerRecord => ({
  aliases: [], positions: [], nationality: null, birthDate: null, heightCm: null, clubs: [], debutYear: null,
  sitelinks: 50, stats: {}, source: 'wikidata', ...over,
});

const CENI = rec({
  id: 'Q1', name: 'Rogério Ceni', aliases: ['Rogério Mücke Ceni'], positions: ['GOL'], nationality: 'Brasil',
  birthDate: '1973-01-22', clubs: ['Sinop', 'São Paulo Futebol Clube'], sitelinks: 60, anchors: { clubApps: 1100, clubGoals: 120 },
});

// ---------- Mensagens vazias ----------

test('reação leva o autor da mensagem como veio no webhook (sem ele, o grupo vê bolha vazia)', async () => {
  const msg = { id: 'X1', groupJid: 'g@g.us', senderJid: '5562999@s.whatsapp.net', keyParticipant: '1234@lid', senderName: 'Ana', text: 'oi' };
  const out = react(msg, '✅');
  assert.equal(out.type === 'react' && out.participant, '1234@lid');

  const sent: string[] = [];
  const provider = {
    sendText: async (_g: string, t: string) => void sent.push(`text:${t}`),
    sendImage: async () => undefined,
    sendReaction: async (_g: string, id: string, participant: string, emoji: string) => void sent.push(`react:${id}:${participant}:${emoji}`),
  } as unknown as WhatsAppProvider;
  await dispatch(provider, 'g@g.us', [out, { type: 'text', text: '   ' }, { type: 'text', text: 'ok' }], 'https://x');
  assert.deepEqual(sent, ['react:X1:1234@lid:✅', 'text:ok'], 'texto vazio nunca sai');
});

// ---------- Gols do Ceni ----------

test('Ceni: "não sei" antigo não fica para sempre; IA falhou → estimativa do Wikidata sem gravar', async () => {
  const store = new MemoryStore();
  await store.upsertPlayers([{ ...CENI, stats: { careerGoals: null } }]);
  let calls = 0;
  let answer: number | null = null;
  const lookup = createLookup(store, async () => null, async () => {
    calls += 1;
    if (answer === null) throw new Error('Maritaca não respondeu');
    return answer;
  });
  const ctx = { position: 'GOL' as const, kind: 'club' as const, teamId: 'sao-paulo', metric: 'careerGoals' as const };
  // A IA falhou: a jogada usa a soma do Wikidata (120 em clubes) e nada é gravado.
  assert.equal((await lookup('Rogério Ceni', ctx))?.careerGoals, 120);
  assert.equal((await store.getPlayer('Q1'))?.stats.careerGoals, null);
  // Dentro de 10 min não pergunta de novo (não trava a rodada).
  await lookup('Ceni', ctx);
  assert.equal(calls, 1);
  // Depois, a IA responde e o número fica gravado.
  (store as unknown as { cache: Map<string, unknown> }).cache.clear();
  answer = 131;
  assert.equal((await lookup('Rogério Ceni', ctx))?.careerGoals, 131);
  assert.equal((await store.getPlayer('Q1'))?.stats.careerGoals, 131);
});

test('Ceni: ficha duplicada (IA + Wikidata) vira uma só e não perde os gols', async () => {
  const store = new MemoryStore();
  await store.upsertPlayers([
    CENI,
    rec({ id: 'ai:rogerio ceni:1973-01-22', name: 'Rogério Ceni', positions: ['GOL'], birthDate: '1973-01-22', clubs: ['São Paulo'], sitelinks: 0, stats: { careerGoals: 131 }, source: 'ai' }),
  ]);
  let asked = 0;
  const lookup = createLookup(store, async () => null, async () => (asked++, 999));
  const p = await lookup('Rogério Ceni', { position: 'GOL', kind: 'club', teamId: 'sao-paulo', metric: 'careerGoals' });
  assert.equal(p?.careerGoals, 131, 'veio da ficha da IA');
  assert.equal(asked, 0);
  assert.equal(await store.countPlayers(), 1);
  assert.equal((await store.getPlayer('Q1'))?.stats.careerGoals, 131);
});

test('número manual vale mais que Wikidata e IA, e a carga não apaga', async () => {
  const store = new MemoryStore();
  await store.upsertPlayers([{ ...CENI, stats: { careerGoals: 100 } }]);
  const say = (who: string, text: string, admin = true) =>
    handleMessage(
      { id: `${Math.random()}`, groupJid: 'g@g.us', senderJid: `${who}@s`, senderName: who, text },
      { store, lookup: createLookup(store, async () => null, async () => 5), canManageGroup: () => admin },
    );
  await say('Ana', 'ativar jogos');
  assert.match(asText(await say('Bia', 'corrigir Rogério Ceni gols 131', false)), /Só o admin/);
  assert.match(asText(await say('Ana', 'corrigir Rogério Ceni gols 131')), /gols na carreira = \*131\* \(Transfermarkt/);
  await store.upsertPlayers([{ ...CENI, stats: { careerGoals: 90 } }]); // carga do Wikidata de novo
  const p = await createLookup(store, async () => null)('Rogério Ceni', { metric: 'careerGoals' });
  assert.equal(p?.careerGoals, 131);
  assert.ok(p?.manualAt);
  assert.match(asText(await say('Bia', 'ficha Rogério Ceni', false)), /Rogério Ceni[\s\S]*gols na carreira: 131 ✍️ Transfermarkt/);
  assert.match(asText(await say('Ana', 'nome famoso M1to = Rogério Ceni')), /agora vale/);
  assert.equal((await createLookup(store, async () => null)('M1to'))?.name, 'Rogério Ceni');
});

test('comandos de correção: dados, valores e formatos', () => {
  assert.deepEqual(parseCorrection('corrigir rogerio ceni gols 131'), { player: 'rogerio ceni', stat: 'careerGoals', value: 131, source: 'Transfermarkt' });
  assert.equal(parseCorrection('corrigir neymar gols selecao 79')?.stat, 'intlGoals');
  assert.deepEqual(parseCorrection('corrigir neymar valor atual 25,5 fonte ogol'), { player: 'neymar', stat: 'marketValueEurM', value: 25.5, source: 'ogol' });
  assert.equal(parseCorrection('corrigir neymar gols apagar')?.value, null);
  assert.equal(parseCorrection('corrigir neymar'), null);
  assert.equal(parseValue('1.234'), 1234);
  assert.equal(parseValue('60.5'), 60.5);
  assert.deepEqual(parseFamousName('nome famoso Gabigol = Gabriel Barbosa'), { alias: 'Gabigol', player: 'Gabriel Barbosa' });
});

test('preferência pelo Brasil desempata homônimos de fama parecida', () => {
  const br = rec({ id: 'Q10', name: 'Alex', clubs: ['Palmeiras', 'Cruzeiro'], nationality: 'Brasil', sitelinks: 30 });
  const eu = rec({ id: 'Q11', name: 'Alex', clubs: ['Chelsea'], nationality: 'Inglaterra', sitelinks: 40 });
  assert.ok(brazilLinked(br) && !brazilLinked(eu));
  assert.equal(rankCandidates([eu, br], 'alex')[0].record.id, 'Q10');
});

test('carga: orçamento diário do QStash e retomada pelo cron', () => {
  assert.equal(secondsToNextDay(new Date('2026-11-18T23:00:00Z')), 65 * 60);
  const base = { plan: [{ label: 'x' }], done: false } as never;
  const now = Date.parse('2026-11-18T12:00:00Z');
  assert.equal(isStalled({ ...(base as object), updatedAt: '2026-11-18T11:00:00Z' } as never, now), true);
  assert.equal(isStalled({ ...(base as object), updatedAt: '2026-11-18T11:58:00Z' } as never, now), false);
  assert.equal(isStalled({ ...(base as object), updatedAt: '2026-11-18T11:00:00Z', nextAt: '2026-11-19T00:05:00Z' } as never, now), false);
  assert.equal(isStalled({ ...(base as object), updatedAt: '2026-11-18T11:00:00Z', stopped: true } as never, now), false);
});

test('estimativa do Wikidata só para gols e jogos', () => {
  assert.equal(anchorEstimate({ ...CENI, stats: { intlGoals: 3 } }, 'careerGoals'), 123);
  assert.equal(anchorEstimate(CENI, 'careerApps'), 1100);
  assert.equal(anchorEstimate(CENI, 'titles'), null);
});

// ---------- Sem repetição ----------

test('sorteio prioriza o que o grupo ainda não viu; depois o visto há mais tempo', () => {
  const order = freshFirst(['a', 'b', 'c', 'd'], () => 0, ['c', 'a']);
  assert.deepEqual(order.slice(0, 2).sort(), ['b', 'd']);
  assert.deepEqual(order.slice(2), ['c', 'a']);
});

// ---------- F2: jogos gerados da base ----------

const FAMOUS: PlayerRecord[] = [
  rec({ id: 'P1', name: 'Neymar', aliases: ['Neymar da Silva Santos Júnior'], positions: ['ATA'], nationality: 'Brasil', birthDate: '1992-02-05', clubs: ['Santos', 'Barcelona', 'Paris Saint-Germain', 'Al-Hilal'] }),
  rec({ id: 'P2', name: 'Ronaldinho', aliases: ['Ronaldo de Assis Moreira'], positions: ['MEI', 'ATA'], nationality: 'Brasil', birthDate: '1980-03-21', clubs: ['Grêmio', 'Paris Saint-Germain', 'Barcelona', 'Milan', 'Flamengo', 'Atlético Mineiro'] }),
  rec({ id: 'P3', name: 'Daniel Alves', positions: ['DEF'], nationality: 'Brasil', birthDate: '1983-05-06', clubs: ['Bahia', 'Sevilla', 'Barcelona', 'Juventus', 'Paris Saint-Germain', 'São Paulo'] }),
  rec({ id: 'P4', name: 'Zlatan Ibrahimović', positions: ['ATA'], nationality: 'Suécia', birthDate: '1981-10-03', clubs: ['Malmö', 'Ajax', 'Juventus', 'Inter de Milão', 'Barcelona', 'Milan', 'Paris Saint-Germain', 'Manchester United'] }),
  rec({ id: 'P5', name: 'Kaká', aliases: ['Ricardo Izecson dos Santos Leite'], positions: ['MEI'], nationality: 'Brasil', birthDate: '1982-04-22', clubs: ['São Paulo', 'Milan', 'Real Madrid', 'Orlando City'] }),
  rec({ id: 'P6', name: 'Cafu', aliases: ['Marcos Evangelista de Morais'], positions: ['DEF'], nationality: 'Brasil', birthDate: '1970-06-07', clubs: ['São Paulo', 'Zaragoza', 'Juventude', 'Palmeiras', 'Roma', 'Milan'] }),
];

function setup(records: PlayerRecord[] = FAMOUS) {
  const store = new MemoryStore();
  let id = 0;
  const lookup = createLookup(store, async () => null, async () => null);
  const deps = { store, lookup, rng: () => 0, now: () => new Date('2026-11-18T12:00:00Z') };
  const say = (who: string, text: string): Promise<Outgoing[]> =>
    handleMessage({ id: `m${++id}`, groupJid: 'f2@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  const tick = () => handleTick('f2@g.us', null, deps, true);
  const state = async <T>() => (await store.getActiveMatch('f2@g.us'))!.state as T;
  return { store, say, tick, state, ready: store.upsertPlayers(records) };
}

test('comandos dos jogos da base', () => {
  assert.deepEqual(parsePartyStart('abrir carreira'), { game: 'carreira', rest: '' });
  assert.deepEqual(parsePartyStart('abrir ponte'), { game: 'ponte', rest: '' });
  assert.deepEqual(parsePartyStart('desafio grade'), { game: 'grade', rest: '' });
  assert.deepEqual(parsePartyStart('jogo da velha'), null);
  assert.deepEqual(parsePartyStart('desafio penaltis'), { game: 'penaltis', rest: '' });
  assert.equal(clubLabel('São Paulo Futebol Clube'), 'São Paulo');
  assert.deepEqual(careerPath(FAMOUS[0]), ['Santos', 'Barcelona', 'PSG', 'Al-Hilal']);
});

test('Ponte: 4 clubes = máximo, 3 vale menos e assim em sequência; 1 palpite por pessoa; ninguém repete', async () => {
  assert.deepEqual([PONTE_POINTS[4], PONTE_POINTS[3], PONTE_POINTS[2], PONTE_POINTS[1]], [10, 6, 3, 1]);
  const t = setup();
  await t.ready;
  await t.say('Ana', 'ativar jogos');
  await t.say('Ana', 'abrir ponte');
  await t.say('Bia', 'entrar');
  const start = asText(await t.say('Ana', 'começar'));
  assert.match(start, /Ponte\* valendo[\s\S]*🔗/);
  const s = await t.state<PonteParty>();
  const clubs = s.rounds[0].clubs;
  const example = FAMOUS.find((f) => f.name === s.rounds[0].example)!;
  assert.equal(ponteHits(example, clubs), 4, 'os 4 clubes saem da carreira de um jogador real');
  // Bia manda um que passou por menos clubes; Ana manda o exemplo (4 de 4).
  const other = FAMOUS.filter((f) => f.id !== example.id).sort((a, b) => ponteHits(b, clubs) - ponteHits(a, clubs))[0];
  const otherHits = ponteHits(other, clubs);
  await t.say('Bia', other.name);
  // Bia já usou o palpite: o segundo nome é ignorado, mesmo sendo o de 4 clubes.
  assert.equal(asText(await t.say('Bia', example.name)), '');
  // Nome já citado não gasta o palpite de Ana.
  assert.match(asText(await t.say('Ana', other.name)), /já foi citado/);
  // O palpite de Ana fecha a rodada: todos responderam.
  const end = asText(await t.say('Ana', example.name));
  assert.match(end, /\[react:4️⃣\][\s\S]*Todos responderam/);
  assert.match(end, new RegExp(`Ana: ${example.name} \\(4 de 4\\) \\+10`));
  if (otherHits > 0) assert.match(end, new RegExp(`Bia: ${other.name} \\(${otherHits} de 4\\) \\+${PONTE_POINTS[otherHits]}`));
});

test('Carreira: trajetória, dicas com o tempo e só vale nome coerente', async () => {
  const t = setup();
  await t.ready;
  await t.say('Ana', 'ativar jogos');
  await t.say('Ana', 'abrir carreira');
  await t.say('Bia', 'entrar');
  const start = asText(await t.say('Ana', 'começar'));
  assert.match(start, /De quem é esta carreira\?[\s\S]* → /);
  const s = await t.state<CarreiraParty>();
  const card = s.cards[0];
  assert.match(asText(await t.tick()), /Dica 1/);
  assert.equal(asText(await t.say('Bia', 'Zé Ninguém')), '[react:❌]');
  assert.equal(asText(await t.say('Bia', card.name)), '', '1 palpite por pessoa a cada dica');
  const hit = asText(await t.say('Ana', card.names[1] ?? card.name));
  assert.match(hit, /Ana\* acertou \(\+70\)/);
});

/** Fichas de teste montadas das listas de campeões (cada um com o clube/seleção do título). */
function championsFixture(): PlayerRecord[] {
  const out: PlayerRecord[] = [];
  let n = 0;
  const bigClubs = ['Real Madrid', 'Barcelona', 'Milan', 'Flamengo', 'Chelsea', 'Juventus'];
  for (const [title, entries] of Object.entries(TITLE_ENTRIES)) {
    for (const e of entries) {
      const club = e.club ? getTeam(e.club)!.name : bigClubs[n % bigClubs.length];
      const nation = e.nation ? getTeam(e.nation)!.name : ['Brasil', 'Argentina', 'França', 'Espanha'][n % 4];
      out.push(rec({ id: `T${++n}-${title}`, name: e.name, nationality: nation, clubs: [club, bigClubs[(n + 1) % bigClubs.length], 'São Paulo'] }));
    }
  }
  return out;
}

test('Grade 3x3: montagem com clubes, ligas, seleções e títulos; toda casa tem resposta', () => {
  assert.deepEqual(parseMove('A2 Neymar'), { cell: 1, name: 'Neymar' });
  assert.deepEqual(parseMove('3c Kaká'), { cell: 8, name: 'Kaká' });
  assert.equal(parseMove('a gente joga?'), null);
  const players = championsFixture();
  const feats = players.map((p) => featuresOf(p));
  for (const seed of [11, 37, 73]) {
    let x = seed;
    const rng = () => (x = (x * 16807) % 2147483647) / 2147483647;
    const grid = buildGrid(players, rng);
    assert.ok(grid, `sem grade (semente ${seed})`);
    const rows = grid!.rows.map((r) => parseCriterion(r, 'club'));
    const cols = grid!.cols.map((c) => parseCriterion(c, 'nation'));
    assert.ok(cols.some((c) => c.kind === 'nation') && cols.some((c) => c.kind === 'title'), 'colunas: sempre seleção e título');
    for (const r of rows) for (const c of cols) assert.ok(feats.some((f) => satisfies(f, r) && satisfies(f, c)), `casa sem resposta: ${r.id} x ${c.id}`);
  }
  // Campeões: o nome vale junto com a seleção ou o clube do título.
  const ronaldo = rec({ id: 'R9', name: 'Ronaldo', nationality: 'Brasil', clubs: ['Cruzeiro', 'Barcelona', 'Real Madrid'] });
  const cr7 = rec({ id: 'CR7', name: 'Cristiano Ronaldo', nationality: 'Portugal', clubs: ['Sporting', 'Manchester United', 'Real Madrid'] });
  assert.ok(featuresOf(ronaldo).titles.has('copa') && featuresOf(ronaldo).titles.has('bola'));
  assert.ok(!featuresOf(cr7).titles.has('copa') && featuresOf(cr7).titles.has('champions'));
  const st = { cells: Array(9).fill(null) } as unknown as GradeParty;
  st.cells[0] = { jid: 'a', name: 'x' };
  st.cells[4] = { jid: 'a', name: 'y' };
  st.cells[8] = { jid: 'a', name: 'z' };
  assert.ok(hasLine(st, 'a') && !hasLine(st, 'b'));
});

test('Grade 3x3 na partida: liga e título valem; fora da lista a IA confere; errou perde a vez', async () => {
  const extra = [
    rec({ id: 'X1', name: 'Ronaldinho', nationality: 'Brasil', clubs: ['Grêmio', 'Paris Saint-Germain', 'Barcelona', 'Milan', 'Flamengo', 'Atlético Mineiro'] }),
    rec({ id: 'X2', name: 'Bobby Moore', nationality: 'Inglaterra', clubs: ['West Ham United', 'Fulham'] }),
    rec({ id: 'X3', name: 'Rogério Ceni', nationality: 'Brasil', clubs: ['Sinop', 'São Paulo'] }),
    rec({ id: 'X4', name: 'Zé Desconhecido', nationality: 'Brasil', clubs: ['Barcelona'] }),
  ];
  const store = new MemoryStore();
  await store.upsertPlayers([...championsFixture(), ...extra]);
  const asked: string[] = [];
  let id = 0;
  const deps = {
    store, lookup: createLookup(store, async () => null, async () => null), rng: () => 0, now: () => new Date('2026-11-18T12:00:00Z'),
    checkFact: async (q: string) => (asked.push(q), q.includes('Zé Desconhecido')),
  };
  const say = (who: string, text: string) => handleMessage({ id: `g${++id}`, groupJid: 'gr@g.us', senderJid: `${who}@s`, senderName: who, text }, deps);
  await say('Ana', 'ativar jogos');
  await say('Ana', 'desafio grade');
  const start = asText(await say('Bia', 'aceitar'));
  assert.match(start, /Bia\* aceitou[\s\S]*\[img:gradeBoard\][\s\S]*Vez de/);
  // Grade fixa para o teste.
  const m = (await store.getActiveMatch('gr@g.us'))!;
  const s = m.state as GradeParty;
  s.rows = ['club:barcelona', 'league:premier', 'club:sao-paulo'];
  s.cols = ['nation:brasil', 'title:copa', 'title:champions'];
  await store.saveMatch(m);
  const first = s.players[s.turn].name;
  const second = first === 'Ana' ? 'Bia' : 'Ana';
  assert.match(asText(await say(first, 'A1 Ronaldinho')), /\[react:✅\][\s\S]*em A1/);
  assert.match(asText(await say(second, 'B2 Bobby Moore')), /\[react:✅\][\s\S]*em B2 \(Premier League \+ Campeão do Mundo\)/);
  assert.match(asText(await say(first, 'C3 Rogério Ceni')), /não foi campeão da Champions\. \*\w+\* perdeu a vez/);
  // Fora da lista curada: a IA confere (e a resposta fica guardada).
  assert.match(asText(await say(second, 'A3 Zé Desconhecido')), /\[react:✅\]/);
  assert.equal(asked.length, 2);
  assert.match(asked[1], /Zé Desconhecido[\s\S]*Liga dos Campeões/);
});

test('Pênaltis: 5 cobranças, gol vale com a regra, decide antes quando não dá mais para alcançar', async () => {
  const t = setup();
  await t.ready;
  await t.say('Ana', 'ativar jogos');
  await t.say('Ana', 'desafio penaltis');
  const start = asText(await t.say('Bia', 'aceitar'));
  assert.match(start, /Pênaltis[\s\S]*Cobrança 1[\s\S]*Regra:/);
  // Todo mundo perde o tempo: 0 x 0 depois das 5, vai para a morte súbita.
  let out = '';
  for (let i = 0; i < 10; i++) out = asText(await t.tick());
  assert.match(out, /Morte súbita/);
  const s = await t.state<PenaltisParty>();
  assert.equal(s.kicks.length, 12);
  assert.equal(goals(s, s.players[0].jid) + goals(s, s.players[1].jid), 0);
  // Encerrar no meio: termina empatado e libera o grupo.
  assert.match(asText(await t.say('Ana', 'encerrar')), /Terminou empatado/);
  assert.equal(await t.store.getActiveMatch('f2@g.us'), null);
});

test('Pênaltis: acaba antes quando um lado não alcança mais o outro', async () => {
  const t = setup();
  await t.ready;
  await t.say('Ana', 'ativar jogos');
  await t.say('Ana', 'desafio penaltis');
  await t.say('Bia', 'aceitar');
  const m = (await t.store.getActiveMatch('f2@g.us'))!;
  const s = m.state as PenaltisParty;
  // 3 cobranças de cada já batidas: primeiro 3 x 0.
  for (let i = 0; i < 6; i++) s.kicks[i].result = i % 2 === 0 ? 'gol' : 'defendeu';
  s.kick = 6;
  await t.store.saveMatch(m);
  // O primeiro perde a 4ª: 3 x 0 e o segundo só tem mais 2 cobranças. Acabou.
  const end = asText(await t.tick());
  assert.match(end, /venceu nos pênaltis/);
  assert.equal(await t.store.getActiveMatch('f2@g.us'), null);
});
