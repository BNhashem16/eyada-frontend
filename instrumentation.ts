// Next.js instrumentation hook. Loads the runtime-specific Sentry config so
// the SDK is initialized as early as possible in each environment.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Bridge Next.js `onRequestError` instrumentation hook to Sentry's request
// error capture. Required for server-rendered route handler / RSC errors to
// reach Sentry with full request context.
export { captureRequestError as onRequestError } from "@sentry/nextjs";
