"use client";

import { MessageSquareHeart } from "lucide-react";
import { AdminFeedbacksList, FeedbacksStatsCards } from "@/features/admin";
import { useTranslation } from "@/lib/i18n";

export function AdminFeedbacksContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <MessageSquareHeart className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("admin.feedbacksPage.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.feedbacksPage.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <FeedbacksStatsCards />

      {/* Feedbacks Management */}
      <AdminFeedbacksList />
    </div>
  );
}
