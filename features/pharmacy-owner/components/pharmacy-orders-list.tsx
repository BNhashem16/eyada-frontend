"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Loader2,
  AlertTriangle,
  Store,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
import {
  useMyPharmacies,
  usePharmacyOrders,
  useUpdateOrderStatus,
  type PharmacyOrderFilters,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { OrderStatus } from "@/types/enums";
import { STATUS_CONFIG, OWNER_ACTIONS } from "../constants/order-status";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export function PharmacyOrdersList() {
  const { t, locale } = useTranslation();
  const { copy, copied } = useCopyToClipboard();

  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("");
  const [filters, setFilters] = useState<PharmacyOrderFilters>({
    page: 1,
    limit: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [statusAction, setStatusAction] = useState<{
    orderId: string;
    toStatus: OrderStatus;
  } | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const { data: pharmaciesData, isLoading: pharmaciesLoading } =
    useMyPharmacies({ limit: 100 });
  const pharmacies = pharmaciesData?.data || [];

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError,
  } = usePharmacyOrders(selectedPharmacy, filters);

  const updateStatus = useUpdateOrderStatus(selectedPharmacy);

  // Auto-select first pharmacy
  if (pharmacies.length > 0 && !selectedPharmacy) {
    setSelectedPharmacy(pharmacies[0].id);
  }

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleStatusUpdate = () => {
    if (!statusAction) return;
    updateStatus.mutate(
      { orderId: statusAction.orderId, status: statusAction.toStatus },
      { onSuccess: () => setStatusAction(null) },
    );
  };

  const handleCopyOrderNumber = (orderId: string, orderNumber: string) => {
    copy(orderNumber);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  if (pharmaciesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Store className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("pharmacyOwner.noPharmacies")}
          </h3>
        </CardContent>
      </Card>
    );
  }

  const orders = ordersData?.data || [];
  const meta = ordersData?.meta;

  return (
    <>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Pharmacy select */}
            <Select
              value={selectedPharmacy}
              onValueChange={(v) => {
                setSelectedPharmacy(v);
                setFilters({ page: 1, limit: 10 });
                setSearchInput("");
              }}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder={t("pharmacyOwner.selectPharmacy")} />
              </SelectTrigger>
              <SelectContent>
                {pharmacies.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {getLocalizedText(p.name, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
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
              <SelectTrigger className="w-full md:w-48">
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

            {/* Search */}
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={t("pharmacyOwner.orderNumber")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {ordersLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card className="border-error-200 bg-error-50">
          <CardContent className="py-10 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-error-500 mb-4" />
            <p className="text-error-600">{t("admin.loadError")}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!ordersLoading && !isError && selectedPharmacy && (
        <>
          {meta && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {t("admin.pharmacies.totalResults")}{" "}
                <span className="font-semibold">{meta.total}</span>
              </p>
            </div>
          )}

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
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                        {t("pharmacyOwner.orderNumber")}
                      </th>
                      <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                        {t("pharmacyOwner.orderStatus")}
                      </th>
                      <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                        {t("pharmacyOwner.customer")}
                      </th>
                      <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                        {t("pharmacyOwner.orderDate")}
                      </th>
                      <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                        {t("pharmacyOwner.orderTotal")}
                      </th>
                      <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                        {t("pharmacyOwner.orderItems")}
                      </th>
                      <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">
                        {t("pharmacyOwner.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => {
                      const statusConfig = STATUS_CONFIG[order.status];
                      const StatusIcon = statusConfig?.icon || Package;
                      const actions = OWNER_ACTIONS[order.status] || [];
                      const isCopied = copiedOrderId === order.id;

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          {/* Order Number */}
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                handleCopyOrderNumber(
                                  order.id,
                                  order.orderNumber,
                                )
                              }
                              className="flex items-center gap-1.5 font-medium text-sm hover:text-primary-600 transition-colors"
                              title={t("pharmacyOwner.orderNumberCopied")}
                            >
                              {order.orderNumber}
                              {isCopied ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </button>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                (statusConfig?.variant || "secondary") as any
                              }
                            >
                              <StatusIcon className="h-3 w-3 me-1" />
                              {t(
                                `pharmacyOwner.${statusConfig?.key || "statusPending"}`,
                              )}
                            </Badge>
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {order.user?.fullName || "-"}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString(
                              locale === "ar" ? "ar-EG" : "en-US",
                            )}
                          </td>

                          {/* Total */}
                          <td className="px-4 py-3 text-sm font-semibold">
                            {Number(order.totalAmount).toFixed(2)}{" "}
                            {t("common.egp")}
                          </td>

                          {/* Items Count */}
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {t("pharmacyOwner.itemCount").replace(
                              "{count}",
                              String(order.items.length),
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex gap-2 justify-end flex-wrap">
                              {actions.map((action) => (
                                <Button
                                  key={action.toStatus}
                                  size="sm"
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
                                    setStatusAction({
                                      orderId: order.id,
                                      toStatus: action.toStatus,
                                    })
                                  }
                                >
                                  {t(`pharmacyOwner.${action.label}`)}
                                </Button>
                              ))}
                              <Button asChild size="sm" variant="outline">
                                <Link
                                  href={`/pharmacy-owner/orders/${order.id}?pharmacyId=${selectedPharmacy}`}
                                >
                                  {t("pharmacyOwner.viewOrderDetails")}
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
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
        </>
      )}

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
    </>
  );
}
