import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '../../../lib/auth';
import { hasDatabase } from '../../../lib/db';
import { runEditorialAgent } from '../../../lib/editor-agent';
import type { TextProvider } from '../../../lib/ai-providers';

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  if (!hasDatabase()) {
    return NextResponse.json({ error: 'DATABASE_URL nao configurada.' }, { status: 400 });
  }

  const body = (await request.json()) as {
    provider?: TextProvider;
    model?: string;
    limit?: number;
    generateImage?: boolean;
  };

  try {
    const result = await runEditorialAgent({
      provider: body.provider ?? 'local',
      model: body.model?.trim() || undefined,
      limit: Math.min(Math.max(Number(body.limit ?? 12), 1), 20),
      generateImage: Boolean(body.generateImage)
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao rodar agente editorial.' },
      { status: 500 }
    );
  }
}
