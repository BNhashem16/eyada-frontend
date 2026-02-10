"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, UserPlus, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  useCreateSecretary,
  CreateSecretaryData,
} from "@/features/doctor-portal/hooks";
import { useDoctorClinics } from "@/features/doctor-portal/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getLocalizedText } from "@/lib/utils/multilingual";

const createSecretarySchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^01[0125][0-9]{8}$/),
  password: z.string().min(8).max(50),
  clinicId: z.string().uuid(),
});

type CreateSecretaryFormData = z.infer<typeof createSecretarySchema>;

export function NewSecretaryContent() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);

  const { data: clinics, isLoading: clinicsLoading } = useDoctorClinics();
  const createSecretary = useCreateSecretary();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateSecretaryFormData>({
    resolver: zodResolver(createSecretarySchema),
  });

  const selectedClinicId = watch("clinicId");

  const onSubmit = async (data: CreateSecretaryFormData) => {
    try {
      await createSecretary.mutateAsync(data);
      toast({
        title: t("toast.success"),
        description: t("secretary.management.secretaryCreated"),
      });
      router.push("/doctor/secretaries");
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast({
        title: t("toast.error"),
        description:
          typeof message === "object"
            ? message[locale] || message.en
            : t("toast.saveFailed"),
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {t("secretary.management.addSecretary")}
          </h1>
          <p className="text-muted-foreground">
            {t("secretary.management.addSecretaryDesc")}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t("secretary.management.secretaryInfo")}
          </CardTitle>
          <CardDescription>
            {t("secretary.management.secretaryInfoDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("auth.fullName")} *</Label>
              <Input
                id="fullName"
                placeholder={t("auth.fullNamePlaceholder")}
                {...register("fullName")}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">
                  {t("validation.fullNameRequired")}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")} *</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder={t("placeholder.secretaryEmail")}
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {t("validation.emailInvalid")}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t("auth.phoneNumber")} *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                inputMode="tel"
                dir="ltr"
                placeholder={t("placeholder.phone")}
                {...register("phoneNumber")}
                className={errors.phoneNumber ? "border-destructive" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">
                  {t("validation.phoneInvalid")}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")} *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("placeholder.password")}
                  {...register("password")}
                  className={
                    errors.password ? "border-destructive pe-10" : "pe-10"
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {t("validation.passwordMinLength")}
                </p>
              )}
            </div>

            {/* Clinic Selection */}
            <div className="space-y-2">
              <Label>{t("secretary.management.selectClinic")} *</Label>
              <Select
                value={selectedClinicId}
                onValueChange={(value) => setValue("clinicId", value)}
                disabled={clinicsLoading}
              >
                <SelectTrigger
                  className={errors.clinicId ? "border-destructive" : ""}
                >
                  <SelectValue
                    placeholder={t(
                      "secretary.management.selectClinicPlaceholder",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {clinics?.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {getLocalizedText(clinic.name, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clinicId && (
                <p className="text-sm text-destructive">
                  {t("validation.required")}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || createSecretary.isPending}
              >
                {isSubmitting || createSecretary.isPending
                  ? t("common.saving")
                  : t("common.save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
