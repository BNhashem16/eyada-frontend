"use client";

import {
  MessageSquare,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAdminFeedbackStatistics } from "../hooks";
import { StatsCards, type StatCardConfig } from "./stats-cards";

export function FeedbacksStatsCards() {
  const { t } = useTranslation();
  const { data, isLoading } = useAdminFeedbackStatistics();

  const cards: StatCardConfig[] = [
    {
      label: t("admin.feedbacksPage.stats.total"),
      value: data?.totalFeedbacks ?? 0,
      icon: MessageSquare,
      color:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: t("admin.feedbacksPage.stats.new"),
      value: data?.newFeedbacks ?? 0,
      icon: Clock,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      label: t("admin.feedbacksPage.stats.inReview"),
      value: data?.inReviewFeedbacks ?? 0,
      icon: Search,
      color:
        "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    },
    {
      label: t("admin.feedbacksPage.stats.resolved"),
      value: data?.resolvedFeedbacks ?? 0,
      icon: CheckCircle,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("admin.feedbacksPage.stats.complaints"),
      value: data?.complaints ?? 0,
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      label: t("admin.feedbacksPage.stats.suggestions"),
      value: data?.suggestions ?? 0,
      icon: Lightbulb,
      color:
        "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    },
  ];

  return <StatsCards cards={cards} isLoading={isLoading} columns={3} />;
}
