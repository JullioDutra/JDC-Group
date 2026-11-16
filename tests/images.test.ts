import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLookup } from '../src/lib/ai';
import { lookupDemo } from '../src/lib/ai/demo';
import { handleMessage, handleTick } from '../src/lib/game/engine';
import type { Outgoing } from '../src/lib/game/types';
import { renderImage } from '../src/lib/images/render';
import { MemoryStore } from '../src/lib/store/memory';

/**
 * Renderiza de verdade (Satori) todas as imagens que uma partida de cada jogo
 * em grupo produz. Pega CSS que o Satori não aceita antes de chegar ao WhatsApp.
 */
test('todas as imagens do Modo em Grupo renderizam', { timeout: 300_000 }, async () => {
  const kinds = new Set<string>();
  for (const command of ['abrir sala 1', 'top 10 geral', 'abrir que time é esse', 'abrir quem é', 'abrir intruso', 'iniciar melhor time', 'abrir alfabeto', 'abrir chute certo', 'abrir emoji', 'abrir relampago', 'abrir bandeiraço', 'abrir sobrevivente', 'abrir conexões', 'abrir stop', 'abrir draft', 'abrir linha do tempo', 'abrir fato ou fake']) {
    const store = new MemoryStore();
    const G = `img-${command}@g.us`;
    let id = 0;
    const deps = { store, lookup: createLookup(store, lookupDemo), rng: () => 0 };
    const say = (who: string, text: string) =>
      handleMessage({ id: `m${++id}`, groupJid: G, senderJid: `${who}@s`, senderName: who, text }, deps);
    const outs: Outgoing[] = [];
    outs.push(...(await say('Ana', 'ativar jogos')));
    outs.push(...(await say('Ana', command)));
    outs.push(...(await say('Bia', command.includes('melhor time') ? 'aceitar' : 'entrar')));
    if (!command.includes('melhor time')) outs.push(...(await say('Ana', 'começar')));
    for (let i = 0; i < 16; i++) outs.push(...(await handleTick(G, null, deps, true)));
    for (const out of outs) {
      if (out.type !== 'image') continue;
      const png = await renderImage(out.image);
      assert.ok(png.length > 10_000, `${out.image.kind} gerou imagem vazia`);
      kinds.add(out.image.kind);
    }
  }
  for (const k of ['partyLobby', 'partyTable', 'top10Board', 'lineupQuiz', 'partyScore', 'intrusoBoard', 'draftBoard', 'flagQuiz', 'conexoesBoard', 'textBoard']) assert.ok(kinds.has(k), `não renderizou ${k}`);
});
