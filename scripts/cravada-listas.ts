/**
 * Listas da Cravada (rodada 18), tiradas da Wikipédia. Gera
 * src/lib/party/content/cravada-wiki.ts (não editar o gerado à mão).
 *
 *   npm run cravada-listas [-- --cache pasta]
 *
 * Lê cada página pelo endereço do artigo (/wiki/...?action=raw), que o
 * robots.txt da Wikipédia permite; 1 pedido a cada 3 s, com o User-Agent do
 * bot; 429 espera 60 s e tenta de novo (3 vezes). As páginas lidas ficam na
 * pasta de cache (padrão: a pasta temporária do sistema), para rodar de novo
 * sem pedir tudo outra vez.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CravadaList } from '../src/lib/party/content/cravada';
import { USER_AGENT } from '../src/lib/players/wikidata';
import type { Top10Item } from '../src/lib/game/types';

const OUT = 'src/lib/party/content/cravada-wiki.ts';
const argIdx = process.argv.indexOf('--cache');
const CACHE = argIdx > 0 ? process.argv[argIdx + 1] : join(tmpdir(), 'cravada-wiki');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function page(lang: string, title: string): Promise<string> {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, `${lang}-${title.replace(/[^A-Za-z0-9]+/g, '_')}.txt`);
  if (existsSync(file)) return readFileSync(file, 'utf8');
  let t = title;
  for (let attempt = 0; attempt < 6; attempt++) {
    await sleep(3000);
    const res = await fetch(`https://${lang}.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, '_'))}?action=raw`, {
      headers: { 'user-agent': USER_AGENT },
      signal: AbortSignal.timeout(20_000),
    });
    if (res.status === 429) {
      console.log(`A Wikipédia limitou (${title}); esperando 60 s...`);
      await sleep(60_000);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} em ${lang}:${title}`);
    const text = await res.text();
    const redirect = text.match(/^#REDIRECT\s*\[\[([^\]|#]+)/i);
    if (redirect) {
      t = redirect[1].trim();
      continue;
    }
    writeFileSync(file, text);
    return text;
  }
  throw new Error(`não consegui ler ${lang}:${title}`);
}

// ---------- Leitura do wikitexto ----------

/** Separa por `sep` fora de [[ ]] e {{ }}. */
function splitTop(s: string, sep: RegExp): string[] {
  const out: string[] = [];
  let links = 0;
  let tpl = 0;
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    if (two === '[[' || two === '{{' || two === ']]' || two === '}}') {
      if (two === '[[') links++;
      else if (two === ']]') links = Math.max(0, links - 1);
      else if (two === '{{') tpl++;
      else tpl = Math.max(0, tpl - 1);
      cur += two;
      i++;
      continue;
    }
    if (!links && !tpl) {
      const m = s.slice(i).match(sep);
      if (m && m.index === 0) {
        out.push(cur);
        cur = '';
        i += m[0].length - 1;
        continue;
      }
    }
    cur += s[i];
  }
  out.push(cur);
  return out;
}

/** Texto limpo de uma célula: sem notas, predefinições de bandeira, links e negrito. */
export function clean(raw: string): string {
  let s = raw.replace(/\{\{=\}\}/g, '=');
  s = s.replace(/<ref[^>]*\/>/g, '').replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  for (let k = 0; k < 4; k++) {
    s = s.replace(/\{\{\s*sort ?name\s*\|([^|{}]*)\|([^|{}]*)(?:\|[^{}]*)?\}\}/gi, '$1 $2');
    s = s.replace(/\{\{\s*(?:sort|sortkey)\s*\|[^|{}]*\|([^{}]*)\}\}/gi, '$1');
    s = s.replace(/\{\{\s*(?:nowrap|nobr|small|big|center|sup|abbr|tooltip|nts|nobold)\s*\|([^|{}]*)(?:\|[^{}]*)?\}\}/gi, '$1');
    s = s.replace(/\{\{\s*(?:fb|fbw|fb-rt|fbu)\s*\|([^|{}]*)(?:\|[^{}]*)?\}\}/gi, '[$1]');
    s = s.replace(/\{\{\s*(?:flagicon|flagdeco|flag icon|fbicon|flagathlete-icon)\s*\|[^{}]*\}\}/gi, '');
    s = s.replace(/\{\{\s*(?:flag|flagu|flagcountry)\s*\|([^|{}]*)(?:\|[^{}]*)?\}\}/gi, '$1');
    s = s.replace(/\{\{\s*#[^{}]*\}\}/g, '');
    s = s.replace(/\{\{\s*(?:efn|refn|sfn|cn|citation needed|ref label|note|update after|as of|refnest|ntsh|dts|hs|increase|decrease|steady|nbsp)[^{}]*\}\}/gi, '');
    s = s.replace(/\{\{([^{}|]*)\|([^{}|]*)\}\}/g, '$2');
    s = s.replace(/\{\{[^{}]*\}\}/g, '');
  }
  s = s.replace(/\[\[(?:File|Image|Ficheiro|Imagem|Arquivo):[^\]]*\]\]/gi, '');
  s = s.replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1').replace(/\[\[([^\]]*)\]\]/g, '$1');
  s = s.replace(/\[https?:\/\/\S+\s*([^\]]*)\]/g, '$1');
  s = s.replace(/'''?/g, '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

function cellParts(c: string): { body: string; rowspan: number; colspan: number } {
  const parts = splitTop(c, /\|/);
  if (parts.length > 1 && /^\s*(?:[a-z-]+\s*=\s*("[^"]*"|'[^']*'|[^\s|]+)\s*)+$/i.test(parts[0].replace(/\{\{=\}\}/g, '='))) {
    const attrs = parts[0];
    return {
      body: parts.slice(1).join('|'),
      rowspan: Number(attrs.match(/rowspan\s*=\s*"?(\d+)/i)?.[1] ?? 1),
      colspan: Number(attrs.match(/colspan\s*=\s*"?(\d+)/i)?.[1] ?? 1),
    };
  }
  return { body: c, rowspan: 1, colspan: 1 };
}

interface Table {
  heading: string;
  caption: string;
  header: string[];
  rows: string[][];
}

/** Todas as wikitables da página, com o título de seção acima, a legenda e as linhas (rowspan/colspan aplicados). */
function tables(text: string): Table[] {
  const out: Table[] = [];
  const lines = text.split('\n');
  let heading = '';
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^(=+)\s*(.*?)\s*\1\s*$/);
    if (h) heading = clean(h[2]);
    if (!lines[i].trimStart().startsWith('{|')) continue;
    let depth = 0;
    const body: string[] = [];
    for (; i < lines.length; i++) {
      const l = lines[i].trimStart();
      if (l.startsWith('{|')) depth++;
      if (l.startsWith('|}') && --depth === 0) break;
      body.push(lines[i]);
    }
    let caption = '';
    type Cell = { text: string; head: boolean; rowspan: number; colspan: number };
    const raw: Cell[][] = [];
    let cur: Cell[] = [];
    let last: Cell | null = null;
    for (const l0 of body.slice(1)) {
      const l = l0.trimStart();
      if (l.startsWith('|+')) caption = clean(l.slice(2));
      else if (l.startsWith('|-')) {
        if (cur.length) raw.push(cur);
        cur = [];
        last = null;
      } else if (l.startsWith('!') || l.startsWith('|')) {
        const head = l.startsWith('!');
        for (const c of splitTop(l.slice(1), head ? /!!|\|\|/ : /\|\|/)) {
          const { body: b, rowspan, colspan } = cellParts(c);
          last = { text: b, head, rowspan, colspan };
          cur.push(last);
        }
      } else if (last) last.text += ` ${l}`;
    }
    if (cur.length) raw.push(cur);
    const grid: Array<Array<{ text: string; head: boolean }>> = [];
    const pending: Array<{ text: string; head: boolean; left: number } | undefined> = [];
    for (const r of raw) {
      const row: Array<{ text: string; head: boolean }> = [];
      let col = 0;
      let k = 0;
      while (k < r.length || (pending[col]?.left ?? 0) > 0) {
        const p = pending[col];
        if (p && p.left > 0) {
          row.push({ text: p.text, head: p.head });
          p.left--;
          col++;
          continue;
        }
        const c = r[k++];
        const t = clean(c.text);
        for (let s = 0; s < c.colspan; s++) {
          row.push({ text: t, head: c.head });
          if (c.rowspan > 1) pending[col] = { text: t, head: c.head, left: c.rowspan - 1 };
          col++;
        }
      }
      grid.push(row);
    }
    const headers = grid.filter((r) => r.length && r.every((c) => c.head));
    out.push({
      heading,
      caption,
      header: headers.length ? headers[headers.length - 1].map((c) => c.text) : [],
      rows: grid.filter((r) => r.length && !r.every((c) => c.head)).map((r) => r.map((c) => c.text)),
    });
  }
  return out;
}

/** Tabela de liga ("Sports table"): a ordem do team_order, pontos = 3V + E (+ ajuste). */
function leagueTable(text: string): Array<{ name: string; pts: number }> {
  const start = text.indexOf('{{#invoke:Sports table');
  if (start < 0) throw new Error('sem Sports table');
  const block = text.slice(start, start + 30_000).replace(/<!--[\s\S]*?-->/g, '');
  const get = (k: string) => block.match(new RegExp(`\\|\\s*${k}\\s*=\\s*([^|\\n]*)`))?.[1]?.trim();
  if (get('update') !== 'complete') throw new Error('tabela de liga ainda não terminou');
  const order = (get('team_order') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return order.map((c) => {
    const n = (k: string) => Number(get(`${k}_${c}`) ?? 0);
    const name = clean(block.match(new RegExp(`\\|\\s*name_${c}\\s*=\\s*(\\{\\{[^}]*\\}\\}|\\[\\[[^\\]]*\\]\\]|[^|\\n]*)`))?.[1] ?? c);
    return { name, pts: 3 * n('win') + n('draw') + n('adjust_points') };
  });
}

// ---------- Nomes ----------

/** Tira marcas da tabela ("Messi*", "Mbappé♦", "Neymar (1)", "Ronaldo†"). */
const plainName = (s: string) => s.replace(/[*♦†‡§^#]+/g, '').replace(/\s*\(\d+\)\s*$/, '').replace(/^style=.*?\|/, '').replace(/^\|\s*/, '').replace(/\s+/g, ' ').trim();

/** Apelidos que o grupo escreve para os jogadores mais citados. */
const PLAYER_ALIASES: Record<string, string[]> = {
  'Cristiano Ronaldo': ['CR7', 'Cristiano'],
  'Lionel Messi': ['Messi', 'Leo Messi'],
  'Neymar': ['Neymar Jr', 'Ney'],
  'Ronaldo': ['Ronaldo Fenômeno', 'Ronaldo Nazário', 'R9'],
  'Zlatan Ibrahimović': ['Ibrahimovic', 'Ibra', 'Zlatan'],
  'Kylian Mbappé': ['Mbappe'],
  'Robert Lewandowski': ['Lewandowski'],
  'Erling Haaland': ['Haaland'],
  'Harry Kane': ['Kane'],
  'Karim Benzema': ['Benzema'],
  'Luis Suárez': ['Suárez', 'Suarez'],
  'Gerd Müller': ['Gerd Muller'],
  'Ferenc Puskás': ['Puskás', 'Puskas'],
  'Romário': ['Romario'],
  'Vinícius Júnior': ['Vini Jr', 'Vinicius Junior', 'Vinícius Jr'],
  'Lamine Yamal': ['Yamal'],
  'Mohamed Salah': ['Salah'],
};

/** Nomes de clube em português (como aparece na partida) e os apelidos do grupo. */
const CLUBS: Record<string, { name?: string; aliases: string[] }> = {
  // Inglaterra
  'Manchester City': { aliases: ['Man City', 'City'] },
  'Manchester United': { aliases: ['Man United', 'Man Utd', 'United'] },
  'Aston Villa': { aliases: ['Villa'] },
  'Brighton & Hove Albion': { aliases: ['Brighton'] },
  'Newcastle United': { aliases: ['Newcastle'] },
  'Leeds United': { aliases: ['Leeds'] },
  'Crystal Palace': { aliases: ['Palace'] },
  'Nottingham Forest': { aliases: ['Forest', 'Nottingham'] },
  'Tottenham Hotspur': { aliases: ['Tottenham', 'Spurs'] },
  'West Ham United': { aliases: ['West Ham'] },
  'Wolverhampton Wanderers': { aliases: ['Wolves', 'Wolverhampton'] },
  // Espanha
  'Barcelona': { aliases: ['Barça', 'Barca'] },
  'Real Madrid': { aliases: ['Real'] },
  'Atlético Madrid': { name: 'Atlético de Madrid', aliases: ['Atlético Madrid', 'Atlético', 'Atleti'] },
  'Real Betis': { aliases: ['Betis'] },
  'Celta Vigo': { name: 'Celta de Vigo', aliases: ['Celta Vigo', 'Celta'] },
  'Rayo Vallecano': { aliases: ['Rayo'] },
  'Real Sociedad': { aliases: ['Sociedad', 'La Real'] },
  'Athletic Bilbao': { aliases: ['Athletic', 'Bilbao'] },
  'Alavés': { aliases: ['Alaves'] },
  'Oviedo': { aliases: ['Real Oviedo'] },
  // Itália
  'Inter Milan': { name: 'Inter de Milão', aliases: ['Inter', 'Internazionale', 'Inter Milan'] },
  'AC Milan': { name: 'Milan', aliases: ['AC Milan'] },
  'Napoli': { aliases: ['Nápoles'] },
  'Juventus': { aliases: ['Juve'] },
  'Bologna': { aliases: ['Bolonha'] },
  'Hellas Verona': { aliases: ['Verona'] },
  'Fiorentina': { aliases: [] },
  // Alemanha
  'Bayern Munich': { name: 'Bayern de Munique', aliases: ['Bayern', 'Bayern Munich'] },
  'Borussia Dortmund': { aliases: ['Dortmund', 'Borussia'] },
  'RB Leipzig': { aliases: ['Leipzig'] },
  'VfB Stuttgart': { aliases: ['Stuttgart'] },
  'TSG Hoffenheim': { aliases: ['Hoffenheim'] },
  'Bayer Leverkusen': { aliases: ['Leverkusen'] },
  'SC Freiburg': { aliases: ['Freiburg'] },
  'Eintracht Frankfurt': { aliases: ['Frankfurt', 'Eintracht'] },
  'FC Augsburg': { aliases: ['Augsburg'] },
  'Mainz 05': { aliases: ['Mainz'] },
  'Union Berlin': { aliases: ['Union'] },
  'Borussia Mönchengladbach': { aliases: ['Gladbach', 'Monchengladbach'] },
  'Hamburger SV': { name: 'Hamburgo', aliases: ['Hamburger SV', 'Hamburg', 'HSV'] },
  '1. FC Köln': { name: 'Colônia', aliases: ['Köln', 'Koln', 'Colonia'] },
  'Werder Bremen': { aliases: ['Werder', 'Bremen'] },
  'VfL Wolfsburg': { aliases: ['Wolfsburg'] },
  '1. FC Heidenheim': { name: 'Heidenheim', aliases: [] },
  'FC St. Pauli': { name: 'St. Pauli', aliases: ['Sankt Pauli', 'St Pauli'] },
  // França
  'Paris Saint-Germain': { aliases: ['PSG', 'Paris'] },
  'Marseille': { aliases: ['Olympique de Marseille', 'OM'] },
  'Lyon': { aliases: ['Olympique Lyonnais'] },
  'Strasbourg': { aliases: ['Estrasburgo'] },
  // Brasil
  'Flamengo': { aliases: ['Fla', 'Mengão'] },
  'Palmeiras': { aliases: ['Verdão'] },
  'Fluminense': { aliases: ['Flu'] },
  'Botafogo': { aliases: ['Fogão'] },
  'São Paulo': { aliases: ['SPFC'] },
  'Red Bull Bragantino': { aliases: ['Bragantino', 'RB Bragantino'] },
  'Atlético Mineiro': { aliases: ['Atlético-MG', 'Atlético MG', 'Galo'] },
  'Corinthians': { aliases: ['Timão'] },
  'Vasco da Gama': { aliases: ['Vasco'] },
  'Internacional': { aliases: ['Inter', 'Colorado'] },
  'Sport': { aliases: ['Sport Recife'] },
};

function clubItem(rawName: string): { name: string; aliases?: string[] } {
  const name = plainName(rawName);
  const c = CLUBS[name];
  if (!c) return { name };
  const aliases = [...new Set([...(c.name ? [name] : []), ...c.aliases])].filter((a) => a !== (c.name ?? name));
  return { name: c.name ?? name, ...(aliases.length ? { aliases } : {}) };
}

/** Estádio: o nome da tabela e, de apelido, o nome sem "Stadium"/"Estadio" ("Wembley", "Azteca"). */
function stadiumItem(rawName: string): { name: string; aliases?: string[] } {
  const name = plainName(rawName);
  const short = name.replace(/\b(Stadium|Stadion|Estadio|Estádio|Stade|Stadio|Arena|Sports Centre|Olympic|National|Municipal|Memorial)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  return { name, ...(short && short !== name && short.length >= 4 ? { aliases: [short] } : {}) };
}

function personItem(rawName: string): { name: string; aliases?: string[] } {
  const name = plainName(rawName);
  const aliases = PLAYER_ALIASES[name];
  return { name, ...(aliases ? { aliases } : {}) };
}

/** Países (inglês ou código da FIFA) em português, para o detalhe ("146 gols · Portugal"). */
const NATIONS: Record<string, string> = {
  POR: 'Portugal', Portugal: 'Portugal', ARG: 'Argentina', Argentina: 'Argentina', BRA: 'Brasil', Brazil: 'Brasil',
  GER: 'Alemanha', Germany: 'Alemanha', FRG: 'Alemanha Ocidental', 'West Germany': 'Alemanha Ocidental', FRA: 'França', France: 'França',
  ENG: 'Inglaterra', England: 'Inglaterra', ESP: 'Espanha', Spain: 'Espanha', ITA: 'Itália', Italy: 'Itália', NED: 'Holanda', Netherlands: 'Holanda',
  HUN: 'Hungria', Hungary: 'Hungria', POL: 'Polônia', Poland: 'Polônia', PER: 'Peru', Peru: 'Peru', URU: 'Uruguai', Uruguay: 'Uruguai',
  MEX: 'México', Mexico: 'México', USA: 'Estados Unidos', 'United States': 'Estados Unidos', BEL: 'Bélgica', Belgium: 'Bélgica',
  CRO: 'Croácia', Croatia: 'Croácia', SWE: 'Suécia', Sweden: 'Suécia', CZE: 'Tchéquia', 'Czech Republic': 'Tchéquia', TCH: 'Tchecoslováquia', Czechoslovakia: 'Tchecoslováquia',
  RUS: 'Rússia', Russia: 'Rússia', URS: 'União Soviética', 'Soviet Union': 'União Soviética', CHI: 'Chile', Chile: 'Chile', COL: 'Colômbia', Colombia: 'Colômbia',
  PAR: 'Paraguai', Paraguay: 'Paraguai', ECU: 'Equador', Ecuador: 'Equador', VEN: 'Venezuela', Venezuela: 'Venezuela', BOL: 'Bolívia', Bolivia: 'Bolívia',
  JPN: 'Japão', Japan: 'Japão', KOR: 'Coreia do Sul', 'South Korea': 'Coreia do Sul', IRN: 'Irã', Iran: 'Irã', KSA: 'Arábia Saudita', 'Saudi Arabia': 'Arábia Saudita',
  IRQ: 'Iraque', Iraq: 'Iraque', KUW: 'Kuwait', Kuwait: 'Kuwait', UAE: 'Emirados Árabes', 'United Arab Emirates': 'Emirados Árabes', QAT: 'Catar', Qatar: 'Catar',
  EGY: 'Egito', Egypt: 'Egito', CMR: 'Camarões', Cameroon: 'Camarões', CIV: 'Costa do Marfim', 'Ivory Coast': 'Costa do Marfim', GHA: 'Gana', Ghana: 'Gana',
  NGA: 'Nigéria', Nigeria: 'Nigéria', SEN: 'Senegal', Senegal: 'Senegal', MAR: 'Marrocos', Morocco: 'Marrocos', TUN: 'Tunísia', Tunisia: 'Tunísia', ALG: 'Argélia', Algeria: 'Argélia',
  ZAM: 'Zâmbia', Zambia: 'Zâmbia', TOG: 'Togo', Togo: 'Togo', SCO: 'Escócia', Scotland: 'Escócia', WAL: 'País de Gales', Wales: 'País de Gales', NIR: 'Irlanda do Norte', IRL: 'Irlanda', 'Republic of Ireland': 'Irlanda',
  DEN: 'Dinamarca', Denmark: 'Dinamarca', NOR: 'Noruega', Norway: 'Noruega', FIN: 'Finlândia', Finland: 'Finlândia', SUI: 'Suíça', Switzerland: 'Suíça', AUT: 'Áustria', Austria: 'Áustria',
  TUR: 'Turquia', Turkey: 'Turquia', 'Türkiye': 'Turquia', GRE: 'Grécia', Greece: 'Grécia', SRB: 'Sérvia', Serbia: 'Sérvia', YUG: 'Iugoslávia', Yugoslavia: 'Iugoslávia',
  BUL: 'Bulgária', Bulgaria: 'Bulgária', ROU: 'Romênia', Romania: 'Romênia', UKR: 'Ucrânia', Ukraine: 'Ucrânia', BIH: 'Bósnia', 'Bosnia and Herzegovina': 'Bósnia',
  SVN: 'Eslovênia', Slovenia: 'Eslovênia', SVK: 'Eslováquia', Slovakia: 'Eslováquia', ISR: 'Israel', Israel: 'Israel', ISL: 'Islândia', Iceland: 'Islândia',
  CAN: 'Canadá', Canada: 'Canadá', CRC: 'Costa Rica', 'Costa Rica': 'Costa Rica', HON: 'Honduras', Honduras: 'Honduras', JAM: 'Jamaica', Jamaica: 'Jamaica',
  TRI: 'Trinidad e Tobago', 'Trinidad and Tobago': 'Trinidad e Tobago', GUA: 'Guatemala', Guatemala: 'Guatemala', PAN: 'Panamá', Panama: 'Panamá', SLV: 'El Salvador', 'El Salvador': 'El Salvador',
  AUS: 'Austrália', Australia: 'Austrália', NZL: 'Nova Zelândia', 'New Zealand': 'Nova Zelândia', CHN: 'China', China: 'China', IND: 'Índia', India: 'Índia',
  MAS: 'Malásia', Malaysia: 'Malásia', THA: 'Tailândia', Thailand: 'Tailândia', IDN: 'Indonésia', Indonesia: 'Indonésia', VIE: 'Vietnã', Vietnam: 'Vietnã', SIN: 'Singapura', Singapore: 'Singapura',
  BHR: 'Bahrein', Bahrain: 'Bahrein', OMA: 'Omã', Oman: 'Omã', JOR: 'Jordânia', Jordan: 'Jordânia', SYR: 'Síria', Syria: 'Síria', LBN: 'Líbano', Lebanon: 'Líbano', UZB: 'Uzbequistão', Uzbekistan: 'Uzbequistão',
  KAZ: 'Cazaquistão', Kazakhstan: 'Cazaquistão', PRK: 'Coreia do Norte', 'North Korea': 'Coreia do Norte', HKG: 'Hong Kong', 'Hong Kong': 'Hong Kong', MDV: 'Maldivas', Maldives: 'Maldivas',
  LVA: 'Letônia', Latvia: 'Letônia', LTU: 'Lituânia', Lithuania: 'Lituânia', EST: 'Estônia', Estonia: 'Estônia', BLR: 'Belarus', Belarus: 'Belarus', MDA: 'Moldávia', ARM: 'Armênia', Armenia: 'Armênia',
  ALB: 'Albânia', Albania: 'Albânia', MKD: 'Macedônia do Norte', 'North Macedonia': 'Macedônia do Norte', MNE: 'Montenegro', Montenegro: 'Montenegro', CYP: 'Chipre', Cyprus: 'Chipre', LUX: 'Luxemburgo', LIE: 'Liechtenstein',
  ANG: 'Angola', Angola: 'Angola', COD: 'RD Congo', 'DR Congo': 'RD Congo', MLI: 'Mali', Mali: 'Mali', GAB: 'Gabão', Gabon: 'Gabão', GUI: 'Guiné', Guinea: 'Guiné', BFA: 'Burkina Faso', 'Burkina Faso': 'Burkina Faso',
  RSA: 'África do Sul', 'South Africa': 'África do Sul', UGA: 'Uganda', Uganda: 'Uganda', KEN: 'Quênia', Kenya: 'Quênia', SUD: 'Sudão', Sudan: 'Sudão', LBY: 'Líbia', Libya: 'Líbia', ZIM: 'Zimbábue', Zimbabwe: 'Zimbábue',
  BOT: 'Botsuana', Botswana: 'Botsuana', MOZ: 'Moçambique', Mozambique: 'Moçambique', CPV: 'Cabo Verde', 'Cape Verde': 'Cabo Verde', ETH: 'Etiópia', TAN: 'Tanzânia', Tanzania: 'Tanzânia',
  YEM: 'Iêmen', Yemen: 'Iêmen', PLE: 'Palestina', Palestine: 'Palestina', AFG: 'Afeganistão', TJK: 'Tajiquistão', Tajikistan: 'Tajiquistão', TKM: 'Turcomenistão', Turkmenistan: 'Turcomenistão', KGZ: 'Quirguistão', Kyrgyzstan: 'Quirguistão',
  PHI: 'Filipinas', Philippines: 'Filipinas', MYA: 'Mianmar', Myanmar: 'Mianmar', CAM: 'Camboja', Cambodia: 'Camboja', LAO: 'Laos', Laos: 'Laos', NEP: 'Nepal', Nepal: 'Nepal', BAN: 'Bangladesh', Bangladesh: 'Bangladesh', SRI: 'Sri Lanka',
  GEO: 'Geórgia', Georgia: 'Geórgia', AZE: 'Azerbaijão', Azerbaijan: 'Azerbaijão', FRO: 'Ilhas Faroé', 'Faroe Islands': 'Ilhas Faroé', MLT: 'Malta', Malta: 'Malta', AND: 'Andorra', SMR: 'San Marino',
  HAI: 'Haiti', Haiti: 'Haiti', CUB: 'Cuba', Cuba: 'Cuba', SUR: 'Suriname', Suriname: 'Suriname', GUY: 'Guiana', Guyana: 'Guiana', ATG: 'Antígua e Barbuda', 'Antigua and Barbuda': 'Antígua e Barbuda',
  SKN: 'São Cristóvão e Névis', 'Saint Kitts and Nevis': 'São Cristóvão e Névis', BRB: 'Barbados', GRN: 'Granada', LCA: 'Santa Lúcia', VIN: 'São Vicente e Granadinas', DMA: 'Dominica', BER: 'Bermudas',
  BHU: 'Butão', GUM: 'Guam', FIJ: 'Fiji', Fiji: 'Fiji', SOL: 'Ilhas Salomão', 'Solomon Islands': 'Ilhas Salomão', PNG: 'Papua-Nova Guiné', TAH: 'Taiti', NCL: 'Nova Caledônia', VAN: 'Vanuatu',
  DDR: 'Alemanha Oriental', 'East Germany': 'Alemanha Oriental', SCG: 'Sérvia e Montenegro', CIS: 'CEI', ZAI: 'Zaire', Zaire: 'Zaire', NAM: 'Namíbia', Namibia: 'Namíbia', RWA: 'Ruanda', Rwanda: 'Ruanda', BDI: 'Burundi',
  BEN: 'Benin', Benin: 'Benin', NIG: 'Níger', MTN: 'Mauritânia', Mauritania: 'Mauritânia', GAM: 'Gâmbia', SLE: 'Serra Leoa', LBR: 'Libéria', Liberia: 'Libéria', MWI: 'Malawi', Malawi: 'Malawi', EQG: 'Guiné Equatorial', CTA: 'República Centro-Africana', CHA: 'Chade', CGO: 'Congo', Congo: 'Congo', MAD: 'Madagascar', Madagascar: 'Madagascar', COM: 'Comores',
};
const nation = (raw: string) => NATIONS[raw.replace(/[[\]]/g, '').trim()] ?? '';

// ---------- As listas ----------

type Row = string[];
const num = (s: string) => Number(s.replace(/[^\d.]/g, '').replace(/\.(?=\d{3}\b)/g, '')) || 0;
const fmt = (s: string) => s.replace(/,/g, '.');

interface PlayerSpec {
  id: string;
  lang?: string;
  page: string;
  /** Qual tabela: pelo título da seção, pela legenda ou pelo cabeçalho. */
  pick: (t: Table) => boolean;
  title: string;
  source: string;
  tags: string[];
  kind?: 'pessoas' | 'coisas';
  /** Colunas pelo nome do cabeçalho (o rank vem da coluna 0 ou da ordem). */
  col: { rank?: string; name: string; value: string; nation?: string };
  unit: string;
  /** Até qual posição entra (o resto fica de fora). */
  maxRank?: number;
  /** Uma linha por pessoa (páginas com uma linha por clube). */
  dedupe?: boolean;
  item?: (row: Row, idx: (name: string) => number) => { name: string; aliases?: string[]; detail: string };
}

function fromTable(spec: PlayerSpec, text: string): CravadaList {
  const t = tables(text).filter(spec.pick).find((x) => x.header.length > 0 && x.rows.length >= 5);
  if (!t) throw new Error(`${spec.id}: tabela não achada`);
  const idx = (name: string) => t.header.findIndex((h) => h.toLowerCase().startsWith(name.toLowerCase()));
  const ci = { rank: spec.col.rank ? idx(spec.col.rank) : -1, name: idx(spec.col.name), value: idx(spec.col.value), nation: spec.col.nation ? idx(spec.col.nation) : -1 };
  if (ci.name < 0 || ci.value < 0) throw new Error(`${spec.id}: colunas não achadas em ${JSON.stringify(t.header)}`);
  const items: Top10Item[] = [];
  const seen = new Set<string>();
  let prevValue = '';
  let prevRank = 0;
  let count = 0;
  t.rows.forEach((row, i) => {
    if (row.length <= Math.max(ci.name, ci.value)) return;
    const rawName = row[ci.name];
    if (!rawName || /^total|^minimum/i.test(rawName) || rawName === row[ci.value] || !/\d/.test(row[ci.value])) return;
    if (spec.dedupe) {
      const key = `${row[ci.rank] ?? ''}|${rawName}`;
      if (seen.has(key)) return;
      seen.add(key);
    }
    // Posição: a da coluna (empates repetem) ou a ordem da tabela (mesmo número = empate).
    let rank = ci.rank >= 0 ? Number(row[ci.rank].replace(/[^\d]/g, '')) : NaN;
    count++;
    if (!Number.isFinite(rank) || rank <= 0) rank = row[ci.value] === prevValue && prevRank ? prevRank : count;
    prevValue = row[ci.value];
    prevRank = rank;
    if (spec.maxRank && rank > spec.maxRank) return;
    const base = spec.item ? spec.item(row, idx) : { ...personItem(rawName), detail: `${fmt(row[ci.value])} ${spec.unit}` };
    const nat = ci.nation >= 0 ? nation(row[ci.nation]) : '';
    items.push({ rank, ...base, ...(nat && !spec.item ? { detail: `${base.detail} · ${nat}` } : {}) });
    void i;
  });
  return { id: spec.id, category: 'futebol', kind: spec.kind ?? 'pessoas', title: spec.title, source: spec.source, tags: spec.tags, items };
}

const byHeading = (h: string) => (t: Table) => t.heading.toLowerCase() === h.toLowerCase();

const PLAYER_LISTS: PlayerSpec[] = [
  {
    id: 'goleadores-rsssf',
    page: "List of men's footballers with 500 or more goals",
    pick: byHeading('RSSSF list'),
    title: 'Os maiores goleadores da história do futebol (500 gols ou mais, RSSSF, até 19/07/2026)',
    source: 'RSSSF, via Wikipédia ("List of men\'s footballers with 500 or more goals"), atualizada em 19/07/2026',
    tags: ['goleadores', 'artilheiros', 'gols', 'historia'],
    col: { rank: 'Rank', name: 'Player', value: 'Goals' },
    unit: 'gols',
  },
  {
    id: 'goleadores-oficiais',
    page: "List of men's footballers with 500 or more goals",
    pick: byHeading('Footballers with 500 or more goals'),
    title: 'Os maiores goleadores em jogos oficiais (500 gols ou mais, até 24/11/2026)',
    source: 'IFFHS e federações, via Wikipédia ("List of men\'s footballers with 500 or more goals"), atualizada em 24/11/2026',
    tags: ['goleadores', 'artilheiros', 'gols', 'oficiais'],
    col: { rank: 'Rank', name: 'Player', value: 'Total' },
    unit: 'gols',
  },
  {
    id: 'artilheiros-copas',
    page: 'List of FIFA World Cup top goalscorers',
    pick: (t) => /at least 5 goals/i.test(t.caption),
    title: 'Os maiores artilheiros da história das Copas (5 gols ou mais, até a Copa de 2026)',
    source: 'FIFA, via Wikipédia ("List of FIFA World Cup top goalscorers"), atualizada depois da final de 19/07/2026',
    tags: ['copa', 'copas', 'artilheiros', 'gols'],
    col: { rank: 'Rank', name: 'Player', value: 'Goals', nation: 'Team' },
    unit: 'gols',
  },
  {
    id: 'gols-selecoes',
    page: "List of men's footballers with 50 or more international goals",
    pick: byHeading('By player'),
    title: 'Os maiores artilheiros de seleções (50 gols ou mais, até 17/11/2026)',
    source: 'FIFA, RSSSF e IFFHS, via Wikipédia ("List of men\'s footballers with 50 or more international goals"), atualizada em 17/11/2026',
    tags: ['selecoes', 'artilheiros', 'gols'],
    col: { rank: 'Rank', name: 'Player', value: 'Goals', nation: 'Nation' },
    unit: 'gols',
  },
  {
    id: 'jogos-selecoes',
    page: "List of men's footballers with 100 or more international caps",
    pick: (t) => /100 or more international caps/i.test(t.heading),
    title: 'Os 100 jogadores com mais jogos por seleções (até 17/11/2026)',
    source: 'RSSSF, via Wikipédia ("List of men\'s footballers with 100 or more international caps"), atualizada em 17/11/2026',
    tags: ['selecoes', 'jogos'],
    col: { rank: 'Rank', name: 'Player', value: 'Caps', nation: 'Nation' },
    unit: 'jogos',
    maxRank: 100,
  },
  {
    id: 'jogos-oficiais',
    page: "List of men's footballers with the most official appearances",
    pick: byHeading('Ranking'),
    title: 'Jogadores com mais jogos oficiais na carreira (1.000 ou mais, até 24/11/2026)',
    source: 'Wikipédia ("List of men\'s footballers with 1,000 or more official appearances"), atualizada em 24/11/2026',
    tags: ['jogos', 'oficiais', 'historia'],
    col: { rank: 'Rank', name: 'Player', value: 'Total' },
    unit: 'jogos',
    dedupe: true,
  },
  {
    id: 'artilheiros-champions',
    page: 'List of European Cup and UEFA Champions League top scorers',
    pick: byHeading('All-time top scorers'),
    title: 'Os maiores artilheiros da história da Champions League (até 25/11/2026)',
    source: 'UEFA, via Wikipédia ("List of UEFA Champions League top scorers"), atualizada em 25/11/2026',
    tags: ['champions', 'artilheiros', 'gols'],
    col: { rank: 'Rank', name: 'Player', value: 'Goals' },
    unit: 'gols',
  },
  {
    id: 'artilheiros-premier',
    page: 'List of footballers with 100 or more Premier League goals',
    pick: (t) => /100 or more Premier League goals/i.test(t.caption),
    title: 'Os maiores artilheiros da história da Premier League (100 gols ou mais, até 25/10/2026)',
    source: 'Premier League, via Wikipédia ("List of footballers with 100 or more Premier League goals"), atualizada em 25/10/2026',
    tags: ['premier', 'ingles', 'inglaterra', 'artilheiros', 'gols'],
    col: { rank: 'Rank', name: 'Player', value: 'Goals' },
    unit: 'gols',
  },
  {
    id: 'artilheiros-laliga',
    page: 'List of La Liga top scorers',
    pick: byHeading('La Liga players with 100 or more goals'),
    title: 'Os maiores artilheiros da história do Campeonato Espanhol (100 gols ou mais, até 22/11/2026)',
    source: 'LaLiga, via Wikipédia ("List of La Liga top scorers"), atualizada em 22/11/2026',
    tags: ['la liga', 'laliga', 'espanhol', 'espanha', 'artilheiros', 'gols'],
    col: { rank: 'Rank', name: 'Player', value: 'Goals' },
    unit: 'gols',
  },
  {
    id: 'artilheiros-seriea',
    page: 'List of Serie A players with 100 or more goals',
    pick: byHeading('Serie A players with 100 or more goals'),
    title: 'Os maiores artilheiros da história do Campeonato Italiano (100 gols ou mais, até 31/08/2026)',
    source: 'Lega Serie A, via Wikipédia ("List of Serie A players with 100 or more goals"), atualizada em 31/08/2026',
    tags: ['serie a', 'italiano', 'italia', 'artilheiros', 'gols'],
    col: { rank: 'Rank', name: 'Player', value: 'Goals' },
    unit: 'gols',
  },
  {
    id: 'artilheiros-bundesliga',
    page: 'List of Bundesliga top scorers',
    pick: byHeading('Bundesliga players with 100 or more goals'),
    title: 'Os maiores artilheiros da história do Campeonato Alemão (100 gols ou mais, até 22/11/2026)',
    source: 'DFL e worldfootball.net, via Wikipédia ("List of Bundesliga top scorers"), atualizada em 22/11/2026',
    tags: ['bundesliga', 'alemao', 'alemanha', 'artilheiros', 'gols'],
    col: { rank: 'Rank', name: 'Player', value: 'Goals' },
    unit: 'gols',
  },
  {
    id: 'artilheiros-ligue1',
    page: 'List of Ligue 1 top scorers',
    pick: byHeading('All-time top scorers'),
    title: 'Os maiores artilheiros da história do Campeonato Francês (até 30/08/2026)',
    source: 'LFP, via Wikipédia ("List of Ligue 1 top scorers"), atualizada em 30/08/2026',
    tags: ['ligue 1', 'frances', 'franca', 'artilheiros', 'gols'],
    col: { rank: 'Rank', name: 'Player', value: 'Goals' },
    unit: 'gols',
  },
  {
    id: 'artilheiros-brasileirao',
    lang: 'pt',
    page: 'Lista de artilheiros do Campeonato Brasileiro de Futebol',
    pick: byHeading('Artilharia geral'),
    title: 'Os maiores artilheiros da história do Brasileirão (100 gols ou mais, até 22/11/2026)',
    source: 'CBF, via Wikipédia ("Lista de artilheiros do Campeonato Brasileiro de Futebol"), atualizada em 22/11/2026',
    tags: ['brasileirao', 'brasil', 'artilheiros', 'gols'],
    col: { rank: 'Pos', name: 'Jogador', value: 'Gols' },
    unit: 'gols',
  },
  {
    id: 'bola-de-ouro-2026',
    page: "2026 Ballon d'Or",
    pick: (t) => /^2026 Men's Ballon d'Or$/i.test(t.caption),
    title: 'Ranking final da Bola de Ouro de 2026 (os 30 indicados)',
    source: 'France Football, via Wikipédia ("2026 Ballon d\'Or")',
    tags: ['bola de ouro', 'ballon dor', 'premios'],
    col: { rank: 'Rank', name: 'Player', value: 'Points' },
    unit: 'pontos',
  },
  {
    id: 'bola-de-ouro-2025',
    page: "2025 Ballon d'Or",
    pick: (t) => /^2025 Ballon d'Or$/i.test(t.caption),
    title: 'Ranking final da Bola de Ouro de 2025 (os 30 indicados)',
    source: 'France Football, via Wikipédia ("2025 Ballon d\'Or")',
    tags: ['bola de ouro', 'ballon dor', 'premios'],
    col: { rank: 'Rank', name: 'Player', value: 'Points' },
    unit: 'pontos',
  },
  {
    id: 'transferencias',
    page: 'List of most expensive association football transfers',
    pick: (t) => /Top 50 most expensive/i.test(t.caption),
    title: 'As 50 transferências mais caras da história (em euros, até 01/09/2026)',
    source: 'Wikipédia ("List of most expensive association football transfers"), atualizada em 01/09/2026; o mesmo jogador pode aparecer mais de uma vez',
    tags: ['transferencias', 'contratacoes', 'dinheiro'],
    col: { rank: 'Rank', name: 'Player', value: 'Fee (€' },
    unit: '',
    item: (row, idx) => {
      const club = (c: string) => clubItem(c.replace(/^\[?[A-Z]{3}\]?\s+/, '')).name;
      const fee = row[idx('Fee (€')].replace('.', ',');
      return { ...personItem(row[idx('Player')]), detail: `€ ${fee} mi · ${club(row[idx('From')])} → ${club(row[idx('To')])} (${row[idx('Year')]})` };
    },
  },
  {
    id: 'deloitte-2026',
    page: 'Deloitte Football Money League',
    pick: (t) => t.header[0] === '2026 Rank',
    title: 'Os 30 clubes que mais faturaram na temporada 2024/25 (Deloitte Football Money League 2026)',
    source: 'Deloitte Football Money League 2026, via Wikipédia ("Deloitte Football Money League")',
    tags: ['faturamento', 'dinheiro', 'clubes', 'deloitte'],
    kind: 'coisas',
    col: { rank: '2026 Rank', name: 'Club', value: 'Total' },
    unit: '',
    maxRank: 30,
    item: (row, idx) => ({ ...clubItem(row[idx('Club')]), detail: `€ ${fmt(row[idx('Total')]).replace('.', ',')} mi` }),
  },
  {
    id: 'estadios-mundo',
    page: 'List of association football stadiums by capacity',
    pick: byHeading('Football stadiums by capacity'),
    title: 'Os maiores estádios de futebol do mundo (mais de 40 mil lugares sentados, lista de novembro de 2026)',
    source: 'Wikipédia ("List of association football stadiums by capacity"), lida em 27/11/2026',
    tags: ['estadios', 'arenas'],
    kind: 'coisas',
    col: { name: 'Stadium', value: 'Seating capacity' },
    unit: '',
    maxRank: 93,
    item: (row, idx) => ({ ...stadiumItem(row[idx('Stadium')]), detail: `${fmt(row[idx('Seating capacity')])} lugares${row[idx('City')] ? ` · ${row[idx('City')].split(',')[0]}` : ''}` }),
  },
];

interface LeagueSpec {
  id: string;
  page: string;
  title: string;
  source: string;
  tags: string[];
}

const LEAGUES: LeagueSpec[] = [
  { id: 'tabela-premier-2025-26', page: '2025–26 Premier League', title: 'Classificação final da Premier League 2025/26', source: 'Premier League, via Wikipédia ("2025–26 Premier League")', tags: ['premier', 'ingles', 'inglaterra', 'tabelas', 'classificacao'] },
  { id: 'tabela-laliga-2025-26', page: 'Template:2025–26 La Liga table', title: 'Classificação final do Campeonato Espanhol 2025/26', source: 'LaLiga, via Wikipédia ("2025–26 La Liga")', tags: ['la liga', 'laliga', 'espanhol', 'espanha', 'tabelas', 'classificacao'] },
  { id: 'tabela-seriea-2025-26', page: 'Template:2025–26 Serie A table', title: 'Classificação final do Campeonato Italiano 2025/26', source: 'Lega Serie A, via Wikipédia ("2025–26 Serie A")', tags: ['serie a', 'italiano', 'italia', 'tabelas', 'classificacao'] },
  { id: 'tabela-bundesliga-2025-26', page: 'Template:2025–26 Bundesliga table', title: 'Classificação final do Campeonato Alemão 2025/26', source: 'DFL, via Wikipédia ("2025–26 Bundesliga")', tags: ['bundesliga', 'alemao', 'alemanha', 'tabelas', 'classificacao'] },
  { id: 'tabela-ligue1-2025-26', page: 'Template:2025–26 Ligue 1 table', title: 'Classificação final do Campeonato Francês 2025/26', source: 'LFP, via Wikipédia ("2025–26 Ligue 1")', tags: ['ligue 1', 'frances', 'franca', 'tabelas', 'classificacao'] },
  { id: 'tabela-brasileirao-2025', page: '2025 Campeonato Brasileiro Série A', title: 'Classificação final do Brasileirão 2025', source: 'CBF, via Wikipédia ("2025 Campeonato Brasileiro Série A")', tags: ['brasileirao', 'brasil', 'tabelas', 'classificacao'] },
];

async function main() {
  const lists: CravadaList[] = [];
  for (const spec of PLAYER_LISTS) {
    const list = fromTable(spec, await page(spec.lang ?? 'en', spec.page));
    lists.push(list);
    console.log(`${list.id}: ${list.items.length} itens (1º ${list.items[0]?.name}; último ${list.items[list.items.length - 1]?.name})`);
  }
  for (const spec of LEAGUES) {
    const rows = leagueTable(await page('en', spec.page));
    const items: Top10Item[] = rows.map((r, i) => ({ rank: i + 1, ...clubItem(r.name), detail: `${r.pts} pontos` }));
    lists.push({ id: spec.id, category: 'futebol', kind: 'coisas', title: spec.title, source: spec.source, tags: spec.tags, items });
    console.log(`${spec.id}: ${items.length} clubes (campeão ${items[0].name})`);
  }
  writeFileSync(
    OUT,
    `import type { CravadaList } from './cravada';\n\n/**\n * Listas da Cravada tiradas da Wikipédia, GERADAS pelo scripts/cravada-listas.ts\n * (não editar à mão). Fonte e data de cada uma no título e em "source".\n */\nexport const CRAVADA_WIKI: CravadaList[] = ${JSON.stringify(lists, null, 1)};\n`,
  );
  console.log(`${lists.length} listas em ${OUT}`);
}

void num;
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
