import Link from 'next/link';
import { MODES } from '@/lib/game/modes';

const STEPS = [
  { img: 'desafio', title: '1. Desafio', text: 'Alguém manda "iniciar jogo". O primeiro que responder "aceitar" entra.' },
  { img: 'temas', title: '2. Tema', text: `O anfitrião escolhe entre ${MODES.length} temas — ou deixa a sorte decidir. Extras: cego e relâmpago.` },
  { img: 'inicio', title: '3. Regras na tela', text: 'Antes da bola rolar, uma imagem resume o tema e como vencer.' },
  { img: 'campinho', title: '4. Campinho', text: 'A cada rodada o campo é atualizado com os escalados e seus números.' },
];

const COMMANDS: Array<[string, string]> = [
  ['ativar jogos', 'liga o bot neste grupo'],
  ['iniciar jogo', 'lança um desafio'],
  ['iniciar aleatório', 'desafio com tema sorteado'],
  ['iniciar melhor time', 'clubes sorteados; IA ou grupo julga'],
  ['aceitar', 'entra como adversário'],
  ['abrir sala', 'Escalação em Grupo (até 10)'],
  ['top 10', 'acertem as posições de um ranking'],
  ['abrir que time é esse', 'time e ano pela escalação'],
  ['abrir quem é', 'o craque pelas dicas'],
  ['abrir intruso', 'marquem X; o que sobrar é o intruso'],
  ['abrir emoji', 'adivinhe pelo emoji'],
  ['abrir relâmpago', 'perguntas rápidas, o primeiro leva'],
  ['abrir alfabeto', 'letra + categoria, sem repetir'],
  ['abrir chute certo', 'chute o número, o mais perto ganha'],
  ['abrir bandeiraço', 'de que país é a bandeira'],
  ['abrir sobrevivente', 'um item por vez; errou, perde vida'],
  ['abrir conexões', '16 nomes, 4 grupos escondidos'],
  ['abrir stop', 'a Adedonha do grupo'],
  ['abrir draft', 'draft em serpente; o grupo vota'],
  ['abrir linha do tempo', 'ponha 4 acontecimentos em ordem'],
  ['abrir fato ou fake', 'verdade ou mito?'],
  ['… política / história', 'categoria no fim do comando (política só se pedir)'],
  ['entrar · começar', 'entra na sala · anfitrião dá a largada'],
  ['próxima', 'pula a pausa entre rodadas'],
  ['regras', 'explica o jogo'],
  ['modos', 'mostra os temas'],
  ['placar', 'campinho da partida'],
  ['ranking', 'tabela do grupo (top 10)'],
  ['ranking b', 'do 11º ao 20º'],
  ['simulador', 'Brasileirão 2026: quem cai (e a página para simular)'],
  ['tempo', 'cobra quem estourou o relógio'],
  ['cancelar', 'desiste da partida'],
  ['desativar jogos', 'desliga o bot'],
];

const RESTRICTION = { none: 'qualquer jogador', club: 'clube sorteado', country: 'seleção sorteada' } as const;

export default function Home() {
  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand">
          <img src="/icon.svg" alt="" />
          <span>
            <small>DUELO DE</small>CRAQUES
          </span>
        </Link>
        <Link href="/jogar" className="btn ghost">
          Simulador
        </Link>
      </header>

      <main>
        <div className="hero">
          <div>
            <h1>
              Quem entende <em>mais de bola?</em>
            </h1>
            <p>
              Um duelo 1 x 1 dentro do grupo de WhatsApp. Seis escolhas, um tema, e a IA conferindo cada jogador na
              hora.
            </p>
            <div className="cta">
              <a href="#como-funciona" className="btn">
                Como funciona
              </a>
              <Link href="/jogar" className="btn ghost">
                Testar no navegador
              </Link>
            </div>
          </div>
          <img src="/api/preview/campinho" alt="Exemplo do campinho com os jogadores escalados e seus gols" width={1080} height={1350} />
        </div>

        <section id="como-funciona">
          <p className="eyebrow">Como funciona</p>
          <h2>Tudo acontece no grupo</h2>
          <div className="steps">
            {STEPS.map((s) => (
              <figure key={s.img}>
                <img src={`/api/preview/${s.img}`} alt="" width={1080} height={1350} loading="lazy" />
                <figcaption>
                  <b>{s.title}</b>
                  {s.text}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow">Temas</p>
          <h2>{MODES.length} jeitos de provar que você sabe</h2>
          <ul className="modes">
            {MODES.map((m) => (
              <li key={m.id}>
                <span className="n">{m.number}</span>
                <span>
                  <b>{m.name}</b>
                  <small>
                    {m.tagline.split(' · ')[0]} · {RESTRICTION[m.restriction]} ·{' '}
                    <span className={m.direction === 'low' ? 'low' : undefined}>
                      {m.direction === 'high' ? 'maior soma vence' : 'menor soma vence'}
                    </span>
                  </small>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="eyebrow">Comandos</p>
          <h2>O que mandar no grupo</h2>
          <ul className="cmds">
            {COMMANDS.map(([cmd, what]) => (
              <li key={cmd}>
                <b>{cmd}</b>
                {what}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer>
        Duelo de Craques · Os números vêm de IA (Maritaca) e podem ter pequenas diferenças em relação às fontes
        oficiais.
      </footer>
    </div>
  );
}
