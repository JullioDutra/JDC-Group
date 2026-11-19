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
  // Geral (lote 2)
  { id: 'c-g-paises-sul', category: 'geral', prompt: 'Quantos países tem a América do Sul?', answer: 12, unit: 'países' },
  { id: 'c-g-dentes', category: 'geral', prompt: 'Quantos dentes tem a dentição completa de um adulto?', answer: 32, unit: 'dentes' },
  { id: 'c-g-luz', category: 'geral', prompt: 'Qual a velocidade da luz no vácuo, em km por segundo (arredonde)?', answer: 299792, unit: 'km/s' },
  { id: 'c-g-maratona', category: 'geral', prompt: 'Quantos metros tem uma maratona?', answer: 42195, unit: 'metros' },
  { id: 'c-g-eiffel', category: 'historia', prompt: 'Em que ano a Torre Eiffel foi inaugurada?', answer: 1889 },
  { id: 'c-g-eua', category: 'geral', prompt: 'Quantos estados têm os Estados Unidos?', answer: 50, unit: 'estados' },
  { id: 'c-g-censo', category: 'geral', prompt: 'Quantos milhões de habitantes o Brasil tinha no Censo 2022 (arredonde)?', answer: 203, unit: 'milhões (203,1 mi)' },
  { id: 'c-g-piano', category: 'geral', prompt: 'Quantas teclas tem um piano padrão?', answer: 88, unit: 'teclas' },
  { id: 'c-g-sp', category: 'historia', prompt: 'Em que ano foi fundada a cidade de São Paulo?', answer: 1554 },
  { id: 'c-g-cem-anos', category: 'historia', prompt: 'Quantos anos durou, de fato, a Guerra dos Cem Anos?', answer: 116, unit: 'anos' },
  { id: 'c-g-tabela', category: 'geral', prompt: 'Quantos elementos tem a tabela periódica (até 2025)?', answer: 118, unit: 'elementos' },
  { id: 'c-g-potter', category: 'geral', prompt: 'Em que ano saiu o primeiro livro de Harry Potter?', answer: 1997 },
  { id: 'c-g-wright', category: 'historia', prompt: 'Em que ano foi o primeiro voo dos irmãos Wright?', answer: 1903 },
  { id: 'c-g-minutos', category: 'geral', prompt: 'Quantos minutos tem um dia?', answer: 1440, unit: 'minutos' },
  { id: 'c-g-xadrez', category: 'geral', prompt: 'Quantas casas tem um tabuleiro de xadrez?', answer: 64, unit: 'casas' },
  { id: 'c-g-ue', category: 'politica', prompt: 'Quantos países fazem parte da União Europeia (desde o Brexit)?', answer: 27, unit: 'países' },
  { id: 'c-g-beethoven', category: 'geral', prompt: 'Quantas sinfonias Beethoven compôs?', answer: 9, unit: 'sinfonias' },
  { id: 'c-g-mandela', category: 'historia', prompt: 'Quantos anos Nelson Mandela passou preso?', answer: 27, unit: 'anos' },
  { id: 'c-g-gama', category: 'historia', prompt: 'Em que ano Vasco da Gama chegou à Índia?', answer: 1498 },
  { id: 'c-g-rugby', category: 'geral', prompt: 'Quantos jogadores um time de rúgbi (union) tem em campo?', answer: 15, unit: 'jogadores' },
  { id: 'c-g-estrelas', category: 'geral', prompt: 'Quantas estrelas tem a bandeira do Brasil?', answer: 27, unit: 'estrelas' },
  { id: 'c-g-ponte', category: 'geral', prompt: 'Quantos quilômetros tem a Ponte Rio-Niterói (arredonde)?', answer: 13, unit: 'km (13,3 km)' },
  // 2025-2026 (pesquisa de 18/11/2026)
  { id: 'c-gols-copa-2026', category: 'futebol', prompt: 'Quantos gols teve a Copa do Mundo de 2026?', answer: 308, unit: 'gols' },
  { id: 'c-jogos-copa-2026', category: 'futebol', prompt: 'Quantos jogos teve a Copa do Mundo de 2026?', answer: 104, unit: 'jogos' },
  { id: 'c-mbappe-copas', category: 'futebol', prompt: 'Quantos gols Mbappé tem em Copas do Mundo (até 2026)?', answer: 22, unit: 'gols' },
  { id: 'c-messi-copas', category: 'futebol', prompt: 'Quantos gols Messi tem em Copas do Mundo (até 2026)?', answer: 21, unit: 'gols' },
  { id: 'c-minuto-2026', category: 'futebol', prompt: 'Em que minuto Ferran Torres fez o gol do título da Espanha na final de 2026?', answer: 106, unit: 'minutos' },
  { id: 'c-kaio-jorge', category: 'futebol', prompt: 'Quantos gols Kaio Jorge fez no Brasileirão 2025, quando foi o artilheiro?', answer: 21, unit: 'gols' },
  { id: 'c-psg-titulos', category: 'futebol', prompt: 'Quantos títulos franceses o PSG tinha depois da temporada 2025/26?', answer: 14, unit: 'títulos' },
  { id: 'c-inter-scudetti', category: 'futebol', prompt: 'Quantos títulos italianos a Inter tinha depois da temporada 2025/26?', answer: 21, unit: 'títulos' },
  { id: 'c-bayern-titulos', category: 'futebol', prompt: 'Quantos títulos alemães o Bayern tinha depois da temporada 2025/26?', answer: 35, unit: 'títulos' },
  { id: 'c-azteca-2026', category: 'futebol', prompt: 'Quantos torcedores viram a abertura da Copa de 2026 no Azteca (México 2 x 0 África do Sul)?', answer: 80824, unit: 'torcedores' },
  { id: 'c-real-laliga', category: 'futebol', prompt: 'Quantos títulos espanhóis o Real Madrid tinha até 2025/26?', answer: 36, unit: 'títulos' },
  { id: 'c-cr7-ucl', category: 'futebol', prompt: 'Quantos gols Cristiano Ronaldo marcou na Champions League?', answer: 140, unit: 'gols' },
  { id: 'c-lula-2026', category: 'politica', prompt: 'Com quantos por cento dos votos válidos Lula venceu o 2º turno de 2026 (arredonde)?', answer: 52, unit: '%' },
  { id: 'c-populacao-br-2025', category: 'geral', prompt: 'Qual era a população estimada do Brasil em 2025, em milhões (IBGE)?', answer: 213, unit: 'milhões' },
  { id: 'c-medalhas-paris', category: 'geral', prompt: 'Quantas medalhas de ouro os EUA ganharam em Paris 2024?', answer: 40, unit: 'ouros' },
  { id: 'c-rebeca', category: 'geral', prompt: 'Quantas medalhas olímpicas Rebeca Andrade tem (até Paris 2024)?', answer: 6, unit: 'medalhas' },
  // Mais 2026 (pesquisa de 19/11/2026)
  { id: 'c-superbowl-2026', category: 'geral', prompt: 'Quantos pontos o Seattle Seahawks fez na vitória no Super Bowl LX (2026)?', answer: 29, unit: 'pontos' },
  { id: 'c-knicks-jejum', category: 'geral', prompt: 'Quantos anos o New York Knicks ficou sem ganhar a NBA até o título de 2026?', answer: 53, unit: 'anos' },
  { id: 'c-bbb26-votos', category: 'geral', prompt: 'Com quantos por cento dos votos Ana Paula Renault ganhou o BBB 26 (arredonde)?', answer: 76, unit: '%' },
  { id: 'c-pecadores', category: 'geral', prompt: 'Quantas indicações ao Oscar "Pecadores" recebeu (recorde)?', answer: 16, unit: 'indicações' },
  { id: 'c-oscar-edicao', category: 'geral', prompt: 'Que número de edição foi o Oscar de 2026?', answer: 98, unit: 'ª edição' },
  { id: 'c-viradouro-titulos', category: 'geral', prompt: 'Quantos títulos a Viradouro tinha depois do Carnaval de 2026?', answer: 4, unit: 'títulos' },
  { id: 'c-paulista-palmeiras', category: 'futebol', prompt: 'Quantos títulos paulistas o Palmeiras tinha depois de 2026?', answer: 27, unit: 'títulos' },
  { id: 'c-carioca-flamengo', category: 'futebol', prompt: 'Quantos títulos cariocas o Flamengo tinha depois de 2026?', answer: 40, unit: 'títulos' },
  { id: 'c-safonov', category: 'futebol', prompt: 'Quantos pênaltis Safonov defendeu na decisão da Intercontinental de 2025 contra o Flamengo?', answer: 4, unit: 'pênaltis' },
];

export function getChute(id: string): ChuteQuestion | undefined {
  return CHUTE_QUESTIONS.find((q) => q.id === id);
}
