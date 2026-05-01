// Sentry SDK initialization for the Node server runtime (RSC, route handlers,
// generateMetadata, sitemap, etc.). Gracefully no-ops without SENTRY_DSN.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: 0.1,
  });
}
