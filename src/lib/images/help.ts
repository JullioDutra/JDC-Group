import type { ReactElement } from 'react';
import { CATEGORIES_LINE, DUEL_COMMANDS, GROUP_GAMES, IN_GAME_COMMANDS, NAMES_LINE } from '../game/commands';
import { C, DISPLAY, box, brand, pill, stage, txt } from './theme';

/** Imagem da ajuda: todos os comandos numa tela. */
const upper = (s: string) => s.toLocaleUpperCase('pt-BR');

function gameCard([command, what]: [string, string]): ReactElement {
  return box(
    {
      flexDirection: 'column', justifyContent: 'center', width: 476, height: 54, padding: '0 16px', borderRadius: 12,
      backgroundColor: C.panel, border: `2px solid ${C.panelLine}`,
    },
    txt(upper(command), { fontFamily: DISPLAY, fontSize: 24, color: C.lime, lineHeight: 1.05 }),
    txt(what, { fontSize: 18, color: C.muted, fontWeight: 600, lineHeight: 1.1 }),
  );
}

function section(title: string, ...children: ReactElement[]): ReactElement {
  return box(
    { flexDirection: 'column', gap: 8, marginTop: 12 },
    txt(title, { fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.white }),
    ...children,
  );
}

export function helpMenu(): ReactElement {
  const half = Math.ceil(GROUP_GAMES.length / 2);
  const column = (list: typeof GROUP_GAMES) => box({ flexDirection: 'column', gap: 6 }, ...list.map(gameCard));
  return stage(
    box({ justifyContent: 'space-between', alignItems: 'center' }, brand(0.75), pill('COMANDOS', C.lime, C.ink, 24)),
    section(
      'EM GRUPO · MANDE O COMANDO, DEPOIS ENTRAR E COMEÇAR',
      box({ gap: 16 }, column(GROUP_GAMES.slice(0, half)), column(GROUP_GAMES.slice(half))),
    ),
    section(
      '1 X 1',
      box({ gap: 10, flexWrap: 'wrap' }, ...DUEL_COMMANDS.map(([c, w]) =>
        box(
          { alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 12, backgroundColor: C.panel, border: `2px solid ${C.panelLine}` },
          txt(upper(c), { fontFamily: DISPLAY, fontSize: 24, color: C.host }),
          txt(w, { fontSize: 19, color: C.muted, fontWeight: 600 }),
        ),
      )),
    ),
    section(
      'DURANTE O JOGO',
      box({ gap: 8, flexWrap: 'wrap' }, ...IN_GAME_COMMANDS.map((c) =>
        txt(upper(c), { fontFamily: DISPLAY, fontSize: 24, color: C.ink, backgroundColor: C.white, padding: '4px 14px', borderRadius: 10 }),
      )),
    ),
    box(
      { flexDirection: 'column', gap: 6, marginTop: 'auto', paddingTop: 14 },
      txt(CATEGORIES_LINE, { fontSize: 21, color: C.muted, fontWeight: 600, lineHeight: 1.2 }),
      txt(NAMES_LINE, { fontSize: 21, color: C.lime, fontWeight: 700, lineHeight: 1.2 }),
      txt('Também: REGRAS · MODOS · RANKING · FICHA <JOGADOR>', { fontSize: 21, color: C.white, fontWeight: 700 }),
    ),
  );
}
