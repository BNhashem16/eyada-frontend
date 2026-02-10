"use client";

import { Bot } from "lucide-react";
import { AiSettingsForm } from "@/features/ai/components/ai-settings-form";
import { useTranslation } from "@/lib/i18n";

export function AdminAiSettingsContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("ai.settingsTitle")}
            </h1>
            <p className="text-muted-foreground">{t("ai.settingsSubtitle")}</p>
          </div>
        </div>
      </div>
      <AiSettingsForm />
    </div>
  );
}
