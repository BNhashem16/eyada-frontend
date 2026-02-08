"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Frown,
  Loader2,
  MapPin,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useAdminStates,
  useAdminCities,
  useCreateState,
  useUpdateState,
  useDeleteState,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
} from "../hooks";
import { State, City, Multilingual } from "@/types";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

interface StateFormData {
  nameAr: string;
  nameEn: string;
  code: string;
}

interface CityFormData {
  stateId: string;
  nameAr: string;
  nameEn: string;
}

const initialStateForm: StateFormData = { nameAr: "", nameEn: "", code: "" };
const initialCityForm: CityFormData = { stateId: "", nameAr: "", nameEn: "" };

export function LocationsManagement() {
  const { t } = useTranslation();

  const [searchStates, setSearchStates] = useState("");
  const [searchCities, setSearchCities] = useState("");
  const [statesPage, setStatesPage] = useState(1);
  const [statesLimit, setStatesLimit] = useState(50);
  const [citiesPage, setCitiesPage] = useState(1);

  const { data: statesResponse, isLoading: statesLoading } = useAdminStates({
    search: searchStates || undefined,
    page: statesPage,
    limit: statesLimit,
  });
  const { data: citiesResponse } = useAdminCities({
    search: searchCities || undefined,
    page: citiesPage,
    limit: 100,
  });

  const states = statesResponse?.data || [];
  const statesMeta = statesResponse?.meta;
  const cities = citiesResponse?.data || [];

  const createState = useCreateState();
  const updateState = useUpdateState();
  const deleteState = useDeleteState();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();

  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [cityDialogOpen, setCityDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deleteStateId, setDeleteStateId] = useState<string | null>(null);
  const [deleteCityId, setDeleteCityId] = useState<string | null>(null);
  const [stateForm, setStateForm] = useState<StateFormData>(initialStateForm);
  const [cityForm, setCityForm] = useState<CityFormData>(initialCityForm);

  const toggleState = (stateId: string) => {
    setExpandedStates((prev) => {
      const next = new Set(prev);
      if (next.has(stateId)) {
        next.delete(stateId);
      } else {
        next.add(stateId);
      }
      return next;
    });
  };

  const getCitiesForState = (stateId: string) => {
    return cities?.filter((c) => c.stateId === stateId) || [];
  };

  // State handlers
  const handleOpenCreateState = () => {
    setEditingState(null);
    setStateForm(initialStateForm);
    setStateDialogOpen(true);
  };

  const handleOpenEditState = (state: State) => {
    setEditingState(state);
    setStateForm({
      nameAr: state.name.ar,
      nameEn: state.name.en,
      code: state.code || "",
    });
    setStateDialogOpen(true);
  };

  const handleSubmitState = () => {
    const name: Multilingual = { ar: stateForm.nameAr, en: stateForm.nameEn };

    if (editingState) {
      updateState.mutate(
        { id: editingState.id, name, code: stateForm.code || undefined },
        {
          onSuccess: () => {
            setStateDialogOpen(false);
            setEditingState(null);
          },
        },
      );
    } else {
      createState.mutate(
        { name, code: stateForm.code },
        {
          onSuccess: () => {
            setStateDialogOpen(false);
            setStateForm(initialStateForm);
          },
        },
      );
    }
  };

  const handleDeleteState = () => {
    if (!deleteStateId) return;
    deleteState.mutate(deleteStateId, {
      onSuccess: () => setDeleteStateId(null),
    });
  };

  const handleToggleStateActive = (state: State) => {
    updateState.mutate({ id: state.id, isActive: !state.isActive });
  };

  // City handlers
  const handleOpenCreateCity = (stateId: string) => {
    setEditingCity(null);
    setCityForm({ ...initialCityForm, stateId });
    setCityDialogOpen(true);
  };

  const handleOpenEditCity = (city: City) => {
    setEditingCity(city);
    setCityForm({
      stateId: city.stateId,
      nameAr: city.name.ar,
      nameEn: city.name.en,
    });
    setCityDialogOpen(true);
  };

  const handleSubmitCity = () => {
    const name: Multilingual = { ar: cityForm.nameAr, en: cityForm.nameEn };

    if (editingCity) {
      updateCity.mutate(
        { id: editingCity.id, name },
        {
          onSuccess: () => {
            setCityDialogOpen(false);
            setEditingCity(null);
          },
        },
      );
    } else {
      createCity.mutate(
        { stateId: cityForm.stateId, name },
        {
          onSuccess: () => {
            setCityDialogOpen(false);
            setCityForm(initialCityForm);
          },
        },
      );
    }
  };

  const handleDeleteCity = () => {
    if (!deleteCityId) return;
    deleteCity.mutate(deleteCityId, { onSuccess: () => setDeleteCityId(null) });
  };

  const handleToggleCityActive = (city: City) => {
    updateCity.mutate({ id: city.id, isActive: !city.isActive });
  };

  if (statesLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {t("admin.locations.statesAndCities")}
            </h3>
            <Button onClick={handleOpenCreateState}>
              <Plus className="h-4 w-4 me-2" />
              {t("admin.addState")}
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder={t("admin.locations.searchStates")}
              value={searchStates}
              onChange={(e) => {
                setSearchStates(e.target.value);
                setStatesPage(1);
              }}
              className="max-w-sm"
            />
          </div>

          {states.length === 0 ? (
            <div className="text-center py-10">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {t("admin.locations.noStates")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {states
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((state) => {
                  const stateCities = getCitiesForState(state.id);
                  const isExpanded = expandedStates.has(state.id);

                  return (
                    <Collapsible
                      key={state.id}
                      open={isExpanded}
                      onOpenChange={() => toggleState(state.id)}
                    >
                      <div className="border rounded-lg">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted">
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span className="font-medium">
                                {state.name.ar}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                ({state.name.en})
                              </span>
                              <span className="text-xs text-muted-foreground/70">
                                {stateCities.length}{" "}
                                {t("admin.locations.cityCount")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={state.isActive}
                                onCheckedChange={() =>
                                  handleToggleStateActive(state)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditState(state);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-error-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteStateId(state.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t bg-muted p-4">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium text-muted-foreground">
                                {t("admin.cities")}
                              </span>
                              <Button
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleOpenCreateCity(state.id)}
                              >
                                <Plus className="h-3 w-3 me-1" />
                                {t("admin.addCity")}
                              </Button>
                            </div>

                            <div className="flex gap-2 mb-3">
                              <Input
                                placeholder={t("admin.locations.searchCities")}
                                value={searchCities}
                                onChange={(e) => {
                                  setSearchCities(e.target.value);
                                  setCitiesPage(1);
                                }}
                                className="max-w-sm"
                              />
                            </div>

                            {stateCities.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                {t("admin.locations.noCities")}
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {stateCities
                                  .sort((a, b) => a.sortOrder - b.sortOrder)
                                  .map((city) => (
                                    <div
                                      key={city.id}
                                      className="flex items-center justify-between bg-card rounded p-3"
                                    >
                                      <div>
                                        <span className="font-medium">
                                          {city.name.ar}
                                        </span>
                                        <span className="text-muted-foreground text-sm ms-2">
                                          ({city.name.en})
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={city.isActive}
                                          onCheckedChange={() =>
                                            handleToggleCityActive(city)
                                          }
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            handleOpenEditCity(city)
                                          }
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-error-600"
                                          onClick={() =>
                                            setDeleteCityId(city.id)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
            </div>
          )}

          <PaginationControls
            meta={statesMeta}
            page={statesPage}
            onPageChange={setStatesPage}
            limit={statesLimit}
            onLimitChange={(v) => {
              setStatesLimit(v);
              setStatesPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* State Dialog */}
      <Dialog open={stateDialogOpen} onOpenChange={setStateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingState
                ? t("admin.editState")
                : t("admin.locations.addNewState")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("admin.locations.nameArRequired")}</Label>
                <Input
                  value={stateForm.nameAr}
                  onChange={(e) =>
                    setStateForm((f) => ({ ...f, nameAr: e.target.value }))
                  }
                  placeholder={t("placeholder.stateNameAr")}
                />
              </div>
              <div>
                <Label>{t("admin.locations.nameEnRequired")}</Label>
                <Input
                  value={stateForm.nameEn}
                  onChange={(e) =>
                    setStateForm((f) => ({ ...f, nameEn: e.target.value }))
                  }
                  placeholder={t("placeholder.stateNameEn")}
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <Label>{t("admin.locations.code")}</Label>
              <Input
                value={stateForm.code}
                onChange={(e) =>
                  setStateForm((f) => ({ ...f, code: e.target.value }))
                }
                placeholder={t("placeholder.stateCode")}
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setStateDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmitState}
              disabled={
                !stateForm.nameAr ||
                !stateForm.nameEn ||
                createState.isPending ||
                updateState.isPending
              }
            >
              {(createState.isPending || updateState.isPending) && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {editingState ? t("common.update") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* City Dialog */}
      <Dialog open={cityDialogOpen} onOpenChange={setCityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCity
                ? t("admin.editCity")
                : t("admin.locations.addNewCity")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("admin.locations.nameArRequired")}</Label>
                <Input
                  value={cityForm.nameAr}
                  onChange={(e) =>
                    setCityForm((f) => ({ ...f, nameAr: e.target.value }))
                  }
                  placeholder={t("placeholder.cityNameAr")}
                />
              </div>
              <div>
                <Label>{t("admin.locations.nameEnRequired")}</Label>
                <Input
                  value={cityForm.nameEn}
                  onChange={(e) =>
                    setCityForm((f) => ({ ...f, nameEn: e.target.value }))
                  }
                  placeholder={t("placeholder.cityNameEn")}
                  dir="ltr"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCityDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmitCity}
              disabled={
                !cityForm.nameAr ||
                !cityForm.nameEn ||
                createCity.isPending ||
                updateCity.isPending
              }
            >
              {(createCity.isPending || updateCity.isPending) && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {editingCity ? t("common.update") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete State Confirmation */}
      <AlertDialog
        open={!!deleteStateId}
        onOpenChange={() => setDeleteStateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.locations.deleteState")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.locations.deleteStateConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteState}
              className="bg-error-600 hover:bg-error-700"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete City Confirmation */}
      <AlertDialog
        open={!!deleteCityId}
        onOpenChange={() => setDeleteCityId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.locations.deleteCity")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.locations.deleteCityConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCity}
              className="bg-error-600 hover:bg-error-700"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
