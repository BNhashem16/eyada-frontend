"use client";

import dynamic from "next/dynamic";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const PharmacyPrescriptionOrders = dynamic(
  () =>
    import("@/features/pharmacy-owner/components/pharmacy-prescription-orders").then(
      (mod) => ({ default: mod.PharmacyPrescriptionOrders }),
    ),
  { loading: () => <Skeleton className="h-64 w-full" /> },
);

export function PrescriptionOrdersPageContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {t("prescription.pharmacyOrders")}
        </h1>
      </div>
      <PharmacyPrescriptionOrders />
    </div>
  );
}
