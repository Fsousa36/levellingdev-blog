const siteUrl = 'https://levellingdev.com.br';

const routes = [
  '',
  '/blog/low-code-com-ia-para-desenvolvedores',
  '/blog/arquitetura-de-agentes-ia',
  '/blog/docker-nextjs-vps-dokploy',
  '/politica-de-privacidade',
  '/termos-de-uso',
  '/contato'
];

export function GET() {
  const lastModified = '2026-06-07T00:00:00.000Z';
  const urls = routes
    .map((route) => {
      const priority = route === '' ? '1.0' : '0.8';

      return `<url><loc>${siteUrl}${route}</loc><lastmod>${lastModified}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
    })
    .join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
