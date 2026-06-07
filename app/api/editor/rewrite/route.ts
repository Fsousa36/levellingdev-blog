import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '../../../lib/auth';
import { getPostBySlug } from '../../../lib/blog';
import { updateDatabasePost } from '../../../lib/db';
import { rewriteWithProvider, type TextProvider } from '../../../lib/ai-providers';

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  const { slug, provider = 'local' } = (await request.json()) as { slug?: string; provider?: TextProvider };

  if (!slug) {
    return NextResponse.json({ error: 'Slug obrigatorio.' }, { status: 400 });
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    return NextResponse.json({ error: 'Post nao encontrado.' }, { status: 404 });
  }

  const rewritten = await rewriteWithProvider(post, provider);
  await updateDatabasePost(slug, rewritten);

  return NextResponse.json({ ok: true, post: rewritten });
}
