import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Cpu } from 'lucide-react';
import { EditorClient } from './editor-client';

export const metadata: Metadata = {
  title: 'Editor',
  description: 'Editor administrativo do LevellingDev.'
};

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-ink">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
              <Cpu className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-sm font-semibold text-white sm:text-base">LevellingDev Editor</strong>
              <span className="block truncate text-xs text-slate-400">Painel editorial, IA e publicacoes</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-semibold text-slate-200 transition hover:border-cyan/50 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
        <EditorClient />
      </section>
    </main>
  );
}
