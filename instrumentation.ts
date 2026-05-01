// Next.js instrumentation hook. Loads the runtime-specific Sentry config so
// the SDK is initialized as early as possible in each environment.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Bridge Next.js `onRequestError` instrumentation hook to Sentry's request
// error capture. A direct `export { ... } from` re-export resolves the
// binding name at the target module — the Sentry edge bundle exports
// `captureRequestError`, not `onRequestError`, so we wrap it here.
export const onRequestError: typeof Sentry.captureRequestError = (
  ...args
) => Sentry.captureRequestError(...args);
