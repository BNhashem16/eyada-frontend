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
  Plus,
  Store,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useMyPharmacies,
  usePharmacyDrivers,
  useCreatePharmacyDriver,
  useApprovePharmacyDriver,
  useRejectPharmacyDriver,
  useSuspendPharmacyDriver,
  useActivatePharmacyDriver,
  type PharmacyDriverFilters,
} from "../hooks";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { DriverStatus, VehicleType } from "@/types/enums";
import { getLocalizedText } from "@/lib/utils/multilingual";

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
    label: t("pharmacyOwner.drivers.underReview"),
    variant: "warning",
    icon: Clock,
  },
  [DriverStatus.APPROVED]: {
    label: t("pharmacyOwner.drivers.approved"),
    variant: "success",
    icon: CheckCircle,
  },
  [DriverStatus.REJECTED]: {
    label: t("pharmacyOwner.drivers.rejected"),
    variant: "error",
    icon: XCircle,
  },
  [DriverStatus.SUSPENDED]: {
    label: t("pharmacyOwner.drivers.suspended"),
    variant: "error",
    icon: Ban,
  },
});

export function PharmacyDriversList() {
  const { t, locale } = useTranslation();
  const statusConfig = useMemo(() => getStatusConfig(t), [t]);

  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("");
  const [filters, setFilters] = useState<PharmacyDriverFilters>({
    page: 1,
    limit: 30,
  });
  const [searchInput, setSearchInput] = useState("");

  // Pharmacy selector
  const { data: pharmaciesData, isLoading: pharmaciesLoading } =
    useMyPharmacies({ limit: 100 });
  const pharmacies = pharmaciesData?.data || [];

  // Auto-select first pharmacy
  if (pharmacies.length > 0 && !selectedPharmacy) {
    setSelectedPharmacy(pharmacies[0].id);
  }

  const { data, isLoading, isError, error } = usePharmacyDrivers(
    selectedPharmacy,
    filters,
  );

  const createDriver = useCreatePharmacyDriver(selectedPharmacy);
  const approveDriver = useApprovePharmacyDriver(selectedPharmacy);
  const rejectDriver = useRejectPharmacyDriver(selectedPharmacy);
  const suspendDriver = useSuspendPharmacyDriver(selectedPharmacy);
  const activateDriver = useActivatePharmacyDriver(selectedPharmacy);

  // Action dialog state
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [action, setAction] = useState<
    "approve" | "reject" | "suspend" | "activate" | null
  >(null);

  // Create dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    vehicleType: "",
    vehiclePlate: "",
    licenseNumber: "",
  });

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleFilterChange = useCallback(
    (key: keyof PharmacyDriverFilters, value: any) => {
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

  const handleCreate = () => {
    createDriver.mutate(
      {
        fullName: createForm.fullName,
        email: createForm.email,
        phoneNumber: createForm.phoneNumber,
        password: createForm.password,
        vehicleType: createForm.vehicleType || undefined,
        vehiclePlate: createForm.vehiclePlate || undefined,
        licenseNumber: createForm.licenseNumber || undefined,
      },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setCreateForm({
            fullName: "",
            email: "",
            phoneNumber: "",
            password: "",
            vehicleType: "",
            vehiclePlate: "",
            licenseNumber: "",
          });
        },
      },
    );
  };

  const isActionPending =
    approveDriver.isPending ||
    rejectDriver.isPending ||
    suspendDriver.isPending ||
    activateDriver.isPending;

  const statusFilterOptions = useMemo(
    () => [
      {
        value: "",
        label: t("pharmacyOwner.drivers.allStatuses"),
        icon: <Clock className="h-4 w-4" />,
      },
      {
        value: DriverStatus.PENDING,
        label: t("pharmacyOwner.drivers.underReview"),
        icon: <Clock className="h-4 w-4 text-warning-500" />,
      },
      {
        value: DriverStatus.APPROVED,
        label: t("pharmacyOwner.drivers.approved"),
        icon: <CheckCircle className="h-4 w-4 text-success-500" />,
      },
      {
        value: DriverStatus.REJECTED,
        label: t("pharmacyOwner.drivers.rejected"),
        icon: <XCircle className="h-4 w-4 text-error-500" />,
      },
      {
        value: DriverStatus.SUSPENDED,
        label: t("pharmacyOwner.drivers.suspended"),
        icon: <Ban className="h-4 w-4 text-error-500" />,
      },
    ],
    [t],
  );

  if (pharmaciesLoading || isLoading) {
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
      {/* Pharmacy Selector + Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Pharmacy selector */}
            {pharmacies.length > 1 && (
              <Select
                value={selectedPharmacy}
                onValueChange={setSelectedPharmacy}
              >
                <SelectTrigger>
                  <Store className="h-4 w-4 me-2" />
                  <SelectValue
                    placeholder={t("pharmacyOwner.selectPharmacy")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {pharmacies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {getLocalizedText(p.name, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Search + Status Filter + Add Button */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder={t("pharmacyOwner.drivers.searchPlaceholder")}
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

              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 me-2" />
                {t("pharmacyOwner.drivers.addDriver")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {meta && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {t("pharmacyOwner.drivers.totalResults")}{" "}
            <span className="font-semibold">{meta.total}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t("pharmacyOwner.drivers.pageOf")
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
              {t("pharmacyOwner.drivers.noDriversFound")}
            </h3>
            <p className="text-muted-foreground">
              {t("pharmacyOwner.drivers.noDriversMatchFilters")}
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
                              {t("pharmacyOwner.drivers.available")}
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
                            {t("pharmacyOwner.drivers.vehicle")}:{" "}
                            {t(`common.vehicleTypes.${driver.vehicleType}`) ||
                              driver.vehicleType}
                          </span>
                        )}
                        {driver.vehiclePlate && (
                          <span className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            {t("pharmacyOwner.drivers.plate")}:{" "}
                            {driver.vehiclePlate}
                          </span>
                        )}
                        {driver.licenseNumber && (
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {t("pharmacyOwner.drivers.licenseNumber")}:{" "}
                            {driver.licenseNumber}
                          </span>
                        )}
                        {driver._count?.deliveries !== undefined && (
                          <span className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {driver._count.deliveries}{" "}
                            {t("pharmacyOwner.drivers.deliveryCount")}
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
                          {t("pharmacyOwner.drivers.reactivate")}
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
              {action === "approve" &&
                t("pharmacyOwner.drivers.confirmApprove")}
              {action === "reject" && t("pharmacyOwner.drivers.confirmReject")}
              {action === "suspend" &&
                t("pharmacyOwner.drivers.confirmSuspend")}
              {action === "activate" &&
                t("pharmacyOwner.drivers.confirmActivate")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve" &&
                t("pharmacyOwner.drivers.approveMessage")}
              {action === "reject" && t("pharmacyOwner.drivers.rejectMessage")}
              {action === "suspend" &&
                t("pharmacyOwner.drivers.suspendMessage")}
              {action === "activate" &&
                t("pharmacyOwner.drivers.activateMessage")}
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
              disabled={isActionPending}
            >
              {isActionPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {action === "approve" && t("admin.approve")}
              {action === "reject" && t("admin.reject")}
              {action === "suspend" && t("admin.suspend")}
              {action === "activate" && t("pharmacyOwner.drivers.reactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Driver Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("pharmacyOwner.drivers.createDriverTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("pharmacyOwner.drivers.createDriverSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label required>{t("pharmacyOwner.drivers.fullName")}</Label>
              <Input
                value={createForm.fullName}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                placeholder={t("pharmacyOwner.driverFullNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label required>{t("pharmacyOwner.drivers.email")}</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder={t("pharmacyOwner.driverEmailPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label required>{t("pharmacyOwner.drivers.phone")}</Label>
              <Input
                type="tel"
                dir="ltr"
                value={createForm.phoneNumber}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                placeholder={t("pharmacyOwner.driverPhonePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label required>{t("pharmacyOwner.drivers.password")}</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder={t("pharmacyOwner.driverPasswordPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("pharmacyOwner.drivers.vehicleType")}</Label>
                <Select
                  value={createForm.vehicleType}
                  onValueChange={(value) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      vehicleType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("pharmacyOwner.drivers.selectVehicleType")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(VehicleType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`common.vehicleTypes.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("pharmacyOwner.drivers.vehiclePlate")}</Label>
                <Input
                  value={createForm.vehiclePlate}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      vehiclePlate: e.target.value,
                    }))
                  }
                  placeholder={t("pharmacyOwner.vehiclePlatePlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("pharmacyOwner.drivers.licenseNumber")}</Label>
              <Input
                value={createForm.licenseNumber}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    licenseNumber: e.target.value,
                  }))
                }
                placeholder={t("pharmacyOwner.licenseNumberPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createDriver.isPending ||
                !createForm.fullName ||
                !createForm.email ||
                !createForm.phoneNumber ||
                !createForm.password
              }
            >
              {createDriver.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {createDriver.isPending
                ? t("pharmacyOwner.drivers.creating")
                : t("pharmacyOwner.drivers.addDriver")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
