import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '../../../lib/auth';
import { getEditablePostBySlug } from '../../../lib/blog';
import { updateDatabasePost } from '../../../lib/db';

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

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  const { slug, sourceImageUrl } = (await request.json()) as { slug?: string; sourceImageUrl?: string };

  if (!slug) {
    return NextResponse.json({ error: 'Slug obrigatorio.' }, { status: 400 });
  }

  const post = await getEditablePostBySlug(slug);

  if (!post) {
    return NextResponse.json({ error: 'Post nao encontrado.' }, { status: 404 });
  }

  const sourceUrl = sourceImageUrl?.trim() || post.sourceImageUrl || post.sourceUrl || post.externalLinks[0]?.href;

  if (!sourceUrl) {
    return NextResponse.json({ error: 'Informe um link de fonte para buscar a imagem.' }, { status: 400 });
  }

  const response = await fetch(sourceUrl, {
    headers: {
      'User-Agent': 'LevellingDev image fetcher (+https://levelingdev.com.br)'
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    return NextResponse.json({ error: `Fonte nao respondeu: HTTP ${response.status}` }, { status: 502 });
  }

  const html = await response.text();
  const image = readMetaImage(html);

  if (!image) {
    return NextResponse.json({ error: 'Nao encontrei og:image ou twitter:image nessa fonte.' }, { status: 404 });
  }

  const resolvedImage = new URL(image, sourceUrl).toString();
  const updated = await updateDatabasePost(slug, {
    image: resolvedImage,
    imageAlt: `Imagem encontrada na fonte para ${post.title}`,
    sourceImageUrl: sourceUrl
  });

  return NextResponse.json({ ok: true, image: resolvedImage, post: updated });
}
