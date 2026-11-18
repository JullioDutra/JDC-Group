'use client';

import { useEffect, useState } from 'react';

/**
 * Página do admin para dados à mão: buscar a ficha, corrigir um número
 * (conferido no Transfermarkt), apagar a correção, cadastrar nome famoso e
 * colar um lote. A ADMIN_KEY fica só nesta aba (sessionStorage).
 */

const STATS = [
  ['gols', 'gols na carreira'],
  ['jogos', 'jogos na carreira'],
  ['assistencias', 'assistências'],
  ['valor atual', 'valor atual (mi €)'],
  ['valor maximo', 'maior valor (mi €)'],
  ['titulos', 'títulos'],
  ['gols selecao', 'gols pela seleção'],
  ['jogos selecao', 'jogos pela seleção'],
  ['gols copa', 'gols em Copas'],
  ['copas', 'Copas disputadas'],
  ['gols champions', 'gols na Champions'],
  ['gols libertadores', 'gols na Libertadores'],
  ['gols brasileirao', 'gols no Brasileirão'],
  ['altura', 'altura (cm)'],
  ['estreia', 'ano de estreia'],
] as const;

const box: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--panel-line)', borderRadius: 12, padding: 16, marginBottom: 16 };
const input: React.CSSProperties = { background: '#06130c', color: 'var(--white)', border: '1px solid var(--panel-line)', borderRadius: 8, padding: '8px 10px', fontSize: 16, width: '100%' };
const button: React.CSSProperties = { background: 'var(--lime)', color: '#06130c', border: 0, borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 16, cursor: 'pointer' };

export default function AdminPlayers() {
  const [key, setKey] = useState('');
  const [q, setQ] = useState('');
  const [cards, setCards] = useState<string[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  const [target, setTarget] = useState('');
  const [stat, setStat] = useState<string>('gols');
  const [value, setValue] = useState('');
  const [source, setSource] = useState('Transfermarkt');
  const [alias, setAlias] = useState('');
  const [csv, setCsv] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    try {
      setKey(sessionStorage.getItem('adminKey') ?? '');
    } catch {
      /* sem armazenamento: digita de novo */
    }
  }, []);
  const saveKey = (k: string) => {
    setKey(k);
    try {
      sessionStorage.setItem('adminKey', k);
    } catch {
      /* ignora */
    }
  };

  const call = async (method: 'GET' | 'POST', body?: unknown, query?: string) => {
    const res = await fetch(`/api/admin/players/manual${query ?? ''}`, {
      method,
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `erro ${res.status}`);
    return data;
  };

  const search = async () => {
    setMsg('');
    try {
      const data = await call('GET', undefined, `?q=${encodeURIComponent(q)}`);
      setCards(data.text ?? []);
      const found = (data.records ?? []).map((r: { id: string }) => r.id);
      setIds(found);
      setTarget(found[0] ?? '');
      if (!found.length) setMsg('Nenhum jogador com esse nome na base.');
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const run = async (body: unknown) => {
    setMsg('');
    try {
      const data = await call('POST', body);
      setMsg(data.result ?? (data.results ?? []).map((r: { line: string; result: string }) => `${r.line} → ${r.result}`).join('\n'));
      if (q) await search();
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const player = target || q;

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px', fontFamily: 'var(--body)', color: 'var(--white)', fontSize: 18 }}>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 40, margin: '0 0 16px' }}>Jogadores · dados à mão</h1>

      <section style={box}>
        <label>ADMIN_KEY (fica só nesta aba)</label>
        <input style={input} type="password" value={key} onChange={(e) => saveKey(e.target.value)} />
      </section>

      <section style={box}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={input} placeholder="Nome do jogador (ex.: Rogério Ceni) ou id Q do Wikidata" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
          <button style={button} onClick={search}>Buscar</button>
        </div>
        {cards.map((c, i) => (
          <pre key={ids[i] ?? i} style={{ whiteSpace: 'pre-wrap', background: '#06130c', borderRadius: 8, padding: 12, marginTop: 12, border: target === ids[i] ? '2px solid var(--lime)' : '1px solid var(--panel-line)', cursor: 'pointer' }} onClick={() => setTarget(ids[i])}>
            {c}
          </pre>
        ))}
      </section>

      <section style={box}>
        <h2 style={{ margin: '0 0 8px' }}>Corrigir um número</h2>
        <p style={{ color: 'var(--muted)', margin: '0 0 8px' }}>Vale para todos os grupos e tem prioridade sobre o Wikidata e a IA. {ids.length > 1 ? 'Clique na ficha certa acima.' : ''}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <select style={input} value={stat} onChange={(e) => setStat(e.target.value)}>
            {STATS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <input style={input} placeholder="Valor (ex.: 131 ou 60,5)" value={value} onChange={(e) => setValue(e.target.value)} />
          <input style={input} placeholder="Fonte" value={source} onChange={(e) => setSource(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={button} disabled={!player || !value} onClick={() => run({ player, stat, value, source })}>Salvar</button>
            <button style={{ ...button, background: 'var(--panel-line)', color: 'var(--white)' }} disabled={!player} onClick={() => run({ player, stat, value: null })}>Apagar correção</button>
          </div>
        </div>
      </section>

      <section style={box}>
        <h2 style={{ margin: '0 0 8px' }}>Nome famoso aceito</h2>
        <p style={{ color: 'var(--muted)', margin: '0 0 8px' }}>Exceção à regra de nomes (ex.: Gabigol = Gabriel Barbosa).</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={input} placeholder="Nome famoso" value={alias} onChange={(e) => setAlias(e.target.value)} />
          <button style={button} disabled={!player || !alias} onClick={() => run({ alias, player })}>Cadastrar</button>
        </div>
      </section>

      <section style={box}>
        <h2 style={{ margin: '0 0 8px' }}>Lote</h2>
        <p style={{ color: 'var(--muted)', margin: '0 0 8px' }}>Uma linha por número: <code>jogador; dado; valor; data; fonte</code>. Data e fonte são opcionais.</p>
        <textarea style={{ ...input, minHeight: 140, fontFamily: 'monospace' }} placeholder={'Rogério Ceni; gols; 131; 18/11/2026; Transfermarkt\nNeymar; valor atual; 25'} value={csv} onChange={(e) => setCsv(e.target.value)} />
        <button style={{ ...button, marginTop: 8 }} disabled={!csv.trim()} onClick={() => run({ csv })}>Enviar lote</button>
      </section>

      {msg && <pre style={{ ...box, whiteSpace: 'pre-wrap' }}>{msg}</pre>}
    </main>
  );
}
