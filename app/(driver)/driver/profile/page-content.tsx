"use client";

import dynamic from "next/dynamic";
import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const DriverProfileForm = dynamic(
  () =>
    import("@/features/driver/components/driver-profile").then((mod) => ({
      default: mod.DriverProfileForm,
    })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

export function DriverProfileContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("driver.profileTitle")}
          </h1>
          <p className="text-muted-foreground">{t("driver.profileSubtitle")}</p>
        </div>
      </div>

      <DriverProfileForm />
    </div>
  );
}
