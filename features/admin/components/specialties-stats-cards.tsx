"use client";

import { Grid3X3, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAdminSpecialtyStatistics } from "../hooks";
import { StatsCards, type StatCardConfig } from "./stats-cards";

export function SpecialtiesStatsCards() {
  const { t } = useTranslation();
  const { data, isLoading } = useAdminSpecialtyStatistics();

  const cards: StatCardConfig[] = [
    {
      label: t("admin.specialtiesPage.stats.total"),
      value: data?.totalSpecialties ?? 0,
      icon: Grid3X3,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: t("admin.specialtiesPage.stats.active"),
      value: data?.activeSpecialties ?? 0,
      icon: CheckCircle,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("admin.specialtiesPage.stats.inactive"),
      value: data?.inactiveSpecialties ?? 0,
      icon: XCircle,
      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    },
  ];

  return <StatsCards cards={cards} isLoading={isLoading} columns={3} />;
}
