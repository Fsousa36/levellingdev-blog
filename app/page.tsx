import Link from 'next/link';
import { ArrowRight, Cpu, ExternalLink, Layers3, Sparkles } from 'lucide-react';
import { TopicLab } from './components/topic-lab';
import { getAllPosts, getCategories } from './lib/blog';

const siteUrl = 'https://levelingdev.com.br';

export const dynamic = 'force-dynamic';

function stripInlineLinks(text: string) {
  return text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1');
}

function categorySlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/86 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
            <Cpu className="h-5 w-5" />
          </span>
          <span>
            <strong className="block text-base font-semibold text-white">LevellingDev</strong>
            <span className="text-xs text-slate-400">IA, codigo e automacao</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <Link href="#artigos" className="hover:text-white">
            Artigos
          </Link>
          <Link href="/politica-de-privacidade" className="hover:text-white">
            Privacidade
          </Link>
          <Link href="/termos-de-uso" className="hover:text-white">
            Termos
          </Link>
          <Link href="/contato" className="hover:text-white">
            Contato
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>LevellingDev publica guias originais sobre IA, low-code, seguranca e deploy moderno.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/politica-de-privacidade" className="hover:text-white">
            Politica de Privacidade
          </Link>
          <Link href="/termos-de-uso" className="hover:text-white">
            Termos de Uso
          </Link>
          <Link href="/contato" className="hover:text-white">
            Contato
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default async function Home() {
  const posts = await getAllPosts();
  const categories = await getCategories();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'LevellingDev',
    url: siteUrl,
    description:
      'Blog sobre inteligencia artificial aplicada, low-code, desenvolvimento de software, seguranca e deploy em VPS.',
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: '2026-06-07',
      image: post.image,
      author: {
        '@type': 'Organization',
        name: 'LevellingDev'
      }
    }))
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />

      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_420px] lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-sm text-mint">
              <Sparkles className="h-4 w-4" />
              Conteudo humano para devs que trabalham com IA
            </div>
            <h1 className="mt-7 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Engenharia moderna sem hype barato: IA, low-code, seguranca e deploy na vida real.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              O LevellingDev transforma pesquisas, pratica de desenvolvimento e operacao de produtos em guias que da
              para ler com calma, aplicar no projeto e revisar com criterio.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/blog/${posts[0].slug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Comecar pelo guia de IA
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://survey.stackoverflow.co/2025/ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan/60 hover:bg-white/5"
              >
                Ver pesquisa usada
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-glow">
            <img
              src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80"
              alt="Pessoa programando em notebook com codigo na tela"
              className="h-64 w-full object-cover"
            />
            <div className="p-6">
              <div className="flex items-center gap-3 text-mint">
                <Layers3 className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.18em]">Linha editorial</span>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-slate-300">
              {['Agentes de IA com revisão humana', 'Low-code com governança', 'Segurança em código gerado por IA', 'Next.js, Docker e VPS'].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span>{item}</span>
                    <span className="h-2 w-2 rounded-full bg-cyan" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="artigos" className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">Artigos principais</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Assuntos atuais, escritos do zero</h2>
          <p className="mt-4 leading-7 text-slate-300">
            Cada card abre uma pagina completa, com contexto, leitura tecnica e texto revisado para ficar claro,
            util e pronto para decisao pratica.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/categoria/${categorySlug(category.name)}`}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-cyan/50 hover:text-cyan"
            >
              {category.name} ({category.total})
            </Link>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-lg border border-white/10 bg-panel/72 transition hover:-translate-y-1 hover:border-cyan/45 hover:bg-white/[0.06]"
            >
              <img src={post.image} alt={post.imageAlt} className="h-56 w-full object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="rounded-full border border-white/10 px-3 py-1">{post.category}</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold leading-snug text-white group-hover:text-cyan">
                  {post.title}
                </h3>
                <p className="summary-clamp mt-4 text-sm leading-6 text-slate-300">{stripInlineLinks(post.description)}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan">
                  Ler artigo completo
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 md:grid-cols-3">
          {[
            ['Pesquisa', 'Temas escolhidos a partir de sinais de mercado, pesquisas de devs e documentacao tecnica.'],
            ['Pratica', 'Cada texto prioriza impacto real, riscos, comandos e decisoes que ajudam no projeto.'],
            ['SEO limpo', 'Rotas estaticas, sitemap, robots, metadados e conteudo com intencao clara de busca.']
          ].map(([title, copy]) => (
            <div key={title} className="rounded-lg border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <TopicLab />
      <Footer />
    </main>
  );
}
