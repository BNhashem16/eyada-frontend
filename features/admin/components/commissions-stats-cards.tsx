"use client";

import { Users, DollarSign, CreditCard, Wallet } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useBalanceSummary } from "../hooks";
import { StatsCards, type StatCardConfig } from "./stats-cards";

export function CommissionsStatsCards() {
  const { t } = useTranslation();
  const { data, isLoading } = useBalanceSummary();

  const cards: StatCardConfig[] = [
    {
      label: t("admin.commissionsPage.stats.totalDoctors"),
      value: data?.totalDoctors ?? 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: t("admin.commissionsPage.stats.totalCommission"),
      value: (data?.totalCommission ?? 0).toLocaleString(),
      icon: DollarSign,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: t("admin.commissionsPage.stats.totalPaid"),
      value: (data?.totalPaid ?? 0).toLocaleString(),
      icon: CreditCard,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("admin.commissionsPage.stats.totalBalance"),
      value: (data?.totalBalance ?? 0).toLocaleString(),
      icon: Wallet,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
  ];

  return <StatsCards cards={cards} isLoading={isLoading} columns={4} />;
}
