'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, ImagePlus, PencilLine, RefreshCw, Save, Star, Trash2 } from 'lucide-react';
import type { BlogPost } from '../lib/types';

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

const emptyPost = {
  title: '',
  description: '',
  category: 'Programacao',
  image: '',
  externalUrl: ''
};

export function EditorClient() {
  const [token, setToken] = useState('');
  const [state, setState] = useState<ApiState | null>(null);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(emptyPost);

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
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? 'Erro inesperado.');
    }

    return data;
  }

  async function loadPosts() {
    try {
      window.localStorage.setItem('levelingdev-admin-token', token);
      setMessage('Carregando posts...');
      const data = (await request('/api/editor/posts')) as ApiState;
      setState(data);
      setMessage(data.database ? 'Editor conectado ao PostgreSQL.' : 'Sem DATABASE_URL: somente leitura dos posts estaticos.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao carregar.');
    }
  }

  async function syncNews() {
    try {
      setMessage('Buscando noticias reais nas fontes configuradas...');
      const data = await request('/api/news/sync', { method: 'POST' });
      setMessage(`Sincronizacao concluida: ${data.imported} posts importados/atualizados.`);
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao sincronizar.');
    }
  }

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const externalLinks = form.externalUrl
        ? [
            {
              label: 'Fonte ou referencia',
              href: form.externalUrl
            }
          ]
        : [];

      await request('/api/editor/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          image: form.image,
          imageAlt: `Imagem editorial sobre ${form.title}`,
          sections: [
            {
              heading: 'Resumo',
              body: [form.description]
            },
            {
              heading: 'Contexto para leitores',
              body: [
                'Este post foi criado pelo editor do LevellingDev e pode ser expandido com tutorial, exemplos, comandos e referencias tecnicas.',
                'Antes de publicar como guia definitivo, revise comandos, links externos e impactos de seguranca.'
              ]
            }
          ],
          checklist: ['Revisar links.', 'Adicionar exemplos praticos.', 'Testar comandos antes de publicar.'],
          externalLinks
        })
      });
      setForm(emptyPost);
      setMessage('Post criado com sucesso.');
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao criar post.');
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
        body: JSON.stringify({ slug })
      });
      setMessage('Post reescrito e revisado.');
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao reescrever post.');
    }
  }

  async function generateImage(slug: string) {
    try {
      setMessage('Gerando imagem editorial para o post...');
      await request('/api/editor/image', {
        method: 'POST',
        body: JSON.stringify({ slug })
      });
      setMessage('Imagem editorial gerada.');
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao gerar imagem.');
    }
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">ADMIN_TOKEN</p>
            <p className={`mt-2 text-sm font-semibold ${status?.adminTokenConfigured ? 'text-mint' : 'text-red-300'}`}>
              {status?.adminTokenConfigured ? 'Configurado na aplicacao' : 'Nao configurado na aplicacao'}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">DATABASE_URL</p>
            <p className={`mt-2 text-sm font-semibold ${status?.databaseReachable ? 'text-mint' : 'text-amber'}`}>
              {status?.databaseReachable
                ? 'Banco conectado'
                : status?.databaseConfigured
                  ? 'Banco configurado, mas sem conexao'
                  : 'Banco nao configurado na aplicacao'}
            </p>
          </div>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-200">
          Token de administrador
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            type="password"
            placeholder="ADMIN_TOKEN configurado no Dokploy"
            className="min-h-12 rounded-lg border border-white/10 bg-black/30 px-4 text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadPosts}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyan px-4 text-sm font-semibold text-ink transition hover:bg-white"
          >
            <RefreshCw className="h-4 w-4" />
            Entrar / atualizar
          </button>
          <button
            type="button"
            onClick={syncNews}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-cyan/50"
          >
            <RefreshCw className="h-4 w-4" />
            Buscar noticias agora
          </button>
        </div>
        {message ? <p className="mt-4 text-sm leading-6 text-mint">{message}</p> : null}
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-2xl font-semibold text-white">Criar post manual</h2>
        <form onSubmit={createPost} className="mt-5 grid gap-4">
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            required
            placeholder="Titulo"
            className="min-h-12 rounded-lg border border-white/10 bg-black/30 px-4 text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
          />
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            required
            rows={5}
            placeholder="Resumo humanizado do post"
            className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <input
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              placeholder="Categoria"
              className="min-h-12 rounded-lg border border-white/10 bg-black/30 px-4 text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
            <input
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
              placeholder="URL da imagem"
              className="min-h-12 rounded-lg border border-white/10 bg-black/30 px-4 text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
            <input
              value={form.externalUrl}
              onChange={(event) => setForm((current) => ({ ...current, externalUrl: event.target.value }))}
              placeholder="Link de fonte/referencia"
              className="min-h-12 rounded-lg border border-white/10 bg-black/30 px-4 text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-mint px-4 text-sm font-semibold text-ink transition hover:bg-white"
          >
            <Save className="h-4 w-4" />
            Salvar post
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-2xl font-semibold text-white">Controle total das publicacoes</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Publique, tire do ar, destaque na Home, defina ordem, gere imagem editorial e reescreva o texto em portugues
          com fonte preservada.
        </p>
        <div className="mt-5 grid gap-3">
          {state?.posts.map((post) => (
            <div key={post.slug} className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
                <img src={post.image} alt={post.imageAlt} className="h-28 w-full rounded-lg object-cover" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan">{post.category}</p>
                    <span className={`rounded-full px-2 py-1 text-xs ${post.published ? 'bg-mint/10 text-mint' : 'bg-amber/10 text-amber'}`}>
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </span>
                    {post.featured ? <span className="rounded-full bg-cyan/10 px-2 py-1 text-xs text-cyan">Destaque</span> : null}
                  </div>
                  <h3 className="mt-2 font-semibold text-white">{post.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{post.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updatePost(post.slug, { published: !post.published })}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200 transition hover:border-cyan/50"
                    >
                      {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {post.published ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePost(post.slug, { featured: !post.featured })}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200 transition hover:border-cyan/50"
                    >
                      <Star className="h-4 w-4" />
                      {post.featured ? 'Remover destaque' : 'Destacar Home'}
                    </button>
                    <button
                      type="button"
                      onClick={() => rewritePost(post.slug)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200 transition hover:border-mint/50"
                    >
                      <PencilLine className="h-4 w-4" />
                      Reescrever PT-BR
                    </button>
                    <button
                      type="button"
                      onClick={() => generateImage(post.slug)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200 transition hover:border-mint/50"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Gerar imagem
                    </button>
                    <a className="inline-flex min-h-10 items-center rounded-lg border border-white/10 px-3 text-sm text-cyan hover:text-white" href={`/blog/${post.slug}`}>
                      Abrir post
                    </a>
                    <button
                      type="button"
                      onClick={() => deletePost(post.slug)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-400/30 px-3 text-sm text-red-300 transition hover:bg-red-400/10"
                    >
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
