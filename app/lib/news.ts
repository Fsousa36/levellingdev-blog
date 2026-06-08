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

type SourceDetails = {
  image: string | null;
  points: string[];
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

const blockedTopics = [
  'netflix',
  'suspense',
  'white lotus',
  'elite',
  'citro',
  'carro',
  'automovel',
  'automóvel',
  'calor extremo',
  'sobrevivencia humana',
  'sobrevivência humana',
  'amizade com caos'
];

function fixEncoding(value: string) {
  if (!/[ÃÂ�]/.test(value)) {
    return value;
  }

  try {
    return Buffer.from(value, 'latin1').toString('utf8');
  } catch {
    return value;
  }
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function stripHtml(value = '') {
  return fixEncoding(
    value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#8211;|&#8212;/g, '-')
      .replace(/&#8220;|&#8221;|&quot;/g, '"')
      .replace(/&#8216;|&#8217;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  );
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

function extractSourcePoints(html: string) {
  const readable = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  const matches = [...readable.matchAll(/<(p|li|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi)];
  const blocked = [
    'publicidade',
    'newsletter',
    'assine',
    'cookies',
    'termos de uso',
    'política de privacidade',
    'leia também',
    'continua após',
    'receba notícias'
  ];
  const seen = new Set<string>();

  return matches
    .map((match) => stripHtml(match[2]))
    .filter((text) => text.length >= 45 && text.length <= 520)
    .filter((text) => !blocked.some((word) => text.toLowerCase().includes(word)))
    .filter((text) => {
      const key = text.toLowerCase().slice(0, 90);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

function rewriteSourcePoint(point: string, index: number) {
  const clean = point.replace(/\s+/g, ' ').trim();
  const sentence = clean.length > 260 ? `${clean.slice(0, 257).replace(/\s+\S*$/, '')}...` : clean;

  return `Ponto ${index + 1}: a materia destaca ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
}

async function fetchSourceDetails(link: string): Promise<SourceDetails> {
  try {
    const response = await fetch(link, {
      headers: {
        'User-Agent': 'LevellingDev image fetcher (+https://levelingdev.com.br)'
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return { image: null, points: [] };
    }

    const html = await response.text();
    const image = readMetaImage(html);

    return {
      image: image ? absoluteUrl(image, link) : null,
      points: extractSourcePoints(html)
    };
  } catch {
    return { image: null, points: [] };
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
  const normalized = haystack.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (blockedTopics.some((topic) => normalized.includes(topic.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
    return false;
  }

  return keywords.some((keyword) => normalized.includes(keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
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
  const sourceDetails = await fetchSourceDetails(item.link);
  const sourceImage = item.imageUrl || sourceDetails.image;
  const image = sourceImage || uniqueFallbackImage(title, item.category);
  const sourcePoints = sourceDetails.points.length > 0 ? sourceDetails.points : cleanSummary ? [cleanSummary] : [];
  const rewrittenPoints = sourcePoints.slice(0, 8).map(rewriteSourcePoint);

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
        heading: 'Resumo da matéria',
        body: [
          `${item.source} publicou uma matéria sobre "${title}". Este rascunho organiza o assunto em português, preservando a fonte original para conferência e revisão editorial.`,
          cleanSummary
            ? `Em linhas gerais, a pauta informa que ${cleanSummary.charAt(0).toLowerCase()}${cleanSummary.slice(1)}`
            : `A fonte nao trouxe um resumo longo no feed. A leitura completa deve ser conferida em ${sourceHost} antes da publicacao final.`
        ]
      },
      {
        heading: 'Pontos principais',
        body:
          rewrittenPoints.length > 0
            ? rewrittenPoints
            : [
                'A fonte apresenta uma pauta que precisa ser revisada manualmente no editor antes da publicacao.',
                'Abra o link original, confirme os detalhes e complemente este rascunho com os exemplos ou informacoes essenciais da materia.'
              ]
      },
      {
        heading: 'Como usar essa informação',
        body: [
          `Antes de publicar, confira a materia completa em ${sourceHost} e valide nomes, datas, recursos citados e qualquer recomendacao pratica.`,
          'Se o assunto envolver IA, desenvolvimento, aplicativos, infraestrutura ou automacao, transforme a noticia em conhecimento util: explique o contexto, mostre exemplos, aponte limitacoes e deixe claro o que o leitor pode fazer depois de ler.'
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
