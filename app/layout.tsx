import type { Metadata } from 'next';
import Script from 'next/script';
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

const siteUrl = 'https://levellingdev.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'LevellingDev | Low-Code, IA e Engenharia de Software',
    template: '%s | LevellingDev'
  },
  description:
    'Blog tecnológico sobre desenvolvimento, inteligência artificial, automação, low-code, carreira dev e arquitetura moderna de software.',
  applicationName: 'LevellingDev',
  authors: [{ name: 'LevellingDev' }],
  creator: 'LevellingDev',
  publisher: 'LevellingDev',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'LevellingDev',
    title: 'LevellingDev | Low-Code, IA e Engenharia de Software',
    description:
      'Tutoriais, análises e guias práticos para evoluir como desenvolvedor na era da inteligência artificial.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LevellingDev | Low-Code, IA e Engenharia de Software',
    description:
      'Tutoriais, análises e guias práticos para evoluir como desenvolvedor na era da inteligência artificial.'
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3403699259545593"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.variable} ${jetBrainsMono.variable} min-h-screen font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
