"use client";

import { MessageSquareHeart } from "lucide-react";
import { FeedbackForm } from "@/features/feedback";
import { useTranslation } from "@/lib/i18n";

export function FeedbackPageContent() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <MessageSquareHeart className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("feedback.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">{t("feedback.subtitle")}</p>
      </div>

      {/* Feedback Form */}
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}
