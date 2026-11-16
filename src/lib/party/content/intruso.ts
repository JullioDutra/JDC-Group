/**
 * "Intruso": 5 nomes, 4 têm algo em comum e 1 não. Curadoria: o motivo tem
 * que ser verificável e estável (com data de corte quando puder mudar).
 */
export interface IntrusoSet {
  id: string;
  /** Os 4 que pertencem ao grupo. */
  members: string[];
  intruder: string;
  /** Justificativa mostrada no fim: o que os 4 têm em comum. */
  reason: string;
}

export const INTRUSO_SETS: IntrusoSet[] = [
  {
    id: 'penta-2002',
    members: ['Cafu', 'Roberto Carlos', 'Ronaldinho', 'Rivaldo'],
    intruder: 'Juninho Pernambucano',
    reason: 'Os outros quatro foram campeões da Copa de 2002. Juninho Pernambucano não estava no grupo do penta.',
  },
  {
    id: 'bola-de-ouro-br',
    members: ['Kaká', 'Ronaldinho', 'Rivaldo', 'Ronaldo'],
    intruder: 'Neymar',
    reason: 'Os outros quatro ganharam a Bola de Ouro (Ronaldo em 1997 e 2002, Rivaldo em 1999, Ronaldinho em 2005, Kaká em 2007). Neymar nunca ganhou.',
  },
  {
    id: 'real-madrid-br',
    members: ['Ronaldo', 'Kaká', 'Roberto Carlos', 'Marcelo'],
    intruder: 'Ronaldinho',
    reason: 'Os outros quatro jogaram no Real Madrid. Ronaldinho brilhou no rival, o Barcelona.',
  },
  {
    id: 'barcelona-br',
    members: ['Ronaldinho', 'Rivaldo', 'Romário', 'Ronaldo'],
    intruder: 'Kaká',
    reason: 'Os outros quatro jogaram no Barcelona. Kaká jogou no Milan e no Real Madrid, mas nunca no Barça.',
  },
  {
    id: 'goleiros-campeoes',
    members: ['Gilmar', 'Félix', 'Taffarel', 'Marcos'],
    intruder: 'Júlio César',
    reason: 'Os outros quatro foram goleiros titulares do Brasil em títulos de Copa (1958/62, 1970, 1994 e 2002). Júlio César nunca foi campeão do mundo.',
  },
  {
    id: 'flamengo',
    members: ['Zico', 'Romário', 'Adriano', 'Ronaldinho'],
    intruder: 'Pelé',
    reason: 'Os outros quatro jogaram no Flamengo. Pelé só jogou no Santos e no New York Cosmos.',
  },
  {
    id: 'santos',
    members: ['Pelé', 'Neymar', 'Robinho', 'Diego'],
    intruder: 'Kaká',
    reason: 'Os outros quatro foram revelados pelo Santos. Kaká foi revelado pelo São Paulo.',
  },
  {
    id: 'corinthians',
    members: ['Sócrates', 'Ronaldo', 'Tevez', 'Rivellino'],
    intruder: 'Romário',
    reason: 'Os outros quatro jogaram no Corinthians. Romário nunca vestiu a camisa do Timão.',
  },
  {
    id: 'tecnicos-campeoes',
    members: ['Feola', 'Zagallo', 'Parreira', 'Felipão'],
    intruder: 'Tite',
    reason: 'Os outros quatro foram técnicos do Brasil campeão do mundo (1958, 1970, 1994 e 2002). Tite não ganhou Copa.',
  },
  {
    id: 'bola-de-ouro-mundo',
    members: ['Messi', 'Cristiano Ronaldo', 'Modrić', 'Benzema'],
    intruder: 'Salah',
    reason: 'Os outros quatro ganharam a Bola de Ouro (Modrić em 2018, Benzema em 2022). Salah não tinha ganhado até 2025.',
  },
  {
    id: 'ingleses',
    members: ['Arsenal', 'Chelsea', 'Liverpool', 'Everton'],
    intruder: 'Celtic',
    reason: 'Os outros quatro são clubes ingleses. O Celtic é escocês, de Glasgow.',
  },
  {
    id: 'estadios-sp',
    members: ['Morumbi', 'Allianz Parque', 'Neo Química Arena', 'Pacaembu'],
    intruder: 'Vila Belmiro',
    reason: 'Os outros quatro ficam na cidade de São Paulo. A Vila Belmiro fica em Santos.',
  },
  {
    id: 'africanas',
    members: ['Nigéria', 'Camarões', 'Gana', 'Senegal'],
    intruder: 'Jamaica',
    reason: 'Os outros quatro são seleções africanas. A Jamaica fica no Caribe.',
  },
  {
    id: 'laterais-esquerdos',
    members: ['Roberto Carlos', 'Marcelo', 'Filipe Luís', 'Júnior'],
    intruder: 'Cafu',
    reason: 'Os outros quatro foram laterais-esquerdos. Cafu era lateral-direito.',
  },
  {
    id: 'campeoes-copa-2022',
    members: ['Brasil', 'Alemanha', 'Uruguai', 'Inglaterra'],
    intruder: 'Holanda',
    reason: 'Os outros quatro já tinham sido campeões do mundo até 2022. A Holanda perdeu três finais (1974, 1978 e 2010).',
  },
  {
    id: 'champions-2025',
    members: ['Real Madrid', 'Barcelona', 'Bayern', 'Liverpool'],
    intruder: 'Atlético de Madrid',
    reason: 'Os outros quatro já tinham ganhado a Champions até 2025. O Atlético de Madrid perdeu três finais (1974, 2014 e 2016).',
  },
];

export function getIntrusoSet(id: string): IntrusoSet | undefined {
  return INTRUSO_SETS.find((s) => s.id === id);
}
