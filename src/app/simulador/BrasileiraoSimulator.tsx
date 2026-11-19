'use client';

import Link from 'next/link';
import { useDeferredValue, useMemo, useState } from 'react';
import {
  type Pick,
  type SimData,
  type SimMatch,
  matchKey,
  pct,
  remaining,
  shortDate,
  simulate,
  standings,
  teamName,
  zoneOf,
} from '@/lib/sim/brasileirao';

const ZONE_LABEL = { libertadores: 'G4', pre: 'Pré-Liberta', sula: 'Sul-Americana', z4: 'Z4' } as const;

/** Time ainda pode cair e ainda pode escapar (pelas simulações). */
const inFight = (best: number, worst: number) => best <= 16 && worst >= 17;

export default function BrasileiraoSimulator({ data }: { data: SimData }) {
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [onlyFight, setOnlyFight] = useState(true);
  const [copied, setCopied] = useState(false);
  const deferred = useDeferredValue(picks);

  const table = useMemo(() => standings(data, picks), [data, picks]);
  const odds = useMemo(() => simulate(data, deferred), [data, deferred]);
  const open = useMemo(() => remaining(data), [data]);
  const posOf = new Map(table.map((r, i) => [r.id, i + 1]));
  const fight = new Set(table.filter((r) => inFight(odds[r.id].best, odds[r.id].worst)).map((r) => r.id));
  const shown = (onlyFight ? open.filter((m) => fight.has(m[0]) || fight.has(m[1])) : open)
    .slice()
    .sort((a, b) => Math.max(odds[b[0]].z4 * (1 - odds[b[0]].z4), odds[b[1]].z4 * (1 - odds[b[1]].z4)) - Math.max(odds[a[0]].z4 * (1 - odds[a[0]].z4), odds[a[1]].z4 * (1 - odds[a[1]].z4)));
  const picked = Object.keys(picks).length;
  const allPicked = picked === open.length;

  const toggle = (m: SimMatch, pick: Pick) =>
    setPicks((prev) => {
      const next = { ...prev };
      if (next[matchKey(m)] === pick) delete next[matchKey(m)];
      else next[matchKey(m)] = pick;
      return next;
    });

  /** Quem cai: com todos os palpites, a tabela final; senão, os 4 com mais chance. */
  const relegated = allPicked
    ? table.slice(16).map((r) => r.name)
    : [...table].sort((a, b) => odds[b.id].z4 - odds[a.id].z4).slice(0, 4).map((r) => `${r.name} (${pct(odds[r.id].z4)})`);
  /** Texto para o grupo: montado só no clique (o endereço vem do navegador). */
  const shareText = () => [
    `📊 Meu simulador do Brasileirão 2026 (${picked} de ${open.length} jogos palpitados)`,
    `${allPicked ? '⬇️ Caem' : '⬇️ Mais perto de cair'}: ${relegated.join(', ')}`,
    `🏆 ${allPicked ? `Campeão: ${table[0].name}` : `Favorito ao título: ${[...table].sort((a, b) => odds[b.id].title - odds[a.id].title)[0].name}`}`,
    `Simule também: ${window.location.origin}/simulador`,
  ].join('\n');

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
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
      </header>

      <main className="br">
        <div>
          <p className="eyebrow">Brasileirão 2026 · Série A</p>
          <h1 className="br-title">Simulador: quem cai?</h1>
          <p className="br-sub">
            Faltam <b>{open.length} jogos</b>. Marque os resultados que você acha e veja a tabela final e a chance de cada time. Dados de{' '}
            {shortDate(data.update)} ({data.source}).
          </p>
        </div>

        <section className="br-panel" aria-labelledby="tabela">
          <div className="br-head">
            <h2 id="tabela">{allPicked ? 'Tabela final' : picked ? 'Tabela com os seus palpites' : 'Tabela atual'}</h2>
            <span className="br-legend">
              <i className="z-libertadores" /> G4 <i className="z-pre" /> Pré <i className="z-sula" /> Sula <i className="z-z4" /> Z4
            </span>
          </div>
          <div className="br-scroll">
            <table className="br-table">
              <thead>
                <tr>
                  <th aria-label="Posição">#</th>
                  <th className="l">Time</th>
                  <th>P</th>
                  <th>J</th>
                  <th>V</th>
                  <th>SG</th>
                  <th title="Chance de terminar no Z4">Cai</th>
                  <th title="Chance de terminar no G4">G4</th>
                  <th title="Chance de título">Título</th>
                </tr>
              </thead>
              <tbody>
                {table.map((r, i) => {
                  const o = odds[r.id];
                  const zone = zoneOf(i + 1);
                  return (
                    <tr key={r.id} className={zone ? `z-${zone}` : ''}>
                      <td className="pos" title={zone ? ZONE_LABEL[zone] : undefined}>{i + 1}</td>
                      <td className="l team">{r.name}</td>
                      <td className="pts">{r.p}</td>
                      <td>{r.j}</td>
                      <td>{r.v}</td>
                      <td>{r.sg > 0 ? `+${r.sg}` : r.sg}</td>
                      <td className={o.z4 >= 0.5 ? 'hot' : o.z4 > 0 ? 'warm' : 'zero'}>{pct(o.z4)}</td>
                      <td className={o.g4 > 0 ? '' : 'zero'}>{pct(o.g4)}</td>
                      <td className={o.title > 0 ? '' : 'zero'}>{pct(o.title)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="note">
            Chances: 5.000 simulações dos jogos sem palpite, pela força de ataque e defesa de cada time na campanha e o mando de campo. Palpite
            marcado vale 1 x 0, 1 x 1 ou 0 x 1. Desempate: pontos, vitórias, saldo, gols pró.
          </p>
        </section>

        <section className="br-panel" aria-labelledby="jogos">
          <div className="br-head">
            <h2 id="jogos">Jogos que faltam</h2>
            <div className="br-tabs" role="tablist">
              <button role="tab" aria-selected={onlyFight} className={onlyFight ? 'on' : ''} onClick={() => setOnlyFight(true)}>
                Briga contra a queda
              </button>
              <button role="tab" aria-selected={!onlyFight} className={!onlyFight ? 'on' : ''} onClick={() => setOnlyFight(false)}>
                Todos ({open.length})
              </button>
            </div>
          </div>
          {shown.length === 0 ? <p className="note">Nenhum jogo de quem ainda briga contra a queda.</p> : null}
          <ul className="br-games">
            {shown.map((m) => {
              const pick = picks[matchKey(m)];
              const tag = (id: string) => (
                <span className={`br-team ${fight.has(id) ? 'fight' : ''}`}>
                  {teamName(id)} <small>{posOf.get(id)}º</small>
                </span>
              );
              return (
                <li key={matchKey(m)}>
                  <div className="br-match">
                    {tag(m[0])}
                    <span className="x">x</span>
                    {tag(m[1])}
                  </div>
                  <div className="br-picks" role="group" aria-label={`${teamName(m[0])} x ${teamName(m[1])}`}>
                    {(['H', 'D', 'A'] as Pick[]).map((p) => (
                      <button key={p} aria-pressed={pick === p} className={pick === p ? 'on' : ''} onClick={() => toggle(m, p)}>
                        {p === 'H' ? teamName(m[0]) : p === 'A' ? teamName(m[1]) : 'Empate'}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="br-actions">
            <button className="btn ghost" onClick={() => setPicks({})} disabled={!picked}>
              Limpar palpites
            </button>
            <button className="btn" onClick={copy}>
              {copied ? 'Copiado!' : 'Copiar para o grupo'}
            </button>
            <button className="btn ghost" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText())}`, '_blank', 'noopener')}>
              Mandar no WhatsApp
            </button>
          </div>
        </section>
      </main>

      <footer>
        Fonte: {data.source}, atualizado em {shortDate(data.update)}. A página relê a fonte a cada hora. No grupo, mande <b>simulador</b> para ver
        quem está mais perto de cair.
      </footer>
    </div>
  );
}
