"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  PharmacyEmptyState,
  PrescriptionStatusBadge,
  RefreshButton,
} from "@/components/pharmacy";
import {
  usePrescriptionRequests,
  type PrescriptionRequestFilters,
} from "../hooks/use-prescription-requests";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { PrescriptionRequestStatus } from "@/types/prescription";
import { prescriptionKeys } from "@/lib/query-keys";

export function PrescriptionRequestsList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PrescriptionRequestFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = usePrescriptionRequests(filters);

  const handleRefresh = useMemo(
    () => async () => {
      await queryClient.invalidateQueries({
        queryKey: prescriptionKeys.patientRequests(),
      });
    },
    [queryClient],
  );

  if (isLoading) {
    return <ListSkeleton rows={4} />;
  }

  const requests = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild className="min-h-[44px] sm:min-h-9">
          <Link href="/patient/prescriptions/upload">
            <Plus className="me-2 size-4" aria-hidden="true" />
            {t("prescription.uploadTitle")}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
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
            <SelectTrigger
              className="min-h-[44px] w-full sm:min-h-9 sm:w-[200px]"
              aria-label={t("pharmacyOwner.orderStatus")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("common.all")}</SelectItem>
              {Object.values(PrescriptionRequestStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`pharmacy.prescriptionStatus.${status}` as never)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <RefreshButton onRefresh={handleRefresh} />
        </div>
      </div>

      {requests.length === 0 ? (
        <PharmacyEmptyState
          icon={FileText}
          title={t("prescription.noRequests")}
          description={t("prescription.noRequestsDescription")}
          action={
            <Button asChild className="min-h-[44px] sm:min-h-9">
              <Link href="/patient/prescriptions/upload">
                <Plus className="me-2 size-4" aria-hidden="true" />
                {t("prescription.uploadTitle")}
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3" role="list">
          {requests.map((request) => {
            const orderCount = request.orders?.length ?? 0;
            return (
              <li key={request.id}>
                <Link
                  href={`/patient/prescriptions/${request.id}`}
                  className="block rounded-xl outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="grid size-10 shrink-0 place-items-center rounded-lg bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-200"
                            aria-hidden="true"
                          >
                            <FileText className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {request.requestNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {orderCount > 0 ? (
                            <Badge variant="outline">
                              {orderCount} {t("prescription.orders")}
                            </Badge>
                          ) : null}
                          {request.totalAmount ? (
                            <span className="font-semibold">
                              <Currency amount={request.totalAmount} />
                            </span>
                          ) : null}
                          <PrescriptionStatusBadge status={request.status} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {meta && meta.totalPages > 1 ? (
        <PaginationControls
          meta={meta}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          limit={filters.limit ?? 10}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
        />
      ) : null}
    </div>
  );
}
