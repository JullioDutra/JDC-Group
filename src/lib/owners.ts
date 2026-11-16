/**
 * Números de administrador: só eles ativam/desativam o bot em um grupo.
 * Como o comando "ativar grupo" é mandado de dentro do grupo, o admin
 * precisa estar no grupo para ativá-lo. Pode ativar quantos grupos quiser.
 *
 * ADMIN_NUMBERS (ou OWNER_NUMBERS, nome antigo): números com DDI, só dígitos,
 * separados por vírgula. Ex.: "5511999998888,5521988887777".
 */
export function adminNumbers(): string[] {
  return (process.env.ADMIN_NUMBERS || process.env.OWNER_NUMBERS || '')
    .split(',')
    .map((n) => n.replace(/\D/g, ''))
    .filter(Boolean);
}

export function isAdminJid(jid: string, admins: string[] = adminNumbers()): boolean {
  return admins.includes(jid.split('@')[0].replace(/\D/g, ''));
}

/**
 * Regra de produção (webhook): sem admin configurado, NINGUÉM ativa grupos.
 * Isso protege o número herdado do RPG, que está em vários grupos antigos.
 */
export function ownerCheck(): (senderJid: string) => boolean {
  const admins = adminNumbers();
  return (jid) => admins.length > 0 && isAdminJid(jid, admins);
}
