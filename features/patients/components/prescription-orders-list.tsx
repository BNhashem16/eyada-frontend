"use client";

import { useState } from "react";
import { Package, CheckCircle2, XCircle, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePatientPrescriptionOrders,
  type PrescriptionOrderFilters,
} from "../hooks/use-prescription-requests";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { OrderStatus } from "@/types/enums";

const STATUS_CONFIG: Record<
  string,
  { key: string; variant: string; icon: React.ElementType }
> = {
  CONFIRMED: { key: "statusConfirmed", variant: "default", icon: CheckCircle2 },
  PREPARING: { key: "statusPreparing", variant: "default", icon: Package },
  READY_FOR_PICKUP: {
    key: "statusReadyForPickup",
    variant: "default",
    icon: Package,
  },
  OUT_FOR_DELIVERY: {
    key: "statusOutForDelivery",
    variant: "warning",
    icon: Truck,
  },
  DELIVERED: { key: "statusDelivered", variant: "success", icon: CheckCircle2 },
  CANCELLED: { key: "statusCancelled", variant: "error", icon: XCircle },
};

export function PrescriptionOrdersList() {
  const { t, locale } = useTranslation();
  const [filters, setFilters] = useState<PrescriptionOrderFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = usePatientPrescriptionOrders(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const orders = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-end">
        <Select
          value={filters.status || "ALL"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value === "ALL" ? undefined : value,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("common.all")}</SelectItem>
            {Object.values(OrderStatus).map((status) => {
              const config = STATUS_CONFIG[status];
              if (!config) return null;
              return (
                <SelectItem key={status} value={status}>
                  {t(`prescription.${config.key}`)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {t("prescription.noOrders")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order cards */}
      {orders.map((order) => {
        const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.CONFIRMED;
        const StatusIcon = config.icon;

        return (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    {Number(order.totalAmount).toFixed(2)}
                  </span>
                  <Badge variant={config.variant as any}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {t(`prescription.${config.key}`)}
                  </Badge>
                </div>
              </div>

              {/* Items summary */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <Badge
                        key={item.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {item.medicationName}
                      </Badge>
                    ))}
                    {order.items.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{order.items.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <PaginationControls
          meta={meta}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          limit={filters.limit ?? 10}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
        />
      )}
    </div>
  );
}
