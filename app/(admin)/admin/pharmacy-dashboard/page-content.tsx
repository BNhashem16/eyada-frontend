"use client";

import dynamic from "next/dynamic";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const AdminPharmacyDashboard = dynamic(
  () =>
    import("@/features/admin/components/admin-pharmacy-dashboard").then(
      (mod) => ({
        default: mod.AdminPharmacyDashboard,
      }),
    ),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

export function AdminPharmacyDashboardContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("admin.pharmacyDashboard.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.pharmacyDashboard.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <AdminPharmacyDashboard />
    </div>
  );
}
