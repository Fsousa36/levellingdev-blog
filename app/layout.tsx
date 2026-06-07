import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

const siteUrl = 'https://levelingdev.com.br';
const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'LevellingDev | IA, Low-Code, Seguranca e Deploy para Devs',
    template: '%s | LevellingDev'
  },
  description:
    'Blog tecnologico sobre inteligencia artificial aplicada, low-code, seguranca em codigo gerado por IA, Next.js, Docker, VPS e automacao.',
  applicationName: 'LevellingDev',
  authors: [{ name: 'LevellingDev' }],
  creator: 'LevellingDev',
  publisher: 'LevellingDev',
  category: 'technology',
  keywords: [
    'inteligencia artificial',
    'low-code',
    'desenvolvimento de software',
    'Next.js',
    'Docker',
    'Dokploy',
    'seguranca de software',
    'automacao'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'LevellingDev',
    title: 'LevellingDev | IA, Low-Code, Seguranca e Deploy para Devs',
    description: 'Guias originais para devs que querem usar IA, low-code e automacao com criterio tecnico.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Pessoa programando em notebook com codigo na tela'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LevellingDev | IA, Low-Code, Seguranca e Deploy para Devs',
    description: 'Guias originais para devs que querem usar IA, low-code e automacao com criterio tecnico.',
    images: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta name="google-adsense-account" content="ca-pub-3403699259545593" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3403699259545593"
          crossOrigin="anonymous"
        />
        {googleAnalyticsId ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${googleAnalyticsId}');`
              }}
            />
          </>
        ) : null}
      </head>
      <body className={`${inter.variable} ${jetBrainsMono.variable} min-h-screen font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
