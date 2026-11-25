import type { Store } from '../store/types';

/**
 * Modo do grupo. O padrão é "todos os jogos" ("ativar jogos"). O admin pode
 * ativar um grupo que não é de futebol só com o Impostor ("ativar impostor"):
 * lá os outros jogos ficam desligados e, sem tema, o Impostor usa os temas
 * gerais. O modo fica guardado no armazenamento por grupo (group_seen), como
 * o bloqueio do "próxima": não precisa mexer no banco.
 */
export const GROUP_MODE_KIND = 'admin:modo';
const IMPOSTOR_ONLY = 'impostor';

export async function isImpostorOnly(store: Store, groupJid: string): Promise<boolean> {
  return (await store.getSeen(groupJid, GROUP_MODE_KIND).catch(() => [] as string[])).includes(IMPOSTOR_ONLY);
}

export async function setImpostorOnly(store: Store, groupJid: string, on: boolean): Promise<void> {
  if (on) await store.markSeen(groupJid, GROUP_MODE_KIND, [IMPOSTOR_ONLY]);
  else await store.unmarkSeen(groupJid, GROUP_MODE_KIND, [IMPOSTOR_ONLY]);
}

/** "ativar impostor", "ativar só o impostor", "ativar apenas impostor", "ativar modo impostor"... */
export const ACTIVATE_IMPOSTOR = /^ativar (so |somente |apenas |modo |o modo )?(o )?(jogo (do )?)?impostor( apenas| so)?$/;

/** Ajuda do grupo que só tem o Impostor (texto: a imagem de ajuda mostra todos os jogos). */
export const IMPOSTOR_GROUP_HELP = [
  '🕵️ *Impostor*: neste grupo só este jogo está ativo.',
  '',
  '*abrir impostor*: abre a sala (sem tema: temas gerais).',
  '*abrir impostor* + tema: *filmes*, *séries*, *lugares*, *animais*, *futebol*... (*temas do impostor* mostra todos).',
  '*entrar*: entra na sala · *começar*: o anfitrião começa (4 a 10 pessoas).',
  '*carta*: o bot manda o seu segredo de novo no privado.',
  '*mais tempo*: +30s no debate (até 2 vezes) · *votar*: o anfitrião pula o debate · *encerrar*: o anfitrião encerra.',
  '*2 impostores*: com 7 ou mais na mesa, o anfitrião liga o 2º impostor (um não sabe do outro; o grupo só vence pegando os dois).',
  '*regras*, *ranking* (top 10), *ranking b* (11º ao 20º), *campeoes*, *novidades*.',
].join('\n');
