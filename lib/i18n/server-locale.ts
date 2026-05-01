import { headers, cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

const LOCALE_COOKIE = "eyada-locale";
const LOCALE_HEADER = "x-locale";

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

function parseAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  // Tokens look like: "ar-EG,ar;q=0.9,en;q=0.8"
  const tokens = header
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";");
      const q = qPart ? Number(qPart.replace(/^q=/i, "")) : 1;
      return { tag: tag.toLowerCase(), q };
    })
    .filter((t) => Number.isFinite(t.q))
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tokens) {
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }

  return null;
}

/**
 * Resolve the active locale on the server side. Resolution order:
 *   1. The `x-locale` request header (set by middleware from cookie / negotiation).
 *   2. The `eyada-locale` cookie (set by the client locale switcher).
 *   3. The `Accept-Language` header from the browser.
 *   4. The configured default locale.
 *
 * Use this from server components, `generateMetadata`, and route handlers
 * that need a known locale before the `[locale]` segment migration completes.
 */
export async function getServerLocale(): Promise<Locale> {
  const headerStore = await headers();
  const fromHeader = headerStore.get(LOCALE_HEADER);
  if (isLocale(fromHeader)) return fromHeader;

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const fromAcceptLanguage = parseAcceptLanguage(
    headerStore.get("accept-language"),
  );
  if (fromAcceptLanguage) return fromAcceptLanguage;

  return defaultLocale;
}

/**
 * Validate a locale value coming from a route segment param. Returns the
 * value when it matches a configured locale, otherwise `null`. Use with
 * `notFound()` in `app/[locale]/layout.tsx` once the segment exists.
 */
export function validateLocaleParam(value: string | undefined): Locale | null {
  return isLocale(value) ? value : null;
}
