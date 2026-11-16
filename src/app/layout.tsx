import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Duelo de Craques — o jogo de futebol do seu grupo de WhatsApp',
  description:
    'Desafie um amigo no grupo, escale goleiro, defensores, meias e atacante dentro do tema sorteado e prove quem entende mais de futebol.',
};

export const viewport: Viewport = { themeColor: '#06130C' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
