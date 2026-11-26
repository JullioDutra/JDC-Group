import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { recordFromEntity, searchWikidataPlayers, wikidataCareer, type Entity, type PlayerSources } from '../src/lib/players/sources';
import { MemoryStore } from '../src/lib/store/memory';

/**
 * Dados reais (26/11/2026): entidade do Leônidas da Silva no Wikidata
 * (Q311739, nascido em 1913, fora da carga) e os rótulos dos times, da
 * posição e do país, como o Wikidata devolve.
 */
const LEO = JSON.parse(readFileSync('tests/fixtures/rodada15-leonidas.json', 'utf8')) as {
  entity: Entity;
  labels: Record<string, { pt?: string; en?: string }>;
};
const LABELS = new Map(Object.entries(LEO.labels));

/** API do Wikidata falsa: busca, várias entidades, rótulos e a página da entidade. */
function wikidataApi(calls: string[] = []) {
  return async (url: string): Promise<Response> => {
    calls.push(url);
    const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
    if (url.includes('action=wbsearchentities')) {
      const q = decodeURIComponent(url.match(/search=([^&]+)/)![1]);
      if (!/le[oô]nidas/i.test(q)) return json({ search: [] });
      return json({ search: [{ id: 'Q311739', description: 'futebolista brasileiro' }, { id: 'Q1', description: 'político brasileiro' }] });
    }
    if (url.includes('action=wbgetentities') && url.includes('props=labels|claims')) return json({ entities: { Q311739: LEO.entity } });
    if (url.includes('action=wbgetentities')) {
      const ids = decodeURIComponent(url.match(/ids=([^&]+)/)![1]).split('|');
      return json({ entities: Object.fromEntries(ids.map((id) => [id, { labels: { pt: { value: LABELS.get(id)?.pt }, en: { value: LABELS.get(id)?.en } } }])) });
    }
    if (url.includes('Special:EntityData/Q311739')) return json({ entities: { Q311739: LEO.entity } });
    return new Response('', { status: 404 });
  };
}

test('Rodada 15: ficha completa a partir do Wikidata (Leônidas, nascido em 1913)', async () => {
  const r = recordFromEntity(LEO.entity, LABELS)!;
  assert.equal(r.id, 'Q311739');
  assert.equal(r.name, 'Leônidas da Silva');
  assert.deepEqual(r.aliases, ['Leônidas']);
  assert.deepEqual(r.positions, ['ATA']);
  assert.equal(r.nationality, 'Brasil');
  assert.equal(r.birthDate, '1913-11-06');
  assert.equal(r.heightCm, 173);
  assert.deepEqual(r.clubs, [
    'São Cristóvão de Futebol e Regatas', 'Bonsucesso Futebol Clube', 'Club Atlético Peñarol', 'Club de Regatas Vasco da Gama',
    'Botafogo de Futebol e Regatas', 'Sport Club Brasil', 'Clube de Regatas do Flamengo', 'São Paulo Futebol Clube',
  ]);
  assert.equal(r.debutYear, 1929);
  assert.ok(r.sitelinks >= 40);
  // Busca: só futebolistas, em 3 pedidos.
  const calls: string[] = [];
  const found = await searchWikidataPlayers('Leônidas', wikidataApi(calls));
  assert.deepEqual(found.map((x) => x.id), ['Q311739']);
  assert.equal(calls.length, 3);
  assert.deepEqual(await searchWikidataPlayers('Ninguém Inventado', wikidataApi()), []);
});

test('Rodada 15: jogador fora da base entra na hora pelo Wikidata, sem perguntar à IA', async () => {
  const store = new MemoryStore();
  const web = wikidataApi();
  const sources: PlayerSources = {
    career: (id) => wikidataCareer(id, web),
    wikipediaClubs: async () => null,
    findId: async () => null,
    searchPlayers: (name) => searchWikidataPlayers(name, web),
  };
  let asked = 0;
  const lookup = createLookup(store, async () => (asked++, null), undefined, sources);
  const p = (await lookup('Leônidas', { position: 'ATA', kind: 'club', teamId: 'flamengo' }))!;
  assert.equal(p.id, 'Q311739');
  assert.equal(asked, 0, 'a IA não foi chamada');
  assert.ok(p.clubs.includes('Clube de Regatas do Flamengo'));
  assert.ok(!p.clubs.some((c) => /Seleção/.test(c)));
  assert.ok(await store.getPlayer('Q311739'), 'entrou na base');
  // Próxima busca já acha na base.
  assert.equal((await lookup('Leônidas da Silva', { position: 'ATA', kind: 'club', teamId: 'sao-paulo' }))!.id, 'Q311739');
  // Nome que o Wikidata não tem: segue para a IA (e não busca de novo por 10 min).
  await lookup('Fulano Inexistente', { position: 'ATA' });
  assert.equal(asked, 1);
});

const WIKI = (LEO as unknown as { wiki: { mbappe_en: string; havertz_en: string; danilo_en: string } }).wiki;

test('Rodada 15: caixa da Wikipédia — seleção principal (sem base nem olímpica) e posições', async () => {
  const { parseInfoboxNational, parseInfoboxPositions, mapAnyPosition } = await import('../src/lib/players/sources');
  assert.deepEqual(parseInfoboxNational(WIKI.mbappe_en), { caps: 108, goals: 67 }, 'gol dentro de link também vale');
  assert.deepEqual(parseInfoboxNational(WIKI.danilo_en), { caps: 75, goals: 1 }, 'sub-20 e olímpica não contam');
  assert.deepEqual(parseInfoboxPositions(WIKI.havertz_en), ['MEI', 'ATA']);
  assert.deepEqual(parseInfoboxPositions(WIKI.danilo_en), ['DEF']);
  for (const [l, p] of [['Goleiro', 'GOL'], ['Zagueiro', 'DEF'], ['Lateral-esquerdo', 'DEF'], ['Volante', 'MEI'], ['Meia-atacante', 'MEI'], ['Centroavante', 'ATA'], ['Ponta-direita', 'ATA'], ['Winger', 'ATA']] as const) {
    assert.equal(mapAnyPosition(l), p, l);
  }
});

test('Rodada 15: Wikipédia completa posição que falta e dá os jogos pela seleção (temas 7 e 8)', async () => {
  const store = new MemoryStore();
  const ent = (id: string, en: string): Entity => ({ id, labels: { en: { value: id } }, claims: { P54: [{ mainsnak: { datavalue: { value: { id: 'Q9617' } } } }] }, sitelinks: { enwiki: { title: en } } });
  const pages: Record<string, string> = { 'Kai_Havertz': WIKI.havertz_en, 'Kylian_Mbapp%C3%A9': WIKI.mbappe_en };
  let wikiCalls = 0;
  const web = async (url: string): Promise<Response> => {
    const json = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes('Special:EntityData/Q1')) return json({ entities: { Q1: ent('Q1', 'Kai Havertz') } });
    if (url.includes('Special:EntityData/Q2')) return json({ entities: { Q2: ent('Q2', 'Kylian Mbappé') } });
    if (url.includes('wbgetentities')) return json({ entities: { Q9617: { labels: { pt: { value: 'Arsenal Football Club' } } } } });
    const page = Object.keys(pages).find((k) => url.includes('en.wikipedia.org') && url.includes(k));
    if (page) return (wikiCalls++, new Response(pages[page]));
    return new Response('', { status: 404 });
  };
  const { wikidataCareer, wikipediaClubs, wikipediaInfo } = await import('../src/lib/players/sources');
  const sources: PlayerSources = {
    career: (id) => wikidataCareer(id, web),
    wikipediaClubs: (w) => wikipediaClubs(w, web),
    wikipediaInfo: (w) => wikipediaInfo(w, web),
    findId: async () => null,
  };
  const base = { aliases: [], nationality: null, birthDate: null, heightCm: null, debutYear: null, sitelinks: 50, source: 'wikidata' as const };
  await store.upsertPlayers([
    { ...base, id: 'Q1', name: 'Kai Havertz', positions: ['MEI'], clubs: ['Arsenal Football Club'], stats: {} },
    { ...base, id: 'Q2', name: 'Kylian Mbappé', positions: ['ATA'], clubs: ['Real Madrid'], stats: { intlCaps: 80, intlGoals: 40 } },
  ]);
  const lookup = createLookup(store, async () => null, undefined, sources);
  // Havertz no ataque: o Wikidata só tem meia; a Wikipédia tem atacante.
  const h = (await lookup('Kai Havertz', { position: 'ATA' }))!;
  assert.ok(h.positions.includes('ATA'));
  assert.deepEqual((await store.getPlayer('Q1'))!.manual?.positions?.map((p) => [p.position, p.source]), [['ATA', 'Wikipédia']]);
  // Goleiro, nem a Wikipédia confirma.
  assert.ok(!(await lookup('Kai Havertz', { position: 'GOL' }))!.positions.includes('GOL'));
  // Mbappé no tema de gols pela seleção: o número velho dá lugar ao da Wikipédia.
  const m = (await lookup('Kylian Mbappé', { position: 'ATA', metric: 'intlGoals' }))!;
  assert.equal(m.intlGoals, 67);
  assert.equal(m.intlCaps, 108);
  assert.equal((await store.getPlayer('Q2'))!.stats.intlGoals, 67);
  // Correção do admin continua valendo mais.
  await store.setManualStat('Q2', 'intlGoals', { value: 70, source: 'FIFA', at: '2026-11-26' });
  assert.equal((await lookup('Kylian Mbappé', { position: 'ATA', metric: 'intlGoals' }))!.intlGoals, 70);
  assert.ok(wikiCalls <= 2, `cache da Wikipédia (${wikiCalls} pedidos)`);
});
