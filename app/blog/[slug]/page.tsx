import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3, ExternalLink } from 'lucide-react';
import { getPostBySlug } from '../../lib/blog';

const siteUrl = 'https://levelingdev.com.br';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${slug}`
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: '2026-06-07',
      url: `${siteUrl}/blog/${slug}`,
      images: [
        {
          url: post.image,
          alt: post.imageAlt
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.image]
    }
  };
}

export function generateStaticParams() {
  return [];
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: '2026-06-07',
    dateModified: '2026-06-07',
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    author: {
      '@type': 'Organization',
      name: 'LevellingDev'
    },
    publisher: {
      '@type': 'Organization',
      name: 'LevellingDev'
    }
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-cyan">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Home
        </Link>

        <header className="mt-10 border-b border-white/10 pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">{post.category}</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">{post.title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">{post.description}</p>
          <div className="mt-7 flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {post.date}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {post.readTime} de leitura
            </span>
          </div>
        </header>

        <img src={post.image} alt={post.imageAlt} className="mt-8 aspect-[16/8] w-full rounded-lg object-cover" />

        <div className="prose prose-lg prose-invert prose-custom mt-10 max-w-none">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <h2>Checklist para aplicar</h2>
          <ul>
            {post.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <section className="mt-12 rounded-lg border border-white/10 bg-white/[0.035] p-6">
          <h2 className="text-xl font-semibold text-white">Links para aprofundar</h2>
          <div className="mt-5 grid gap-3">
            {post.externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan/50 hover:text-cyan"
              >
                {link.label}
                <ExternalLink className="h-4 w-4" />
              </a>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
