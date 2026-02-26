"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  usePatientOrders,
  useCancelOrder,
  type PatientOrderFilters,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { OrderStatus } from "@/types/enums";

const STATUS_CONFIG: Record<
  OrderStatus,
  { key: string; variant: string; icon: React.ElementType }
> = {
  PENDING: { key: "statusPending", variant: "secondary", icon: Clock },
  CONFIRMED: { key: "statusConfirmed", variant: "info", icon: CheckCircle2 },
  PREPARING: { key: "statusPreparing", variant: "info", icon: Package },
  READY_FOR_PICKUP: {
    key: "statusReadyForPickup",
    variant: "info",
    icon: Package,
  },
  OUT_FOR_DELIVERY: {
    key: "statusOutForDelivery",
    variant: "warning",
    icon: Truck,
  },
  DELIVERED: {
    key: "statusDelivered",
    variant: "success",
    icon: CheckCircle2,
  },
  CANCELLED: { key: "statusCancelled", variant: "destructive", icon: XCircle },
  RETURNED: { key: "statusReturned", variant: "secondary", icon: RotateCcw },
  REFUNDED: { key: "statusRefunded", variant: "secondary", icon: RotateCcw },
};

export function PatientOrdersList() {
  const { t, locale } = useTranslation();

  const [filters, setFilters] = useState<PatientOrderFilters>({
    page: 1,
    limit: 10,
  });
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: ordersData, isLoading, isError } = usePatientOrders(filters);
  const cancelOrder = useCancelOrder();

  const handleCancel = () => {
    if (!cancelOrderId) return;
    cancelOrder.mutate(
      { orderId: cancelOrderId, reason: cancelReason || undefined },
      {
        onSuccess: () => {
          setCancelOrderId(null);
          setCancelReason("");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50">
        <CardContent className="py-10 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-error-500 mb-4" />
          <p className="text-error-600">{t("admin.loadError")}</p>
        </CardContent>
      </Card>
    );
  }

  const orders = ordersData?.data || [];
  const meta = ordersData?.meta;

  return (
    <>
      {/* Status Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
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
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder={t("pharmacyOwner.orderStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("common.all")}</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {t(`pharmacyOwner.${config.key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Results Count */}
      {meta && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {t("admin.pharmacies.totalResults")}{" "}
            <span className="font-semibold">{meta.total}</span>
          </p>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("pharmacyOwner.noOrders")}
            </h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status];
            const StatusIcon = statusConfig.icon;
            return (
              <Card
                key={order.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {t("pharmacyOwner.orderNumber")}
                          {order.orderNumber}
                        </h3>
                        <Badge variant={statusConfig.variant as any}>
                          <StatusIcon className="h-3 w-3 me-1" />
                          {t(`pharmacyOwner.${statusConfig.key}`)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        {order.pharmacy && (
                          <span>
                            {getLocalizedText(order.pharmacy.name, locale)}
                          </span>
                        )}
                        <span>
                          {new Date(order.createdAt).toLocaleDateString(
                            locale === "ar" ? "ar-EG" : "en-US",
                          )}
                        </span>
                        <span className="font-semibold text-foreground">
                          {Number(order.totalAmount).toFixed(2)}{" "}
                          {t("common.egp")}
                        </span>
                        <span>
                          {order.items.length} {t("pharmacyOwner.orderItems")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/patient/orders/${order.id}`}>
                          {t("pharmacyOwner.viewOrderDetails")}
                        </Link>
                      </Button>
                      {order.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCancelOrderId(order.id)}
                          className="text-error-600 border-error-300 hover:bg-error-50"
                        >
                          {t("pharmacyOwner.cancelOrder")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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

      {/* Cancel Confirmation */}
      <AlertDialog
        open={!!cancelOrderId}
        onOpenChange={() => {
          setCancelOrderId(null);
          setCancelReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("pharmacyOwner.cancelOrder")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("pharmacyOwner.cancelOrderConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Textarea
              placeholder={t("pharmacyOwner.cancellationReason")}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-error-600 hover:bg-error-700"
              disabled={cancelOrder.isPending}
            >
              {cancelOrder.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("pharmacyOwner.cancelOrder")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
