"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { ApiError } from "@/types/models";
import { extractApiError } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useClinicServices, useClinicPrepaymentInfo } from "../hooks/use-clinics";
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
}

export function BookingWidget({ clinicId }: BookingWidgetProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  // State
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    // Start from Saturday
    const diff = day === 6 ? 0 : day + 1;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() - diff);
    return saturday;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
        setBookingResult({
          bookingNumber: data.bookingNumber || "",
          price: data.price || selectedService?.price as number || 0,
          paymentAccounts: prepaymentInfo.paymentAccounts,
          whatsappNumber: prepaymentInfo.prepaymentWhatsapp,
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
      // Redirect to login with return URL
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
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {formatDate(weekStart, "MMM yyyy")}
              </span>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={goToNextWeek}
              >
                <ChevronLeft className="h-4 w-4" />
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
        />
      )}
    </Card>
  );
}
