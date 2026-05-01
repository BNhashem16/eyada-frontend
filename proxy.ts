import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that should never be indexed or framed by external sites
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

function resolveLocale(request: NextRequest): string {
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieValue && (SUPPORTED_LOCALES as readonly string[]).includes(cookieValue)) {
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

function buildCsp(nonce: string): string {
  // 'strict-dynamic' allows scripts loaded by nonce-trusted scripts (e.g. Next's
  // framework chunks) to load further scripts without listing every host.
  // In dev/Turbopack we also need 'unsafe-eval' for HMR.
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    !isProd && "'unsafe-eval'",
  ]
    .filter(Boolean)
    .join(" ");

  const connectExtra = [apiOrigin, storageOrigin].filter(Boolean).join(" ");

  const directives: Array<[string, string]> = [
    ["default-src", "'self'"],
    ["script-src", scriptSrc],
    ["style-src", "'self' 'unsafe-inline' https://fonts.googleapis.com"],
    ["font-src", "'self' https://fonts.gstatic.com"],
    [
      "img-src",
      "'self' data: blob: https://cdn.clinics-eg.com https://*.amazonaws.com https://*.r2.dev https://*.cloudflarestorage.com https://*.digitaloceanspaces.com https://*.supabase.co",
    ],
    ["connect-src", `'self' ${connectExtra}`.trim()],
    ["frame-ancestors", "'none'"],
    ["base-uri", "'self'"],
    ["object-src", "'none'"],
    ["form-action", "'self'"],
    ["worker-src", "'self' blob:"],
    ["manifest-src", "'self'"],
    ["upgrade-insecure-requests", ""],
  ];

  return directives
    .map(([name, value]) => (value ? `${name} ${value}` : name))
    .join("; ");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Per-request CSP nonce. Forwarded as a request header so server components
  // can read it via `headers()` and apply it to inline <script> tags.
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Resolve the active locale from cookie / Accept-Language and forward it
  // so server components and metadata factories can read it via getServerLocale().
  // No URL rewrite yet — that lands with the [locale] segment migration.
  const locale = resolveLocale(request);
  requestHeaders.set("x-locale", locale);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("x-locale", locale);
  response.headers.append("Vary", "Accept-Language, Cookie");

  // Propagate a correlation ID for distributed tracing across frontend + backend.
  const incomingId = request.headers.get("x-correlation-id");
  const correlationId = incomingId ?? crypto.randomUUID();
  response.headers.set("x-correlation-id", correlationId);

  // Mirror the nonce on the response so debugging tools / proxies can see it.
  response.headers.set("x-nonce", nonce);

  // Ship CSP in report-only mode first. Promote to "Content-Security-Policy"
  // after a soak window confirms no legitimate violations.
  response.headers.set("Content-Security-Policy-Report-Only", buildCsp(nonce));

  // Authenticated / sensitive routes: stricter caching, framing, and indexing.
  const isSensitive = SENSITIVE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isSensitive) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    // Belt-and-suspenders alongside robots.txt and per-layout metadata.robots.
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
