"use client";

import { useState } from "react";
import {
  Search,
  Frown,
  Loader2,
  Eye,
  Calendar,
  Phone,
  User,
  Building,
  CreditCard,
  XCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Filter,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  useAdminAppointments,
  useAdminAppointmentStatistics,
  useUpdateAdminAppointment,
  AdminAppointment,
  AppointmentStatus,
  PaymentStatus,
  useAdminSpecialties,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

const statusOptions: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const paymentStatusOptions: PaymentStatus[] = ["PENDING", "PAID", "REFUNDED"];

export function AdminAppointmentsList() {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<AppointmentStatus | undefined>(
    undefined,
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>(
    undefined,
  );
  const [date, setDate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [specialtyId, setSpecialtyId] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filters = {
    page,
    limit,
    search,
    status,
    paymentStatus,
    specialtyId,
    date: date || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const {
    data: appointmentsResponse,
    isLoading,
    isError,
  } = useAdminAppointments(filters);
  const appointments = appointmentsResponse?.data || [];
  const meta = appointmentsResponse?.meta;

  const { data: statistics } = useAdminAppointmentStatistics({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { data: specialtiesData } = useAdminSpecialties({ limit: 100 });
  const specialties = specialtiesData?.data || [];

  const updateAppointment = useUpdateAdminAppointment();

  const [selectedAppointment, setSelectedAppointment] =
    useState<AdminAppointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleViewDetails = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleOpenCancel = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setCancellationReason("");
    setIsCancelDialogOpen(true);
  };

  const handleCancelAppointment = () => {
    if (!selectedAppointment) return;

    updateAppointment.mutate(
      {
        id: selectedAppointment.id,
        status: "CANCELLED",
        cancellationReason: cancellationReason || "Cancelled by admin",
      },
      {
        onSuccess: () => {
          setIsCancelDialogOpen(false);
          setSelectedAppointment(null);
          setCancellationReason("");
        },
      },
    );
  };

  const handleUpdateStatus = (
    appointment: AdminAppointment,
    newStatus: AppointmentStatus,
  ) => {
    updateAppointment.mutate({
      id: appointment.id,
      status: newStatus,
    });
  };

  const handleUpdatePaymentStatus = (
    appointment: AdminAppointment,
    newPaymentStatus: PaymentStatus,
  ) => {
    updateAppointment.mutate({
      id: appointment.id,
      paymentStatus: newPaymentStatus,
    });
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} ${t("common.currency")}`;
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

  const getStatusBadge = (status: AppointmentStatus) => {
    const variants: Record<
      AppointmentStatus,
      "default" | "secondary" | "success" | "warning" | "error" | "outline"
    > = {
      PENDING: "warning",
      CONFIRMED: "default",
      CHECKED_IN: "secondary",
      IN_PROGRESS: "default",
      COMPLETED: "success",
      CANCELLED: "error",
      NO_SHOW: "error",
    };
    return (
      <Badge variant={variants[status]}>
        {t(`status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants: Record<
      PaymentStatus,
      "default" | "success" | "warning" | "error"
    > = {
      PENDING: "warning",
      PAID: "success",
      REFUNDED: "error",
    };
    return (
      <Badge variant={variants[status]}>
        {t(`payment.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.appointments.total")}
                </p>
                <p className="text-2xl font-bold">
                  {statistics?.totalAppointments || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.appointments.completed")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics?.completed || 0}
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
                  {t("admin.appointments.pending")}
                </p>
                <p className="text-2xl font-bold text-warning-600">
                  {statistics?.pending || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.appointments.revenue")}
                </p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(statistics?.paidRevenue || 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
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
                placeholder={t("admin.appointments.searchPlaceholder")}
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
                value={status || "all"}
                onValueChange={(value) => {
                  setStatus(
                    value === "all" ? undefined : (value as AppointmentStatus),
                  );
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t("admin.appointments.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`status.${s.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={paymentStatus || "all"}
                onValueChange={(value) => {
                  setPaymentStatus(
                    value === "all" ? undefined : (value as PaymentStatus),
                  );
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t("payment.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {paymentStatusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`payment.${s.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DatePickerInput
                value={date}
                onChange={(val) => {
                  setDate(val);
                  setPage(1);
                }}
                placeholder={t("admin.appointments.date")}
                className="w-44"
              />

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex gap-4 mt-4 pt-4 border-t flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <Label>{t("admin.appointments.dateFrom")}</Label>
                <DatePickerInput
                  value={dateFrom}
                  onChange={(val) => {
                    setDateFrom(val);
                    setDate("");
                    setPage(1);
                  }}
                  placeholder={t("admin.appointments.dateFrom")}
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <Label>{t("admin.appointments.dateTo")}</Label>
                <DatePickerInput
                  value={dateTo}
                  onChange={(val) => {
                    setDateTo(val);
                    setDate("");
                    setPage(1);
                  }}
                  placeholder={t("admin.appointments.dateTo")}
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <Label>{t("admin.appointments.filterBySpecialty")}</Label>
                <Select
                  value={specialtyId || "all"}
                  onValueChange={(value) => {
                    setSpecialtyId(value === "all" ? undefined : value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("admin.appointments.filterBySpecialty")}
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
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setDate("");
                    setStatus(undefined);
                    setPaymentStatus(undefined);
                    setSpecialtyId(undefined);
                    setSearch("");
                    setSearchInput("");
                    setPage(1);
                  }}
                >
                  {t("common.clearFilters")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("admin.appointments.list")} ({meta?.total || 0})
          </h3>

          {appointments.length === 0 ? (
            <div className="text-center py-10">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {t("admin.appointments.noAppointments")}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("admin.appointments.bookingNumber")}
                    </TableHead>
                    <TableHead>{t("admin.appointments.patient")}</TableHead>
                    <TableHead>{t("admin.appointments.doctor")}</TableHead>
                    <TableHead>{t("admin.appointments.date")}</TableHead>
                    <TableHead>{t("admin.appointments.service")}</TableHead>
                    <TableHead>{t("admin.appointments.price")}</TableHead>
                    <TableHead>{t("admin.appointments.status")}</TableHead>
                    <TableHead>{t("payment.status")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-mono text-sm">
                        {appointment.bookingNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {appointment.patientName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.bookedForPatient?.user.phoneNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {appointment.clinic?.doctorProfile?.user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.clinic?.doctorProfile?.specialty &&
                              getLocalizedText(
                                appointment.clinic.doctorProfile.specialty.name,
                                locale,
                              )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(appointment.appointmentDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLocalizedText(appointment.serviceName, locale)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(appointment.price)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={appointment.status}
                          onValueChange={(value) =>
                            handleUpdateStatus(
                              appointment,
                              value as AppointmentStatus,
                            )
                          }
                          disabled={
                            appointment.status === "COMPLETED" ||
                            appointment.status === "CANCELLED"
                          }
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                {t(`status.${s.toLowerCase()}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={appointment.paymentStatus}
                          onValueChange={(value) =>
                            handleUpdatePaymentStatus(
                              appointment,
                              value as PaymentStatus,
                            )
                          }
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatusOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                {t(`payment.${s.toLowerCase()}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!["COMPLETED", "CANCELLED", "NO_SHOW"].includes(
                            appointment.status,
                          ) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-error-600"
                              onClick={() => handleOpenCancel(appointment)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
            <DialogTitle>{t("admin.appointments.details")}</DialogTitle>
            <DialogDescription>
              {selectedAppointment?.bookingNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("admin.appointments.patientInfo")}
                  </h4>
                  <p>{selectedAppointment.patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.bookedForPatient?.user.phoneNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.bookedForPatient?.user.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {t("admin.appointments.clinicInfo")}
                  </h4>
                  <p>
                    {selectedAppointment.clinic?.name &&
                      getLocalizedText(selectedAppointment.clinic.name, locale)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.clinic?.doctorProfile?.user.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.clinic?.phone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.appointments.date")}
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedAppointment.appointmentDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.appointments.service")}
                  </p>
                  <p className="font-medium">
                    {getLocalizedText(selectedAppointment.serviceName, locale)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.appointments.price")}
                  </p>
                  <p className="font-medium">
                    {formatCurrency(selectedAppointment.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.appointments.queue")}
                  </p>
                  <p className="font-medium">
                    {selectedAppointment.queueNumber || "-"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("admin.appointments.status")}
                  </p>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("payment.status")}
                  </p>
                  {getPaymentStatusBadge(selectedAppointment.paymentStatus)}
                </div>
              </div>

              {selectedAppointment.cancellationReason && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("admin.appointments.cancellationReason")}
                  </p>
                  <p className="text-error-600">
                    {selectedAppointment.cancellationReason}
                  </p>
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

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.appointments.cancelAppointment")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.appointments.cancelConfirm")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t("admin.appointments.cancellationReason")}</Label>
              <Input
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder={t(
                  "admin.appointments.cancellationReasonPlaceholder",
                )}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={updateAppointment.isPending}
            >
              {updateAppointment.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("admin.appointments.confirmCancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
