export * from "./config";
export * from "./get-translation";
export * from "./use-translation";
// NOTE: server-locale is intentionally NOT re-exported here. It imports
// `next/headers` and is server-only. Import it directly from
// `@/lib/i18n/server-locale` so it never leaks into client bundles.
