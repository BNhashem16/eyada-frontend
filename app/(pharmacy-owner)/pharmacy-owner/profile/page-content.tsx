"use client";

import dynamic from "next/dynamic";
import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const PharmacyOwnerProfileForm = dynamic(
  () =>
    import("@/features/pharmacy-owner/components/pharmacy-owner-profile-form").then(
      (mod) => ({
        default: mod.PharmacyOwnerProfileForm,
      }),
    ),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

export function PharmacyOwnerProfileContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("pharmacyOwner.profileTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("pharmacyOwner.profileSubtitle")}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <PharmacyOwnerProfileForm />
    </div>
  );
}
