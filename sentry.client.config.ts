// Sentry SDK initialization for the browser. Loaded by Next.js automatically
// at the top of every page. Gracefully no-ops when SENTRY_DSN is unset (e.g.
// during local dev), so it's safe to leave wired in every environment.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Performance: 10% of transactions traced. Tune based on volume + plan.
    tracesSampleRate: 0.1,

    // Replay: very low sampling for routine sessions, full capture on errors.
    // Replay defaults mask all text + inputs to keep PHI out of recordings.
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],

    // Drop noise from network errors that are user-environment problems.
    ignoreErrors: [
      "Network request failed",
      "Failed to fetch",
      "NetworkError when attempting to fetch resource",
      "Load failed",
    ],
  });
}
