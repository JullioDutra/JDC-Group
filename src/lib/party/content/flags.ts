import type { FlagSpec } from '../../game/types';

/**
 * Bandeiraço: bandeiras desenhadas só com formas (sem brasões, estrelas ou
 * escudos). Ficam de fora as que viram iguais a outra sem o brasão
 * (Equador x Colômbia, Paraguai x Países Baixos, Chade x Romênia, Indonésia x Mônaco, Egito x Iêmen...).
 */
export interface FlagCard {
  id: string;
  region: 'sul' | 'europa' | 'mundo';
  answer: string;
  aliases?: string[];
  flag: FlagSpec;
  /** Observação mostrada na revelação. */
  note?: string;
}

const W = '#FFFFFF';
const K = '#000000';

const stripes = (dir: 'h' | 'v', colors: string[], weights?: number[]): FlagSpec => ({ dir, colors, ...(weights ? { weights } : {}) });
const alternate = (n: number, a: string, b: string) => Array.from({ length: n }, (_, i) => (i % 2 === 0 ? a : b));

export const FLAGS: FlagCard[] = [
  // América do Sul
  { id: 'f-brasil', region: 'sul', answer: 'Brasil', flag: { ...stripes('h', ['#009C3B']), diamond: { color: '#FFDF00' }, circle: { color: '#002776', size: 0.42 } } },
  { id: 'f-argentina', region: 'sul', answer: 'Argentina', flag: { ...stripes('h', ['#74ACDF', W, '#74ACDF']), circle: { color: '#F6B40E', size: 0.2 } } },
  {
    id: 'f-uruguai', region: 'sul', answer: 'Uruguai',
    flag: { ...stripes('h', alternate(9, W, '#0038A8')), canton: { flag: { ...stripes('h', [W]), circle: { color: '#FCD116', size: 0.55 } }, width: 0.36, height: 5 / 9 } },
  },
  { id: 'f-chile', region: 'sul', answer: 'Chile', note: 'sem a estrela', flag: { ...stripes('h', [W, '#D52B1E']), canton: { flag: stripes('h', ['#0039A6']), width: 1 / 3, height: 0.5 } } },
  { id: 'f-colombia', region: 'sul', answer: 'Colômbia', aliases: ['colombia'], flag: stripes('h', ['#FCD116', '#003893', '#CE1126'], [2, 1, 1]) },
  { id: 'f-peru', region: 'sul', answer: 'Peru', flag: stripes('v', ['#D91023', W, '#D91023']) },
  { id: 'f-bolivia', region: 'sul', answer: 'Bolívia', aliases: ['bolivia'], flag: stripes('h', ['#D52B1E', '#F9E300', '#007934']) },

  // Europa
  { id: 'f-franca', region: 'europa', answer: 'França', aliases: ['franca'], flag: stripes('v', ['#0055A4', W, '#EF4135']) },
  { id: 'f-italia', region: 'europa', answer: 'Itália', aliases: ['italia'], flag: stripes('v', ['#009246', W, '#CE2B37']) },
  { id: 'f-irlanda', region: 'europa', answer: 'Irlanda', flag: stripes('v', ['#169B62', W, '#FF883E']) },
  { id: 'f-alemanha', region: 'europa', answer: 'Alemanha', flag: stripes('h', [K, '#DD0000', '#FFCE00']) },
  { id: 'f-belgica', region: 'europa', answer: 'Bélgica', aliases: ['belgica'], flag: stripes('v', [K, '#FDDA24', '#EF3340']) },
  { id: 'f-holanda', region: 'europa', answer: 'Países Baixos', aliases: ['holanda', 'paises baixos'], flag: stripes('h', ['#AE1C28', W, '#21468B']) },
  { id: 'f-russia', region: 'europa', answer: 'Rússia', aliases: ['russia'], flag: stripes('h', [W, '#0039A6', '#D52B1E']) },
  { id: 'f-austria', region: 'europa', answer: 'Áustria', aliases: ['austria'], flag: stripes('h', ['#ED2939', W, '#ED2939']) },
  { id: 'f-polonia', region: 'europa', answer: 'Polônia', aliases: ['polonia'], flag: stripes('h', [W, '#DC143C']) },
  { id: 'f-ucrania', region: 'europa', answer: 'Ucrânia', aliases: ['ucrania'], flag: stripes('h', ['#0057B7', '#FFD700']) },
  { id: 'f-hungria', region: 'europa', answer: 'Hungria', flag: stripes('h', ['#CE2939', W, '#477050']) },
  { id: 'f-bulgaria', region: 'europa', answer: 'Bulgária', aliases: ['bulgaria'], flag: stripes('h', [W, '#00966E', '#D62612']) },
  { id: 'f-lituania', region: 'europa', answer: 'Lituânia', aliases: ['lituania'], flag: stripes('h', ['#FDB913', '#006A44', '#C1272D']) },
  { id: 'f-estonia', region: 'europa', answer: 'Estônia', aliases: ['estonia'], flag: stripes('h', ['#0072CE', K, W]) },
  { id: 'f-letonia', region: 'europa', answer: 'Letônia', aliases: ['letonia'], flag: stripes('h', ['#9E3039', W, '#9E3039'], [2, 1, 2]) },
  { id: 'f-armenia', region: 'europa', answer: 'Armênia', aliases: ['armenia'], flag: stripes('h', ['#D90012', '#0033A0', '#F2A800']) },
  { id: 'f-espanha', region: 'europa', answer: 'Espanha', note: 'sem o brasão', flag: stripes('h', ['#AA151B', '#F1BF00', '#AA151B'], [1, 2, 1]) },
  { id: 'f-portugal', region: 'europa', answer: 'Portugal', note: 'sem o brasão', flag: stripes('v', ['#006600', '#FF0000'], [2, 3]) },
  { id: 'f-suecia', region: 'europa', answer: 'Suécia', aliases: ['suecia'], flag: { ...stripes('h', ['#006AA7']), cross: { kind: 'nordic', color: '#FECC00' } } },
  { id: 'f-noruega', region: 'europa', answer: 'Noruega', flag: { ...stripes('h', ['#BA0C2F']), cross: { kind: 'nordic', color: '#00205B', outline: W } } },
  { id: 'f-dinamarca', region: 'europa', answer: 'Dinamarca', flag: { ...stripes('h', ['#C8102E']), cross: { kind: 'nordic', color: W } } },
  { id: 'f-finlandia', region: 'europa', answer: 'Finlândia', aliases: ['finlandia'], flag: { ...stripes('h', [W]), cross: { kind: 'nordic', color: '#002F6C' } } },
  { id: 'f-islandia', region: 'europa', answer: 'Islândia', aliases: ['islandia'], flag: { ...stripes('h', ['#02529C']), cross: { kind: 'nordic', color: '#DC1E35', outline: W } } },
  { id: 'f-suica', region: 'europa', answer: 'Suíça', aliases: ['suica'], flag: { ...stripes('h', ['#DA291C']), cross: { kind: 'plus', color: W } } },
  { id: 'f-inglaterra', region: 'europa', answer: 'Inglaterra', flag: { ...stripes('h', [W]), cross: { kind: 'center', color: '#CE1124' } } },
  {
    id: 'f-grecia', region: 'europa', answer: 'Grécia', aliases: ['grecia'],
    flag: { ...stripes('h', alternate(9, '#0D5EAF', W)), canton: { flag: { ...stripes('h', ['#0D5EAF']), cross: { kind: 'center', color: W } }, width: 0.37, height: 5 / 9 } },
  },

  // Mundo
  { id: 'f-japao', region: 'mundo', answer: 'Japão', aliases: ['japao'], flag: { ...stripes('h', [W]), circle: { color: '#BC002D', size: 0.6 } } },
  { id: 'f-bangladesh', region: 'mundo', answer: 'Bangladesh', flag: { ...stripes('h', ['#006A4E']), circle: { color: '#F42A41', cx: 0.45, size: 0.66 } } },
  { id: 'f-palau', region: 'mundo', answer: 'Palau', flag: { ...stripes('h', ['#4AADD6']), circle: { color: '#FFDE00', cx: 0.45, size: 0.6 } } },
  { id: 'f-laos', region: 'mundo', answer: 'Laos', flag: { ...stripes('h', ['#CE1126', '#002868', '#CE1126'], [1, 2, 1]), circle: { color: W, size: 0.4 } } },
  { id: 'f-india', region: 'mundo', answer: 'Índia', aliases: ['india'], note: 'a roda no centro tem 24 raios', flag: { ...stripes('h', ['#FF9933', W, '#138808']), circle: { color: '#000080', size: 0.2 } } },
  { id: 'f-niger', region: 'mundo', answer: 'Níger', aliases: ['niger'], flag: { ...stripes('h', ['#E05206', W, '#0DB02B']), circle: { color: '#E05206', size: 0.22 } } },
  { id: 'f-nigeria', region: 'mundo', answer: 'Nigéria', aliases: ['nigeria'], flag: stripes('v', ['#008751', W, '#008751']) },
  { id: 'f-costa-marfim', region: 'mundo', answer: 'Costa do Marfim', aliases: ['costa do marfim'], note: 'é a da Irlanda ao contrário', flag: stripes('v', ['#F77F00', W, '#009E60']) },
  { id: 'f-mali', region: 'mundo', answer: 'Mali', flag: stripes('v', ['#14B53A', '#FCD116', '#CE1126']) },
  { id: 'f-guine', region: 'mundo', answer: 'Guiné', aliases: ['guine', 'guine conacri'], note: 'é a do Mali ao contrário', flag: stripes('v', ['#CE1126', '#FCD116', '#009460']) },
  { id: 'f-gabao', region: 'mundo', answer: 'Gabão', aliases: ['gabao'], flag: stripes('h', ['#009E60', '#FCD116', '#3A75C4']) },
  { id: 'f-serra-leoa', region: 'mundo', answer: 'Serra Leoa', flag: stripes('h', ['#1EB53A', W, '#0072C6']) },
  { id: 'f-iemen', region: 'mundo', answer: 'Iêmen', aliases: ['iemen'], flag: stripes('h', ['#CE1126', W, K]) },
  { id: 'f-tailandia', region: 'mundo', answer: 'Tailândia', aliases: ['tailandia'], flag: stripes('h', ['#A51931', '#F4F5F8', '#2D2A4A', '#F4F5F8', '#A51931'], [1, 1, 2, 1, 1]) },
  { id: 'f-costa-rica', region: 'mundo', answer: 'Costa Rica', note: 'sem o brasão', flag: stripes('h', ['#002B7F', W, '#CE1126', W, '#002B7F'], [1, 1, 2, 1, 1]) },
  { id: 'f-mauricio', region: 'mundo', answer: 'Maurício', aliases: ['mauricio', 'ilhas mauricio'], flag: stripes('h', ['#EA2839', '#1A206D', '#FFD500', '#00A551']) },
  { id: 'f-gambia', region: 'mundo', answer: 'Gâmbia', aliases: ['gambia'], flag: stripes('h', ['#CE1126', W, '#0C1C8C', W, '#3A7728'], [6, 1, 4, 1, 6]) },
  { id: 'f-botsuana', region: 'mundo', answer: 'Botsuana', aliases: ['botswana'], flag: stripes('h', ['#75AADB', W, K, W, '#75AADB'], [9, 1, 4, 1, 9]) },
  { id: 'f-tchequia', region: 'mundo', answer: 'Tchéquia', aliases: ['tchequia', 'republica tcheca', 'tcheca'], flag: { ...stripes('h', [W, '#D7141A']), triangle: { color: '#11457E', depth: 0.5 } } },
  { id: 'f-filipinas', region: 'mundo', answer: 'Filipinas', note: 'sem o sol e as estrelas', flag: { ...stripes('h', ['#0038A8', '#CE1126']), triangle: { color: W, depth: 0.43 } } },
  { id: 'f-cuba', region: 'mundo', answer: 'Cuba', note: 'sem a estrela', flag: { ...stripes('h', alternate(5, '#002A8F', W)), triangle: { color: '#CF142B', depth: 0.43 } } },
  { id: 'f-porto-rico', region: 'mundo', answer: 'Porto Rico', note: 'sem a estrela; é a de Cuba com as cores trocadas', flag: { ...stripes('h', alternate(5, '#ED0000', W)), triangle: { color: '#0050F0', depth: 0.43 } } },
  { id: 'f-bahamas', region: 'mundo', answer: 'Bahamas', flag: { ...stripes('h', ['#00778B', '#FFC72C', '#00778B']), triangle: { color: K, depth: 0.4 } } },
  { id: 'f-palestina', region: 'mundo', answer: 'Palestina', flag: { ...stripes('h', [K, W, '#007A3D']), triangle: { color: '#CE1126', depth: 0.33 } } },
  { id: 'f-emirados', region: 'mundo', answer: 'Emirados Árabes Unidos', aliases: ['emirados', 'emirados arabes', 'eau'], flag: { ...stripes('h', ['#00732F', W, K]), hoist: { color: '#FF0000', width: 0.25 } } },
];

export function getFlag(id: string): FlagCard | undefined {
  return FLAGS.find((f) => f.id === id);
}
