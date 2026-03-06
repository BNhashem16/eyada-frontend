"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const PrescriptionRequestDetail = dynamic(
  () =>
    import("@/features/patients/components/prescription-request-detail").then(
      (mod) => ({ default: mod.PrescriptionRequestDetail }),
    ),
  { loading: () => <Skeleton className="h-96 w-full" /> },
);

export function PrescriptionDetailPageContent() {
  const { t } = useTranslation();
  const params = useParams();
  const requestId = params.id as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("prescription.requestDetails")}
        </h1>
      </div>
      <PrescriptionRequestDetail requestId={requestId} />
    </div>
  );
}
