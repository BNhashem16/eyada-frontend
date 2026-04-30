"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PharmacyErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void | Promise<unknown>;
  className?: string;
}

export function PharmacyErrorState({
  title,
  description,
  onRetry,
  className,
}: PharmacyErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-error-200 bg-error-50/50 px-4 py-8 text-center text-error-700 dark:border-error-900 dark:bg-error-900/20 dark:text-error-200 sm:py-10",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-200">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold">
          {title ?? t("common.somethingWentWrong")}
        </p>
        {description ? (
          <p className="mx-auto max-w-prose text-sm opacity-90">
            {description}
          </p>
        ) : null}
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void onRetry();
          }}
          className="min-h-[44px] sm:min-h-9"
        >
          {t("common.retry")}
        </Button>
      ) : null}
    </div>
  );
}
