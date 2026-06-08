import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '../../../lib/auth';
import { getEditorSettingsStatus, setEditorSettings } from '../../../lib/db';

const allowedKeys = [
  'OPENAI_API_KEY',
  'OPENAI_TEXT_MODEL',
  'OPENAI_IMAGE_MODEL',
  'GEMINI_API_KEY',
  'GEMINI_TEXT_MODEL',
  'GEMINI_IMAGE_MODEL',
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_TEXT_MODEL',
  'DEEPSEEK_API_KEY',
  'DEEPSEEK_TEXT_MODEL',
  'QWEN_API_KEY',
  'QWEN_BASE_URL',
  'QWEN_TEXT_MODEL',
  'OPENCODE_API_KEY',
  'OPENCODE_BASE_URL',
  'OPENCODE_TEXT_MODEL'
];

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  return NextResponse.json({ configured: await getEditorSettingsStatus(allowedKeys) });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, string>;
  const settings = Object.fromEntries(
    Object.entries(body).filter(([key, value]) => allowedKeys.includes(key) && typeof value === 'string' && value.trim())
  );

  await setEditorSettings(settings);
  return NextResponse.json({ ok: true, configured: await getEditorSettingsStatus(allowedKeys) });
}
