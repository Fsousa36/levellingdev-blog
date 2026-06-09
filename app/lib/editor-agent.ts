import { fetchRelevantNews } from './news';
import { upsertDatabasePost } from './db';
import { generateImageWithProvider, rewriteWithProvider, type TextProvider } from './ai-providers';
import type { BlogPost } from './types';

type AgentOptions = {
  limit?: number;
  provider?: TextProvider;
  model?: string;
  generateImage?: boolean;
};

function readableError(error: unknown) {
  return error instanceof Error ? error.message : 'Erro desconhecido.';
}

function ensureDraft(post: BlogPost): BlogPost {
  return {
    ...post,
    published: false,
    featured: false,
    sortOrder: post.sortOrder ?? 0
  };
}

export async function runEditorialAgent(options: AgentOptions = {}) {
  const provider = options.provider ?? 'local';
  const posts = await fetchRelevantNews(options.limit ?? 12);
  const results: Array<{
    title: string;
    slug: string;
    source?: string;
    rewritten: boolean;
    imageGenerated: boolean;
    error?: string;
  }> = [];

  for (const rawPost of posts) {
    let post = ensureDraft(rawPost);
    let rewritten = false;
    let imageGenerated = false;
    let error: string | undefined;

    if (provider !== 'local') {
      try {
        post = ensureDraft(await rewriteWithProvider(post, provider, options.model));
        rewritten = true;
      } catch (rewriteError) {
        error = `Reescrita IA falhou: ${readableError(rewriteError)}`;
      }
    }

    if (options.generateImage && !post.sourceImageUrl) {
      try {
        const generated = await generateImageWithProvider(post, 'pollinations');
        post = {
          ...post,
          image: generated.image,
          imageAlt: generated.imageAlt
        };
        imageGenerated = true;
      } catch (imageError) {
        error = [error, `Imagem falhou: ${readableError(imageError)}`].filter(Boolean).join(' | ');
      }
    }

    await upsertDatabasePost(post, { publishedDefault: false });
    results.push({
      title: post.title,
      slug: post.slug,
      source: post.sourceName,
      rewritten,
      imageGenerated,
      error
    });
  }

  return {
    ok: true,
    imported: results.length,
    rewritten: results.filter((result) => result.rewritten).length,
    imageGenerated: results.filter((result) => result.imageGenerated).length,
    errors: results.filter((result) => result.error).length,
    posts: results
  };
}
