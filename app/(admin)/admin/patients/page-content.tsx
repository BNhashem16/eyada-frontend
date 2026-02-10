"use client";

import dynamic from "next/dynamic";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const AdminPatientsList = dynamic(
  () =>
    import("@/features/admin/components/admin-patients-list").then(
      (mod) => ({ default: mod.AdminPatientsList }),
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

export function AdminPatientsContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("admin.patients.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.patients.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* All Patients List with Filters */}
      <AdminPatientsList />
    </div>
  );
}
