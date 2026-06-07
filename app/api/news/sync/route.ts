import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '../../../lib/auth';
import { hasDatabase, upsertDatabasePost } from '../../../lib/db';
import { fetchRelevantNews } from '../../../lib/news';

export async function GET(request: NextRequest) {
  return syncNews(request);
}

export async function POST(request: NextRequest) {
  return syncNews(request);
}

async function syncNews(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          'Nao autorizado. Configure ADMIN_TOKEN nas variaveis de ambiente da aplicacao no Dokploy e use exatamente esse valor no editor ou no cron.'
      },
      { status: 401 }
    );
  }

  if (!hasDatabase()) {
    return NextResponse.json(
      {
        error:
          'DATABASE_URL nao configurada. Crie um PostgreSQL no Dokploy e adicione DATABASE_URL para publicar noticias automaticamente.'
      },
      { status: 400 }
    );
  }

  const posts = await fetchRelevantNews(16);

  for (const post of posts) {
    await upsertDatabasePost({ ...post, published: false, featured: false }, { publishedDefault: false });
  }

  return NextResponse.json({
    ok: true,
    imported: posts.length,
    posts: posts.map((post) => ({ title: post.title, slug: post.slug, source: post.sourceName }))
  });
}
