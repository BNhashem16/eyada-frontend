"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Currency,
  ListSkeleton,
  OrderStatusBadge,
  PharmacyEmptyState,
} from "@/components/pharmacy";
import {
  usePatientPrescriptionOrders,
  type PrescriptionOrderFilters,
} from "../hooks/use-prescription-requests";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { OrderStatus } from "@/types/enums";

export function PrescriptionOrdersList() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<PrescriptionOrderFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = usePatientPrescriptionOrders(filters);

  if (isLoading) {
    return <ListSkeleton rows={4} />;
  }

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
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
          <SelectTrigger
            className="min-h-[44px] w-full sm:min-h-9 sm:w-[200px]"
            aria-label={t("pharmacyOwner.orderStatus")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("common.all")}</SelectItem>
            {Object.values(OrderStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {t(`pharmacy.orderStatus.${status}` as never)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <PharmacyEmptyState icon={Package} title={t("prescription.noOrders")} />
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    aria-hidden="true"
                  >
                    <Package className="size-5" />
                  </span>
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">
                    <Currency amount={order.totalAmount} />
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              {order.items && order.items.length > 0 ? (
                <div className="mt-3 border-t pt-3">
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
                    {order.items.length > 3 ? (
                      <Badge variant="outline" className="text-xs">
                        +{order.items.length - 3}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))
      )}

      {meta && meta.totalPages > 1 ? (
        <PaginationControls
          meta={meta}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          limit={filters.limit ?? 10}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
        />
      ) : null}
    </div>
  );
}
