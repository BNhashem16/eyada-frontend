"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

interface RoleErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Where the "Back to dashboard" CTA should point. */
  dashboardPath: string;
}

/**
 * Role-aware error boundary UI. Used by the per-role `error.tsx` files in
 * each route group so an authenticated user landing on a render error keeps
 * their role context (and a working CTA back to their own dashboard) instead
 * of being shoved to the public homepage.
 *
 * Hooks into `Sentry.captureException` when `@sentry/nextjs` is configured
 * (no-ops gracefully when SENTRY_DSN is unset).
 */
export function RoleError({ error, reset, dashboardPath }: RoleErrorProps) {
  const { t } = useTranslation();

  useEffect(() => {
    // Best-effort error report. Dynamically imported so the Sentry runtime
    // does not eagerly load on every role layout. Falls back to console.error
    // when the SDK isn't installed or the DSN isn't configured.
    let cancelled = false;
    void import("@sentry/nextjs")
      .then((Sentry) => {
        if (cancelled) return;
        Sentry.captureException(error, {
          tags: { surface: "role-error-boundary", digest: error.digest },
        });
      })
      .catch(() => {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [error]);

  return (
    <div className="min-h-[60dvh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mx-auto h-20 w-20 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10 text-error-600 dark:text-error-400" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          {t("errors.unexpectedError")}
        </h1>
        <p className="text-muted-foreground mb-6">
          {t("errors.unexpectedErrorDesc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="h-4 w-4 me-2" />
            {t("errors.tryAgain")}
          </Button>
          <Button asChild variant="outline">
            <Link href={dashboardPath}>
              <LayoutDashboard className="h-4 w-4 me-2" />
              {t("nav.dashboard")}
            </Link>
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-muted rounded-lg text-start">
            <p className="text-xs font-mono text-error-600 dark:text-error-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs font-mono text-muted-foreground">
                digest: {error.digest}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
