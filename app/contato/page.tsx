import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com o LevellingDev sobre IA, low-code, desenvolvimento, parcerias e sugestoes de pauta.'
};

type ContactPageProps = {
  searchParams: Promise<{
    enviado?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { enviado } = await searchParams;
  const wasSent = enviado === '1';

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/" className="text-sm text-cyan hover:text-white">
        Voltar para Home
      </Link>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.04] p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
          <Mail className="h-6 w-6" />
        </div>

        <h1 className="mt-6 text-4xl font-semibold text-white">Contato</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Envie uma mensagem sobre sugestoes de pauta, parcerias, correcoes ou projetos envolvendo IA, low-code,
          automacao e desenvolvimento web.
        </p>

        {wasSent ? (
          <div className="mt-6 rounded-lg border border-mint/30 bg-mint/10 p-4 text-sm leading-6 text-mint">
            Mensagem enviada. Obrigado pelo contato.
          </div>
        ) : null}

        <form
          action="https://formsubmit.co/fssousa.gyn@gmail.com"
          method="POST"
          className="mt-8 grid gap-5"
        >
          <input type="hidden" name="_subject" value="Novo contato pelo LevellingDev" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_next" value="https://levelingdev.com.br/contato?enviado=1" />
          <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" />

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Nome
              <input
                required
                name="nome"
                type="text"
                placeholder="Seu nome"
                className="min-h-12 rounded-lg border border-white/10 bg-black/30 px-4 text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Email
              <input
                required
                name="email"
                type="email"
                placeholder="seu@email.com"
                className="min-h-12 rounded-lg border border-white/10 bg-black/30 px-4 text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Assunto
            <input
              required
              name="assunto"
              type="text"
              placeholder="Sobre o que voce quer falar?"
              className="min-h-12 rounded-lg border border-white/10 bg-black/30 px-4 text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Mensagem
            <textarea
              required
              name="mensagem"
              rows={7}
              placeholder="Escreva sua mensagem com o maximo de contexto possivel."
              className="resize-y rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
          </label>

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-cyan px-5 text-sm font-semibold text-ink transition hover:bg-white sm:w-fit"
          >
            Enviar mensagem
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 rounded-lg border border-white/10 bg-black/25 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Destino dos envios</p>
          <a className="mt-2 block text-lg font-semibold text-cyan hover:text-white" href="mailto:fssousa.gyn@gmail.com">
            fssousa.gyn@gmail.com
          </a>
        </div>
      </section>
    </main>
  );
}
