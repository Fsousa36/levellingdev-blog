import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getPostsByCategory } from '../../lib/blog';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    category: string;
  }>;
};

function normalizeCategory(value: string) {
  return decodeURIComponent(value).replace(/-/g, ' ');
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categoryName = normalizeCategory(category);
  const posts = await getPostsByCategory(categoryName);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen px-5 py-10">
      <section className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-cyan">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Home
        </Link>
        <header className="mt-10 border-b border-white/10 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">Categoria</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">{categoryName}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Arquivo editorial com posts publicados nesta categoria.
          </p>
        </header>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-lg border border-white/10 bg-panel/72 transition hover:-translate-y-1 hover:border-cyan/45 hover:bg-white/[0.06]"
            >
              <img src={post.image} alt={post.imageAlt} className="h-52 w-full object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="rounded-full border border-white/10 px-3 py-1">{post.category}</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="mt-5 text-xl font-semibold leading-snug text-white group-hover:text-cyan">{post.title}</h2>
                <p className="summary-clamp mt-4 text-sm leading-6 text-slate-300">{post.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan">
                  Ler artigo completo
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
