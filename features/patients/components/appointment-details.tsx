"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Stethoscope,
  Pill,
  ClipboardList,
  Navigation,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  usePatientAppointment,
  useAppointmentMedicalNotes,
  useCancelAppointment,
} from "../hooks/use-patient";
import { RatingDialog } from "./rating-dialog";
import { CancelDialog } from "./cancel-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { Appointment } from "@/types";
import { AppointmentStatus, PaymentStatus } from "@/types/enums";
import { formatDate, formatTime, isPast } from "@/lib/utils/date";
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

export function AppointmentDetails({ appointmentId }: AppointmentDetailsProps) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  const {
    data: appointment,
    isLoading,
    isError,
  } = usePatientAppointment(appointmentId);
  const { data: medicalNotes } = useAppointmentMedicalNotes(appointmentId);
  const cancelMutation = useCancelAppointment();

  const statusConfig = getStatusConfig(t);
  const paymentStatusConfig = getPaymentStatusConfig(t);

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ appointmentId });
      toast({
        title: t("appointments.cancelSuccess"),
        description: t("common.success"),
        variant: "success",
      });
      setShowCancelDialog(false);
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
            <Link href="/patient/appointments">{t("common.back")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const status = statusConfig[appointment.status];
  const paymentStatus = paymentStatusConfig[appointment.paymentStatus];
  // Use string directly for formatting to avoid timezone issues
  const appointmentDateStr = appointment.appointmentDate;
  const canCancel = [
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
  ].includes(appointment.status);
  const canRate =
    appointment.status === AppointmentStatus.COMPLETED && !appointment.rating;
  const showMedicalNotes =
    appointment.status === AppointmentStatus.COMPLETED && medicalNotes;
  const isUpcoming =
    !isPast(new Date(appointmentDateStr + "T12:00:00")) && canCancel;
  const canTrack = appointment.bookingNumber && isUpcoming;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/patient/appointments">
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
              {canTrack && (
                <Button variant="secondary" asChild>
                  <Link
                    href={`/track/${encodeURIComponent(appointment.bookingNumber!)}`}
                  >
                    <Navigation className="h-4 w-4 ms-2" />
                    {t("track.trackBooking")}
                  </Link>
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="h-4 w-4 ms-2" />
                  {t("appointments.cancel")}
                </Button>
              )}
              {canRate && (
                <Button onClick={() => setShowRatingDialog(true)}>
                  <Star className="h-4 w-4 ms-2" />
                  {t("patient.rateDoctor")}
                </Button>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.date")}
                </p>
                <p className="font-semibold">
                  {formatDate(appointmentDateStr, "EEEE, d MMMM yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.time")}
                </p>
                <p className="font-semibold" dir="ltr">
                  {formatTime(appointment.appointmentTime)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor & Clinic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("appointments.doctorInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointment.clinic?.doctorProfile && (
            <Link
              href={`/doctors/${appointment.clinic.doctorProfile.id}`}
              className="flex items-center gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={
                    appointment.clinic.doctorProfile.user?.profilePicture ||
                    undefined
                  }
                />
                <AvatarFallback className="text-xl">
                  {getInitials(
                    appointment.clinic.doctorProfile.user?.fullName || "",
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {t("doctors.doctorPrefix")}{" "}
                  {appointment.clinic.doctorProfile.user?.fullName}
                </p>
                <p className="text-muted-foreground">
                  {getLocalizedText(
                    appointment.clinic.doctorProfile.specialty?.name,
                    locale,
                  )}
                </p>
              </div>
            </Link>
          )}

          <Separator />

          {/* Clinic Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">
                  {getLocalizedText(appointment.clinic?.name, locale)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getLocalizedText(appointment.clinic?.address, locale)}
                </p>
                {appointment.clinic?.city && (
                  <p className="text-sm text-muted-foreground">
                    {getLocalizedText(appointment.clinic.city.name, locale)}
                    {appointment.clinic.city.state &&
                      ` - ${getLocalizedText(appointment.clinic.city.state.name, locale)}`}
                  </p>
                )}
              </div>
            </div>
            {appointment.clinic?.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a
                  href={`tel:${appointment.clinic.phoneNumber}`}
                  className="hover:text-primary-600"
                  dir="ltr"
                >
                  {appointment.clinic.phoneNumber}
                </a>
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
                {getLocalizedText(appointment.serviceName, locale)}
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
      {appointment.patientNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              {t("appointments.patientNotes")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-line">
              {appointment.patientNotes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Medical Notes (for completed appointments) */}
      {showMedicalNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              {t("appointments.medicalNotes")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalNotes.diagnosis && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {t("appointments.diagnosis")}
                  </span>
                </div>
                <p className="text-foreground bg-muted p-3 rounded-lg whitespace-pre-line">
                  {medicalNotes.diagnosis}
                </p>
              </div>
            )}
            {medicalNotes.prescription && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {t("appointments.prescription")}
                  </span>
                </div>
                <p className="text-foreground bg-muted p-3 rounded-lg whitespace-pre-line">
                  {medicalNotes.prescription}
                </p>
              </div>
            )}
            {medicalNotes.notes && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {t("appointments.doctorNotes")}
                  </span>
                </div>
                <p className="text-foreground bg-muted p-3 rounded-lg whitespace-pre-line">
                  {medicalNotes.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rating */}
      {appointment.rating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-warning-400" />
              {t("rating.yourRating")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < appointment.rating!.rating
                      ? "fill-warning-400 text-warning-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            {appointment.rating.review && (
              <p className="text-muted-foreground mt-2">
                {appointment.rating.review}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CancelDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancel}
        isLoading={cancelMutation.isPending}
      />

      {showRatingDialog && (
        <RatingDialog
          appointment={appointment}
          onClose={() => setShowRatingDialog(false)}
        />
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
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
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
