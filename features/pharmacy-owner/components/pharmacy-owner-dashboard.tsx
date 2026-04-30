"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Currency,
  KpiSkeleton,
  ListSkeleton,
  OrderStatusBadge,
  PharmacyEmptyState,
  PharmacyErrorState,
  RefreshButton,
} from "@/components/pharmacy";
import { useMyPharmacies, usePharmacyOwnerDashboard } from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { pharmacyKeys } from "@/lib/query-keys";

export function PharmacyOwnerDashboard() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const {
    data: pharmacies,
    isLoading: loadingPharmacies,
    isError: pharmaciesError,
    refetch: refetchPharmacies,
  } = useMyPharmacies();

  const pharmacyList = pharmacies?.data;
  const [selectedPharmacy, setSelectedPharmacy] = useState("");

  // Default to the first pharmacy when the list lands. Doing this in an
  // effect (not in render) avoids the React "set state during render" bug
  // that the previous version had.
  useEffect(() => {
    if (!selectedPharmacy && pharmacyList?.length) {
      setSelectedPharmacy(pharmacyList[0].id);
    }
  }, [pharmacyList, selectedPharmacy]);

  const pharmacyId = selectedPharmacy || pharmacyList?.[0]?.id || "";
  const {
    data: dashboard,
    isLoading: loadingDashboard,
    isError: dashboardError,
  } = usePharmacyOwnerDashboard(pharmacyId);

  const isLoading = loadingPharmacies || loadingDashboard;

  const handleRefresh = useMemo(
    () => async () => {
      await Promise.all([
        refetchPharmacies(),
        pharmacyId
          ? queryClient.invalidateQueries({
              queryKey: pharmacyKeys.dashboard(pharmacyId),
            })
          : Promise.resolve(),
      ]);
    },
    [refetchPharmacies, queryClient, pharmacyId],
  );

  if (pharmaciesError || dashboardError) {
    return <PharmacyErrorState onRetry={handleRefresh} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toolbar: pharmacy switcher + refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {pharmacyList && pharmacyList.length > 1 ? (
          <Select value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
            <SelectTrigger
              className="w-full min-h-[44px] sm:w-64 sm:min-h-9"
              aria-label={t("pharmacyOwner.selectPharmacy")}
            >
              <SelectValue placeholder={t("pharmacyOwner.selectPharmacy")} />
            </SelectTrigger>
            <SelectContent>
              {pharmacyList.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {getLocalizedText(p.name, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="sr-only">{t("pharmacyOwner.selectPharmacy")}</span>
        )}
        <RefreshButton onRefresh={handleRefresh} />
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <KpiSkeleton count={4} />
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <KpiCard
              icon={Package}
              tone="blue"
              label={t("pharmacyOwner.totalProducts")}
              value={dashboard.totalProducts}
              subtitle={`${dashboard.activeProducts} ${t("pharmacyOwner.activeProducts")}`}
            />
            <KpiCard
              icon={ShoppingCart}
              tone="orange"
              label={t("pharmacyOwner.totalOrders")}
              value={dashboard.totalOrders}
            />
            <KpiCard
              icon={TrendingUp}
              tone="green"
              label={t("pharmacyOwner.totalRevenue")}
              currency={dashboard.totalRevenue}
            />
            <KpiCard
              icon={Wallet}
              tone="primary"
              label={t("pharmacyOwner.walletBalance")}
              currency={dashboard.wallet?.balance ?? 0}
            />
          </div>

          {dashboard.lowStockProducts > 0 ? (
            <Card className="border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle
                  className="size-5 shrink-0 text-warning-700 dark:text-warning-200"
                  aria-hidden="true"
                />
                <p className="text-sm text-warning-700 dark:text-warning-100">
                  {dashboard.lowStockProducts} {t("pharmacyOwner.lowStock")}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            {/* Recent orders */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  {t("pharmacyOwner.recentOrders")}
                </CardTitle>
                <BarChart3
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent>
                {!dashboard.recentOrders.length ? (
                  <PharmacyEmptyState
                    icon={ShoppingCart}
                    title={t("pharmacyOwner.noOrders")}
                  />
                ) : (
                  <ul className="divide-y divide-border" role="list">
                    {dashboard.recentOrders.map((order) => (
                      <li
                        key={order.id}
                        className="flex items-center justify-between gap-3 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString(
                              locale === "ar" ? "ar-EG" : "en-US",
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <OrderStatusBadge status={order.status} />
                          <Currency amount={order.totalAmount} fadeZero />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Top products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("pharmacyOwner.topProducts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!dashboard.topProducts.length ? (
                  <PharmacyEmptyState
                    icon={Package}
                    title={t("pharmacyOwner.noProducts")}
                  />
                ) : (
                  <ul className="divide-y divide-border" role="list">
                    {dashboard.topProducts.map((product, i) => (
                      <li
                        key={product.productId}
                        className="flex items-center justify-between gap-3 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground"
                            aria-hidden="true"
                          >
                            {i + 1}
                          </span>
                          <p className="truncate text-sm font-medium">
                            {product.name
                              ? getLocalizedText(product.name, locale)
                              : product.productId.slice(0, 8)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                          {product.totalQuantity} {t("pharmacyOwner.quantity")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <ListSkeleton rows={3} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Local KPI card — kept private to this file. If it needs to be shared, lift
// to components/pharmacy/.
// ---------------------------------------------------------------------------

const TONE_CLASS = {
  blue: "text-blue-600 dark:text-blue-300",
  orange: "text-orange-600 dark:text-orange-300",
  green: "text-success-700 dark:text-success-200",
  primary: "text-primary-600 dark:text-primary-300",
} as const;

interface KpiCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tone: keyof typeof TONE_CLASS;
  label: string;
  value?: number | string;
  currency?: number | string;
  subtitle?: string;
}

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
          <Icon className={`size-5 ${TONE_CLASS[tone]}`} aria-hidden="true" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <p className="text-xl font-bold sm:text-2xl">
          {currency !== undefined ? (
            <Currency amount={currency} className="text-xl sm:text-2xl" />
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
