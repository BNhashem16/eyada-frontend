"use client";

import { User } from "lucide-react";
import { PatientProfileForm } from "@/features/patients";
import { useTranslation } from "@/lib/i18n";

export function PatientProfileContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("patient.profilePage.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("patient.profilePage.subtitle")}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="w-full max-w-2xl">
        <PatientProfileForm />
      </div>
    </div>
  );
}
