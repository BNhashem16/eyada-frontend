"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const AdminSettlementsManagement = dynamic(
  () =>
    import("@/features/admin/components/admin-settlements-management").then(
      (mod) => ({
        default: mod.AdminSettlementsManagement,
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

export function PharmacySettlementsContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ArrowUpRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("admin.settlements.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.settlements.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <AdminSettlementsManagement />
    </div>
  );
}
