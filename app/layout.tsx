import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getTranslation } from "@/lib/i18n";

// Arabic font (Primary) - Cairo from Google Fonts
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// English font - Inter from Google Fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clinics-eg.com"),
  title: {
    default: getTranslation("meta.defaultTitle"),
    template: getTranslation("meta.titleTemplate"),
  },
  description: getTranslation("meta.defaultDescription"),
  keywords: getTranslation("meta.keywords").split(", "),
  authors: [{ name: "Eyada Team", url: "https://clinics-eg.com" }],
  creator: "Eyada",
  publisher: "Eyada",
  applicationName: getTranslation("meta.siteName"),
  category: "health",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: "https://clinics-eg.com",
    languages: {
      "ar-EG": "https://clinics-eg.com",
      "en-US": "https://clinics-eg.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
    siteName: getTranslation("meta.siteName"),
    title: getTranslation("meta.ogTitle"),
    description: getTranslation("meta.ogDescription"),
    url: "https://clinics-eg.com",
  },
  twitter: {
    card: "summary_large_image",
    title: getTranslation("meta.twitterTitle"),
    description: getTranslation("meta.twitterDescription"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": getTranslation("app.name"),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

// Root layout is a static server component. It must NOT call headers() or
// any other dynamic API: doing so cascades dynamic rendering into every
// descendant route and kills static prerender for the public/SEO pages.
//
// - Theme bootstrap is loaded as an external script (/theme-init.js) so it
//   doesn't need a CSP nonce.
// - Per-page JSON-LD lives in the leaf pages where it belongs; the global
//   WebsiteJsonLd is rendered from app/page.tsx (homepage) only.
// - Sensitive routes (auth + role dashboards) get their nonce CSP via
//   proxy.ts. Next.js framework scripts pick up the nonce from the
//   x-nonce request header set by proxy on those routes.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script src="/theme-init.js" />
      </head>
      <body
        className={`${cairo.variable} ${inter.variable} min-h-screen bg-background antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
