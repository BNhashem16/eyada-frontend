"use client";

import dynamic from "next/dynamic";
import { Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const PharmacyCampaignsList = dynamic(
  () =>
    import("@/features/pharmacy-owner/components/pharmacy-campaigns-list").then(
      (mod) => ({
        default: mod.PharmacyCampaignsList,
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
          <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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

      <PharmacyCampaignsList />
    </div>
  );
}
