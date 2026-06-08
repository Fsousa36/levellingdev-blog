import type { BlogPost } from './types';

type ReferenceLink = {
  label: string;
  href: string;
};

const categoryReferences: Record<string, ReferenceLink[]> = {
  'Inteligencia Artificial': [
    { label: 'OpenAI Docs', href: 'https://platform.openai.com/docs' },
    { label: 'Google AI for Developers', href: 'https://ai.google.dev/gemini-api/docs' },
    { label: 'Anthropic Docs', href: 'https://docs.anthropic.com/' },
    { label: 'DeepSeek API Docs', href: 'https://api-docs.deepseek.com/' }
  ],
  Programacao: [
    { label: 'MDN Web Docs', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { label: 'GitHub Docs', href: 'https://docs.github.com/' },
    { label: 'Node.js Docs', href: 'https://nodejs.org/docs/latest/api/' },
    { label: 'Stack Overflow Survey', href: 'https://survey.stackoverflow.co/' }
  ],
  'Deploy e Frontend': [
    { label: 'Dokploy Docs', href: 'https://docs.dokploy.com/docs/core' },
    { label: 'Docker Compose Docs', href: 'https://docs.docker.com/compose/' },
    { label: 'Next.js Docs', href: 'https://nextjs.org/docs' },
    { label: 'Vercel Docs', href: 'https://vercel.com/docs' }
  ],
  Frontend: [
    { label: 'MDN Web Docs', href: 'https://developer.mozilla.org/en-US/docs/Web' },
    { label: 'Next.js Docs', href: 'https://nextjs.org/docs' },
    { label: 'React Docs', href: 'https://react.dev/reference/react' },
    { label: 'web.dev', href: 'https://web.dev/learn' }
  ],
  'Banco de Dados': [
    { label: 'PostgreSQL Docs', href: 'https://www.postgresql.org/docs/' },
    { label: 'Docker Compose Docs', href: 'https://docs.docker.com/compose/' },
    { label: 'Prisma Docs', href: 'https://www.prisma.io/docs' },
    { label: 'Supabase Docs', href: 'https://supabase.com/docs' }
  ]
};

function uniqueLinks(links: ReferenceLink[]) {
  const used = new Set<string>();
  return links.filter((link) => {
    if (!link.href || used.has(link.href)) {
      return false;
    }

    used.add(link.href);
    return true;
  });
}

export function getPostReferences(post: BlogPost) {
  const sourceLink = post.sourceUrl
    ? [
        {
          label: post.sourceName ? `Fonte: ${post.sourceName}` : 'Fonte original',
          href: post.sourceUrl
        }
      ]
    : [];
  const categoryLinks = categoryReferences[post.category] ?? categoryReferences.Programacao;

  return uniqueLinks([...sourceLink, ...post.externalLinks, ...categoryLinks]);
}

export function getParagraphReferences(post: BlogPost, sectionIndex: number, paragraphIndex: number) {
  const references = getPostReferences(post);

  if (references.length <= 2) {
    return references;
  }

  const start = (sectionIndex * 2 + paragraphIndex) % references.length;
  return [references[start], references[(start + 1) % references.length]];
}
