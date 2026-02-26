"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Store,
  MapPin,
  Loader2,
  Navigation,
  Phone,
  Plus,
  Trash2,
  Truck,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreatePharmacy, useMyPharmacy, useUpdatePharmacy } from "../hooks";
import {
  usePublicStates,
  usePublicCities,
} from "@/features/doctor-portal/hooks/use-public-locations";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { DeliveryType } from "@/types/enums";
import { buildPharmacyPayload } from "../utils/build-pharmacy-payload";
import type { State, City } from "@/types";

const phoneRegex = /^01[0125][0-9]{8}$/;

const getPharmacySchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("validation.required")).max(200),
    description: z.string().max(2000).optional().or(z.literal("")),
    address: z.string().min(2, t("validation.required")).max(500),
    stateId: z.string().min(1, t("validation.required")),
    cityId: z.string().min(1, t("validation.required")),
    latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
    longitude: z.coerce
      .number()
      .min(-180)
      .max(180)
      .optional()
      .or(z.literal("")),
    phoneNumbers: z
      .array(
        z.object({
          value: z
            .string()
            .regex(phoneRegex, t("validation.phoneInvalid"))
            .or(z.literal("")),
        }),
      )
      .min(1),
    deliveryType: z.nativeEnum(DeliveryType),
    deliveryFee: z.coerce.number().min(0).optional().or(z.literal("")),
    minOrderAmount: z.coerce.number().min(0).optional().or(z.literal("")),
    freeDeliveryThreshold: z.coerce
      .number()
      .min(0)
      .optional()
      .or(z.literal("")),
    isActive: z.boolean(),
  });

type PharmacyFormData = z.infer<ReturnType<typeof getPharmacySchema>>;

interface PharmacyFormProps {
  mode: "create" | "edit";
  pharmacyId?: string;
}

export function PharmacyForm({ mode, pharmacyId }: PharmacyFormProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const createMutation = useCreatePharmacy();
  const updateMutation = useUpdatePharmacy();
  const {
    data: pharmacy,
    isLoading: pharmacyLoading,
    isError,
  } = useMyPharmacy(mode === "edit" ? pharmacyId! : "");

  const mutation = mode === "create" ? createMutation : updateMutation;
  const [formReady, setFormReady] = useState(mode === "create");

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

  const pharmacySchema = getPharmacySchema(t);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      stateId: "",
      cityId: "",
      phoneNumbers: [{ value: "" }],
      deliveryType: DeliveryType.SELF_DELIVERY,
      deliveryFee: "",
      minOrderAmount: "",
      freeDeliveryThreshold: "",
      isActive: true,
    },
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({ control, name: "phoneNumbers" });

  const selectedStateId = watch("stateId");
  const citiesQuery = usePublicCities({
    stateId: selectedStateId,
    search: citiesSearch,
    page: citiesPage,
  });

  const selectedCityId = watch("cityId");

  // Populate form when pharmacy data loads (edit mode)
  useEffect(() => {
    if (mode === "edit" && pharmacy && !formReady) {
      const stateId = pharmacy.city?.state?.id || "";
      reset({
        name: pharmacy.name || "",
        description: pharmacy.description || "",
        address: pharmacy.address || "",
        stateId,
        cityId: pharmacy.cityId || "",
        phoneNumbers:
          pharmacy.phoneNumbers?.length > 0
            ? pharmacy.phoneNumbers.map((p) => ({ value: p }))
            : [{ value: "" }],
        deliveryType: pharmacy.deliveryType || DeliveryType.SELF_DELIVERY,
        deliveryFee: pharmacy.deliveryFee
          ? Number(pharmacy.deliveryFee)
          : ("" as any),
        minOrderAmount: pharmacy.minOrderAmount
          ? Number(pharmacy.minOrderAmount)
          : ("" as any),
        freeDeliveryThreshold: pharmacy.freeDeliveryThreshold
          ? Number(pharmacy.freeDeliveryThreshold)
          : ("" as any),
        isActive: pharmacy.isActive ?? true,
      });

      // Seed the city into allCities so the select shows it
      if (pharmacy.city) {
        setAllCities([pharmacy.city as City]);
      }
      // Seed the state
      if (pharmacy.city?.state) {
        setAllStates((prev) => {
          if (prev.some((s) => s.id === pharmacy.city!.state!.id)) return prev;
          return [pharmacy.city!.state as State, ...prev];
        });
      }

      setFormReady(true);
    }
  }, [mode, pharmacy, formReady, reset]);

  // Accumulate states data
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

  // Accumulate cities data
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

  // Reset cities when state changes (skip on initial load in edit mode)
  useEffect(() => {
    if (formReady) {
      setCitiesSearch("");
      setCitiesPage(1);
      if (mode === "create") {
        setAllCities([]);
      }
    }
  }, [selectedStateId, formReady, mode]);

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

  const onSubmit = async (data: PharmacyFormData) => {
    const payload = buildPharmacyPayload(data);

    if (mode === "edit" && pharmacyId) {
      updateMutation.mutate(
        { pharmacyId, ...payload },
        {
          onSuccess: () => {
            router.push("/pharmacy-owner/pharmacies");
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          router.push("/pharmacy-owner/pharmacies");
        },
      });
    }
  };

  // Loading state (edit mode only)
  if (mode === "edit" && pharmacyLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (edit mode only)
  if (mode === "edit" && (isError || (!pharmacyLoading && !pharmacy))) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-error-500 mb-4" />
          <p className="text-error-600 dark:text-error-400">
            {t("admin.loadError")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("pharmacyOwner.basicInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" required>
              {t("pharmacyOwner.pharmacyName")}
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t("pharmacyOwner.pharmacyNamePlaceholder")}
              className="bg-background text-foreground"
            />
            {errors.name && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t("pharmacyOwner.description")}
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder={t("pharmacyOwner.descriptionPlaceholder")}
              className="bg-background text-foreground min-h-[80px]"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location & Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("pharmacyOwner.locationInfo")}
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
              {errors.cityId && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {errors.cityId.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" required>
              {t("pharmacyOwner.address")}
            </Label>
            <Input
              id="address"
              {...register("address")}
              placeholder={t("pharmacyOwner.addressPlaceholder")}
              className="bg-background text-foreground"
            />
            {errors.address && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {errors.address.message}
              </p>
            )}
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
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="space-y-3">
            <Label>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {t("pharmacyOwner.phoneNumbers")}
              </span>
            </Label>
            {phoneFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    type="tel"
                    inputMode="tel"
                    {...register(`phoneNumbers.${index}.value`)}
                    placeholder="01012345678"
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
                    className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"
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
                {t("pharmacyOwner.addPhoneNumber")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("pharmacyOwner.deliverySettings")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label required>{t("pharmacyOwner.deliveryType")}</Label>
            <Select
              value={watch("deliveryType")}
              onValueChange={(value) =>
                setValue("deliveryType", value as DeliveryType)
              }
            >
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DeliveryType.SELF_DELIVERY}>
                  {t("pharmacyOwner.selfDelivery")}
                </SelectItem>
                <SelectItem value={DeliveryType.PLATFORM_DRIVER}>
                  {t("pharmacyOwner.platformDriver")}
                </SelectItem>
                <SelectItem value={DeliveryType.THIRD_PARTY}>
                  {t("pharmacyOwner.thirdParty")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">
                {t("pharmacyOwner.deliveryFee")} ({t("common.egp")})
              </Label>
              <Input
                id="deliveryFee"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                {...register("deliveryFee")}
                placeholder={t("pharmacyOwner.deliveryFeePlaceholder")}
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">
                {t("pharmacyOwner.minOrderAmount")} ({t("common.egp")})
              </Label>
              <Input
                id="minOrderAmount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                {...register("minOrderAmount")}
                placeholder={t("pharmacyOwner.minOrderAmountPlaceholder")}
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="freeDeliveryThreshold">
                {t("pharmacyOwner.freeDeliveryThreshold")} ({t("common.egp")})
              </Label>
              <Input
                id="freeDeliveryThreshold"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                {...register("freeDeliveryThreshold")}
                placeholder={t(
                  "pharmacyOwner.freeDeliveryThresholdPlaceholder",
                )}
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Checkbox
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", !!checked)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {t("common.active")}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/pharmacy-owner/pharmacies")}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ms-2" />
              {t("common.saving")}
            </>
          ) : mode === "create" ? (
            t("pharmacyOwner.addPharmacy")
          ) : (
            t("common.saveChanges")
          )}
        </Button>
      </div>
    </form>
  );
}
