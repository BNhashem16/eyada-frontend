"use client";

import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAdminAppointmentStatistics } from "../hooks";
import { StatsCards, type StatCardConfig } from "./stats-cards";

export function AppointmentsStatsCards() {
  const { t } = useTranslation();
  const { data, isLoading } = useAdminAppointmentStatistics();

  const cards: StatCardConfig[] = [
    {
      label: t("admin.appointmentsPage.stats.total"),
      value: data?.totalAppointments ?? 0,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: t("admin.appointmentsPage.stats.completed"),
      value: data?.completed ?? 0,
      icon: CheckCircle,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("admin.appointmentsPage.stats.pending"),
      value: data?.pending ?? 0,
      icon: Clock,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      label: t("admin.appointmentsPage.stats.cancelled"),
      value: data?.cancelled ?? 0,
      icon: XCircle,
      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      label: t("admin.appointmentsPage.stats.totalRevenue"),
      value: (data?.totalRevenue ?? 0).toLocaleString(),
      icon: DollarSign,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: t("admin.appointmentsPage.stats.paidRevenue"),
      value: (data?.paidRevenue ?? 0).toLocaleString(),
      icon: CreditCard,
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    },
    {
      label: t("admin.appointmentsPage.stats.unpaidRevenue"),
      value: (data?.unpaidRevenue ?? 0).toLocaleString(),
      icon: AlertCircle,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
  ];

  return <StatsCards cards={cards} isLoading={isLoading} columns={4} />;
}
