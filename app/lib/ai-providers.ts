import type { BlogPost } from './types';
import { generateEditorialImage, rewritePostForPtBr } from './editor-tools';
import { getEditorSetting } from './db';

export type TextProvider = 'local' | 'openai' | 'gemini' | 'anthropic' | 'deepseek' | 'qwen' | 'opencode';
export type ImageProvider = 'pollinations' | 'openai' | 'gemini';

function extractJson(value: string) {
  const cleaned = value
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');

  if (first >= 0 && last > first) {
    return JSON.parse(cleaned.slice(first, last + 1));
  }

  return JSON.parse(cleaned);
}

function buildRewritePrompt(post: BlogPost) {
  return `
Voce e editor senior do blog LevellingDev. Reescreva a pauta abaixo em portugues do Brasil, com tom humano, tecnico e original.

Regras obrigatorias:
- Nao copie frases da fonte original.
- Preserve fatos, nomes de produtos e link da fonte.
- Nao invente informacoes.
- Corrija ortografia e clareza.
- Crie um artigo util para devs, com SEO, subtitulos e checklist.
- Responda SOMENTE JSON valido no formato:
{
  "title": "titulo em PT-BR",
  "description": "resumo SEO curto",
  "category": "categoria",
  "keywords": ["palavra 1", "palavra 2"],
  "sections": [{"heading":"subtitulo","body":["paragrafo 1","paragrafo 2"]}],
  "checklist": ["item 1","item 2","item 3"],
  "imagePrompt": "prompt de imagem editorial sem texto na imagem"
}

Titulo: ${post.title}
Resumo atual: ${post.description}
Categoria: ${post.category}
Fonte: ${post.sourceName ?? 'fonte externa'}
URL da fonte: ${post.sourceUrl ?? post.externalLinks[0]?.href ?? 'sem url'}
`.trim();
}

function buildDraftPrompt({
  title,
  sourceUrl
}: {
  title: string;
  sourceUrl?: string;
}) {
  return `
Voce e editor senior do blog LevellingDev. Crie um editorial original em portugues do Brasil com base no titulo ou tema abaixo.

Regras obrigatorias:
- Nao invente noticia especifica, numeros, datas, versoes ou anuncio oficial se nao houver fonte.
- Se houver fonte, preserve o link e use apenas como referencia.
- Escreva para desenvolvedores, criadores de apps, automacao, IA, no-code, VPS, Docker, banco de dados e deploy.
- Crie texto humano, claro, tecnico e util.
- O resumo deve ser curto e servir para card da Home e SEO.
- O texto principal deve ser completo, sem repetir o resumo.
- Responda SOMENTE JSON valido no formato:
{
  "title": "titulo final",
  "description": "resumo curto",
  "category": "categoria",
  "keywords": ["palavra 1", "palavra 2"],
  "sections": [{"heading":"subtitulo","body":["paragrafo 1","paragrafo 2"]}],
  "checklist": ["item 1","item 2","item 3"],
  "imagePrompt": "prompt de imagem editorial sem texto na imagem"
}

Tema/titulo: ${title}
Fonte opcional: ${sourceUrl || 'sem fonte informada'}
`.trim();
}

function localDraft(title: string, sourceUrl?: string): BlogPost {
  const cleanTitle = title.trim();

  return {
    slug: '',
    title: cleanTitle,
    description:
      'Um guia pratico para entender o tema com foco em aplicacao real, decisao tecnica e proximos passos para desenvolvedores.',
    category: 'Programacao',
    date: '',
    readTime: '6 min',
    image: '',
    imageAlt: `Imagem editorial sobre ${cleanTitle}`,
    keywords: ['desenvolvimento de software', 'inteligencia artificial', 'automacao', 'programacao'],
    sections: [
      {
        heading: 'Contexto',
        body: [
          `${cleanTitle} merece ser analisado pelo impacto pratico no trabalho de quem cria, entrega e mantem software.`,
          'Antes de transformar o tema em decisao tecnica, vale separar promessa, custo, complexidade e risco operacional.'
        ]
      },
      {
        heading: 'Como aplicar',
        body: [
          'Comece por um experimento pequeno, com escopo claro, ambiente controlado e criterio de sucesso definido.',
          'Se envolver IA, automacao, infraestrutura ou banco de dados, registre limites, custos e pontos de rollback antes de levar para producao.'
        ]
      }
    ],
    checklist: ['Definir objetivo do teste.', 'Validar custo e seguranca.', 'Documentar resultado antes de publicar.'],
    externalLinks: sourceUrl ? [{ label: 'Fonte de referencia', href: sourceUrl }] : [],
    sourceUrl,
    sourceImageUrl: sourceUrl
  };
}

async function getConfiguredValue(key: string) {
  return process.env[key] || (await getEditorSetting(key)) || '';
}

async function callOpenAIText(prompt: string, modelOverride?: string) {
  const apiKey = await getConfiguredValue('OPENAI_API_KEY');

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY nao configurada.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelOverride || (await getConfiguredValue('OPENAI_TEXT_MODEL')) || 'gpt-5-mini',
      input: prompt
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return (
    data.output_text ??
    data.output
      ?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? [])
      .map((part: { text?: string }) => part.text ?? '')
      .join('') ??
    ''
  );
}

async function callGeminiText(prompt: string, modelOverride?: string) {
  const apiKey = await getConfiguredValue('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nao configurada.');
  }

  const model = modelOverride || (await getConfiguredValue('GEMINI_TEXT_MODEL')) || 'gemini-2.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('') ?? '';
}

async function callDeepSeekText(prompt: string, modelOverride?: string) {
  const apiKey = await getConfiguredValue('DEEPSEEK_API_KEY');

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY nao configurada.');
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelOverride || (await getConfiguredValue('DEEPSEEK_TEXT_MODEL')) || 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Responda somente JSON valido.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callAnthropicText(prompt: string, modelOverride?: string) {
  const apiKey = await getConfiguredValue('ANTHROPIC_API_KEY');

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY nao configurada.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelOverride || (await getConfiguredValue('ANTHROPIC_TEXT_MODEL')) || 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: 'Responda somente JSON valido.',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return data.content?.map((part: { text?: string }) => part.text ?? '').join('') ?? '';
}

async function callOpenAICompatibleText({
  prompt,
  apiKey,
  baseUrl,
  model,
  providerName
}: {
  prompt: string;
  apiKey?: string;
  baseUrl: string;
  model: string;
  providerName: string;
}) {
  if (!apiKey) {
    throw new Error(`${providerName}_API_KEY nao configurada.`);
  }

  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Responda somente JSON valido.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    throw new Error(`${providerName} falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function rewriteWithProvider(post: BlogPost, provider: TextProvider, modelOverride?: string) {
  if (provider === 'local') {
    return rewritePostForPtBr(post);
  }

  const prompt = buildRewritePrompt(post);
  const raw =
    provider === 'openai'
      ? await callOpenAIText(prompt, modelOverride)
      : provider === 'gemini'
        ? await callGeminiText(prompt, modelOverride)
        : provider === 'anthropic'
          ? await callAnthropicText(prompt, modelOverride)
          : provider === 'qwen'
            ? await callOpenAICompatibleText({
                prompt,
                apiKey: (await getConfiguredValue('QWEN_API_KEY')) || (await getConfiguredValue('DASHSCOPE_API_KEY')),
                baseUrl: (await getConfiguredValue('QWEN_BASE_URL')) || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
                model: modelOverride || (await getConfiguredValue('QWEN_TEXT_MODEL')) || 'qwen-plus',
                providerName: 'QWEN'
              })
            : provider === 'opencode'
              ? await callOpenAICompatibleText({
                  prompt,
                  apiKey: await getConfiguredValue('OPENCODE_API_KEY'),
                  baseUrl: (await getConfiguredValue('OPENCODE_BASE_URL')) || 'https://api.opencode.ai/v1',
                  model: modelOverride || (await getConfiguredValue('OPENCODE_TEXT_MODEL')) || 'opencode-chat',
                  providerName: 'OPENCODE'
                })
              : await callDeepSeekText(prompt, modelOverride);
  const parsed = extractJson(raw);
  const cleanDescription = String(parsed.description ?? post.description).replace(/^(Resumo editorial:\s*)+/i, '').trim();

  return {
    ...post,
    title: parsed.title ?? post.title,
    description: cleanDescription,
    category: parsed.category ?? post.category,
    keywords: parsed.keywords ?? post.keywords,
    sections: parsed.sections ?? post.sections,
    checklist: parsed.checklist ?? post.checklist,
    imageAlt: `Imagem editorial para ${parsed.title ?? post.title}`
  } satisfies BlogPost;
}

export async function generateDraftWithProvider({
  title,
  sourceUrl,
  provider,
  modelOverride
}: {
  title: string;
  sourceUrl?: string;
  provider: TextProvider;
  modelOverride?: string;
}) {
  if (provider === 'local') {
    return localDraft(title, sourceUrl);
  }

  const prompt = buildDraftPrompt({ title, sourceUrl });
  const raw =
    provider === 'openai'
      ? await callOpenAIText(prompt, modelOverride)
      : provider === 'gemini'
        ? await callGeminiText(prompt, modelOverride)
        : provider === 'anthropic'
          ? await callAnthropicText(prompt, modelOverride)
          : provider === 'qwen'
            ? await callOpenAICompatibleText({
                prompt,
                apiKey: (await getConfiguredValue('QWEN_API_KEY')) || (await getConfiguredValue('DASHSCOPE_API_KEY')),
                baseUrl: (await getConfiguredValue('QWEN_BASE_URL')) || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
                model: modelOverride || (await getConfiguredValue('QWEN_TEXT_MODEL')) || 'qwen-plus',
                providerName: 'QWEN'
              })
            : provider === 'opencode'
              ? await callOpenAICompatibleText({
                  prompt,
                  apiKey: await getConfiguredValue('OPENCODE_API_KEY'),
                  baseUrl: (await getConfiguredValue('OPENCODE_BASE_URL')) || 'https://api.opencode.ai/v1',
                  model: modelOverride || (await getConfiguredValue('OPENCODE_TEXT_MODEL')) || 'opencode-chat',
                  providerName: 'OPENCODE'
                })
              : await callDeepSeekText(prompt, modelOverride);
  const parsed = extractJson(raw);

  return {
    ...localDraft(title, sourceUrl),
    title: parsed.title ?? title,
    description: String(parsed.description ?? '').replace(/^(Resumo editorial:\s*)+/i, '').trim(),
    category: parsed.category ?? 'Programacao',
    keywords: parsed.keywords ?? ['desenvolvimento de software'],
    sections: parsed.sections ?? [],
    checklist: parsed.checklist ?? [],
    imageAlt: `Imagem editorial para ${parsed.title ?? title}`
  } satisfies BlogPost;
}

export async function generateImageWithProvider(post: BlogPost, provider: ImageProvider, modelOverride?: string) {
  const fallback = generateEditorialImage(post);

  if (provider === 'pollinations') {
    return fallback;
  }

  if (provider === 'openai') {
    const apiKey = await getConfiguredValue('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY nao configurada.');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelOverride || (await getConfiguredValue('OPENAI_IMAGE_MODEL')) || 'gpt-image-1',
        prompt: fallback.prompt,
        size: '1024x1024'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI imagem falhou: ${await response.text()}`);
    }

    const data = await response.json();
    const item = data.data?.[0];
    return {
      prompt: fallback.prompt,
      image: item?.b64_json ? `data:image/png;base64,${item.b64_json}` : item?.url ?? fallback.image,
      imageAlt: fallback.imageAlt
    };
  }

  const apiKey = await getConfiguredValue('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nao configurada.');
  }

  const model = modelOverride || (await getConfiguredValue('GEMINI_IMAGE_MODEL')) || 'gemini-2.5-flash-image';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fallback.prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini imagem falhou: ${await response.text()}`);
  }

  const data = await response.json();
  const inline = data.candidates?.[0]?.content?.parts?.find(
    (part: { inlineData?: { data?: string }; inline_data?: { data?: string } }) => part.inlineData?.data || part.inline_data?.data
  );
  const imageData = inline?.inlineData?.data || inline?.inline_data?.data;

  return {
    prompt: fallback.prompt,
    image: imageData ? `data:image/png;base64,${imageData}` : fallback.image,
    imageAlt: fallback.imageAlt
  };
}

export function buildVideoPrompt(post: BlogPost) {
  return {
    provider: 'runway',
    prompt:
      `Crie um video editorial curto, 8 segundos, sem texto na tela, em estilo tecnologico premium. Tema: ${post.title}. ` +
      `Mostrar desenvolvimento de software, IA, infraestrutura e interfaces modernas. Movimento suave de camera, luz escura, realista.`,
    note:
      'Este prompt esta pronto para Runway, Google Veo, Pika ou outro gerador de video. A chamada direta de video pode ser conectada quando houver chave e creditos da API escolhida.'
  };
}
