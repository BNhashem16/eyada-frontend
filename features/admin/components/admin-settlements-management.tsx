"use client";

import { useState } from "react";
import {
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAdminSettlements, useProcessSettlement } from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { SettlementStatus } from "@/types";

const STATUS_CONFIG: Record<string, { variant: string; icon: typeof Clock }> = {
  PENDING: { variant: "warning", icon: Clock },
  PROCESSING: { variant: "info", icon: RefreshCw },
  COMPLETED: { variant: "success", icon: CheckCircle },
  FAILED: { variant: "error", icon: XCircle },
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
              <SelectTrigger className="w-48">
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
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !settlements?.data?.length ? (
            <div className="py-8 text-center">
              <RefreshCw className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("admin.settlements.noSettlements")}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {settlements.data.map((s) => {
                  const config =
                    STATUS_CONFIG[s.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={s.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">
                            {Number(s.amount).toFixed(2)} {t("common.egp")}
                          </p>
                          {(s as any).wallet?.pharmacy?.name && (
                            <p className="text-sm text-muted-foreground">
                              {t("admin.settlements.pharmacy")}:{" "}
                              {getLocalizedText(
                                (s as any).wallet.pharmacy.name,
                                locale,
                              )}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {t("admin.settlements.requestDate")}:{" "}
                            {new Date(s.createdAt).toLocaleString(
                              locale === "ar" ? "ar-EG" : "en-US",
                            )}
                          </p>
                          {s.notes && (
                            <p className="text-xs text-muted-foreground">
                              {t("admin.settlements.notes")}: {s.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <Badge variant={config.variant as any}>
                          {t(`admin.settlements.${s.status.toLowerCase()}`)}
                        </Badge>
                        {s.status === SettlementStatus.PENDING && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openProcessDialog(
                                  s.id,
                                  SettlementStatus.PROCESSING,
                                )
                              }
                            >
                              <RefreshCw className="h-3 w-3 me-1" />
                              {t("admin.settlements.markProcessing")}
                            </Button>
                          </div>
                        )}
                        {s.status === SettlementStatus.PROCESSING && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() =>
                                openProcessDialog(
                                  s.id,
                                  SettlementStatus.COMPLETED,
                                )
                              }
                            >
                              <CheckCircle className="h-3 w-3 me-1" />
                              {t("admin.settlements.markCompleted")}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                openProcessDialog(s.id, SettlementStatus.FAILED)
                              }
                            >
                              <XCircle className="h-3 w-3 me-1" />
                              {t("admin.settlements.markFailed")}
                            </Button>
                          </div>
                        )}
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
            <Button variant="outline" onClick={() => setProcessOpen(false)}>
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
            >
              {processSettlement.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
