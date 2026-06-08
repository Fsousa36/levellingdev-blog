import { staticPosts } from '../data/posts';
import { getDatabasePostBySlug, getDatabasePosts, getEditorDatabasePostBySlug } from './db';
import type { BlogPost } from './types';

export async function getAllPosts(): Promise<BlogPost[]> {
  const databasePosts = await getDatabasePosts();
  const usedSlugs = new Set(databasePosts.map((post) => post.slug));
  return [...databasePosts, ...staticPosts.filter((post) => !usedSlugs.has(post.slug))];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const databasePost = await getDatabasePostBySlug(slug);

  if (databasePost) {
    return databasePost;
  }

  return staticPosts.find((post) => post.slug === slug) ?? null;
}

export async function getEditablePostBySlug(slug: string): Promise<BlogPost | null> {
  const databasePost = await getEditorDatabasePostBySlug(slug);

  if (databasePost) {
    return databasePost;
  }

  return staticPosts.find((post) => post.slug === slug) ?? null;
}
