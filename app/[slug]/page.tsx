import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getPageBySlug } from '../lib/blog';
import type { ContentBlock, PageWidget, PostTypography } from '../lib/types';

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
  const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    const italicMatch = part.match(/^\*([^*]+)\*$/);

    if (linkMatch) {
      return (
        <a key={`${linkMatch[2]}-${index}`} href={linkMatch[2]} target="_blank" rel="noreferrer">
          {linkMatch[1]}
        </a>
      );
    }

    if (boldMatch) {
      return <strong key={`strong-${index}`}>{boldMatch[1]}</strong>;
    }

    if (italicMatch) {
      return <em key={`em-${index}`}>{italicMatch[1]}</em>;
    }

    return part;
  });
}

function getMarkdownLinks(text: string) {
  return Array.from(text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)).map((match) => ({
    label: match[1],
    href: match[2]
  }));
}

const typographyClasses = {
  fontFamily: {
    system: '',
    serif: 'font-serif',
    mono: 'font-mono',
    inter: '[font-family:Inter,sans-serif]',
    roboto: '[font-family:Roboto,sans-serif]',
    lato: '[font-family:Lato,sans-serif]',
    merriweather: '[font-family:Merriweather,serif]',
    playfair: '[font-family:Playfair_Display,serif]',
    montserrat: '[font-family:Montserrat,sans-serif]',
    poppins: '[font-family:Poppins,sans-serif]',
    sourceCodePro: '[font-family:Source_Code_Pro,monospace]'
  },
  fontWeight: {
    regular: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  },
  h1Size: {
    sm: 'text-3xl sm:text-4xl',
    md: 'text-4xl sm:text-5xl',
    lg: 'text-5xl sm:text-6xl'
  },
  h2Size: {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  },
  bodySize: {
    sm: 'prose-base',
    md: 'prose-lg',
    lg: 'prose-xl'
  },
  lineHeight: {
    normal: 'leading-7',
    relaxed: 'leading-8',
    loose: 'leading-9'
  },
  textAlign: {
    left: 'text-left',
    center: 'text-center',
    justify: 'text-justify'
  }
};

function getTypographyClasses(typography?: PostTypography) {
  return {
    font: typographyClasses.fontFamily[typography?.fontFamily ?? 'system'],
    weight: typographyClasses.fontWeight[typography?.fontWeight ?? 'regular'],
    h1: typographyClasses.h1Size[typography?.h1Size ?? 'md'],
    h2: typographyClasses.h2Size[typography?.h2Size ?? 'md'],
    body: typographyClasses.bodySize[typography?.bodySize ?? 'md'],
    line: typographyClasses.lineHeight[typography?.lineHeight ?? 'relaxed'],
    align: typographyClasses.textAlign[typography?.textAlign ?? 'left']
  };
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

  if (/^[-*]\s+/m.test(block.content)) {
    return (
      <ul key={block.id}>
        {block.content
          .split('\n')
          .filter(Boolean)
          .map((item, index) => (
            <li key={`${block.id}-${index}`}>{renderInlineLinks(item.replace(/^[-*]\s+/, ''))}</li>
          ))}
      </ul>
    );
  }

  if (/^\d+\.\s+/m.test(block.content)) {
    return (
      <ol key={block.id}>
        {block.content
          .split('\n')
          .filter(Boolean)
          .map((item, index) => (
            <li key={`${block.id}-${index}`}>{renderInlineLinks(item.replace(/^\d+\.\s+/, ''))}</li>
          ))}
      </ol>
    );
  }

  return <p key={block.id}>{renderInlineLinks(block.content)}</p>;
}

function WidgetCard({ widget }: { widget: PageWidget }) {
  const socialLinks = widget.type === 'social' ? getMarkdownLinks(widget.content) : [];

  if (widget.type === 'social') {
    return (
      <div className="rounded-lg border border-cyan/20 bg-cyan/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">redes sociais</p>
        <h3 className="mt-2 font-semibold text-white">{widget.title}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {(socialLinks.length ? socialLinks : widget.url ? [{ label: widget.title, href: widget.url }] : []).map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-semibold text-slate-200 transition hover:border-cyan/50 hover:text-cyan"
            >
              {link.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
        {socialLinks.length === 0 && !widget.url ? <p className="mt-3 text-sm leading-6 text-slate-300">{renderInlineLinks(widget.content)}</p> : null}
      </div>
    );
  }

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
  const typography = getTypographyClasses(page.typography);
  const topWidgets = widgets.filter((widget) => widget.area === 'top');
  const footerWidgets = widgets.filter((widget) => widget.area === 'footer');

  return (
    <main className="min-h-screen">
      <article className={`mx-auto max-w-6xl px-5 py-10 sm:py-14 ${typography.font}`}>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-cyan">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Home
        </Link>
        <header className="mt-10 border-b border-white/10 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">Pagina</p>
          <h1 className={`mt-5 leading-tight text-white ${typography.h1} ${typography.weight}`}>{page.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{page.description}</p>
        </header>
        {topWidgets.length > 0 ? (
          <section className="mt-8 grid gap-4 md:grid-cols-2">
            {topWidgets.map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
          </section>
        ) : null}
        <img src={page.image} alt={page.imageAlt} className="mt-8 aspect-[16/7] w-full rounded-lg object-cover" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr_220px]">
          <aside className="hidden space-y-4 lg:block">
            {widgets.filter((widget) => widget.area === 'left').map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
          </aside>
          <div className={`prose prose-invert prose-custom max-w-none ${typography.body} ${typography.weight}`}>
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
            .filter((widget) => ['middle', 'afterArticle'].includes(widget.area))
            .map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
        </section>
        {footerWidgets.length > 0 ? (
          <section className="mt-12 border-t border-white/10 pt-8">
            <div className="grid gap-4 md:grid-cols-3">
              {footerWidgets.map((widget) => (
                <WidgetCard key={widget.id} widget={widget} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
