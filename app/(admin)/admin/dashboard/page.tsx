"use client";

import { LayoutDashboard } from "lucide-react";
import { AdminDashboardStats, PendingDoctorsList } from "@/features/admin";
import { useTranslation } from "@/lib/i18n";

export default function AdminDashboardPage() {
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
      <AdminDashboardStats />

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
