"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Loader2,
  Edit,
  Phone,
  Star,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  usePatientAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../hooks";
import {
  createAddressSchema,
  type AddressFormData,
} from "../schemas/address.schema";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/lib/auth/store";
import {
  usePublicStates,
  usePublicCities,
} from "@/features/doctor-portal/hooks/use-public-locations";
import { getLocalizedText } from "@/lib/utils/multilingual";
import type { PatientAddress } from "@/types/address";
import type { State, City } from "@/types";

type DialogMode = "add" | "edit";

export function PatientAddresses() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<PatientAddress | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<PatientAddress | null>(null);
  const [showOptional, setShowOptional] = useState(false);

  // State/City selection
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [statesSearch, setStatesSearch] = useState("");
  const [statesPage, setStatesPage] = useState(1);
  const [allStates, setAllStates] = useState<State[]>([]);
  const [citiesSearch, setCitiesSearch] = useState("");
  const [citiesPage, setCitiesPage] = useState(1);
  const [allCities, setAllCities] = useState<City[]>([]);

  const statesQuery = usePublicStates({
    search: statesSearch,
    page: statesPage,
  });
  const citiesQuery = usePublicCities({
    stateId: selectedStateId,
    search: citiesSearch,
    page: citiesPage,
  });

  const { data: addresses, isLoading } = usePatientAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const schema = createAddressSchema(locale);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      address: "",
      phoneNumber: user?.phoneNumber || "",
      isDefault: false,
    },
  });

  const openAddDialog = () => {
    setSelectedAddress(null);
    setShowOptional(false);
    setSelectedStateId("");
    setSelectedCityId("");
    reset({
      label: "",
      address: "",
      phoneNumber: user?.phoneNumber || "",
      city: "",
      area: "",
      buildingNumber: "",
      floor: "",
      apartment: "",
      landmark: "",
      notes: "",
      isDefault: false,
    });
    setDialogMode("add");
  };

  const openEditDialog = (addr: PatientAddress) => {
    setSelectedAddress(addr);
    setShowOptional(
      !!(
        addr.city ||
        addr.area ||
        addr.buildingNumber ||
        addr.floor ||
        addr.apartment ||
        addr.landmark ||
        addr.notes
      ),
    );
    // Try to match saved city/area names to state/city IDs
    if (addr.city && allStates.length > 0) {
      const matchedState = allStates.find(
        (s) =>
          getLocalizedText(s.name, locale) === addr.city ||
          getLocalizedText(s.name, "ar") === addr.city ||
          getLocalizedText(s.name, "en") === addr.city,
      );
      if (matchedState) {
        setSelectedStateId(matchedState.id);
      } else {
        setSelectedStateId("");
      }
    } else {
      setSelectedStateId("");
    }
    setSelectedCityId("");
    reset({
      label: addr.label,
      address: addr.address,
      phoneNumber: addr.phoneNumber,
      city: addr.city || "",
      area: addr.area || "",
      buildingNumber: addr.buildingNumber || "",
      floor: addr.floor || "",
      apartment: addr.apartment || "",
      landmark: addr.landmark || "",
      notes: addr.notes || "",
      isDefault: addr.isDefault,
    });
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedAddress(null);
    setSelectedStateId("");
    setSelectedCityId("");
    reset();
  };

  const onSubmit = async (data: AddressFormData) => {
    // Resolve state/city names from selected IDs
    const selectedState = allStates.find((s) => s.id === selectedStateId);
    const selectedCity = allCities.find((c) => c.id === selectedCityId);
    const cityName = selectedState
      ? getLocalizedText(selectedState.name, locale)
      : data.city || undefined;
    const areaName = selectedCity
      ? getLocalizedText(selectedCity.name, locale)
      : data.area || undefined;

    const payload = {
      label: data.label,
      address: data.address,
      phoneNumber: data.phoneNumber,
      city: cityName || undefined,
      area: areaName || undefined,
      buildingNumber: data.buildingNumber || undefined,
      floor: data.floor || undefined,
      apartment: data.apartment || undefined,
      landmark: data.landmark || undefined,
      notes: data.notes || undefined,
      isDefault: data.isDefault,
    };

    if (dialogMode === "add") {
      await createMutation.mutateAsync(payload);
    } else if (dialogMode === "edit" && selectedAddress) {
      await updateMutation.mutateAsync({
        addressId: selectedAddress.id,
        ...payload,
      });
    }
    closeDialog();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultMutation.mutate(addressId);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Accumulate states across pages
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

  // Accumulate cities across pages
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
    setSelectedCityId("");
  }, [selectedStateId]);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 me-2" />
          {t("addresses.addAddress")}
        </Button>
      </div>

      {/* Address List */}
      {addresses && addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`transition-colors ${addr.isDefault ? "border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      addr.isDefault
                        ? "bg-primary-100 dark:bg-primary-900/30"
                        : "bg-muted"
                    }`}
                  >
                    <MapPin
                      className={`h-5 w-5 ${addr.isDefault ? "text-primary-600 dark:text-primary-400" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 me-1" />
                          {t("addresses.defaultBadge")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {addr.address}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {addr.phoneNumber}
                      </span>
                      {(addr.city || addr.area) && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {[addr.city, addr.area].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!addr.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        {setDefaultMutation.isPending &&
                        setDefaultMutation.variables === addr.id ? (
                          <Loader2 className="h-3 w-3 animate-spin me-1" />
                        ) : null}
                        {t("addresses.setDefault")}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(addr)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-error-600 hover:text-error-700 hover:bg-error-50"
                      onClick={() => setDeleteTarget(addr)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">
                {t("addresses.noAddresses")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("addresses.noAddressesDescription")}
              </p>
              <Button className="mt-4" onClick={openAddDialog}>
                <Plus className="h-4 w-4 me-2" />
                {t("addresses.addAddress")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>
              {dialogMode === "add"
                ? t("addresses.addAddress")
                : t("addresses.editAddress")}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Label */}
              <div className="space-y-2">
                <Label htmlFor="addr-label" required>
                  {t("addresses.label")}
                </Label>
                <Input
                  id="addr-label"
                  {...register("label")}
                  placeholder={t("addresses.labelPlaceholder")}
                  error={!!errors.label}
                />
                {errors.label && (
                  <p className="text-sm text-error-600">
                    {errors.label.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="addr-address" required>
                  {t("addresses.address")}
                </Label>
                <Textarea
                  id="addr-address"
                  {...register("address")}
                  placeholder={t("addresses.addressPlaceholder")}
                  rows={2}
                />
                {errors.address && (
                  <p className="text-sm text-error-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="addr-phone" required>
                  {t("addresses.phoneNumber")}
                </Label>
                <Input
                  id="addr-phone"
                  {...register("phoneNumber")}
                  placeholder={t("addresses.phoneNumberPlaceholder")}
                  icon={<Phone className="h-4 w-4" />}
                  iconPosition="start"
                  error={!!errors.phoneNumber}
                  dir="ltr"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-error-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Optional Details Toggle */}
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between text-muted-foreground"
                onClick={() => setShowOptional(!showOptional)}
              >
                {t("addresses.optionalDetails")}
                {showOptional ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {showOptional && (
                <div className="space-y-4 border-t pt-4">
                  {/* State (City) & City (Area) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{t("addresses.city")}</Label>
                      <SearchableSelect
                        options={allStates.map((state) => ({
                          value: state.id,
                          label: getLocalizedText(state.name, locale) || "",
                          icon: <MapPin className="h-4 w-4" />,
                        }))}
                        value={selectedStateId}
                        onValueChange={(value) => {
                          setSelectedStateId(value);
                          setSelectedCityId("");
                        }}
                        placeholder={t("addresses.cityPlaceholder")}
                        loading={statesQuery.isLoading && statesPage === 1}
                        clearable
                        onSearchChange={handleStatesSearch}
                        hasMore={statesQuery.data?.meta.hasNextPage}
                        onLoadMore={handleStatesLoadMore}
                        serverLoading={statesQuery.isFetching}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("addresses.area")}</Label>
                      <SearchableSelect
                        options={allCities.map((city) => ({
                          value: city.id,
                          label: getLocalizedText(city.name, locale) || "",
                          icon: <Building2 className="h-4 w-4" />,
                        }))}
                        value={selectedCityId}
                        onValueChange={setSelectedCityId}
                        placeholder={
                          !selectedStateId
                            ? t("addresses.selectCityFirst")
                            : t("addresses.areaPlaceholder")
                        }
                        disabled={!selectedStateId}
                        loading={citiesQuery.isLoading && citiesPage === 1}
                        clearable
                        onSearchChange={handleCitiesSearch}
                        hasMore={citiesQuery.data?.meta.hasNextPage}
                        onLoadMore={handleCitiesLoadMore}
                        serverLoading={citiesQuery.isFetching}
                      />
                    </div>
                  </div>

                  {/* Building, Floor, Apartment */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="addr-building">
                        {t("addresses.buildingNumber")}
                      </Label>
                      <Input
                        id="addr-building"
                        {...register("buildingNumber")}
                        placeholder={t("addresses.buildingNumberPlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addr-floor">{t("addresses.floor")}</Label>
                      <Input
                        id="addr-floor"
                        {...register("floor")}
                        placeholder={t("addresses.floorPlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addr-apt">
                        {t("addresses.apartment")}
                      </Label>
                      <Input
                        id="addr-apt"
                        {...register("apartment")}
                        placeholder={t("addresses.apartmentPlaceholder")}
                      />
                    </div>
                  </div>

                  {/* Landmark */}
                  <div className="space-y-2">
                    <Label htmlFor="addr-landmark">
                      {t("addresses.landmark")}
                    </Label>
                    <Input
                      id="addr-landmark"
                      {...register("landmark")}
                      placeholder={t("addresses.landmarkPlaceholder")}
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="addr-notes">{t("addresses.notes")}</Label>
                    <Textarea
                      id="addr-notes"
                      {...register("notes")}
                      placeholder={t("addresses.notesPlaceholder")}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Default Switch */}
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="addr-default" className="cursor-pointer">
                  {t("addresses.isDefault")}
                </Label>
                <Switch
                  id="addr-default"
                  checked={watch("isDefault") || false}
                  onCheckedChange={(checked) => setValue("isDefault", checked)}
                />
              </div>
            </div>

            <DialogFooter className="px-6 pb-6 pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={closeDialog}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {t("common.saving")}
                  </>
                ) : dialogMode === "add" ? (
                  t("addresses.addAddress")
                ) : (
                  t("common.saveChanges")
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("addresses.deleteAddress")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("addresses.confirmDeleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error-600 hover:bg-error-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <Trash2 className="h-4 w-4 me-2" />
              )}
              {t("addresses.deleteAddress")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
