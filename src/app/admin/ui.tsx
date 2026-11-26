'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Peças das páginas do admin (jogadores e Rosto Borrado). A ADMIN_KEY fica só
 * nesta aba (sessionStorage) e vai no cabeçalho de cada pedido.
 */

export const box: CSSProperties = { background: 'var(--panel)', border: '1px solid var(--panel-line)', borderRadius: 12, padding: 16, marginBottom: 16 };
export const input: CSSProperties = {
  background: '#06130c', color: 'var(--white)', border: '1px solid var(--panel-line)', borderRadius: 8, padding: '8px 10px', fontSize: 16, width: '100%', minWidth: 0,
};
export const button: CSSProperties = { background: 'var(--lime)', color: '#06130c', border: 0, borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 16, cursor: 'pointer', whiteSpace: 'nowrap' };
export const ghost: CSSProperties = { ...button, background: 'var(--panel-line)', color: 'var(--white)' };
export const danger: CSSProperties = { ...button, background: '#ff6b6b', color: '#1a0505' };
export const muted: CSSProperties = { color: 'var(--muted)' };

export function useAdminKey() {
  const [key, setKeyState] = useState('');
  useEffect(() => {
    try {
      setKeyState(sessionStorage.getItem('adminKey') ?? '');
    } catch {
      /* sem armazenamento: digita de novo */
    }
  }, []);
  const setKey = (k: string) => {
    setKeyState(k);
    try {
      sessionStorage.setItem('adminKey', k);
    } catch {
      /* ignora */
    }
  };
  /** Pedido JSON com a chave; erro da API vira exceção com a mensagem dela. */
  const api = async <T,>(path: string, init?: { method?: 'GET' | 'POST'; body?: unknown }): Promise<T> => {
    const res = await fetch(path, {
      method: init?.method ?? 'GET',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (res.status === 401) throw new Error('ADMIN_KEY errada.');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `erro ${res.status}`);
    return data as T;
  };
  /** Pedido que devolve imagem (com a chave): vira um endereço local para o <img>. */
  const image = async (path: string, body?: unknown): Promise<string> => {
    const res = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `erro ${res.status}`);
    }
    return URL.createObjectURL(await res.blob());
  };
  return { key, setKey, api, image };
}

const TABS = [
  ['/admin/jogadores', 'Jogadores'],
  ['/admin/rostos', 'Rosto Borrado'],
] as const;

export function AdminShell({ title, current, adminKey, onKey, children }: { title: string; current: string; adminKey: string; onKey: (k: string) => void; children: ReactNode }) {
  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '20px 16px 48px', fontFamily: 'var(--body)', color: 'var(--white)', fontSize: 17 }}>
      <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {TABS.map(([href, label]) => (
          <Link key={href} href={href} style={{ ...(href === current ? button : ghost), textDecoration: 'none', fontSize: 15 }}>
            {label}
          </Link>
        ))}
      </nav>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 36, lineHeight: 1.1, margin: '0 0 14px' }}>{title}</h1>
      <section style={box}>
        <label style={{ display: 'block', marginBottom: 6 }}>ADMIN_KEY (fica só nesta aba)</label>
        <input style={input} type="password" autoComplete="off" value={adminKey} onChange={(e) => onKey(e.target.value)} />
      </section>
      {children}
    </main>
  );
}

export function Notice({ text, onClose }: { text: string; onClose: () => void }) {
  if (!text) return null;
  const bad = /^(erro|não|ADMIN_KEY|falta|foto|nome|marque|dado|posição|valor)/i.test(text) && !text.startsWith('✅');
  return (
    <div
      role="status"
      style={{
        position: 'sticky', bottom: 12, zIndex: 5, ...box, marginTop: 8, whiteSpace: 'pre-wrap',
        borderColor: bad ? '#ff6b6b' : 'var(--lime)', display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between',
      }}
    >
      <span>{text}</span>
      <button style={{ ...ghost, padding: '4px 10px' }} onClick={onClose} aria-label="Fechar">×</button>
    </div>
  );
}
