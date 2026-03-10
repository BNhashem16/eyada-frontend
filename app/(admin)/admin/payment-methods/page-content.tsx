"use client";

import { CreditCard } from "lucide-react";
import {
  PaymentMethodsManagement,
  PaymentMethodsStatsCards,
} from "@/features/admin";
import { useTranslation } from "@/lib/i18n";

export function AdminPaymentMethodsContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("prepayment.manageTitle")}
            </h1>
            <p className="text-muted-foreground">
              {t("prepayment.manageSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <PaymentMethodsStatsCards />

      {/* Payment Methods Management */}
      <PaymentMethodsManagement />
    </div>
  );
}
