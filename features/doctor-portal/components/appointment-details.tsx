"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Building2,
  User,
  Phone,
  Mail,
  CreditCard,
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Stethoscope,
  Pill,
  ClipboardList,
  Save,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  useDoctorAppointment,
  useGetMedicalNotes,
  useUpdateAppointmentStatus,
  useAddMedicalNotes,
} from "../hooks/use-doctor-portal";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { AppointmentStatus, PaymentStatus } from "@/types/enums";
import { formatDate } from "@/lib/utils/date";
import { getInitials } from "@/lib/utils";
import { getLocalizedText } from "@/lib/utils/multilingual";

interface AppointmentDetailsProps {
  appointmentId: string;
}

const getStatusConfig = (
  t: (key: string) => string,
): Record<
  AppointmentStatus,
  { label: string; color: string; icon: React.ReactNode }
> => ({
  [AppointmentStatus.PENDING]: {
    label: t("status.pending"),
    color:
      "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  [AppointmentStatus.CONFIRMED]: {
    label: t("status.confirmed"),
    color:
      "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  [AppointmentStatus.CHECKED_IN]: {
    label: t("status.checkedIn"),
    color:
      "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  [AppointmentStatus.IN_PROGRESS]: {
    label: t("status.inProgress"),
    color: "bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400",
    icon: <Stethoscope className="h-4 w-4" />,
  },
  [AppointmentStatus.COMPLETED]: {
    label: t("status.completed"),
    color: "bg-muted text-muted-foreground",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  [AppointmentStatus.CANCELLED]: {
    label: t("status.cancelled"),
    color:
      "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400",
    icon: <XCircle className="h-4 w-4" />,
  },
  [AppointmentStatus.NO_SHOW]: {
    label: t("status.noShow"),
    color: "bg-muted text-muted-foreground",
    icon: <XCircle className="h-4 w-4" />,
  },
});

const getPaymentStatusConfig = (
  t: (key: string) => string,
): Record<PaymentStatus, { label: string; color: string }> => ({
  [PaymentStatus.PENDING]: {
    label: t("payment.unpaid"),
    color: "bg-warning-100 text-warning-800",
  },
  [PaymentStatus.PAID]: {
    label: t("payment.paid"),
    color: "bg-success-100 text-success-800",
  },
  [PaymentStatus.REFUNDED]: {
    label: t("secretary.refunded"),
    color: "bg-muted text-muted-foreground",
  },
});

export function DoctorAppointmentDetails({
  appointmentId,
}: AppointmentDetailsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [notes, setNotes] = useState("");
  const [notesLoaded, setNotesLoaded] = useState(false);

  const {
    data: appointment,
    isLoading,
    isError,
  } = useDoctorAppointment(appointmentId);
  const { data: medicalNotes } = useGetMedicalNotes(appointmentId);
  const updateStatusMutation = useUpdateAppointmentStatus();
  const updateNotesMutation = useAddMedicalNotes();

  const statusConfig = getStatusConfig(t);
  const paymentStatusConfig = getPaymentStatusConfig(t);

  // Load medical notes when available
  if (medicalNotes && !notesLoaded) {
    setDiagnosis(medicalNotes.diagnosis || "");
    setPrescription(medicalNotes.prescription || "");
    setNotes(medicalNotes.notes || "");
    setNotesLoaded(true);
  }

  const handleStatusUpdate = async (newStatus: AppointmentStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        appointmentId,
        status: newStatus,
      });
      toast({
        title: t("toast.updated"),
        description: t("appointments.statusUpdated"),
        variant: "success",
      });
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("errors.somethingWentWrong"),
        variant: "error",
      });
    }
  };

  const handleSaveMedicalNotes = async () => {
    try {
      await updateNotesMutation.mutateAsync({
        appointmentId,
        diagnosis,
        prescription,
        notes,
      });
      toast({
        title: t("toast.saved"),
        description: t("appointments.medicalNotesSaved"),
        variant: "success",
      });
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("errors.somethingWentWrong"),
        variant: "error",
      });
    }
  };

  if (isLoading) {
    return <AppointmentDetailsSkeleton />;
  }

  if (isError || !appointment) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("errors.loadError")}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/doctor/appointments">{t("common.back")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const status = statusConfig[appointment.status];
  const paymentStatus = paymentStatusConfig[appointment.paymentStatus];
  // Use string directly for formatting to avoid timezone issues
  const appointmentDateStr = appointment.appointmentDate;
  const canEditMedicalNotes = [
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.COMPLETED,
  ].includes(appointment.status);

  const getAvailableActions = () => {
    switch (appointment.status) {
      case AppointmentStatus.PENDING:
        return [
          {
            status: AppointmentStatus.CONFIRMED,
            label: t("appointments.actionConfirm"),
            icon: CheckCircle,
            variant: "default" as const,
          },
          {
            status: AppointmentStatus.CANCELLED,
            label: t("appointments.actionCancel"),
            icon: XCircle,
            variant: "destructive" as const,
          },
        ];
      case AppointmentStatus.CONFIRMED:
        return [
          {
            status: AppointmentStatus.CHECKED_IN,
            label: t("appointments.actionArrived"),
            icon: UserCheck,
            variant: "default" as const,
          },
          {
            status: AppointmentStatus.NO_SHOW,
            label: t("appointments.actionNoShow"),
            icon: XCircle,
            variant: "secondary" as const,
          },
        ];
      case AppointmentStatus.CHECKED_IN:
        return [
          {
            status: AppointmentStatus.COMPLETED,
            label: t("appointments.actionComplete"),
            icon: CheckCircle,
            variant: "success" as const,
          },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/doctor/appointments">
          <ArrowRight className="h-4 w-4 ms-2" />
          {t("common.back")}
        </Link>
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  #{appointment.queueNumber || "--"}
                </span>
                <Badge className={status.color}>
                  {status.icon}
                  <span className="ms-1">{status.label}</span>
                </Badge>
                <Badge className={paymentStatus.color}>
                  {paymentStatus.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("appointments.bookingNumber")}: {appointment.bookingNumber}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.status}
                    variant={action.variant}
                    onClick={() => handleStatusUpdate(action.status)}
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin ms-2" />
                    ) : (
                      <Icon className="h-4 w-4 ms-2" />
                    )}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.date")}
                </p>
                <p className="font-semibold text-foreground">
                  {formatDate(appointmentDateStr, "EEEE, d MMMM yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinic & Secretary Info */}
      {appointment.clinic && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              {t("appointments.clinicInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {t("appointments.clinic")}
                </span>
                <span className="font-medium">
                  {getLocalizedText(appointment.clinic.name, "ar")}
                </span>
              </div>
              {appointment.clinic.secretaries &&
                appointment.clinic.secretaries.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" />
                        {t("appointments.clinicSecretary")}
                      </span>
                      <div className="text-end space-y-1">
                        {appointment.clinic.secretaries.map((sec) => (
                          <div key={sec.id}>
                            <span className="font-medium">
                              {sec.user?.fullName}
                            </span>
                            {sec.user?.phoneNumber && (
                              <a
                                href={`tel:${sec.user.phoneNumber}`}
                                className="text-sm text-muted-foreground hover:text-primary-600 ms-2"
                                dir="ltr"
                              >
                                {sec.user.phoneNumber}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("appointments.patientInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={
                  appointment.bookedForPatient?.user?.profilePicture ||
                  undefined
                }
              />
              <AvatarFallback className="text-xl">
                {getInitials(appointment.patientName || "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{appointment.patientName}</p>
              {appointment.patientAge && (
                <p className="text-muted-foreground">
                  {appointment.patientAge} {t("common.years")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {appointment.bookedForPatient?.user?.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a
                  href={`tel:${appointment.bookedForPatient.user.phoneNumber}`}
                  className="hover:text-primary-600"
                  dir="ltr"
                >
                  {appointment.bookedForPatient.user.phoneNumber}
                </a>
              </div>
            )}
            {appointment.bookedForPatient?.user?.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{appointment.bookedForPatient.user.email}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service & Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("appointments.serviceAndPayment")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t("appointments.service")}
              </span>
              <span className="font-medium">
                {getLocalizedText(appointment.serviceName, "ar")}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t("appointments.price")}
              </span>
              <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                {appointment.price} {t("common.currency")}
              </span>
            </div>
            {appointment.paymentMethod && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t("appointments.paymentMethod")}
                  </span>
                  <span className="font-medium">
                    {appointment.paymentMethod}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Notes */}
      {(appointment.patientNotes || appointment.symptoms) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              {t("appointments.patientNotes")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointment.symptoms && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("appointments.symptoms")}
                </p>
                <p className="text-foreground bg-muted p-3 rounded-lg whitespace-pre-line">
                  {appointment.symptoms}
                </p>
              </div>
            )}
            {appointment.patientNotes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("appointments.notes")}
                </p>
                <p className="text-foreground bg-muted p-3 rounded-lg whitespace-pre-line">
                  {appointment.patientNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Medical Notes (Editable for doctor) */}
      {canEditMedicalNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              {t("appointments.medicalNotes")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                {t("appointments.diagnosis")}
              </Label>
              <textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
                placeholder={t("appointments.diagnosisPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                {t("appointments.prescription")}
              </Label>
              <textarea
                id="prescription"
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
                placeholder={t("appointments.prescriptionPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t("appointments.doctorNotes")}
              </Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
                placeholder={t("appointments.doctorNotesPlaceholder")}
              />
            </div>

            <Button
              onClick={handleSaveMedicalNotes}
              disabled={updateNotesMutation.isPending}
            >
              {updateNotesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
              ) : (
                <Save className="h-4 w-4 ms-2" />
              )}
              {t("common.save")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AppointmentDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-24" />
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    </div>
  );
}
