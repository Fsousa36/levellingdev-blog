import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3, ExternalLink } from 'lucide-react';
import { getPostBySlug } from '../../lib/blog';
import type { ContentBlock, PageWidget, PostTypography } from '../../lib/types';

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

function getYoutubeEmbedUrl(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.hostname.includes('youtube.com')) {
      const videoId = url.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (url.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${url.pathname.replace('/', '')}`;
    }
  } catch {
    return null;
  }

  return null;
}

function isDirectVideo(value?: string) {
  return Boolean(value && (/^data:video\//.test(value) || /\.(mp4|webm|ogg)(\?|$)/i.test(value)));
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

function isSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function renderInlineLinks(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [, label, href] = match;
    nodes.push(
      isSafeExternalUrl(href) ? (
        <a key={`${href}-${match.index}`} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      ) : (
        label
      )
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

function getMarkdownLinks(text: string) {
  return Array.from(text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)).map((match) => ({
    label: match[1],
    href: match[2]
  }));
}

function getFallbackBlocks(post: Awaited<ReturnType<typeof getPostBySlug>>): ContentBlock[] {
  if (!post) {
    return [];
  }

  return post.sections.flatMap((section, sectionIndex) => [
    ...(section.heading && section.heading !== 'Editorial completo'
      ? [
          {
            id: `section-${sectionIndex}`,
            type: 'h2' as const,
            content: section.heading
          }
        ]
      : []),
    ...section.body.map((paragraph, paragraphIndex) => ({
      id: `paragraph-${sectionIndex}-${paragraphIndex}`,
      type: 'paragraph' as const,
      content: paragraph
    }))
  ]);
}

function mediaPositionClass(position?: ContentBlock['position']) {
  if (position === 'left') {
    return 'not-prose my-8 max-w-md md:float-left md:mr-7 md:mt-2';
  }

  if (position === 'right') {
    return 'not-prose my-8 max-w-md md:float-right md:ml-7 md:mt-2';
  }

  if (position === 'center') {
    return 'not-prose mx-auto my-8 max-w-2xl';
  }

  return 'not-prose my-8 clear-both';
}

function renderVideo(url: string, title: string) {
  const youtubeEmbedUrl = getYoutubeEmbedUrl(url);

  if (youtubeEmbedUrl) {
    return (
      <iframe
        src={youtubeEmbedUrl}
        title={title}
        className="aspect-video w-full rounded-lg border border-white/10"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  if (isDirectVideo(url)) {
    return <video controls className="aspect-video w-full rounded-lg bg-black" src={url} />;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cyan">
      Abrir video relacionado
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}

function renderBlock(block: ContentBlock, typography: ReturnType<typeof getTypographyClasses>) {
  if (block.type === 'h1') {
    return (
      <h1 key={block.id} className={`${typography.h1} ${typography.line} ${typography.weight}`}>
        {renderInlineLinks(block.content)}
      </h1>
    );
  }

  if (block.type === 'h2') {
    return (
      <h2 key={block.id} className={`${typography.h2} ${typography.line} ${typography.weight}`}>
        {renderInlineLinks(block.content)}
      </h2>
    );
  }

  if (block.type === 'h3') {
    return <h3 key={block.id}>{renderInlineLinks(block.content)}</h3>;
  }

  if (block.type === 'quote') {
    return <blockquote key={block.id}>{renderInlineLinks(block.content)}</blockquote>;
  }

  if (block.type === 'image' && block.url) {
    return (
      <figure key={block.id} className={mediaPositionClass(block.position)}>
        <img src={block.url} alt={block.alt || block.content || 'Imagem do editorial'} className="w-full rounded-lg border border-white/10 object-cover" />
        {block.caption ? <figcaption className="mt-2 text-sm text-slate-400">{block.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === 'video' && block.url) {
    return (
      <figure key={block.id} className={mediaPositionClass(block.position)}>
        {renderVideo(block.url, block.content || 'Video do editorial')}
        {block.caption ? <figcaption className="mt-2 text-sm text-slate-400">{block.caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <p key={block.id} className={`${typography.line} ${typography.align}`}>
      {renderInlineLinks(block.content)}
    </p>
  );
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

  const content = (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">{widget.type}</p>
      <h3 className="mt-2 font-semibold text-white">{widget.title}</h3>
      {widget.type === 'image' && widget.url ? <img src={widget.url} alt={widget.title} className="mt-3 rounded-lg" /> : null}
      {widget.type === 'video' && widget.url ? <div className="mt-3">{renderVideo(widget.url, widget.title)}</div> : null}
      <p className="mt-3 text-sm leading-6 text-slate-300">{renderInlineLinks(widget.content)}</p>
    </div>
  );

  if (widget.type === 'link' && widget.url) {
    return (
      <a href={widget.url} target="_blank" rel="noreferrer" className="block transition hover:border-cyan/50">
        {content}
      </a>
    );
  }

  return content;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }
  const youtubeEmbedUrl = getYoutubeEmbedUrl(post.videoUrl);
  const typography = getTypographyClasses(post.typography);
  const blocks = post.contentBlocks && post.contentBlocks.length > 0 ? post.contentBlocks : getFallbackBlocks(post);
  const widgets = post.widgets ?? [];
  const topWidgets = widgets.filter((widget) => widget.area === 'top');
  const leftWidgets = widgets.filter((widget) => widget.area === 'left');
  const rightWidgets = widgets.filter((widget) => widget.area === 'right');
  const middleWidgets = widgets.filter((widget) => widget.area === 'middle');
  const afterWidgets = widgets.filter((widget) => widget.area === 'afterArticle');
  const footerWidgets = widgets.filter((widget) => widget.area === 'footer');

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
        <article className={`mx-auto max-w-7xl px-5 py-10 sm:py-14 ${typography.font}`}>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-cyan">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Home
        </Link>

        <header className="mt-10 border-b border-white/10 pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">{post.category}</p>
          <h1 className={`mt-5 text-white ${typography.h1} ${typography.weight}`}>{post.title}</h1>
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

        {topWidgets.length > 0 ? (
          <section className="mt-8 grid gap-4 md:grid-cols-2">
            {topWidgets.map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
          </section>
        ) : null}

        <img src={post.image} alt={post.imageAlt} className="mt-8 aspect-[16/8] w-full rounded-lg object-cover" />

        {post.videoUrl ? (
          <section className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-black/25">
            {youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                title={`Video relacionado a ${post.title}`}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : isDirectVideo(post.videoUrl) ? (
              <video controls className="aspect-video w-full bg-black" src={post.videoUrl}>
                Seu navegador nao suporta a reproducao deste video.
              </video>
            ) : (
              <a
                href={post.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-cyan transition hover:text-white"
              >
                Assistir video relacionado
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </section>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr_220px]">
          <aside className="hidden space-y-4 lg:block">
            {leftWidgets.map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
          </aside>

          <div className={`prose prose-invert prose-custom max-w-none ${typography.body} ${typography.weight}`}>
            {blocks.map((block, index) => (
              <FragmentWithMiddle key={block.id} index={index} middleWidgets={middleWidgets} typography={typography} block={block} />
            ))}
            <div className="clear-both" />
          </div>

          <aside className="hidden space-y-4 lg:block">
            {rightWidgets.map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
          </aside>
        </div>

        {afterWidgets.length > 0 ? (
          <section className="mt-12 grid gap-4 md:grid-cols-2">
            {afterWidgets.map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
          </section>
        ) : null}

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

function FragmentWithMiddle({
  block,
  index,
  middleWidgets,
  typography
}: {
  block: ContentBlock;
  index: number;
  middleWidgets: PageWidget[];
  typography: ReturnType<typeof getTypographyClasses>;
}) {
  return (
    <>
      {index === 2 && middleWidgets.length > 0 ? (
        <div className="not-prose my-8 grid gap-4 md:grid-cols-2">
          {middleWidgets.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} />
          ))}
        </div>
      ) : null}
      {renderBlock(block, typography)}
    </>
  );
}
