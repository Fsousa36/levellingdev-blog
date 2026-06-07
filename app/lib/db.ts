import { Pool } from 'pg';
import type { BlogPost } from './types';

const connectionString = process.env.DATABASE_URL;
const useSsl = process.env.DATABASE_SSL === 'true';

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : false
    })
  : null;

let initialized = false;

export function hasDatabase() {
  return Boolean(pool);
}

export async function getDatabaseHealth() {
  if (!pool) {
    return {
      configured: false,
      reachable: false,
      error: 'DATABASE_URL nao configurada.'
    };
  }

  try {
    await pool.query('select 1');

    return {
      configured: true,
      reachable: true,
      error: null
    };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      error: error instanceof Error ? error.message : 'Falha desconhecida ao conectar no banco.'
    };
  }
}

export async function ensureDatabase() {
  if (!pool || initialized) {
    return;
  }

  await pool.query(`
    create table if not exists posts (
      id serial primary key,
      slug text unique not null,
      title text not null,
      description text not null,
      category text not null,
      date_label text not null,
      read_time text not null,
      image text not null,
      image_alt text not null,
      keywords jsonb not null default '[]'::jsonb,
      sections jsonb not null default '[]'::jsonb,
      checklist jsonb not null default '[]'::jsonb,
      external_links jsonb not null default '[]'::jsonb,
      source_url text unique,
      source_name text,
      published boolean not null default true,
      featured boolean not null default false,
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  await pool.query(`alter table posts add column if not exists featured boolean not null default false;`);
  await pool.query(`alter table posts add column if not exists sort_order integer not null default 0;`);

  initialized = true;
}

function rowToPost(row: Record<string, any>): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    date: row.date_label,
    readTime: row.read_time,
    image: row.image,
    imageAlt: row.image_alt,
    keywords: row.keywords ?? [],
    sections: row.sections ?? [],
    checklist: row.checklist ?? [],
    externalLinks: row.external_links ?? [],
    published: row.published ?? true,
    featured: row.featured ?? false,
    sortOrder: row.sort_order ?? 0,
    sourceUrl: row.source_url ?? undefined,
    sourceName: row.source_name ?? undefined
  };
}

export async function getDatabasePosts() {
  if (!pool) {
    return [];
  }

  try {
    await ensureDatabase();
    const result = await pool.query(
      `select * from posts where published = true order by featured desc, sort_order desc, created_at desc, id desc limit 80`
    );

    return result.rows.map(rowToPost);
  } catch {
    return [];
  }
}

export async function getEditorDatabasePosts() {
  if (!pool) {
    return [];
  }

  try {
    await ensureDatabase();
    const result = await pool.query(`select * from posts order by created_at desc, id desc limit 200`);
    return result.rows.map(rowToPost);
  } catch {
    return [];
  }
}

export async function getDatabasePostBySlug(slug: string) {
  if (!pool) {
    return null;
  }

  try {
    await ensureDatabase();
    const result = await pool.query(`select * from posts where slug = $1 and published = true limit 1`, [slug]);
    return result.rows[0] ? rowToPost(result.rows[0]) : null;
  } catch {
    return null;
  }
}

export async function upsertDatabasePost(post: BlogPost, options?: { publishedDefault?: boolean }) {
  if (!pool) {
    throw new Error('DATABASE_URL nao configurada.');
  }

  await ensureDatabase();
  await pool.query(
    `
      insert into posts (
        slug, title, description, category, date_label, read_time, image, image_alt,
        keywords, sections, checklist, external_links, source_url, source_name, published, updated_at
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13,$14,$15,now())
      on conflict (slug) do update set
        title = excluded.title,
        description = excluded.description,
        category = excluded.category,
        date_label = excluded.date_label,
        read_time = excluded.read_time,
        image = excluded.image,
        image_alt = excluded.image_alt,
        keywords = excluded.keywords,
        sections = excluded.sections,
        checklist = excluded.checklist,
        external_links = excluded.external_links,
        source_url = excluded.source_url,
        source_name = excluded.source_name,
        updated_at = now()
    `,
    [
      post.slug,
      post.title,
      post.description,
      post.category,
      post.date,
      post.readTime,
      post.image,
      post.imageAlt,
      JSON.stringify(post.keywords),
      JSON.stringify(post.sections),
      JSON.stringify(post.checklist),
      JSON.stringify(post.externalLinks),
      post.sourceUrl ?? null,
      post.sourceName ?? null,
      post.published ?? options?.publishedDefault ?? true
    ]
  );
}

export async function updateDatabasePost(slug: string, patch: Partial<BlogPost>) {
  if (!pool) {
    throw new Error('DATABASE_URL nao configurada.');
  }

  await ensureDatabase();
  const current = await pool.query(`select * from posts where slug = $1 limit 1`, [slug]);

  if (!current.rows[0]) {
    throw new Error('Post nao encontrado no banco.');
  }

  const previous = rowToPost(current.rows[0]);
  const next: BlogPost = {
    ...previous,
    ...patch,
    keywords: patch.keywords ?? previous.keywords,
    sections: patch.sections ?? previous.sections,
    checklist: patch.checklist ?? previous.checklist,
    externalLinks: patch.externalLinks ?? previous.externalLinks
  };

  await pool.query(
    `
      update posts set
        title = $2,
        description = $3,
        category = $4,
        date_label = $5,
        read_time = $6,
        image = $7,
        image_alt = $8,
        keywords = $9::jsonb,
        sections = $10::jsonb,
        checklist = $11::jsonb,
        external_links = $12::jsonb,
        source_url = $13,
        source_name = $14,
        published = $15,
        featured = $16,
        sort_order = $17,
        updated_at = now()
      where slug = $1
    `,
    [
      slug,
      next.title,
      next.description,
      next.category,
      next.date,
      next.readTime,
      next.image,
      next.imageAlt,
      JSON.stringify(next.keywords),
      JSON.stringify(next.sections),
      JSON.stringify(next.checklist),
      JSON.stringify(next.externalLinks),
      next.sourceUrl ?? null,
      next.sourceName ?? null,
      next.published ?? true,
      next.featured ?? false,
      next.sortOrder ?? 0
    ]
  );

  return next;
}

export async function deleteDatabasePost(slug: string) {
  if (!pool) {
    throw new Error('DATABASE_URL nao configurada.');
  }

  await ensureDatabase();
  await pool.query(`delete from posts where slug = $1`, [slug]);
}
