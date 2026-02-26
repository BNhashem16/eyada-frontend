"use client";

import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  Percent,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminPharmacyDashboard } from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";

export function AdminPharmacyDashboard() {
  const { t, locale } = useTranslation();
  const { data: dashboard, isLoading } = useAdminPharmacyDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Store className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">
                {t("admin.pharmacyDashboard.totalPharmacies")}
              </span>
            </div>
            <p className="text-2xl font-bold">{dashboard.totalPharmacies}</p>
            <p className="text-xs text-muted-foreground">
              {dashboard.activePharmacies}{" "}
              {t("admin.pharmacyDashboard.activePharmacies")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-muted-foreground">
                {t("admin.pharmacyDashboard.totalOrders")}
              </span>
            </div>
            <p className="text-2xl font-bold">{dashboard.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">
                {t("admin.pharmacyDashboard.totalRevenue")}
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {dashboard.totalRevenue.toFixed(2)} {t("common.egp")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-muted-foreground">
                {t("admin.pharmacyDashboard.totalCommission")}
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {dashboard.totalCommission.toFixed(2)} {t("common.egp")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-muted-foreground">
                {t("admin.pharmacyDashboard.pendingPharmacies")}
              </span>
            </div>
            <p className="text-2xl font-bold">{dashboard.pendingPharmacies}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">
                {t("admin.pharmacyDashboard.totalProducts")}
              </span>
            </div>
            <p className="text-2xl font-bold">{dashboard.totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">
              {t("admin.pharmacyDashboard.totalOrders")} ({t("common.filter")})
            </span>
            <div className="mt-2 space-y-1">
              {Object.entries(dashboard.ordersByStatus).map(
                ([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pharmacies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("admin.pharmacyDashboard.topPharmacies")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!dashboard.topPharmacies.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("admin.pharmacies.noPharmaciesFound")}
            </p>
          ) : (
            <div className="space-y-2">
              {dashboard.topPharmacies.map((pharmacy, i) => (
                <div
                  key={pharmacy.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{i + 1}
                    </span>
                    <p className="font-medium">
                      {getLocalizedText(pharmacy.name, locale)}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      {pharmacy._count.orders}{" "}
                      {t("admin.pharmacyDashboard.orderCount")}
                    </span>
                    <span>
                      {pharmacy._count.products}{" "}
                      {t("admin.pharmacyDashboard.productCount")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
