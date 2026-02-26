"use client";

import dynamic from "next/dynamic";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const CreateProductForm = dynamic(
  () =>
    import("@/features/pharmacy-owner/components/create-product-form").then(
      (mod) => ({
        default: mod.CreateProductForm,
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

export function CreateProductContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("pharmacyOwner.createProductTitle")}
            </h1>
            <p className="text-muted-foreground">
              {t("pharmacyOwner.createProductSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <CreateProductForm />
    </div>
  );
}
