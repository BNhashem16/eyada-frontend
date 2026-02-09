"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  CalendarIcon,
  Clock,
  User,
  Loader2,
  Plus,
  Building2,
  Stethoscope,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DateOfBirthInput } from "@/components/ui/date-of-birth-input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useSecretaryClinics, useCreateAppointment } from "../hooks";
import {
  useClinicServices,
  useClinicAvailableSlots,
} from "@/features/clinics/hooks/use-clinics";
import { formatTime, utcTimeToLocal } from "@/lib/utils/date";

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookAppointmentDialog({
  open,
  onOpenChange,
}: BookAppointmentDialogProps) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();

  // Form state
  const [selectedClinic, setSelectedClinic] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [patientDateOfBirth, setPatientDateOfBirth] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");

  // Data fetching
  const { data: clinics, isLoading: clinicsLoading } = useSecretaryClinics();
  const { data: services, isLoading: servicesLoading } =
    useClinicServices(selectedClinic);
  const { data: slots, isLoading: slotsLoading } = useClinicAvailableSlots(
    selectedClinic,
    selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
  );

  const createAppointment = useCreateAppointment();

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    setSelectedService("");
    setSelectedDate(undefined);
    setSelectedTime("");
  }, [selectedClinic]);

  useEffect(() => {
    setSelectedTime("");
  }, [selectedDate]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedClinic("");
      setSelectedService("");
      setSelectedDate(undefined);
      setSelectedTime("");
      setPatientName("");
      setPatientDateOfBirth("");
      setPatientPhone("");
      setNotes("");
      setSymptoms("");
    }
  }, [open]);

  const selectedServiceData = services?.find((s) => s.id === selectedService);
  const availableSlots = slots?.filter((slot) => slot.isAvailable) || [];

  const canSubmit =
    selectedClinic &&
    selectedService &&
    selectedDate &&
    selectedTime &&
    patientName.trim() &&
    patientDateOfBirth;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      await createAppointment.mutateAsync({
        clinicId: selectedClinic,
        serviceTypeId: selectedService,
        appointmentDate: format(selectedDate!, "yyyy-MM-dd"),
        patientName: patientName.trim(),
        patientDateOfBirth,
        patientPhone: patientPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        symptoms: symptoms.trim() || undefined,
      });

      toast({
        title: t("toast.success"),
        description: t("secretary.bookingSuccess"),
        variant: "success",
      });

      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary-600" />
            {t("secretary.bookAppointment")}
          </DialogTitle>
          <DialogDescription>
            {t("secretary.bookAppointmentDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("secretary.patientInfo")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patientName">
                  {t("appointments.patientName")} *
                </Label>
                <Input
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder={t("appointments.patientName")}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientDateOfBirth">
                  {t("secretary.patientDateOfBirth")} *
                </Label>
                <DateOfBirthInput
                  value={patientDateOfBirth}
                  onChange={(val) => setPatientDateOfBirth(val)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientPhone">
                {t("secretary.patientPhone")}
              </Label>
              <Input
                id="patientPhone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
              />
            </div>
          </div>

          <Separator />

          {/* Clinic Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("secretary.clinicAndService")}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("secretary.selectClinic")}</Label>
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
                <Label>{t("secretary.selectService")}</Label>
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
              <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("secretary.selectedService")}:
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {getLocalizedText(selectedServiceData.name, locale)}
                      </Badge>
                      <Badge className="bg-primary-600">
                        {selectedServiceData.price} {t("common.egp")}
                      </Badge>
                      <Badge variant="outline">
                        {selectedServiceData.duration} {t("services.minute")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Date & Time Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {t("secretary.dateAndTime")}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("secretary.selectDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start",
                        !selectedDate && "text-muted-foreground",
                      )}
                      disabled={!selectedClinic}
                    >
                      <CalendarIcon className="me-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "dd MMMM yyyy", { locale: ar })
                        : t("secretary.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>{t("secretary.selectTime")}</Label>
                <SearchableSelect
                  options={availableSlots.map((slot) => ({
                    value: slot.time,
                    label: utcTimeToLocal(slot.time),
                    icon: <Clock className="h-4 w-4" />,
                  }))}
                  value={selectedTime}
                  onValueChange={setSelectedTime}
                  placeholder={t("secretary.selectTime")}
                  emptyMessage={t("clinics.noSlotsAvailable")}
                  disabled={!selectedDate || !selectedClinic}
                  loading={slotsLoading}
                  showSearch={availableSlots.length > 6}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("secretary.additionalInfo")}
            </h3>

            <div className="space-y-2">
              <Label htmlFor="symptoms">{t("appointments.symptoms")}</Label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setSymptoms(e.target.value)
                }
                placeholder={t("secretary.symptomsPlaceholder")}
                rows={2}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-end mt-1">
                {symptoms.length}/500
              </p>
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
                rows={2}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-end mt-1">
                {notes.length}/500
              </p>
            </div>
          </div>

          {/* Summary */}
          {canSubmit && (
            <Alert className="bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
              <AlertDescription>
                <div className="text-sm space-y-1">
                  <p className="font-medium text-success-800 dark:text-success-400">
                    {t("secretary.bookingSummary")}
                  </p>
                  <div className="text-success-700 dark:text-success-500">
                    <span>
                      {getLocalizedText(
                        clinics?.find((c) => c.id === selectedClinic)?.name,
                        locale,
                      )}
                    </span>
                    {" - "}
                    <span>
                      {getLocalizedText(selectedServiceData?.name, locale)}
                    </span>
                    {" - "}
                    <span>{format(selectedDate!, "dd/MM/yyyy")}</span>
                    {" - "}
                    <span dir="ltr">{formatTime(selectedTime)}</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
