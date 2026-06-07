import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Entre em contato com o LevellingDev.'
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/" className="text-sm text-cyan hover:text-white">
        Voltar para a pagina inicial
      </Link>
      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.04] p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold text-white">Contato</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Use esta pagina para publicar o canal oficial de contato do LevellingDev. Substitua o email abaixo pelo
          endereco definitivo antes de enviar o site para analise final.
        </p>
        <div className="mt-8 rounded-lg border border-white/10 bg-black/25 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Email editorial</p>
          <a className="mt-2 block text-lg font-semibold text-cyan hover:text-white" href="mailto:contato@levelingdev.com.br">
            contato@levelingdev.com.br
          </a>
        </div>
      </section>
    </main>
  );
}
