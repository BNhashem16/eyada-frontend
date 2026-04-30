"use client";

import { useState, useMemo, useCallback } from "react";
import {
  UserCheck,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Ban,
  Clock,
  AlertTriangle,
  Store,
  Briefcase,
  FileText,
  Hash,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ConfirmDialog,
  ListSkeleton,
  PharmacyEmptyState,
  PharmacyErrorState,
  RefreshButton,
} from "@/components/pharmacy";
import { useQueryClient } from "@tanstack/react-query";
import { adminPharmacyKeys } from "@/lib/query-keys";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
  useAdminPharmacyOwners,
  useApprovePharmacyOwner,
  useRejectPharmacyOwner,
  useSuspendPharmacyOwner,
  AdminPharmacyOwnerFilters,
} from "../hooks";

import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { PharmacyStatus } from "@/types/enums";

const getStatusConfig = (
  t: (key: string) => string,
): Record<
  PharmacyStatus,
  {
    label: string;
    variant: "warning" | "success" | "error" | "secondary";
    icon: typeof Clock;
  }
> => ({
  [PharmacyStatus.PENDING]: {
    label: t("admin.pharmacyOwners.underReview"),
    variant: "warning",
    icon: Clock,
  },
  [PharmacyStatus.APPROVED]: {
    label: t("admin.pharmacyOwners.approved"),
    variant: "success",
    icon: UserCheck,
  },
  [PharmacyStatus.REJECTED]: {
    label: t("admin.pharmacyOwners.rejected"),
    variant: "error",
    icon: XCircle,
  },
  [PharmacyStatus.SUSPENDED]: {
    label: t("admin.pharmacyOwners.suspended"),
    variant: "error",
    icon: Ban,
  },
});

export function AdminPharmacyOwnersList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const statusConfig = useMemo(() => getStatusConfig(t), [t]);

  // Filters state
  const [filters, setFilters] = useState<AdminPharmacyOwnerFilters>({
    page: 1,
    limit: 30,
  });
  const [searchInput, setSearchInput] = useState("");

  // Queries
  const { data, isLoading, isError } = useAdminPharmacyOwners(filters);

  const handleRefresh = useMemo(
    () => async () => {
      await queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.owners(),
      });
    },
    [queryClient],
  );

  // Mutations
  const approveOwner = useApprovePharmacyOwner();
  const rejectOwner = useRejectPharmacyOwner();
  const suspendOwner = useSuspendPharmacyOwner();

  // Dialog state
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "suspend" | null>(
    null,
  );

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleFilterChange = useCallback(
    (key: keyof AdminPharmacyOwnerFilters, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
        page: 1,
      }));
    },
    [],
  );

  const confirmAction = async () => {
    if (!selectedOwner || !action) return;
    if (action === "approve") await approveOwner.mutateAsync(selectedOwner);
    if (action === "reject") await rejectOwner.mutateAsync(selectedOwner);
    if (action === "suspend") await suspendOwner.mutateAsync(selectedOwner);
    setSelectedOwner(null);
    setAction(null);
  };

  const isPending =
    approveOwner.isPending || rejectOwner.isPending || suspendOwner.isPending;

  const statusFilterOptions = useMemo(
    () => [
      {
        value: "",
        label: t("admin.pharmacyOwners.allStatuses"),
        icon: <Clock className="h-4 w-4" />,
      },
      {
        value: PharmacyStatus.PENDING,
        label: t("admin.pharmacyOwners.underReview"),
        icon: <Clock className="h-4 w-4 text-warning-500" />,
      },
      {
        value: PharmacyStatus.APPROVED,
        label: t("admin.pharmacyOwners.approved"),
        icon: <UserCheck className="h-4 w-4 text-success-500" />,
      },
      {
        value: PharmacyStatus.REJECTED,
        label: t("admin.pharmacyOwners.rejected"),
        icon: <XCircle className="h-4 w-4 text-error-500" />,
      },
      {
        value: PharmacyStatus.SUSPENDED,
        label: t("admin.pharmacyOwners.suspended"),
        icon: <Ban className="h-4 w-4 text-error-500" />,
      },
    ],
    [t],
  );

  if (isLoading) {
    return <ListSkeleton rows={5} />;
  }

  if (isError) {
    return <PharmacyErrorState onRetry={handleRefresh} />;
  }

  const owners = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sticky filter bar (mobile) */}
      <Card className="sticky top-0 z-10 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:bg-card sm:backdrop-blur-none">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder={t("admin.pharmacyOwners.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                inputMode="search"
                className="min-h-[44px] flex-1 sm:min-h-9"
                aria-label={t("admin.pharmacyOwners.searchPlaceholder")}
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

            {/* Status Filter */}
            <SearchableSelect
              options={statusFilterOptions}
              value={filters.status || ""}
              onValueChange={(value) =>
                handleFilterChange("status", value || undefined)
              }
              placeholder={t("appointments.status")}
              showSearch={false}
              className="w-full sm:w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {meta && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {t("admin.pharmacyOwners.totalResults")}{" "}
            <span className="font-semibold">{meta.total}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t("admin.pharmacyOwners.pageOf")
              .replace("{current}", String(meta.page))
              .replace("{total}", String(meta.totalPages))}
          </p>
        </div>
      )}

      {/* Owners List */}
      {owners.length === 0 ? (
        <PharmacyEmptyState
          icon={Briefcase}
          title={t("admin.pharmacyOwners.noOwnersFound")}
          description={t("admin.pharmacyOwners.noOwnersMatchFilters")}
        />
      ) : (
        <div className="space-y-4">
          {owners.map((owner) => {
            const statusInfo =
              statusConfig[owner.status as PharmacyStatus] ||
              statusConfig[PharmacyStatus.PENDING];
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={owner.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Icon */}
                    <div className="h-16 w-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <Briefcase className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">
                          {owner.user?.fullName || owner.businessName}
                        </h3>
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon className="h-3 w-3 me-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          {t("admin.pharmacyOwners.businessName")}:{" "}
                          {owner.businessName}
                        </span>
                        {owner.user?.email && (
                          <span className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {owner.user.email}
                          </span>
                        )}
                        {owner.user?.phoneNumber && (
                          <a
                            href={`tel:${owner.user.phoneNumber}`}
                            className="flex items-center gap-2 hover:text-primary-600"
                            dir="ltr"
                          >
                            <Phone className="h-4 w-4" />
                            {owner.user.phoneNumber}
                          </a>
                        )}
                        {owner.businessLicense && (
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {t("admin.pharmacyOwners.businessLicense")}:{" "}
                            {owner.businessLicense}
                          </span>
                        )}
                        {owner.taxNumber && (
                          <span className="flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            {t("admin.pharmacyOwners.taxNumber")}:{" "}
                            {owner.taxNumber}
                          </span>
                        )}
                        {owner._count?.pharmacies !== undefined && (
                          <span className="flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            {owner._count.pharmacies}{" "}
                            {t("admin.pharmacyOwners.pharmacyCount")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap md:flex-nowrap mt-4 md:mt-0">
                      {owner.status === PharmacyStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOwner(owner.id);
                              setAction("approve");
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 me-1" />
                            {t("admin.approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOwner(owner.id);
                              setAction("reject");
                            }}
                            className="text-error-600 border-error-300 hover:bg-error-50"
                          >
                            <XCircle className="h-4 w-4 me-1" />
                            {t("admin.reject")}
                          </Button>
                        </>
                      )}
                      {owner.status === PharmacyStatus.APPROVED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOwner(owner.id);
                            setAction("suspend");
                          }}
                          className="text-warning-600 border-warning-300 hover:bg-warning-50"
                        >
                          <Ban className="h-4 w-4 me-1" />
                          {t("admin.suspend")}
                        </Button>
                      )}
                      {(owner.status === PharmacyStatus.REJECTED ||
                        owner.status === PharmacyStatus.SUSPENDED) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOwner(owner.id);
                            setAction("approve");
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 me-1" />
                          {t("admin.pharmacyOwners.reactivate")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PaginationControls
        meta={meta}
        page={filters.page || 1}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        limit={filters.limit || 30}
        onLimitChange={(l) =>
          setFilters((prev) => ({ ...prev, limit: l, page: 1 }))
        }
      />

      <ConfirmDialog
        open={!!selectedOwner && !!action}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOwner(null);
            setAction(null);
          }
        }}
        title={
          action === "approve"
            ? t("admin.pharmacyOwners.confirmApprove")
            : action === "reject"
              ? t("admin.pharmacyOwners.confirmReject")
              : action === "suspend"
                ? t("admin.pharmacyOwners.confirmSuspend")
                : ""
        }
        description={
          action === "approve"
            ? t("admin.pharmacyOwners.approveMessage")
            : action === "reject"
              ? t("admin.pharmacyOwners.rejectMessage")
              : action === "suspend"
                ? t("admin.pharmacyOwners.suspendMessage")
                : undefined
        }
        confirmLabel={
          action === "approve"
            ? t("admin.approve")
            : action === "reject"
              ? t("admin.reject")
              : action === "suspend"
                ? t("admin.suspend")
                : t("common.confirm")
        }
        tone={action === "approve" ? "default" : "destructive"}
        onConfirm={confirmAction}
      />
    </div>
  );
}
