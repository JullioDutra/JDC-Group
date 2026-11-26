import { redirect } from 'next/navigation';

/** /admin abre a página dos jogadores (de lá, o menu leva ao Rosto Borrado). */
export default function AdminHome() {
  redirect('/admin/jogadores');
}
