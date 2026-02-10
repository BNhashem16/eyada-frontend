"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function AiDisclaimerBanner() {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
      <p className="text-xs text-amber-700 dark:text-amber-300">
        {t("ai.disclaimer")}
      </p>
    </div>
  );
}
