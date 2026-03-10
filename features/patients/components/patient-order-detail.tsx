"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  ArrowLeft,
  Phone,
  ChefHat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { usePatientOrder, useCancelOrder } from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import { OrderStatus } from "@/types/enums";

const STATUS_CONFIG: Record<
  string,
  { key: string; variant: string; icon: React.ElementType }
> = {
  PENDING: { key: "statusPending", variant: "secondary", icon: Clock },
  CONFIRMED: { key: "statusConfirmed", variant: "info", icon: CheckCircle2 },
  PREPARING: { key: "statusPreparing", variant: "info", icon: ChefHat },
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

// The step order for the tracking timeline
const TRACKING_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

interface Props {
  orderId: string;
}

export function PatientOrderDetail({ orderId }: Props) {
  const { t, locale } = useTranslation();
  const { data: order, isLoading, isError } = usePatientOrder(orderId);
  const cancelOrder = useCancelOrder();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <Card className="border-error-200 bg-error-50">
        <CardContent className="py-10 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-error-500 mb-4" />
          <p className="text-error-600">{t("admin.loadError")}</p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig?.icon || Package;
  const isCancelled = order.status === "CANCELLED";
  const isTerminal = ["CANCELLED", "REFUNDED"].includes(order.status);

  // Find current step index for tracking
  const currentStepIndex = isCancelled
    ? -1
    : TRACKING_STEPS.indexOf(order.status as any);

  const handleCancel = () => {
    cancelOrder.mutate(
      { orderId: order.id, reason: cancelReason || undefined },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          setCancelReason("");
        },
      },
    );
  };

  return (
    <>
      {/* Back + Status Header */}
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/patient/orders">
            <ArrowLeft className="h-4 w-4 me-2" />
            {t("common.back")}
          </Link>
        </Button>
        <Badge
          variant={(statusConfig?.variant || "secondary") as any}
          className="text-sm px-3 py-1"
        >
          <StatusIcon className="h-4 w-4 me-1" />
          {t(`pharmacyOwner.${statusConfig?.key || "statusPending"}`)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Tracking Timeline */}
          {!isTerminal && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("pharmacyOwner.orderTracking")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-between">
                  {TRACKING_STEPS.map((step, index) => {
                    const stepConfig = STATUS_CONFIG[step];
                    const StepIcon = stepConfig.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div
                        key={step}
                        className="flex flex-col items-center sm:flex-1"
                      >
                        <div
                          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${
                            isCompleted
                              ? isCurrent
                                ? "bg-primary-600 text-white"
                                : "bg-green-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs text-center leading-tight ${
                            isCompleted
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {t(`pharmacyOwner.${stepConfig.key}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {t("pharmacyOwner.orderItems")}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {t("pharmacyOwner.itemsInOrder").replace(
                    "{count}",
                    String(order.items.length),
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table Header - hidden on mobile */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                <div className="col-span-5">{t("pharmacyOwner.product")}</div>
                <div className="col-span-2 text-center">
                  {t("pharmacyOwner.unitPrice")}
                </div>
                <div className="col-span-2 text-center">
                  {t("pharmacyOwner.quantity")}
                </div>
                <div className="col-span-3 text-end">
                  {t("pharmacyOwner.total")}
                </div>
              </div>

              {/* Items */}
              <div className="divide-y">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 px-6 py-4 md:grid md:grid-cols-12 md:gap-2 md:items-center"
                  >
                    {/* Product */}
                    <div className="md:col-span-5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="font-medium text-sm leading-tight">
                        {getLocalizedText(item.productName, locale)}
                      </p>
                    </div>

                    {/* Mobile: price, qty, total in a row */}
                    <div className="flex items-center justify-between md:contents">
                      {/* Unit Price */}
                      <div className="md:col-span-2 md:text-center text-sm text-muted-foreground">
                        {Number(item.unitPrice).toFixed(2)} {t("common.egp")}
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2 md:text-center">
                        <Badge
                          variant="outline"
                          className="text-sm font-semibold px-3 py-1"
                        >
                          x{item.quantity}
                        </Badge>
                      </div>

                      {/* Total */}
                      <div className="md:col-span-3 md:text-end font-bold text-sm">
                        {Number(item.totalPrice).toFixed(2)} {t("common.egp")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Items Subtotal */}
              <div className="border-t bg-muted/30 px-6 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("pharmacyOwner.subtotal")} (
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  {t("pharmacyOwner.quantity")})
                </span>
                <span className="text-base font-bold">
                  {Number(order.subtotal).toFixed(2)} {t("common.egp")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("pharmacyOwner.orderTracking")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.statusHistory.map((entry, i) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium">{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {t(
                            `pharmacyOwner.${STATUS_CONFIG[entry.toStatus]?.key || "statusPending"}`,
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString(
                            locale === "ar" ? "ar-EG" : "en-US",
                          )}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("pharmacyOwner.orderSummary")}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("pharmacyOwner.orderNumber")}
                  </span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("pharmacyOwner.orderDate")}
                  </span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString(
                      locale === "ar" ? "ar-EG" : "en-US",
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("pharmacyOwner.subtotal")}
                  </span>
                  <span>
                    {Number(order.subtotal).toFixed(2)} {t("common.egp")}
                  </span>
                </div>
                {Number(order.deliveryFee) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("pharmacyOwner.deliveryFeeLabel")}
                    </span>
                    <span>
                      {Number(order.deliveryFee).toFixed(2)} {t("common.egp")}
                    </span>
                  </div>
                )}
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      {order.campaignDiscount &&
                      Number(order.campaignDiscount) > 0
                        ? t("pharmacyOwner.campaignDiscount")
                        : t("pharmacyOwner.discount")}
                    </span>
                    <span>
                      -{Number(order.discountAmount).toFixed(2)}{" "}
                      {t("common.egp")}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
                  <span>{t("pharmacyOwner.total")}</span>
                  <span>
                    {Number(order.totalAmount).toFixed(2)} {t("common.egp")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pharmacy Info */}
          {order.pharmacy && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">
                  {t("pharmacyOwner.pharmacyInfo")}
                </h3>
                <p className="text-sm font-medium">
                  {getLocalizedText(order.pharmacy.name, locale)}
                </p>
                {order.pharmacy.phoneNumbers &&
                  order.pharmacy.phoneNumbers.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {order.pharmacy.phoneNumbers[0]}
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Cancel Button */}
          {order.status === "PENDING" && (
            <Button
              variant="outline"
              className="w-full text-error-600 border-error-300 hover:bg-error-50"
              onClick={() => setCancelDialogOpen(true)}
            >
              {t("pharmacyOwner.cancelOrder")}
            </Button>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
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
