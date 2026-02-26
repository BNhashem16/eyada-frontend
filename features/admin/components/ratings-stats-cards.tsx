"use client";

import { Star, TrendingUp, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAdminRatingStatistics } from "../hooks";
import { StatsCards, type StatCardConfig } from "./stats-cards";

export function RatingsStatsCards() {
  const { t } = useTranslation();
  const { data, isLoading } = useAdminRatingStatistics();

  const cards: StatCardConfig[] = [
    {
      label: t("admin.ratingsPage.stats.total"),
      value: data?.totalRatings ?? 0,
      icon: Star,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: t("admin.ratingsPage.stats.averageRating"),
      value: (data?.averageRating ?? 0).toFixed(1),
      icon: TrendingUp,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      label: t("admin.ratingsPage.stats.visible"),
      value: data?.visibleRatings ?? 0,
      icon: Eye,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("admin.ratingsPage.stats.hidden"),
      value: data?.hiddenRatings ?? 0,
      icon: EyeOff,
      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    },
  ];

  return <StatsCards cards={cards} isLoading={isLoading} columns={4} />;
}
