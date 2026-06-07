import { Pool } from 'pg';
import type { BlogPost } from './types';

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
    })
  : null;

let initialized = false;

export function hasDatabase() {
  return Boolean(pool);
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
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

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
    sourceUrl: row.source_url ?? undefined,
    sourceName: row.source_name ?? undefined
  };
}

export async function getDatabasePosts() {
  if (!pool) {
    return [];
  }

  await ensureDatabase();
  const result = await pool.query(
    `select * from posts where published = true order by created_at desc, id desc limit 80`
  );

  return result.rows.map(rowToPost);
}

export async function getDatabasePostBySlug(slug: string) {
  if (!pool) {
    return null;
  }

  await ensureDatabase();
  const result = await pool.query(`select * from posts where slug = $1 and published = true limit 1`, [slug]);
  return result.rows[0] ? rowToPost(result.rows[0]) : null;
}

export async function upsertDatabasePost(post: BlogPost) {
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
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13,$14,true,now())
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
        published = true,
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
      post.sourceName ?? null
    ]
  );
}

export async function deleteDatabasePost(slug: string) {
  if (!pool) {
    throw new Error('DATABASE_URL nao configurada.');
  }

  await ensureDatabase();
  await pool.query(`delete from posts where slug = $1`, [slug]);
}
