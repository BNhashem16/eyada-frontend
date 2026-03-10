"use client";

import { useState } from "react";
import { Package, CheckCircle2, Loader2 } from "lucide-react";
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
  useMyPharmacies,
  usePharmacyPrescriptionOrders,
  useUpdatePrescriptionOrderStatus,
} from "../hooks";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";

export function PharmacyPrescriptionOrders() {
  const { t, locale } = useTranslation();
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: pharmaciesData, isLoading: pharmaciesLoading } =
    useMyPharmacies({ limit: 100 });
  const pharmacies = pharmaciesData?.data || [];

  // Auto-select first pharmacy
  if (pharmacies.length > 0 && !selectedPharmacy) {
    setSelectedPharmacy(pharmacies[0].id);
  }

  const pharmacyId = selectedPharmacy;
  const { data, isLoading } = usePharmacyPrescriptionOrders(pharmacyId, {
    page,
  });
  const updateStatus = useUpdatePrescriptionOrderStatus();

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
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            {t("pharmacyOwner.noPharmacies")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("pharmacyOwner.pendingApproval")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const orders = data?.data || [];
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
      {/* Pharmacy Selector */}
      <Card>
        <CardContent className="p-4">
          <Select
            value={selectedPharmacy}
            onValueChange={(v) => {
              setSelectedPharmacy(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder={t("pharmacyOwner.selectPharmacy")} />
            </SelectTrigger>
            <SelectContent>
              {pharmacies.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>
                  {getLocalizedText(p.name, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t("prescription.noOrders")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {orders.map((order: any) => {
            const action = getNextAction(order.status);

            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {Number(order.totalAmount).toFixed(2)}
                      </span>
                      <Badge>{order.status}</Badge>
                    </div>
                  </div>

                  {/* Items */}
                  {order.items && (
                    <div className="space-y-1 mb-3">
                      {order.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span>{item.medicationName}</span>
                          <span className="text-muted-foreground">
                            {item.quantity} x{" "}
                            {Number(item.unitPrice).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {action && (
                    <Button
                      size="sm"
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
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      {action.label}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {meta && meta.totalPages > 1 && (
            <PaginationControls
              meta={meta}
              page={page}
              onPageChange={setPage}
              limit={10}
              onLimitChange={() => {}}
            />
          )}
        </>
      )}
    </div>
  );
}
