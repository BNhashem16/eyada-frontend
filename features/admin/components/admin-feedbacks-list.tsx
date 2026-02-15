"use client";

import { useState } from "react";
import {
  Frown,
  Loader2,
  Eye,
  Calendar,
  AlertCircle,
  Lightbulb,
  Mail,
  Phone,
  User,
  MessageSquare,
  ClipboardCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminFeedbacks,
  useUpdateFeedbackStatus,
  type AdminFeedback,
  type FeedbackType,
  type FeedbackStatus,
} from "../hooks";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  NEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  IN_REVIEW:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  RESOLVED:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const TYPE_COLORS: Record<FeedbackType, string> = {
  COMPLAINT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  SUGGESTION:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export function AdminFeedbacksList() {
  const { t, locale } = useTranslation();
  const [typeFilter, setTypeFilter] = useState<FeedbackType | undefined>(
    undefined,
  );
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [selectedFeedback, setSelectedFeedback] =
    useState<AdminFeedback | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<FeedbackStatus>("IN_REVIEW");
  const [adminNotes, setAdminNotes] = useState("");

  const filters = {
    page,
    limit,
    type: typeFilter,
    status: statusFilter,
  };

  const {
    data: feedbacksResponse,
    isLoading,
    isError,
  } = useAdminFeedbacks(filters);
  const feedbacks = feedbacksResponse?.data || [];
  const meta = feedbacksResponse?.meta;

  const updateStatus = useUpdateFeedbackStatus();

  const getStatusLabel = (status: FeedbackStatus) => {
    const labels: Record<FeedbackStatus, string> = {
      NEW: t("admin.feedbacks.new"),
      IN_REVIEW: t("admin.feedbacks.inReview"),
      RESOLVED: t("admin.feedbacks.resolved"),
      REJECTED: t("admin.feedbacks.rejected"),
    };
    return labels[status];
  };

  const getTypeLabel = (type: FeedbackType) => {
    return type === "COMPLAINT"
      ? t("admin.feedbacks.complaint")
      : t("admin.feedbacks.suggestion");
  };

  const handleViewDetails = (feedback: AdminFeedback) => {
    setSelectedFeedback(feedback);
    setIsDetailsOpen(true);
  };

  const handleOpenStatusDialog = (feedback: AdminFeedback) => {
    setSelectedFeedback(feedback);
    setNewStatus(feedback.status === "NEW" ? "IN_REVIEW" : feedback.status);
    setAdminNotes(feedback.adminNotes || "");
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedFeedback) return;

    updateStatus.mutate(
      {
        id: selectedFeedback.id,
        status: newStatus,
        adminNotes: adminNotes || undefined,
      },
      {
        onSuccess: () => {
          setIsStatusDialogOpen(false);
          setSelectedFeedback(null);
          setAdminNotes("");
        },
      },
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  // Count stats from current page data (or show meta total)
  const totalCount = meta?.total || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("errors.loadError")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.feedbacks.total")}
                </p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.feedbacks.complaints")}
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {feedbacks.filter((f) => f.type === "COMPLAINT").length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.feedbacks.suggestions")}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {feedbacks.filter((f) => f.type === "SUGGESTION").length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.feedbacks.newCount")}
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {feedbacks.filter((f) => f.status === "NEW").length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-wrap flex-1">
              <Select
                value={typeFilter || "all"}
                onValueChange={(value) => {
                  setTypeFilter(
                    value === "all" ? undefined : (value as FeedbackType),
                  );
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue
                    placeholder={t("admin.feedbacks.filterByType")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.feedbacks.allTypes")}
                  </SelectItem>
                  <SelectItem value="COMPLAINT">
                    {t("admin.feedbacks.complaint")}
                  </SelectItem>
                  <SelectItem value="SUGGESTION">
                    {t("admin.feedbacks.suggestion")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter || "all"}
                onValueChange={(value) => {
                  setStatusFilter(
                    value === "all" ? undefined : (value as FeedbackStatus),
                  );
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue
                    placeholder={t("admin.feedbacks.filterByStatus")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.feedbacks.allStatuses")}
                  </SelectItem>
                  <SelectItem value="NEW">
                    {t("admin.feedbacks.new")}
                  </SelectItem>
                  <SelectItem value="IN_REVIEW">
                    {t("admin.feedbacks.inReview")}
                  </SelectItem>
                  <SelectItem value="RESOLVED">
                    {t("admin.feedbacks.resolved")}
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    {t("admin.feedbacks.rejected")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setTypeFilter(undefined);
                setStatusFilter(undefined);
                setPage(1);
              }}
            >
              {t("common.clearFilters")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("admin.feedbacks.list")} ({totalCount})
          </h3>

          {feedbacks.length === 0 ? (
            <div className="text-center py-10">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {t("admin.feedbacks.noFeedbacks")}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6 px-6">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.feedbacks.type")}</TableHead>
                    <TableHead>{t("admin.feedbacks.name")}</TableHead>
                    <TableHead>{t("admin.feedbacks.content")}</TableHead>
                    <TableHead>{t("admin.feedbacks.contactInfo")}</TableHead>
                    <TableHead>{t("admin.feedbacks.date")}</TableHead>
                    <TableHead>{t("admin.feedbacks.status")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <Badge className={TYPE_COLORS[feedback.type]}>
                          {feedback.type === "COMPLAINT" ? (
                            <AlertCircle className="h-3 w-3 me-1" />
                          ) : (
                            <Lightbulb className="h-3 w-3 me-1" />
                          )}
                          {getTypeLabel(feedback.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{feedback.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm">{feedback.content}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {feedback.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">
                                {feedback.email}
                              </span>
                            </div>
                          )}
                          {feedback.phone && (
                            <div
                              className="flex items-center gap-1 text-muted-foreground"
                              dir="ltr"
                            >
                              <Phone className="h-3 w-3" />
                              {feedback.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(feedback.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[feedback.status]}>
                          {getStatusLabel(feedback.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(feedback)}
                            title={t("admin.feedbacks.details")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenStatusDialog(feedback)}
                            title={t("admin.feedbacks.changeStatus")}
                          >
                            <ClipboardCheck className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              <PaginationControls
                meta={meta}
                page={page}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={(v) => {
                  setLimit(v);
                  setPage(1);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.feedbacks.details")}</DialogTitle>
            <DialogDescription>
              {selectedFeedback && formatDate(selectedFeedback.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              {/* Type & Status */}
              <div className="flex items-center gap-3">
                <Badge className={TYPE_COLORS[selectedFeedback.type]}>
                  {selectedFeedback.type === "COMPLAINT" ? (
                    <AlertCircle className="h-3 w-3 me-1" />
                  ) : (
                    <Lightbulb className="h-3 w-3 me-1" />
                  )}
                  {getTypeLabel(selectedFeedback.type)}
                </Badge>
                <Badge className={STATUS_COLORS[selectedFeedback.status]}>
                  {getStatusLabel(selectedFeedback.status)}
                </Badge>
              </div>

              {/* Sender Info */}
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {selectedFeedback.name}
                </h4>
                <div className="flex flex-col gap-1">
                  {selectedFeedback.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {selectedFeedback.email}
                    </div>
                  )}
                  {selectedFeedback.phone && (
                    <div
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                      dir="ltr"
                    >
                      <Phone className="h-4 w-4" />
                      {selectedFeedback.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {t("admin.feedbacks.content")}
                </p>
                <p className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedFeedback.content}
                </p>
              </div>

              {/* Admin Notes */}
              {selectedFeedback.adminNotes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("admin.feedbacks.adminNotes")}
                  </p>
                  <p className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg text-sm border border-yellow-200 dark:border-yellow-800">
                    {selectedFeedback.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              {t("common.close")}
            </Button>
            {selectedFeedback && (
              <Button
                onClick={() => {
                  setIsDetailsOpen(false);
                  handleOpenStatusDialog(selectedFeedback);
                }}
              >
                {t("admin.feedbacks.changeStatus")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.feedbacks.changeStatus")}</DialogTitle>
            <DialogDescription>
              {selectedFeedback && (
                <>
                  {getTypeLabel(selectedFeedback.type)} -{" "}
                  {selectedFeedback.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("admin.feedbacks.status")}</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as FeedbackStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">
                    {t("admin.feedbacks.new")}
                  </SelectItem>
                  <SelectItem value="IN_REVIEW">
                    {t("admin.feedbacks.inReview")}
                  </SelectItem>
                  <SelectItem value="RESOLVED">
                    {t("admin.feedbacks.resolved")}
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    {t("admin.feedbacks.rejected")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("admin.feedbacks.adminNotes")}</Label>
              <Textarea
                placeholder={t("admin.feedbacks.adminNotesPlaceholder")}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("admin.feedbacks.updateStatus")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
