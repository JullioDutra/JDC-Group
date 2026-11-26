import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { getMode } from '../src/lib/game/modes';
import type { PlayerProfile } from '../src/lib/game/types';
import { checkPick } from '../src/lib/game/validate';
import {
  findWikidataIds, guessWikipedia, recordFromEntity, titleName, wikidataCareer, wikipediaClubs, type Entity, type PlayerSources,
} from '../src/lib/players/sources';
import { MemoryStore } from '../src/lib/store/memory';

/**
 * Dados reais (26/11/2026). Erro do grupo: "Não achei a carreira de *Egidio*
 * no Wikidata nem na Wikipédia" numa rodada do Cruzeiro.
 * - Wikidata Q3720578: rótulo pt "Egídio de Araújo Pereira Júnior" (o nome
 *   conhecido só está no título da página: "Egídio (futebolista)").
 * - Página "Egídio" na Wikipédia em pt: é um general romano (Q336937).
 */
const EG = JSON.parse(readFileSync('tests/fixtures/rodada16-egidio.json', 'utf8')) as {
  entity: Entity;
  labels: Record<string, { pt?: string; en?: string }>;
  wiki_pt: string;
};
const LABELS = new Map(Object.entries(EG.labels));
const GENERAL: Entity = {
  id: 'Q336937', labels: { pt: { value: 'Egídio' }, en: { value: 'Aegidius' } }, sitelinks: { ptwiki: { title: 'Egídio' } },
  claims: { P106: [{ mainsnak: { datavalue: { value: { id: 'Q82955' } } } }] },
};

function web(opts: { wikidataDown?: boolean; wikipediaDown?: boolean; noWikidata?: boolean } = {}) {
  const calls: string[] = [];
  const fetcher = async (url: string): Promise<Response> => {
    calls.push(url);
    const json = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes('wikidata.org')) {
      if (opts.wikidataDown) return new Response('Too Many Requests', { status: 429 });
      if (url.includes('wbsearchentities')) {
        if (opts.noWikidata) return json({ search: [] });
        return json({ search: [{ id: 'Q336937', description: 'general romano' }, { id: 'Q3720578', description: 'futebolista brasileiro' }] });
      }
      if (url.includes('wbgetentities') && url.includes('claims')) return json({ entities: { Q3720578: EG.entity, Q336937: GENERAL } });
      if (url.includes('wbgetentities')) {
        const ids = decodeURIComponent(url.match(/ids=([^&]+)/)![1]).split('|');
        return json({ entities: Object.fromEntries(ids.map((id) => [id, { labels: { pt: { value: LABELS.get(id)?.pt }, en: { value: LABELS.get(id)?.en } } }])) });
      }
      if (url.includes('EntityData/Q3720578')) return json({ entities: { Q3720578: EG.entity } });
    }
    if (url.includes('wikipedia.org')) {
      if (opts.wikipediaDown) return new Response('erro', { status: 503 });
      if (url.includes('pt.wikipedia.org') && url.includes(encodeURIComponent('Egídio_(futebolista)'))) return new Response(EG.wiki_pt);
      if (url.includes('pt.wikipedia.org') && url.includes(`title=${encodeURIComponent('Egídio')}&`)) return new Response("{{Info/Militar\n| nome = Egídio\n}}\n'''Egídio''' foi um general romano.");
    }
    return new Response('', { status: 404 });
  };
  const sources: PlayerSources = {
    career: (id) => wikidataCareer(id, fetcher),
    wikipediaClubs: (w) => wikipediaClubs(w, fetcher),
    findId: async (name, year) => (await findWikidataIds([name], year, fetcher))[0] ?? null,
    findIds: (names, year) => findWikidataIds(names, year, fetcher),
    guessWikipedia: (name) => guessWikipedia(name, fetcher),
  };
  return { fetcher, sources, calls };
}

/** A IA reconhece o Egídio (com o ano de nascimento errado: 1985). */
const ai = (birthDate = '1985-06-16', clubs = ['Flamengo', 'Cruzeiro', 'Palmeiras']) => async (): Promise<PlayerProfile> => ({
  exists: true, name: 'Egídio', positions: ['DEF'], nationality: 'Brasil', birthDate, clubs, heightCm: 178,
  careerGoals: 15, careerAssists: 40, peakValueEurM: 3, intlCaps: 0, intlGoals: 0, worldCupGoals: 0, uclGoals: 0,
  titles: 10, careerApps: 500, brasileiraoGoals: 8, libertadoresGoals: 0, worldCupsPlayed: 0, debutYear: 2003,
});
const cruzeiro = { position: 'DEF' as const, kind: 'club' as const, teamId: 'cruzeiro' };
const mode = getMode('artilheiros')!;
const passes = (p: PlayerProfile) => checkPick(p, 'DEF', { kind: 'club', teamId: 'cruzeiro' }, mode, new Date()).ok;

test('Rodada 16: o título da Wikipédia é o nome conhecido ("Egídio (futebolista)" → Egídio)', () => {
  assert.equal(titleName('Egídio (futebolista)'), 'Egídio');
  assert.equal(titleName('Fábio (footballer, born 1980)'), 'Fábio');
  assert.equal(titleName('Neymar'), 'Neymar');
  const r = recordFromEntity(EG.entity, LABELS)!;
  assert.equal(r.name, 'Egídio de Araújo Pereira Júnior');
  assert.ok(r.aliases.includes('Egídio'), r.aliases.join(', '));
  assert.ok(r.clubs.includes('Cruzeiro Esporte Clube'));
});

test('Rodada 16: Egídio no Cruzeiro — a IA erra o ano, mesmo assim acha o Wikidata (e não o general romano)', async () => {
  const { sources } = web();
  assert.deepEqual(await findWikidataIds(['Egídio'], 1985, web().fetcher), ['Q3720578'], 'ano com 1 de folga; o general não é futebolista');
  assert.deepEqual(await findWikidataIds(['Egídio'], 1980, web().fetcher), [], 'diferença maior que 1 ano: não é ele');
  const store = new MemoryStore();
  const lookup = createLookup(store, ai(), undefined, sources);
  const p = (await lookup('Egidio', cruzeiro))!;
  assert.equal(p.id, 'Q3720578');
  assert.equal(p.clubsUnverified, undefined);
  assert.ok(passes({ ...p, careerGoals: 15 }));
  // Da próxima vez, "Egidio" já acha a ficha do Wikidata na base.
  const again = (await createLookup(store, async () => null, undefined, sources)('Egidio', cruzeiro))!;
  assert.equal(again.id, 'Q3720578');
});

test('Rodada 16: a ficha do Wikidata na base (nome completo) recebe o nome conhecido que a IA confirmou', async () => {
  const store = new MemoryStore();
  await store.upsertPlayers([recordFromEntity(EG.entity, LABELS)!].map((r) => ({ ...r, aliases: [] })));
  // A IA dá o mesmo nascimento: é o mesmo jogador.
  const lookup = createLookup(store, ai('1986-06-16'), undefined, web().sources);
  const p = (await lookup('Egidio', cruzeiro))!;
  assert.equal(p.id, 'Q3720578');
  assert.ok((await store.getPlayer('Q3720578'))!.aliases.includes('Egídio'));
  assert.equal((await store.findPlayers(['egidio'], 10)).filter((r) => r.id.startsWith('ai:')).length, 0, 'não criou ficha da IA');
});

test('Rodada 16: sem Wikidata, a Wikipédia pelo título confirma; com as fontes fora do ar, não bloqueia', async () => {
  // Wikidata não acha: "Egídio (futebolista)" na Wikipédia tem o Cruzeiro.
  const noWd = web({ noWikidata: true });
  const p1 = (await createLookup(new MemoryStore(), ai(), undefined, noWd.sources)('Egidio', cruzeiro))!;
  assert.equal(p1.clubsUnverified, undefined);
  assert.ok(passes(p1));
  // A página existe e não tem o clube: vale a página (o clube da IA não conta).
  const p2 = (await createLookup(new MemoryStore(), ai('1985-06-16', ['Flamengo', 'Santos']), undefined, noWd.sources)('Egidio', { ...cruzeiro, teamId: 'santos' }))!;
  assert.ok(!checkPick(p2, 'DEF', { kind: 'club', teamId: 'santos' }, mode, new Date()).ok);
  // Wikidata e Wikipédia fora do ar: jogador que a IA conhece não é barrado.
  const down = web({ wikidataDown: true, wikipediaDown: true });
  const err = console.error;
  console.error = () => undefined;
  try {
    const p3 = (await createLookup(new MemoryStore(), ai(), undefined, down.sources)('Egidio', cruzeiro))!;
    assert.equal(p3.clubsUnverified, undefined);
    assert.ok(passes(p3));
  } finally {
    console.error = err;
  }
  // Nem Wikidata nem Wikipédia têm (e responderam): aí sim, "sem fonte".
  const none: PlayerSources = { career: async () => null, wikipediaClubs: async () => null, findId: async () => null, findIds: async () => [], guessWikipedia: async () => null };
  const p4 = (await createLookup(new MemoryStore(), ai(), undefined, none)('Egidio', cruzeiro))!;
  assert.equal(p4.clubsUnverified, true);
});

test('Rodada 16: Copa 2026 nos jogos (Anagrama, Impostor, listas) e novidades', async () => {
  const { findAnagramTheme, ANAGRAMS } = await import('../src/lib/party/content/anagramas');
  const { findImpostorTheme, impostorPool } = await import('../src/lib/party/content/impostor');
  const { SURVIVOR_LISTS } = await import('../src/lib/party/content/sobrevivente');
  const { TOP10_LISTS } = await import('../src/lib/party/top10-lists');
  const { NEWS, newsOutgoing } = await import('../src/lib/game/novidades');
  assert.equal(findAnagramTheme('copa 2026')?.theme, 'Copa 2026');
  assert.ok(ANAGRAMS.filter((a) => a.theme === 'Copa 2026').length >= 30);
  assert.equal(findImpostorTheme('copa 2026'), 'Copa 2026');
  assert.ok(impostorPool('Copa 2026').some((s) => s.name === 'Zayu'));
  assert.equal(findImpostorTheme('copa'), 'edição da Copa', '"copa" continua sendo o tema das edições');
  const sedes = SURVIVOR_LISTS.find((l) => l.id === 's-sedes-copa-2026')!;
  assert.equal(sedes.items.length, 16);
  const estadios = TOP10_LISTS.find((l) => l.id === 'estadios-copa-2026')!;
  assert.deepEqual(estadios.items.map((i) => i.rank), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const r16 = NEWS.find((n) => n.id === '2026-11-26c')!;
  const imp = newsOutgoing(r16, true);
  assert.ok(imp && imp.type === 'image' && imp.image.kind === 'textBoard' && imp.image.rows.length === 1, 'grupo só de Impostor vê o tema novo');
});
