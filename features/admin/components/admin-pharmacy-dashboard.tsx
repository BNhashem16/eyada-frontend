"use client";

import { useMemo } from "react";
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  Percent,
  Clock,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Currency,
  KpiSkeleton,
  ListSkeleton,
  PharmacyEmptyState,
  RefreshButton,
} from "@/components/pharmacy";
import { useAdminPharmacyDashboard } from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { adminPharmacyKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tone: string;
  label: string;
  value?: number | string;
  currency?: number | string;
  subtitle?: string;
}

const TONE = {
  blue: "text-blue-600 dark:text-blue-300",
  orange: "text-orange-600 dark:text-orange-300",
  green: "text-success-700 dark:text-success-200",
  purple: "text-purple-600 dark:text-purple-300",
  yellow: "text-warning-700 dark:text-warning-200",
} as const;

function KpiCard({
  icon: Icon,
  tone,
  label,
  value,
  currency,
  subtitle,
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="space-y-1.5 p-4">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-5", tone)} aria-hidden="true" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <p className="text-xl font-bold sm:text-2xl">
          {currency !== undefined ? (
            <Currency
              amount={currency}
              className={cn("text-xl sm:text-2xl", tone)}
            />
          ) : (
            value
          )}
        </p>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminPharmacyDashboard() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const { data: dashboard, isLoading } = useAdminPharmacyDashboard();

  const handleRefresh = useMemo(
    () => async () => {
      await queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.dashboard(),
      });
    },
    [queryClient],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <KpiSkeleton count={4} />
        <KpiSkeleton count={3} />
        <ListSkeleton rows={4} />
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-end">
        <RefreshButton onRefresh={handleRefresh} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          icon={Store}
          tone={TONE.blue}
          label={t("admin.pharmacyDashboard.totalPharmacies")}
          value={dashboard.totalPharmacies}
          subtitle={`${dashboard.activePharmacies} ${t(
            "admin.pharmacyDashboard.activePharmacies",
          )}`}
        />
        <KpiCard
          icon={ShoppingCart}
          tone={TONE.orange}
          label={t("admin.pharmacyDashboard.totalOrders")}
          value={dashboard.totalOrders}
        />
        <KpiCard
          icon={TrendingUp}
          tone={TONE.green}
          label={t("admin.pharmacyDashboard.totalRevenue")}
          currency={dashboard.totalRevenue}
        />
        <KpiCard
          icon={Percent}
          tone={TONE.purple}
          label={t("admin.pharmacyDashboard.totalCommission")}
          currency={dashboard.totalCommission}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <KpiCard
          icon={Clock}
          tone={TONE.yellow}
          label={t("admin.pharmacyDashboard.pendingPharmacies")}
          value={dashboard.pendingPharmacies}
        />
        <KpiCard
          icon={Package}
          tone={TONE.blue}
          label={t("admin.pharmacyDashboard.totalProducts")}
          value={dashboard.totalProducts}
        />
        <Card>
          <CardContent className="space-y-2 p-4">
            <span className="text-sm text-muted-foreground">
              {t("admin.pharmacyDashboard.totalOrders")} ({t("common.filter")})
            </span>
            <ul className="space-y-1" role="list">
              {Object.entries(dashboard.ordersByStatus).map(
                ([status, count]) => (
                  <li key={status} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t(`pharmacy.orderStatus.${status}` as never)}
                    </span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("admin.pharmacyDashboard.topPharmacies")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!dashboard.topPharmacies.length ? (
            <PharmacyEmptyState
              icon={Store}
              title={t("admin.pharmacies.noPharmaciesFound")}
            />
          ) : (
            <ul className="divide-y divide-border" role="list">
              {dashboard.topPharmacies.map((pharmacy, i) => (
                <li
                  key={pharmacy.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <p className="truncate font-medium">
                      {getLocalizedText(pharmacy.name, locale)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-4 text-sm text-muted-foreground">
                    <span>
                      {pharmacy._count.orders}{" "}
                      {t("admin.pharmacyDashboard.orderCount")}
                    </span>
                    <span>
                      {pharmacy._count.products}{" "}
                      {t("admin.pharmacyDashboard.productCount")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
