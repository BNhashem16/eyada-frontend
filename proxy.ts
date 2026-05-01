import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that should never be indexed or framed by external sites. Also the
// scope of the strict nonce CSP — public/SEO routes use a more lenient CSP
// that permits static prerendering.
const SENSITIVE_PREFIXES = [
  "/admin",
  "/doctor",
  "/patient",
  "/secretary",
  "/driver",
  "/pharmacy-owner",
  "/login",
  "/register",
  "/forgot-password",
];

const isProd = process.env.NODE_ENV === "production";
const apiOrigin = process.env.NEXT_PUBLIC_API_URL || "";
const storageOrigin = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || "";

const SUPPORTED_LOCALES = ["ar", "en"] as const;
const DEFAULT_LOCALE = "ar";
const LOCALE_COOKIE = "eyada-locale";

const IMG_SRC =
  "'self' data: blob: https://cdn.clinics-eg.com https://*.amazonaws.com " +
  "https://*.r2.dev https://*.cloudflarestorage.com " +
  "https://*.digitaloceanspaces.com https://*.supabase.co";

function resolveLocale(request: NextRequest): string {
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value;
  if (
    cookieValue &&
    (SUPPORTED_LOCALES as readonly string[]).includes(cookieValue)
  ) {
    return cookieValue;
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const tokens = acceptLanguage
      .split(",")
      .map((part) => {
        const [tag, qPart] = part.trim().split(";");
        const q = qPart ? Number(qPart.replace(/^q=/i, "")) : 1;
        return { primary: (tag || "").toLowerCase().split("-")[0], q };
      })
      .filter((t) => Number.isFinite(t.q))
      .sort((a, b) => b.q - a.q);

    for (const { primary } of tokens) {
      if ((SUPPORTED_LOCALES as readonly string[]).includes(primary)) {
        return primary;
      }
    }
  }

  return DEFAULT_LOCALE;
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function joinCsp(directives: Array<[string, string]>): string {
  return directives
    .map(([name, value]) => (value ? `${name} ${value}` : name))
    .join("; ");
}

// Strict, nonce-based CSP for sensitive routes (auth + role dashboards).
// Routes governed by this CSP are always dynamically rendered (acceptable
// because they are auth-walled and not in any CDN cache anyway).
function buildSensitiveCsp(nonce: string): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    !isProd && "'unsafe-eval'",
  ]
    .filter(Boolean)
    .join(" ");

  const connectExtra = [
    apiOrigin,
    storageOrigin,
    "https://*.sentry.io",
  ]
    .filter(Boolean)
    .join(" ");

  return joinCsp([
    ["default-src", "'self'"],
    ["script-src", scriptSrc],
    ["style-src", "'self' 'unsafe-inline' https://fonts.googleapis.com"],
    ["font-src", "'self' https://fonts.gstatic.com"],
    ["img-src", IMG_SRC],
    ["connect-src", `'self' ${connectExtra}`.trim()],
    ["frame-ancestors", "'none'"],
    ["base-uri", "'self'"],
    ["object-src", "'none'"],
    ["form-action", "'self'"],
    ["worker-src", "'self' blob:"],
    ["manifest-src", "'self'"],
    ["upgrade-insecure-requests", ""],
  ]);
}

// Lenient CSP for public/SEO routes. Allows inline scripts via 'unsafe-inline'
// so the homepage and other public pages can statically prerender (no need to
// thread a per-request nonce through every page). The trade-off is XSS hygiene
// on routes that do not handle authenticated user input.
function buildPublicCsp(): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    !isProd && "'unsafe-eval'",
  ]
    .filter(Boolean)
    .join(" ");

  const connectExtra = [
    apiOrigin,
    storageOrigin,
    "https://*.sentry.io",
  ]
    .filter(Boolean)
    .join(" ");

  return joinCsp([
    ["default-src", "'self'"],
    ["script-src", scriptSrc],
    ["style-src", "'self' 'unsafe-inline' https://fonts.googleapis.com"],
    ["font-src", "'self' https://fonts.gstatic.com"],
    ["img-src", IMG_SRC],
    ["connect-src", `'self' ${connectExtra}`.trim()],
    ["frame-ancestors", "'self'"],
    ["base-uri", "'self'"],
    ["object-src", "'none'"],
    ["form-action", "'self'"],
    ["worker-src", "'self' blob:"],
    ["manifest-src", "'self'"],
    ["upgrade-insecure-requests", ""],
  ]);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isSensitive = SENSITIVE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // Nonce + locale forwarding via request headers. Locale is read by
  // server components via getServerLocale(); nonce is read by sensitive
  // route layouts that render their own inline scripts (currently none —
  // Next.js applies it automatically to its framework scripts).
  const nonce = generateNonce();
  const locale = resolveLocale(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-locale", locale);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("x-locale", locale);
  response.headers.set("x-nonce", nonce);
  response.headers.append("Vary", "Accept-Language, Cookie");

  // Correlation ID for cross-repo distributed tracing.
  const incomingId = request.headers.get("x-correlation-id");
  const correlationId = incomingId ?? crypto.randomUUID();
  response.headers.set("x-correlation-id", correlationId);

  // Hybrid CSP. Strict nonce CSP on sensitive surfaces; lenient CSP on
  // public/SEO surfaces so they can statically prerender. Both ship in
  // Report-Only mode initially.
  const csp = isSensitive ? buildSensitiveCsp(nonce) : buildPublicCsp();
  response.headers.set("Content-Security-Policy-Report-Only", csp);

  if (isSensitive) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - Next.js internals (_next/static, _next/image)
     * - Static public files (favicon, manifest, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|.*\\.svg$).*)",
  ],
};
