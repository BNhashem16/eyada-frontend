"use client";

import { useState } from "react";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyPharmacies, usePharmacyOwnerDashboard } from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";

export function PharmacyOwnerDashboard() {
  const { t, locale } = useTranslation();
  const { data: pharmacies, isLoading: loadingPharmacies } = useMyPharmacies();

  const [selectedPharmacy, setSelectedPharmacy] = useState("");

  const pharmacyList = pharmacies?.data;
  const pharmacyId = selectedPharmacy || pharmacyList?.[0]?.id || "";

  if (!selectedPharmacy && pharmacyList?.length) {
    setSelectedPharmacy(pharmacyList[0].id);
  }

  const { data: dashboard, isLoading: loadingDashboard } =
    usePharmacyOwnerDashboard(pharmacyId);

  const isLoading = loadingPharmacies || loadingDashboard;

  return (
    <div className="space-y-6">
      {/* Pharmacy Selector */}
      {pharmacyList && pharmacyList.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <Select
              value={selectedPharmacy}
              onValueChange={setSelectedPharmacy}
            >
              <SelectTrigger className="w-full md:w-64">
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
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-muted-foreground">
                    {t("pharmacyOwner.totalProducts")}
                  </span>
                </div>
                <p className="text-2xl font-bold">{dashboard.totalProducts}</p>
                <p className="text-xs text-muted-foreground">
                  {dashboard.activeProducts} {t("pharmacyOwner.activeProducts")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-muted-foreground">
                    {t("pharmacyOwner.totalOrders")}
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
                    {t("pharmacyOwner.totalRevenue")}
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
                  <Wallet className="h-5 w-5 text-primary-600" />
                  <span className="text-sm text-muted-foreground">
                    {t("pharmacyOwner.walletBalance")}
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {(dashboard.wallet?.balance || 0).toFixed(2)}{" "}
                  {t("common.egp")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Warning */}
          {dashboard.lowStockProducts > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  {dashboard.lowStockProducts} {t("pharmacyOwner.lowStock")}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("pharmacyOwner.recentOrders")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!dashboard.recentOrders.length ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("pharmacyOwner.noOrders")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dashboard.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString(
                              locale === "ar" ? "ar-EG" : "en-US",
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {order.status}
                          </Badge>
                          <span className="text-sm font-medium">
                            {Number(order.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("pharmacyOwner.topProducts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!dashboard.topProducts.length ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("pharmacyOwner.noProducts")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dashboard.topProducts.map((product, i) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground">
                            #{i + 1}
                          </span>
                          <p className="font-medium text-sm">
                            {product.name
                              ? getLocalizedText(product.name, locale)
                              : product.productId.slice(0, 8)}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {product.totalQuantity} {t("pharmacyOwner.quantity")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
