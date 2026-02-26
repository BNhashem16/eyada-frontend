"use client";

import dynamic from "next/dynamic";
import { Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const EditPharmacyForm = dynamic(
  () =>
    import("@/features/pharmacy-owner/components/edit-pharmacy-form").then(
      (mod) => ({
        default: mod.EditPharmacyForm,
      }),
    ),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

interface EditPharmacyContentProps {
  pharmacyId: string;
}

export function EditPharmacyContent({ pharmacyId }: EditPharmacyContentProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Store className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("pharmacyOwner.editPharmacyTitle")}
            </h1>
            <p className="text-muted-foreground">
              {t("pharmacyOwner.editPharmacySubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <EditPharmacyForm pharmacyId={pharmacyId} />
    </div>
  );
}
