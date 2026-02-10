"use client";

import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/lib/i18n";

export function RegisterPageContent() {
  const { t } = useTranslation();

  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-xl sm:text-2xl font-bold text-foreground">
          {t("auth.registerTitle")}
        </h1>
        <p className="text-muted-foreground">{t("auth.registerSubtitle")}</p>
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
