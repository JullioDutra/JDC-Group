/**
 * Números de administrador: só eles ativam/desativam o bot em um grupo.
 * Como o comando "ativar jogos" é mandado de dentro do grupo, o admin
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

/**
 * Forma canônica de um número brasileiro: com DDI 55 e sem o 9º dígito do
 * celular. O WhatsApp identifica muitas contas antigas sem o 9
 * (556293259733), enquanto a pessoa digita com ele (62993259733).
 */
export function canonicalNumber(raw: string): string {
  let n = raw.replace(/\D/g, '');
  if (n.length === 10 || n.length === 11) n = `55${n}`; // sem DDI
  if (n.startsWith('55') && n.length === 13 && n[4] === '9') n = n.slice(0, 4) + n.slice(5);
  return n;
}

export function isAdminJid(jid: string, admins: string[] = adminNumbers()): boolean {
  const sender = canonicalNumber(jid.split('@')[0].split(':')[0]);
  return admins.some((a) => canonicalNumber(a) === sender);
}

/**
 * Regra de produção (webhook): sem admin configurado, NINGUÉM ativa grupos.
 * Isso protege o número herdado do RPG, que está em vários grupos antigos.
 */
export function ownerCheck(): (senderJid: string) => boolean {
  const admins = adminNumbers();
  return (jid) => admins.length > 0 && isAdminJid(jid, admins);
}
