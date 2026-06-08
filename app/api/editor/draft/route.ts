import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '../../../lib/auth';
import { generateDraftWithProvider, type TextProvider } from '../../../lib/ai-providers';

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  const { title, instruction, sourceUrl, provider = 'local', model } = (await request.json()) as {
    title?: string;
    instruction?: string;
    sourceUrl?: string;
    provider?: TextProvider;
    model?: string;
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Informe um titulo ou tema para criar o editorial.' }, { status: 400 });
  }

  try {
    const draft = await generateDraftWithProvider({
      title: title.trim(),
      instruction: instruction?.trim() || undefined,
      sourceUrl: sourceUrl?.trim() || undefined,
      provider,
      modelOverride: model?.trim() || undefined
    });

    return NextResponse.json({ ok: true, draft });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'A IA falhou ao criar o editorial.'
      },
      { status: 502 }
    );
  }
}
