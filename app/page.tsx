import Link from 'next/link';
import { ArrowRight, Cpu, Layers3, Sparkles } from 'lucide-react';

const posts = [
  {
    slug: 'low-code-com-ia-para-desenvolvedores',
    title: 'Low-Code com IA: como acelerar entregas sem perder engenharia',
    excerpt:
      'Um guia prático para combinar automações, agentes e revisão técnica em fluxos de desenvolvimento reais.',
    category: 'Low-Code',
    readTime: '7 min'
  },
  {
    slug: 'arquitetura-de-agentes-ia',
    title: 'Arquitetura de agentes de IA para produtos SaaS',
    excerpt:
      'Como pensar em contexto, ferramentas, memória, segurança e custos antes de colocar agentes em produção.',
    category: 'IA',
    readTime: '9 min'
  },
  {
    slug: 'docker-nextjs-vps-dokploy',
    title: 'Deploy de Next.js em VPS com Docker e Dokploy',
    excerpt:
      'Configuração standalone, imagem leve e checklist para publicar aplicações modernas fora de plataformas serverless.',
    category: 'DevOps',
    readTime: '6 min'
  }
];

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
            <Cpu className="h-5 w-5" />
          </span>
          <span>
            <strong className="block text-base font-semibold text-white">LevellingDev</strong>
            <span className="text-xs text-slate-400">IA, código e automação</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/blog/low-code-com-ia-para-desenvolvedores" className="hover:text-white">
            Artigos
          </Link>
          <Link href="/politica-de-privacidade" className="hover:text-white">
            Privacidade
          </Link>
          <Link href="/contato" className="hover:text-white">
            Contato
          </Link>
        </nav>
      </div>
    </header>
  );
}

function AdSidebar() {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-lg border border-dashed border-cyan/35 bg-white/[0.03] p-5 text-center shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">Publicidade</p>
        <div className="mt-4 flex min-h-72 items-center justify-center rounded-md border border-white/10 bg-black/25 px-4">
          <p className="text-sm leading-6 text-slate-300">
            [Espaco reservado para anuncio Google AdSense - Sidebar]
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function Home() {
  return (
    <main>
      <Header />
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_360px] lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-sm text-mint">
              <Sparkles className="h-4 w-4" />
              Guias praticos para devs que constroem com IA
            </div>
            <h1 className="mt-7 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Suba de nivel em desenvolvimento, automacao e produtos inteligentes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              O LevellingDev reune tutoriais de Low-Code, IA aplicada, Docker, arquitetura SaaS e boas praticas para
              transformar ideias em sistemas prontos para producao.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/blog/low-code-com-ia-para-desenvolvedores"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Ler artigo inicial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan/60 hover:bg-white/5"
              >
                Falar com o Leveling Dev
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center gap-3 text-mint">
              <Layers3 className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">Stack editorial</span>
            </div>
            <div className="mt-8 space-y-5">
              {['Next.js App Router', 'IA Generativa', 'Low-Code consciente', 'Docker em VPS'].map((item) => (
                <div key={item} className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-200">{item}</span>
                  <span className="h-2 w-2 rounded-full bg-cyan" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">Ultimos posts</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Tutoriais e analises</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-lg border border-white/10 bg-panel/72 p-6 transition hover:-translate-y-1 hover:border-cyan/45 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="rounded-full border border-white/10 px-3 py-1">{post.category}</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold leading-snug text-white group-hover:text-cyan">
                  {post.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-300">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
        <AdSidebar />
      </section>
    </main>
  );
}
