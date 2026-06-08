'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Edit3,
  Eye,
  EyeOff,
  FileVideo,
  ImagePlus,
  Link2,
  PencilLine,
  RefreshCw,
  Save,
  Star,
  Trash2,
  X
} from 'lucide-react';
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

type SettingsState = Record<string, boolean>;

type PostForm = {
  title: string;
  summary: string;
  content: string;
  category: string;
  image: string;
  sourceImageUrl: string;
  videoUrl: string;
  externalUrl: string;
  keywords: string;
};

const emptyPost: PostForm = {
  title: '',
  summary: '',
  content: '',
  category: 'Programacao',
  image: '',
  sourceImageUrl: '',
  videoUrl: '',
  externalUrl: '',
  keywords: ''
};

const apiFields = [
  ['OPENAI_API_KEY', 'OpenAI API key'],
  ['GEMINI_API_KEY', 'Gemini API key'],
  ['ANTHROPIC_API_KEY', 'Claude / Anthropic API key'],
  ['DEEPSEEK_API_KEY', 'DeepSeek API key'],
  ['QWEN_API_KEY', 'Qwen API key'],
  ['QWEN_BASE_URL', 'Qwen base URL'],
  ['OPENCODE_API_KEY', 'OpenCode API key'],
  ['OPENCODE_BASE_URL', 'OpenCode base URL']
] as const;

const modelFields = [
  ['OPENAI_TEXT_MODEL', 'OpenAI texto'],
  ['OPENAI_IMAGE_MODEL', 'OpenAI imagem'],
  ['GEMINI_TEXT_MODEL', 'Gemini texto'],
  ['GEMINI_IMAGE_MODEL', 'Gemini imagem'],
  ['ANTHROPIC_TEXT_MODEL', 'Claude texto'],
  ['DEEPSEEK_TEXT_MODEL', 'DeepSeek texto'],
  ['QWEN_TEXT_MODEL', 'Qwen texto'],
  ['OPENCODE_TEXT_MODEL', 'OpenCode texto']
] as const;

function postToContent(post: BlogPost) {
  return post.sections.flatMap((section) => section.body).join('\n\n');
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

export function EditorClient() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [state, setState] = useState<ApiState | null>(null);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [message, setMessage] = useState('');
  const [textProvider, setTextProvider] = useState('local');
  const [imageProvider, setImageProvider] = useState('pollinations');
  const [textModel, setTextModel] = useState('');
  const [imageModel, setImageModel] = useState('');
  const [form, setForm] = useState<PostForm>(emptyPost);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [providerTab, setProviderTab] = useState<'modelos' | 'chaves'>('modelos');
  const [apiSettings, setApiSettings] = useState<Record<string, string>>({});
  const [configuredSettings, setConfiguredSettings] = useState<SettingsState>({});

  const editingLabel = useMemo(() => (editingSlug ? 'Atualizar rascunho' : 'Salvar rascunho'), [editingSlug]);

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
      window.localStorage.setItem('levelingdev-admin-token', token.trim());
      setMessage('Carregando posts...');
      const data = (await request('/api/editor/posts')) as ApiState;
      setState(data);
      setAuthenticated(true);
      await loadSettings();
      setMessage(data.database ? 'Editor conectado ao PostgreSQL.' : 'Sem DATABASE_URL: somente leitura dos posts estaticos.');
    } catch (error) {
      setAuthenticated(false);
      setMessage(error instanceof Error ? error.message : 'Erro ao carregar.');
    }
  }

  async function loadSettings() {
    const data = (await request('/api/editor/settings')) as { configured: SettingsState };
    setConfiguredSettings(data.configured);
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const data = (await request('/api/editor/settings', {
        method: 'POST',
        body: JSON.stringify(apiSettings)
      })) as { configured: SettingsState };

      setConfiguredSettings(data.configured);
      setApiSettings({});
      setMessage('Chaves e modelos salvos no banco. Agora o editor pode usar essas APIs.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar chaves.');
    }
  }

  async function syncNews() {
    try {
      setMessage('Buscando noticias reais nas fontes configuradas. Todo item novo entra como rascunho.');
      const data = await request('/api/news/sync', { method: 'POST' });
      setMessage(`Sincronizacao concluida: ${data.imported} posts importados/atualizados como rascunho.`);
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
  }

  function startEdit(post: BlogPost) {
    setEditingSlug(post.slug);
    setForm({
      title: post.title,
      summary: post.description,
      content: postToContent(post),
      category: post.category,
      image: post.image,
      sourceImageUrl: post.sourceImageUrl ?? post.sourceUrl ?? post.externalLinks[0]?.href ?? '',
      videoUrl: post.videoUrl ?? '',
      externalUrl: post.sourceUrl ?? post.externalLinks[0]?.href ?? '',
      keywords: post.keywords.join(', ')
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

  async function savePost(event: FormEvent<HTMLFormElement>) {
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
      const payload: Partial<BlogPost> = {
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
        sections: buildSections(form.content),
        checklist: ['Revisar ortografia e fonte.', 'Validar links e comandos.', 'Publicar manualmente apos revisao.'],
        externalLinks,
        sourceUrl: form.externalUrl || undefined,
        sourceName: form.externalUrl ? 'Fonte informada no editor' : undefined,
        published: false
      };

      await request('/api/editor/posts', {
        method: editingSlug ? 'PATCH' : 'POST',
        body: JSON.stringify(editingSlug ? { slug: editingSlug, ...payload } : payload)
      });

      resetForm();
      setMessage(editingSlug ? 'Rascunho atualizado.' : 'Post criado como rascunho.');
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar post.');
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
        body: JSON.stringify({ slug, provider: textProvider, model: textModel.trim() || undefined })
      });
      setMessage('Post reescrito e revisado. Revise o rascunho antes de publicar.');
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
        body: JSON.stringify({ slug, provider: imageProvider, model: imageModel.trim() || undefined })
      });
      setMessage('Imagem editorial gerada e salva no rascunho.');
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao gerar imagem.');
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

  async function generateVideoPrompt(slug: string) {
    try {
      const data = await request('/api/editor/video', {
        method: 'POST',
        body: JSON.stringify({ slug })
      });
      setMessage(`Prompt de video: ${data.video.prompt}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao gerar prompt de video.');
    }
  }

  const loginCard = (
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
      <button
        type="button"
        onClick={loadPosts}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyan px-4 text-sm font-semibold text-ink transition hover:bg-white"
      >
        <RefreshCw className="h-4 w-4" />
        Entrar no editor
      </button>
      {message ? <p className="mt-4 text-sm leading-6 text-mint">{message}</p> : null}
    </section>
  );

  if (!authenticated) {
    return <div className="grid gap-5">{loginCard}</div>;
  }

  return (
    <div className="grid gap-5">
      {loginCard}

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Provedores de IA</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Escolha modelos ou salve as chaves na aba Chaves de API. Variáveis do Dokploy continuam tendo prioridade.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-white/10 bg-black/25 p-1">
            {(['modelos', 'chaves'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setProviderTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  providerTab === tab ? 'bg-cyan text-ink' : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab === 'modelos' ? 'Modelos' : 'Chaves de API'}
              </button>
            ))}
          </div>
        </div>
        {providerTab === 'modelos' ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
                Texto, resumo e editorial
                <select
                  value={textProvider}
                  onChange={(event) => setTextProvider(event.target.value)}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="local">Local sem API</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Gemini</option>
                  <option value="anthropic">Claude / Anthropic</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="qwen">Qwen</option>
                  <option value="opencode">OpenCode</option>
                </select>
              </label>
              <input
                value={textModel}
                onChange={(event) => setTextModel(event.target.value)}
                placeholder="Modelo de texto: gpt-5-mini, gemini-2.5-flash, claude-sonnet-4-5..."
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
                Imagem editorial
                <select
                  value={imageProvider}
                  onChange={(event) => setImageProvider(event.target.value)}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="pollinations">Fallback gratuito</option>
                  <option value="openai">OpenAI Images</option>
                  <option value="gemini">Gemini Nano Banana</option>
                </select>
              </label>
              <input
                value={imageModel}
                onChange={(event) => setImageModel(event.target.value)}
                placeholder="Modelo de imagem: gpt-image-1, gemini-2.5-flash-image..."
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={saveSettings} className="mt-4 grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              {[...apiFields, ...modelFields].map(([key, label]) => (
                <label key={key} className="grid gap-1.5 text-xs font-semibold text-slate-200">
                  {label}
                  <input
                    value={apiSettings[key] ?? ''}
                    onChange={(event) => setApiSettings((current) => ({ ...current, [key]: event.target.value }))}
                    type={key.endsWith('_API_KEY') ? 'password' : 'text'}
                    placeholder={configuredSettings[key] ? 'Configurada. Preencha apenas se quiser trocar.' : key}
                    className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                  />
                </label>
              ))}
            </div>
            <button
              type="submit"
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg bg-cyan px-4 text-sm font-semibold text-ink transition hover:bg-white"
            >
              <Save className="h-4 w-4" />
              Salvar chaves
            </button>
          </form>
        )}
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Editor de Post</h2>
          {editingSlug ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200"
            >
              <X className="h-4 w-4" />
              Cancelar edicao
            </button>
          ) : null}
        </div>
        <form onSubmit={savePost} className="mt-4 grid gap-3">
          <input
            value={form.title}
            onChange={(event) => setField('title', event.target.value)}
            required
            placeholder="Titulo do editorial"
            className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
          />
          <div className="grid gap-3 lg:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Resumo
              <textarea
                value={form.summary}
                onChange={(event) => setField('summary', event.target.value)}
                required
                rows={10}
                placeholder="Resumo curto para aparecer somente nos cards da Home e SEO"
                className="min-h-64 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Texto da matéria
              <textarea
                value={form.content}
                onChange={(event) => setField('content', event.target.value)}
                rows={10}
                placeholder="Texto principal completo. Este conteudo aparece somente na pagina completa do post."
                className="min-h-64 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.category}
              onChange={(event) => setField('category', event.target.value)}
              placeholder="Categoria"
              className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
            <input
              value={form.keywords}
              onChange={(event) => setField('keywords', event.target.value)}
              placeholder="SEO keywords separadas por virgula"
              className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Imagem por URL
              <input
                value={form.image}
                onChange={(event) => setField('image', event.target.value)}
                placeholder="https://..."
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Link da fonte para buscar imagem
              <input
                value={form.sourceImageUrl}
                onChange={(event) => setField('sourceImageUrl', event.target.value)}
                placeholder="Link usado somente pelo editor para procurar og:image"
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Upload de imagem
              <input
                type="file"
                accept="image/*"
                onChange={(event) => readFileAsDataUrl(event, 'image')}
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
              />
            </label>
            <button
              type="button"
              onClick={() => editingSlug && fetchImageFromSource(editingSlug, form.sourceImageUrl)}
              disabled={!editingSlug}
              className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan/30 px-3 text-sm font-semibold text-cyan transition hover:bg-cyan/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ImagePlus className="h-4 w-4" />
              Buscar imagem da fonte
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Video por URL ou embed
              <input
                value={form.videoUrl}
                onChange={(event) => setField('videoUrl', event.target.value)}
                placeholder="https://youtube.com/... ou arquivo .mp4"
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Upload de video
              <input
                type="file"
                accept="video/*"
                onChange={(event) => readFileAsDataUrl(event, 'videoUrl')}
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
              />
            </label>
          </div>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
            Link de fonte ou referencia
            <input
              value={form.externalUrl}
              onChange={(event) => setField('externalUrl', event.target.value)}
              placeholder="https://fonte-original.com"
              className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-mint px-4 text-sm font-semibold text-ink transition hover:bg-white"
          >
            <Save className="h-4 w-4" />
            {editingLabel}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Controle total das publicacoes</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Todos os itens do banco ficam como rascunho ate voce revisar e publicar manualmente.
            </p>
          </div>
          <button
            type="button"
            onClick={syncNews}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-cyan/50"
          >
            <RefreshCw className="h-4 w-4" />
            Buscar noticias agora
          </button>
        </div>
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
                    {post.videoUrl ? <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">Com video</span> : null}
                  </div>
                  <h3 className="mt-2 font-semibold text-white">{post.title}</h3>
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
                      {post.featured ? 'Remover destaque' : 'Destacar Home'}
                    </button>
                    <button type="button" onClick={() => rewritePost(post.slug)} className="editor-button">
                      <PencilLine className="h-4 w-4" />
                      Reescrever PT-BR
                    </button>
                    <button type="button" onClick={() => generateImage(post.slug)} className="editor-button">
                      <ImagePlus className="h-4 w-4" />
                      Gerar imagem
                    </button>
                    <button type="button" onClick={() => fetchImageFromSource(post.slug)} className="editor-button">
                      <Link2 className="h-4 w-4" />
                      Imagem da fonte
                    </button>
                    <button type="button" onClick={() => generateVideoPrompt(post.slug)} className="editor-button">
                      <FileVideo className="h-4 w-4" />
                      Prompt video
                    </button>
                    {post.externalLinks[0] ? (
                      <a className="editor-button" href={post.externalLinks[0].href} target="_blank" rel="noreferrer">
                        <Link2 className="h-4 w-4" />
                        Fonte
                      </a>
                    ) : null}
                    <a className="editor-button text-cyan" href={`/blog/${post.slug}`}>
                      Abrir post
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
