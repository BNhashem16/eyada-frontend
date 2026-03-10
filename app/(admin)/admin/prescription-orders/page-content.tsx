"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
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
  useAdminPrescriptionOrders,
  useUpdateAdminPrescriptionOrderStatus,
} from "@/features/admin/hooks/use-admin-prescriptions";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

const ORDER_STATUSES = [
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

const statusTranslationMap: Record<string, string> = {
  CONFIRMED: "prescription.statusConfirmed",
  PREPARING: "prescription.statusPreparing",
  READY_FOR_PICKUP: "prescription.statusReadyForPickup",
  OUT_FOR_DELIVERY: "prescription.statusOutForDelivery",
  DELIVERED: "prescription.statusDelivered",
  CANCELLED: "prescription.statusCancelled",
  PENDING: "prescription.paymentPending",
  PAID: "prescription.paymentPaid",
  FAILED: "prescription.paymentFailed",
  REFUNDED: "prescription.paymentRefunded",
};

export function AdminPrescriptionOrdersPageContent() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: undefined as string | undefined,
  });
  const { data, isLoading } = useAdminPrescriptionOrders(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {t("nav.prescriptionOrders")}
        </h1>
      </div>

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
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(statusTranslationMap[status] || status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-3">
          {(data?.data || []).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {t("prescription.noOrders")}
                </p>
              </CardContent>
            </Card>
          ) : (
            (data?.data || []).map((order: any) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      {order.totalAmount && (
                        <p className="text-sm font-semibold mt-1">
                          {Number(order.totalAmount).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        order.status === "DELIVERED"
                          ? "success"
                          : order.status === "CANCELLED"
                            ? "error"
                            : order.status === "PENDING"
                              ? "warning"
                              : "secondary"
                      }
                    >
                      {t(statusTranslationMap[order.status] || order.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {data?.meta && data.meta.totalPages > 1 && (
            <PaginationControls
              meta={data.meta}
              page={filters.page}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              limit={filters.limit}
              onLimitChange={(limit) =>
                setFilters((prev) => ({ ...prev, limit, page: 1 }))
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
