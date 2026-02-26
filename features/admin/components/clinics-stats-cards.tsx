"use client";

import { Building2, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAdminClinicStatistics } from "../hooks";
import { StatsCards, type StatCardConfig } from "./stats-cards";

export function ClinicsStatsCards() {
  const { t } = useTranslation();
  const { data, isLoading } = useAdminClinicStatistics();

  const cards: StatCardConfig[] = [
    {
      label: t("admin.clinicsPage.stats.total"),
      value: data?.totalClinics ?? 0,
      icon: Building2,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: t("admin.clinicsPage.stats.active"),
      value: data?.activeClinics ?? 0,
      icon: CheckCircle,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("admin.clinicsPage.stats.inactive"),
      value: data?.inactiveClinics ?? 0,
      icon: XCircle,
      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    },
  ];

  return <StatsCards cards={cards} isLoading={isLoading} columns={3} />;
}
