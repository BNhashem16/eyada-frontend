"use client";

import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User as UserIcon,
  Phone,
  Mail,
  Loader2,
  Droplets,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DateOfBirthInput } from "@/components/ui/date-of-birth-input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePatientProfile,
  useUpdatePatientProfile,
  useCreatePatientProfile,
} from "../hooks/use-patient";
import { useAuthStore } from "@/lib/auth/store";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { Gender, PatientStatus } from "@/types/enums";
import { User, PatientProfile } from "@/types/models";

const getProfileSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(3, t("validation.fullNameMinLength"))
      .max(100, t("validation.fullNameMaxLength")),
    phone: z.string().regex(/^01[0125][0-9]{8}$/, t("validation.phoneInvalid")),
    dateOfBirth: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const date = new Date(val);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today;
        },
        { message: t("validation.dateOfBirthFuture") },
      ),
    gender: z.nativeEnum(Gender).optional(),
    whatsappNumber: z
      .string()
      .regex(/^01[0125][0-9]{8}$/, t("validation.phoneInvalid"))
      .optional()
      .or(z.literal("")),
    bloodType: z.string().optional(),
  });

type ProfileFormData = z.infer<ReturnType<typeof getProfileSchema>>;

export function PatientProfileForm() {
  const { t } = useTranslation();
  const { data: profile, isLoading, error } = usePatientProfile();
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Determine if this is a new profile (profile doesn't exist)
  const isNewProfile = !profile || !!error;

  return (
    <PatientProfileFormContent
      profile={profile}
      user={user}
      isNewProfile={isNewProfile}
    />
  );
}

interface PatientProfileFormContentProps {
  profile: PatientProfile | undefined;
  user: User | null;
  isNewProfile: boolean;
}

function PatientProfileFormContent({
  profile,
  user,
  isNewProfile,
}: PatientProfileFormContentProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const updateMutation = useUpdatePatientProfile();
  const createMutation = useCreatePatientProfile();

  const profileSchema = getProfileSchema(t);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:
        profile?.user?.fullName ||
        profile?.user?.name ||
        user?.fullName ||
        user?.name ||
        "",
      phone: profile?.user?.phoneNumber || user?.phoneNumber || "",
      dateOfBirth: profile?.dateOfBirth
        ? profile.dateOfBirth.split("T")[0]
        : "",
      gender: profile?.gender || undefined,
      whatsappNumber: profile?.whatsappNumber || "",
      bloodType: profile?.bloodType || "",
    },
  });

  // Reset form when profile data changes (after save/refetch)
  // Also handles new profile case where user data arrives after initial render (auth hydration)
  useEffect(() => {
    if (profile) {
      reset({
        name:
          profile.user?.fullName ||
          profile.user?.name ||
          user?.fullName ||
          user?.name ||
          "",
        phone: profile.user?.phoneNumber || user?.phoneNumber || "",
        dateOfBirth: profile.dateOfBirth
          ? profile.dateOfBirth.split("T")[0]
          : "",
        gender: profile.gender || undefined,
        whatsappNumber: profile.whatsappNumber || "",
        bloodType: profile.bloodType || "",
      });
    } else if (user) {
      // New profile: populate form from auth store user data
      reset({
        name: user.fullName || user.name || "",
        phone: user.phoneNumber || "",
        dateOfBirth: "",
        gender: undefined,
        whatsappNumber: "",
        bloodType: "",
      });
    }
  }, [profile, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Only send fields that the backend expects
      const payload = {
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender,
        whatsappNumber: data.whatsappNumber || undefined,
        bloodType: data.bloodType || undefined,
      };

      if (isNewProfile) {
        // Create new profile
        await createMutation.mutateAsync(payload);
        toast({
          title: t("toast.created"),
          description: t("patient.createdSuccess"),
          variant: "success",
        });
      } else {
        // Update existing profile
        await updateMutation.mutateAsync(payload as any);
        toast({
          title: t("toast.saved"),
          description: t("patient.updatedSuccess"),
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: t("toast.saveFailed"),
        description: t("patient.saveError"),
        variant: "error",
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isNewProfile && (
        <div className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
          <p className="text-primary-700 dark:text-primary-300 font-medium">
            {t("patient.completeDataMessage")}
          </p>
        </div>
      )}

      {/* Pending Approval Banner */}
      {!isNewProfile && profile?.status === PatientStatus.PENDING && (
        <Card className="mb-4 border-warning-300 bg-warning-50 dark:border-warning-700 dark:bg-warning-900/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-800 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <h3 className="font-semibold text-warning-800 dark:text-warning-200">
                  {t("patient.pendingApprovalTitle")}
                </h3>
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  {t("patient.pendingApprovalMessage")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("patient.personalData")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>
              {t("patient.fullName")}
            </Label>
            <Input
              id="name"
              {...register("name")}
              icon={<UserIcon className="h-5 w-5" />}
              iconPosition="start"
              error={!!errors.name}
            />
            {errors.name?.message && (
              <p className="text-sm text-error-600">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" required>
              {t("patient.phoneNumber")}
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              {...register("phone")}
              icon={<Phone className="h-5 w-5" />}
              iconPosition="start"
              placeholder={t("placeholder.whatsapp")}
              error={!!errors.phone}
            />
            {errors.phone?.message && (
              <p className="text-sm text-error-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("patient.email")}</Label>
            <Input
              id="email"
              type="email"
              value={profile?.user?.email || user?.email || ""}
              disabled
              icon={<Mail className="h-5 w-5" />}
              iconPosition="start"
            />
            <p className="text-xs text-muted-foreground">
              {t("patient.emailCannotChange")}
            </p>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label>{t("patient.dateOfBirth")}</Label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <DateOfBirthInput
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.dateOfBirth?.message && (
              <p className="text-sm text-error-600">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>{t("patient.gender")}</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={[
                    {
                      value: Gender.MALE,
                      label: t("patient.male"),
                      icon: <UserIcon className="h-4 w-4" />,
                    },
                    {
                      value: Gender.FEMALE,
                      label: t("patient.female"),
                      icon: <UserIcon className="h-4 w-4" />,
                    },
                  ]}
                  value={field.value || ""}
                  onValueChange={(value) => field.onChange(value as Gender)}
                  placeholder={t("patient.selectGender")}
                  showSearch={false}
                />
              )}
            />
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">
              {t("patient.whatsappNumber")}
            </Label>
            <Input
              id="whatsappNumber"
              type="tel"
              inputMode="tel"
              dir="ltr"
              {...register("whatsappNumber")}
              icon={<Phone className="h-5 w-5" />}
              iconPosition="start"
              placeholder={t("placeholder.whatsapp")}
            />
          </div>

          {/* Blood Type */}
          <div className="space-y-2">
            <Label>{t("patient.bloodType")}</Label>
            <Controller
              name="bloodType"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={[
                    {
                      value: "A+",
                      label: "A+",
                      icon: <Droplets className="h-4 w-4 text-error-500" />,
                    },
                    {
                      value: "A-",
                      label: "A-",
                      icon: <Droplets className="h-4 w-4 text-error-500" />,
                    },
                    {
                      value: "B+",
                      label: "B+",
                      icon: <Droplets className="h-4 w-4 text-error-500" />,
                    },
                    {
                      value: "B-",
                      label: "B-",
                      icon: <Droplets className="h-4 w-4 text-error-500" />,
                    },
                    {
                      value: "AB+",
                      label: "AB+",
                      icon: <Droplets className="h-4 w-4 text-error-500" />,
                    },
                    {
                      value: "AB-",
                      label: "AB-",
                      icon: <Droplets className="h-4 w-4 text-error-500" />,
                    },
                    {
                      value: "O+",
                      label: "O+",
                      icon: <Droplets className="h-4 w-4 text-error-500" />,
                    },
                    {
                      value: "O-",
                      label: "O-",
                      icon: <Droplets className="h-4 w-4 text-error-500" />,
                    },
                  ]}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder={t("patient.selectBloodType")}
                  showSearch={false}
                />
              )}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={(!isDirty && !isNewProfile) || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ms-2" />
                  {t("common.saving")}
                </>
              ) : isNewProfile ? (
                t("patient.createProfile")
              ) : (
                t("common.saveChanges")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
