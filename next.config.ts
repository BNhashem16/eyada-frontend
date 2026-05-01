import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Applied to all responses via headers() — CSP omitted here as it requires
// nonce-based per-request configuration for Next.js; enforce it at the CDN/
// reverse-proxy layer with a nonce strategy.
const securityHeaders = [
  // Enable DNS prefetch for faster resource loading
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Force HTTPS for 2 years, include sub-domains, allow HSTS preload list
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Block rendering in cross-origin frames (clickjacking protection)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy XSS filter — belt-and-suspenders alongside CSP
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Limit referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser feature APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Apply security headers to every route
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Aggressive caching for Next.js immutable static chunks
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  images: {
    // Explicitly enumerate allowed image origins instead of using ** wildcards
    // which would enable SSRF via the Next.js image optimisation proxy.
    // Add your storage CDN hostname here (e.g. cdn.clinics-eg.com).
    remotePatterns: [
      // Primary CDN / storage endpoint
      {
        protocol: "https",
        hostname: "cdn.clinics-eg.com",
      },
      // AWS S3 (direct bucket URLs and regional variants)
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      // Cloudflare R2 public buckets
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      // Cloudflare Workers / custom R2 domain
      {
        protocol: "https",
        hostname: "*.cloudflarestorage.com",
      },
      // DigitalOcean Spaces
      {
        protocol: "https",
        hostname: "*.digitaloceanspaces.com",
      },
      // Supabase Storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      // Local development backend
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    // Tree-shake / sub-path imports from heavy packages so the pharmacy
    // surfaces don't drag the full bundle into first paint.
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "date-fns/locale",
      "recharts",
      "react-day-picker",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
    ],
  },
};

// Sentry build plugin: source-map upload + Vercel monitor wrap. Activates
// only when SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT are set on the
// build environment. Behaves as a pass-through locally without those vars.
//
// `disableLogger` was removed in favor of webpack.treeshake.removeDebugLogging,
// which is not supported under Turbopack. The Sentry SDK's runtime debug logs
// are minor and accepted for now.
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Tunnel Sentry traffic through this app so adblockers don't break captures.
  // Pair with the connect-src CSP entry in proxy.ts.
  tunnelRoute: "/monitoring",
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
