/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/blog/low-code-com-ia-para-desenvolvedores',
        destination: '/blog/low-code-com-ia-sem-virar-bagunca',
        permanent: true
      },
      {
        source: '/blog/arquitetura-de-agentes-ia',
        destination: '/blog/agentes-de-ia-no-desenvolvimento',
        permanent: true
      },
      {
        source: '/blog/docker-nextjs-vps-dokploy',
        destination: '/blog/nextjs-docker-vps-dokploy',
        permanent: true
      }
    ];
  }
};

export default nextConfig;
