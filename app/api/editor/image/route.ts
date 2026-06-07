import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '../../../lib/auth';
import { getPostBySlug } from '../../../lib/blog';
import { updateDatabasePost } from '../../../lib/db';
import { generateImageWithProvider, type ImageProvider } from '../../../lib/ai-providers';

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  const { slug, provider = 'pollinations', model } = (await request.json()) as {
    slug?: string;
    provider?: ImageProvider;
    model?: string;
  };

  if (!slug) {
    return NextResponse.json({ error: 'Slug obrigatorio.' }, { status: 400 });
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    return NextResponse.json({ error: 'Post nao encontrado.' }, { status: 404 });
  }

  const generated = await generateImageWithProvider(post, provider, model?.trim() || undefined);
  const updated = await updateDatabasePost(slug, {
    image: generated.image,
    imageAlt: generated.imageAlt
  });

  return NextResponse.json({ ok: true, prompt: generated.prompt, post: updated });
}
