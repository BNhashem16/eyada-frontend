"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  Save,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/pharmacy";
import {
  usePharmacyOwnerProfile,
  useUpdatePharmacyOwnerProfile,
} from "../hooks/use-pharmacy-owner-profile";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth/store";
import { useTranslation } from "@/lib/i18n";
import { PharmacyStatus } from "@/types/enums";

const getProfileSchema = (t: (key: string) => string) =>
  z.object({
    businessName: z.string().min(2, t("validation.fullNameMinLength")).max(200),
    businessLicense: z.string().max(100).optional().or(z.literal("")),
    taxNumber: z.string().max(100).optional().or(z.literal("")),
  });

type ProfileFormData = z.infer<ReturnType<typeof getProfileSchema>>;

const getStatusLabels = (
  t: (key: string) => string,
): Record<
  PharmacyStatus,
  { label: string; variant: "success" | "warning" | "error" | "secondary" }
> => ({
  [PharmacyStatus.APPROVED]: {
    label: t("pharmacyOwner.statusApproved"),
    variant: "success",
  },
  [PharmacyStatus.PENDING]: {
    label: t("pharmacyOwner.statusPending"),
    variant: "warning",
  },
  [PharmacyStatus.REJECTED]: {
    label: t("pharmacyOwner.statusRejected"),
    variant: "error",
  },
  [PharmacyStatus.SUSPENDED]: {
    label: t("pharmacyOwner.statusSuspended"),
    variant: "error",
  },
});

export function PharmacyOwnerProfileForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: profile, isLoading } = usePharmacyOwnerProfile();
  const updateMutation = useUpdatePharmacyOwnerProfile();
  const user = useAuthStore((state) => state.user);

  const statusLabels = useMemo(() => getStatusLabels(t), [t]);
  const profileSchema = useMemo(() => getProfileSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: "",
      businessLicense: "",
      taxNumber: "",
    },
  });

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        businessName: profile.businessName || "",
        businessLicense: profile.businessLicense || "",
        taxNumber: profile.taxNumber || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateMutation.mutateAsync({
        businessName: data.businessName,
        businessLicense: data.businessLicense || undefined,
        taxNumber: data.taxNumber || undefined,
      });
      toast({
        title: t("pharmacyOwner.profileSaved"),
        description: t("pharmacyOwner.profileSavedDesc"),
        variant: "success",
      });
    } catch {
      toast({
        title: t("toast.error"),
        description: t("errors.somethingWentWrong"),
        variant: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const status = profile?.status || PharmacyStatus.PENDING;
  const statusInfo = statusLabels[status];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span
              className="grid size-14 shrink-0 place-items-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 sm:size-16"
              aria-hidden="true"
            >
              <Building2 className="size-7 sm:size-8" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-foreground sm:text-xl">
                {user?.fullName || user?.name || ""}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
              {user?.phoneNumber ? (
                <p className="text-sm text-muted-foreground" dir="ltr">
                  {user.phoneNumber}
                </p>
              ) : null}
            </div>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("pharmacyOwner.businessInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName" required>
              {t("pharmacyOwner.businessName")}
            </Label>
            <Input
              id="businessName"
              placeholder={t("pharmacyOwner.businessNamePlaceholder")}
              icon={<User className="h-5 w-5" />}
              iconPosition="start"
              error={!!errors.businessName}
              {...register("businessName")}
            />
            {errors.businessName && (
              <p className="text-sm text-error-500">
                {errors.businessName.message}
              </p>
            )}
          </div>

          {/* Business License */}
          <div className="space-y-2">
            <Label htmlFor="businessLicense">
              {t("pharmacyOwner.businessLicense")}
            </Label>
            <Input
              id="businessLicense"
              dir="ltr"
              placeholder={t("pharmacyOwner.businessLicensePlaceholder")}
              icon={<FileText className="h-5 w-5" />}
              iconPosition="start"
              error={!!errors.businessLicense}
              {...register("businessLicense")}
            />
            {errors.businessLicense && (
              <p className="text-sm text-error-500">
                {errors.businessLicense.message}
              </p>
            )}
          </div>

          {/* Tax Number */}
          <div className="space-y-2">
            <Label htmlFor="taxNumber">{t("pharmacyOwner.taxNumber")}</Label>
            <Input
              id="taxNumber"
              dir="ltr"
              placeholder={t("pharmacyOwner.taxNumberPlaceholder")}
              icon={<FileText className="h-5 w-5" />}
              iconPosition="start"
              error={!!errors.taxNumber}
              {...register("taxNumber")}
            />
            {errors.taxNumber && (
              <p className="text-sm text-error-500">
                {errors.taxNumber.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Info (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("pharmacyOwner.accountInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("auth.fullName")}</Label>
            <Input
              value={user?.fullName || user?.name || ""}
              disabled
              icon={<User className="h-5 w-5" />}
              iconPosition="start"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("auth.email")}</Label>
            <Input
              value={user?.email || ""}
              disabled
              dir="ltr"
              icon={<Mail className="h-5 w-5" />}
              iconPosition="start"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("auth.phoneNumber")}</Label>
            <Input
              value={user?.phoneNumber || ""}
              disabled
              dir="ltr"
              icon={<Phone className="h-5 w-5" />}
              iconPosition="start"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isDirty || updateMutation.isPending}
          size="lg"
          className="w-full min-h-[48px] sm:w-auto"
        >
          {updateMutation.isPending ? (
            <Loader2 className="me-2 size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="me-2 size-5" aria-hidden="true" />
          )}
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}
