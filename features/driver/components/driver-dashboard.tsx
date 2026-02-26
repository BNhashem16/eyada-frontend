"use client";

import {
  Package,
  CheckCircle,
  Truck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import {
  useDriverProfile,
  useToggleAvailability,
  useDriverDeliveries,
} from "../hooks";
import { DriverStatus, OrderStatus } from "@/types/enums";
import Link from "next/link";

export function DriverDashboard() {
  const { t, locale } = useTranslation();
  const { data: profile, isLoading: profileLoading } = useDriverProfile();
  const toggleAvailability = useToggleAvailability();
  const { data: activeDeliveries, isLoading: deliveriesLoading } =
    useDriverDeliveries({ status: "active", limit: 5 });

  if (profileLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  const isPending = profile.status === DriverStatus.PENDING;
  const isApproved = profile.status === DriverStatus.APPROVED;

  return (
    <div className="space-y-6">
      {/* Pending Approval Banner */}
      {isPending && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="p-4">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              {t("driver.pendingApproval")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("driver.activeDeliveries")}
              </p>
              <p className="text-2xl font-bold">
                {deliveriesLoading
                  ? "..."
                  : (activeDeliveries?.data?.length ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("driver.totalDeliveries")}
              </p>
              <p className="text-2xl font-bold">
                {profile._count?.deliveries ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("driver.availability")}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant={profile.isAvailable ? "default" : "secondary"}>
                  {profile.isAvailable
                    ? t("driver.available")
                    : t("driver.unavailable")}
                </Badge>
                {isApproved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleAvailability.mutate({
                        isAvailable: !profile.isAvailable,
                      })
                    }
                    disabled={toggleAvailability.isPending}
                  >
                    {profile.isAvailable ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Deliveries */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {t("driver.activeDeliveries")}
            </h2>
            <Link href="/driver/deliveries">
              <Button variant="outline" size="sm">
                {t("common.viewAll")}
              </Button>
            </Link>
          </div>

          {deliveriesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : !activeDeliveries?.data?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("driver.noActiveDeliveries")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDeliveries.data.map((delivery) => (
                <Link
                  key={delivery.id}
                  href={`/driver/deliveries/${delivery.id}`}
                  className="block"
                >
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {t("driver.orderNumber")}
                            {delivery.orderNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {delivery.pharmacy
                              ? getLocalizedText(delivery.pharmacy.name, locale)
                              : ""}
                          </p>
                        </div>
                        <div className="text-end">
                          <Badge
                            variant={
                              delivery.status === OrderStatus.OUT_FOR_DELIVERY
                                ? "default"
                                : "secondary"
                            }
                          >
                            {delivery.status === OrderStatus.READY_FOR_PICKUP
                              ? t("driver.assigned")
                              : delivery.status === OrderStatus.OUT_FOR_DELIVERY
                                ? t("driver.pickedUp")
                                : delivery.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            {delivery.totalAmount} {t("common.egp")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
