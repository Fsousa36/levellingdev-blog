import { staticPosts } from '../data/posts';
import {
  getDatabaseCategories,
  getDatabasePageBySlug,
  getDatabasePostBySlug,
  getDatabasePosts,
  getEditorDatabasePostBySlug
} from './db';
import type { BlogPost } from './types';

export async function getAllPosts(): Promise<BlogPost[]> {
  const databasePosts = await getDatabasePosts();
  const usedSlugs = new Set(databasePosts.map((post) => post.slug));
  return [...databasePosts, ...staticPosts.filter((post) => !usedSlugs.has(post.slug) && (post.contentType ?? 'post') === 'post')];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const databasePost = await getDatabasePostBySlug(slug);

  if (databasePost) {
    return databasePost;
  }

  return staticPosts.find((post) => post.slug === slug) ?? null;
}

export async function getPageBySlug(slug: string): Promise<BlogPost | null> {
  return getDatabasePageBySlug(slug);
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const targetSlug = slugifyCategory(category);
  const posts = await getAllPosts();
  return posts.filter((post) => slugifyCategory(post.category) === targetSlug);
}

export async function getCategories() {
  const databaseCategories = await getDatabaseCategories();
  const categories = new Map<string, number>();

  for (const category of databaseCategories) {
    categories.set(category.name, category.total);
  }

  for (const post of staticPosts) {
    categories.set(post.category, (categories.get(post.category) ?? 0) + 1);
  }

  return [...categories.entries()].map(([name, total]) => ({ name, total }));
}

function slugifyCategory(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getEditablePostBySlug(slug: string): Promise<BlogPost | null> {
  const databasePost = await getEditorDatabasePostBySlug(slug);

  if (databasePost) {
    return databasePost;
  }

  return staticPosts.find((post) => post.slug === slug) ?? null;
}
