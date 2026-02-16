"use client";

import { CreditCard, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAdminPaymentMethodStatistics } from "../hooks";
import { StatsCards, type StatCardConfig } from "./stats-cards";

export function PaymentMethodsStatsCards() {
  const { t } = useTranslation();
  const { data, isLoading } = useAdminPaymentMethodStatistics();

  const cards: StatCardConfig[] = [
    {
      label: t("prepayment.stats.total"),
      value: data?.totalPaymentMethods ?? 0,
      icon: CreditCard,
      color:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: t("prepayment.stats.active"),
      value: data?.activePaymentMethods ?? 0,
      icon: CheckCircle,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("prepayment.stats.inactive"),
      value: data?.inactivePaymentMethods ?? 0,
      icon: XCircle,
      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    },
  ];

  return <StatsCards cards={cards} isLoading={isLoading} columns={3} />;
}
