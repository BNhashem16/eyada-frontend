"use client";

import dynamic from "next/dynamic";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const DriverDeliveriesList = dynamic(
  () =>
    import("@/features/driver/components/driver-deliveries-list").then(
      (mod) => ({
        default: mod.DriverDeliveriesList,
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

export function DriverDeliveriesContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("driver.deliveriesTitle")}
            </h1>
            <p className="text-muted-foreground">
              {t("driver.deliveriesSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <DriverDeliveriesList />
    </div>
  );
}
