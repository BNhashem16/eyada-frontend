"use client";

import {
  Users,
  UserCheck,
  Clock,
  UserX,
  ShieldOff,
  UserPlus,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAdminPatientStatistics } from "../hooks";
import { StatsCards, type StatCardConfig } from "./stats-cards";

export function PatientsStatsCards() {
  const { t } = useTranslation();
  const { data, isLoading } = useAdminPatientStatistics();

  const cards: StatCardConfig[] = [
    {
      label: t("admin.patients.stats.total"),
      value: data?.totalPatients ?? 0,
      icon: Users,
      color:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: t("admin.patients.stats.approved"),
      value: data?.approved ?? 0,
      icon: UserCheck,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("admin.patients.stats.pending"),
      value: data?.pending ?? 0,
      icon: Clock,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      label: t("admin.patients.stats.rejected"),
      value: data?.rejected ?? 0,
      icon: UserX,
      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      label: t("admin.patients.stats.suspended"),
      value: data?.suspended ?? 0,
      icon: ShieldOff,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
    {
      label: t("admin.patients.stats.newThisMonth"),
      value: data?.newThisMonth ?? 0,
      icon: UserPlus,
      color:
        "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    },
  ];

  return <StatsCards cards={cards} isLoading={isLoading} columns={3} />;
}
