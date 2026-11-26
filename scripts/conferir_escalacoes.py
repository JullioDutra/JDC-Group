"""
Confere as escalações do Que Time contra as súmulas da Wikipédia em inglês
(rodada 15). Uso:
  npx tsx scripts/escalacoes-json.ts > /tmp/escalacoes.json
  python3 scripts/conferir_escalacoes.py /tmp/escalacoes.json /tmp/sumulas
Mostra o que diverge (nome que falta e quem estava na súmula). Escalação nova
entra no PAGES com a página da final.
"""
import json, re, sys, time, unicodedata, urllib.parse, urllib.request, os
LINEUPS_JSON = sys.argv[1]
S = sys.argv[2] if len(sys.argv) > 2 else '/tmp/sumulas'
os.makedirs(S, exist_ok=True)
PAGES = {
 'chelsea-2025':'2025 FIFA Club World Cup final','real-madrid-2024':'2024 UEFA Champions League final','real-madrid-2022':'2022 UEFA Champions League final',
 'chelsea-2021':'2021 UEFA Champions League final','bayern-2013':'2013 UEFA Champions League final','palmeiras-2020':'2020 Copa Libertadores final',
 'river-2018':'2018 Copa Libertadores finals','internacional-2010':'2010 Copa Libertadores finals','espanha-2024':'UEFA Euro 2024 final',
 'portugal-2016':'UEFA Euro 2016 final','argentina-2021':'2021 Copa América final',
 'brasil-1970':'1970 FIFA World Cup final','brasil-1958':'1958 FIFA World Cup final','brasil-1994':'1994 FIFA World Cup final',
 'brasil-2002':'2002 FIFA World Cup final','argentina-1986':'1986 FIFA World Cup final','argentina-2022':'2022 FIFA World Cup final',
 'holanda-1974':'1974 FIFA World Cup final','italia-2006':'2006 FIFA World Cup final','espanha-2010':'2010 FIFA World Cup final',
 'alemanha-2014':'2014 FIFA World Cup final','franca-2018':'2018 FIFA World Cup final','franca-1998':'1998 FIFA World Cup final',
 'italia-1982':'1982 FIFA World Cup final','inglaterra-1966':'1966 FIFA World Cup final','espanha-2026':'2026 FIFA World Cup final',
 'uruguai-1950':'Uruguay v Brazil (1950 FIFA World Cup)','brasil-1982':'Brazil v Italy (1982 FIFA World Cup)','brasil-2014':'Brazil v Germany (2014 FIFA World Cup)',
 'barcelona-2009':'2009 UEFA Champions League final','barcelona-2011':'2011 UEFA Champions League final','manchester-united-1999':'1999 UEFA Champions League final',
 'liverpool-2005':'2005 UEFA Champions League final','milan-2007':'2007 UEFA Champions League final','chelsea-2012':'2012 UEFA Champions League final',
 'real-madrid-2017':'2017 UEFA Champions League final','liverpool-2019':'2019 UEFA Champions League final','bayern-2020':'2020 UEFA Champions League final',
 'inter-2010':'2010 UEFA Champions League final','porto-2004':'2004 UEFA Champions League final','manchester-united-2008':'2008 UEFA Champions League final',
 'barcelona-2015':'2015 UEFA Champions League final','real-madrid-2014':'2014 UEFA Champions League final','real-madrid-2002':'2002 UEFA Champions League final',
 'real-madrid-2018':'2018 UEFA Champions League final','barcelona-2006':'2006 UEFA Champions League final','manchester-city-2023':'2023 UEFA Champions League final',
 'psg-2025':'2025 UEFA Champions League final','crystal-palace-2026':'2026 UEFA Conference League final',
 'flamengo-1981':'1981 Intercontinental Cup','sao-paulo-1992':'1992 Intercontinental Cup','sao-paulo-2005':'2005 FIFA Club World Championship final',
 'corinthians-2012':'2012 FIFA Club World Cup final','corinthians-2000':'2000 FIFA Club World Championship final','internacional-2006':'2006 FIFA Club World Cup final',
 'flamengo-2019':'2019 Copa Libertadores final','palmeiras-2021':'2021 Copa Libertadores final','flamengo-2022':'2022 Copa Libertadores final',
 'atletico-mg-2013':'2013 Copa Libertadores finals','gremio-2017':'2017 Copa Libertadores finals','fluminense-2023':'2023 Copa Libertadores final',
 'botafogo-2024':'2024 Copa Libertadores final','flamengo-2025':'2025 Copa Libertadores final',
}
UA='DueloDeCraquesBot/1.0 (https://duelo-de-craques-peach.vercel.app; jogo de futebol para grupos de WhatsApp)'
def fetch(title):
    path=f'{S}/{title.replace("/","_")}.wiki'
    if os.path.exists(path) and os.path.getsize(path)>1000: return open(path,encoding='utf8').read()
    url='https://en.wikipedia.org/w/index.php?title='+urllib.parse.quote(title.replace(' ','_'))+'&action=raw&redirect=yes'
    for i in range(3):
        try:
            req=urllib.request.Request(url, headers={'User-Agent':UA})
            t=urllib.request.urlopen(req, timeout=20).read().decode('utf8')
            m=re.match(r'#REDIRECT\s*\[\[([^\]]+)\]\]', t, re.I)
            if m: return fetch(m.group(1))
            open(path,'w',encoding='utf8').write(t); time.sleep(1); return t
        except Exception as e:
            time.sleep(3)
    return ''
def norm(x):
    x=unicodedata.normalize('NFD',x); x=''.join(c for c in x if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z ]',' ',x.lower()).split()
POS=r'(GK|SW|RB|CB|LB|RWB|LWB|DM|CM|RM|LM|AM|RW|LW|CF|SS|ST|FW|DF|MF|RF|LF|IR|IL|OR|OL|CH|RH|LH|WH|IF|HB|FB|OF)'
def blocks(t):
    rows=[]
    for line in t.split('\n'):
        line=re.sub(r"\{\{abbr\|([A-Z]{2,3})\|[^}]*\}\}", r"\1", line)
        m=re.match(r"^\|\s*"+POS+r"\s*\|\|?(.*)$", line)
        if not m: continue
        rest=re.sub(r"\{\{(flagicon|flagdeco|#invoke:flag)[^}]*\}\}","",m.group(2))
        lk=re.search(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", rest)
        sn=re.search(r"\{\{sortname\|([^|}]+)\|([^|}]+)", rest)
        if lk: name=(lk.group(2) or lk.group(1)).strip()
        elif sn: name=(sn.group(1)+' '+sn.group(2)).strip()
        else: continue
        name=re.sub(r"\s*\(.*?\)","",name)
        rows.append((m.group(1),name))
    out=[];cur=None
    for p,n in rows:
        if p=='GK': cur=[]; out.append(cur)
        if cur is not None: cur.append(n)
    return [b[:11] for b in out if len(b)>=11]
def same(a,b):
    A,B=norm(a),norm(b)
    if not A or not B: return False
    sa,sb=' '.join(A),' '.join(B)
    return sa in sb or sb in sa or A[-1]==B[-1] or A[0]==B[-1] or A[-1]==B[0]
lineups=json.load(open(LINEUPS_JSON,encoding='utf8'))
report={}
for lid,names in lineups.items():
    title=PAGES.get(lid)
    if not title: report[lid]='sem página'; continue
    t=fetch(title)
    bs=blocks(t)
    if not bs: report[lid]=f'sem escalação legível ({title}, {len(t)} bytes)'; continue
    best=max(bs,key=lambda b: sum(any(same(n,w) for w in b) for n in names))
    missing=[n for n in names if not any(same(n,w) for w in best)]
    extra=[w for w in best if not any(same(n,w) for n in names)]
    report[lid]={'ok':len(names)-len(missing),'missing':missing,'extra':extra,'n':len(names)}
for k,v in report.items():
    if isinstance(v,str) or v['missing']: print(k, v if isinstance(v,str) else f"{v['ok']}/{v['n']} faltam={v['missing']} sumula={v['extra']}")
print('conferidas', sum(1 for v in report.values() if not isinstance(v,str) and not v['missing']), 'de', len(report))
