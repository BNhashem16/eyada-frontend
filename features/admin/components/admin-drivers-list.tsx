"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Truck,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Search,
  Ban,
  Clock,
  Car,
  CreditCard,
  FileText,
  Package,
} from "lucide-react";
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
} from "@/components/pharmacy";
import {
  useAdminDrivers,
  useApproveDriver,
  useRejectDriver,
  useSuspendDriver,
  useActivateDriver,
  AdminDriverFilters,
} from "../hooks";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { DriverStatus } from "@/types/enums";

const getStatusConfig = (
  t: (key: string) => string,
): Record<
  DriverStatus,
  {
    label: string;
    variant: "warning" | "success" | "error" | "secondary";
    icon: typeof Clock;
  }
> => ({
  [DriverStatus.PENDING]: {
    label: t("admin.drivers.underReview"),
    variant: "warning",
    icon: Clock,
  },
  [DriverStatus.APPROVED]: {
    label: t("admin.drivers.approved"),
    variant: "success",
    icon: CheckCircle,
  },
  [DriverStatus.REJECTED]: {
    label: t("admin.drivers.rejected"),
    variant: "error",
    icon: XCircle,
  },
  [DriverStatus.SUSPENDED]: {
    label: t("admin.drivers.suspended"),
    variant: "error",
    icon: Ban,
  },
});

export function AdminDriversList() {
  const { t } = useTranslation();
  const statusConfig = useMemo(() => getStatusConfig(t), [t]);

  const [filters, setFilters] = useState<AdminDriverFilters>({
    page: 1,
    limit: 30,
  });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError } = useAdminDrivers(filters);

  const approveDriver = useApproveDriver();
  const rejectDriver = useRejectDriver();
  const suspendDriver = useSuspendDriver();
  const activateDriver = useActivateDriver();

  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [action, setAction] = useState<
    "approve" | "reject" | "suspend" | "activate" | null
  >(null);

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleFilterChange = useCallback(
    (
      key: keyof AdminDriverFilters,
      value: AdminDriverFilters[typeof key] | "all",
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
        page: 1,
      }));
    },
    [],
  );

  const confirmAction = async () => {
    if (!selectedDriver || !action) return;
    if (action === "approve") await approveDriver.mutateAsync(selectedDriver);
    if (action === "reject") await rejectDriver.mutateAsync(selectedDriver);
    if (action === "suspend") await suspendDriver.mutateAsync(selectedDriver);
    if (action === "activate") await activateDriver.mutateAsync(selectedDriver);
    setSelectedDriver(null);
    setAction(null);
  };

  const statusFilterOptions = useMemo(
    () => [
      {
        value: "",
        label: t("admin.drivers.allStatuses"),
        icon: <Clock className="h-4 w-4" />,
      },
      {
        value: DriverStatus.PENDING,
        label: t("admin.drivers.underReview"),
        icon: <Clock className="h-4 w-4 text-warning-500" />,
      },
      {
        value: DriverStatus.APPROVED,
        label: t("admin.drivers.approved"),
        icon: <CheckCircle className="h-4 w-4 text-success-500" />,
      },
      {
        value: DriverStatus.REJECTED,
        label: t("admin.drivers.rejected"),
        icon: <XCircle className="h-4 w-4 text-error-500" />,
      },
      {
        value: DriverStatus.SUSPENDED,
        label: t("admin.drivers.suspended"),
        icon: <Ban className="h-4 w-4 text-error-500" />,
      },
    ],
    [t],
  );

  if (isLoading) {
    return <ListSkeleton rows={5} />;
  }

  if (isError) {
    return <PharmacyErrorState />;
  }

  const drivers = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sticky filter bar (mobile) */}
      <Card className="sticky top-0 z-10 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:bg-card sm:backdrop-blur-none">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder={t("admin.drivers.searchPlaceholder")}
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
            {t("admin.drivers.totalResults")}{" "}
            <span className="font-semibold">{meta.total}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t("admin.drivers.pageOf")
              .replace("{current}", String(meta.page))
              .replace("{total}", String(meta.totalPages))}
          </p>
        </div>
      )}

      {/* Drivers List */}
      {drivers.length === 0 ? (
        <PharmacyEmptyState
          icon={Truck}
          title={t("admin.drivers.noDriversFound")}
          description={t("admin.drivers.noDriversMatchFilters")}
        />
      ) : (
        <div className="space-y-4">
          {drivers.map((driver) => {
            const statusInfo =
              statusConfig[driver.status as DriverStatus] ||
              statusConfig[DriverStatus.PENDING];
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={driver.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Icon */}
                    <div className="h-16 w-16 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <Truck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">
                          {driver.user?.fullName || "-"}
                        </h3>
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon className="h-3 w-3 me-1" />
                          {statusInfo.label}
                        </Badge>
                        {driver.isAvailable &&
                          driver.status === DriverStatus.APPROVED && (
                            <Badge variant="success">
                              {t("admin.drivers.available")}
                            </Badge>
                          )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        {driver.user?.email && (
                          <span className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {driver.user.email}
                          </span>
                        )}
                        {driver.user?.phoneNumber && (
                          <a
                            href={`tel:${driver.user.phoneNumber}`}
                            className="flex items-center gap-2 hover:text-primary-600"
                            dir="ltr"
                          >
                            <Phone className="h-4 w-4" />
                            {driver.user.phoneNumber}
                          </a>
                        )}
                        {driver.vehicleType && (
                          <span className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            {t("admin.drivers.vehicle")}:{" "}
                            {t(`common.vehicleTypes.${driver.vehicleType}`) ||
                              driver.vehicleType}
                          </span>
                        )}
                        {driver.vehiclePlate && (
                          <span className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            {t("admin.drivers.plate")}: {driver.vehiclePlate}
                          </span>
                        )}
                        {driver.licenseNumber && (
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {t("admin.drivers.licenseNumber")}:{" "}
                            {driver.licenseNumber}
                          </span>
                        )}
                        {driver._count?.deliveries !== undefined && (
                          <span className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {driver._count.deliveries}{" "}
                            {t("admin.drivers.deliveryCount")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap md:flex-nowrap mt-4 md:mt-0">
                      {driver.status === DriverStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDriver(driver.id);
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
                              setSelectedDriver(driver.id);
                              setAction("reject");
                            }}
                            className="text-error-600 border-error-300 hover:bg-error-50"
                          >
                            <XCircle className="h-4 w-4 me-1" />
                            {t("admin.reject")}
                          </Button>
                        </>
                      )}
                      {driver.status === DriverStatus.APPROVED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDriver(driver.id);
                            setAction("suspend");
                          }}
                          className="text-warning-600 border-warning-300 hover:bg-warning-50"
                        >
                          <Ban className="h-4 w-4 me-1" />
                          {t("admin.suspend")}
                        </Button>
                      )}
                      {(driver.status === DriverStatus.REJECTED ||
                        driver.status === DriverStatus.SUSPENDED) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedDriver(driver.id);
                            setAction("activate");
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 me-1" />
                          {t("admin.drivers.reactivate")}
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
        open={!!selectedDriver && !!action}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDriver(null);
            setAction(null);
          }
        }}
        title={
          action === "approve"
            ? t("admin.drivers.confirmApprove")
            : action === "reject"
              ? t("admin.drivers.confirmReject")
              : action === "suspend"
                ? t("admin.drivers.confirmSuspend")
                : action === "activate"
                  ? t("admin.drivers.confirmActivate")
                  : ""
        }
        description={
          action === "approve"
            ? t("admin.drivers.approveMessage")
            : action === "reject"
              ? t("admin.drivers.rejectMessage")
              : action === "suspend"
                ? t("admin.drivers.suspendMessage")
                : action === "activate"
                  ? t("admin.drivers.activateMessage")
                  : undefined
        }
        confirmLabel={
          action === "approve"
            ? t("admin.approve")
            : action === "reject"
              ? t("admin.reject")
              : action === "suspend"
                ? t("admin.suspend")
                : action === "activate"
                  ? t("admin.drivers.reactivate")
                  : t("common.confirm")
        }
        tone={
          action === "approve" || action === "activate"
            ? "default"
            : "destructive"
        }
        onConfirm={confirmAction}
      />
    </div>
  );
}
