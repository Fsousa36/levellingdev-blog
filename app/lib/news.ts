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
};

export const feedSources: FeedSource[] = [
  { name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', category: 'Inteligencia Artificial' },
  { name: 'GitHub Changelog', url: 'https://github.blog/changelog/feed/', category: 'Programacao' },
  { name: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'Programacao' },
  { name: 'Vercel Blog', url: 'https://vercel.com/rss.xml', category: 'Deploy e Frontend' },
  { name: 'web.dev', url: 'https://web.dev/blog/feed.xml', category: 'Frontend' },
  { name: 'PostgreSQL News', url: 'https://www.postgresql.org/about/newsarchive/rss/', category: 'Banco de Dados' }
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
  'vps'
];

const imageByCategory: Record<string, string> = {
  'Inteligencia Artificial':
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80',
  Programacao: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80',
  'Deploy e Frontend': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1400&q=80',
  Frontend: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80',
  'Banco de Dados': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1400&q=80'
};

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

function buildPost(item: FeedItem): BlogPost {
  const cleanSummary = stripHtml(item.summary).slice(0, 240);
  const title = item.title.trim();
  const date = item.publishedAt ? new Date(item.publishedAt) : new Date();
  const dateLabel = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const sourceHost = new URL(item.link).hostname.replace('www.', '');

  return {
    slug: `noticia-${slugify(title)}`,
    title,
    description:
      cleanSummary ||
      `Atualizacao publicada por ${item.source} com impacto potencial para desenvolvedores, automacao, IA ou infraestrutura.`,
    category: item.category,
    date: dateLabel,
    readTime: '4 min',
    image: imageByCategory[item.category] ?? imageByCategory.Programacao,
    imageAlt: `Imagem editorial sobre ${item.category}`,
    keywords: [item.category, item.source, 'noticias de tecnologia', 'desenvolvimento de software'],
    sections: [
      {
        heading: 'O que foi publicado',
        body: [
          `${item.source} publicou uma nova atualizacao: "${title}". O LevellingDev registra esta pauta com link direto para a fonte original, para que voce possa acompanhar o contexto completo sem depender de resumo solto.`,
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
          summary: stripHtml(typeof summary === 'string' ? summary : summary?.['#text'])
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
    .map(buildPost);
}
