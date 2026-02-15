"use client";

import { useState } from "react";
import {
  Search,
  Frown,
  Loader2,
  Eye,
  Building,
  Phone,
  User,
  MapPin,
  Stethoscope,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Users,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminClinics,
  useAdminClinicStatistics,
  useUpdateAdminClinic,
  useDeleteAdminClinic,
  AdminClinic,
  useAdminSpecialties,
} from "../hooks";
import { useStates, useCities } from "@/features/locations/hooks/use-locations";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { ScheduleManager } from "@/features/doctor-portal/components/schedule-manager";
import {
  useAdminClinicSchedules,
  useAdminCreateSchedule,
  useAdminUpdateSchedule,
} from "../hooks";

export function AdminClinicsList() {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [specialtyId, setSpecialtyId] = useState<string | undefined>(undefined);
  const [stateId, setStateId] = useState<string | undefined>(undefined);
  const [cityId, setCityId] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filters = {
    page,
    limit,
    search,
    isActive,
    specialtyId,
    stateId,
    cityId,
  };

  const {
    data: clinicsResponse,
    isLoading,
    isError,
  } = useAdminClinics(filters);
  const clinics = clinicsResponse?.data || [];
  const meta = clinicsResponse?.meta;

  const { data: statistics } = useAdminClinicStatistics();
  const { data: specialtiesData } = useAdminSpecialties({ limit: 100 });
  const specialties = specialtiesData?.data || [];
  const { data: statesData } = useStates();
  const states = statesData || [];
  const { data: citiesData } = useCities(stateId);
  const cities = citiesData || [];

  const updateClinic = useUpdateAdminClinic();
  const deleteClinic = useDeleteAdminClinic();

  const [selectedClinic, setSelectedClinic] = useState<AdminClinic | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleClinic, setScheduleClinic] = useState<AdminClinic | null>(
    null,
  );
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleViewDetails = (clinic: AdminClinic) => {
    setSelectedClinic(clinic);
    setIsDetailsOpen(true);
  };

  const handleManageSchedule = (clinic: AdminClinic) => {
    setScheduleClinic(clinic);
    setIsScheduleOpen(true);
  };

  const handleOpenDelete = (clinic: AdminClinic) => {
    setSelectedClinic(clinic);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClinic = () => {
    if (!selectedClinic) return;

    deleteClinic.mutate(selectedClinic.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedClinic(null);
      },
    });
  };

  const handleToggleActive = (clinic: AdminClinic) => {
    updateClinic.mutate({
      id: clinic.id,
      isActive: !clinic.isActive,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("errors.loadError")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.clinics.total")}
                </p>
                <p className="text-2xl font-bold">
                  {statistics?.totalClinics || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.clinics.active")}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statistics?.activeClinics || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.clinics.inactive")}
                </p>
                <p className="text-2xl font-bold text-warning-600">
                  {statistics?.inactiveClinics || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder={t("admin.clinics.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                inputMode="search"
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select
                value={isActive === undefined ? "all" : isActive.toString()}
                onValueChange={(value) => {
                  setIsActive(value === "all" ? undefined : value === "true");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder={t("admin.clinics.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="true">
                    {t("admin.clinics.activeOnly")}
                  </SelectItem>
                  <SelectItem value="false">
                    {t("admin.clinics.inactiveOnly")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setIsActive(undefined);
                  setSpecialtyId(undefined);
                  setStateId(undefined);
                  setCityId(undefined);
                  setSearch("");
                  setSearchInput("");
                  setPage(1);
                }}
              >
                {t("common.clearFilters")}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex gap-4 mt-4 pt-4 border-t flex-wrap">
              <Select
                value={specialtyId || "all"}
                onValueChange={(value) => {
                  setSpecialtyId(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue
                    placeholder={t("admin.clinics.filterBySpecialty")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.clinics.allSpecialties")}
                  </SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {getLocalizedText(specialty.name, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={stateId || "all"}
                onValueChange={(value) => {
                  setStateId(value === "all" ? undefined : value);
                  setCityId(undefined);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("admin.clinics.filterByState")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.clinics.allStates")}
                  </SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {getLocalizedText(state.name, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={cityId || "all"}
                onValueChange={(value) => {
                  setCityId(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("admin.clinics.filterByCity")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.clinics.allCities")}
                  </SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {getLocalizedText(city.name, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clinics Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("admin.clinics.list")} ({meta?.total || 0})
          </h3>

          {clinics.length === 0 ? (
            <div className="text-center py-10">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {t("admin.clinics.noClinics")}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6 px-6">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.clinics.name")}</TableHead>
                    <TableHead>{t("admin.clinics.doctor")}</TableHead>
                    <TableHead>{t("admin.clinics.specialty")}</TableHead>
                    <TableHead>{t("admin.clinics.location")}</TableHead>
                    <TableHead>{t("admin.clinics.phone")}</TableHead>
                    <TableHead>{t("admin.clinics.status")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {getLocalizedText(clinic.name, locale)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getLocalizedText(clinic.address, locale)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {clinic.doctorProfile?.user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {clinic.doctorProfile?.user.phoneNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {clinic.doctorProfile?.specialty &&
                          getLocalizedText(
                            clinic.doctorProfile.specialty.name,
                            locale,
                          )}
                      </TableCell>
                      <TableCell>
                        {clinic.city && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {getLocalizedText(clinic.city.name, locale)}
                            {clinic.city.state && (
                              <span className="text-muted-foreground">
                                ,{" "}
                                {getLocalizedText(
                                  clinic.city.state.name,
                                  locale,
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {clinic.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={clinic.isActive}
                            onCheckedChange={() => handleToggleActive(clinic)}
                            disabled={updateClinic.isPending}
                          />
                          <Badge
                            variant={clinic.isActive ? "success" : "secondary"}
                          >
                            {clinic.isActive
                              ? t("common.active")
                              : t("common.inactive")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(clinic)}
                            title={t("admin.clinics.details")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleManageSchedule(clinic)}
                            title={t("nav.schedules")}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-error-600"
                            onClick={() => handleOpenDelete(clinic)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              <PaginationControls
                meta={meta}
                page={page}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={(v) => {
                  setLimit(v);
                  setPage(1);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.clinics.details")}</DialogTitle>
            <DialogDescription>
              {selectedClinic && getLocalizedText(selectedClinic.name, locale)}
            </DialogDescription>
          </DialogHeader>

          {selectedClinic && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {t("admin.clinics.clinicInfo")}
                  </h4>
                  <p className="font-medium">
                    {getLocalizedText(selectedClinic.name, locale)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getLocalizedText(selectedClinic.address, locale)}
                  </p>
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    {selectedClinic.phone}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("admin.clinics.doctorInfo")}
                  </h4>
                  <p className="font-medium">
                    {selectedClinic.doctorProfile?.user.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClinic.doctorProfile?.user.phoneNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClinic.doctorProfile?.user.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.clinics.specialty")}
                  </p>
                  <p className="font-medium">
                    {selectedClinic.doctorProfile?.specialty &&
                      getLocalizedText(
                        selectedClinic.doctorProfile.specialty.name,
                        locale,
                      )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.clinics.location")}
                  </p>
                  <p className="font-medium">
                    {selectedClinic.city && (
                      <>
                        {getLocalizedText(selectedClinic.city.name, locale)}
                        {selectedClinic.city.state && (
                          <span>
                            ,{" "}
                            {getLocalizedText(
                              selectedClinic.city.state.name,
                              locale,
                            )}
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.clinics.createdAt")}
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedClinic.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.clinics.status")}
                  </p>
                  <Badge
                    variant={selectedClinic.isActive ? "success" : "secondary"}
                  >
                    {selectedClinic.isActive
                      ? t("common.active")
                      : t("common.inactive")}
                  </Badge>
                </div>
              </div>

              {selectedClinic._count && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold">
                      {selectedClinic._count.appointments}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.clinics.appointments")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold">
                      {selectedClinic._count.services}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.clinics.services")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold">
                      {selectedClinic._count.schedules}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.clinics.schedules")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold">
                      {selectedClinic._count.secretaryAssignments}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.clinics.secretaries")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.clinics.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.clinics.deleteConfirm", {
                name: selectedClinic
                  ? getLocalizedText(selectedClinic.name, locale)
                  : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClinic}
              className="bg-error-600 hover:bg-error-700"
              disabled={deleteClinic.isPending}
            >
              {deleteClinic.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule Management Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("nav.schedules")}
            </DialogTitle>
            <DialogDescription>
              {scheduleClinic && getLocalizedText(scheduleClinic.name, locale)}
            </DialogDescription>
          </DialogHeader>

          {scheduleClinic && (
            <ScheduleManager
              clinicId={scheduleClinic.id}
              schedulesHook={useAdminClinicSchedules}
              createHook={useAdminCreateSchedule}
              updateHook={useAdminUpdateSchedule}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
