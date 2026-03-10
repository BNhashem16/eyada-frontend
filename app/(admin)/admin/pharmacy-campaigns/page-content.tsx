"use client";

import dynamic from "next/dynamic";
import { Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const AdminCampaignsManagement = dynamic(
  () =>
    import("@/features/admin/components/admin-campaigns-management").then(
      (mod) => ({
        default: mod.AdminCampaignsManagement,
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

export function PharmacyCampaignsContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("pharmacyOwner.campaignsTitle")}
            </h1>
            <p className="text-muted-foreground">
              {t("pharmacyOwner.campaignsSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <AdminCampaignsManagement />
    </div>
  );
}
