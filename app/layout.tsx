import type { Metadata, Viewport } from 'next';
import { Cairo, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { getTranslation } from '@/lib/i18n';

// Arabic font (Primary) - Cairo from Google Fonts
const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

// English font - Inter from Google Fonts
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: getTranslation('meta.defaultTitle'),
    template: getTranslation('meta.titleTemplate'),
  },
  description: getTranslation('meta.defaultDescription'),
  keywords: getTranslation('meta.keywords').split(', '),
  authors: [{ name: 'Eyada Team' }],
  creator: 'Eyada',
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    siteName: getTranslation('meta.siteName'),
    title: getTranslation('meta.ogTitle'),
    description: getTranslation('meta.ogDescription'),
  },
  twitter: {
    card: 'summary_large_image',
    title: getTranslation('meta.twitterTitle'),
    description: getTranslation('meta.twitterDescription'),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${cairo.variable} ${inter.variable} min-h-screen bg-background antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
