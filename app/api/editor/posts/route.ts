import { NextRequest, NextResponse } from 'next/server';
import { deleteDatabasePost, getEditorDatabasePosts, hasDatabase, updateDatabasePost, upsertDatabasePost } from '../../../lib/db';
import { getAllPosts } from '../../../lib/blog';
import { isAuthorized } from '../../../lib/auth';
import type { BlogPost } from '../../../lib/types';
import { slugify } from '../../../lib/news';

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          'Nao autorizado. Configure ADMIN_TOKEN nas variaveis de ambiente da aplicacao no Dokploy e use exatamente esse valor no editor.'
      },
      { status: 401 }
    );
  }

  const posts = hasDatabase() ? await getEditorDatabasePosts() : await getAllPosts();
  return NextResponse.json({ database: hasDatabase(), posts });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          'Nao autorizado. Configure ADMIN_TOKEN nas variaveis de ambiente da aplicacao no Dokploy e use exatamente esse valor no editor.'
      },
      { status: 401 }
    );
  }

  const body = (await request.json()) as Partial<BlogPost>;
  const title = body.title?.trim();

  if (!title || !body.description?.trim()) {
    return NextResponse.json({ error: 'Titulo e resumo sao obrigatorios.' }, { status: 400 });
  }

  const post: BlogPost = {
    slug: body.slug?.trim() || slugify(title),
    title,
    description: body.description.trim(),
    category: body.category?.trim() || 'Programacao',
    date:
      body.date?.trim() ||
      new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
    readTime: body.readTime?.trim() || '5 min',
    image:
      body.image?.trim() ||
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80',
    imageAlt: body.imageAlt?.trim() || `Imagem editorial sobre ${title}`,
    keywords: body.keywords ?? ['desenvolvimento de software'],
    sections:
      body.sections && body.sections.length > 0
        ? body.sections
        : [
            {
              heading: 'Resumo',
              body: [body.description.trim()]
            }
          ],
    checklist: body.checklist ?? ['Revisar fonte.', 'Testar antes de aplicar.', 'Documentar mudancas importantes.'],
    externalLinks: body.externalLinks ?? [],
    videoUrl: body.videoUrl?.trim() || undefined,
    published: false,
    featured: false,
    sortOrder: 0,
    sourceUrl: body.sourceUrl?.trim() || undefined,
    sourceName: body.sourceName?.trim() || undefined,
    sourceImageUrl: body.sourceImageUrl?.trim() || body.sourceUrl?.trim() || undefined
  };

  await upsertDatabasePost(post, { publishedDefault: false });
  return NextResponse.json({ ok: true, post });
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          'Nao autorizado. Configure ADMIN_TOKEN nas variaveis de ambiente da aplicacao no Dokploy e use exatamente esse valor no editor.'
      },
      { status: 401 }
    );
  }

  const body = (await request.json()) as Partial<BlogPost> & { slug?: string };

  if (!body.slug) {
    return NextResponse.json({ error: 'Slug obrigatorio.' }, { status: 400 });
  }

  const post = await updateDatabasePost(body.slug, body);
  return NextResponse.json({ ok: true, post });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          'Nao autorizado. Configure ADMIN_TOKEN nas variaveis de ambiente da aplicacao no Dokploy e use exatamente esse valor no editor.'
      },
      { status: 401 }
    );
  }

  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug obrigatorio.' }, { status: 400 });
  }

  await deleteDatabasePost(slug);
  return NextResponse.json({ ok: true });
}
