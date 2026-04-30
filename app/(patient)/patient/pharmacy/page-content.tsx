"use client";

import dynamic from "next/dynamic";
import { Pill } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const PatientPharmacyBrowser = dynamic(
  () =>
    import("@/features/patient-pharmacy/components/patient-pharmacy-browser").then(
      (mod) => ({
        default: mod.PatientPharmacyBrowser,
      }),
    ),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    ),
  },
);

export function PharmacyPageContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Pill className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("pharmacyOwner.pharmacyBrowse")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("pharmacyOwner.browseProducts")}
            </p>
          </div>
        </div>
      </div>
      <PatientPharmacyBrowser />
    </div>
  );
}
