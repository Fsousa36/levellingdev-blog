import type { BlogPost } from './types';

const imagePrompts: Record<string, string> = {
  'Inteligencia Artificial':
    'futuristic software developer workspace, artificial intelligence neural interface, realistic editorial photo, dark premium lighting, no text',
  Programacao:
    'software engineer coding modern web application, clean desk, code editor, realistic editorial photo, dark premium lighting, no text',
  'Deploy e Frontend':
    'cloud deployment dashboard, containers, server infrastructure, realistic editorial photo, dark premium lighting, no text',
  Frontend:
    'frontend developer designing responsive interface, browser windows, design system, realistic editorial photo, no text',
  'Banco de Dados':
    'database infrastructure, postgresql server dashboard, secure data center, realistic editorial photo, no text',
  Seguranca:
    'cybersecurity code review, secure software architecture, dark realistic editorial photo, no text',
  'Low-code':
    'low-code automation workflow builder, modern SaaS dashboard, realistic editorial photo, no text'
};

function normalizeText(value: string) {
  return value
    .replace(/â/g, '-')
    .replace(/â/g, '-')
    .replace(/â/g, "'")
    .replace(/â|â/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSummary(value: string) {
  let next = normalizeText(value);

  for (let index = 0; index < 5; index += 1) {
    next = next.replace(/^Resumo editorial:\s*/i, '').trim();
  }

  return next;
}

export function rewritePostForPtBr(post: BlogPost): BlogPost {
  const sourceLabel = post.sourceName ? `A fonte original e ${post.sourceName}.` : 'A fonte original esta linkada ao fim do artigo.';
  const sourceUrl = post.sourceUrl ?? post.externalLinks[0]?.href;
  const cleanTitle = normalizeText(post.title);
  const cleanDescription = cleanSummary(post.description);

  return {
    ...post,
    title: cleanTitle,
    description: cleanDescription.slice(0, 220),
    readTime: post.readTime || '5 min',
    keywords: Array.from(
      new Set([
        ...post.keywords,
        'noticias de tecnologia',
        'inteligencia artificial',
        'desenvolvimento de software',
        'programacao'
      ])
    ),
    sections: [
      {
        heading: 'Resumo da pauta',
        body: [
          `${cleanTitle} e uma pauta relevante para quem acompanha tecnologia, IA, desenvolvimento e infraestrutura. Este rascunho organiza o assunto em linguagem propria e destaca o que merece atencao pratica.`,
          cleanDescription
        ]
      },
      {
        heading: 'O que muda na pratica',
        body: [
          'Para desenvolvedores e equipes tecnicas, a leitura mais importante nao e apenas a novidade em si, mas o impacto no fluxo de trabalho: produtividade, seguranca, custo, compatibilidade e manutencao.',
          'Se o tema envolver ferramentas de IA, automacao, deploy, banco de dados ou plataformas de desenvolvimento, vale testar em um ambiente separado antes de aplicar em producao.'
        ]
      },
      {
        heading: 'Como avaliar sem cair em hype',
        body: [
          `${sourceLabel} Leia a publicacao completa, confira a data, procure changelogs relacionados e valide se a novidade realmente resolve um problema do seu projeto.`,
          'A recomendacao editorial e transformar cada noticia em uma pergunta pratica: isso melhora entrega, reduz risco ou simplifica uma decisao tecnica? Se sim, vira candidato a tutorial mais profundo.'
        ]
      }
    ],
    checklist: [
      'Abrir a fonte original antes de tomar decisao tecnica.',
      'Validar se a novidade afeta seguranca, custo ou compatibilidade.',
      'Testar em ambiente separado antes de aplicar em producao.',
      'Registrar aprendizados em documentacao interna.',
      'Transformar em tutorial apenas quando houver aplicacao pratica.'
    ],
    externalLinks: post.externalLinks,
    sourceUrl,
    sourceImageUrl: post.sourceImageUrl ?? sourceUrl
  };
}

export function generateEditorialImage(post: BlogPost) {
  const basePrompt = imagePrompts[post.category] ?? imagePrompts.Programacao;
  const prompt = `${basePrompt}, topic: ${post.title}`.slice(0, 420);
  const encodedPrompt = encodeURIComponent(prompt);

  return {
    prompt,
    image: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1400&height=800&nologo=true&model=flux`,
    imageAlt: `Imagem editorial gerada para: ${post.title}`
  };
}
