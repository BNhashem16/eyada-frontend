"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Phone,
  User,
  Car,
  Truck,
  Copy,
  Check,
  RefreshCw,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  usePharmacyOrder,
  useUpdateOrderStatus,
  useAvailableDrivers,
  useAssignDriver,
  useReassignDriver,
} from "@/features/pharmacy-owner/hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import { OrderStatus } from "@/types/enums";
import {
  STATUS_CONFIG,
  OWNER_ACTIONS,
  TRACKING_STEPS,
  TERMINAL_STATUSES,
} from "@/features/pharmacy-owner/constants/order-status";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

interface Props {
  orderId: string;
}

export function PharmacyOrderDetailContent({ orderId }: Props) {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const pharmacyId = searchParams.get("pharmacyId") || "";
  const { copy, copied } = useCopyToClipboard();

  const {
    data: order,
    isLoading,
    isError,
  } = usePharmacyOrder(pharmacyId, orderId);
  const updateStatus = useUpdateOrderStatus(pharmacyId);

  const [statusAction, setStatusAction] = useState<{
    toStatus: OrderStatus;
  } | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);

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
  const currentStepIndex = isCancelled
    ? -1
    : TRACKING_STEPS.indexOf(order.status as (typeof TRACKING_STEPS)[number]);
  const actions = OWNER_ACTIONS[order.status] || [];

  const canAssignDriver =
    order.status === OrderStatus.READY_FOR_PICKUP &&
    !order.delivery?.driverProfileId;
  const hasDriver = !!order.delivery?.driver;
  const canReassignDriver =
    hasDriver &&
    !(TERMINAL_STATUSES as readonly string[]).includes(order.status);

  const handleStatusUpdate = () => {
    if (!statusAction) return;
    updateStatus.mutate(
      { orderId: order.id, status: statusAction.toStatus },
      { onSuccess: () => setStatusAction(null) },
    );
  };

  const addr = order.deliveryAddress;

  return (
    <>
      {/* Back + Status Header */}
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/pharmacy-owner/orders">
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

          {/* Owner Actions + Assign Driver */}
          {(actions.length > 0 || canAssignDriver) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2 flex-wrap">
                  {actions.map((action) => (
                    <Button
                      key={action.toStatus}
                      variant={
                        action.toStatus === OrderStatus.CANCELLED
                          ? "outline"
                          : "default"
                      }
                      className={
                        action.toStatus === OrderStatus.CANCELLED
                          ? "text-error-600 border-error-300 hover:bg-error-50"
                          : ""
                      }
                      onClick={() =>
                        setStatusAction({ toStatus: action.toStatus })
                      }
                    >
                      {t(`pharmacyOwner.${action.label}`)}
                    </Button>
                  ))}
                  {canAssignDriver && (
                    <Button
                      onClick={() => setShowAssignDialog(true)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Truck className="h-4 w-4 me-2" />
                      {t("pharmacyOwner.drivers.assignDriver")}
                    </Button>
                  )}
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
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t("pharmacyOwner.orderNumber")}
                  </span>
                  <button
                    onClick={() => copy(order.orderNumber)}
                    className="flex items-center gap-1.5 font-medium hover:text-primary-600 transition-colors"
                    title={t("pharmacyOwner.orderNumberCopied")}
                  >
                    {order.orderNumber}
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
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

          {/* Customer Info */}
          {order.user && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">
                  {t("pharmacyOwner.customerInfo")}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.user.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span dir="ltr">{order.user.phoneNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Driver Info */}
          {hasDriver && (
            <Card className="border-indigo-200 dark:border-indigo-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-indigo-600" />
                    {t("pharmacyOwner.drivers.driverInfo")}
                  </h3>
                  {canReassignDriver && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowReassignDialog(true)}
                    >
                      <RefreshCw className="h-3.5 w-3.5 me-1.5" />
                      {t("pharmacyOwner.drivers.changeDriver")}
                    </Button>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {order.delivery?.driver?.user?.fullName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{order.delivery.driver.user.fullName}</span>
                    </div>
                  )}
                  {order.delivery?.driver?.user?.phoneNumber && (
                    <a
                      href={`tel:${order.delivery.driver.user.phoneNumber}`}
                      className="flex items-center gap-2 hover:text-primary-600"
                      dir="ltr"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {order.delivery.driver.user.phoneNumber}
                    </a>
                  )}
                  {order.delivery?.driver?.vehicleType && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {t(
                          `common.vehicleTypes.${order.delivery.driver.vehicleType}`,
                        ) || order.delivery.driver.vehicleType}
                      </span>
                    </div>
                  )}
                  {order.delivery?.driver?.vehiclePlate && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>{order.delivery.driver.vehiclePlate}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Info */}
          {addr && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">
                  {t("pharmacyOwner.deliveryAddress")}
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {/* Label */}
                  {addr.label && (
                    <div className="flex justify-between">
                      <span>{t("pharmacyOwner.addressLabel")}</span>
                      <span className="font-medium text-foreground">
                        {addr.label}
                      </span>
                    </div>
                  )}
                  {/* Localized address text */}
                  {(addr.ar || addr.en) && (
                    <p>
                      {getLocalizedText(
                        { ar: addr.ar ?? "", en: addr.en ?? "" },
                        locale,
                      )}
                    </p>
                  )}
                  {/* City */}
                  {addr.city && (
                    <div className="flex justify-between">
                      <span>{t("pharmacyOwner.city")}</span>
                      <span className="text-foreground">{addr.city}</span>
                    </div>
                  )}
                  {/* Area */}
                  {addr.area && (
                    <div className="flex justify-between">
                      <span>{t("pharmacyOwner.area")}</span>
                      <span className="text-foreground">{addr.area}</span>
                    </div>
                  )}
                  {/* Building / Floor / Apartment */}
                  {(addr.buildingNumber || addr.floor || addr.apartment) && (
                    <div className="flex justify-between">
                      <span>
                        {[
                          addr.buildingNumber &&
                            `${t("pharmacyOwner.building")}: ${addr.buildingNumber}`,
                          addr.floor &&
                            `${t("pharmacyOwner.floor")}: ${addr.floor}`,
                          addr.apartment &&
                            `${t("pharmacyOwner.apartment")}: ${addr.apartment}`,
                        ]
                          .filter(Boolean)
                          .join(" / ")}
                      </span>
                    </div>
                  )}
                  {/* Landmark */}
                  {addr.landmark && (
                    <div className="flex justify-between">
                      <span>{t("pharmacyOwner.landmark")}</span>
                      <span className="text-foreground">{addr.landmark}</span>
                    </div>
                  )}
                  {/* Phone */}
                  {addr.phoneNumber && (
                    <div className="flex justify-between">
                      <span>{t("pharmacyOwner.addressPhone")}</span>
                      <span className="text-foreground" dir="ltr">
                        {addr.phoneNumber}
                      </span>
                    </div>
                  )}
                  {/* Address Notes */}
                  {addr.notes && (
                    <div className="flex justify-between">
                      <span>{t("pharmacyOwner.addressNotes")}</span>
                      <span className="text-foreground">{addr.notes}</span>
                    </div>
                  )}
                  {/* Delivery Notes (order-level) */}
                  {order.deliveryNotes && (
                    <p className="mt-2 pt-2 border-t">{order.deliveryNotes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status Update Confirmation */}
      <AlertDialog
        open={!!statusAction}
        onOpenChange={() => setStatusAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("pharmacyOwner.confirmAction")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction &&
                t("pharmacyOwner.confirmStatusChange").replace(
                  "{status}",
                  t(
                    `pharmacyOwner.${STATUS_CONFIG[statusAction.toStatus]?.key || "statusPending"}`,
                  ),
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={updateStatus.isPending}
              className={
                statusAction?.toStatus === OrderStatus.CANCELLED
                  ? "bg-error-600 hover:bg-error-700"
                  : ""
              }
            >
              {updateStatus.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Driver Dialog */}
      {showAssignDialog && (
        <DriverSelectionDialog
          pharmacyId={pharmacyId}
          orderId={orderId}
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          mode="assign"
        />
      )}

      {/* Reassign Driver Dialog */}
      {showReassignDialog && (
        <DriverSelectionDialog
          pharmacyId={pharmacyId}
          orderId={orderId}
          open={showReassignDialog}
          onOpenChange={setShowReassignDialog}
          mode="reassign"
        />
      )}
    </>
  );
}

function DriverSelectionDialog({
  pharmacyId,
  orderId,
  open,
  onOpenChange,
  mode,
}: {
  pharmacyId: string;
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "assign" | "reassign";
}) {
  const { t } = useTranslation();
  const { data, isLoading } = useAvailableDrivers(pharmacyId, orderId);
  const assignDriver = useAssignDriver(pharmacyId);
  const reassignDriver = useReassignDriver(pharmacyId);

  const mutation = mode === "reassign" ? reassignDriver : assignDriver;

  // The API may return { data, message } or just an array
  const drivers = Array.isArray(data) ? data : (data as any)?.data || [];

  const handleSelect = (driverProfileId: string) => {
    mutation.mutate(
      { orderId, driverProfileId },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const title =
    mode === "reassign"
      ? t("pharmacyOwner.drivers.changeDriver")
      : t("pharmacyOwner.drivers.assignDriver");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t("pharmacyOwner.drivers.selectDriver")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>{t("pharmacyOwner.drivers.noAvailableDrivers")}</p>
            </div>
          ) : (
            drivers.map((driver: any) => (
              <Card
                key={driver.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => !mutation.isPending && handleSelect(driver.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {driver.user?.fullName || "-"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {driver.user?.phoneNumber && (
                        <span dir="ltr">{driver.user.phoneNumber}</span>
                      )}
                      {driver.vehicleType && (
                        <span>
                          {t(`common.vehicleTypes.${driver.vehicleType}`) ||
                            driver.vehicleType}
                        </span>
                      )}
                    </div>
                  </div>
                  {mutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
