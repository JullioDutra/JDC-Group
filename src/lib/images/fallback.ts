import { getMode, MODES } from '../game/modes';
import { getTeam } from '../game/teams';
import { firstName, formatNumber } from '../game/text';
import { SLOTS, type ImageSpec, type Pick } from '../game/types';
import { getConexoes } from '../party/content/conexoes';
import { helpText } from '../game/commands';
import { getTop100 } from '../party/content/top100';
import { criterionLabel, parseCriterion } from '../party/gridCriteria';
import { aproveitamentoText } from '../game/season';

const GAME_NAME_FOR_TEXT = 'Duelo de Craques';

/**
 * Plano B quando a imagem não sai (falha de envio de mídia no WhatsApp):
 * o essencial da imagem em texto, para a partida não travar.
 */
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const pickText = (p: Pick | null | undefined) => (p ? `${p.name}${Number.isFinite(p.value) ? ` (${formatNumber(p.value)})` : ''}` : '—');

export function imageAsText(spec: ImageSpec): string | null {
  switch (spec.kind) {
    case 'help':
      return helpText(GAME_NAME_FOR_TEXT);
    case 'modes':
      return MODES.map((m) => `${m.number}. ${m.name} · ${m.tagline}`).join('\n');
    case 'season':
      return [
        `🏆 Fim da Temporada ${spec.season}: ${spec.rows[0]?.name ?? '—'} campeão!`,
        ...spec.rows.slice(0, 10).map((r, i) => `${i + 1}º ${r.name} · ${r.wins * 3 + r.draws} pts (${r.wins}V ${r.draws}E ${r.losses}D)`),
        ...spec.highlights.map((h) => `${h.label}: ${h.name} (${h.value})`),
      ].join('\n');
    case 'ranking':
      return spec.rows.length
        ? spec.rows.map((r, i) => `${i + (spec.start ?? 1)}º ${r.name} · ${r.wins * 3 + r.draws} pts · ${r.wins}V ${r.draws}E ${r.losses}D · ${aproveitamentoText(r)} de aproveitamento`).join('\n')
        : null;
    case 'kickoff':
    case 'pitch': {
      const s = spec.state;
      const mode = getMode(s.modeId);
      const lines = s.players.map((p, side) =>
        p ? `*${p.name}*: ${s.picks[side as 0 | 1].map((x, i) => `${SLOTS[i]} ${pickText(x)}`).join(' · ')}` : '',
      );
      return [mode ? `Tema: ${mode.name}` : '', ...lines].filter(Boolean).join('\n');
    }
    case 'partyLobby':
      return `Jogadores (${spec.state.players.length}): ${spec.state.players.map((p) => firstName(p.name)).join(', ')}`;
    case 'partyTable':
      return spec.state.players
        .map((p) => `*${firstName(p.name)}*: ${(spec.state.picks[p.jid] ?? []).map((x) => pickText(x)).join(' · ')}`)
        .join('\n');
    case 'top10Board':
      return spec.list.items
        .map((item, i) => {
          const who = spec.state.found[i];
          return `${item.rank}º ${who || spec.final ? item.name : '?'}${who ? ` (${firstName(who.name)})` : ''}`;
        })
        .join('\n');
    case 'lineupQuiz':
      return spec.lines.map((line) => line.join(' · ')).join('\n');
    case 'partyScore':
      return [...spec.state.players]
        .sort((a, b) => b.score - a.score)
        .map((p, i) => `${i + 1}º ${firstName(p.name)} — ${p.score}`)
        .join('\n');
    case 'intrusoBoard':
      return spec.state.options
        .map((name, i) => {
          const votes = spec.reveal ? spec.state.marks.filter((m) => m.index === i).map((m) => firstName(m.name)) : [];
          const tag = spec.reveal && i === spec.state.intruderIndex ? ' ← intruso' : '';
          return `*${LETTERS[i]}* ${name}${votes.length ? ` (${votes.join(', ')})` : ''}${tag}`;
        })
        .join('\n');
    case 'draftBoard':
      return [
        `Clube da rodada: ${getTeam(spec.state.clubs[spec.state.round])?.name ?? '—'}`,
        ...spec.state.players.map((p) => `*${firstName(p.name)}*: ${(spec.state.picks[p.jid] ?? []).map((x) => x?.name ?? '—').join(' · ')}`),
      ].join('\n');
    case 'flagQuiz':
      return 'A bandeira não carregou agora. O anfitrião pode mandar *próxima* para pular esta.';
    case 'conexoesBoard': {
      const puzzle = getConexoes(spec.state.order[spec.state.round]);
      const groups = puzzle?.groups ?? [];
      const solved = spec.state.solved.map((s) => `✅ ${groups[s.group]?.label}: ${groups[s.group]?.items.join(', ')}`);
      const solvedTiles = new Set(spec.state.solved.flatMap((s) => groups[s.group]?.items ?? []));
      const open = spec.state.tiles
        .map((t, i) => (solvedTiles.has(t) ? '' : `${i + 1}. ${t}`))
        .filter(Boolean);
      return [...solved, open.join('\n')].filter(Boolean).join('\n\n');
    }
    case 'top100Board': {
      const st = spec.state;
      const list = getTop100(st.listId);
      const lines = (list?.items ?? [])
        .map((it, i) => (st.found[i] ? `${it.rank}º ${it.name} (${firstName(st.found[i]!.name)})` : spec.final ? `${it.rank}º ${it.name}` : ''))
        .filter(Boolean);
      return [`*${list?.title ?? 'Top 100'}*`, ...lines].join('\n');
    }
    case 'gradeBoard': {
      const st = spec.state;
      const col = (raw: string) => criterionLabel(parseCriterion(raw, 'nation')).name;
      const row = (raw: string) => criterionLabel(parseCriterion(raw, 'club')).name;
      const head = `Colunas: ${st.cols.map((c, i) => `${i + 1} ${col(c)}`).join(' · ')}`;
      const rows = [0, 1, 2].map((r) => {
        const cells = [0, 1, 2].map((c) => {
          const cell = st.cells[r * 3 + c];
          return cell ? `${cell.name} (${firstName(st.players.find((p) => p.jid === cell.jid)?.name ?? '')})` : `${LETTERS[r]}${c + 1}`;
        });
        return `*${LETTERS[r]} ${row(st.rows[r])}*: ${cells.join(' | ')}`;
      });
      return [head, ...rows].join('\n');
    }
    case 'faceQuiz':
      return spec.answer ? `📸 Era *${spec.answer}*.` : '📸 A foto não chegou. O anfitrião pode mandar *pular*.';
    case 'textBoard':
      return [`*${spec.title}*`, ...spec.rows.map((r) => [`*${r.head}*`, ...r.lines].join('\n'))].join('\n\n');
    default:
      return null;
  }
}
