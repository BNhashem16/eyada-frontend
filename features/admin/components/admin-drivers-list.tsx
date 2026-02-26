"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Truck,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Ban,
  Clock,
  AlertTriangle,
  Car,
  CreditCard,
  FileText,
  Package,
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

  const { data, isLoading, isError, error } = useAdminDrivers(filters);

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
    (key: keyof AdminDriverFilters, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
        page: 1,
      }));
    },
    [],
  );

  const handleAction = () => {
    if (!selectedDriver || !action) return;

    const callbacks = {
      onSuccess: () => {
        setSelectedDriver(null);
        setAction(null);
      },
    };

    switch (action) {
      case "approve":
        approveDriver.mutate(selectedDriver, callbacks);
        break;
      case "reject":
        rejectDriver.mutate(selectedDriver, callbacks);
        break;
      case "suspend":
        suspendDriver.mutate(selectedDriver, callbacks);
        break;
      case "activate":
        activateDriver.mutate(selectedDriver, callbacks);
        break;
    }
  };

  const isPending =
    approveDriver.isPending ||
    rejectDriver.isPending ||
    suspendDriver.isPending ||
    activateDriver.isPending;

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

  const drivers = data?.data || [];
  const meta = data?.meta;

  return (
    <>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
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
        <Card>
          <CardContent className="py-16 text-center">
            <Truck className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("admin.drivers.noDriversFound")}
            </h3>
            <p className="text-muted-foreground">
              {t("admin.drivers.noDriversMatchFilters")}
            </p>
          </CardContent>
        </Card>
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

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedDriver && !!action}
        onOpenChange={() => {
          setSelectedDriver(null);
          setAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" && t("admin.drivers.confirmApprove")}
              {action === "reject" && t("admin.drivers.confirmReject")}
              {action === "suspend" && t("admin.drivers.confirmSuspend")}
              {action === "activate" && t("admin.drivers.confirmActivate")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve" && t("admin.drivers.approveMessage")}
              {action === "reject" && t("admin.drivers.rejectMessage")}
              {action === "suspend" && t("admin.drivers.suspendMessage")}
              {action === "activate" && t("admin.drivers.activateMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                action === "approve" || action === "activate"
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
              {action === "activate" && t("admin.drivers.reactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
