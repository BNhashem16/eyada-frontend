"use client";

import dynamic from "next/dynamic";
import { ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

const PatientCheckout = dynamic(
  () =>
    import("@/features/patient-pharmacy/components/patient-checkout").then(
      (mod) => ({
        default: mod.PatientCheckout,
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

export function CheckoutPageContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("pharmacyOwner.checkoutTitle")}
            </h1>
            <p className="text-muted-foreground">
              {t("pharmacyOwner.checkoutSubtitle")}
            </p>
          </div>
        </div>
      </div>
      <PatientCheckout />
    </div>
  );
}
