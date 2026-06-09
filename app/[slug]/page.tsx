import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getPageBySlug } from '../lib/blog';
import type { ContentBlock, PageWidget } from '../lib/types';

const siteUrl = 'https://levelingdev.com.br';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${slug}`
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${siteUrl}/${slug}`,
      images: [{ url: page.image, alt: page.imageAlt }]
    }
  };
}

function renderInlineLinks(text: string) {
  const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g);

  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);

    if (!match) {
      return part;
    }

    return (
      <a key={`${match[2]}-${index}`} href={match[2]} target="_blank" rel="noreferrer">
        {match[1]}
      </a>
    );
  });
}

function getBlocks(page: NonNullable<Awaited<ReturnType<typeof getPageBySlug>>>): ContentBlock[] {
  if (page.contentBlocks?.length) {
    return page.contentBlocks;
  }

  return page.sections.flatMap((section, sectionIndex) => [
    ...(section.heading && section.heading !== 'Editorial completo'
      ? [{ id: `heading-${sectionIndex}`, type: 'h2' as const, content: section.heading }]
      : []),
    ...section.body.map((paragraph, paragraphIndex) => ({
      id: `paragraph-${sectionIndex}-${paragraphIndex}`,
      type: 'paragraph' as const,
      content: paragraph
    }))
  ]);
}

function mediaClass(position?: ContentBlock['position']) {
  if (position === 'left') {
    return 'not-prose my-6 max-w-md md:float-left md:mr-7';
  }

  if (position === 'right') {
    return 'not-prose my-6 max-w-md md:float-right md:ml-7';
  }

  if (position === 'center') {
    return 'not-prose mx-auto my-6 max-w-2xl';
  }

  return 'not-prose my-6 clear-both';
}

function renderVideo(url: string) {
  let embedUrl = '';

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    if (parsed.hostname.includes('youtu.be')) {
      embedUrl = `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
    }
  } catch {
    embedUrl = '';
  }

  if (embedUrl) {
    return <iframe src={embedUrl} className="aspect-video w-full rounded-lg border border-white/10" allowFullScreen />;
  }

  if (/^data:video\//.test(url) || /\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return <video controls className="aspect-video w-full rounded-lg bg-black" src={url} />;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cyan">
      Abrir video
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}

function renderBlock(block: ContentBlock) {
  if (block.type === 'h1') {
    return <h1 key={block.id}>{renderInlineLinks(block.content)}</h1>;
  }

  if (block.type === 'h2') {
    return <h2 key={block.id}>{renderInlineLinks(block.content)}</h2>;
  }

  if (block.type === 'h3') {
    return <h3 key={block.id}>{renderInlineLinks(block.content)}</h3>;
  }

  if (block.type === 'quote') {
    return <blockquote key={block.id}>{renderInlineLinks(block.content)}</blockquote>;
  }

  if (block.type === 'image' && block.url) {
    return (
      <figure key={block.id} className={mediaClass(block.position)}>
        <img src={block.url} alt={block.alt || block.content || 'Imagem da pagina'} className="w-full rounded-lg border border-white/10 object-cover" />
        {block.caption ? <figcaption className="mt-2 text-sm text-slate-400">{block.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === 'video' && block.url) {
    return (
      <figure key={block.id} className={mediaClass(block.position)}>
        {renderVideo(block.url)}
        {block.caption ? <figcaption className="mt-2 text-sm text-slate-400">{block.caption}</figcaption> : null}
      </figure>
    );
  }

  return <p key={block.id}>{renderInlineLinks(block.content)}</p>;
}

function WidgetCard({ widget }: { widget: PageWidget }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">{widget.area}</p>
      <h3 className="mt-2 font-semibold text-white">{widget.title}</h3>
      {widget.type === 'image' && widget.url ? <img src={widget.url} alt={widget.title} className="mt-3 rounded-lg" /> : null}
      {widget.type === 'video' && widget.url ? <div className="mt-3">{renderVideo(widget.url)}</div> : null}
      <p className="mt-3 text-sm leading-6 text-slate-300">{renderInlineLinks(widget.content)}</p>
    </div>
  );
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const blocks = getBlocks(page);
  const widgets = page.widgets ?? [];

  return (
    <main className="min-h-screen">
      <article className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-cyan">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Home
        </Link>
        <header className="mt-10 border-b border-white/10 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">Pagina</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">{page.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{page.description}</p>
        </header>
        <img src={page.image} alt={page.imageAlt} className="mt-8 aspect-[16/7] w-full rounded-lg object-cover" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr_220px]">
          <aside className="hidden space-y-4 lg:block">
            {widgets.filter((widget) => widget.area === 'left').map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
          </aside>
          <div className="prose prose-lg prose-invert prose-custom max-w-none">
            {blocks.map(renderBlock)}
            <div className="clear-both" />
          </div>
          <aside className="hidden space-y-4 lg:block">
            {widgets.filter((widget) => widget.area === 'right').map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
          </aside>
        </div>
        <section className="mt-12 grid gap-4 md:grid-cols-2">
          {widgets
            .filter((widget) => ['middle', 'afterArticle', 'footer'].includes(widget.area))
            .map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
        </section>
      </article>
    </main>
  );
}
