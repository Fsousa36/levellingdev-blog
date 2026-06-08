import { XMLParser } from 'fast-xml-parser';
import type { BlogPost } from './types';

type FeedSource = {
  name: string;
  url: string;
  category: string;
};

type FeedItem = {
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt?: string;
  summary?: string;
  imageUrl?: string;
  locale?: 'pt-BR' | 'en';
};

export const feedSources: FeedSource[] = [
  { name: 'Tecnoblog', url: 'https://tecnoblog.net/feed/', category: 'Programacao' },
  { name: 'Canaltech', url: 'https://canaltech.com.br/rss/', category: 'Inteligencia Artificial' },
  { name: 'Olhar Digital', url: 'https://olhardigital.com.br/feed/', category: 'Inteligencia Artificial' },
  { name: 'Diolinux', url: 'https://diolinux.com.br/feed', category: 'Programacao' },
  { name: 'TabNews', url: 'https://www.tabnews.com.br/recentes/rss', category: 'Programacao' }
];

const keywords = [
  'ai',
  'agent',
  'agents',
  'artificial intelligence',
  'openai',
  'copilot',
  'next.js',
  'nextjs',
  'deploy',
  'docker',
  'postgres',
  'postgresql',
  'security',
  'code',
  'developer',
  'workflow',
  'automation',
  'low-code',
  'no-code',
  'database',
  'github',
  'vercel',
  'vps',
  'ia',
  'inteligencia artificial',
  'inteligência artificial',
  'programacao',
  'programação',
  'desenvolvimento',
  'automacao',
  'automação',
  'servidor',
  'banco de dados',
  'seguranca',
  'segurança'
];

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function stripHtml(value = '') {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isBrazilianSource(source: string) {
  return ['Tecnoblog', 'Canaltech', 'Olhar Digital', 'Diolinux', 'TabNews'].includes(source);
}

function absoluteUrl(value: string, baseUrl: string) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

function readMetaImage(html: string) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern)?.[1];

    if (match) {
      return match.replace(/&amp;/g, '&').trim();
    }
  }

  return null;
}

async function fetchSourceImage(link: string) {
  try {
    const response = await fetch(link, {
      headers: {
        'User-Agent': 'LevellingDev image fetcher (+https://levelingdev.com.br)'
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return null;
    }

    const image = readMetaImage(await response.text());
    return image ? absoluteUrl(image, link) : null;
  } catch {
    return null;
  }
}

function uniqueFallbackImage(title: string, category: string) {
  const prompt = encodeURIComponent(
    `realistic editorial technology image, no text, ${category}, ${title}, software development, dark premium lighting`
  );

  return `https://image.pollinations.ai/prompt/${prompt}?width=1400&height=800&nologo=true&model=flux&seed=${Math.abs(
    slugify(title).split('').reduce((total, letter) => total + letter.charCodeAt(0), 0)
  )}`;
}

function firstImageFromFeed(raw: Record<string, any>, link: string) {
  const mediaContent = asArray(raw['media:content']).find((media) => media?.url || media?.href);
  const mediaThumbnail = asArray(raw['media:thumbnail']).find((media) => media?.url || media?.href);
  const enclosure = asArray(raw.enclosure).find((item) => {
    const type = item?.type ?? '';
    return typeof type === 'string' && type.startsWith('image/');
  });
  const image =
    raw.image?.url ??
    raw.image ??
    raw['itunes:image']?.href ??
    mediaContent?.url ??
    mediaContent?.href ??
    mediaThumbnail?.url ??
    mediaThumbnail?.href ??
    enclosure?.url ??
    enclosure?.href;

  return typeof image === 'string' ? absoluteUrl(image, link) : undefined;
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90);
}

function matchesTopic(item: FeedItem) {
  const haystack = `${item.title} ${item.summary ?? ''} ${item.source}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}

function portugueseTitle(item: FeedItem) {
  if (item.locale === 'pt-BR' || isBrazilianSource(item.source)) {
    return item.title.trim();
  }

  return `Radar internacional: ${item.title.trim()}`;
}

function portugueseSummary(item: FeedItem, cleanSummary: string) {
  if (item.locale === 'pt-BR' || isBrazilianSource(item.source)) {
    return (
      cleanSummary ||
      `Atualizacao publicada por ${item.source} com impacto potencial para desenvolvedores, automacao, IA ou infraestrutura.`
    );
  }

  return `Pauta internacional publicada por ${item.source}. O assunto ainda precisa de revisao editorial em portugues, com fonte preservada e foco no impacto pratico para devs.`;
}

async function buildPost(item: FeedItem): Promise<BlogPost> {
  const cleanSummary = stripHtml(item.summary).slice(0, 240);
  const title = portugueseTitle(item);
  const date = item.publishedAt ? new Date(item.publishedAt) : new Date();
  const dateLabel = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const sourceHost = new URL(item.link).hostname.replace('www.', '');
  const sourceImage = item.imageUrl || (await fetchSourceImage(item.link));
  const image = sourceImage || uniqueFallbackImage(title, item.category);

  return {
    slug: `noticia-${slugify(title)}`,
    title,
    description: portugueseSummary(item, cleanSummary),
    category: item.category,
    date: dateLabel,
    readTime: '4 min',
    image,
    imageAlt: sourceImage ? `Imagem original da fonte ${item.source}` : `Imagem editorial unica sobre ${title}`,
    keywords: [item.category, item.source, 'noticias de tecnologia', 'desenvolvimento de software'],
    sections: [
      {
        heading: 'O que foi publicado',
        body: [
          `${item.source} publicou uma nova atualizacao relacionada a "${title}". O LevellingDev registra esta pauta com link direto para a fonte original, para que voce possa acompanhar o contexto completo sem depender de resumo solto.`,
          cleanSummary
            ? `Resumo publico da fonte: ${cleanSummary}`
            : 'A fonte nao trouxe um resumo longo no feed, entao o melhor caminho e abrir o link original e conferir os detalhes tecnicos diretamente.'
        ]
      },
      {
        heading: 'Por que isso importa para devs',
        body: [
          'Mudancas em IA, GitHub, Vercel, frontend, banco de dados e deploy costumam afetar escolhas de stack, produtividade, seguranca e custo operacional. Mesmo quando a novidade parece pequena, ela pode virar uma melhoria de fluxo, uma atualizacao de dependencia ou uma pauta de estudo para o time.',
          'A recomendacao pratica e avaliar a novidade em tres perguntas: ela reduz trabalho repetitivo, melhora confiabilidade ou muda alguma decisao de arquitetura? Se a resposta for sim, vale abrir uma tarefa curta para testar.'
        ]
      },
      {
        heading: 'Como acompanhar sem cair em hype',
        body: [
          `Leia a publicacao original em ${sourceHost}, confira changelogs relacionados e teste em ambiente isolado antes de levar para producao.`,
          'Aqui no blog, a ideia e manter um radar continuo: noticias reais, fontes linkadas e uma leitura tecnica simples para decidir o que merece virar tutorial mais profundo.'
        ]
      }
    ],
    checklist: [
      'Abrir a fonte original antes de tomar decisao tecnica.',
      'Verificar se existe impacto em seguranca, custo ou compatibilidade.',
      'Testar em ambiente separado quando envolver deploy ou dependencia.',
      'Transformar a novidade em tutorial apenas se houver aplicacao pratica.',
      'Atualizar documentacao interna quando a mudanca afetar fluxo de trabalho.'
    ],
    externalLinks: [],
    sourceUrl: item.link,
    sourceName: item.source,
    sourceImageUrl: item.link
  };
}

export async function fetchRelevantNews(limit = 12) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ''
  });
  const items: FeedItem[] = [];

  for (const source of feedSources) {
    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'LevellingDev editorial bot (+https://levelingdev.com.br)'
        },
        next: { revalidate: 900 }
      });

      if (!response.ok) {
        continue;
      }

      const xml = await response.text();
      const parsed = parser.parse(xml);
      const channelItems = asArray(parsed.rss?.channel?.item);
      const atomItems = asArray(parsed.feed?.entry);

      for (const raw of [...channelItems, ...atomItems]) {
        const title = stripHtml(raw.title?.['#text'] ?? raw.title);
        const atomLink = Array.isArray(raw.link) ? raw.link[0]?.href : raw.link?.href;
        const link = raw.link?.['#text'] ?? atomLink ?? raw.link ?? raw.guid?.['#text'] ?? raw.guid;
        const summary = raw.description ?? raw.summary ?? raw.content ?? raw['content:encoded'];
        const publishedAt = raw.pubDate ?? raw.published ?? raw.updated;

        if (!title || !link) {
          continue;
        }

        items.push({
          title,
          link,
          source: source.name,
          category: source.category,
          publishedAt,
          summary: stripHtml(typeof summary === 'string' ? summary : summary?.['#text']),
          imageUrl: firstImageFromFeed(raw, link),
          locale: isBrazilianSource(source.name) ? 'pt-BR' : 'en'
        });
      }
    } catch {
      // Keep the sync resilient: one broken feed should not stop the whole radar.
    }
  }

  const unique = new Map<string, FeedItem>();

  for (const item of items) {
    if (matchesTopic(item) && !unique.has(item.link)) {
      unique.set(item.link, item);
    }
  }

  return Array.from(unique.values())
    .sort((a, b) => {
      const left = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const right = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return right - left;
    })
    .slice(0, limit)
    .reduce<Promise<BlogPost[]>>(async (promise, item) => [...(await promise), await buildPost(item)], Promise.resolve([]));
}
