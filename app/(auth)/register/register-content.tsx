"use client";

import { Suspense } from "react";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/features/auth/components";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/lib/i18n";

export function RegisterPageContent() {
  const { t } = useTranslation();

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 ring-1 ring-primary-200/70 dark:bg-primary-900/40 dark:text-primary-300 dark:ring-primary-800/60">
          <UserPlus className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("auth.registerTitle")}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground sm:text-base">
          {t("auth.registerSubtitle")}
        </p>
      </div>

      {/* Form - Wrapped in Suspense for useSearchParams */}
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </>
  );
}
