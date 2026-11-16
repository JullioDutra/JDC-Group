'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Bubble =
  | { from: 'bot'; type: 'text'; text: string }
  | { from: 'bot'; type: 'image'; src: string; caption: string }
  | { from: 'bot'; type: 'timer'; seconds: number }
  | { from: 'player'; id: string; name: string; color: string; text: string; reaction?: string };

const COLORS = ['#38BDF8', '#FF8A3D', '#C084FC', '#F472B6', '#FACC15', '#34D399', '#F87171', '#60A5FA', '#A3E635', '#FB923C'];
const randomRoom = () => Math.random().toString(36).slice(2, 10);

/** Negrito no estilo do WhatsApp: *texto*. */
function rich(text: string) {
  return text.split(/\*([^*\n]+)\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
}

export default function Simulator() {
  const [key, setKey] = useState('');
  const [roster, setRoster] = useState('Rafa, Duda, Caio');
  const [sender, setSender] = useState('Rafa');
  const [draft, setDraft] = useState('');
  const [room, setRoom] = useState('');
  const [log, setLog] = useState<Bubble[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const chat = useRef<HTMLDivElement>(null);

  const players = roster.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10);
  const colorOf = (name: string) => COLORS[Math.max(0, players.indexOf(name)) % COLORS.length];

  useEffect(() => setRoom(randomRoom()), []);
  useEffect(() => {
    if (!players.includes(sender) && players[0]) setSender(players[0]);
  }, [roster]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    chat.current?.scrollTo({ top: chat.current.scrollHeight });
  }, [log]);

  async function call(payload: Record<string, unknown>, bubble?: Bubble) {
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key, room, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Falha no simulador.');
      setLog((current) => {
        let next = [...current];
        if (bubble && bubble.from === 'player') next.push({ ...bubble, id: data.messageId ?? bubble.id });
        for (const m of data.messages as Array<Record<string, unknown>>) {
          if (m.type === 'react') {
            next = next.map((b) => (b.from === 'player' && b.id === m.messageId ? { ...b, reaction: String(m.emoji) } : b));
          } else next.push({ from: 'bot', ...(m as object) } as Bubble);
        }
        return next;
      });
      setNotes([
        ...(data.demoAi ? ['IA em modo demo: elenco reduzido e números aproximados (configure MARITACA_API_KEY).'] : []),
        ...(data.volatile ? ['Sem banco configurado: a partida pode se perder entre requisições (configure DATABASE_URL).'] : []),
      ]);
    } catch (e) {
      if (bubble) setLog((l) => [...l, bubble]);
      setError(e instanceof Error ? e.message : 'Falha no simulador.');
    } finally {
      setBusy(false);
    }
  }

  function send(text: string) {
    if (!text.trim() || busy || !sender) return;
    setDraft('');
    call({ sender, text }, { from: 'player', id: crypto.randomUUID(), name: sender, color: colorOf(sender), text });
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
          O mesmo motor do WhatsApp. Comece com <code>ativar jogos</code>. Para 1 x 1: <code>iniciar jogo</code> e{' '}
          <code>aceitar</code>. Em grupo: <code>abrir sala</code> ou <code>top 10</code>, cada um manda <code>entrar</code>, e o
          anfitrião manda <code>começar</code>.
        </p>

        <div className="sim-bar">
          <label style={{ flex: '1 1 200px' }}>
            Chave de acesso (ADMIN_KEY)
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" />
          </label>
          <label style={{ flex: '2 1 260px' }}>
            Jogadores (separados por vírgula)
            <input value={roster} onChange={(e) => setRoster(e.target.value)} />
          </label>
        </div>

        <div className="chat" ref={chat} aria-live="polite">
          {log.length === 0 && <p className="note">Nenhuma mensagem ainda.</p>}
          {log.map((m, i) =>
            m.from === 'bot' ? (
              m.type === 'timer' ? (
                <p key={i} className="note" style={{ alignSelf: 'center' }}>
                  Rodada com prazo de {m.seconds}s (no WhatsApp o QStash fecha sozinho; aqui use “Fim do tempo”).
                </p>
              ) : (
                <div key={i} className="msg bot">
                  {m.type === 'image' && <img src={m.src} alt="Imagem enviada pelo bot" />}
                  {rich(m.type === 'image' ? m.caption : m.text)}
                </div>
              )
            ) : (
              <div key={i} className="msg player" style={{ background: m.color }}>
                <span className="who">{m.name}</span>
                {m.text}
                {m.reaction && <span className="reaction">{m.reaction}</span>}
              </div>
            ),
          )}
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        {notes.map((n) => (
          <p key={n} className="note">{n}</p>
        ))}

        <div className="senders" role="radiogroup" aria-label="Quem está falando">
          {players.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={sender === p}
              className={`chip${sender === p ? ' on' : ''}`}
              style={{ borderColor: colorOf(p), background: sender === p ? colorOf(p) : 'transparent' }}
              onClick={() => setSender(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
          <input aria-label={`Mensagem de ${sender}`} placeholder={`${sender} diz…`} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button className="btn" disabled={busy}>Enviar</button>
          <button type="button" className="btn ghost" disabled={busy} onClick={() => call({ tick: true })}>
            Fim do tempo
          </button>
        </form>
      </main>
    </div>
  );
}
