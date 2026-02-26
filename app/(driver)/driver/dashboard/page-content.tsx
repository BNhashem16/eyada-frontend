"use client";

import dynamic from "next/dynamic";
import { LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const DriverDashboard = dynamic(
  () =>
    import("@/features/driver/components/driver-dashboard").then((mod) => ({
      default: mod.DriverDashboard,
    })),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

export function DriverDashboardContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("driver.dashboardTitle")}
            </h1>
            <p className="text-muted-foreground">{t("driver.dashboardDesc")}</p>
          </div>
        </div>
      </div>

      <DriverDashboard />
    </div>
  );
}
