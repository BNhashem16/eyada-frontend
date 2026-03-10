"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  Plus,
  ClipboardCheck,
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
  usePrescriptionRequests,
  type PrescriptionRequestFilters,
} from "../hooks/use-prescription-requests";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { PrescriptionRequestStatus } from "@/types/prescription";

const STATUS_CONFIG: Record<
  string,
  { key: string; variant: string; icon: React.ElementType }
> = {
  PENDING_REVIEW: {
    key: "statusPendingReview",
    variant: "secondary",
    icon: Clock,
  },
  ASSIGNED: { key: "statusAssigned", variant: "default", icon: ClipboardCheck },
  PREPARING: { key: "statusPreparing", variant: "default", icon: Package },
  READY_FOR_PICKUP: {
    key: "statusReadyForPickup",
    variant: "default",
    icon: Package,
  },
  OUT_FOR_DELIVERY: {
    key: "statusOutForDelivery",
    variant: "warning",
    icon: Truck,
  },
  DELIVERED: { key: "statusDelivered", variant: "success", icon: CheckCircle2 },
  CANCELLED: { key: "statusCancelled", variant: "error", icon: XCircle },
};

export function PrescriptionRequestsList() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<PrescriptionRequestFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = usePrescriptionRequests(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const requests = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      {/* Header with upload button and filter */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/patient/prescriptions/upload">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("prescription.uploadTitle")}
          </Button>
        </Link>
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
            {Object.values(PrescriptionRequestStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {t(
                  `prescription.${STATUS_CONFIG[status]?.key || "statusPendingReview"}`,
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {requests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {t("prescription.noRequests")}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {t("prescription.noRequestsDescription")}
            </p>
            <Link href="/patient/prescriptions/upload">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("prescription.uploadTitle")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Request cards */}
      {requests.map((request) => {
        const config =
          STATUS_CONFIG[request.status] || STATUS_CONFIG.PENDING_REVIEW;
        const StatusIcon = config.icon;
        const orderCount = request.orders?.length || 0;

        return (
          <Link key={request.id} href={`/patient/prescriptions/${request.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">{request.requestNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {orderCount > 0 && (
                      <Badge variant="outline">
                        {orderCount} {t("prescription.orders")}
                      </Badge>
                    )}
                    {request.totalAmount && (
                      <span className="font-semibold">
                        {Number(request.totalAmount).toFixed(2)}
                      </span>
                    )}
                    <Badge variant={config.variant as any}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {t(`prescription.${config.key}`)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <PaginationControls
          meta={meta}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          limit={filters.limit ?? 10}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
        />
      )}
    </div>
  );
}
