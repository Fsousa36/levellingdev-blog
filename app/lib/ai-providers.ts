import type { BlogPost } from './types';
import { generateEditorialImage, rewritePostForPtBr } from './editor-tools';

export type TextProvider = 'local' | 'openai' | 'gemini' | 'deepseek';
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

async function callOpenAIText(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;

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
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-5-mini',
      input: prompt
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return data.output_text as string;
}

async function callGeminiText(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nao configurada.');
  }

  const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
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

async function callDeepSeekText(prompt: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

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
      model: process.env.DEEPSEEK_TEXT_MODEL || 'deepseek-chat',
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

export async function rewriteWithProvider(post: BlogPost, provider: TextProvider) {
  if (provider === 'local') {
    return rewritePostForPtBr(post);
  }

  const prompt = buildRewritePrompt(post);
  const raw =
    provider === 'openai'
      ? await callOpenAIText(prompt)
      : provider === 'gemini'
        ? await callGeminiText(prompt)
        : await callDeepSeekText(prompt);
  const parsed = extractJson(raw);

  return {
    ...post,
    title: parsed.title ?? post.title,
    description: parsed.description ?? post.description,
    category: parsed.category ?? post.category,
    keywords: parsed.keywords ?? post.keywords,
    sections: parsed.sections ?? post.sections,
    checklist: parsed.checklist ?? post.checklist,
    imageAlt: `Imagem editorial para ${parsed.title ?? post.title}`
  } satisfies BlogPost;
}

export async function generateImageWithProvider(post: BlogPost, provider: ImageProvider) {
  const fallback = generateEditorialImage(post);

  if (provider === 'pollinations') {
    return fallback;
  }

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;

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
        model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
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

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nao configurada.');
  }

  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
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
  const inline = data.candidates?.[0]?.content?.parts?.find((part: { inlineData?: { data?: string } }) => part.inlineData?.data);

  return {
    prompt: fallback.prompt,
    image: inline?.inlineData?.data ? `data:image/png;base64,${inline.inlineData.data}` : fallback.image,
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
