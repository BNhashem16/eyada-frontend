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
];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Propagate a correlation ID for distributed tracing across frontend + backend.
  // The backend echoes this back via its own middleware so logs can be correlated.
  const incomingId = request.headers.get("x-correlation-id");
  const correlationId = incomingId ?? crypto.randomUUID();
  response.headers.set("x-correlation-id", correlationId);

  // Authenticated / sensitive routes: stricter caching + framing policy
  const isSensitive = SENSITIVE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isSensitive) {
    // Prevent any framing of authenticated dashboards
    response.headers.set("X-Frame-Options", "DENY");
    // Ensure browsers never cache private dashboard responses
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
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
