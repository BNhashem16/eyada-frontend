"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, CheckCircle2, Loader2 } from "lucide-react";
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
  Currency,
  ListSkeleton,
  OrderStatusBadge,
  PharmacyEmptyState,
  RefreshButton,
} from "@/components/pharmacy";
import {
  useMyPharmacies,
  usePharmacyPrescriptionOrders,
  useUpdatePrescriptionOrderStatus,
} from "../hooks";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { prescriptionKeys } from "@/lib/query-keys";

export function PharmacyPrescriptionOrders() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [page, setPage] = useState(1);

  const { data: pharmaciesData, isLoading: pharmaciesLoading } =
    useMyPharmacies({ limit: 100 });
  const pharmacies = pharmaciesData?.data ?? [];

  // Default first pharmacy in an effect (no setState during render).
  useEffect(() => {
    if (!selectedPharmacy && pharmacies.length > 0) {
      setSelectedPharmacy(pharmacies[0].id);
    }
  }, [pharmacies, selectedPharmacy]);

  const pharmacyId = selectedPharmacy;
  const { data, isLoading } = usePharmacyPrescriptionOrders(pharmacyId, {
    page,
  });
  const updateStatus = useUpdatePrescriptionOrderStatus();

  const handleRefresh = useMemo(
    () => async () => {
      if (!pharmacyId) return;
      await queryClient.invalidateQueries({
        queryKey: prescriptionKeys.pharmacyOrders(pharmacyId),
      });
    },
    [queryClient, pharmacyId],
  );

  if (pharmaciesLoading) {
    return <ListSkeleton rows={4} />;
  }

  if (pharmacies.length === 0) {
    return (
      <PharmacyEmptyState
        icon={Package}
        title={t("pharmacyOwner.noPharmacies")}
        description={t("pharmacyOwner.pendingApproval")}
      />
    );
  }

  const orders = data?.data ?? [];
  const meta = data?.meta;

  const getNextAction = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return { label: t("prescription.preparing"), nextStatus: "PREPARING" };
      case "PREPARING":
        return {
          label: t("prescription.readyForPickup"),
          nextStatus: "READY_FOR_PICKUP",
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Sticky toolbar (mobile) */}
      <Card className="sticky top-0 z-10 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:bg-card sm:backdrop-blur-none">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select
              value={selectedPharmacy}
              onValueChange={(v) => {
                setSelectedPharmacy(v);
                setPage(1);
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
            <RefreshButton onRefresh={handleRefresh} />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : orders.length === 0 ? (
        <PharmacyEmptyState icon={Package} title={t("prescription.noOrders")} />
      ) : (
        <>
          {orders.map((order) => {
            const action = getNextAction(order.status);

            return (
              <Card key={order.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        <Currency amount={order.totalAmount} />
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>

                  {order.items ? (
                    <ul className="space-y-1 text-sm" role="list">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate">
                            {item.medicationName}
                          </span>
                          <span className="shrink-0 text-muted-foreground">
                            {item.quantity} ×{" "}
                            <Currency amount={item.unitPrice} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {action ? (
                    <Button
                      size="sm"
                      className="min-h-[44px] sm:min-h-9"
                      onClick={() =>
                        updateStatus.mutate({
                          pharmacyId,
                          orderId: order.id,
                          status: action.nextStatus,
                        })
                      }
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending ? (
                        <Loader2
                          className="me-1 size-3 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <CheckCircle2
                          className="me-1 size-3"
                          aria-hidden="true"
                        />
                      )}
                      {action.label}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}

          {meta && meta.totalPages > 1 ? (
            <PaginationControls
              meta={meta}
              page={page}
              onPageChange={setPage}
              limit={10}
              onLimitChange={() => {}}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
