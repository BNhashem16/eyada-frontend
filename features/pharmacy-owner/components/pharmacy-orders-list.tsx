"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Package, Search, Store, Copy, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ConfirmDialog,
  Currency,
  DataCardList,
  ListSkeleton,
  OrderStatusBadge,
  PharmacyEmptyState,
  PharmacyErrorState,
  RefreshButton,
} from "@/components/pharmacy";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  useMyPharmacies,
  usePharmacyOrders,
  useUpdateOrderStatus,
  type PharmacyOrderFilters,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import { OrderStatus } from "@/types/enums";
import { STATUS_CONFIG, OWNER_ACTIONS } from "../constants/order-status";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { pharmacyOrderKeys } from "@/lib/query-keys";
import type { PharmacyOrder } from "@/types/order";
import { cn } from "@/lib/utils";

interface StatusActionState {
  orderId: string;
  toStatus: OrderStatus;
}

export function PharmacyOrdersList() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const { copy } = useCopyToClipboard();

  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [filters, setFilters] = useState<PharmacyOrderFilters>({
    page: 1,
    limit: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [statusAction, setStatusAction] = useState<StatusActionState | null>(
    null,
  );
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const { data: pharmaciesData, isLoading: pharmaciesLoading } =
    useMyPharmacies({ limit: 100 });
  const pharmacies = pharmaciesData?.data ?? [];

  // Default to first pharmacy on first render — in an effect so we don't
  // setState during render.
  useEffect(() => {
    if (!selectedPharmacy && pharmacies.length > 0) {
      setSelectedPharmacy(pharmacies[0].id);
    }
  }, [pharmacies, selectedPharmacy]);

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = usePharmacyOrders(selectedPharmacy, filters);
  const updateStatus = useUpdateOrderStatus(selectedPharmacy);

  const handleSearch = () =>
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));

  const handleCopyOrderNumber = (orderId: string, orderNumber: string) => {
    copy(orderNumber);
    setCopiedOrderId(orderId);
    window.setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleRefresh = useMemo(
    () => async () => {
      if (!selectedPharmacy) return;
      await queryClient.invalidateQueries({
        queryKey: pharmacyOrderKeys.lists(selectedPharmacy),
      });
    },
    [queryClient, selectedPharmacy],
  );

  if (pharmaciesLoading) {
    return <ListSkeleton rows={4} />;
  }

  if (pharmacies.length === 0) {
    return (
      <PharmacyEmptyState
        icon={Store}
        title={t("pharmacyOwner.noPharmacies")}
      />
    );
  }

  const orders = ordersData?.data ?? [];
  const meta = ordersData?.meta;

  const confirmStatusAction = async () => {
    if (!statusAction) return;
    await updateStatus.mutateAsync({
      orderId: statusAction.orderId,
      status: statusAction.toStatus,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sticky filter bar (mobile) */}
      <Card className="sticky top-0 z-10 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:bg-card sm:backdrop-blur-none">
        <CardContent className="space-y-3 p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Select
              value={selectedPharmacy}
              onValueChange={(v) => {
                setSelectedPharmacy(v);
                setFilters({ page: 1, limit: 10 });
                setSearchInput("");
              }}
            >
              <SelectTrigger
                className="min-h-[44px] w-full sm:min-h-9 md:w-64"
                aria-label={t("pharmacyOwner.selectPharmacy")}
              >
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
                className="min-h-[44px] w-full sm:min-h-9 md:w-48"
                aria-label={t("pharmacyOwner.orderStatus")}
              >
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

            <div className="flex flex-1 gap-2">
              <Input
                placeholder={t("pharmacyOwner.orderNumber")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="min-h-[44px] flex-1 sm:min-h-9"
                aria-label={t("pharmacyOwner.orderNumber")}
              />
              <Button
                onClick={handleSearch}
                variant="outline"
                aria-label={t("common.search")}
                className="min-h-[44px] min-w-[44px] sm:min-h-9 sm:min-w-9"
              >
                <Search className="size-4" aria-hidden="true" />
              </Button>
              <RefreshButton onRefresh={handleRefresh} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Body */}
      {ordersLoading ? (
        <ListSkeleton rows={5} />
      ) : ordersError ? (
        <PharmacyErrorState onRetry={handleRefresh} />
      ) : !selectedPharmacy ? null : orders.length === 0 ? (
        <PharmacyEmptyState
          icon={Package}
          title={t("pharmacyOwner.noOrders")}
        />
      ) : (
        <>
          {meta ? (
            <p className="text-sm text-muted-foreground">
              {t("admin.pharmacies.totalResults")}{" "}
              <span className="font-semibold text-foreground">
                {meta.total}
              </span>
            </p>
          ) : null}

          {/* Mobile: card list */}
          <DataCardList
            className="md:hidden"
            items={orders}
            getKey={(o) => o.id}
            renderCard={(order) => (
              <OrderCard
                order={order}
                copiedOrderId={copiedOrderId}
                onCopyOrderNumber={handleCopyOrderNumber}
                onAction={(toStatus) =>
                  setStatusAction({ orderId: order.id, toStatus })
                }
                pharmacyId={selectedPharmacy}
              />
            )}
          />

          {/* Desktop: table */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <Th>{t("pharmacyOwner.orderNumber")}</Th>
                    <Th>{t("pharmacyOwner.orderStatus")}</Th>
                    <Th>{t("pharmacyOwner.customer")}</Th>
                    <Th>{t("pharmacyOwner.orderDate")}</Th>
                    <Th>{t("pharmacyOwner.orderTotal")}</Th>
                    <Th>{t("pharmacyOwner.orderItems")}</Th>
                    <Th align="end">{t("pharmacyOwner.actions")}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      copiedOrderId={copiedOrderId}
                      onCopyOrderNumber={handleCopyOrderNumber}
                      onAction={(toStatus) =>
                        setStatusAction({ orderId: order.id, toStatus })
                      }
                      pharmacyId={selectedPharmacy}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

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

      <ConfirmDialog
        open={!!statusAction}
        onOpenChange={(open) => !open && setStatusAction(null)}
        title={t("pharmacyOwner.confirmAction")}
        description={
          statusAction
            ? t("pharmacyOwner.confirmStatusChange").replace(
                "{status}",
                t(
                  `pharmacyOwner.${STATUS_CONFIG[statusAction.toStatus]?.key || "statusPending"}`,
                ),
              )
            : undefined
        }
        tone={
          statusAction?.toStatus === OrderStatus.CANCELLED
            ? "destructive"
            : "default"
        }
        onConfirm={confirmStatusAction}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Local sub-components (private — 100% coupled to this list)
// ---------------------------------------------------------------------------

function Th({
  children,
  align = "start",
}: {
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-medium text-muted-foreground",
        align === "end" ? "text-end" : "text-start",
      )}
    >
      {children}
    </th>
  );
}

interface RowProps {
  order: PharmacyOrder;
  copiedOrderId: string | null;
  onCopyOrderNumber: (orderId: string, orderNumber: string) => void;
  onAction: (toStatus: OrderStatus) => void;
  pharmacyId: string;
}

function OrderRow({
  order,
  copiedOrderId,
  onCopyOrderNumber,
  onAction,
  pharmacyId,
}: RowProps) {
  const { t, locale } = useTranslation();
  const actions = OWNER_ACTIONS[order.status] ?? [];
  const isCopied = copiedOrderId === order.id;

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onCopyOrderNumber(order.id, order.orderNumber)}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary-600"
          title={t("pharmacyOwner.orderNumberCopied")}
        >
          {order.orderNumber}
          {isCopied ? (
            <Check className="size-3.5 text-success-700" aria-hidden="true" />
          ) : (
            <Copy
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </button>
      </td>
      <td className="px-4 py-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {order.user?.fullName || "-"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {new Date(order.createdAt).toLocaleDateString(
          locale === "ar" ? "ar-EG" : "en-US",
        )}
      </td>
      <td className="px-4 py-3 text-sm font-semibold">
        <Currency amount={order.totalAmount} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {t("pharmacyOwner.itemCount").replace(
          "{count}",
          String(order.items.length),
        )}
      </td>
      <td className="px-4 py-3">
        <RowActions
          actions={actions}
          orderId={order.id}
          pharmacyId={pharmacyId}
          onAction={onAction}
        />
      </td>
    </tr>
  );
}

function OrderCard({
  order,
  copiedOrderId,
  onCopyOrderNumber,
  onAction,
  pharmacyId,
}: RowProps) {
  const { t, locale } = useTranslation();
  const actions = OWNER_ACTIONS[order.status] ?? [];
  const isCopied = copiedOrderId === order.id;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onCopyOrderNumber(order.id, order.orderNumber)}
          className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
        >
          {order.orderNumber}
          {isCopied ? (
            <Check className="size-3.5 text-success-700" aria-hidden="true" />
          ) : (
            <Copy
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </button>
        <OrderStatusBadge status={order.status} />
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">
            {t("pharmacyOwner.customer")}
          </dt>
          <dd className="truncate">{order.user?.fullName || "-"}</dd>
        </div>
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
            {t("pharmacyOwner.itemCount").replace(
              "{count}",
              String(order.items.length),
            )}
          </dd>
        </div>
      </dl>

      <RowActions
        actions={actions}
        orderId={order.id}
        pharmacyId={pharmacyId}
        onAction={onAction}
        compact
      />
    </div>
  );
}

interface RowActionsProps {
  actions: { toStatus: OrderStatus; label: string }[];
  orderId: string;
  pharmacyId: string;
  onAction: (toStatus: OrderStatus) => void;
  compact?: boolean;
}

function RowActions({
  actions,
  orderId,
  pharmacyId,
  onAction,
  compact = false,
}: RowActionsProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        compact ? "justify-start" : "justify-end",
      )}
    >
      {actions.map((action) => (
        <Button
          key={action.toStatus}
          size="sm"
          variant={
            action.toStatus === OrderStatus.CANCELLED ? "outline" : "default"
          }
          className={cn(
            "min-h-[44px] sm:min-h-9",
            action.toStatus === OrderStatus.CANCELLED &&
              "border-error-300 text-error-600 hover:bg-error-50",
          )}
          onClick={() => onAction(action.toStatus)}
        >
          {t(`pharmacyOwner.${action.label}`)}
        </Button>
      ))}
      <Button
        asChild
        size="sm"
        variant="outline"
        className="min-h-[44px] sm:min-h-9"
      >
        <Link
          href={`/pharmacy-owner/orders/${orderId}?pharmacyId=${pharmacyId}`}
        >
          {t("pharmacyOwner.viewOrderDetails")}
        </Link>
      </Button>
    </div>
  );
}
