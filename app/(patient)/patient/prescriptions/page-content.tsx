"use client";

import dynamic from "next/dynamic";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const PrescriptionRequestsList = dynamic(
  () =>
    import("@/features/patients/components/prescription-requests-list").then(
      (mod) => ({ default: mod.PrescriptionRequestsList }),
    ),
  { loading: () => <Skeleton className="h-64 w-full" /> },
);

export function PrescriptionsPageContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("prescription.myRequests")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("prescription.uploadDescription")}
          </p>
        </div>
      </div>
      <PrescriptionRequestsList />
    </div>
  );
}
