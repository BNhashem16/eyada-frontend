"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
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
  UserCheck,
  MapPin,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  useSecretaryAppointment,
  useUpdateAppointmentStatus,
  useUpdatePayment,
} from "../hooks";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { AppointmentStatus, PaymentStatus } from "@/types/enums";
import { formatDate, formatTime } from "@/lib/utils/date";
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

export function SecretaryAppointmentDetails({
  appointmentId,
}: AppointmentDetailsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const {
    data: appointment,
    isLoading,
    isError,
  } = useSecretaryAppointment(appointmentId);
  const updateStatusMutation = useUpdateAppointmentStatus();
  const updatePaymentMutation = useUpdatePayment();

  const statusConfig = getStatusConfig(t);
  const paymentStatusConfig = getPaymentStatusConfig(t);

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

  const handlePayment = async (method: "CASH" | "CARD" | "INSURANCE") => {
    try {
      await updatePaymentMutation.mutateAsync({
        appointmentId,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: method,
      });
      toast({
        title: t("toast.updated"),
        description: t("appointments.paymentUpdated"),
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
            <Link href="/secretary/appointments">{t("common.back")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const status = statusConfig[appointment.status];
  const paymentStatus = paymentStatusConfig[appointment.paymentStatus];
  // Use string directly for formatting to avoid timezone issues
  const appointmentDateStr = appointment.appointmentDate;
  const canMarkPayment = appointment.paymentStatus === PaymentStatus.PENDING;

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
            status: AppointmentStatus.CANCELLED,
            label: t("appointments.actionCancel"),
            icon: XCircle,
            variant: "destructive" as const,
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
        <Link href="/secretary/appointments">
          <ArrowRight className="h-4 w-4 ms-2" />
          {t("common.back")}
        </Link>
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              <p className="text-sm text-muted-foreground break-all">
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
                    size="sm"
                    onClick={() => handleStatusUpdate(action.status)}
                    disabled={updateStatusMutation.isPending}
                    className="flex-1 sm:flex-none"
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

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 sm:p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 flex-shrink-0 text-primary-600 dark:text-primary-400" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  {t("appointments.date")}
                </p>
                <p className="font-semibold truncate">
                  {formatDate(appointmentDateStr, "EEEE, d MMMM yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 flex-shrink-0 text-primary-600 dark:text-primary-400" />
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

      {/* Patient Info */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("appointments.patientInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg mb-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
              <AvatarImage
                src={
                  appointment.bookedForPatient?.user?.profilePicture ||
                  undefined
                }
              />
              <AvatarFallback className="text-lg sm:text-xl">
                {getInitials(appointment.patientName || "")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-base sm:text-lg truncate">{appointment.patientName}</p>
              {appointment.patientAge && (
                <p className="text-muted-foreground text-sm">
                  {appointment.patientAge} {t("common.years")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {appointment.bookedForPatient?.user?.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <a
                  href={`tel:${appointment.bookedForPatient.user.phoneNumber}`}
                  className="hover:text-primary-600 truncate"
                  dir="ltr"
                >
                  {appointment.bookedForPatient.user.phoneNumber}
                </a>
              </div>
            )}
            {appointment.bookedForPatient?.user?.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{appointment.bookedForPatient.user.email}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Doctor & Clinic Info */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("appointments.doctorInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 space-y-4">
          {appointment.clinic?.doctorProfile && (
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                <AvatarFallback>
                  {getInitials(
                    appointment.clinic.doctorProfile.user?.fullName || "",
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {t("doctors.doctorPrefix")}{" "}
                  {appointment.clinic.doctorProfile.user?.fullName}
                </p>
              </div>
            </div>
          )}

          {appointment.clinic && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 flex-shrink-0 text-muted-foreground mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {getLocalizedText(appointment.clinic.name, "ar")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service & Payment */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("appointments.serviceAndPayment")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground flex-shrink-0">
                {t("appointments.service")}
              </span>
              <span className="font-medium truncate text-end">
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

            {/* Payment Actions */}
            {canMarkPayment && (
              <>
                <Separator />
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("appointments.markPayment")}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePayment("CASH")}
                      disabled={updatePaymentMutation.isPending}
                    >
                      {updatePaymentMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin ms-2" />
                      ) : null}
                      {t("appointments.payCash")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePayment("CARD")}
                      disabled={updatePaymentMutation.isPending}
                    >
                      {updatePaymentMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin ms-2" />
                      ) : null}
                      {t("appointments.payCard")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePayment("INSURANCE")}
                      disabled={updatePaymentMutation.isPending}
                    >
                      {updatePaymentMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin ms-2" />
                      ) : null}
                      {t("appointments.payInsurance")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Notes */}
      {(appointment.patientNotes || appointment.symptoms) && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              {t("appointments.patientNotes")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 space-y-4">
            {appointment.symptoms && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("appointments.symptoms")}
                </p>
                <p className="text-foreground bg-muted p-3 rounded-lg whitespace-pre-line break-words">
                  {appointment.symptoms}
                </p>
              </div>
            )}
            {appointment.patientNotes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("appointments.notes")}
                </p>
                <p className="text-foreground bg-muted p-3 rounded-lg whitespace-pre-line break-words">
                  {appointment.patientNotes}
                </p>
              </div>
            )}
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
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    </div>
  );
}
