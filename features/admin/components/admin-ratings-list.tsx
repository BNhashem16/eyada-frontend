"use client";

import { useState } from "react";
import {
  Search,
  Frown,
  Loader2,
  Eye,
  Star,
  User,
  Calendar,
  MessageSquare,
  EyeOff,
  Trash2,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  useAdminRatings,
  useAdminRatingStatistics,
  useUpdateAdminRating,
  useDeleteAdminRating,
  AdminRating,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

export function AdminRatingsList() {
  const { t, locale } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [overallRatingFilter, setRatingFilter] = useState<number | undefined>(
    undefined,
  );
  const [isVisible, setIsVisible] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearch = () => {
    setSearch(searchInput || undefined);
    setPage(1);
  };

  const filters = {
    page,
    limit,
    search,
    overallRating: overallRatingFilter,
    isVisible,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const {
    data: ratingsResponse,
    isLoading,
    isError,
  } = useAdminRatings(filters);
  const ratings = ratingsResponse?.data || [];
  const meta = ratingsResponse?.meta;

  const { data: statistics } = useAdminRatingStatistics({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const updateRating = useUpdateAdminRating();
  const deleteRating = useDeleteAdminRating();

  const [selectedRating, setSelectedRating] = useState<AdminRating | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleViewDetails = (rating: AdminRating) => {
    setSelectedRating(rating);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (rating: AdminRating) => {
    setSelectedRating(rating);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteRating = () => {
    if (!selectedRating) return;

    deleteRating.mutate(selectedRating.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedRating(null);
      },
    });
  };

  const handleToggleVisibility = (rating: AdminRating) => {
    updateRating.mutate({
      id: rating.id,
      isVisible: !rating.isVisible,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300 dark:text-gray-500"
            }`}
          />
        ))}
      </div>
    );
  };

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
                  {t("admin.ratings.total")}
                </p>
                <p className="text-2xl font-bold">
                  {statistics?.totalRatings || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.ratings.average")}
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {(statistics?.averageRating || 0).toFixed(1)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400 fill-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.ratings.visible")}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statistics?.visibleRatings || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.ratings.hidden")}
                </p>
                <p className="text-2xl font-bold text-warning-600">
                  {statistics?.hiddenRatings || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder={t("admin.ratings.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                inputMode="search"
                className="max-w-sm"
              />
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap flex-1">
              <Select
                value={overallRatingFilter?.toString() || "all"}
                onValueChange={(value) => {
                  setRatingFilter(
                    value === "all" ? undefined : parseInt(value),
                  );
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue
                    placeholder={t("admin.ratings.filterByRating")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={r.toString()}>
                      {r} {t("admin.ratings.stars")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={isVisible === undefined ? "all" : isVisible.toString()}
                onValueChange={(value) => {
                  setIsVisible(value === "all" ? undefined : value === "true");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder={t("admin.ratings.visibility")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="true">
                    {t("admin.ratings.visibleOnly")}
                  </SelectItem>
                  <SelectItem value="false">
                    {t("admin.ratings.hiddenOnly")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearchInput("");
                setSearch(undefined);
                setRatingFilter(undefined);
                setIsVisible(undefined);
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
            >
              {t("common.clearFilters")}
            </Button>
          </div>

          {showFilters && (
            <div className="flex gap-4 mt-4 pt-4 border-t">
              <div className="flex-1">
                <Label>{t("admin.ratings.dateFrom")}</Label>
                <DatePickerInput
                  value={dateFrom}
                  onChange={(val) => {
                    setDateFrom(val);
                    setPage(1);
                  }}
                  placeholder={t("admin.ratings.dateFrom")}
                />
              </div>
              <div className="flex-1">
                <Label>{t("admin.ratings.dateTo")}</Label>
                <DatePickerInput
                  value={dateTo}
                  onChange={(val) => {
                    setDateTo(val);
                    setPage(1);
                  }}
                  placeholder={t("admin.ratings.dateTo")}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ratings Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("admin.ratings.list")} ({meta?.total || 0})
          </h3>

          {ratings.length === 0 ? (
            <div className="text-center py-10">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {t("admin.ratings.noRatings")}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.ratings.patient")}</TableHead>
                    <TableHead>{t("admin.ratings.doctor")}</TableHead>
                    <TableHead>{t("admin.ratings.rating")}</TableHead>
                    <TableHead>{t("admin.ratings.review")}</TableHead>
                    <TableHead>{t("admin.ratings.date")}</TableHead>
                    <TableHead>{t("admin.ratings.visibility")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {rating.patientProfile?.user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rating.patientProfile?.user.phoneNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {rating.doctorProfile?.user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rating.doctorProfile?.specialty &&
                              getLocalizedText(
                                rating.doctorProfile.specialty.name,
                                locale,
                              )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderStars(Math.round(rating.overallRating))}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {rating.review ? (
                          <p className="truncate text-sm">{rating.review}</p>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(rating.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rating.isVisible}
                            onCheckedChange={() =>
                              handleToggleVisibility(rating)
                            }
                            disabled={updateRating.isPending}
                          />
                          <Badge
                            variant={rating.isVisible ? "success" : "secondary"}
                          >
                            {rating.isVisible
                              ? t("admin.ratings.visibleLabel")
                              : t("admin.ratings.hiddenLabel")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(rating)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-error-600"
                            onClick={() => handleOpenDelete(rating)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
            <DialogTitle>{t("admin.ratings.details")}</DialogTitle>
            <DialogDescription>
              {selectedRating && formatDate(selectedRating.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedRating && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("admin.ratings.patientInfo")}
                  </h4>
                  <p className="font-medium">
                    {selectedRating.patientProfile?.user.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRating.patientProfile?.user.phoneNumber}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("admin.ratings.doctorInfo")}
                  </h4>
                  <p className="font-medium">
                    {selectedRating.doctorProfile?.user.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRating.doctorProfile?.specialty &&
                      getLocalizedText(
                        selectedRating.doctorProfile.specialty.name,
                        locale,
                      )}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("admin.ratings.rating")}
                    </p>
                    {renderStars(Math.round(selectedRating.overallRating))}
                    <div className="flex flex-wrap gap-3 text-xs mt-2">
                      {[
                        {
                          label: t("rating.doctorExpertise"),
                          value: selectedRating.doctorRating,
                        },
                        {
                          label: t("rating.communicationExplanation"),
                          value: selectedRating.communicationRating,
                        },
                        {
                          label: t("rating.waitTime"),
                          value: selectedRating.waitTimeRating,
                        },
                      ].map((c) => (
                        <div key={c.label} className="flex items-center gap-1">
                          <span className="text-muted-foreground">
                            {c.label}:
                          </span>
                          <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                          <span className="font-medium">{c.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("admin.ratings.visibility")}
                    </p>
                    <Badge
                      variant={
                        selectedRating.isVisible ? "success" : "secondary"
                      }
                    >
                      {selectedRating.isVisible
                        ? t("admin.ratings.visibleLabel")
                        : t("admin.ratings.hiddenLabel")}
                    </Badge>
                  </div>
                </div>

                {selectedRating.review && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {t("admin.ratings.review")}
                    </p>
                    <p className="bg-muted/50 p-3 rounded-lg text-sm">
                      {selectedRating.review}
                    </p>
                  </div>
                )}
              </div>

              {selectedRating.appointment && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">
                    {t("admin.ratings.appointmentInfo")}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.ratings.bookingNumber")}
                      </p>
                      <p className="font-mono text-sm">
                        {selectedRating.appointment.bookingNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.ratings.appointmentDate")}
                      </p>
                      <p className="text-sm">
                        {formatDate(selectedRating.appointment.appointmentDate)}
                      </p>
                    </div>
                    {selectedRating.appointment.clinic && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">
                          {t("admin.ratings.clinic")}
                        </p>
                        <p className="text-sm">
                          {getLocalizedText(
                            selectedRating.appointment.clinic.name,
                            locale,
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.ratings.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.ratings.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRating}
              className="bg-error-600 hover:bg-error-700"
              disabled={deleteRating.isPending}
            >
              {deleteRating.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
