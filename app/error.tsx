"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    void import("@sentry/nextjs")
      .then((Sentry) => {
        if (cancelled) return;
        Sentry.captureException(error, {
          tags: { surface: "global-error-boundary", digest: error.digest },
        });
      })
      .catch(() => {
        if (process.env.NODE_ENV !== "production") {
          console.error(error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
            <RefreshCw className="h-4 w-4 ms-2" />
            {t("errors.tryAgain")}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 ms-2" />
              {t("errors.goHome")}
            </Link>
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-muted rounded-lg text-start">
            <p className="text-xs font-mono text-error-600 dark:text-error-400 break-all">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
