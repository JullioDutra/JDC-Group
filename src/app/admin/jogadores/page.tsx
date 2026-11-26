'use client';

import { useEffect, useRef, useState } from 'react';
import { AdminShell, Notice, box, button, ghost, input, muted, useAdminKey } from '../ui';

/**
 * Página do admin para dados à mão: buscar o jogador pelo nome, ver cada
 * número com a fonte que vale hoje e corrigir na linha. Também: clube e
 * posição que faltam, nome famoso e lote colado. A correção vale para todos
 * os grupos e tem prioridade sobre Transfermarkt, Wikipédia, Wikidata e IA.
 */

interface Field {
  stat: string;
  label: string;
  value: number | null;
  origin: 'admin' | 'transfermarkt' | 'wikipedia' | 'base' | 'nenhuma';
  source: string;
}
interface View {
  id: string;
  name: string;
  aliases: string[];
  birthDate: string | null;
  nationality: string | null;
  positions: string[];
  clubs: Array<{ name: string; source?: string }>;
  fame: number;
  fields: Field[];
}

const ORIGIN: Record<Field['origin'], { label: string; color: string }> = {
  admin: { label: 'sua correção', color: 'var(--lime)' },
  transfermarkt: { label: 'Transfermarkt', color: '#7cc4ff' },
  wikipedia: { label: 'Wikipédia', color: '#e6e6e6' },
  base: { label: 'Wikidata ou IA', color: '#ffc861' },
  nenhuma: { label: 'sem número', color: 'var(--muted)' },
};

const brDate = (iso: string | null) => (iso ? iso.split('-').reverse().join('/') : '');
const fmt = (n: number | null, stat = '') => (n === null ? '—' : n.toLocaleString('pt-BR', { maximumFractionDigits: 1, useGrouping: stat !== 'debutYear' }));

export default function AdminPlayers() {
  const { key, setKey, api } = useAdminKey();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<View[]>([]);
  const [searching, setSearching] = useState(false);
  const [sel, setSel] = useState<View | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [source, setSource] = useState('Transfermarkt');
  const [club, setClub] = useState('');
  const [position, setPosition] = useState('ATA');
  const [alias, setAlias] = useState('');
  const [csv, setCsv] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const latest = useRef('');

  const search = async (text: string) => {
    const query = text.trim();
    if (!key || query.length < 2) return;
    latest.current = query;
    setSearching(true);
    try {
      const data = await api<{ views: View[] }>(`/api/admin/players/manual?q=${encodeURIComponent(query)}`);
      if (latest.current !== query) return; // chegou resposta de uma busca antiga
      setResults(data.views ?? []);
      if (!data.views?.length) setMsg(`Nenhum jogador "${query}" na base.`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      if (latest.current === query) setSearching(false);
    }
  };

  // Busca enquanto digita (espera parar de digitar).
  useEffect(() => {
    if (!key || q.trim().length < 3) return;
    const t = setTimeout(() => void search(q), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, key]);

  const refresh = async (id: string) => {
    const data = await api<{ views: View[] }>(`/api/admin/players/manual?q=${encodeURIComponent(id)}`);
    const fresh = data.views?.[0];
    if (fresh) {
      setSel(fresh);
      setResults((rs) => rs.map((r) => (r.id === id ? fresh : r)));
    }
  };

  const post = async (body: Record<string, unknown>) => {
    if (!sel) return;
    setBusy(true);
    setMsg('');
    try {
      const data = await api<{ result?: string; results?: Array<{ line: string; result: string }> }>('/api/admin/players/manual', { method: 'POST', body });
      setMsg(data.result ?? (data.results ?? []).map((r) => `${r.line} → ${r.result}`).join('\n'));
      await refresh(sel.id);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const saveStat = async (f: Field) => {
    const raw = (edits[f.stat] ?? '').trim();
    if (!raw) return;
    await post({ player: sel!.id, stat: f.stat, value: raw, source: source.trim() || 'admin' });
    setEdits((e) => ({ ...e, [f.stat]: '' }));
  };

  const sendBatch = async () => {
    setBusy(true);
    setMsg('');
    try {
      const data = await api<{ results: Array<{ line: string; result: string }> }>('/api/admin/players/manual', { method: 'POST', body: { csv } });
      setMsg(data.results.map((r) => `${r.line} → ${r.result}`).join('\n') || 'Nada para enviar.');
      if (sel) await refresh(sel.id);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell title="Jogadores · corrigir números" current="/admin/jogadores" adminKey={key} onKey={setKey}>
      <section style={box}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={input}
            placeholder="Nome do jogador (ex.: Rogério Ceni) ou id Q do Wikidata"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search(q)}
            autoCapitalize="words"
          />
          <button style={button} onClick={() => search(q)} disabled={!key}>Buscar</button>
        </div>
        {!key && <p style={{ ...muted, margin: '8px 0 0' }}>Cole a ADMIN_KEY acima para buscar.</p>}
        {searching && <p style={{ ...muted, margin: '8px 0 0' }}>Buscando…</p>}
        {results.length > 0 && (
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSel(r);
                  setEdits({});
                }}
                style={{
                  textAlign: 'left', background: '#06130c', color: 'var(--white)', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontSize: 16,
                  border: sel?.id === r.id ? '2px solid var(--lime)' : '1px solid var(--panel-line)',
                }}
              >
                <strong>{r.name}</strong>
                <span style={muted}>
                  {' · '}
                  {[r.positions.join('/'), r.nationality, r.birthDate ? `nasceu em ${brDate(r.birthDate)}` : '', r.id].filter(Boolean).join(' · ')}
                </span>
                {r.clubs.length > 0 && <div style={{ ...muted, fontSize: 14, marginTop: 2 }}>{r.clubs.slice(0, 6).map((c) => c.name).join(', ')}{r.clubs.length > 6 ? '…' : ''}</div>}
              </button>
            ))}
          </div>
        )}
      </section>

      {sel && (
        <>
          <section style={box}>
            <h2 style={{ margin: '0 0 4px' }}>{sel.name}</h2>
            <p style={{ ...muted, margin: '0 0 8px' }}>
              {[sel.positions.join('/'), sel.nationality, sel.birthDate ? `nasceu em ${brDate(sel.birthDate)}` : '', `id ${sel.id}`].filter(Boolean).join(' · ')}
              {sel.aliases.length > 0 && <><br />Também: {sel.aliases.join(', ')}</>}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', margin: '0 0 12px' }}>
              <label htmlFor="fonte">Fonte das correções:</label>
              <input id="fonte" style={{ ...input, width: 220 }} value={source} onChange={(e) => setSource(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {sel.fields.map((f) => (
                <div key={f.stat} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--panel-line)' }}>
                  <div style={{ flex: '1 1 210px', minWidth: 0 }}>
                    <div>{f.label}</div>
                    <div style={{ fontSize: 13, color: ORIGIN[f.origin].color }}>
                      {f.origin === 'admin' ? `✍️ ${f.source}` : f.origin === 'nenhuma' ? 'sem número' : `${ORIGIN[f.origin].label}${f.source.includes('·') ? ` · ${f.source.split('·').slice(1).join('·').trim()}` : ''}`}
                    </div>
                  </div>
                  <strong style={{ width: 80, textAlign: 'right', fontSize: 20 }}>{fmt(f.value, f.stat)}</strong>
                  <div style={{ display: 'flex', gap: 6, flex: '1 1 220px' }}>
                    <input
                      style={input}
                      inputMode="decimal"
                      placeholder="novo valor"
                      value={edits[f.stat] ?? ''}
                      onChange={(e) => setEdits((x) => ({ ...x, [f.stat]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && saveStat(f)}
                    />
                    <button style={button} disabled={busy || !(edits[f.stat] ?? '').trim()} onClick={() => saveStat(f)}>Salvar</button>
                    {f.origin === 'admin' && (
                      <button style={ghost} disabled={busy} title="Apagar sua correção e voltar ao número automático" onClick={() => post({ player: sel.id, stat: f.stat, value: null })}>
                        ↩︎
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={box}>
            <h2 style={{ margin: '0 0 8px' }}>Clubes e posição</h2>
            <p style={{ ...muted, margin: '0 0 8px' }}>
              {sel.clubs.length ? sel.clubs.map((c) => (c.source ? `${c.name} (${c.source})` : c.name)).join(', ') : 'Sem clubes na ficha.'}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <input style={{ ...input, flex: '1 1 220px', width: 'auto' }} placeholder="Clube que falta (ex.: Fluminense)" value={club} onChange={(e) => setClub(e.target.value)} />
              <button style={button} disabled={busy || !club.trim()} onClick={() => post({ player: sel.id, club, source: source.trim() || 'admin' }).then(() => setClub(''))}>
                Confirmar passagem
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select style={{ ...input, width: 'auto' }} value={position} onChange={(e) => setPosition(e.target.value)}>
                <option value="GOL">goleiro</option>
                <option value="DEF">defensor</option>
                <option value="MEI">meia</option>
                <option value="ATA">atacante</option>
              </select>
              <button style={button} disabled={busy} onClick={() => post({ player: sel.id, position, source: source.trim() || 'admin' })}>
                Adicionar posição
              </button>
            </div>
          </section>

          <section style={box}>
            <h2 style={{ margin: '0 0 8px' }}>Nome famoso aceito</h2>
            <p style={{ ...muted, margin: '0 0 8px' }}>Exceção à regra de nomes (ex.: Gabigol = Gabriel Barbosa).</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={input} placeholder="Nome famoso" value={alias} onChange={(e) => setAlias(e.target.value)} />
              <button style={button} disabled={busy || !alias.trim()} onClick={() => post({ alias, player: sel.id }).then(() => setAlias(''))}>Cadastrar</button>
            </div>
          </section>
        </>
      )}

      <section style={box}>
        <h2 style={{ margin: '0 0 8px' }}>Lote</h2>
        <p style={{ ...muted, margin: '0 0 8px' }}>Uma linha por número: <code>jogador; dado; valor; data; fonte</code>. Data e fonte são opcionais.</p>
        <textarea style={{ ...input, minHeight: 120, fontFamily: 'monospace' }} placeholder={'Rogério Ceni; gols; 131; 18/11/2026; Transfermarkt\nNeymar; valor atual; 25'} value={csv} onChange={(e) => setCsv(e.target.value)} />
        <button style={{ ...button, marginTop: 8 }} disabled={busy || !csv.trim()} onClick={sendBatch}>Enviar lote</button>
      </section>

      <Notice text={msg} onClose={() => setMsg('')} />
    </AdminShell>
  );
}
