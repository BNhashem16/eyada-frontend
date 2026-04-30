"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Currency,
  ListSkeleton,
  OrderStatusBadge,
  PharmacyEmptyState,
  PharmacyErrorState,
  RefreshButton,
} from "@/components/pharmacy";
import {
  usePatientOrders,
  useCancelOrder,
  type PatientOrderFilters,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { OrderStatus } from "@/types/enums";
import { patientPharmacyOrderKeys } from "@/lib/query-keys";
import type { PharmacyOrder } from "@/types/order";

const ORDER_STATUSES: OrderStatus[] = Object.values(OrderStatus);

export function PatientOrdersList() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<PatientOrderFilters>({
    page: 1,
    limit: 10,
  });
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: ordersData, isLoading, isError } = usePatientOrders(filters);
  const cancelOrder = useCancelOrder();

  const handleRefresh = useMemo(
    () => async () => {
      await queryClient.invalidateQueries({
        queryKey: patientPharmacyOrderKeys.lists(),
      });
    },
    [queryClient],
  );

  const handleCancel = async () => {
    if (!cancelOrderId) return;
    await cancelOrder.mutateAsync({
      orderId: cancelOrderId,
      reason: cancelReason || undefined,
    });
    setCancelOrderId(null);
    setCancelReason("");
  };

  if (isLoading) {
    return <ListSkeleton rows={4} />;
  }

  if (isError) {
    return <PharmacyErrorState onRetry={handleRefresh} />;
  }

  const orders = ordersData?.data ?? [];
  const meta = ordersData?.meta;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sticky filter bar (mobile) */}
      <Card className="sticky top-0 z-10 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:bg-card sm:backdrop-blur-none">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={filters.status || "ALL"}
              onValueChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  status: v === "ALL" ? undefined : v,
                  page: 1,
                }))
              }
            >
              <SelectTrigger
                className="min-h-[44px] w-full sm:min-h-9 sm:w-64"
                aria-label={t("pharmacyOwner.orderStatus")}
              >
                <SelectValue placeholder={t("pharmacyOwner.orderStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("common.all")}</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`pharmacy.orderStatus.${status}` as never)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <RefreshButton onRefresh={handleRefresh} />
          </div>
        </CardContent>
      </Card>

      {meta ? (
        <p className="text-sm text-muted-foreground">
          {t("admin.pharmacies.totalResults")}{" "}
          <span className="font-semibold text-foreground">{meta.total}</span>
        </p>
      ) : null}

      {orders.length === 0 ? (
        <PharmacyEmptyState
          icon={Package}
          title={t("pharmacyOwner.noOrders")}
        />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <PatientOrderCard
              key={order.id}
              order={order}
              locale={locale}
              onCancel={() => setCancelOrderId(order.id)}
            />
          ))}
        </div>
      )}

      <PaginationControls
        meta={meta}
        page={filters.page || 1}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        limit={filters.limit || 10}
        onLimitChange={(l) =>
          setFilters((prev) => ({ ...prev, limit: l, page: 1 }))
        }
      />

      <Dialog
        open={!!cancelOrderId}
        onOpenChange={(open) => {
          if (!open) {
            setCancelOrderId(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pharmacyOwner.cancelOrder")}</DialogTitle>
            <DialogDescription>
              {t("pharmacyOwner.cancelOrderConfirm")}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={t("pharmacyOwner.cancellationReason")}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            aria-label={t("pharmacyOwner.cancellationReason")}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelOrderId(null);
                setCancelReason("");
              }}
              disabled={cancelOrder.isPending}
              className="min-h-[44px] sm:min-h-9"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelOrder.isPending}
              className="min-h-[44px] sm:min-h-9"
            >
              {t("pharmacyOwner.cancelOrder")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PatientOrderCardProps {
  order: PharmacyOrder;
  locale: "ar" | "en";
  onCancel: () => void;
}

function PatientOrderCard({ order, locale, onCancel }: PatientOrderCardProps) {
  const { t } = useTranslation();
  const canCancel = order.status === OrderStatus.PENDING;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-foreground">
            {t("pharmacyOwner.orderNumber")} {order.orderNumber}
          </h3>
          <OrderStatusBadge status={order.status} />
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {order.pharmacy ? (
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-xs text-muted-foreground">
                {t("admin.pharmacies.pharmacy")}
              </dt>
              <dd className="truncate">
                {getLocalizedText(order.pharmacy.name, locale)}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("pharmacyOwner.orderDate")}
            </dt>
            <dd>
              {new Date(order.createdAt).toLocaleDateString(
                locale === "ar" ? "ar-EG" : "en-US",
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("pharmacyOwner.orderTotal")}
            </dt>
            <dd className="font-semibold">
              <Currency amount={order.totalAmount} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("pharmacyOwner.orderItems")}
            </dt>
            <dd>
              {order.items.length} {t("pharmacyOwner.orderItems")}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="min-h-[44px] sm:min-h-9"
          >
            <Link href={`/patient/orders/${order.id}`}>
              {t("pharmacyOwner.viewOrderDetails")}
            </Link>
          </Button>
          {canCancel ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="min-h-[44px] border-error-300 text-error-600 hover:bg-error-50 sm:min-h-9"
            >
              {t("pharmacyOwner.cancelOrder")}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
