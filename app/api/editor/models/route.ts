import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '../../../lib/auth';
import { getEditorSetting } from '../../../lib/db';

async function configured(key: string) {
  return process.env[key] || (await getEditorSetting(key)) || '';
}

function normalizeModels(data: any) {
  const models = data.data ?? data.models ?? [];
  return models
    .map((model: any) => model.id ?? model.name ?? model.model)
    .filter((model: unknown): model is string => typeof model === 'string')
    .map((model: string) => model.replace(/^models\//, ''))
    .sort();
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  const provider = request.nextUrl.searchParams.get('provider');
  let response: Response;

  if (provider === 'openai') {
    const apiKey = await configured('OPENAI_API_KEY');

    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY nao configurada.' }, { status: 400 });
    }

    response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
  } else if (provider === 'gemini') {
    const apiKey = await configured('GEMINI_API_KEY');

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY nao configurada.' }, { status: 400 });
    }

    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  } else if (provider === 'anthropic') {
    const apiKey = await configured('ANTHROPIC_API_KEY');

    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY nao configurada.' }, { status: 400 });
    }

    response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    });
  } else if (provider === 'deepseek') {
    const apiKey = await configured('DEEPSEEK_API_KEY');

    if (!apiKey) {
      return NextResponse.json({ error: 'DEEPSEEK_API_KEY nao configurada.' }, { status: 400 });
    }

    response = await fetch('https://api.deepseek.com/models', {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
  } else if (provider === 'qwen') {
    const apiKey = await configured('QWEN_API_KEY');
    const baseUrl = (await configured('QWEN_BASE_URL')) || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

    if (!apiKey) {
      return NextResponse.json({ error: 'QWEN_API_KEY nao configurada.' }, { status: 400 });
    }

    response = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
  } else if (provider === 'opencode') {
    const apiKey = await configured('OPENCODE_API_KEY');
    const baseUrl = (await configured('OPENCODE_BASE_URL')) || 'https://api.opencode.ai/v1';

    if (!apiKey) {
      return NextResponse.json({ error: 'OPENCODE_API_KEY nao configurada.' }, { status: 400 });
    }

    response = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
  } else {
    return NextResponse.json({ models: [] });
  }

  if (!response.ok) {
    return NextResponse.json({ error: `Falha ao buscar modelos: ${await response.text()}` }, { status: 502 });
  }

  return NextResponse.json({ models: normalizeModels(await response.json()) });
}
