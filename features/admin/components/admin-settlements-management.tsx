"use client";

import { useState } from "react";
import { RefreshCw, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Currency,
  ListSkeleton,
  PharmacyEmptyState,
  SettlementStatusBadge,
} from "@/components/pharmacy";
import { useAdminSettlements, useProcessSettlement } from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { SettlementStatus } from "@/types";

const STATUS_ICONS: Record<string, typeof Clock> = {
  PENDING: Clock,
  PROCESSING: RefreshCw,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
};

export function AdminSettlementsManagement() {
  const { t, locale } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<SettlementStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Process settlement dialog state
  const [processOpen, setProcessOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<string>("");
  const [processStatus, setProcessStatus] = useState<SettlementStatus>(
    SettlementStatus.COMPLETED,
  );
  const [processNotes, setProcessNotes] = useState("");

  const { data: settlements, isLoading } = useAdminSettlements({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    limit,
  });
  const processSettlement = useProcessSettlement();

  const handleProcess = () => {
    processSettlement.mutate(
      {
        settlementId: selectedSettlement,
        status: processStatus,
        notes: processNotes || undefined,
      },
      {
        onSuccess: () => {
          setProcessOpen(false);
          setSelectedSettlement("");
          setProcessNotes("");
        },
      },
    );
  };

  const openProcessDialog = (
    settlementId: string,
    targetStatus: SettlementStatus,
  ) => {
    setSelectedSettlement(settlementId);
    setProcessStatus(targetStatus);
    setProcessNotes("");
    setProcessOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as SettlementStatus | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger
                className="min-h-[44px] w-full sm:min-h-9 sm:w-48"
                aria-label={t("admin.settlements.allStatuses")}
              >
                <SelectValue placeholder={t("admin.settlements.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {t("admin.settlements.allStatuses")}
                </SelectItem>
                <SelectItem value="PENDING">
                  {t("admin.settlements.pending")}
                </SelectItem>
                <SelectItem value="PROCESSING">
                  {t("admin.settlements.processing")}
                </SelectItem>
                <SelectItem value="COMPLETED">
                  {t("admin.settlements.completed")}
                </SelectItem>
                <SelectItem value="FAILED">
                  {t("admin.settlements.failed")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Settlements List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("admin.settlements.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={3} />
          ) : !settlements?.data?.length ? (
            <PharmacyEmptyState
              icon={RefreshCw}
              title={t("admin.settlements.noSettlements")}
            />
          ) : (
            <>
              <div className="space-y-3">
                {settlements.data.map((s) => {
                  const StatusIcon = STATUS_ICONS[s.status] ?? Clock;
                  const pharmacyRel = (
                    s as { wallet?: { pharmacy?: { name?: unknown } } }
                  ).wallet?.pharmacy?.name as
                    | { ar: string; en: string }
                    | string
                    | undefined;
                  return (
                    <div
                      key={s.id}
                      className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-full bg-muted"
                          aria-hidden="true"
                        >
                          <StatusIcon className="size-5" />
                        </span>
                        <div className="space-y-1">
                          <p className="font-semibold">
                            <Currency amount={s.amount} />
                          </p>
                          {pharmacyRel ? (
                            <p className="text-sm text-muted-foreground">
                              {t("admin.settlements.pharmacy")}:{" "}
                              {getLocalizedText(pharmacyRel, locale)}
                            </p>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            {t("admin.settlements.requestDate")}:{" "}
                            {new Date(s.createdAt).toLocaleString(
                              locale === "ar" ? "ar-EG" : "en-US",
                            )}
                          </p>
                          {s.notes ? (
                            <p className="text-xs text-muted-foreground">
                              {t("admin.settlements.notes")}: {s.notes}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <SettlementStatusBadge status={s.status} />
                        {s.status === SettlementStatus.PENDING ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="min-h-[44px] sm:min-h-9"
                            onClick={() =>
                              openProcessDialog(
                                s.id,
                                SettlementStatus.PROCESSING,
                              )
                            }
                          >
                            <RefreshCw
                              className="me-1 size-3"
                              aria-hidden="true"
                            />
                            {t("admin.settlements.markProcessing")}
                          </Button>
                        ) : null}
                        {s.status === SettlementStatus.PROCESSING ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="min-h-[44px] sm:min-h-9"
                              onClick={() =>
                                openProcessDialog(
                                  s.id,
                                  SettlementStatus.COMPLETED,
                                )
                              }
                            >
                              <CheckCircle
                                className="me-1 size-3"
                                aria-hidden="true"
                              />
                              {t("admin.settlements.markCompleted")}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="min-h-[44px] sm:min-h-9"
                              onClick={() =>
                                openProcessDialog(s.id, SettlementStatus.FAILED)
                              }
                            >
                              <XCircle
                                className="me-1 size-3"
                                aria-hidden="true"
                              />
                              {t("admin.settlements.markFailed")}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {settlements.meta && (
                <div className="mt-4">
                  <PaginationControls
                    meta={settlements.meta}
                    page={page}
                    onPageChange={setPage}
                    limit={limit}
                    onLimitChange={(newLimit) => {
                      setLimit(newLimit);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Process Settlement Dialog */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t("admin.settlements.processSettlement")}
            </DialogTitle>
            <DialogDescription>
              {processStatus === SettlementStatus.COMPLETED
                ? t("admin.settlements.completeConfirm")
                : processStatus === SettlementStatus.FAILED
                  ? t("admin.settlements.failConfirm")
                  : t("admin.settlements.processConfirm")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("admin.settlements.adminNotes")}</Label>
              <Textarea
                value={processNotes}
                onChange={(e) => setProcessNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProcessOpen(false)}
              disabled={processSettlement.isPending}
              className="min-h-[44px] sm:min-h-9"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant={
                processStatus === SettlementStatus.FAILED
                  ? "destructive"
                  : "default"
              }
              onClick={handleProcess}
              disabled={processSettlement.isPending}
              className="min-h-[44px] sm:min-h-9"
            >
              {processSettlement.isPending ? (
                <Loader2
                  className="me-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : null}
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
