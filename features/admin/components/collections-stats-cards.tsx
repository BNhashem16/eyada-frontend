"use client";

import { Wallet, CreditCard, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useBalanceSummary } from "../hooks";
import { StatsCards, type StatCardConfig } from "./stats-cards";

export function CollectionsStatsCards() {
  const { t } = useTranslation();
  const { data, isLoading } = useBalanceSummary();

  const cards: StatCardConfig[] = [
    {
      label: t("admin.collectionsPage.stats.totalBalance"),
      value: (data?.totalBalance ?? 0).toLocaleString(),
      icon: Wallet,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
    {
      label: t("admin.collectionsPage.stats.totalPaid"),
      value: (data?.totalPaid ?? 0).toLocaleString(),
      icon: CreditCard,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("admin.collectionsPage.stats.doctorsWithBalance"),
      value: data?.doctorsWithBalance ?? 0,
      icon: Users,
      color:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
  ];

  return <StatsCards cards={cards} isLoading={isLoading} columns={3} />;
}
