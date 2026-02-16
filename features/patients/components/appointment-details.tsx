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
  Copy,
  Check,
  MessageCircle,
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
import { useClinicPrepaymentInfo } from "@/features/clinics/hooks/use-clinics";

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
    color:
      "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400",
  },
  [PaymentStatus.PAID]: {
    label: t("payment.paid"),
    color:
      "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400",
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

  const [copiedBooking, setCopiedBooking] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");

  const {
    data: appointment,
    isLoading,
    isError,
  } = usePatientAppointment(appointmentId);
  const { data: medicalNotes } = useAppointmentMedicalNotes(appointmentId);
  const cancelMutation = useCancelAppointment();

  const showPrepaymentInfo =
    appointment?.requiresPrepayment === true &&
    appointment?.paymentStatus === PaymentStatus.PENDING;
  const { data: prepaymentInfo } = useClinicPrepaymentInfo(
    appointment?.clinic?.id || "",
  );

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

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const handleCopyBookingNumber = async () => {
    await handleCopyText(appointment?.bookingNumber || "");
    setCopiedBooking(true);
    setTimeout(() => setCopiedBooking(false), 2000);
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
  const doctorProfile =
    appointment.clinic?.doctorProfile || appointment.doctorProfile;

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
              <div>
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
          {doctorProfile && (
            <Link
              href={`/doctors/${doctorProfile.id}`}
              className="flex items-center gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={
                    doctorProfile.user?.profilePicture ||
                    undefined
                  }
                />
                <AvatarFallback className="text-xl">
                  {getInitials(
                    doctorProfile.user?.fullName || "",
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {t("doctors.doctorPrefix")}{" "}
                  {doctorProfile.user?.fullName}
                </p>
                <p className="text-muted-foreground">
                  {getLocalizedText(
                    doctorProfile.specialty?.name,
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
            {appointment.clinic?.phoneNumbers &&
              appointment.clinic.phoneNumbers.length > 0 && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={`tel:${appointment.clinic.phoneNumbers[0]}`}
                    className="hover:text-primary-600"
                    dir="ltr"
                  >
                    {appointment.clinic.phoneNumbers.join(" / ")}
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

      {/* Prepayment Instructions (inline) */}
      {showPrepaymentInfo && prepaymentInfo && (
        <Card className="border-warning-200 dark:border-warning-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              {t("prepayment.instructionsTitle")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("prepayment.importantNote")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Booking Number */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {t("prepayment.bookingNumber")}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span
                  className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-mono"
                  dir="ltr"
                >
                  {appointment.bookingNumber}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyBookingNumber}
                >
                  {copiedBooking ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-warning-50 dark:bg-warning-900/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {t("prepayment.amount")}
              </p>
              <span className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {appointment.price} {t("common.egp")}
              </span>
            </div>

            <Separator />

            {/* Payment Accounts */}
            {prepaymentInfo.paymentAccounts.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-3">
                  {t("prepayment.paymentAccounts")}
                </h4>
                <div className="space-y-2">
                  {prepaymentInfo.paymentAccounts.map((account) => {
                    const isSelected = selectedPaymentMethodId === account.id;
                    return (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethodId(account.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border w-full text-start transition-colors ${
                          isSelected
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {account.paymentMethod
                              ? getLocalizedText(
                                  account.paymentMethod.name,
                                  locale,
                                )
                              : ""}
                          </p>
                          <p
                            className="text-sm text-muted-foreground font-mono"
                            dir="ltr"
                          >
                            {account.accountNumber}
                          </p>
                          {account.accountName && (
                            <p className="text-xs text-muted-foreground">
                              {account.accountName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {isSelected && (
                            <Check className="h-5 w-5 text-primary-600" />
                          )}
                          <div
                            role="button"
                            tabIndex={0}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(account.accountNumber);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                handleCopyText(account.accountNumber);
                              }
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {!selectedPaymentMethodId && (
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-2">
                    {t("prepayment.paymentMethodRequired")}
                  </p>
                )}
              </div>
            )}

            <Separator />

            {/* Steps */}
            <div>
              <h4 className="font-medium text-foreground mb-3">
                {t("prepayment.instructions")}
              </h4>
              <div className="space-y-3">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                        {num}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {t(`prepayment.step${num}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Button */}
            {prepaymentInfo.prepaymentWhatsapp && (() => {
              const selectedAccount = prepaymentInfo.paymentAccounts.find(
                (a) => a.id === selectedPaymentMethodId,
              );
              const selectedMethodName = selectedAccount?.paymentMethod
                ? getLocalizedText(selectedAccount.paymentMethod.name, locale)
                : "";
              const whatsappMessage = t("prepayment.whatsappMessage")
                .replace("{bookingNumber}", appointment.bookingNumber || "")
                .replace("{patientName}", appointment.patientName || "")
                .replace("{appointmentDate}", formatDate(appointment.appointmentDate, "EEEE, d MMMM yyyy"))
                .replace("{clinicName}", getLocalizedText(appointment.clinic?.name, locale) || "")
                .replace("{doctorName}", doctorProfile?.user?.fullName || "")
                .replace("{serviceName}", getLocalizedText(appointment.serviceName, locale) || "")
                .replace("{amount}", appointment.price.toString())
                .replace("{paymentMethod}", selectedMethodName);
              const whatsappLink = selectedPaymentMethodId
                ? `https://wa.me/${prepaymentInfo.prepaymentWhatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
                : null;
              return (
                <a
                  href={whatsappLink || "#"}
                  target={whatsappLink ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!whatsappLink) e.preventDefault();
                  }}
                  className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg font-medium transition-colors ${
                    whatsappLink
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <MessageCircle className="h-5 w-5" />
                  {whatsappLink
                    ? t("prepayment.sendViaWhatsapp")
                    : t("prepayment.selectPaymentMethod")}
                </a>
              );
            })()}
          </CardContent>
        </Card>
      )}

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
          <CardContent className="space-y-4">
            {/* Overall Rating */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(appointment.rating!.overallRating)
                      ? "fill-warning-400 text-warning-400"
                      : "text-gray-300 dark:text-gray-500"
                  }`}
                />
              ))}
              <span className="text-lg font-semibold">
                {appointment.rating!.overallRating.toFixed(1)}
              </span>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-2">
              {[
                {
                  label: t("rating.doctorExpertise"),
                  value: appointment.rating!.doctorRating,
                },
                {
                  label: t("rating.communicationExplanation"),
                  value: appointment.rating!.communicationRating,
                },
                {
                  label: t("rating.waitTime"),
                  value: appointment.rating!.waitTimeRating,
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    {c.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < c.value
                            ? "fill-warning-400 text-warning-400"
                            : "text-gray-300 dark:text-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>
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
