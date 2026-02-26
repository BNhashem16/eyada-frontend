"use client";

import dynamic from "next/dynamic";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const PharmacyProductsList = dynamic(
  () =>
    import("@/features/pharmacy-owner/components/pharmacy-products-list").then(
      (mod) => ({
        default: mod.PharmacyProductsList,
      }),
    ),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

export function PharmacyProductsContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("pharmacyOwner.products")}
            </h1>
            <p className="text-muted-foreground">
              {t("pharmacyOwner.dashboardSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Products List */}
      <PharmacyProductsList />
    </div>
  );
}
