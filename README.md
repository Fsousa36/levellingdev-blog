# LevellingDev Blog

Blog tecnologico em Next.js App Router com Tailwind CSS, preparado para Docker/Dokploy e validacao inicial do Google AdSense.

## AdSense

O arquivo `ads.txt` deve ficar em `public/ads.txt` no Next.js. Tudo dentro de `public` e servido na raiz do dominio, entao em producao ele ficara acessivel em:

```txt
https://levellingdev.com.br/ads.txt
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
