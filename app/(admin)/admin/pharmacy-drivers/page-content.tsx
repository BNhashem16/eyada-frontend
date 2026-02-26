"use client";

import dynamic from "next/dynamic";
import { Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const AdminDriversList = dynamic(
  () =>
    import("@/features/admin/components/admin-drivers-list").then((mod) => ({
      default: mod.AdminDriversList,
    })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

export function PharmacyDriversContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Truck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("admin.drivers.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.drivers.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <AdminDriversList />
    </div>
  );
}
