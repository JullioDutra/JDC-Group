'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AdminShell, Notice, box, button, danger, ghost, input, muted, useAdminKey } from '../ui';

/**
 * Fotos do Rosto Borrado: enviar uma foto (marcando os rostos com o dedo ou
 * o mouse), ver como o grupo vai ver, remarcar, esconder e excluir. As fotos
 * fixas (Wikimedia Commons, no código) só podem ser escondidas.
 */

type Face = [number, number, number, number];
interface Photo {
  id: string;
  name: string;
  aliases: string[];
  faces: Face[];
  credit: string;
  hidden: boolean;
  fixed: boolean;
  url?: string;
  createdAt?: string;
}

/** O que está aberto no editor: foto nova (dataUrl) ou uma existente (id). */
interface Draft {
  id?: string;
  fixed?: boolean;
  src: string;
  /** Foto nova, já reduzida, em JPEG (data URL). */
  dataUrl?: string;
  faces: Face[];
  name: string;
  aliases: string;
  credit: string;
}

const MAX_SIDE = 1600;

/** Lê a foto do aparelho e reduz (a foto do celular passa de 4 MB; o servidor aceita até ~4 MB por pedido). */
function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não consegui abrir essa foto. Use JPG ou PNG.'));
    };
    img.src = url;
  });
}

/** Foto com as caixas dos rostos: arraste para marcar; toque no × para tirar. */
function FaceEditor({ src, faces, onChange }: { src: string; faces: Face[]; onChange: (f: Face[]) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const point = (e: ReactPointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) };
  };
  const toFace = (d: NonNullable<typeof drag>): Face => [Math.min(d.x0, d.x1), Math.min(d.y0, d.y1), Math.abs(d.x1 - d.x0), Math.abs(d.y1 - d.y0)];
  return (
    <div
      ref={ref}
      style={{ position: 'relative', touchAction: 'none', userSelect: 'none', cursor: 'crosshair', lineHeight: 0, borderRadius: 8, overflow: 'hidden' }}
      onPointerDown={(e) => {
        const p = point(e);
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setDrag({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
      }}
      onPointerMove={(e) => {
        if (!drag) return;
        const p = point(e);
        setDrag({ ...drag, x1: p.x, y1: p.y });
      }}
      onPointerUp={() => {
        if (drag) {
          const f = toFace(drag);
          if (f[2] > 0.01 && f[3] > 0.01) onChange([...faces, f]);
        }
        setDrag(null);
      }}
      onPointerCancel={() => setDrag(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Foto para marcar os rostos" draggable={false} style={{ width: '100%', display: 'block', pointerEvents: 'none' }} />
      {[...faces, ...(drag ? [toFace(drag)] : [])].map(([x, y, w, h], i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%`,
            border: '3px solid var(--lime)', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(0,0,0,.5)', pointerEvents: 'none',
          }}
        >
          {i < faces.length && (
            <button
              aria-label="Tirar este rosto"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onChange(faces.filter((_, j) => j !== i));
              }}
              style={{ position: 'absolute', right: -12, top: -12, width: 26, height: 26, borderRadius: 13, border: 0, background: '#ff6b6b', color: '#1a0505', fontWeight: 700, pointerEvents: 'auto', cursor: 'pointer', lineHeight: '26px', padding: 0 }}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminRostos() {
  const { key, setKey, api, image } = useAdminKey();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [preview, setPreview] = useState<{ level: number; src: string } | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await api<{ photos: Photo[] }>('/api/admin/rostos');
      setPhotos(data.photos);
      // Miniaturas das enviadas (precisam da chave); as fixas vêm do Commons.
      for (const p of data.photos.filter((x) => !x.fixed && !thumbs[x.id])) {
        image(`/api/admin/rostos?id=${encodeURIComponent(p.id)}&img=1`)
          .then((src) => setThumbs((t) => ({ ...t, [p.id]: src })))
          .catch(() => undefined);
      }
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  useEffect(() => {
    if (key.length >= 8) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setMsg('');
    setPreview(null);
    try {
      const dataUrl = await readPhoto(file);
      setDraft({ src: dataUrl, dataUrl, faces: [], name: '', aliases: '', credit: '' });
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const edit = (p: Photo) => {
    setPreview(null);
    setDraft({ id: p.id, fixed: p.fixed, src: p.fixed ? p.url! : thumbs[p.id] ?? '', faces: p.faces, name: p.name, aliases: p.aliases.join(', '), credit: p.fixed ? '' : p.credit });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showPreview = async (level: number) => {
    if (!draft) return;
    setBusy(true);
    try {
      const body = draft.dataUrl ? { action: 'preview', image: draft.dataUrl, faces: draft.faces, level } : { action: 'preview', id: draft.id, faces: draft.faces, level };
      setPreview({ level, src: await image('/api/admin/rostos', body) });
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const run = async (body: Record<string, unknown>, after?: () => void) => {
    setBusy(true);
    setMsg('');
    try {
      const data = await api<{ result: string }>('/api/admin/rostos', { method: 'POST', body });
      setMsg(data.result);
      after?.();
      await load();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!draft) return;
    const common = { name: draft.name, aliases: draft.aliases, credit: draft.credit, faces: draft.faces };
    if (draft.id) void run({ action: 'update', id: draft.id, ...common }, () => setDraft(null));
    else void run({ action: 'add', image: draft.dataUrl, ...common }, () => setDraft(null));
  };

  const active = photos.filter((p) => !p.hidden).length;

  return (
    <AdminShell title="Rosto Borrado · fotos" current="/admin/rostos" adminKey={key} onKey={setKey}>
      <section style={box}>
        <h2 style={{ margin: '0 0 8px' }}>{draft?.id ? `Editar: ${draft.name}` : 'Enviar foto'}</h2>
        {!draft && (
          <>
            <p style={{ ...muted, margin: '0 0 10px' }}>
              Use foto do craque <b>em jogo</b> (foto de pose entrega demais). Depois de escolher, arraste o dedo sobre cada rosto que aparece:
              o bot borra só o que estiver marcado.
            </p>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => pick(e.target.files?.[0])} />
            <button style={button} disabled={!key} onClick={() => fileRef.current?.click()}>Escolher foto</button>
          </>
        )}
        {draft && (
          <div style={{ display: 'grid', gap: 10 }}>
            {draft.src ? (
              <FaceEditor src={draft.src} faces={draft.faces} onChange={(faces) => setDraft({ ...draft, faces })} />
            ) : (
              <p style={muted}>Carregando a foto…</p>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={muted}>{draft.faces.length ? `${draft.faces.length} rosto(s) marcado(s)` : 'Arraste sobre o rosto para marcar.'}</span>
              {draft.faces.length > 0 && <button style={ghost} onClick={() => setDraft({ ...draft, faces: draft.faces.slice(0, -1) })}>Desfazer</button>}
            </div>
            <input style={input} placeholder="Nome do jogador (a resposta), ex.: Messi" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <input style={input} placeholder="Outros nomes aceitos, separados por vírgula (ex.: Lionel Messi, Leo Messi)" value={draft.aliases} onChange={(e) => setDraft({ ...draft, aliases: e.target.value })} />
            {!draft.fixed && (
              <input style={input} placeholder="Crédito da foto (autor ou de onde veio)" value={draft.credit} onChange={(e) => setDraft({ ...draft, credit: e.target.value })} />
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={ghost} disabled={busy || !draft.faces.length} onClick={() => showPreview(0)}>Ver borrão forte</button>
              <button style={ghost} disabled={busy || !draft.faces.length} onClick={() => showPreview(2)}>Ver borrão leve</button>
              <button style={button} disabled={busy || !draft.faces.length || draft.name.trim().length < 2} onClick={save}>
                {draft.id ? 'Salvar alterações' : 'Salvar foto'}
              </button>
              <button
                style={ghost}
                onClick={() => {
                  setDraft(null);
                  setPreview(null);
                }}
              >
                Cancelar
              </button>
            </div>
            {preview && (
              <figure style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.src} alt="Prévia com o rosto borrado" style={{ width: '100%', borderRadius: 8 }} />
                <figcaption style={{ ...muted, fontSize: 14 }}>Como o grupo vê no {preview.level === 0 ? 'borrão forte (primeira etapa)' : 'borrão leve (última etapa)'}.</figcaption>
              </figure>
            )}
          </div>
        )}
      </section>

      <section style={box}>
        <h2 style={{ margin: '0 0 4px' }}>Fotos do jogo</h2>
        <p style={{ ...muted, margin: '0 0 12px' }}>{photos.length ? `${active} no sorteio, ${photos.length - active} escondida(s).` : key ? 'Carregando…' : 'Cole a ADMIN_KEY acima.'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {photos.map((p) => {
            const src = p.fixed ? p.url : thumbs[p.id];
            return (
              <div key={p.id} style={{ background: '#06130c', border: '1px solid var(--panel-line)', borderRadius: 10, overflow: 'hidden', opacity: p.hidden ? 0.55 : 1 }}>
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={p.name} loading="lazy" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block', filter: 'blur(6px)' }} />
                ) : (
                  <div style={{ height: 150, display: 'grid', placeItems: 'center', ...muted }}>foto</div>
                )}
                <div style={{ padding: 10, display: 'grid', gap: 6 }}>
                  <div>
                    <strong>{p.name}</strong>
                    <div style={{ ...muted, fontSize: 13 }}>
                      {p.fixed ? 'fixa (Commons)' : `enviada${p.createdAt ? ` em ${p.createdAt.split('-').reverse().join('/')}` : ''}`} · {p.faces.length} rosto(s){p.hidden ? ' · escondida' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button style={{ ...ghost, padding: '6px 10px', fontSize: 14 }} disabled={busy || (!p.fixed && !thumbs[p.id])} onClick={() => edit(p)}>Editar</button>
                    <button style={{ ...ghost, padding: '6px 10px', fontSize: 14 }} disabled={busy} onClick={() => run({ action: 'hide', id: p.id, hidden: !p.hidden })}>
                      {p.hidden ? 'Mostrar' : 'Esconder'}
                    </button>
                    {!p.fixed && (
                      <button
                        style={{ ...danger, padding: '6px 10px', fontSize: 14 }}
                        disabled={busy}
                        onClick={() => window.confirm(`Excluir a foto de ${p.name}? Não dá para desfazer.`) && run({ action: 'delete', id: p.id })}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ ...muted, fontSize: 14, margin: '12px 0 0' }}>As miniaturas aparecem desfocadas aqui para não estragar a surpresa de quem estiver olhando junto.</p>
      </section>

      <Notice text={msg} onClose={() => setMsg('')} />
    </AdminShell>
  );
}
