import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorClient } from './editor-client';

export const metadata: Metadata = {
  title: 'Editor',
  description: 'Editor administrativo do LevellingDev.'
};

export default function EditorPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <Link href="/" className="text-sm text-cyan hover:text-white">
        Voltar para Home
      </Link>
      <header className="mt-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Painel editorial</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Editor e radar de noticias</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Crie posts manuais, sincronize noticias reais por RSS e mantenha o blog atualizado com fontes oficiais. Para
          publicar automaticamente em producao, configure PostgreSQL e ADMIN_TOKEN no Dokploy.
        </p>
      </header>
      <div className="mt-10">
        <EditorClient />
      </div>
    </main>
  );
}
