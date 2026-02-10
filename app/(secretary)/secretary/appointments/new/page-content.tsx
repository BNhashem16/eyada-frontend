"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  User,
  Loader2,
  Plus,
  AlertCircle,
  ArrowRight,
  Building2,
  Stethoscope,
  Search,
  CheckCircle2,
  Copy,
  ExternalLink,
  Clock,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DateOfBirthInput } from "@/components/ui/date-of-birth-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import {
  useSecretaryClinics,
  useCreateAppointment,
} from "@/features/secretary";
import { useSecretaryPatients } from "@/features/secretary/hooks/use-secretary-patients";
import { useSecretaryClinicSchedules } from "@/features/secretary/hooks/use-secretary-schedules";
import { useClinicServices } from "@/features/clinics/hooks/use-clinics";
import {
  utcTimeToLocal,
  formatDate,
  getWeekDays,
  addDays,
  isSameDay,
  isToday,
  isBefore,
} from "@/lib/utils/date";
import { DayOfWeek } from "@/types/enums";

const getDayNames = (
  t: (key: string) => string,
): Record<DayOfWeek, string> => ({
  [DayOfWeek.SUNDAY]: t("days.sunday"),
  [DayOfWeek.MONDAY]: t("days.monday"),
  [DayOfWeek.TUESDAY]: t("days.tuesday"),
  [DayOfWeek.WEDNESDAY]: t("days.wednesday"),
  [DayOfWeek.THURSDAY]: t("days.thursday"),
  [DayOfWeek.FRIDAY]: t("days.friday"),
  [DayOfWeek.SATURDAY]: t("days.saturday"),
});

const dayOrder = [
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

export function SecretaryNewAppointmentContent() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const dayNames = getDayNames(t);

  // Week calendar state
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 6 ? 0 : day + 1;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() - diff);
    return saturday;
  });

  // Form state
  const [selectedClinic, setSelectedClinic] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  const [patientDateOfBirth, setPatientDateOfBirth] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");

  // Week days
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const canGoPrevious = !isBefore(
    addDays(weekStart, -7),
    addDays(new Date(), -1),
  );

  const goToPreviousWeek = () => {
    if (canGoPrevious) {
      setWeekStart(addDays(weekStart, -7));
    }
  };

  const goToNextWeek = () => {
    const maxDate = addDays(new Date(), 60);
    const newStart = addDays(weekStart, 7);
    if (isBefore(newStart, maxDate)) {
      setWeekStart(newStart);
    }
  };

  // Success dialog state
  const [successData, setSuccessData] = useState<{
    bookingNumber: string;
    queueNumber: number;
  } | null>(null);

  // Data fetching
  const { data: clinics, isLoading: clinicsLoading } = useSecretaryClinics();
  const { data: services, isLoading: servicesLoading } =
    useClinicServices(selectedClinic);
  const { data: patientsData, isLoading: patientsLoading } =
    useSecretaryPatients({
      search: patientName.trim().length >= 2 ? patientName.trim() : "",
      limit: 5,
    });
  const { data: schedules, isLoading: schedulesLoading } =
    useSecretaryClinicSchedules(selectedClinic);

  const createAppointment = useCreateAppointment();

  // Reset dependent fields when clinic changes
  useEffect(() => {
    setSelectedService("");
    setSelectedDate(null);
  }, [selectedClinic]);

  const selectedClinicData = clinics?.find((c) => c.id === selectedClinic);
  const selectedServiceData = services?.find((s) => s.id === selectedService);

  const sortedSchedules = schedules
    ? [...schedules]
        .filter((s) => s.isActive)
        .sort(
          (a, b) =>
            dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek),
        )
    : [];

  const canSubmit =
    selectedClinic &&
    selectedService &&
    selectedDate &&
    patientName.trim().length >= 2 &&
    patientDateOfBirth;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      const result = await createAppointment.mutateAsync({
        clinicId: selectedClinic,
        serviceTypeId: selectedService,
        appointmentDate: formatDate(selectedDate!, "yyyy-MM-dd"),
        patientName: patientName.trim(),
        patientDateOfBirth,
        patientPhone: patientPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        symptoms: symptoms.trim() || undefined,
      });

      setSuccessData({
        bookingNumber: result.bookingNumber,
        queueNumber: result.queueNumber ?? 0,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.somethingWentWrong");
      toast({
        title: t("toast.error"),
        description: errorMessage,
        variant: "error",
      });
    }
  };

  const trackingUrl = successData
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/track/${successData.bookingNumber}`
    : "";

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    toast({
      title: t("toast.success"),
      description: t("secretary.linkCopied"),
      variant: "success",
    });
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const patients = patientsData?.data ?? [];

  // Fill patient fields from search result
  const fillFromPatient = (name: string, dob?: string, phone?: string) => {
    setPatientName(name);
    if (dob) setPatientDateOfBirth(dob.split("T")[0]);
    if (phone) setPatientPhone(phone);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">
              {t("secretary.bookAppointment")}
            </h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {t("secretary.bookAppointmentDesc")}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          <ArrowRight className="h-4 w-4 ms-2" />
          {t("common.back")}
        </Button>
      </div>

      {/* No Clinics Warning */}
      {!clinicsLoading && (!clinics || clinics.length === 0) && (
        <Alert className="bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">{t("secretary.noClinicsAssigned")}</p>
            <p className="text-sm text-muted-foreground">
              {t("secretary.contactAdmin")}
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          {/* Patient Information */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                {t("secretary.patientInfo")}
              </CardTitle>
              <CardDescription>
                {t("secretary.walkInPatientHint")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Patient Name with inline search */}
              <div className="space-y-2">
                <Label>{t("patient.fullName")} *</Label>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={t("secretary.searchOrEnterName")}
                    className="ps-9"
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Search Results - show when typing 2+ chars and results exist */}
              {patientName.trim().length >= 2 && (patientsLoading || patients.length > 0) && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {patientsLoading ? (
                    <div className="p-3 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : (
                    patients.map((patient) => (
                      <div
                        key={patient.id}
                        className="border-b last:border-b-0"
                      >
                        <button
                          type="button"
                          className="w-full p-2.5 text-start hover:bg-muted/50 transition-colors flex items-center gap-3"
                          onClick={() =>
                            fillFromPatient(
                              patient.user?.fullName || "",
                              patient.dateOfBirth,
                              patient.user?.phoneNumber,
                            )
                          }
                        >
                          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {patient.user?.fullName || t("common.unknown")}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {patient.user?.phoneNumber || "-"}
                              {patient.dateOfBirth && (
                                <>
                                  {" "}• {calculateAge(patient.dateOfBirth)}{" "}
                                  {t("family.yearsOld")}
                                </>
                              )}
                            </p>
                          </div>
                        </button>

                        {/* Family Members */}
                        {patient.familyMembers &&
                          patient.familyMembers.length > 0 && (
                            <div className="bg-muted/30 border-t">
                              {patient.familyMembers.map((member) => (
                                <button
                                  key={member.id}
                                  type="button"
                                  className="w-full p-2.5 ps-12 text-start hover:bg-muted/50 transition-colors flex items-center gap-2 border-t border-dashed first:border-t-0"
                                  onClick={() =>
                                    fillFromPatient(
                                      member.fullName ||
                                        member.user?.fullName ||
                                        "",
                                      member.dateOfBirth,
                                      patient.user?.phoneNumber,
                                    )
                                  }
                                >
                                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-medium truncate">
                                        {member.fullName ||
                                          member.user?.fullName ||
                                          t("common.unknown")}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] shrink-0 px-1.5 py-0"
                                      >
                                        {member.relationshipToHead
                                          ? t(
                                              `family.${member.relationshipToHead.toLowerCase()}`,
                                            )
                                          : member.relationship
                                            ? t(
                                                `family.${member.relationship.toLowerCase()}`,
                                              )
                                            : t("secretary.familyMember")}
                                      </Badge>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Date of Birth & Phone */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("patient.dateOfBirth")} *</Label>
                  <DateOfBirthInput
                    value={patientDateOfBirth}
                    onChange={(val) => setPatientDateOfBirth(val)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {t("patient.phoneNumber")}
                  </Label>
                  <Input
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder={t("placeholder.phone")}
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Age display */}
              {patientDateOfBirth && (
                <p className="text-sm text-muted-foreground">
                  {t("family.age")}:{" "}
                  <span className="font-medium text-foreground">
                    {calculateAge(patientDateOfBirth)} {t("family.yearsOld")}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Clinic & Service Selection */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                {t("secretary.clinicAndService")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("secretary.selectClinic")} *</Label>
                  <SearchableSelect
                    options={
                      clinics?.map((clinic) => ({
                        value: clinic.id,
                        label: getLocalizedText(clinic.name, locale),
                        icon: <Building2 className="h-4 w-4" />,
                      })) || []
                    }
                    value={selectedClinic}
                    onValueChange={setSelectedClinic}
                    placeholder={t("secretary.selectClinic")}
                    searchPlaceholder={t("common.search")}
                    emptyMessage={t("common.noResults")}
                    loading={clinicsLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("secretary.selectService")} *</Label>
                  <SearchableSelect
                    options={
                      services
                        ?.filter((s) => s.isActive)
                        .map((service) => ({
                          value: service.id,
                          label: `${getLocalizedText(service.name, locale)} - ${service.price} ${t("common.egp")}`,
                          description: service.duration
                            ? `${service.duration} ${t("services.minute")}`
                            : undefined,
                          icon: <Stethoscope className="h-4 w-4" />,
                        })) || []
                    }
                    value={selectedService}
                    onValueChange={setSelectedService}
                    placeholder={t("secretary.selectService")}
                    searchPlaceholder={t("common.search")}
                    emptyMessage={
                      servicesLoading
                        ? t("common.loading")
                        : t("clinics.noServicesAvailable")
                    }
                    disabled={!selectedClinic}
                    loading={servicesLoading}
                  />
                </div>
              </div>

              {selectedServiceData && (
                <div className="p-3 sm:p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium">
                        {getLocalizedText(selectedServiceData.name, locale)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary-600">
                        {selectedServiceData.price} {t("common.egp")}
                      </Badge>
                      <Badge variant="outline">
                        {selectedServiceData.duration} {t("services.minute")}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Clinic Schedule Display */}
              {selectedClinic && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {t("secretary.clinicSchedule")}
                  </div>
                  {schedulesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : sortedSchedules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("secretary.noSchedules")}
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {sortedSchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border text-sm"
                        >
                          <span className="font-medium">
                            {dayNames[schedule.dayOfWeek]}
                          </span>
                          <div className="flex flex-col items-end gap-0.5">
                            {schedule.shifts.map((shift, idx) => (
                              <span
                                key={idx}
                                className="text-muted-foreground text-xs"
                                dir="ltr"
                              >
                                {utcTimeToLocal(shift.startTime)} -{" "}
                                {utcTimeToLocal(shift.endTime)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date Selection - Week Calendar */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CalendarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                {t("secretary.selectDate")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Week Navigation */}
                <div className="flex items-center justify-between">
                  <Label>{t("appointments.date")} *</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={goToPreviousWeek}
                      disabled={!canGoPrevious || !selectedClinic}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                      {formatDate(weekStart, "MMM yyyy")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={goToNextWeek}
                      disabled={!selectedClinic}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Week Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {weekDays.map((date) => {
                    const isPast = isBefore(date, new Date()) && !isToday(date);
                    const isSelected =
                      selectedDate && isSameDay(date, selectedDate);
                    const today = isToday(date);
                    const isDisabled = isPast || !selectedClinic;

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => !isDisabled && setSelectedDate(date)}
                        disabled={isDisabled}
                        className={cn(
                          "flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-lg text-center transition-all",
                          isDisabled && "opacity-40 cursor-not-allowed",
                          !isDisabled &&
                            "hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer",
                          isSelected &&
                            "bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-600",
                          today && !isSelected && "border-2 border-primary-500",
                        )}
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

                {/* Selected date display */}
                {selectedDate && (
                  <p className="text-sm text-center text-primary-600 dark:text-primary-400 font-medium">
                    {formatDate(selectedDate, "EEEE, d MMMM yyyy")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">
                {t("secretary.additionalInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">{t("appointments.symptoms")}</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setSymptoms(e.target.value)
                  }
                  placeholder={t("secretary.symptomsPlaceholder")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("appointments.notes")}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNotes(e.target.value)
                  }
                  placeholder={t("secretary.notesPlaceholder")}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6 order-1 lg:order-2">
          <Card className="lg:sticky lg:top-4">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">
                {t("secretary.bookingSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Patient Name */}
              <div className="flex items-center justify-between py-2 border-b gap-2">
                <span className="text-sm text-muted-foreground shrink-0">
                  {t("patient.fullName")}
                </span>
                <span className="font-medium text-sm truncate text-end">
                  {patientName || "-"}
                </span>
              </div>

              {/* Patient Age */}
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">
                  {t("family.age")}
                </span>
                <span className="font-medium text-sm">
                  {patientDateOfBirth
                    ? `${calculateAge(patientDateOfBirth)} ${t("family.yearsOld")}`
                    : "-"}
                </span>
              </div>

              {/* Clinic */}
              <div className="flex items-center justify-between py-2 border-b gap-2">
                <span className="text-sm text-muted-foreground shrink-0">
                  {t("appointments.clinic")}
                </span>
                <span className="font-medium text-sm truncate text-end">
                  {selectedClinicData
                    ? getLocalizedText(selectedClinicData.name, locale)
                    : "-"}
                </span>
              </div>

              {/* Service */}
              <div className="flex items-center justify-between py-2 border-b gap-2">
                <span className="text-sm text-muted-foreground shrink-0">
                  {t("appointments.service")}
                </span>
                <span className="font-medium text-sm truncate text-end">
                  {selectedServiceData
                    ? getLocalizedText(selectedServiceData.name, locale)
                    : "-"}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">
                  {t("appointments.date")}
                </span>
                <span className="font-medium text-sm">
                  {selectedDate ? formatDate(selectedDate, "dd/MM/yyyy") : "-"}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  {t("appointments.price")}
                </span>
                <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                  {selectedServiceData
                    ? `${selectedServiceData.price} ${t("common.egp")}`
                    : "-"}
                </span>
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={!canSubmit || createAppointment.isPending}
              >
                {createAppointment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 me-2" />
                    {t("secretary.confirmBooking")}
                  </>
                )}
              </Button>

              {!canSubmit && (
                <p className="text-xs text-center text-muted-foreground">
                  {t("booking.selectAllRequired")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={!!successData} onOpenChange={() => setSuccessData(null)}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center text-xl">
              {t("secretary.bookingSuccess")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("booking.bookingSuccessDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {t("appointments.bookingNumber")}
              </p>
              <p className="font-mono text-lg sm:text-xl font-bold text-primary break-all">
                {successData?.bookingNumber}
              </p>
            </div>

            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {t("appointments.queueNumber")}
              </p>
              <p className="text-3xl font-bold text-primary">
                {successData?.queueNumber}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                {t("secretary.trackingLinkHint")}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={trackingUrl}
                  readOnly
                  className="font-mono text-xs sm:text-sm"
                  dir="ltr"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={copyTrackingLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 me-2" />
                {t("secretary.openTrackingPage")}
              </a>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSuccessData(null);
                router.push("/secretary/appointments");
              }}
            >
              {t("secretary.goToAppointments")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
