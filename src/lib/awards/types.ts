export interface Nomination {
  id: string;
  groupJid: string;
  category: number | null;
  text: string;
  author: string;
  authorJid?: string;
  submittedBy: string;
  submittedName: string;
  sourceMessageId?: string;
  commandMessageId: string;
  fingerprint: string;
  createdAt: string;
}

export type NominationInput = Omit<Nomination, 'id'>;
export type NominationResult = 'saved' | 'duplicate' | 'inactive';
