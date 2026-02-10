"use client";

import { Grid3X3 } from "lucide-react";
import { SpecialtyList } from "@/features/specialties";
import { useTranslation } from "@/lib/i18n";

export function SpecialtiesPageContent() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Grid3X3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("pages.specialties.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {t("pages.specialties.subtitle")}
        </p>
      </div>

      {/* Specialties Grid */}
      <SpecialtyList />
    </div>
  );
}
