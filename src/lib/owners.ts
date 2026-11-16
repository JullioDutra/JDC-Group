/**
 * OWNER_NUMBERS: lista de números (só dígitos, com DDI) que podem mandar
 * "ativar grupo"/"desativar grupo". Ex.: "5511999998888,5521988887777".
 * Vazio = qualquer pessoa pode (útil em testes).
 */
export function ownerCheck(): ((senderJid: string) => boolean) | undefined {
  const owners = (process.env.OWNER_NUMBERS ?? '')
    .split(',')
    .map((n) => n.replace(/\D/g, ''))
    .filter(Boolean);
  if (owners.length === 0) return undefined;
  return (jid) => owners.includes(jid.split('@')[0].replace(/\D/g, ''));
}
