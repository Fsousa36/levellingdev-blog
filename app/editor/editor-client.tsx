'use client';

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  ImagePlus,
  KeyRound,
  Layers3,
  Link2,
  Loader2,
  PanelRight,
  PencilLine,
  RefreshCw,
  Save,
  Search,
  Star,
  Trash2,
  X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BlogPost, ContentBlock, PageWidget, PostTypography } from '../lib/types';

type ApiState = {
  database: boolean;
  posts: BlogPost[];
};

type StatusState = {
  adminTokenConfigured: boolean;
  databaseConfigured: boolean;
  databaseReachable: boolean;
  databaseError: string | null;
};

type PostForm = {
  slug: string;
  contentType: 'post' | 'page';
  title: string;
  summary: string;
  content: string;
  category: string;
  image: string;
  sourceImageUrl: string;
  videoUrl: string;
  externalUrl: string;
  keywords: string;
  blocks: ContentBlock[];
  widgets: PageWidget[];
  typography: PostTypography;
};

const emptyPost: PostForm = {
  slug: '',
  contentType: 'post',
  title: '',
  summary: '',
  content: '',
  category: 'Programacao',
  image: '',
  sourceImageUrl: '',
  videoUrl: '',
  externalUrl: '',
  keywords: '',
  blocks: [],
  widgets: [],
  typography: {
    fontFamily: 'system',
    fontWeight: 'regular',
    h1Size: 'md',
    h2Size: 'md',
    bodySize: 'md',
    lineHeight: 'relaxed',
    textAlign: 'left'
  }
};

function postToContent(post: BlogPost) {
  return post.sections.flatMap((section) => section.body).join('\n\n');
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildSections(content: string) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return [
    {
      heading: 'Editorial completo',
      body: paragraphs.length > 0 ? paragraphs : ['Texto principal ainda em rascunho.']
    }
  ];
}

function blocksFromContent(content: string): ContentBlock[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      if (paragraph.startsWith('# ')) {
        return { id: createId('block'), type: 'h1', content: paragraph.replace(/^#\s+/, '') };
      }

      if (paragraph.startsWith('## ')) {
        return { id: createId('block'), type: 'h2', content: paragraph.replace(/^##\s+/, '') };
      }

      if (paragraph.startsWith('### ')) {
        return { id: createId('block'), type: 'h3', content: paragraph.replace(/^###\s+/, '') };
      }

      return { id: createId('block'), type: 'paragraph', content: paragraph };
    });
}

function contentFromBlocks(blocks: ContentBlock[]) {
  return blocks
    .filter((block) => ['h1', 'h2', 'h3', 'paragraph', 'quote'].includes(block.type))
    .map((block) => block.content)
    .join('\n\n');
}

function postToBlocks(post: BlogPost) {
  if (post.contentBlocks && post.contentBlocks.length > 0) {
    return post.contentBlocks;
  }

  return post.sections.flatMap((section) => [
    ...(section.heading && section.heading !== 'Editorial completo'
      ? [{ id: createId('block'), type: 'h2' as const, content: section.heading }]
      : []),
    ...section.body.map((paragraph) => ({ id: createId('block'), type: 'paragraph' as const, content: paragraph }))
  ]);
}

function statusClass(ok?: boolean) {
  return ok ? 'border-mint/30 bg-mint/10 text-mint' : 'border-amber/30 bg-amber/10 text-amber';
}

function Panel({
  title,
  description,
  icon,
  action,
  children,
  className = ''
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-white/10 bg-white/[0.04] ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan/20 bg-cyan/10 text-cyan">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">{title}</h2>
            {description ? <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p> : null}
          </div>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  className = ''
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 text-xs font-semibold text-slate-200 ${className}`}>
      {label}
      {children}
    </label>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-black/20 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{text}</p>
    </div>
  );
}

export function EditorClient() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [state, setState] = useState<ApiState | null>(null);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [message, setMessage] = useState('');
  const [editorMessage, setEditorMessage] = useState('');
  const [form, setForm] = useState<PostForm>(emptyPost);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [manualLinkUrl, setManualLinkUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const summaryRef = useRef<HTMLTextAreaElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const posts = state?.posts ?? [];
  const publishedCount = posts.filter((post) => post.published).length;
  const draftCount = posts.length - publishedCount;
  const pageCount = posts.filter((post) => (post.contentType ?? 'post') === 'page').length;
  const editingLabel = useMemo(() => (editingSlug ? 'Atualizar rascunho' : 'Salvar rascunho'), [editingSlug]);
  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...(state?.posts.map((post) => post.category).filter(Boolean) ?? []),
          'Programacao',
          'Inteligencia Artificial',
          'VPS e Deploy',
          'Low-Code'
        ])
      ).sort(),
    [state?.posts]
  );
  const filteredPosts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return posts;
    }

    return posts.filter((post) =>
      [post.title, post.description, post.category, post.slug].some((value) => value.toLowerCase().includes(query))
    );
  }, [posts, searchTerm]);
  const metrics: Array<[string, number, LucideIcon]> = [
    ['Total', posts.length, FileText],
    ['Rascunhos', draftCount, PencilLine],
    ['Publicados', publishedCount, CheckCircle2],
    ['Paginas', pageCount, PanelRight]
  ];

  useEffect(() => {
    const savedToken = window.localStorage.getItem('levelingdev-admin-token');

    if (savedToken) {
      setToken(savedToken);
    }

    fetch('/api/editor/status')
      .then((response) => response.json())
      .then((data: StatusState) => {
        setStatus(data);

        if (!data.adminTokenConfigured) {
          setMessage('ADMIN_TOKEN ainda nao esta configurado nas variaveis de ambiente da aplicacao no Dokploy.');
        } else if (!data.databaseConfigured) {
          setMessage('ADMIN_TOKEN existe, mas DATABASE_URL ainda nao esta configurada na aplicacao.');
        } else if (!data.databaseReachable) {
          setMessage(`DATABASE_URL existe, mas o banco nao respondeu: ${data.databaseError}`);
        }
      })
      .catch(() => {
        setMessage('Nao foi possivel ler o status do editor.');
      });
  }, []);

  async function request(path: string, init?: RequestInit) {
    const response = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token.trim(),
        ...(init?.headers ?? {})
      }
    });
    const text = await response.text();
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || 'Resposta invalida do servidor.' };
    }

    if (!response.ok) {
      throw new Error(data.error ?? 'Erro inesperado.');
    }

    return data;
  }

  async function loadPosts() {
    try {
      window.localStorage.setItem('levelingdev-admin-token', token.trim());
      setMessage('Carregando posts...');
      const data = (await request('/api/editor/posts')) as ApiState;
      setState(data);
      setAuthenticated(true);
      setMessage(data.database ? 'Editor conectado ao PostgreSQL.' : 'Sem DATABASE_URL: leitura dos posts estaticos.');
    } catch (error) {
      setAuthenticated(false);
      setMessage(error instanceof Error ? error.message : 'Erro ao carregar.');
    }
  }

  async function syncNews() {
    try {
      setMessage('Buscando noticias reais nas fontes configuradas. Todo item novo entra como rascunho.');
      const data = await request('/api/news/sync', { method: 'POST' });
      setMessage(`Sincronizacao concluida: ${data.imported} posts importados ou atualizados como rascunho.`);
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao sincronizar.');
    }
  }

  function setField<K extends keyof PostForm>(field: K, value: PostForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setEditingSlug(null);
    setForm(emptyPost);
    setEditorMessage('');
  }

  function startEdit(post: BlogPost) {
    const blocks = postToBlocks(post);
    setEditingSlug(post.slug);
    setForm({
      slug: post.slug,
      contentType: post.contentType ?? 'post',
      title: post.title,
      summary: post.description,
      content: contentFromBlocks(blocks) || postToContent(post),
      category: post.category,
      image: post.image,
      sourceImageUrl: post.sourceImageUrl ?? post.sourceUrl ?? post.externalLinks[0]?.href ?? '',
      videoUrl: post.videoUrl ?? '',
      externalUrl: post.sourceUrl ?? post.externalLinks[0]?.href ?? '',
      keywords: post.keywords.join(', '),
      blocks,
      widgets: post.widgets ?? [],
      typography: {
        ...emptyPost.typography,
        ...(post.typography ?? {})
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function readFileAsDataUrl(event: ChangeEvent<HTMLInputElement>, field: 'image' | 'videoUrl') {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setField(field, String(reader.result ?? ''));
      setMessage(`${field === 'image' ? 'Imagem' : 'Video'} carregado no editor. Salve o rascunho para gravar.`);
    };
    reader.readAsDataURL(file);
  }

  function applyManualLink(field: 'summary' | 'content') {
    const url = manualLinkUrl.trim();
    const textarea = field === 'summary' ? summaryRef.current : contentRef.current;

    if (!url || !/^https?:\/\//i.test(url)) {
      setEditorMessage('Cole uma URL valida com http:// ou https:// para aplicar o link.');
      return;
    }

    if (!textarea) {
      return;
    }

    const currentValue = form[field];
    const start = textarea.selectionStart ?? currentValue.length;
    const end = textarea.selectionEnd ?? currentValue.length;
    const selectedText = currentValue.slice(start, end).trim() || 'texto do link';
    const linkedText = `[${selectedText}](${url})`;
    const nextValue = `${currentValue.slice(0, start)}${linkedText}${currentValue.slice(end)}`;

    setField(field, nextValue);
    setEditorMessage('Link aplicado no texto selecionado.');
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      const articleContent = form.blocks.length > 0 ? contentFromBlocks(form.blocks) : form.content;
      const externalLinks = form.externalUrl
        ? [
            {
              label: 'Fonte ou referencia',
              href: form.externalUrl
            }
          ]
        : [];
      const payload: Partial<BlogPost> = {
        slug: form.slug.trim() || undefined,
        contentType: form.contentType,
        title: form.title,
        description: form.summary,
        category: form.category,
        image: form.image,
        imageAlt: `Imagem editorial sobre ${form.title}`,
        sourceImageUrl: form.sourceImageUrl || form.externalUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        keywords: form.keywords
          .split(',')
          .map((keyword) => keyword.trim())
          .filter(Boolean),
        sections: buildSections(articleContent),
        contentBlocks: form.blocks.length > 0 ? form.blocks : blocksFromContent(form.content),
        widgets: form.widgets,
        typography: form.typography,
        checklist: ['Revisar ortografia e fonte.', 'Validar links e comandos.', 'Publicar manualmente apos revisao.'],
        externalLinks,
        sourceUrl: form.externalUrl || undefined,
        sourceName: form.externalUrl ? 'Fonte informada no editor' : undefined,
        published: false
      };

      await request('/api/editor/posts', {
        method: editingSlug ? 'PATCH' : 'POST',
        body: JSON.stringify(editingSlug ? { ...payload, slug: editingSlug } : payload)
      });

      resetForm();
      setMessage(editingSlug ? 'Rascunho atualizado.' : 'Post criado como rascunho.');
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar post.');
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(slug: string) {
    try {
      await request(`/api/editor/posts?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
      setMessage('Post removido.');
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao remover post.');
    }
  }

  async function updatePost(slug: string, patch: Partial<BlogPost>) {
    try {
      await request('/api/editor/posts', {
        method: 'PATCH',
        body: JSON.stringify({ slug, ...patch })
      });
      setMessage('Post atualizado.');
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao atualizar post.');
    }
  }

  async function rewritePost(slug: string) {
    try {
      setMessage('Reescrevendo em PT-BR com texto editorial proprio...');
      await request('/api/editor/rewrite', {
        method: 'POST',
        body: JSON.stringify({ slug, provider: 'local' })
      });
      setMessage('Post reescrito e revisado. Revise o rascunho antes de publicar.');
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao reescrever post.');
    }
  }

  async function fetchImageFromSource(slug: string, sourceImageUrl?: string) {
    try {
      setMessage('Buscando imagem diretamente no link da fonte...');
      await request('/api/editor/source-image', {
        method: 'POST',
        body: JSON.stringify({ slug, sourceImageUrl })
      });
      setMessage('Imagem encontrada na fonte e salva no rascunho.');
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao buscar imagem da fonte.');
    }
  }

  const loginPanel = (
    <Panel
      title="Acesso administrativo"
      description="Use o ADMIN_TOKEN da aplicacao para carregar, editar e publicar conteudo."
      icon={<KeyRound className="h-4 w-4" />}
      className="shadow-glow"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className={`rounded-lg border px-4 py-3 ${statusClass(status?.adminTokenConfigured)}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em]">ADMIN_TOKEN</p>
          <p className="mt-1 text-sm font-semibold">
            {status?.adminTokenConfigured ? 'Configurado' : 'Nao configurado'}
          </p>
        </div>
        <div className={`rounded-lg border px-4 py-3 ${statusClass(status?.databaseReachable)}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em]">DATABASE_URL</p>
          <p className="mt-1 text-sm font-semibold">
            {status?.databaseReachable
              ? 'Banco conectado'
              : status?.databaseConfigured
                ? 'Configurado, sem conexao'
                : 'Nao configurado'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          type="password"
          placeholder="ADMIN_TOKEN configurado no Dokploy"
          className="min-h-11 rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
        />
        <button
          type="button"
          onClick={loadPosts}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan px-4 text-sm font-semibold text-ink transition hover:bg-white"
        >
          <RefreshCw className="h-4 w-4" />
          Entrar
        </button>
      </div>
      {message ? <p className="mt-4 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm leading-6 text-mint">{message}</p> : null}
    </Panel>
  );

  if (!authenticated) {
    return <div className="mx-auto max-w-3xl">{loginPanel}</div>;
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">Sessao ativa</p>
          <p className="mt-2 text-sm text-slate-300">{message || 'Editor pronto.'}</p>
        </div>
        {metrics.map(([label, value, Icon]) => (
          <div key={String(label)} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{String(label)}</p>
              <Icon className="h-4 w-4 text-cyan" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{String(value)}</p>
          </div>
        ))}
      </div>

      <form onSubmit={savePost} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel
          title={editingSlug ? 'Editar rascunho' : 'Novo editorial'}
          description="Escreva e monte os blocos principais do conteudo."
          icon={<Layers3 className="h-4 w-4" />}
          action={
            editingSlug ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200 transition hover:border-cyan/40"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            ) : null
          }
        >
          {editorMessage ? <p className="mb-4 rounded-lg border border-cyan/20 bg-cyan/5 px-3 py-2 text-xs leading-5 text-cyan">{editorMessage}</p> : null}
          <div className="grid gap-3">
            <input
              value={form.title}
              onChange={(event) => setField('title', event.target.value)}
              required
              placeholder="Titulo do editorial"
              className="min-h-11 rounded-lg border border-white/10 bg-black/30 px-3 text-base font-semibold text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />

            <div className="grid gap-3 md:grid-cols-[160px_1fr_220px]">
              <Field label="Tipo">
                <select
                  value={form.contentType}
                  onChange={(event) => setField('contentType', event.target.value as PostForm['contentType'])}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="post">Post / Noticia</option>
                  <option value="page">Pagina</option>
                </select>
              </Field>
              <Field label="Slug / URL">
                <input
                  value={form.slug}
                  onChange={(event) => setField('slug', event.target.value)}
                  placeholder={form.contentType === 'page' ? 'sobre-a-levelingdev' : 'titulo-do-post'}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                />
              </Field>
              <Field label="Categoria">
                <input
                  value={form.category}
                  onChange={(event) => setField('category', event.target.value)}
                  list="editor-categories"
                  placeholder="Categoria"
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                />
                <datalist id="editor-categories">
                  {categoryOptions.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </Field>
            </div>

            <div className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-3 md:grid-cols-[1fr_auto_auto]">
              <input
                value={manualLinkUrl}
                onChange={(event) => setManualLinkUrl(event.target.value)}
                placeholder="URL para aplicar no texto selecionado"
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
              <button type="button" onClick={() => applyManualLink('summary')} className="editor-button justify-center">
                <Link2 className="h-4 w-4" />
                Link no resumo
              </button>
              <button type="button" onClick={() => applyManualLink('content')} className="editor-button justify-center">
                <Link2 className="h-4 w-4" />
                Link no texto
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Resumo">
                <textarea
                  ref={summaryRef}
                  value={form.summary}
                  onChange={(event) => setField('summary', event.target.value)}
                  required
                  rows={9}
                  placeholder="Resumo curto para cards da Home e SEO"
                  className="min-h-56 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                />
              </Field>
              <Field label="Texto da materia">
                <textarea
                  ref={contentRef}
                  value={form.content}
                  onChange={(event) => setField('content', event.target.value)}
                  rows={9}
                  placeholder="Texto principal completo. Use linhas em branco para separar blocos."
                  className="min-h-56 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                />
              </Field>
            </div>

          </div>
        </Panel>

        <div className="grid gap-5 self-start xl:sticky xl:top-20">
          <Panel title="Midia e SEO" description="Dados auxiliares do post." icon={<ImagePlus className="h-4 w-4" />}>
            <div className="grid gap-3">
              <Field label="SEO keywords">
                <input
                  value={form.keywords}
                  onChange={(event) => setField('keywords', event.target.value)}
                  placeholder="palavras separadas por virgula"
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                />
              </Field>
              <Field label="Imagem por URL">
                <input
                  value={form.image}
                  onChange={(event) => setField('image', event.target.value)}
                  placeholder="https://..."
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                />
              </Field>
              <Field label="Link da fonte para buscar imagem">
                <input
                  value={form.sourceImageUrl}
                  onChange={(event) => setField('sourceImageUrl', event.target.value)}
                  placeholder="Link usado para procurar og:image"
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                />
              </Field>
              <Field label="Upload de imagem">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => readFileAsDataUrl(event, 'image')}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
                />
              </Field>
              <button
                type="button"
                onClick={() => editingSlug && fetchImageFromSource(editingSlug, form.sourceImageUrl)}
                disabled={!editingSlug}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan/30 px-3 text-sm font-semibold text-cyan transition hover:bg-cyan/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ImagePlus className="h-4 w-4" />
                Buscar imagem da fonte
              </button>
              <Field label="Video por URL ou embed">
                <input
                  value={form.videoUrl}
                  onChange={(event) => setField('videoUrl', event.target.value)}
                  placeholder="https://youtube.com/... ou arquivo .mp4"
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                />
              </Field>
              <Field label="Upload de video">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) => readFileAsDataUrl(event, 'videoUrl')}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
                />
              </Field>
              <Field label="Fonte ou referencia">
                <input
                  value={form.externalUrl}
                  onChange={(event) => setField('externalUrl', event.target.value)}
                  placeholder="https://fonte-original.com"
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                />
              </Field>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-mint px-4 text-sm font-semibold text-ink transition hover:bg-white disabled:cursor-wait disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingLabel}
              </button>
            </div>
          </Panel>

        </div>
      </form>

      <Panel
        title="Publicacoes"
        description="Revise, publique, destaque, reescreva ou remova itens do banco."
        icon={<FileText className="h-4 w-4" />}
        action={
          <button
            type="button"
            onClick={syncNews}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3 text-sm font-semibold text-white transition hover:border-cyan/50"
          >
            <RefreshCw className="h-4 w-4" />
            Buscar noticias
          </button>
        }
      >
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por titulo, slug ou categoria"
              className="min-h-10 w-full rounded-lg border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-300">
            {filteredPosts.length} de {posts.length} itens
          </div>
        </div>

        <div className="grid gap-3">
          {filteredPosts.length === 0 ? (
            <EmptyState title="Nada encontrado" text="Ajuste a busca ou sincronize novas noticias." />
          ) : (
            filteredPosts.map((post) => (
              <article key={post.slug} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="grid gap-4 lg:grid-cols-[150px_1fr]">
                  <img src={post.image} alt={post.imageAlt} className="h-28 w-full rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan">{post.category}</p>
                      <span className={`rounded-full px-2 py-1 text-xs ${post.published ? 'bg-mint/10 text-mint' : 'bg-amber/10 text-amber'}`}>
                        {post.published ? 'Publicado' : 'Rascunho'}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">
                        {(post.contentType ?? 'post') === 'page' ? 'Pagina' : 'Post'}
                      </span>
                      {post.featured ? <span className="rounded-full bg-cyan/10 px-2 py-1 text-xs text-cyan">Destaque</span> : null}
                      {post.videoUrl ? <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">Com video</span> : null}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-white">{post.title}</h3>
                    <p className="summary-clamp mt-2 text-sm leading-6 text-slate-300">{post.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEdit(post)} className="editor-button">
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </button>
                      <button type="button" onClick={() => updatePost(post.slug, { published: !post.published })} className="editor-button">
                        {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {post.published ? 'Despublicar' : 'Publicar'}
                      </button>
                      <button type="button" onClick={() => updatePost(post.slug, { featured: !post.featured })} className="editor-button">
                        <Star className="h-4 w-4" />
                        {post.featured ? 'Remover destaque' : 'Destacar'}
                      </button>
                      <button type="button" onClick={() => rewritePost(post.slug)} className="editor-button">
                        <PencilLine className="h-4 w-4" />
                        Reescrever
                      </button>
                      <button type="button" onClick={() => fetchImageFromSource(post.slug)} className="editor-button">
                        <Link2 className="h-4 w-4" />
                        Imagem
                      </button>
                      {post.externalLinks[0] ? (
                        <a className="editor-button" href={post.externalLinks[0].href} target="_blank" rel="noreferrer">
                          <Link2 className="h-4 w-4" />
                          Fonte
                        </a>
                      ) : null}
                      <a className="editor-button text-cyan" href={(post.contentType ?? 'post') === 'page' ? `/${post.slug}` : `/blog/${post.slug}`}>
                        Abrir
                      </a>
                      <button type="button" onClick={() => deletePost(post.slug)} className="editor-button border-red-400/30 text-red-300 hover:bg-red-400/10">
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </button>
                    </div>
                    <label className="mt-4 grid max-w-xs gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                      Ordem na Home
                      <input
                        type="number"
                        defaultValue={post.sortOrder ?? 0}
                        onBlur={(event) => updatePost(post.slug, { sortOrder: Number(event.target.value) })}
                        className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                      />
                    </label>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
