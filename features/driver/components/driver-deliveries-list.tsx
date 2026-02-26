"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useDriverDeliveries } from "../hooks";
import { OrderStatus } from "@/types/enums";
import Link from "next/link";

type FilterStatus = "all" | "active" | "completed";

export function DriverDeliveriesList() {
  const { t, locale } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("active");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useDriverDeliveries({
    page,
    limit,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const filters: { label: string; value: FilterStatus }[] = [
    { label: t("driver.filterAll"), value: "all" },
    { label: t("driver.filterActive"), value: "active" },
    { label: t("driver.filterCompleted"), value: "completed" },
  ];

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.READY_FOR_PICKUP:
        return <Badge variant="secondary">{t("driver.assigned")}</Badge>;
      case OrderStatus.OUT_FOR_DELIVERY:
        return <Badge variant="default">{t("driver.pickedUp")}</Badge>;
      case OrderStatus.DELIVERED:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {t("driver.delivered")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(1);
            }}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Deliveries List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : !data?.data?.length ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-1">
                {t("driver.noDeliveries")}
              </h3>
              <p className="text-sm">{t("driver.noDeliveriesDesc")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((delivery) => (
              <Link
                key={delivery.id}
                href={`/driver/deliveries/${delivery.id}`}
                className="block"
              >
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            {t("driver.orderNumber")}
                            {delivery.orderNumber}
                          </p>
                          {getStatusBadge(delivery.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {delivery.pharmacy
                            ? getLocalizedText(delivery.pharmacy.name, locale)
                            : ""}
                        </p>
                        {delivery.user && (
                          <p className="text-sm text-muted-foreground">
                            {t("driver.customer")}: {delivery.user.fullName}
                          </p>
                        )}
                      </div>
                      <div className="text-end shrink-0">
                        <p className="font-medium">
                          {delivery.totalAmount} {t("common.egp")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {delivery.items?.length ?? 0} {t("driver.items")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.meta && data.meta.totalPages > 1 && (
            <PaginationControls
              meta={data.meta}
              page={page}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
