'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  PencilLine,
  RefreshCw,
  Save,
  Star,
  Trash2,
  X
} from 'lucide-react';
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

type SettingsState = Record<string, boolean>;

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
  aiPrompt: string;
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
  aiPrompt: '',
  blocks: [],
  widgets: [],
  typography: {
    fontFamily: 'system',
    h1Size: 'md',
    h2Size: 'md',
    bodySize: 'md',
    lineHeight: 'relaxed',
    textAlign: 'left'
  }
};

const apiFields = [
  ['OPENAI_API_KEY', 'OpenAI API key'],
  ['GEMINI_API_KEY', 'Gemini API key'],
  ['ANTHROPIC_API_KEY', 'Claude / Anthropic API key'],
  ['DEEPSEEK_API_KEY', 'DeepSeek API key'],
  ['QWEN_API_KEY', 'Qwen API key'],
  ['OPENCODE_API_KEY', 'OpenCode API key']
] as const;

const textModelPresets: Record<string, Array<{ label: string; value: string }>> = {
  local: [{ label: 'Local sem API', value: '' }],
  openai: [
    { label: 'GPT-4.1 nano - econômico', value: 'gpt-4.1-nano' },
    { label: 'GPT-4.1 mini - econômico', value: 'gpt-4.1-mini' },
    { label: 'GPT-5 mini - padrão leve', value: 'gpt-5-mini' }
  ],
  gemini: [
    { label: 'Gemini 2.5 Flash-Lite - free tier/econômico', value: 'gemini-2.5-flash-lite' },
    { label: 'Gemini 2.5 Flash - rápido', value: 'gemini-2.5-flash' },
    { label: 'Gemini 2.0 Flash - compatível', value: 'gemini-2.0-flash' }
  ],
  anthropic: [
    { label: 'Claude Haiku 4.5 - econômico', value: 'claude-haiku-4-5' },
    { label: 'Claude 3.5 Haiku latest - leve', value: 'claude-3-5-haiku-latest' },
    { label: 'Claude Sonnet 4.5 - melhor qualidade', value: 'claude-sonnet-4-5' }
  ],
  deepseek: [
    { label: 'DeepSeek Chat - econômico', value: 'deepseek-chat' },
    { label: 'DeepSeek Reasoner - raciocínio', value: 'deepseek-reasoner' }
  ],
  qwen: [
    { label: 'Qwen Turbo - econômico', value: 'qwen-turbo' },
    { label: 'Qwen Plus - equilibrado', value: 'qwen-plus' },
    { label: 'Qwen VL Flash - multimodal', value: 'qwen3-vl-flash' }
  ],
  opencode: [
    { label: 'OpenCode auto/default', value: 'opencode-chat' },
    { label: 'Haiku 4.5 via OpenCode', value: 'claude-haiku-4-5' },
    { label: 'Gemini Flash via OpenCode', value: 'gemini-2.5-flash' },
    { label: 'Qwen Plus via OpenCode', value: 'qwen-plus' }
  ]
};

const imageModelPresets: Record<string, Array<{ label: string; value: string }>> = {
  pollinations: [{ label: 'Fallback gratuito automático', value: '' }],
  openai: [{ label: 'GPT Image 1', value: 'gpt-image-1' }],
  gemini: [
    { label: 'Gemini 2.5 Flash Image / Nano Banana', value: 'gemini-2.5-flash-image' },
    { label: 'Gemini 2.0 Flash Preview Image', value: 'gemini-2.0-flash-preview-image-generation' }
  ]
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

export function EditorClient() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [state, setState] = useState<ApiState | null>(null);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [message, setMessage] = useState('');
  const [editorMessage, setEditorMessage] = useState('');
  const [textProvider, setTextProvider] = useState('local');
  const [imageProvider, setImageProvider] = useState('pollinations');
  const [textModel, setTextModel] = useState('');
  const [imageModel, setImageModel] = useState('');
  const [form, setForm] = useState<PostForm>(emptyPost);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [providerTab, setProviderTab] = useState<'modelos' | 'chaves'>('modelos');
  const [apiSettings, setApiSettings] = useState<Record<string, string>>({});
  const [configuredSettings, setConfiguredSettings] = useState<SettingsState>({});
  const [remoteTextModels, setRemoteTextModels] = useState<string[]>([]);
  const [remoteImageModels, setRemoteImageModels] = useState<string[]>([]);
  const [manualLinkUrl, setManualLinkUrl] = useState('');
  const summaryRef = useRef<HTMLTextAreaElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const editingLabel = useMemo(() => (editingSlug ? 'Atualizar rascunho' : 'Salvar rascunho'), [editingSlug]);
  const categoryOptions = useMemo(
    () => Array.from(new Set([...(state?.posts.map((post) => post.category).filter(Boolean) ?? []), 'Programacao', 'Inteligencia Artificial', 'VPS e Deploy', 'Low-Code'])).sort(),
    [state?.posts]
  );

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
      setMessage('Chaves salvas no banco. Agora o editor pode consultar modelos e usar essas APIs.');
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

  async function fetchModels(provider: string, target: 'text' | 'image') {
    try {
      setMessage(`Buscando modelos disponiveis em ${provider}...`);
      const data = (await request(`/api/editor/models?provider=${encodeURIComponent(provider)}`)) as { models: string[] };

      if (target === 'text') {
        setRemoteTextModels(data.models);
      } else {
        setRemoteImageModels(data.models);
      }

      setMessage(data.models.length ? `Modelos carregados: ${data.models.length}.` : 'A API nao retornou modelos para essa chave.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao buscar modelos.');
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
      aiPrompt: '',
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
    setEditorMessage('Link aplicado no texto. Na pagina publica ele aparece dentro do paragrafo, sem bloco Base ou lista extra.');
  }

  function setTypography<K extends keyof PostTypography>(field: K, value: NonNullable<PostTypography[K]>) {
    setForm((current) => ({
      ...current,
      typography: {
        ...current.typography,
        [field]: value
      }
    }));
  }

  function syncTextToBlocks() {
    const blocks = blocksFromContent(form.content);
    setField('blocks', blocks);
    setEditorMessage('Texto convertido em blocos. Agora voce pode reposicionar midias, titulos e widgets antes de publicar.');
  }

  function addBlock(type: ContentBlock['type']) {
    const nextBlock: ContentBlock = {
      id: createId('block'),
      type,
      content: type === 'image' ? 'Imagem no corpo do editorial' : type === 'video' ? 'Video no corpo do editorial' : '',
      position: 'full'
    };

    setForm((current) => ({ ...current, blocks: [...current.blocks, nextBlock] }));
  }

  function updateBlock(id: string, patch: Partial<ContentBlock>) {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.map((block) => (block.id === id ? { ...block, ...patch } : block))
    }));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setForm((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.blocks.length) {
        return current;
      }

      const blocks = [...current.blocks];
      const [block] = blocks.splice(index, 1);
      blocks.splice(nextIndex, 0, block);
      return { ...current, blocks };
    });
  }

  function removeBlock(id: string) {
    setForm((current) => ({ ...current, blocks: current.blocks.filter((block) => block.id !== id) }));
  }

  function addWidget(area: PageWidget['area']) {
    const widget: PageWidget = {
      id: createId('widget'),
      type: 'note',
      area,
      title: 'Widget editorial',
      content: 'Conteudo do widget.'
    };

    setForm((current) => ({ ...current, widgets: [...current.widgets, widget] }));
  }

  function updateWidget(id: string, patch: Partial<PageWidget>) {
    setForm((current) => ({
      ...current,
      widgets: current.widgets.map((widget) => (widget.id === id ? { ...widget, ...patch } : widget))
    }));
  }

  function removeWidget(id: string) {
    setForm((current) => ({ ...current, widgets: current.widgets.filter((widget) => widget.id !== id) }));
  }

  function readBlockFileAsDataUrl(event: ChangeEvent<HTMLInputElement>, blockId: string) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateBlock(blockId, { url: String(reader.result ?? '') });
      setEditorMessage('Arquivo carregado no bloco. Salve o rascunho para gravar.');
    };
    reader.readAsDataURL(file);
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
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
    }
  }

  async function createDraftWithAi() {
    try {
      setEditorMessage('');
      if (!form.title.trim()) {
        setEditorMessage('Digite um titulo ou tema antes de gerar o editorial com IA.');
        return;
      }

      setEditorMessage('Criando editorial com IA...');
      const data = (await request('/api/editor/draft', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          instruction: form.aiPrompt || undefined,
          sourceUrl: form.externalUrl || form.sourceImageUrl || undefined,
          provider: textProvider,
          model: textModel.trim() || undefined
        })
      })) as { draft: BlogPost };

      setForm((current) => ({
        ...current,
        title: data.draft.title || current.title,
        slug: current.slug,
        summary: data.draft.description || current.summary,
        content: postToContent(data.draft),
        blocks: postToBlocks(data.draft),
        category: data.draft.category || current.category,
        keywords: data.draft.keywords.join(', '),
        externalUrl: data.draft.sourceUrl || current.externalUrl,
        sourceImageUrl: data.draft.sourceImageUrl || current.sourceImageUrl
      }));
      setEditorMessage('Editorial criado no formulario. Revise e salve como rascunho.');
    } catch (error) {
      setEditorMessage(error instanceof Error ? error.message : 'Erro ao criar editorial com IA.');
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
              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <select
                  value={textModel}
                  onChange={(event) => setTextModel(event.target.value)}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="">Usar padrao do provedor</option>
                  {(textModelPresets[textProvider] ?? []).map((model) => (
                    <option key={model.value || model.label} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                  {remoteTextModels.map((model) => (
                    <option key={model} value={model}>
                      API: {model}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => fetchModels(textProvider, 'text')}
                  disabled={textProvider === 'local'}
                  className="rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Puxar modelos
                </button>
              </div>
              <input
                value={textModel}
                onChange={(event) => setTextModel(event.target.value)}
                placeholder="Ou cole um modelo personalizado"
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
              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <select
                  value={imageModel}
                  onChange={(event) => setImageModel(event.target.value)}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="">Usar padrao do provedor</option>
                  {(imageModelPresets[imageProvider] ?? []).map((model) => (
                    <option key={model.value || model.label} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                  {remoteImageModels
                    .filter((model) => /image|imagen|flash/i.test(model))
                    .map((model) => (
                      <option key={model} value={model}>
                        API: {model}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => fetchModels(imageProvider, 'image')}
                  disabled={imageProvider === 'pollinations'}
                  className="rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Puxar modelos
                </button>
              </div>
              <input
                value={imageModel}
                onChange={(event) => setImageModel(event.target.value)}
                placeholder="Ou cole um modelo de imagem personalizado"
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={saveSettings} className="mt-4 grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              {apiFields.map(([key, label]) => (
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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={createDraftWithAi}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-cyan/30 px-3 text-sm font-semibold text-cyan transition hover:bg-cyan/10"
            >
              <PencilLine className="h-4 w-4" />
              Criar editorial com IA
            </button>
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
        </div>
        {editorMessage ? <p className="mt-3 rounded-lg border border-cyan/20 bg-cyan/5 px-3 py-2 text-xs leading-5 text-cyan">{editorMessage}</p> : null}
        <form onSubmit={savePost} className="mt-4 grid gap-3">
          <input
            value={form.title}
            onChange={(event) => setField('title', event.target.value)}
            required
            placeholder="Titulo do editorial"
            className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
          />
          <div className="grid gap-3 md:grid-cols-[160px_1fr_220px]">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Tipo
              <select
                value={form.contentType}
                onChange={(event) => setField('contentType', event.target.value as PostForm['contentType'])}
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
              >
                <option value="post">Post / Noticia</option>
                <option value="page">Pagina</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Slug / URL
              <input
                value={form.slug}
                onChange={(event) => setField('slug', event.target.value)}
                placeholder={form.contentType === 'page' ? 'sobre-a-levelingdev' : 'titulo-do-post'}
                className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Categoria
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
            </label>
          </div>
          <div className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-3 md:grid-cols-[1fr_auto]">
            <input
              value={manualLinkUrl}
              onChange={(event) => setManualLinkUrl(event.target.value)}
              placeholder="Cole a URL da fonte para marcar uma palavra selecionada como link"
              className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => applyManualLink('content')}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan/30 px-3 text-sm font-semibold text-cyan transition hover:bg-cyan/10"
            >
              <Link2 className="h-4 w-4" />
              Link no texto
            </button>
          </div>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
            Prompt para IA
            <textarea
              value={form.aiPrompt}
              onChange={(event) => setField('aiPrompt', event.target.value)}
              rows={3}
              placeholder="Diga exatamente como a IA deve criar a materia: tom, publico, tamanho, topicos obrigatorios, passo a passo, exemplos, restricoes..."
              className="rounded-lg border border-cyan/20 bg-cyan/5 px-3 py-2 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
          </label>
          <div className="grid gap-3 lg:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
              Resumo
              <textarea
                ref={summaryRef}
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
                ref={contentRef}
                value={form.content}
                onChange={(event) => setField('content', event.target.value)}
                rows={10}
                placeholder="Texto principal completo. Este conteudo aparece somente na pagina completa do post."
                className="min-h-64 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
              />
            </label>
          </div>
          <section className="rounded-lg border border-cyan/15 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">Editor visual da materia</h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Monte a noticia como rascunho profissional: titulos, paragrafos, imagens, videos e widgets posicionados.
                </p>
              </div>
              <button
                type="button"
                onClick={syncTextToBlocks}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-cyan/30 px-3 text-xs font-semibold text-cyan transition hover:bg-cyan/10"
              >
                Converter texto em blocos
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-6">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
                Fonte
                <select
                  value={form.typography.fontFamily ?? 'system'}
                  onChange={(event) => setTypography('fontFamily', event.target.value as NonNullable<PostTypography['fontFamily']>)}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="system">Sistema</option>
                  <option value="serif">Serifada</option>
                  <option value="mono">Mono</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
                H1
                <select
                  value={form.typography.h1Size ?? 'md'}
                  onChange={(event) => setTypography('h1Size', event.target.value as NonNullable<PostTypography['h1Size']>)}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="sm">Menor</option>
                  <option value="md">Padrao</option>
                  <option value="lg">Grande</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
                H2
                <select
                  value={form.typography.h2Size ?? 'md'}
                  onChange={(event) => setTypography('h2Size', event.target.value as NonNullable<PostTypography['h2Size']>)}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="sm">Menor</option>
                  <option value="md">Padrao</option>
                  <option value="lg">Grande</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
                Texto
                <select
                  value={form.typography.bodySize ?? 'md'}
                  onChange={(event) => setTypography('bodySize', event.target.value as NonNullable<PostTypography['bodySize']>)}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="sm">Compacto</option>
                  <option value="md">Padrao</option>
                  <option value="lg">Amplo</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
                Linha
                <select
                  value={form.typography.lineHeight ?? 'relaxed'}
                  onChange={(event) => setTypography('lineHeight', event.target.value as NonNullable<PostTypography['lineHeight']>)}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="normal">Normal</option>
                  <option value="relaxed">Conforto</option>
                  <option value="loose">Espacado</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-slate-200">
                Alinhamento
                <select
                  value={form.typography.textAlign ?? 'left'}
                  onChange={(event) => setTypography('textAlign', event.target.value as NonNullable<PostTypography['textAlign']>)}
                  className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                >
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="justify">Justificado</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(['h1', 'h2', 'h3', 'paragraph', 'quote', 'image', 'video'] as ContentBlock['type'][]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBlock(type)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan/50 hover:text-white"
                >
                  + {type}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              {form.blocks.map((block, index) => (
                <div key={block.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="grid gap-2 md:grid-cols-[130px_1fr_130px_auto]">
                    <select
                      value={block.type}
                      onChange={(event) => updateBlock(block.id, { type: event.target.value as ContentBlock['type'] })}
                      className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                    >
                      <option value="h1">H1</option>
                      <option value="h2">H2</option>
                      <option value="h3">H3</option>
                      <option value="paragraph">Paragrafo</option>
                      <option value="quote">Citacao</option>
                      <option value="image">Imagem</option>
                      <option value="video">Video</option>
                    </select>
                    <input
                      value={block.content}
                      onChange={(event) => updateBlock(block.id, { content: event.target.value })}
                      placeholder="Texto, titulo ou descricao do bloco"
                      className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                    />
                    <select
                      value={block.position ?? 'full'}
                      onChange={(event) => updateBlock(block.id, { position: event.target.value as ContentBlock['position'] })}
                      className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2"
                    >
                      <option value="full">Largura total</option>
                      <option value="left">Esquerda</option>
                      <option value="right">Direita</option>
                      <option value="center">Centro</option>
                    </select>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveBlock(index, -1)} className="editor-button px-2" title="Subir bloco">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => moveBlock(index, 1)} className="editor-button px-2" title="Descer bloco">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => removeBlock(block.id)} className="editor-button border-red-400/30 px-2 text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {block.type === 'image' || block.type === 'video' ? (
                    <div className="mt-2 grid gap-2 md:grid-cols-3">
                      <input
                        value={block.url ?? ''}
                        onChange={(event) => updateBlock(block.id, { url: event.target.value })}
                        placeholder={block.type === 'image' ? 'URL da imagem' : 'URL do video, YouTube ou mp4'}
                        className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                      />
                      <input
                        value={block.caption ?? ''}
                        onChange={(event) => updateBlock(block.id, { caption: event.target.value })}
                        placeholder="Legenda opcional"
                        className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
                      />
                      <input
                        type="file"
                        accept={block.type === 'image' ? 'image/*' : 'video/*'}
                        onChange={(event) => readBlockFileAsDataUrl(event, block.id)}
                        className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">Widgets da pagina</h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">Adicione notas, links, imagens ou videos nas laterais, meio, final ou rodape do post.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['left', 'right', 'middle', 'afterArticle', 'footer'] as PageWidget['area'][]).map((area) => (
                  <button key={area} type="button" onClick={() => addWidget(area)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan/50">
                    + {area}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {form.widgets.map((widget) => (
                <div key={widget.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="grid gap-2 md:grid-cols-[120px_150px_1fr_auto]">
                    <select value={widget.area} onChange={(event) => updateWidget(widget.id, { area: event.target.value as PageWidget['area'] })} className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2">
                      <option value="left">Lateral esquerda</option>
                      <option value="right">Lateral direita</option>
                      <option value="middle">Meio do texto</option>
                      <option value="afterArticle">Final do artigo</option>
                      <option value="footer">Rodape</option>
                    </select>
                    <select value={widget.type} onChange={(event) => updateWidget(widget.id, { type: event.target.value as PageWidget['type'] })} className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 focus:ring-2">
                      <option value="note">Nota</option>
                      <option value="link">Link</option>
                      <option value="image">Imagem</option>
                      <option value="video">Video</option>
                    </select>
                    <input value={widget.title} onChange={(event) => updateWidget(widget.id, { title: event.target.value })} placeholder="Titulo do widget" className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2" />
                    <button type="button" onClick={() => removeWidget(widget.id)} className="editor-button border-red-400/30 text-red-300">
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </button>
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <textarea value={widget.content} onChange={(event) => updateWidget(widget.id, { content: event.target.value })} rows={2} placeholder="Conteudo do widget" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2" />
                    <input value={widget.url ?? ''} onChange={(event) => updateWidget(widget.id, { url: event.target.value })} placeholder="URL opcional para link, imagem ou video" className="min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-3 md:grid-cols-2">
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
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">
                      {(post.contentType ?? 'post') === 'page' ? 'Pagina' : 'Post'}
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
                    <button type="button" onClick={() => fetchImageFromSource(post.slug)} className="editor-button">
                      <Link2 className="h-4 w-4" />
                      Imagem da fonte
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
