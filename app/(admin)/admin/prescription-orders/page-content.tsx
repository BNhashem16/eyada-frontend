"use client";

import { useState } from "react";
import { ClipboardList, Eye, Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAdminPrescriptionOrders,
  useUpdateAdminPrescriptionOrderStatus,
} from "@/features/admin/hooks/use-admin-prescriptions";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ConfirmDialog } from "@/components/pharmacy/confirm-dialog";
import { useTranslation } from "@/lib/i18n";
import type { PrescriptionOrder } from "@/types/prescription";

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

function getStatusVariant(
  status: string,
): "default" | "secondary" | "success" | "error" | "warning" | "outline" {
  switch (status) {
    case "DELIVERED":
    case "PAID":
      return "success";
    case "CANCELLED":
    case "FAILED":
      return "error";
    case "PENDING":
      return "warning";
    case "PREPARING":
    case "OUT_FOR_DELIVERY":
      return "default";
    default:
      return "secondary";
  }
}

export function AdminPrescriptionOrdersPageContent() {
  const { t, locale } = useTranslation();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: undefined as string | undefined,
  });
  const { data, isLoading } = useAdminPrescriptionOrders(filters);
  const updateStatus = useUpdateAdminPrescriptionOrderStatus();

  const [detailOrder, setDetailOrder] = useState<PrescriptionOrder | null>(
    null,
  );
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  const handleStatusChange = (orderId: string, status: string) => {
    if (status === "CANCELLED") {
      setCancelOrderId(orderId);
      return;
    }
    updateStatus.mutate({ orderId, status });
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrderId) return;
    await updateStatus.mutateAsync({
      orderId: cancelOrderId,
      status: "CANCELLED",
    });
    setCancelOrderId(null);
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";
    return new Date(value).toLocaleString(
      locale === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  const orders = (data?.data ?? []) as PrescriptionOrder[];

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
          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {t("prescription.noOrders")}
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const isTerminal =
                order.status === "DELIVERED" || order.status === "CANCELLED";
              const isUpdatingThis =
                updateStatus.isPending &&
                updateStatus.variables?.orderId === order.id;

              return (
                <Card key={order.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                        {order.pharmacy?.name ? (
                          <p className="text-sm mt-1">
                            <span className="font-medium">
                              {t("prescription.pharmacy")}:
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {order.pharmacy.name}
                            </span>
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("prescription.noPharmacyAssigned")}
                          </p>
                        )}
                        {order.totalAmount != null && (
                          <p className="text-sm font-semibold mt-1">
                            {t("prescription.total")}:{" "}
                            <span className="text-green-600 dark:text-green-400">
                              {Number(order.totalAmount).toFixed(2)}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getStatusVariant(order.status)}>
                          {t(
                            statusTranslationMap[order.status] || order.status,
                          )}
                        </Badge>
                        {order.paymentStatus ? (
                          <Badge
                            variant={getStatusVariant(order.paymentStatus)}
                            className="text-xs"
                          >
                            {t("prescription.paymentStatus")}:{" "}
                            {t(
                              statusTranslationMap[order.paymentStatus] ||
                                order.paymentStatus,
                            )}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setDetailOrder(order)}
                        className="min-h-[44px] sm:min-h-9"
                      >
                        <Eye
                          className="me-1 h-3 w-3"
                          aria-hidden="true"
                        />
                        {t("prescription.viewDetails")}
                      </Button>

                      {!isTerminal && (
                        <>
                          <Select
                            value=""
                            disabled={isUpdatingThis}
                            onValueChange={(next) =>
                              handleStatusChange(order.id, next)
                            }
                          >
                            <SelectTrigger
                              className="min-h-[44px] sm:min-h-9 w-full sm:w-[200px]"
                              aria-label={t("prescription.changeStatus")}
                            >
                              <SelectValue
                                placeholder={t("prescription.changeStatus")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.filter(
                                (s) => s !== order.status && s !== "CANCELLED",
                              ).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {t(statusTranslationMap[status] || status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => setCancelOrderId(order.id)}
                            disabled={isUpdatingThis}
                            className="min-h-[44px] sm:min-h-9"
                          >
                            {isUpdatingThis ? (
                              <Loader2
                                className="me-1 h-3 w-3 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <XCircle
                                className="me-1 h-3 w-3"
                                aria-hidden="true"
                              />
                            )}
                            {t("prescription.cancelOrder")}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
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

      {/* Detail dialog */}
      <Dialog
        open={!!detailOrder}
        onOpenChange={(open) => !open && setDetailOrder(null)}
      >
        <DialogContent className="max-w-full sm:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("prescription.orderDetails")}
              {detailOrder ? ` — ${detailOrder.orderNumber}` : ""}
            </DialogTitle>
          </DialogHeader>

          {detailOrder ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getStatusVariant(detailOrder.status)}>
                  {t(
                    statusTranslationMap[detailOrder.status] ||
                      detailOrder.status,
                  )}
                </Badge>
                {detailOrder.paymentStatus ? (
                  <Badge variant={getStatusVariant(detailOrder.paymentStatus)}>
                    {t("prescription.paymentStatus")}:{" "}
                    {t(
                      statusTranslationMap[detailOrder.paymentStatus] ||
                        detailOrder.paymentStatus,
                    )}
                  </Badge>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("prescription.pharmacy")}
                  </p>
                  <p className="font-medium">
                    {detailOrder.pharmacy?.name ||
                      t("prescription.noPharmacyAssigned")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("prescription.total")}
                  </p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {Number(detailOrder.totalAmount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("prescription.subtotal")}
                  </p>
                  <p className="font-medium">
                    {Number(detailOrder.subtotal).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("prescription.deliveryFee")}
                  </p>
                  <p className="font-medium">
                    {Number(detailOrder.deliveryFee).toFixed(2)}
                  </p>
                </div>
                {detailOrder.commissionAmount != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("prescription.commission")}
                    </p>
                    <p className="font-medium">
                      {Number(detailOrder.commissionAmount).toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("prescription.statusConfirmed")}
                  </p>
                  <p className="font-medium">
                    {formatDate(detailOrder.confirmedAt)}
                  </p>
                </div>
              </div>

              {/* Items */}
              {detailOrder.items && detailOrder.items.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">
                      {t("prescription.items")}
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-start py-1.5 pe-2 font-medium">
                              {t("prescription.medication")}
                            </th>
                            <th className="text-center py-1.5 px-2 font-medium">
                              {t("prescription.quantity")}
                            </th>
                            <th className="text-end py-1.5 px-2 font-medium">
                              {t("prescription.unitPrice")}
                            </th>
                            <th className="text-end py-1.5 ps-2 font-medium">
                              {t("prescription.total")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailOrder.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b last:border-0"
                            >
                              <td className="py-1.5 pe-2">
                                {item.medicationName}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                {item.quantity}
                              </td>
                              <td className="py-1.5 px-2 text-end">
                                {Number(item.unitPrice).toFixed(2)}
                              </td>
                              <td className="py-1.5 ps-2 text-end font-medium">
                                {(
                                  item.quantity * Number(item.unitPrice)
                                ).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Status history */}
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">
                  {t("prescription.statusHistory")}
                </p>
                {detailOrder.statusHistory &&
                detailOrder.statusHistory.length > 0 ? (
                  <ul className="space-y-2">
                    {detailOrder.statusHistory.map((entry) => (
                      <li
                        key={entry.id}
                        className="border rounded-md p-2 text-xs space-y-1"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {entry.fromStatus && (
                            <>
                              <Badge
                                variant={getStatusVariant(entry.fromStatus)}
                                className="text-[10px]"
                              >
                                {t(
                                  statusTranslationMap[entry.fromStatus] ||
                                    entry.fromStatus,
                                )}
                              </Badge>
                              <span className="text-muted-foreground">→</span>
                            </>
                          )}
                          <Badge
                            variant={getStatusVariant(entry.toStatus)}
                            className="text-[10px]"
                          >
                            {t(
                              statusTranslationMap[entry.toStatus] ||
                                entry.toStatus,
                            )}
                          </Badge>
                          <span className="text-muted-foreground ms-auto">
                            {entry.changedByRole}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </p>
                        {entry.note && (
                          <p className="whitespace-pre-wrap">{entry.note}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("prescription.noStatusHistory")}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!cancelOrderId}
        onOpenChange={(open) => !open && setCancelOrderId(null)}
        title={t("prescription.cancelOrder")}
        description={t("prescription.cancelOrderConfirm")}
        confirmLabel={t("prescription.cancelOrder")}
        tone="destructive"
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
