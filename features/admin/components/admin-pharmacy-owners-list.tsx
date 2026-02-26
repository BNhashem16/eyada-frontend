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
import { Skeleton } from "@/components/ui/skeleton";
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
  const statusConfig = useMemo(() => getStatusConfig(t), [t]);

  // Filters state
  const [filters, setFilters] = useState<AdminPharmacyOwnerFilters>({
    page: 1,
    limit: 30,
  });
  const [searchInput, setSearchInput] = useState("");

  // Queries
  const { data, isLoading, isError, error } = useAdminPharmacyOwners(filters);

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

  const handleAction = () => {
    if (!selectedOwner || !action) return;

    const callbacks = {
      onSuccess: () => {
        setSelectedOwner(null);
        setAction(null);
      },
    };

    switch (action) {
      case "approve":
        approveOwner.mutate(selectedOwner, callbacks);
        break;
      case "reject":
        rejectOwner.mutate(selectedOwner, callbacks);
        break;
      case "suspend":
        suspendOwner.mutate(selectedOwner, callbacks);
        break;
    }
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
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-error-500 mb-4" />
          <p className="text-error-600 dark:text-error-400">
            {t("admin.loadError")}
          </p>
          <p className="text-sm text-error-500 mt-2">
            {error instanceof Error ? error.message : t("common.unknownError")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const owners = data?.data || [];
  const meta = data?.meta;

  return (
    <>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={t("admin.pharmacyOwners.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                inputMode="search"
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
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
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("admin.pharmacyOwners.noOwnersFound")}
            </h3>
            <p className="text-muted-foreground">
              {t("admin.pharmacyOwners.noOwnersMatchFilters")}
            </p>
          </CardContent>
        </Card>
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

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedOwner && !!action}
        onOpenChange={() => {
          setSelectedOwner(null);
          setAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" && t("admin.pharmacyOwners.confirmApprove")}
              {action === "reject" && t("admin.pharmacyOwners.confirmReject")}
              {action === "suspend" && t("admin.pharmacyOwners.confirmSuspend")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve" && t("admin.pharmacyOwners.approveMessage")}
              {action === "reject" && t("admin.pharmacyOwners.rejectMessage")}
              {action === "suspend" && t("admin.pharmacyOwners.suspendMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : action === "suspend"
                    ? "bg-warning-600 hover:bg-warning-700"
                    : "bg-error-600 hover:bg-error-700"
              }
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {action === "approve" && t("admin.approve")}
              {action === "reject" && t("admin.reject")}
              {action === "suspend" && t("admin.suspend")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
