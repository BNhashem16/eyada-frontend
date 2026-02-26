"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";
import {
  useDriverProfile,
  useUpdateDriverProfile,
  useToggleAvailability,
} from "../hooks";
import { DriverStatus, VehicleType } from "@/types/enums";
import { ToggleLeft, ToggleRight } from "lucide-react";

const VEHICLE_TYPES = Object.values(VehicleType);

const statusConfig: Record<
  DriverStatus,
  {
    variant: "default" | "secondary" | "error" | "outline" | "warning";
    key: string;
  }
> = {
  [DriverStatus.PENDING]: { variant: "warning", key: "driver.statusPending" },
  [DriverStatus.APPROVED]: { variant: "default", key: "driver.statusApproved" },
  [DriverStatus.REJECTED]: { variant: "error", key: "driver.statusRejected" },
  [DriverStatus.SUSPENDED]: {
    variant: "outline",
    key: "driver.statusSuspended",
  },
};

export function DriverProfileForm() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useDriverProfile();
  const updateProfile = useUpdateDriverProfile();
  const toggleAvailability = useToggleAvailability();

  const [vehicleType, setVehicleType] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  useEffect(() => {
    if (profile) {
      setVehicleType(profile.vehicleType || "");
      setVehiclePlate(profile.vehiclePlate || "");
      setLicenseNumber(profile.licenseNumber || "");
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  const isApproved = profile.status === DriverStatus.APPROVED;
  const isPending = profile.status === DriverStatus.PENDING;
  const config = statusConfig[profile.status];

  const handleSave = () => {
    updateProfile.mutate({
      vehicleType: vehicleType || undefined,
      vehiclePlate: vehiclePlate || undefined,
      licenseNumber: licenseNumber || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Pending Banner */}
      {isPending && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="p-4">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              {t("driver.pendingApproval")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Account Status & Availability */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{t("driver.accountStatus")}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {t("driver.currentStatus")}:
              </span>
              <Badge variant={config.variant}>{t(config.key)}</Badge>
            </div>
            {isApproved && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("driver.availability")}:
                </span>
                <Badge variant={profile.isAvailable ? "default" : "secondary"}>
                  {profile.isAvailable
                    ? t("driver.available")
                    : t("driver.unavailable")}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toggleAvailability.mutate({
                      isAvailable: !profile.isAvailable,
                    })
                  }
                  disabled={toggleAvailability.isPending}
                >
                  {profile.isAvailable ? (
                    <ToggleRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            )}
          </div>
          {profile._count && (
            <div className="mt-3">
              <span className="text-sm text-muted-foreground">
                {t("driver.totalDeliveries")}: {profile._count.deliveries}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Info (Read-only) */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{t("driver.personalInfo")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">
                {t("auth.fullName")}
              </Label>
              <p className="font-medium">{profile.user?.fullName || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("auth.email")}</Label>
              <p className="font-medium">{profile.user?.email || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("auth.phone")}</Label>
              <p className="font-medium">{profile.user?.phoneNumber || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Info (Editable) */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{t("driver.vehicleInfo")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("driver.vehicleType")}</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger>
                  <SelectValue placeholder={t("driver.vehicleType")} />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("driver.vehiclePlate")}</Label>
              <Input
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                placeholder={t("driver.vehiclePlate")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("driver.licenseNumber")}</Label>
              <Input
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder={t("driver.licenseNumber")}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending
                ? t("common.saving")
                : t("common.saveChanges")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
