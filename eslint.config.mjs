import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const FORBID_API_FROM_COMPONENTS = {
  files: [
    "features/**/components/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
  ],
  ignores: [
    "**/hooks/**",
    "**/*.test.{ts,tsx}",
    "**/__tests__/**",
    // Providers legitimately need `tokenStorage` from `@/lib/api` to wire
    // the React Query cache to logout events.
    "components/providers/**",
  ],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@/lib/api",
            message:
              "Components and pages must not call apiClient directly. Use a TanStack Query hook in features/<area>/hooks/ instead.",
          },
          {
            name: "@/lib/api/client",
            message:
              "Components and pages must not call apiClient directly. Use a TanStack Query hook in features/<area>/hooks/ instead.",
          },
          {
            name: "axios",
            message:
              "Components and pages must not call axios directly. Use a TanStack Query hook in features/<area>/hooks/ instead.",
          },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  FORBID_API_FROM_COMPONENTS,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tests/e2e/**",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
