"use client";

import dynamic from "next/dynamic";
import { ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const PharmacyOrdersList = dynamic(
  () =>
    import("@/features/pharmacy-owner/components/pharmacy-orders-list").then(
      (mod) => ({
        default: mod.PharmacyOrdersList,
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

export function PharmacyOrdersContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("pharmacyOwner.myOrders")}
            </h1>
            <p className="text-muted-foreground">
              {t("pharmacyOwner.dashboardSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <PharmacyOrdersList />
    </div>
  );
}
