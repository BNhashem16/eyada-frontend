"use client";

import { Users, UserCheck, UserX, Link } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAdminSecretaryStatistics } from "../hooks";
import { StatsCards, type StatCardConfig } from "./stats-cards";

export function SecretariesStatsCards() {
  const { t } = useTranslation();
  const { data, isLoading } = useAdminSecretaryStatistics();

  const cards: StatCardConfig[] = [
    {
      label: t("admin.secretariesPage.stats.total"),
      value: data?.totalSecretaries ?? 0,
      icon: Users,
      color:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: t("admin.secretariesPage.stats.activeAssignments"),
      value: data?.activeAssignments ?? 0,
      icon: UserCheck,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("admin.secretariesPage.stats.inactiveAssignments"),
      value: data?.inactiveAssignments ?? 0,
      icon: UserX,
      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      label: t("admin.secretariesPage.stats.totalAssignments"),
      value: data?.totalAssignments ?? 0,
      icon: Link,
      color:
        "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    },
  ];

  return <StatsCards cards={cards} isLoading={isLoading} columns={4} />;
}
