"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Store,
  Phone,
  CheckCircle,
  XCircle,
  Search,
  Ban,
  UserCheck,
  Clock,
  Eye,
  Package,
  ShoppingCart,
  MapPin,
  User,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  ConfirmDialog,
  ListSkeleton,
  PharmacyEmptyState,
  PharmacyErrorState,
  RefreshButton,
} from "@/components/pharmacy";
import {
  useAdminPharmacies,
  useApprovePharmacy,
  useRejectPharmacy,
  useSuspendPharmacy,
  AdminPharmacyFilters,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { PharmacyStatus } from "@/types/enums";
import { adminPharmacyKeys } from "@/lib/query-keys";

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
  const queryClient = useQueryClient();
  const statusConfig = useMemo(() => getStatusConfig(t), [t]);

  const [filters, setFilters] = useState<AdminPharmacyFilters>({
    page: 1,
    limit: 30,
  });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError } = useAdminPharmacies(filters);

  const approvePharmacy = useApprovePharmacy();
  const rejectPharmacy = useRejectPharmacy();
  const suspendPharmacy = useSuspendPharmacy();

  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "suspend" | null>(
    null,
  );

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleFilterChange = useCallback(
    (
      key: keyof AdminPharmacyFilters,
      value: AdminPharmacyFilters[typeof key] | "all",
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
        page: 1,
      }));
    },
    [],
  );

  const handleRefresh = useMemo(
    () => async () => {
      await queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.all,
      });
    },
    [queryClient],
  );

  const confirmAction = async () => {
    if (!selectedPharmacy || !action) return;
    if (action === "approve")
      await approvePharmacy.mutateAsync(selectedPharmacy);
    if (action === "reject") await rejectPharmacy.mutateAsync(selectedPharmacy);
    if (action === "suspend")
      await suspendPharmacy.mutateAsync(selectedPharmacy);
    setSelectedPharmacy(null);
    setAction(null);
  };

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
    return <ListSkeleton rows={5} />;
  }

  if (isError) {
    return <PharmacyErrorState onRetry={handleRefresh} />;
  }

  const pharmacies = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sticky filter bar (mobile) */}
      <Card className="sticky top-0 z-10 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:bg-card sm:backdrop-blur-none">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder={t("admin.pharmacies.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                inputMode="search"
                className="min-h-[44px] flex-1 sm:min-h-9"
                aria-label={t("admin.pharmacies.searchPlaceholder")}
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
        <PharmacyEmptyState
          icon={Store}
          title={t("admin.pharmacies.noPharmaciesFound")}
          description={t("admin.pharmacies.noPharmaciesMatchFilters")}
        />
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
                    <div className="mt-4 flex flex-wrap gap-2 md:mt-0 md:flex-nowrap">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="min-h-[44px] sm:min-h-9"
                      >
                        <Link href={`/admin/pharmacies/${pharmacy.id}`}>
                          <Eye className="me-1 size-4" aria-hidden="true" />
                          {t("common.viewDetails")}
                        </Link>
                      </Button>
                      {pharmacy.ownerProfile?.status ===
                      PharmacyStatus.PENDING ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPharmacy(pharmacy.id);
                              setAction("approve");
                            }}
                            className="min-h-[44px] bg-success-700 hover:bg-success-800 sm:min-h-9"
                          >
                            <CheckCircle
                              className="me-1 size-4"
                              aria-hidden="true"
                            />
                            {t("admin.approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPharmacy(pharmacy.id);
                              setAction("reject");
                            }}
                            className="min-h-[44px] border-error-300 text-error-600 hover:bg-error-50 sm:min-h-9"
                          >
                            <XCircle
                              className="me-1 size-4"
                              aria-hidden="true"
                            />
                            {t("admin.reject")}
                          </Button>
                        </>
                      ) : null}
                      {pharmacy.ownerProfile?.status ===
                      PharmacyStatus.APPROVED ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPharmacy(pharmacy.id);
                            setAction("suspend");
                          }}
                          className="min-h-[44px] border-warning-300 text-warning-700 hover:bg-warning-50 sm:min-h-9"
                        >
                          <Ban className="me-1 size-4" aria-hidden="true" />
                          {t("admin.suspend")}
                        </Button>
                      ) : null}
                      {pharmacy.ownerProfile?.status ===
                        PharmacyStatus.REJECTED ||
                      pharmacy.ownerProfile?.status ===
                        PharmacyStatus.SUSPENDED ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPharmacy(pharmacy.id);
                            setAction("approve");
                          }}
                          className="min-h-[44px] bg-success-700 hover:bg-success-800 sm:min-h-9"
                        >
                          <CheckCircle
                            className="me-1 size-4"
                            aria-hidden="true"
                          />
                          {t("admin.pharmacies.reactivate")}
                        </Button>
                      ) : null}
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
        open={!!selectedPharmacy && !!action}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPharmacy(null);
            setAction(null);
          }
        }}
        title={
          action === "approve"
            ? t("admin.pharmacies.confirmApprove")
            : action === "reject"
              ? t("admin.pharmacies.confirmReject")
              : action === "suspend"
                ? t("admin.pharmacies.confirmSuspend")
                : ""
        }
        description={
          action === "approve"
            ? t("admin.pharmacies.approveMessage")
            : action === "reject"
              ? t("admin.pharmacies.rejectMessage")
              : action === "suspend"
                ? t("admin.pharmacies.suspendMessage")
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
