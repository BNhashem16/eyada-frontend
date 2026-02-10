"use client";

import { Users } from "lucide-react";
import { FamilyList } from "@/features/patients";
import { useTranslation } from "@/lib/i18n";
import { useUser } from "@/lib/auth/store";

export function PatientFamilyContent() {
  const { t } = useTranslation();
  const user = useUser();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("patient.familyPage.title")}{" "}
            {user?.fullName && `- ${user.fullName}`}
          </h1>
          <p className="text-muted-foreground">
            {t("patient.familyPage.subtitle")}
          </p>
        </div>
      </div>

      {/* Family List */}
      <div className="w-full max-w-2xl">
        <FamilyList />
      </div>
    </div>
  );
}
