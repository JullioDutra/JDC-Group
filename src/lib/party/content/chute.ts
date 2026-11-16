import type { ContentCategory } from '../../game/types';

/** Chute Certo: perguntas com resposta numérica exata e estável. */
export interface ChuteQuestion {
  id: string;
  category: ContentCategory;
  prompt: string;
  answer: number;
  /** Complemento mostrado na revelação ("gols", "pagantes"...). */
  unit?: string;
}

export const CHUTE_QUESTIONS: ChuteQuestion[] = [
  // Futebol: fundação de clubes (difícil de cravar)
  { id: 'c-fla', category: 'futebol', prompt: 'Em que ano o Flamengo foi fundado (como clube de regatas)?', answer: 1895 },
  { id: 'c-vasco', category: 'futebol', prompt: 'Em que ano o Vasco foi fundado?', answer: 1898 },
  { id: 'c-flu', category: 'futebol', prompt: 'Em que ano o Fluminense foi fundado?', answer: 1902 },
  { id: 'c-gremio', category: 'futebol', prompt: 'Em que ano o Grêmio foi fundado?', answer: 1903 },
  { id: 'c-atletico', category: 'futebol', prompt: 'Em que ano o Atlético-MG foi fundado?', answer: 1908 },
  { id: 'c-inter', category: 'futebol', prompt: 'Em que ano o Internacional foi fundado?', answer: 1909 },
  { id: 'c-corinthians', category: 'futebol', prompt: 'Em que ano o Corinthians foi fundado?', answer: 1910 },
  { id: 'c-santos', category: 'futebol', prompt: 'Em que ano o Santos foi fundado?', answer: 1912 },
  { id: 'c-palmeiras', category: 'futebol', prompt: 'Em que ano o Palmeiras foi fundado (como Palestra Itália)?', answer: 1914 },
  { id: 'c-cruzeiro', category: 'futebol', prompt: 'Em que ano o Cruzeiro foi fundado (como Palestra Itália)?', answer: 1921 },
  { id: 'c-saopaulo', category: 'futebol', prompt: 'Em que ano o São Paulo foi fundado?', answer: 1930 },
  // Futebol: números de Copa e estádios
  { id: 'c-copa-1', category: 'futebol', prompt: 'Em que ano foi disputada a primeira Copa do Mundo?', answer: 1930 },
  { id: 'c-maracana', category: 'futebol', prompt: 'Em que ano o Maracanã foi inaugurado?', answer: 1950 },
  { id: 'c-maracanazo', category: 'futebol', prompt: 'Quantos pagantes teve a final de 1950 (Brasil x Uruguai), segundo o público oficial?', answer: 173850, unit: 'pagantes' },
  { id: 'c-copas-br', category: 'futebol', prompt: 'Quantas Copas do Mundo o Brasil disputou até 2026 (contando todas)?', answer: 23, unit: 'Copas' },
  { id: 'c-selecoes-2026', category: 'futebol', prompt: 'Quantas seleções disputaram a Copa de 2026?', answer: 48, unit: 'seleções' },
  { id: 'c-milesimo', category: 'futebol', prompt: 'Em que ano Pelé marcou o milésimo gol?', answer: 1969 },
  { id: 'c-muller', category: 'futebol', prompt: 'Quantos gols Gerd Müller marcou em Copas do Mundo?', answer: 14, unit: 'gols' },
  { id: 'c-real-ucl', category: 'futebol', prompt: 'Quantas Champions League o Real Madrid tinha ganhado até 2026?', answer: 15, unit: 'títulos' },
  { id: 'c-messi-bolas', category: 'futebol', prompt: 'Quantas Bolas de Ouro Messi ganhou?', answer: 8, unit: 'Bolas de Ouro' },
  { id: 'c-ronaldo-2002', category: 'futebol', prompt: 'Quantos gols Ronaldo marcou na Copa de 2002?', answer: 8, unit: 'gols' },
  { id: 'c-fontaine', category: 'futebol', prompt: 'Quantos gols Just Fontaine marcou na Copa de 1958 (recorde em uma só Copa)?', answer: 13, unit: 'gols' },
  { id: 'c-ceni', category: 'futebol', prompt: 'Quantos gols Rogério Ceni marcou na carreira?', answer: 131, unit: 'gols' },
  // História
  { id: 'c-cabral', category: 'historia', prompt: 'Em que ano a esquadra de Cabral chegou ao Brasil?', answer: 1500 },
  { id: 'c-independencia', category: 'historia', prompt: 'Em que ano foi a Independência do Brasil?', answer: 1822 },
  { id: 'c-aurea', category: 'historia', prompt: 'Em que ano foi assinada a Lei Áurea?', answer: 1888 },
  { id: 'c-republica', category: 'historia', prompt: 'Em que ano foi proclamada a República no Brasil?', answer: 1889 },
  { id: 'c-brasilia', category: 'historia', prompt: 'Em que ano Brasília foi inaugurada?', answer: 1960 },
  { id: 'c-lua', category: 'historia', prompt: 'Em que ano o ser humano pisou na Lua pela primeira vez?', answer: 1969 },
  { id: 'c-muro', category: 'historia', prompt: 'Em que ano caiu o Muro de Berlim?', answer: 1989 },
  { id: 'c-2guerra', category: 'historia', prompt: 'Em que ano terminou a Segunda Guerra Mundial?', answer: 1945 },
  { id: 'c-tiradentes', category: 'historia', prompt: 'Em que ano Tiradentes foi executado?', answer: 1792 },
  // Política
  { id: 'c-golpe', category: 'politica', prompt: 'Em que ano começou a ditadura militar no Brasil?', answer: 1964 },
  { id: 'c-ai5', category: 'politica', prompt: 'Em que ano foi decretado o AI-5?', answer: 1968 },
  { id: 'c-diretas', category: 'politica', prompt: 'Em que ano foi o movimento Diretas Já?', answer: 1984 },
  { id: 'c-constituicao', category: 'politica', prompt: 'Em que ano foi promulgada a Constituição atual?', answer: 1988 },
  { id: 'c-real', category: 'politica', prompt: 'Em que ano foi lançado o Plano Real?', answer: 1994 },
  { id: 'c-constituicoes', category: 'politica', prompt: 'Quantas Constituições o Brasil já teve?', answer: 7, unit: 'Constituições' },
  { id: 'c-deputados', category: 'politica', prompt: 'Quantos deputados federais tem a Câmara?', answer: 513, unit: 'deputados' },
  { id: 'c-senadores', category: 'politica', prompt: 'Quantos senadores tem o Senado?', answer: 81, unit: 'senadores' },
  { id: 'c-lula-2022', category: 'politica', prompt: 'Quantos milhões de votos Lula teve no 2º turno de 2022 (arredonde)?', answer: 60, unit: 'milhões (60,3 mi)' },
  { id: 'c-bolsonaro-2022', category: 'politica', prompt: 'Quantos milhões de votos Bolsonaro teve no 2º turno de 2022 (arredonde)?', answer: 58, unit: 'milhões (58,2 mi)' },
  { id: 'c-impeachment-dilma', category: 'politica', prompt: 'Em que ano Dilma Rousseff sofreu impeachment?', answer: 2016 },
  { id: 'c-onu', category: 'politica', prompt: 'Quantos países são membros da ONU?', answer: 193, unit: 'países' },
  // Geral
  { id: 'c-everest', category: 'geral', prompt: 'Qual a altitude do Everest, em metros?', answer: 8849, unit: 'metros' },
  { id: 'c-cristo', category: 'geral', prompt: 'Qual a altura da estátua do Cristo Redentor, sem o pedestal, em metros?', answer: 30, unit: 'metros' },
  { id: 'c-ossos', category: 'geral', prompt: 'Quantos ossos tem o corpo humano adulto?', answer: 206, unit: 'ossos' },
  { id: 'c-lua-km', category: 'geral', prompt: 'Qual a distância média da Terra à Lua, em km?', answer: 384400, unit: 'km' },
  { id: 'c-estados', category: 'geral', prompt: 'Quantos estados tem o Brasil (sem contar o Distrito Federal)?', answer: 26, unit: 'estados' },
  { id: 'c-mg-municipios', category: 'geral', prompt: 'Quantos municípios tem Minas Gerais?', answer: 853, unit: 'municípios' },
];

export function getChute(id: string): ChuteQuestion | undefined {
  return CHUTE_QUESTIONS.find((q) => q.id === id);
}
