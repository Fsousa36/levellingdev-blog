import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock3 } from 'lucide-react';

const posts = {
  'low-code-com-ia-para-desenvolvedores': {
    title: 'Low-Code com IA: como acelerar entregas sem perder engenharia',
    description:
      'Aprenda a usar low-code e IA como aceleradores de produto sem abrir mao de arquitetura, seguranca e qualidade de codigo.',
    date: '7 junho 2026',
    readTime: '7 min',
    category: 'Low-Code e IA'
  },
  'arquitetura-de-agentes-ia': {
    title: 'Arquitetura de agentes de IA para produtos SaaS',
    description:
      'Um roteiro para planejar agentes de IA com ferramentas, contexto, seguranca, custos e observabilidade.',
    date: '7 junho 2026',
    readTime: '9 min',
    category: 'Inteligencia Artificial'
  },
  'docker-nextjs-vps-dokploy': {
    title: 'Deploy de Next.js em VPS com Docker e Dokploy',
    description:
      'Checklist para rodar Next.js standalone em containers Docker leves, com arquivos publicos e assets estaticos.',
    date: '7 junho 2026',
    readTime: '6 min',
    category: 'DevOps'
  }
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug as keyof typeof posts] ?? posts['low-code-com-ia-para-desenvolvedores'];

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: '2026-06-07'
    }
  };
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

function ArticleAdPlaceholder() {
  return (
    <div className="not-prose my-12 rounded-lg border border-dashed border-cyan/35 bg-white/[0.035] p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">Publicidade</p>
      <div className="mt-4 flex min-h-36 items-center justify-center rounded-md border border-white/10 bg-black/25 px-4">
        <p className="text-sm text-slate-300">[Espaco reservado para anuncio automatico Google AdSense - Meio do artigo]</p>
      </div>
    </div>
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = posts[slug as keyof typeof posts] ?? posts['low-code-com-ia-para-desenvolvedores'];

  return (
    <main className="min-h-screen">
      <article className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-cyan">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a pagina inicial
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

        <div className="prose prose-lg prose-invert prose-custom mt-10 max-w-none">
          <p>
            Low-code e inteligencia artificial ficam realmente poderosos quando entram como parte de um fluxo de
            engenharia, nao como atalho para ignorar requisitos. A pergunta central deixa de ser "qual ferramenta gera
            mais rapido?" e passa a ser "como entregamos valor mantendo clareza, seguranca e capacidade de evoluir?".
          </p>

          <h2>Comece pelo problema, nao pela ferramenta</h2>
          <p>
            Antes de escolher automacoes, construtores visuais ou agentes de IA, descreva o fluxo de negocio em termos
            simples: entrada, decisao, acao e resultado esperado. Esse mapa evita que a solucao fique dependente de
            prompts soltos ou de integracoes dificeis de auditar.
          </p>

          <h2>Use IA para acelerar partes verificaveis</h2>
          <p>
            Bons usos iniciais incluem gerar rascunhos de interfaces, explicar logs, criar testes, transformar requisitos
            em checklists e sugerir consultas. Em cada caso, a saida precisa ser revisada por criterios objetivos:
            cobertura, seguranca, legibilidade e impacto no usuario.
          </p>

          <ArticleAdPlaceholder />

          <h2>Crie uma fronteira clara entre prototipo e producao</h2>
          <p>
            Prototipos podem viver em ferramentas low-code, mas sistemas de producao precisam de versionamento, revisao
            de mudancas, observabilidade, backups e controles de acesso. Quando uma automacao passa a impactar receita,
            dados de clientes ou operacoes criticas, ela merece o mesmo cuidado de qualquer modulo de software.
          </p>

          <h2>Checklist pratico</h2>
          <ul>
            <li>Documente entradas, saidas e regras do fluxo.</li>
            <li>Separe prompts, credenciais e configuracoes por ambiente.</li>
            <li>Inclua logs suficientes para rastrear falhas e custos.</li>
            <li>Revise conteudo gerado por IA antes de publicar ao usuario final.</li>
            <li>Defina quando migrar uma automacao para codigo mantido pela equipe.</li>
          </ul>

          <p>
            A melhor estrategia e tratar low-code e IA como multiplicadores da equipe. Eles reduzem atrito, mas a
            responsabilidade sobre arquitetura, experiencia e confiabilidade continua sendo de quem constrói o produto.
          </p>
        </div>
      </article>
    </main>
  );
}
