"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  MapPin,
  Loader2,
  Navigation,
  Phone,
  Plus,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateClinic,
  useUpdateClinic,
  useDoctorClinic,
} from "../hooks/use-doctor-portal";
import {
  usePublicStates,
  usePublicCities,
} from "../hooks/use-public-locations";
import { useToast } from "@/hooks/use-toast";
import { State, City } from "@/types";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";

const phoneRegex = /^01[0125][0-9]{8}$/;

// Schema matching backend CreateClinicDto
const getClinicSchema = (t: (key: string) => string) =>
  z.object({
    nameAr: z.string().min(2, t("validation.clinicNameArRequired")).max(200),
    nameEn: z.string().min(2, t("validation.clinicNameEnRequired")).max(200),
    descriptionAr: z.string().max(2000).optional().or(z.literal("")),
    descriptionEn: z.string().max(2000).optional().or(z.literal("")),
    addressAr: z.string().min(2, t("validation.addressArRequired")).max(200),
    addressEn: z.string().min(2, t("validation.addressEnRequired")).max(200),
    stateId: z.string().min(1, t("validation.stateRequired")),
    cityId: z.string().min(1, t("validation.cityRequired")),
    buildingNumber: z.string().max(20).optional().or(z.literal("")),
    floorNumber: z.string().max(20).optional().or(z.literal("")),
    clinicNumber: z.string().max(20).optional().or(z.literal("")),
    landmarkAr: z.string().max(2000).optional().or(z.literal("")),
    landmarkEn: z.string().max(2000).optional().or(z.literal("")),
    latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
    longitude: z.coerce
      .number()
      .min(-180)
      .max(180)
      .optional()
      .or(z.literal("")),
    phoneNumbers: z.array(
      z.object({
        value: z
          .string()
          .regex(phoneRegex, t("validation.phoneInvalid"))
          .or(z.literal("")),
      }),
    ),
    whatsappNumbers: z.array(
      z.object({
        value: z
          .string()
          .regex(phoneRegex, t("validation.phoneInvalid"))
          .or(z.literal("")),
      }),
    ),
    isActive: z.boolean(),
  });

type ClinicFormData = z.infer<ReturnType<typeof getClinicSchema>>;

interface ClinicFormProps {
  clinicId?: string;
}

export function ClinicForm({ clinicId }: ClinicFormProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!clinicId;

  const { data: clinic, isLoading: clinicLoading } = useDoctorClinic(
    clinicId || "",
  );
  const createMutation = useCreateClinic();
  const updateMutation = useUpdateClinic();

  // Paginated states
  const [statesSearch, setStatesSearch] = useState("");
  const [statesPage, setStatesPage] = useState(1);
  const [allStates, setAllStates] = useState<State[]>([]);
  const statesQuery = usePublicStates({
    search: statesSearch,
    page: statesPage,
  });

  // Paginated cities
  const [citiesSearch, setCitiesSearch] = useState("");
  const [citiesPage, setCitiesPage] = useState(1);
  const [allCities, setAllCities] = useState<City[]>([]);

  const clinicSchema = getClinicSchema(t);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      addressAr: "",
      addressEn: "",
      stateId: "",
      cityId: "",
      buildingNumber: "",
      floorNumber: "",
      clinicNumber: "",
      landmarkAr: "",
      landmarkEn: "",
      phoneNumbers: [{ value: "" }],
      whatsappNumbers: [],
      isActive: true,
    },
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({ control, name: "phoneNumbers" });

  const {
    fields: whatsappFields,
    append: appendWhatsapp,
    remove: removeWhatsapp,
  } = useFieldArray({ control, name: "whatsappNumbers" });

  const selectedStateId = watch("stateId");
  const citiesQuery = usePublicCities({
    stateId: selectedStateId,
    search: citiesSearch,
    page: citiesPage,
  });

  const selectedCityId = watch("cityId");

  // Accumulate states data across pages (preserve selected item)
  useEffect(() => {
    if (statesQuery.data) {
      const newData = statesQuery.data.data;
      if (statesPage === 1) {
        setAllStates((prev) => {
          const selected = prev.find((s) => s.id === selectedStateId);
          if (selected && !newData.some((s) => s.id === selectedStateId)) {
            return [selected, ...newData];
          }
          return newData;
        });
      } else {
        setAllStates((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const unique = newData.filter((s) => !existingIds.has(s.id));
          return [...prev, ...unique];
        });
      }
    }
  }, [statesQuery.data, statesPage, selectedStateId]);

  // Accumulate cities data across pages (preserve selected item)
  useEffect(() => {
    if (citiesQuery.data) {
      const newData = citiesQuery.data.data;
      if (citiesPage === 1) {
        setAllCities((prev) => {
          const selected = prev.find((c) => c.id === selectedCityId);
          if (selected && !newData.some((c) => c.id === selectedCityId)) {
            return [selected, ...newData];
          }
          return newData;
        });
      } else {
        setAllCities((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const unique = newData.filter((c) => !existingIds.has(c.id));
          return [...prev, ...unique];
        });
      }
    }
  }, [citiesQuery.data, citiesPage, selectedCityId]);

  // Reset cities when state changes
  useEffect(() => {
    setCitiesSearch("");
    setCitiesPage(1);
    setAllCities([]);
  }, [selectedStateId]);

  // Handlers for server-side search
  const handleStatesSearch = useCallback((search: string) => {
    setStatesSearch(search);
    setStatesPage(1);
  }, []);

  const handleStatesLoadMore = useCallback(() => {
    if (statesQuery.data?.meta.hasNextPage) {
      setStatesPage((prev) => prev + 1);
    }
  }, [statesQuery.data?.meta.hasNextPage]);

  const handleCitiesSearch = useCallback((search: string) => {
    setCitiesSearch(search);
    setCitiesPage(1);
  }, []);

  const handleCitiesLoadMore = useCallback(() => {
    if (citiesQuery.data?.meta.hasNextPage) {
      setCitiesPage((prev) => prev + 1);
    }
  }, [citiesQuery.data?.meta.hasNextPage]);

  // Populate form when clinic data loads (edit mode)
  useEffect(() => {
    if (clinic && isEditing) {
      const stateId = clinic.city?.state?.id || clinic.city?.stateId || "";

      // Ensure the selected state is in the options
      if (clinic.city?.state) {
        setAllStates((prev) => {
          if (prev.some((s) => s.id === clinic.city!.state!.id)) return prev;
          return [clinic.city!.state! as State, ...prev];
        });
      }

      // Ensure the selected city is in the options
      if (clinic.city) {
        setAllCities((prev) => {
          if (prev.some((c) => c.id === clinic.city!.id)) return prev;
          return [clinic.city! as City, ...prev];
        });
      }

      const phones =
        clinic.phoneNumbers && clinic.phoneNumbers.length > 0
          ? clinic.phoneNumbers.map((p) => ({ value: p }))
          : [{ value: "" }];

      const whatsapps =
        clinic.whatsappNumbers && clinic.whatsappNumbers.length > 0
          ? clinic.whatsappNumbers.map((w) => ({ value: w }))
          : [];

      reset({
        nameAr: clinic.name?.ar || "",
        nameEn: clinic.name?.en || "",
        descriptionAr: clinic.description?.ar || "",
        descriptionEn: clinic.description?.en || "",
        addressAr: clinic.address?.ar || "",
        addressEn: clinic.address?.en || "",
        stateId: stateId,
        cityId: clinic.cityId || "",
        buildingNumber: clinic.buildingNumber || "",
        floorNumber: clinic.floorNumber || "",
        clinicNumber: clinic.clinicNumber || "",
        landmarkAr: clinic.landmark?.ar || "",
        landmarkEn: clinic.landmark?.en || "",
        latitude: clinic.latitude || "",
        longitude: clinic.longitude || "",
        phoneNumbers: phones,
        whatsappNumbers: whatsapps,
        isActive: clinic.isActive ?? true,
      });
    }
  }, [clinic, isEditing, reset]);

  const onSubmit = async (data: ClinicFormData) => {
    try {
      // Filter out empty phone/whatsapp entries
      const phoneNumbers = data.phoneNumbers
        .map((p) => p.value)
        .filter((v) => v.length > 0);
      const whatsappNumbers = data.whatsappNumbers
        .map((w) => w.value)
        .filter((v) => v.length > 0);

      // Build the payload matching backend DTO
      const payload = {
        name: {
          ar: data.nameAr,
          en: data.nameEn,
        },
        description:
          data.descriptionAr || data.descriptionEn
            ? {
                ar: data.descriptionAr || "",
                en: data.descriptionEn || "",
              }
            : undefined,
        address: {
          ar: data.addressAr,
          en: data.addressEn,
        },
        cityId: data.cityId,
        buildingNumber: data.buildingNumber || undefined,
        floorNumber: data.floorNumber || undefined,
        clinicNumber: data.clinicNumber || undefined,
        landmark:
          data.landmarkAr || data.landmarkEn
            ? {
                ar: data.landmarkAr || "",
                en: data.landmarkEn || "",
              }
            : undefined,
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
        phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : undefined,
        whatsappNumbers:
          whatsappNumbers.length > 0 ? whatsappNumbers : undefined,
        isActive: data.isActive,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          clinicId: clinicId!,
          data: payload,
        });
        toast({
          title: t("toast.updated"),
          description: t("doctor.clinicUpdated"),
          variant: "success",
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast({
          title: t("toast.added"),
          description: t("doctor.clinicAdded"),
          variant: "success",
        });
      }
      router.push("/doctor/clinics");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message;
      toast({
        title: t("toast.error"),
        description:
          typeof errorMessage === "object"
            ? errorMessage.ar || errorMessage.en || t("doctor.clinicSaveFailed")
            : errorMessage || t("doctor.clinicSaveFailed"),
        variant: "error",
      });
    }
  };

  if (isEditing && clinicLoading) {
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

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Clinic Name & Description Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {isEditing ? t("doctor.editClinic") : t("doctor.addNewClinic")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Arabic */}
          <div className="space-y-2">
            <Label htmlFor="nameAr" required>
              {t("clinics.nameAr")}
            </Label>
            <Input
              id="nameAr"
              {...register("nameAr")}
              placeholder={t("clinics.nameArPlaceholder")}
              className="bg-background text-foreground"
            />
            {errors.nameAr && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {errors.nameAr.message}
              </p>
            )}
          </div>

          {/* Name English */}
          <div className="space-y-2">
            <Label htmlFor="nameEn" required>
              {t("clinics.nameEn")}
            </Label>
            <Input
              id="nameEn"
              {...register("nameEn")}
              placeholder={t("clinics.nameEnPlaceholder")}
              dir="ltr"
              className="bg-background text-foreground"
            />
            {errors.nameEn && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {errors.nameEn.message}
              </p>
            )}
          </div>

          {/* Description Arabic */}
          <div className="space-y-2">
            <Label htmlFor="descriptionAr">
              {t("clinics.descriptionAr")}
            </Label>
            <Textarea
              id="descriptionAr"
              {...register("descriptionAr")}
              placeholder={t("clinics.descriptionArPlaceholder")}
              className="bg-background text-foreground min-h-[80px]"
              rows={3}
            />
            {errors.descriptionAr && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {errors.descriptionAr.message}
              </p>
            )}
          </div>

          {/* Description English */}
          <div className="space-y-2">
            <Label htmlFor="descriptionEn">
              {t("clinics.descriptionEn")}
            </Label>
            <Textarea
              id="descriptionEn"
              {...register("descriptionEn")}
              placeholder={t("clinics.descriptionEnPlaceholder")}
              dir="ltr"
              className="bg-background text-foreground min-h-[80px]"
              rows={3}
            />
            {errors.descriptionEn && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {errors.descriptionEn.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("clinics.locationAndAddress")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* State & City */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label required>{t("clinics.state")}</Label>
              <SearchableSelect
                options={allStates.map((state) => ({
                  value: state.id,
                  label: getLocalizedText(state.name, locale) || "",
                  icon: <MapPin className="h-4 w-4" />,
                }))}
                value={watch("stateId") || ""}
                onValueChange={(value) => {
                  setValue("stateId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("cityId", "", { shouldDirty: true });
                }}
                placeholder={t("clinics.selectState")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noResults")}
                loading={statesQuery.isLoading && statesPage === 1}
                clearable={false}
                className="bg-background text-foreground"
                onSearchChange={handleStatesSearch}
                hasMore={statesQuery.data?.meta.hasNextPage}
                onLoadMore={handleStatesLoadMore}
                serverLoading={statesQuery.isFetching}
              />
              {statesQuery.isError && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {t("errors.loadError")}
                </p>
              )}
              {errors.stateId && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {errors.stateId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label required>{t("clinics.city")}</Label>
              <SearchableSelect
                options={allCities.map((city) => ({
                  value: city.id,
                  label: getLocalizedText(city.name, locale) || "",
                  icon: <Building2 className="h-4 w-4" />,
                }))}
                value={watch("cityId") || ""}
                onValueChange={(value) =>
                  setValue("cityId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                placeholder={
                  !selectedStateId
                    ? t("clinics.selectStateFirst")
                    : t("clinics.selectCity")
                }
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noResults")}
                disabled={!selectedStateId}
                loading={citiesQuery.isLoading && citiesPage === 1}
                clearable={false}
                className="bg-background text-foreground"
                onSearchChange={handleCitiesSearch}
                hasMore={citiesQuery.data?.meta.hasNextPage}
                onLoadMore={handleCitiesLoadMore}
                serverLoading={citiesQuery.isFetching}
              />
              {citiesQuery.isError && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {t("errors.loadError")}
                </p>
              )}
              {errors.cityId && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {errors.cityId.message}
                </p>
              )}
            </div>
          </div>

          {/* Address Arabic */}
          <div className="space-y-2">
            <Label htmlFor="addressAr" required>
              {t("clinics.detailedAddressAr")}
            </Label>
            <Input
              id="addressAr"
              {...register("addressAr")}
              placeholder={t("clinics.detailedAddressArPlaceholder")}
              className="bg-background text-foreground"
            />
            {errors.addressAr && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {errors.addressAr.message}
              </p>
            )}
          </div>

          {/* Address English */}
          <div className="space-y-2">
            <Label htmlFor="addressEn" required>
              {t("clinics.detailedAddressEn")}
            </Label>
            <Input
              id="addressEn"
              {...register("addressEn")}
              placeholder={t("clinics.detailedAddressEnPlaceholder")}
              dir="ltr"
              className="bg-background text-foreground"
            />
            {errors.addressEn && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {errors.addressEn.message}
              </p>
            )}
          </div>

          {/* Building / Floor / Clinic Number */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="buildingNumber">
                {t("clinics.buildingNumber")}
              </Label>
              <Input
                id="buildingNumber"
                {...register("buildingNumber")}
                placeholder="10"
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floorNumber">{t("clinics.floorNumber")}</Label>
              <Input
                id="floorNumber"
                {...register("floorNumber")}
                placeholder="3"
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicNumber">{t("clinics.clinicNumber")}</Label>
              <Input
                id="clinicNumber"
                {...register("clinicNumber")}
                placeholder="5A"
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>
          </div>

          {/* Landmark */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="landmarkAr">{t("clinics.landmarkAr")}</Label>
              <Input
                id="landmarkAr"
                {...register("landmarkAr")}
                placeholder={t("clinics.landmarkArPlaceholder")}
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmarkEn">{t("clinics.landmarkEn")}</Label>
              <Input
                id="landmarkEn"
                {...register("landmarkEn")}
                placeholder={t("clinics.landmarkEnPlaceholder")}
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">
                <span className="flex items-center gap-1">
                  <Navigation className="h-4 w-4" />
                  {t("clinics.latitude")}
                </span>
              </Label>
              <Input
                id="latitude"
                type="number"
                inputMode="decimal"
                step="any"
                {...register("latitude")}
                placeholder="30.0444"
                dir="ltr"
                className="bg-background text-foreground"
              />
              {errors.latitude && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {errors.latitude.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">
                <span className="flex items-center gap-1">
                  <Navigation className="h-4 w-4" />
                  {t("clinics.longitude")}
                </span>
              </Label>
              <Input
                id="longitude"
                type="number"
                inputMode="decimal"
                step="any"
                {...register("longitude")}
                placeholder="31.2357"
                dir="ltr"
                className="bg-background text-foreground"
              />
              {errors.longitude && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {errors.longitude.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("clinics.contactInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Numbers */}
          <div className="space-y-3">
            <Label>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {t("clinics.phoneNumbers")}
              </span>
            </Label>
            {phoneFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    type="tel"
                    inputMode="tel"
                    {...register(`phoneNumbers.${index}.value`)}
                    placeholder={t("clinics.phonePlaceholder")}
                    maxLength={11}
                    dir="ltr"
                    className="bg-background text-foreground"
                  />
                  {errors.phoneNumbers?.[index]?.value && (
                    <p className="text-sm text-error-600 dark:text-error-400">
                      {errors.phoneNumbers[index].value?.message}
                    </p>
                  )}
                </div>
                {phoneFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePhone(index)}
                    className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 mt-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {phoneFields.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendPhone({ value: "" })}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                {t("clinics.addPhone")}
              </Button>
            )}
          </div>

          {/* WhatsApp Numbers */}
          <div className="space-y-3">
            <Label>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {t("clinics.whatsappNumbers")}
              </span>
            </Label>
            {whatsappFields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {locale === "ar"
                  ? "لم يتم إضافة أرقام واتساب بعد"
                  : "No WhatsApp numbers added yet"}
              </p>
            )}
            {whatsappFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    type="tel"
                    inputMode="tel"
                    {...register(`whatsappNumbers.${index}.value`)}
                    placeholder={t("clinics.phonePlaceholder")}
                    maxLength={11}
                    dir="ltr"
                    className="bg-background text-foreground"
                  />
                  {errors.whatsappNumbers?.[index]?.value && (
                    <p className="text-sm text-error-600 dark:text-error-400">
                      {errors.whatsappNumbers[index].value?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWhatsapp(index)}
                  className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 mt-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {whatsappFields.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendWhatsapp({ value: "" })}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                {t("clinics.addWhatsapp")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardContent className="pt-6">
          {/* Active Status */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", !!checked)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {t("clinics.clinicActiveSearch")}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/doctor/clinics")}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isPending || (!isDirty && isEditing)}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ms-2" />
              {t("common.saving")}
            </>
          ) : isEditing ? (
            t("common.saveChanges")
          ) : (
            t("doctor.addClinic")
          )}
        </Button>
      </div>
    </form>
  );
}
