'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Bubble =
  | { from: 'bot'; type: 'text'; text: string }
  | { from: 'bot'; type: 'image'; src: string; caption: string }
  | { from: 0 | 1; type: 'text'; text: string; name: string };

/** Negrito no estilo do WhatsApp: *texto*. */
function rich(text: string) {
  return text.split(/\*([^*\n]+)\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
}

const randomRoom = () => Math.random().toString(36).slice(2, 10);

export default function Simulator() {
  const [key, setKey] = useState('');
  const [names, setNames] = useState(['Rafa', 'Duda']);
  const [drafts, setDrafts] = useState(['', '']);
  const [room, setRoom] = useState('');
  const [log, setLog] = useState<Bubble[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const chat = useRef<HTMLDivElement>(null);

  useEffect(() => setRoom(randomRoom()), []);
  useEffect(() => {
    chat.current?.scrollTo({ top: chat.current.scrollHeight });
  }, [log]);

  async function send(side: 0 | 1, text: string) {
    if (!text.trim() || busy) return;
    setError('');
    setBusy(true);
    setLog((l) => [...l, { from: side, type: 'text', text, name: names[side] }]);
    setDrafts((d) => d.map((v, i) => (i === side ? '' : v)));
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key, room, sender: names[side], text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Falha no simulador.');
      setLog((l) => [...l, ...data.messages.map((m: object) => ({ from: 'bot', ...m }) as Bubble)]);
      setNotes([
        ...(data.demoAi ? ['IA em modo demo: elenco reduzido e números aproximados (configure MARITACA_API_KEY).'] : []),
        ...(data.volatile ? ['Sem banco configurado: a partida pode se perder entre requisições (configure DATABASE_URL).'] : []),
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no simulador.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand">
          <img src="/icon.svg" alt="" />
          <span>
            <small>DUELO DE</small>CRAQUES
          </span>
        </Link>
        <button className="btn ghost" onClick={() => { setRoom(randomRoom()); setLog([]); }}>
          Novo grupo
        </button>
      </header>

      <main className="sim">
        <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)' }}>Simulador de grupo</h1>
        <p className="note">
          O mesmo motor do WhatsApp, com dois jogadores na mesma tela. Comece com <code>ativar grupo</code>, depois{' '}
          <code>iniciar jogo</code> e <code>aceitar</code>.
        </p>

        <div className="sim-bar">
          <label style={{ flex: '2 1 200px' }}>
            Chave de acesso (ADMIN_KEY)
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" />
          </label>
          {[0, 1].map((i) => (
            <label key={i} style={{ flex: '1 1 120px' }}>
              {i === 0 ? 'Jogador 1' : 'Jogador 2'}
              <input value={names[i]} maxLength={20} onChange={(e) => setNames((n) => n.map((v, j) => (j === i ? e.target.value : v)))} />
            </label>
          ))}
        </div>

        <div className="chat" ref={chat} aria-live="polite">
          {log.length === 0 && <p className="note">Nenhuma mensagem ainda.</p>}
          {log.map((m, i) =>
            m.from === 'bot' ? (
              <div key={i} className="msg bot">
                {m.type === 'image' && <img src={m.src} alt="Imagem enviada pelo bot" />}
                {rich(m.type === 'image' ? m.caption : m.text)}
              </div>
            ) : (
              <div key={i} className={`msg p${m.from}`}>
                <span className="who">{m.name}</span>
                {m.text}
              </div>
            ),
          )}
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        {notes.map((n) => (
          <p key={n} className="note">{n}</p>
        ))}

        <div className="send">
          {([0, 1] as const).map((side) => (
            <form key={side} onSubmit={(e) => { e.preventDefault(); send(side, drafts[side]); }}>
              <input
                aria-label={`Mensagem de ${names[side]}`}
                placeholder={`${names[side]} diz…`}
                value={drafts[side]}
                onChange={(e) => setDrafts((d) => d.map((v, i) => (i === side ? e.target.value : v)))}
              />
              <button className={`btn p${side}`} disabled={busy}>
                Enviar
              </button>
            </form>
          ))}
        </div>
      </main>
    </div>
  );
}
