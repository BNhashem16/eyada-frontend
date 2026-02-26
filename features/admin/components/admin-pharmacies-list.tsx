"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Store,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Ban,
  UserCheck,
  Clock,
  AlertTriangle,
  Eye,
  Package,
  ShoppingCart,
  MapPin,
  User,
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
  useAdminPharmacies,
  useAdminPharmacy,
  useApprovePharmacy,
  useRejectPharmacy,
  useSuspendPharmacy,
  AdminPharmacyFilters,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
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
    label: t("admin.pharmacies.underReview"),
    variant: "warning",
    icon: Clock,
  },
  [PharmacyStatus.APPROVED]: {
    label: t("admin.pharmacies.approved"),
    variant: "success",
    icon: UserCheck,
  },
  [PharmacyStatus.REJECTED]: {
    label: t("admin.pharmacies.rejected"),
    variant: "error",
    icon: XCircle,
  },
  [PharmacyStatus.SUSPENDED]: {
    label: t("admin.pharmacies.suspended"),
    variant: "error",
    icon: Ban,
  },
});

export function AdminPharmaciesList() {
  const { t, locale } = useTranslation();
  const statusConfig = useMemo(() => getStatusConfig(t), [t]);

  // Filters state
  const [filters, setFilters] = useState<AdminPharmacyFilters>({
    page: 1,
    limit: 30,
  });
  const [searchInput, setSearchInput] = useState("");

  // Queries
  const { data, isLoading, isError, error } = useAdminPharmacies(filters);

  // Mutations
  const approvePharmacy = useApprovePharmacy();
  const rejectPharmacy = useRejectPharmacy();
  const suspendPharmacy = useSuspendPharmacy();

  // Dialog state
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "suspend" | null>(
    null,
  );

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleFilterChange = useCallback(
    (key: keyof AdminPharmacyFilters, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
        page: 1,
      }));
    },
    [],
  );

  const handleAction = () => {
    if (!selectedPharmacy || !action) return;

    const callbacks = {
      onSuccess: () => {
        setSelectedPharmacy(null);
        setAction(null);
      },
    };

    switch (action) {
      case "approve":
        approvePharmacy.mutate(selectedPharmacy, callbacks);
        break;
      case "reject":
        rejectPharmacy.mutate(selectedPharmacy, callbacks);
        break;
      case "suspend":
        suspendPharmacy.mutate(selectedPharmacy, callbacks);
        break;
    }
  };

  const isPending =
    approvePharmacy.isPending ||
    rejectPharmacy.isPending ||
    suspendPharmacy.isPending;

  const statusFilterOptions = useMemo(
    () => [
      {
        value: "",
        label: t("admin.pharmacies.allStatuses"),
        icon: <Clock className="h-4 w-4" />,
      },
      {
        value: PharmacyStatus.PENDING,
        label: t("admin.pharmacies.underReview"),
        icon: <Clock className="h-4 w-4 text-warning-500" />,
      },
      {
        value: PharmacyStatus.APPROVED,
        label: t("admin.pharmacies.approved"),
        icon: <UserCheck className="h-4 w-4 text-success-500" />,
      },
      {
        value: PharmacyStatus.REJECTED,
        label: t("admin.pharmacies.rejected"),
        icon: <XCircle className="h-4 w-4 text-error-500" />,
      },
      {
        value: PharmacyStatus.SUSPENDED,
        label: t("admin.pharmacies.suspended"),
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

  const pharmacies = data?.data || [];
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
                placeholder={t("admin.pharmacies.searchPlaceholder")}
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
            {t("admin.pharmacies.totalResults")}{" "}
            <span className="font-semibold">{meta.total}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t("admin.pharmacies.pageOf")
              .replace("{current}", String(meta.page))
              .replace("{total}", String(meta.totalPages))}
          </p>
        </div>
      )}

      {/* Pharmacies List */}
      {pharmacies.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Store className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("admin.pharmacies.noPharmaciesFound")}
            </h3>
            <p className="text-muted-foreground">
              {t("admin.pharmacies.noPharmaciesMatchFilters")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pharmacies.map((pharmacy) => {
            const statusInfo =
              statusConfig[
                (pharmacy.ownerProfile?.status as PharmacyStatus) ||
                  PharmacyStatus.PENDING
              ];
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={pharmacy.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Icon */}
                    <div className="h-16 w-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <Store className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">
                          {getLocalizedText(pharmacy.name, locale)}
                        </h3>
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon className="h-3 w-3 me-1" />
                          {statusInfo.label}
                        </Badge>
                        {!pharmacy.isActive && (
                          <Badge variant="secondary">
                            {t("common.inactive")}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        {pharmacy.ownerProfile?.user?.fullName && (
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t("admin.pharmacies.owner")}:{" "}
                            {pharmacy.ownerProfile.user.fullName}
                          </span>
                        )}
                        {pharmacy.city && (
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {getLocalizedText(pharmacy.city.name, locale)}
                          </span>
                        )}
                        {pharmacy.phoneNumbers?.[0] && (
                          <a
                            href={`tel:${pharmacy.phoneNumbers[0]}`}
                            className="flex items-center gap-2 hover:text-primary-600"
                            dir="ltr"
                          >
                            <Phone className="h-4 w-4" />
                            {pharmacy.phoneNumbers[0]}
                          </a>
                        )}
                        <div className="flex items-center gap-4">
                          {pharmacy._count?.products !== undefined && (
                            <span className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              {pharmacy._count.products}{" "}
                              {t("admin.pharmacies.productCount")}
                            </span>
                          )}
                          {pharmacy._count?.orders !== undefined && (
                            <span className="flex items-center gap-1">
                              <ShoppingCart className="h-4 w-4" />
                              {pharmacy._count.orders}{" "}
                              {t("admin.pharmacies.orderCount")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap md:flex-nowrap mt-4 md:mt-0">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/pharmacies/${pharmacy.id}`}>
                          <Eye className="h-4 w-4 me-1" />
                          {t("common.viewDetails")}
                        </Link>
                      </Button>
                      {pharmacy.ownerProfile?.status ===
                        PharmacyStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPharmacy(pharmacy.id);
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
                              setSelectedPharmacy(pharmacy.id);
                              setAction("reject");
                            }}
                            className="text-error-600 border-error-300 hover:bg-error-50"
                          >
                            <XCircle className="h-4 w-4 me-1" />
                            {t("admin.reject")}
                          </Button>
                        </>
                      )}
                      {pharmacy.ownerProfile?.status ===
                        PharmacyStatus.APPROVED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPharmacy(pharmacy.id);
                            setAction("suspend");
                          }}
                          className="text-warning-600 border-warning-300 hover:bg-warning-50"
                        >
                          <Ban className="h-4 w-4 me-1" />
                          {t("admin.suspend")}
                        </Button>
                      )}
                      {(pharmacy.ownerProfile?.status ===
                        PharmacyStatus.REJECTED ||
                        pharmacy.ownerProfile?.status ===
                          PharmacyStatus.SUSPENDED) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPharmacy(pharmacy.id);
                            setAction("approve");
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 me-1" />
                          {t("admin.pharmacies.reactivate")}
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
        open={!!selectedPharmacy && !!action}
        onOpenChange={() => {
          setSelectedPharmacy(null);
          setAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" && t("admin.pharmacies.confirmApprove")}
              {action === "reject" && t("admin.pharmacies.confirmReject")}
              {action === "suspend" && t("admin.pharmacies.confirmSuspend")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve" && t("admin.pharmacies.approveMessage")}
              {action === "reject" && t("admin.pharmacies.rejectMessage")}
              {action === "suspend" && t("admin.pharmacies.suspendMessage")}
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
