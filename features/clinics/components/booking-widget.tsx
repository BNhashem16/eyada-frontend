"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  User,
  Users,
  LogIn,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { ApiError } from "@/types/models";
import { extractApiError } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  useClinicServices,
  useClinicPrepaymentInfo,
  useClinic,
} from "../hooks/use-clinics";
import { PrepaymentInstructions } from "./prepayment-instructions";
import { usePatientFamily } from "@/features/patients/hooks/use-patient";
import { useUser, useIsAuthenticated } from "@/lib/auth/store";
import { apiPost } from "@/lib/api";
import { PATIENT_ENDPOINTS } from "@/lib/api/endpoints";
import { useToast } from "@/hooks/use-toast";
import {
  formatDate,
  getWeekDays,
  addDays,
  isSameDay,
  isToday,
  isBefore,
} from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import type { DoctorPaymentAccount } from "@/types";

interface BookingWidgetProps {
  clinicId: string;
  /** Optional: pre-select a date (e.g. when the user chose a day from the
   *  Schedule tab's day picker). The widget will scroll its week view
   *  to contain this date and select it. */
  initialDate?: Date | null;
}

function startOfWeekSaturday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 6 ? 0 : day + 1;
  const saturday = new Date(d);
  saturday.setDate(d.getDate() - diff);
  saturday.setHours(0, 0, 0, 0);
  return saturday;
}

export function BookingWidget({ clinicId, initialDate }: BookingWidgetProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  // State
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeekSaturday(initialDate ?? new Date()),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ?? null,
  );

  // If an external initialDate is supplied later (after mount), sync to it.
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      setWeekStart(startOfWeekSaturday(initialDate));
    }
  }, [initialDate]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [bookingFor, setBookingFor] = useState<"self" | "family">("self");
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] =
    useState<string>("");

  // Prepayment dialog state
  const [showPrepaymentDialog, setShowPrepaymentDialog] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    bookingNumber: string;
    price: number;
    paymentAccounts: DoctorPaymentAccount[];
    whatsappNumber?: string;
    patientName: string;
    appointmentDate: string;
    serviceName: string;
    doctorName: string;
    clinicName: string;
  } | null>(null);

  // Queries
  const {
    data: services,
    isLoading: servicesLoading,
    isError: servicesError,
  } = useClinicServices(clinicId);
  const {
    data: familyMembers,
    isLoading: familyLoading,
    isError: familyError,
  } = usePatientFamily();
  const { data: prepaymentInfo } = useClinicPrepaymentInfo(clinicId);
  const { data: clinic } = useClinic(clinicId);

  // Booking mutation - per Swagger CreateAppointmentDto
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedServiceId) {
        throw new Error(t("booking.selectAllRequired"));
      }

      // Validate family member selection
      if (bookingFor === "family" && !selectedFamilyMemberId) {
        throw new Error(t("booking.selectPatient"));
      }

      // Per Swagger: appointmentDate is YYYY-MM-DD format only
      // patientProfileId is optional - used for booking for family members
      const payload: {
        clinicId: string;
        serviceTypeId: string;
        appointmentDate: string;
        patientProfileId?: string;
      } = {
        clinicId,
        serviceTypeId: selectedServiceId,
        appointmentDate: formatDate(selectedDate, "yyyy-MM-dd"),
      };

      // Add patientProfileId if booking for family member
      if (bookingFor === "family" && selectedFamilyMemberId) {
        payload.patientProfileId = selectedFamilyMemberId;
      }

      return apiPost<{
        bookingNumber?: string;
        price?: number;
        clinic?: {
          doctorProfile?: {
            paymentAccounts?: DoctorPaymentAccount[];
            prepaymentWhatsapp?: string;
          };
        };
        requiresPrepayment?: boolean;
      }>(PATIENT_ENDPOINTS.APPOINTMENTS, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });

      // Check if prepayment is required
      if (
        data?.requiresPrepayment &&
        prepaymentInfo?.requirePrepayment &&
        prepaymentInfo.paymentAccounts.length > 0
      ) {
        // Compute patient name
        const patientName =
          bookingFor === "self"
            ? user?.fullName || user?.name || ""
            : (() => {
                const member = familyMembers?.find(
                  (m) => m.id === selectedFamilyMemberId,
                );
                return (
                  member?.fullName ||
                  member?.user?.fullName ||
                  member?.user?.name ||
                  ""
                );
              })();

        setBookingResult({
          bookingNumber: data.bookingNumber || "",
          price: data.price || (selectedService?.price as number) || 0,
          paymentAccounts: prepaymentInfo.paymentAccounts,
          whatsappNumber: prepaymentInfo.prepaymentWhatsapp,
          patientName,
          appointmentDate: selectedDate
            ? formatDate(selectedDate, "EEEE, d MMMM yyyy")
            : "",
          serviceName:
            getLocalizedText(selectedService?.name, locale) ||
            selectedService?.serviceType ||
            "",
          doctorName: clinic?.doctorProfile?.user?.fullName || "",
          clinicName: getLocalizedText(clinic?.name, locale) || "",
        });
        setShowPrepaymentDialog(true);
      } else {
        toast({
          title: t("booking.bookingSuccessTitle"),
          description: t("booking.bookingSuccessDesc"),
          variant: "success",
        });
        router.push("/patient/appointments");
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      toast({
        title: t("booking.bookingFailedTitle"),
        description: extractApiError(error, t("booking.bookingFailedDesc")),
        variant: "error",
      });
    },
  });

  // Week days
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  // Navigation
  const goToPreviousWeek = () => {
    const newStart = addDays(weekStart, -7);
    if (!isBefore(newStart, addDays(new Date(), -1))) {
      setWeekStart(newStart);
      setSelectedDate(null);
    }
  };

  const goToNextWeek = () => {
    // Allow booking up to 30 days in advance
    const maxDate = addDays(new Date(), 30);
    const newStart = addDays(weekStart, 7);
    if (isBefore(newStart, maxDate)) {
      setWeekStart(newStart);
      setSelectedDate(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast({
        title: t("auth.loginRequiredTitle"),
        description: t("auth.loginRequiredDesc"),
        variant: "warning",
      });
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    if (user?.role !== "PATIENT") {
      toast({
        title: t("booking.notAllowed"),
        description: t("booking.patientRequired"),
        variant: "error",
      });
      return;
    }

    bookingMutation.mutate();
  };

  // Check if can go to previous week
  const canGoPrevious = !isBefore(
    addDays(weekStart, -7),
    addDays(new Date(), -1),
  );

  // Selected service details
  const selectedService = services?.find((s) => s.id === selectedServiceId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          {t("booking.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Guest CTA — always visible for logged-out users so they know
            they must sign in before booking */}
        {!isAuthenticated && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 p-5 sm:p-6 text-white shadow-md">
            <div
              className="pointer-events-none absolute -top-12 -end-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-16 -start-16 h-44 w-44 rounded-full bg-white/5 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                <LogIn className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-base sm:text-lg font-semibold leading-tight">
                  {t("auth.loginRequiredTitle")}
                </h3>
                <p className="text-sm leading-relaxed text-white/85">
                  {t("booking.loginRequiredMessage")}
                </p>
              </div>
            </div>

            <Button
              className="relative mt-4 w-full min-h-[44px] bg-white text-primary-700 hover:bg-white/90 dark:bg-white dark:text-primary-700 dark:hover:bg-white/90 font-semibold shadow-sm"
              size="lg"
              onClick={handleBooking}
              type="button"
            >
              {t("booking.loginToBook")}
            </Button>
          </div>
        )}

        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("booking.selectService")}
          </label>
          {servicesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : servicesError ? (
            <p className="text-sm text-error-600 dark:text-error-400">
              {t("errors.loadError")}
            </p>
          ) : services && services.length > 0 ? (
            <SearchableSelect
              options={services.map((service) => ({
                value: service.id,
                label: `${getLocalizedText(service.name, locale) || service.serviceType} - ${service.price} ${t("common.egp")}`,
                description: service.duration
                  ? `${service.duration} ${t("services.minute")}`
                  : undefined,
              }))}
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
              placeholder={t("booking.selectServiceType")}
              searchPlaceholder={t("common.search")}
              emptyMessage={t("common.noResults")}
              showSearch={services.length > 5}
              clearable={false}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("booking.noServicesAvailable")}
            </p>
          )}
        </div>

        {/* Patient Selection - Only show for authenticated patients */}
        {isAuthenticated && user?.role === "PATIENT" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("booking.bookingFor")}
            </label>
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                variant={bookingFor === "self" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setBookingFor("self");
                  setSelectedFamilyMemberId("");
                }}
              >
                <User className="h-4 w-4 ms-2" />
                {t("booking.bookForSelf")}
              </Button>
              <Button
                type="button"
                variant={bookingFor === "family" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setBookingFor("family")}
              >
                <Users className="h-4 w-4 ms-2" />
                {t("booking.bookForFamily")}
              </Button>
            </div>

            {/* Family Member Selection */}
            {bookingFor === "family" && (
              <>
                {familyLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : familyError ? (
                  <p className="text-sm text-error-600 dark:text-error-400">
                    {t("errors.loadError")}
                  </p>
                ) : familyMembers && familyMembers.length > 0 ? (
                  <SearchableSelect
                    options={familyMembers.map((member) => ({
                      value: member.id,
                      label:
                        member.fullName ||
                        member.user?.fullName ||
                        member.user?.name ||
                        "",
                      description: member.relationship
                        ? t(`family.${member.relationship?.toLowerCase()}`)
                        : undefined,
                    }))}
                    value={selectedFamilyMemberId}
                    onValueChange={setSelectedFamilyMemberId}
                    placeholder={t("booking.selectPatient")}
                    searchPlaceholder={t("common.search")}
                    emptyMessage={t("common.noResults")}
                  />
                ) : (
                  <div className="text-center py-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("booking.noFamilyMembers")}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {t("booking.addFamilyFirst")}
                    </p>
                    <Link href="/patient/family">
                      <Button variant="link" size="sm" className="text-primary">
                        {t("booking.goToFamily")}
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Date Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-foreground">
              {t("booking.selectDay")}
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-xs"
                onClick={goToPreviousWeek}
                disabled={!canGoPrevious}
                aria-label={t("common.previous")}
              >
                {/* prev: arrow points away from "now" toward the past
                    (inline-start of the reading flow) */}
                <ChevronLeft
                  className="h-4 w-4 rtl:hidden"
                  aria-hidden="true"
                />
                <ChevronRight
                  className="h-4 w-4 ltr:hidden"
                  aria-hidden="true"
                />
              </Button>
              <span className="text-sm text-muted-foreground">
                <bdi>{formatDate(weekStart, "MMM yyyy", locale)}</bdi>
              </span>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={goToNextWeek}
                aria-label={t("common.next")}
              >
                <ChevronRight
                  className="h-4 w-4 rtl:hidden"
                  aria-hidden="true"
                />
                <ChevronLeft
                  className="h-4 w-4 ltr:hidden"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDays.map((date) => {
              const isPast = isBefore(date, new Date()) && !isToday(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const today = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isPast && handleDateSelect(date)}
                  disabled={isPast}
                  className={`
                    flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg text-center transition-all
                    ${isPast ? "opacity-40 cursor-not-allowed" : "hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer"}
                    ${isSelected ? "bg-primary-500 text-white hover:bg-primary-600" : ""}
                    ${today && !isSelected ? "border-2 border-primary-500" : ""}
                  `}
                >
                  <span className="text-[10px] sm:text-xs font-medium">
                    {formatDate(date, "EEE")}
                  </span>
                  <span className="text-base sm:text-lg font-bold">
                    {formatDate(date, "d")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary & Book Button */}
        {selectedDate && selectedServiceId && (
          <div className="border-t pt-4 space-y-4">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                {t("booking.summary")}
              </h4>
              <div className="space-y-2 text-sm">
                {/* Show patient name when booking for family */}
                {isAuthenticated && user?.role === "PATIENT" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("booking.bookingFor")}
                    </span>
                    <span className="font-medium">
                      {bookingFor === "self"
                        ? t("booking.bookForSelf")
                        : (() => {
                            const member = familyMembers?.find(
                              (m) => m.id === selectedFamilyMemberId,
                            );
                            return (
                              member?.fullName ||
                              member?.user?.fullName ||
                              member?.user?.name ||
                              t("booking.selectPatient")
                            );
                          })()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("booking.serviceLabel")}
                  </span>
                  <span className="font-medium">
                    {getLocalizedText(selectedService?.name, locale) ||
                      selectedService?.serviceType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("booking.dateLabel")}
                  </span>
                  <span className="font-medium">
                    {formatDate(selectedDate, "EEEE, d MMMM yyyy")}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary-100 dark:border-primary-800">
                  <span className="text-muted-foreground">
                    {t("booking.priceLabel")}
                  </span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {selectedService?.price} {t("common.egp")}
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleBooking}
              disabled={
                bookingMutation.isPending ||
                (bookingFor === "family" && !selectedFamilyMemberId)
              }
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ms-2" />
                  {t("booking.bookingInProgress")}
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 ms-2" />
                  {isAuthenticated
                    ? t("booking.confirmBooking")
                    : t("booking.loginToBook")}
                </>
              )}
            </Button>
          </div>
        )}
        {/* Prepayment Notice */}
        {prepaymentInfo?.requirePrepayment && (
          <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-3">
            <Badge variant="warning" className="mb-1">
              {t("prepayment.badge")}
            </Badge>
            <p className="text-sm text-warning-700 dark:text-warning-300">
              {t("prepayment.importantNote")}
            </p>
          </div>
        )}
      </CardContent>

      {/* Prepayment Instructions Dialog */}
      {bookingResult && (
        <PrepaymentInstructions
          open={showPrepaymentDialog}
          onOpenChange={setShowPrepaymentDialog}
          bookingNumber={bookingResult.bookingNumber}
          price={bookingResult.price}
          paymentAccounts={bookingResult.paymentAccounts}
          whatsappNumber={bookingResult.whatsappNumber}
          patientName={bookingResult.patientName}
          appointmentDate={bookingResult.appointmentDate}
          serviceName={bookingResult.serviceName}
          doctorName={bookingResult.doctorName}
          clinicName={bookingResult.clinicName}
        />
      )}
    </Card>
  );
}
