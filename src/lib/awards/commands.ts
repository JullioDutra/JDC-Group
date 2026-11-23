import { createHash } from 'node:crypto';
import type { IncomingMessage, Outgoing } from '../game/types';
import { normalize } from '../game/text';
import type { Store } from '../store/types';
import { AWARD_CATEGORIES, categoryLabel } from './categories';

const reply = (text: string): Outgoing[] => [{ type: 'text', text }];
const PAGE_SIZE = 5;
const canonical = (value: string) => value.normalize('NFC').toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ').trim();
const usage = 'Responda a uma mensagem com *indicar mensagem* ou envie *indicar "texto" "autor"*. Categoria opcional no final: *categoria 10*. Veja *ajuda melhores do ano*.';

export function awardsHelp(): string {
  return [
    '🏆 *Melhores do Ano 2026 — indicações da reta final*',
    '• Respondendo à mensagem original: *indicar mensagem*',
    '• Manualmente: *indicar "texto" "autor"*',
    '• Com categoria: *indicar mensagem categoria 10* ou *indicar "texto" "autor" categoria 10*',
    '• Consultar: *indicações melhores do ano* (ou *indicações melhores do ano 2* para a página 2)',
    'Sem categoria, a indicação fica *a classificar*. Para prêmios por pessoa, use o motivo como texto; para nome do grupo, use o nome como texto e quem sugeriu como autor.',
    'Respostas guardam o texto, autor e ID da mensagem original. Indicações manuais são declarações de quem enviou, sem comprovação automática. Prints e mídia não são importados.',
    '*Admin do bot:*',
    '• *ativar melhores do ano* — abre a coleta neste grupo',
    '• *desativar melhores do ano* — fecha a coleta e preserva as indicações',
    '• *classificar indicação ID categoria 10* — define/corrige a categoria',
    '*Categorias do dossiê:*',
    ...AWARD_CATEGORIES.map(([name, mode], i) => `${i + 1}. ${name} — ${mode}`),
  ].join('\n');
}

/** null = não é comando do módulo; [] = comando consumido silenciosamente. */
export async function handleAwards(
  msg: IncomingMessage, store: Store, manager: boolean, now: Date,
): Promise<Outgoing[] | null> {
  const norm = normalize(msg.text);
  const toggle = /^(ativar|desativar) melhores do ano$/.exec(norm);
  if (toggle) {
    if (!manager) return reply('Só o admin do bot pode ativar ou desativar Melhores do Ano.');
    const active = toggle[1] === 'ativar';
    await store.setAwardsActive(msg.groupJid, active, msg.senderJid);
    return reply(active
      ? '🏆 Indicações de *Melhores do Ano* abertas neste grupo. Comandos em *ajuda melhores do ano*.'
      : 'Indicações de *Melhores do Ano* encerradas. O histórico foi preservado.');
  }
  if (norm === 'ajuda melhores do ano') return reply(awardsHelp());
  const list = /^indicacoes melhores do ano(?: (\d+))?$/.exec(norm);
  if (list) {
    const page = Number(list[1] ?? 1);
    if (!Number.isSafeInteger(page) || page < 1 || page > 100000) return reply('Informe uma página de 1 a 100000.');
    const rows = await store.listNominations(msg.groupJid, PAGE_SIZE + 1, (page - 1) * PAGE_SIZE);
    const active = await store.isAwardsActive(msg.groupJid);
    if (!rows.length) return reply(`Melhores do Ano — coleta ${active ? 'aberta' : 'fechada'}. Nenhuma indicação nesta página.`);
    return reply([
      `🏆 *Melhores do Ano — página ${page}* · coleta ${active ? 'aberta' : 'fechada'}`,
      ...rows.slice(0, PAGE_SIZE).map(n => `*#${n.id} · ${categoryLabel(n.category)}*\n“${n.text}”\nAutor: ${n.author}\nIndicado por: ${n.submittedName} · ${new Date(n.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\nOrigem: ${n.sourceMessageId ? 'mensagem respondida' : 'declaração manual'}`),
      ...(rows.length > PAGE_SIZE ? [`Próxima: *indicações melhores do ano ${page + 1}*`] : []),
    ].join('\n\n'));
  }
  if (/^classificar indicacao(?: |$)/.test(norm)) {
    if (!manager) return reply('Só o admin do bot classifica indicações.');
    const match = /^classificar indicacao ([a-z0-9-]+) categoria (\d+)$/.exec(norm);
    const category = match ? Number(match[2]) : 0;
    if (!match || category < 1 || category > AWARD_CATEGORIES.length) return reply('Use *classificar indicação ID categoria N*, com N de 1 a 22.');
    const changed = await store.classifyNomination(msg.groupJid, match[1], category);
    return reply(changed ? `Indicação #${match[1]} classificada: *${categoryLabel(category)}*.` : 'Indicação não encontrada neste grupo.');
  }
  if (!/^indicar(?: |$)/.test(norm)) return null;
  // Consome mesmo desligado: nunca vira resposta de uma partida em andamento.
  if (!(await store.isAwardsActive(msg.groupJid))) return [];

  const raw = msg.text.trim().replace(/[“”]/g, '"');
  const quoted = /^indicar\s+mensagem(?:\s+categoria\s+(\d+))?$/i.exec(raw);
  const manual = /^indicar\s+"([^"\n]+)"\s+"([^"\n]+)"(?:\s+categoria\s+(\d+))?$/i.exec(raw);
  if (!quoted && !manual) return reply(usage);
  const categoryText = quoted?.[1] ?? manual?.[3];
  const category = categoryText === undefined ? null : Number(categoryText);
  if (category !== null && (category < 1 || category > AWARD_CATEGORIES.length)) return reply('Categoria inválida. Use um número de 1 a 22; consulte *ajuda melhores do ano*.');
  if (quoted && (!msg.quotedText?.trim() || !msg.quotedParticipant || !msg.quotedMessageId)) {
    return reply('Não recebi texto e autor da mensagem original. Use Responder sobre uma mensagem de texto ou envie *indicar "texto" "autor"*.');
  }
  const content = (quoted ? msg.quotedText! : manual![1]).trim();
  const author = (quoted ? (msg.quotedAuthorName?.trim() || `@${msg.quotedParticipant!.split('@')[0]}`) : manual![2]).trim();
  if (!content || !author || content.length > 1000 || author.length > 120) return reply('Informe texto de 1 a 1000 caracteres e autor de 1 a 120 caracteres.');
  // Uma mesma prova entra uma vez, independentemente de quem indicou ou da categoria.
  // A categoria pode ser ajustada depois pelo admin, sem quebrar a deduplicação.
  const fingerprint = createHash('sha256').update(JSON.stringify(quoted
    ? ['quote', msg.quotedMessageId]
    : ['manual', canonical(content), canonical(author)])).digest('hex');
  const result = await store.addNomination({
    groupJid: msg.groupJid, category, text: content, author,
    authorJid: quoted ? msg.quotedParticipant : undefined,
    submittedBy: msg.senderJid, submittedName: msg.senderName,
    sourceMessageId: quoted ? msg.quotedMessageId : undefined,
    commandMessageId: msg.id, fingerprint, createdAt: now.toISOString(),
  });
  if (result === 'inactive') return reply('A coleta foi encerrada pelo admin. Esta indicação não foi registrada.');
  if (result === 'duplicate') return reply('Essa indicação já foi registrada neste grupo.');
  return reply(`🏆 Indicação registrada: *${categoryLabel(category)}*.\nAutor: ${author}\n“${content}”`);
}
