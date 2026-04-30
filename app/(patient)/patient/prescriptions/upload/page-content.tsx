"use client";

import dynamic from "next/dynamic";
import { Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const UploadPrescriptionForm = dynamic(
  () =>
    import("@/features/patient-pharmacy/components/upload-prescription-form").then(
      (mod) => ({ default: mod.UploadPrescriptionForm }),
    ),
  { loading: () => <Skeleton className="h-96 w-full" /> },
);

export function UploadPrescriptionPageContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("prescription.uploadTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("prescription.uploadDescription")}
          </p>
        </div>
      </div>
      <UploadPrescriptionForm />
    </div>
  );
}
