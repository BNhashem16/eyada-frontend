"use client";

import { Wallet } from "lucide-react";
import { DoctorBalances } from "@/features/admin";
import { useTranslation } from "@/lib/i18n";

export default function AdminCollectionsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-warning-600 dark:text-warning-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("admin.collectionsPage.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.collectionsPage.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Doctor Balances */}
      <DoctorBalances />
    </div>
  );
}
