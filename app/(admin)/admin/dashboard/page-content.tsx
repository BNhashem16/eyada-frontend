"use client";

import dynamic from "next/dynamic";
import { LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const AdminDashboardStats = dynamic(
  () =>
    import("@/features/admin/components/admin-dashboard-stats").then((mod) => ({
      default: mod.AdminDashboardStats,
    })),
  {
    loading: () => (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    ),
  },
);

const PendingDoctorsList = dynamic(
  () =>
    import("@/features/admin/components/pending-doctors-list").then((mod) => ({
      default: mod.PendingDoctorsList,
    })),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
  },
);

export function AdminDashboardContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("admin.dashboard")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.dashboardSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <AdminDashboardStats />
      </div>

      {/* Pending Doctors */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t("admin.pendingDoctors")}
        </h2>
        <PendingDoctorsList />
      </div>
    </div>
  );
}
