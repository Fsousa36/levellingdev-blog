# LevellingDev Blog

Blog tecnologico em Next.js App Router com Tailwind CSS, preparado para Docker/Dokploy e validacao inicial do Google AdSense.

## AdSense

O arquivo `ads.txt` deve ficar em `public/ads.txt` no Next.js. Tudo dentro de `public` e servido na raiz do dominio, entao em producao ele ficara acessivel em:

```txt
https://levelingdev.com.br/ads.txt
```

Conteudo configurado:

```txt
google.com, pub-3403699259545593, DIRECT, f08c47fec0942fa0
```

## Docker

O `next.config.mjs` usa `output: 'standalone'`, necessario para gerar uma build leve em `.next/standalone`.

Build local:

```bash
docker build -t levellingdev-blog .
docker run --rm -p 3000:3000 levellingdev-blog
```

## Google Analytics

Para ativar GA4, configure a variavel de ambiente no Dokploy:

```txt
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Editor e noticias automaticas

O painel fica em:

```txt
https://levelingdev.com.br/editor
```

Para criar posts dinamicos e sincronizar noticias reais por RSS, configure no Dokploy:

```txt
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_SSL=false
ADMIN_TOKEN=um-token-longo-e-secreto
```

Depois, no Dokploy, crie um agendamento/cron chamando:

```txt
https://levelingdev.com.br/api/news/sync?token=um-token-longo-e-secreto
```

Sugestao: executar a cada 6 ou 12 horas. O sincronizador usa fontes reais como OpenAI News, GitHub Blog/Changelog,
Vercel, web.dev e PostgreSQL News. Ele nao inventa noticias: cada post gerado inclui link para a fonte original.

## Provedores de IA no editor

O editor permite reescrever, corrigir, traduzir, expandir artigos e gerar imagens editoriais. Configure somente os
provedores que quiser usar:

```txt
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=gpt-5-mini
OPENAI_IMAGE_MODEL=gpt-image-1

GEMINI_API_KEY=
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image

DEEPSEEK_API_KEY=
DEEPSEEK_TEXT_MODEL=deepseek-chat

ANTHROPIC_API_KEY=
ANTHROPIC_TEXT_MODEL=claude-sonnet-4-5

QWEN_API_KEY=
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_TEXT_MODEL=qwen-plus

OPENCODE_API_KEY=
OPENCODE_BASE_URL=https://api.opencode.ai/v1
OPENCODE_TEXT_MODEL=opencode-chat

RUNWAY_API_KEY=
```

Sem chave, o editor continua funcionando com reescrita local e imagem por fallback gratuito.
No editor, tambem e possivel informar manualmente um ID de modelo. Isso permite usar qualquer modelo liberado pela sua
conta/plano, sem alterar codigo.

## Estrutura principal

```txt
app/
  blog/[slug]/page.tsx
  contato/page.tsx
  politica-de-privacidade/page.tsx
  robots.txt/route.ts
  sitemap.xml/route.ts
  termos-de-uso/page.tsx
  globals.css
  layout.tsx
  page.tsx
public/
  ads.txt
Dockerfile
next.config.mjs
tailwind.config.ts
```
