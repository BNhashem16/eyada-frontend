import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Pharmacy auto-refresh policy enforcement.
 *
 * Server resources are precious. Every TanStack Query call inside a pharmacy
 * hook must go through the project's `usePharmacyQuery` wrapper (which sets
 * `refetchOnWindowFocus: false`, `refetchOnReconnect: false`,
 * `refetchOnMount: true`, and disables `refetchInterval`) — OR set those
 * flags explicitly itself.
 *
 * Note: `refetchOnMount` is `true` (not `false`) on purpose. Mutation-driven
 * `invalidateQueries(...)` only triggers a refetch for active observers, so
 * with `refetchOnMount: false` a list page returning from a sub-route would
 * paint the pre-mutation snapshot. Within `staleTime` the cache is still
 * hit on mount, so this is not auto-polling — it just lets invalidation
 * actually take effect across navigations.
 *
 * This meta-test walks every hook file in the pharmacy module and fails
 * loudly when a `useQuery({...})` / `useInfiniteQuery({...})` slips through
 * without the wrapper or the explicit flags.
 */

const HOOK_DIRS = [
  "features/pharmacy-owner/hooks",
  "features/patient-pharmacy/hooks",
  // Admin pharmacy hooks are mixed inside features/admin/hooks/.
  "features/admin/hooks",
];

const ADMIN_PHARMACY_FILE_PATTERN = /pharmac|prescription/i;

// Each entry is the literal source-text the meta-test searches for. The
// flags must be set verbatim somewhere in the file (or — preferred — the
// hook should just use `usePharmacyQuery`, which sets them centrally).
const REQUIRED_FLAG_LITERALS: Array<{ flag: string; literal: RegExp }> = [
  {
    flag: "refetchOnWindowFocus: false",
    literal: /refetchOnWindowFocus\s*:\s*false/,
  },
  {
    flag: "refetchOnReconnect: false",
    literal: /refetchOnReconnect\s*:\s*false/,
  },
  // Mount-on-stale stays ON so invalidation works across navigations.
  { flag: "refetchOnMount: true", literal: /refetchOnMount\s*:\s*true/ },
];

interface Violation {
  file: string;
  reason: string;
}

function listHookFiles(repoRoot: string): string[] {
  const files: string[] = [];
  for (const dir of HOOK_DIRS) {
    const abs = path.join(repoRoot, dir);
    let entries: string[];
    try {
      entries = readdirSync(abs);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(abs, entry);
      if (!statSync(full).isFile()) continue;
      if (!entry.endsWith(".ts") && !entry.endsWith(".tsx")) continue;
      if (entry.endsWith(".test.ts")) continue;
      if (dir.includes("features/admin/hooks")) {
        if (!ADMIN_PHARMACY_FILE_PATTERN.test(entry)) continue;
      }
      // patient-pharmacy/hooks is fully scoped to the pharmacy slice — no
      // intra-folder filtering needed.
      files.push(full);
    }
  }
  return files;
}

function findViolations(repoRoot: string): Violation[] {
  const violations: Violation[] = [];
  const files = listHookFiles(repoRoot);

  for (const file of files) {
    const src = readFileSync(file, "utf8");

    const usesWrapper = /usePharmacyQuery\s*[<(]/.test(src);
    if (usesWrapper) continue;

    const usesUseQuery = /\buseQuery\s*\(\s*\{/.test(src);
    const usesUseInfiniteQuery = /\buseInfiniteQuery\s*\(\s*\{/.test(src);

    if (!usesUseQuery && !usesUseInfiniteQuery) continue;

    if (/refetchInterval\s*:\s*[^f]/.test(src)) {
      violations.push({
        file,
        reason: "uses refetchInterval (auto-polling is banned)",
      });
      continue;
    }

    const missing = REQUIRED_FLAG_LITERALS.filter(
      ({ literal }) => !literal.test(src),
    ).map(({ flag }) => flag);
    if (missing.length > 0) {
      violations.push({
        file,
        reason: `missing explicit \`${missing.join(", ")}\` and not using usePharmacyQuery`,
      });
    }
  }

  return violations;
}

describe("pharmacy auto-refresh policy", () => {
  it("every pharmacy hook either uses usePharmacyQuery or sets refetch flags explicitly", () => {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const violations = findViolations(repoRoot);
    if (violations.length > 0) {
      const message = violations
        .map((v) => `  - ${path.relative(repoRoot, v.file)}: ${v.reason}`)
        .join("\n");
      throw new Error(
        `Pharmacy hooks violating the no-auto-refresh policy:\n${message}\n\nFix: import \`usePharmacyQuery\` from "@/features/_shared/hooks/use-pharmacy-query" and replace the bare \`useQuery\` call.`,
      );
    }
    expect(violations).toEqual([]);
  });
});
