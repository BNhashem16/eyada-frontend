"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Phone,
  CreditCard,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  Pill,
  ClipboardList,
  Navigation,
  Copy,
  Check,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Hash,
  Hourglass,
  Timer,
  CalendarPlus,
  Share2,
  ExternalLink,
  Building2,
  CalendarClock,
  Ban,
  ListChecks,
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
import { AppointmentStatus, PaymentStatus } from "@/types/enums";
import { formatDate, formatTime, isPast } from "@/lib/utils/date";
import { cn, getInitials } from "@/lib/utils";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useClinicPrepaymentInfo } from "@/features/clinics/hooks/use-clinics";

interface AppointmentDetailsProps {
  appointmentId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Status / payment styling

const STATUS_STYLES: Record<
  AppointmentStatus,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  [AppointmentStatus.PENDING]: {
    label: "status.pending",
    classes:
      "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  [AppointmentStatus.CONFIRMED]: {
    label: "status.confirmed",
    classes:
      "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  [AppointmentStatus.CHECKED_IN]: {
    label: "status.checkedIn",
    classes:
      "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  [AppointmentStatus.IN_PROGRESS]: {
    label: "status.inProgress",
    classes:
      "bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-300",
    icon: <Stethoscope className="h-3.5 w-3.5" />,
  },
  [AppointmentStatus.COMPLETED]: {
    label: "status.completed",
    classes:
      "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  [AppointmentStatus.CANCELLED]: {
    label: "status.cancelled",
    classes:
      "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  [AppointmentStatus.NO_SHOW]: {
    label: "status.noShow",
    classes: "bg-muted text-muted-foreground",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const PAYMENT_STYLES: Record<PaymentStatus, { label: string; classes: string }> =
  {
    [PaymentStatus.PENDING]: {
      label: "payment.unpaid",
      classes:
        "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300",
    },
    [PaymentStatus.PAID]: {
      label: "payment.paid",
      classes:
        "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300",
    },
    [PaymentStatus.REFUNDED]: {
      label: "secretary.refunded",
      classes: "bg-muted text-muted-foreground",
    },
  };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers

function buildAppointmentDateTime(
  appointmentDate: string,
  appointmentTime?: string,
): Date | null {
  // appointmentDate is YYYY-MM-DD; appointmentTime is HH:mm (UTC by convention)
  if (!appointmentDate) return null;
  if (appointmentTime) {
    const [hh, mm] = appointmentTime.split(":").map(Number);
    if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
      const d = new Date(`${appointmentDate}T00:00:00`);
      if (Number.isNaN(d.getTime())) return null;
      d.setUTCHours(hh, mm, 0, 0);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }
  const fallback = new Date(`${appointmentDate}T12:00:00`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function getCountdown(target: Date, now: Date): string | null {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs < -60 * 60 * 1000) return "countdownPast";
  if (diffMs < 60 * 1000) return "countdownNow";
  const diffMin = Math.round(diffMs / (60 * 1000));
  if (diffMin < 60) return `countdownInMinutes:${diffMin}`;
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) return `countdownInHours:${diffHours}`;
  const startOfTarget = new Date(target);
  startOfTarget.setHours(0, 0, 0, 0);
  const startOfNow = new Date(now);
  startOfNow.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (startOfTarget.getTime() - startOfNow.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays === 0) return "countdownToday";
  if (diffDays === 1) return "countdownTomorrow";
  return `countdownInDays:${diffDays}`;
}

function buildIcsFile(
  uid: string,
  title: string,
  description: string,
  location: string,
  start: Date,
  durationMinutes: number,
): string | null {
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) return null;
  const safeDuration =
    Number.isFinite(durationMinutes) && durationMinutes > 0
      ? durationMinutes
      : 30;
  const dt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const end = new Date(start.getTime() + safeDuration * 60_000);
  if (Number.isNaN(end.getTime())) return null;
  const sanitize = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eyada//AppointmentDetails//EN",
    "BEGIN:VEVENT",
    `UID:${uid}@eyada`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${sanitize(title)}`,
    `DESCRIPTION:${sanitize(description)}`,
    `LOCATION:${sanitize(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

// ─────────────────────────────────────────────────────────────────────────────

export function AppointmentDetails({ appointmentId }: AppointmentDetailsProps) {
  const { t, locale, isRtl } = useTranslation();
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [copiedBooking, setCopiedBooking] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<string>("");

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

  // Live tick for countdown — update every minute.
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ appointmentId });
      toast({
        title: t("appointments.cancelSuccess"),
        description: t("common.success"),
        variant: "success",
      });
      setShowCancelDialog(false);
    } catch {
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
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const handleCopyBookingNumber = async () => {
    if (!appointment?.bookingNumber) return;
    await handleCopyText(appointment.bookingNumber);
    setCopiedBooking(true);
    setTimeout(() => setCopiedBooking(false), 2000);
  };

  // Memoize countdown above any early returns so React hook order stays stable.
  const appointmentDateTime = useMemo(
    () =>
      appointment
        ? buildAppointmentDateTime(
            appointment.appointmentDate,
            appointment.appointmentTime,
          )
        : null,
    [appointment],
  );
  const countdownKey = useMemo(() => {
    if (!appointment || !appointmentDateTime) return null;
    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      return null;
    }
    return getCountdown(appointmentDateTime, now);
  }, [appointment, appointmentDateTime, now]);

  if (isLoading) return <AppointmentDetailsSkeleton />;
  if (isError || !appointment || !appointmentDateTime) {
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

  const status = STATUS_STYLES[appointment.status];
  const paymentStatus = PAYMENT_STYLES[appointment.paymentStatus];
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
  const isCancelled = appointment.status === AppointmentStatus.CANCELLED;
  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
  const doctorProfile =
    appointment.clinic?.doctorProfile || appointment.doctorProfile;

  const countdownLabel = (() => {
    if (!countdownKey) return null;
    if (!countdownKey.includes(":")) return t(`appointments.${countdownKey}`);
    const [base, count] = countdownKey.split(":");
    return t(`appointments.${base}`).replace("{count}", count);
  })();

  const clinicName = getLocalizedText(appointment.clinic?.name, locale);
  const clinicAddress = getLocalizedText(appointment.clinic?.address, locale);
  const cityName = getLocalizedText(appointment.clinic?.city?.name, locale);
  const stateName = appointment.clinic?.city?.state
    ? getLocalizedText(appointment.clinic.city.state.name, locale)
    : "";
  const serviceName = getLocalizedText(appointment.serviceName, locale);
  const specialtyName = doctorProfile?.specialty
    ? getLocalizedText(doctorProfile.specialty.name, locale)
    : "";
  const serviceDuration = appointment.serviceType?.duration ?? 30;

  const isBookedForFamily =
    appointment.bookedForPatientId &&
    appointment.bookedForPatientId !== appointment.patientProfileId;

  const mapsHref =
    appointment.clinic?.latitude != null &&
    appointment.clinic?.longitude != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${appointment.clinic.latitude},${appointment.clinic.longitude}`
      : clinicAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${clinicName} ${clinicAddress}`,
          )}`
        : null;

  const handleAddToCalendar = () => {
    const ics = buildIcsFile(
      appointment.id,
      `${t("doctors.doctorPrefix")} ${doctorProfile?.user?.fullName ?? ""} – ${serviceName}`,
      [
        clinicName,
        clinicAddress,
        appointment.bookingNumber
          ? `${t("appointments.bookingNumber")}: ${appointment.bookingNumber}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
      [clinicName, clinicAddress, cityName].filter(Boolean).join(", "),
      appointmentDateTime,
      serviceDuration,
    );
    if (!ics) {
      toast({
        title: t("toast.error"),
        description: t("errors.somethingWentWrong"),
        variant: "error",
      });
      return;
    }
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointment-${appointment.bookingNumber || appointment.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const summary = [
      `${t("doctors.doctorPrefix")} ${doctorProfile?.user?.fullName ?? ""}`,
      clinicName,
      `${formatDate(appointmentDateStr, "EEEE, d MMMM yyyy", locale)}`,
      `${formatTime(appointment.appointmentTime, locale)}`,
      appointment.bookingNumber
        ? `${t("appointments.bookingNumber")}: ${appointment.bookingNumber}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: t("appointments.appointmentSummary"),
          text: summary,
        });
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    await handleCopyText(summary);
    toast({
      title: t("appointments.shareSuccess"),
      variant: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* BACK */}
      <Button asChild variant="ghost" className="-ms-2">
        <Link href="/patient/appointments">
          <ChevronRight
            className="me-1 h-4 w-4 rtl:hidden"
            aria-hidden="true"
          />
          <ChevronLeft
            className="me-1 h-4 w-4 ltr:hidden"
            aria-hidden="true"
          />
          {t("common.back")}
        </Link>
      </Button>

      {/* HERO */}
      <section
        aria-labelledby="appt-heading"
        className={cn(
          "relative overflow-hidden rounded-3xl text-white shadow-lg",
          isCancelled
            ? "bg-gradient-to-br from-error-700 via-error-800 to-error-900"
            : isCompleted
              ? "bg-gradient-to-br from-success-700 via-success-800 to-success-900"
              : "bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-700 dark:via-primary-800 dark:to-primary-900",
        )}
      >
        <div
          className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -start-20 h-80 w-80 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative p-6 sm:p-8 space-y-5">
          {/* Top row: badges + booking number + share */}
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/20 gap-1.5",
                )}
              >
                {status.icon}
                {t(status.label)}
              </Badge>
              <Badge className="bg-white/10 text-white/95 ring-1 ring-white/20 hover:bg-white/15">
                {t(paymentStatus.label)}
              </Badge>
              {countdownLabel && (
                <Badge className="bg-white text-primary-700 hover:bg-white/95 gap-1">
                  <Hourglass className="h-3 w-3" aria-hidden="true" />
                  <bdi>{countdownLabel}</bdi>
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyBookingNumber}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 ring-1 ring-white/20 px-3 py-1 text-xs sm:text-sm font-mono hover:bg-white/15 transition-colors"
                aria-label={t("appointments.bookingNumber")}
              >
                <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                <bdi className="font-mono">
                  {appointment.bookingNumber}
                </bdi>
                {copiedBooking ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Title: date + time */}
          <div className="space-y-1">
            <h1
              id="appt-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight"
            >
              <bdi>
                {formatDate(appointmentDateStr, "EEEE, d MMMM yyyy", locale)}
              </bdi>
            </h1>
            <p className="inline-flex items-center gap-2 text-base sm:text-lg text-white/95">
              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
              <bdi className="tabular-nums font-semibold">
                {formatTime(appointment.appointmentTime, locale)}
              </bdi>
            </p>
          </div>

          {/* Doctor + clinic compact summary */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-white/40 shrink-0">
                <AvatarImage
                  src={doctorProfile?.user?.profilePicture || undefined}
                  alt=""
                />
                <AvatarFallback className="bg-white/20 text-white">
                  {getInitials(doctorProfile?.user?.fullName || "")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-base sm:text-lg leading-tight truncate">
                  {t("doctors.doctorPrefix")}{" "}
                  {doctorProfile?.user?.fullName}
                </p>
                <p className="text-sm text-white/85 truncate">
                  {specialtyName || t("appointments.doctorInfo")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-white/90 min-w-0">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <bdi className="min-w-0">
                <span className="font-medium">{clinicName}</span>
                {clinicAddress && (
                  <>
                    {" · "}
                    <span className="text-white/80">{clinicAddress}</span>
                  </>
                )}
              </bdi>
            </div>
          </div>

          {/* Action cluster */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch gap-2">
            {canTrack && (
              <Button
                asChild
                size="sm"
                className="bg-white text-primary-700 hover:bg-white/90 font-semibold min-h-[40px]"
              >
                <Link
                  href={`/track/${encodeURIComponent(appointment.bookingNumber!)}`}
                >
                  <Navigation className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("track.trackBooking")}
                </Link>
              </Button>
            )}
            {!isCancelled && !isCompleted && (
              <Button
                size="sm"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white min-h-[40px]"
                onClick={handleAddToCalendar}
              >
                <CalendarPlus className="me-2 h-4 w-4" aria-hidden="true" />
                {t("appointments.addToCalendar")}
              </Button>
            )}
            {appointment.clinic?.phoneNumbers?.[0] && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white min-h-[40px]"
              >
                <a href={`tel:${appointment.clinic.phoneNumbers[0]}`}>
                  <Phone className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("clinics.callClinic")}
                </a>
              </Button>
            )}
            {mapsHref && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white min-h-[40px]"
              >
                <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                  <Navigation className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("appointments.getDirections")}
                </a>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white min-h-[40px]"
              onClick={handleShare}
            >
              <Share2 className="me-2 h-4 w-4" aria-hidden="true" />
              {t("appointments.shareDetails")}
            </Button>
            {canCancel && (
              <Button
                size="sm"
                variant="destructive"
                className="min-h-[40px] sm:ms-auto"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="me-2 h-4 w-4" aria-hidden="true" />
                {t("appointments.cancel")}
              </Button>
            )}
            {canRate && (
              <Button
                size="sm"
                className="bg-warning-400 hover:bg-warning-500 text-white min-h-[40px]"
                onClick={() => setShowRatingDialog(true)}
              >
                <Star className="me-2 h-4 w-4" aria-hidden="true" />
                {t("patient.rateDoctor")}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* CANCELLED / COMPLETED BANNER */}
      {isCancelled && (
        <Card className="border-error-300 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
          <CardContent className="p-5 flex items-start gap-3">
            <Ban
              className="h-5 w-5 mt-0.5 text-error-600 dark:text-error-400 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="font-semibold text-error-800 dark:text-error-200">
                {t("appointments.cancelledBanner")}
              </p>
              {appointment.cancellationReason && (
                <p className="text-sm text-error-700/90 dark:text-error-300/90 mt-1 whitespace-pre-line">
                  <span className="font-medium">
                    {t("appointments.cancellationReason")}:
                  </span>{" "}
                  {appointment.cancellationReason}
                </p>
              )}
              {appointment.cancelledAt && (
                <p className="text-xs text-error-700/80 dark:text-error-300/80 mt-1">
                  <bdi>
                    {formatDate(
                      appointment.cancelledAt,
                      "d MMMM yyyy, h:mm a",
                      locale,
                    )}
                  </bdi>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {appointment.queueNumber !== undefined &&
          appointment.queueNumber !== null && (
            <StatCard
              icon={<Hash className="h-5 w-5" />}
              label={t("appointments.queueNumber")}
              value={String(appointment.queueNumber)}
              isNumeric
            />
          )}
        {appointment.estimatedWaitTime !== undefined &&
          appointment.estimatedWaitTime !== null && (
            <StatCard
              icon={<Hourglass className="h-5 w-5" />}
              label={t("appointments.estimatedWait")}
              value={`${appointment.estimatedWaitTime} ${t("appointments.minutesAbbr")}`}
              isNumeric
            />
          )}
        <StatCard
          icon={<Timer className="h-5 w-5" />}
          label={t("appointments.serviceDuration")}
          value={`${serviceDuration} ${t("appointments.minutesAbbr")}`}
          isNumeric
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5" />}
          label={t("appointments.price")}
          value={`${appointment.price} ${t("common.egp")}`}
          isNumeric
          tone="success"
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0 space-y-6">
          {/* PATIENT INFO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                {t("appointments.patientInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label={t("appointments.bookedForCard")}
                value={
                  <span className="inline-flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {appointment.patientName}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {isBookedForFamily
                        ? t("appointments.bookedForFamily")
                        : t("appointments.bookedForSelf")}
                    </Badge>
                  </span>
                }
              />
              {appointment.patientAge !== undefined &&
                appointment.patientAge !== null && (
                  <InfoRow
                    label={t("appointments.patientAge")}
                    value={
                      <bdi className="font-medium text-foreground tabular-nums">
                        {appointment.patientAge}{" "}
                        {t("appointments.patientYears")}
                      </bdi>
                    }
                  />
                )}
              {appointment.symptoms && (
                <InfoRow
                  label={t("doctorPortal.symptoms") || "Symptoms"}
                  value={
                    <span className="text-foreground whitespace-pre-line">
                      {appointment.symptoms}
                    </span>
                  }
                  stack
                />
              )}
              {appointment.patientNotes && (
                <InfoRow
                  label={t("appointments.patientNotes")}
                  value={
                    <span className="text-foreground whitespace-pre-line">
                      {appointment.patientNotes}
                    </span>
                  }
                  stack
                />
              )}
            </CardContent>
          </Card>

          {/* DOCTOR CARD */}
          {doctorProfile && (
            <Link
              href={`/doctors/${doctorProfile.id}`}
              className="group block rounded-2xl border border-border bg-card hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4 p-4 sm:p-5">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-primary-100 dark:ring-primary-900/40 shrink-0">
                  <AvatarImage
                    src={doctorProfile.user?.profilePicture || undefined}
                    alt=""
                  />
                  <AvatarFallback>
                    {getInitials(doctorProfile.user?.fullName || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                    <span className="text-base sm:text-lg font-semibold text-foreground truncate">
                      {t("doctors.doctorPrefix")}{" "}
                      {doctorProfile.user?.fullName}
                    </span>
                    {doctorProfile.totalRatings > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs sm:text-sm">
                        <Star
                          className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                          aria-hidden="true"
                        />
                        <bdi className="font-semibold tabular-nums">
                          {Number(doctorProfile.averageRating).toFixed(1)}
                        </bdi>
                        <bdi className="text-muted-foreground">
                          ({doctorProfile.totalRatings})
                        </bdi>
                      </span>
                    )}
                  </div>
                  {specialtyName && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {specialtyName}
                    </p>
                  )}
                </div>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 rtl:hidden transition-colors"
                  aria-hidden="true"
                />
                <ChevronLeft
                  className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 ltr:hidden transition-colors"
                  aria-hidden="true"
                />
              </div>
            </Link>
          )}

          {/* CLINIC */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                {t("appointments.clinicInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin
                  className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    <bdi>{clinicName}</bdi>
                  </p>
                  {clinicAddress && (
                    <p className="text-sm text-muted-foreground">
                      <bdi>{clinicAddress}</bdi>
                    </p>
                  )}
                  {cityName && (
                    <p className="text-sm text-muted-foreground">
                      <bdi>
                        {cityName}
                        {stateName && ` — ${stateName}`}
                      </bdi>
                    </p>
                  )}
                </div>
              </div>

              {appointment.clinic?.phoneNumbers &&
                appointment.clinic.phoneNumbers.length > 0 && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <Phone
                      className="h-5 w-5 text-muted-foreground shrink-0"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap gap-3 min-w-0">
                      {appointment.clinic.phoneNumbers.map((phone, i) => (
                        <a
                          key={i}
                          href={`tel:${phone}`}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          <bdi>{phone}</bdi>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex flex-wrap gap-2 pt-1">
                {appointment.clinic?.id && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/clinics/${appointment.clinic.id}`}>
                      <ExternalLink
                        className="me-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      {t("appointments.viewClinic")}
                    </Link>
                  </Button>
                )}
                {mapsHref && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation
                        className="me-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      {t("appointments.getDirections")}
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SERVICE & PAYMENT */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                {t("appointments.serviceAndPayment")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label={t("appointments.service")}
                value={
                  <span className="font-medium text-foreground">
                    {serviceName}
                  </span>
                }
              />
              <Separator />
              <InfoRow
                label={t("appointments.serviceDuration")}
                value={
                  <bdi className="font-medium text-foreground tabular-nums">
                    {serviceDuration} {t("appointments.minutesAbbr")}
                  </bdi>
                }
              />
              <Separator />
              <InfoRow
                label={t("appointments.price")}
                value={
                  <bdi className="text-lg font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                    {appointment.price} {t("common.egp")}
                  </bdi>
                }
              />
              {appointment.paymentMethod && (
                <>
                  <Separator />
                  <InfoRow
                    label={t("appointments.paymentMethod")}
                    value={
                      <bdi className="font-medium text-foreground">
                        {appointment.paymentMethod}
                      </bdi>
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* PREPAYMENT INSTRUCTIONS */}
          {showPrepaymentInfo && prepaymentInfo && (
            <Card className="border-warning-300 dark:border-warning-800">
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
                {/* Booking + amount mini-cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("prepayment.bookingNumber")}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <bdi className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-mono">
                        {appointment.bookingNumber}
                      </bdi>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleCopyBookingNumber}
                        aria-label={t("appointments.bookingNumber")}
                      >
                        {copiedBooking ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-warning-50 dark:bg-warning-900/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("prepayment.amount")}
                    </p>
                    <bdi className="text-2xl font-bold text-warning-700 dark:text-warning-300 tabular-nums">
                      {appointment.price} {t("common.egp")}
                    </bdi>
                  </div>
                </div>

                {/* Payment accounts */}
                {prepaymentInfo.paymentAccounts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-3">
                      {t("prepayment.paymentAccounts")}
                    </h4>
                    <div className="space-y-2">
                      {prepaymentInfo.paymentAccounts.map((account) => {
                        const isSelected =
                          selectedPaymentMethodId === account.id;
                        return (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() =>
                              setSelectedPaymentMethodId(account.id)
                            }
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border w-full text-start transition-colors gap-2",
                              isSelected
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500"
                                : "border-border hover:bg-muted/50",
                            )}
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm">
                                {account.paymentMethod
                                  ? getLocalizedText(
                                      account.paymentMethod.name,
                                      locale,
                                    )
                                  : ""}
                              </p>
                              <p className="text-sm text-muted-foreground font-mono">
                                <bdi>{account.accountNumber}</bdi>
                              </p>
                              {account.accountName && (
                                <p className="text-xs text-muted-foreground">
                                  {account.accountName}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {isSelected && (
                                <Check className="h-5 w-5 text-primary-600" />
                              )}
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label={t("appointments.shareDetails")}
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
                              </span>
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

                {/* Steps */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">
                    {t("prepayment.instructions")}
                  </h4>
                  <ol className="space-y-2.5">
                    {[1, 2, 3].map((num) => (
                      <li key={num} className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 mt-0.5">
                          <bdi className="text-xs font-bold text-primary-700 dark:text-primary-300 tabular-nums">
                            {num}
                          </bdi>
                        </span>
                        <p className="text-sm text-foreground">
                          {t(`prepayment.step${num}`)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* WhatsApp send */}
                {prepaymentInfo.prepaymentWhatsapp &&
                  (() => {
                    const selectedAccount =
                      prepaymentInfo.paymentAccounts.find(
                        (a) => a.id === selectedPaymentMethodId,
                      );
                    const selectedMethodName = selectedAccount?.paymentMethod
                      ? getLocalizedText(
                          selectedAccount.paymentMethod.name,
                          locale,
                        )
                      : "";
                    const whatsappMessage = t("prepayment.whatsappMessage")
                      .replace(
                        "{bookingNumber}",
                        appointment.bookingNumber || "",
                      )
                      .replace("{patientName}", appointment.patientName || "")
                      .replace(
                        "{appointmentDate}",
                        formatDate(
                          appointment.appointmentDate,
                          "EEEE, d MMMM yyyy",
                          locale,
                        ),
                      )
                      .replace("{clinicName}", clinicName || "")
                      .replace(
                        "{doctorName}",
                        doctorProfile?.user?.fullName || "",
                      )
                      .replace("{serviceName}", serviceName || "")
                      .replace("{amount}", appointment.price.toString())
                      .replace("{paymentMethod}", selectedMethodName);
                    const whatsappLink = selectedPaymentMethodId
                      ? `https://wa.me/${prepaymentInfo.prepaymentWhatsapp.replace(
                          /[^0-9]/g,
                          "",
                        )}?text=${encodeURIComponent(whatsappMessage)}`
                      : null;
                    return (
                      <Button
                        asChild={Boolean(whatsappLink)}
                        type="button"
                        disabled={!whatsappLink}
                        className={cn(
                          "w-full min-h-[44px]",
                          whatsappLink &&
                            "bg-green-600 hover:bg-green-700 text-white",
                        )}
                      >
                        {whatsappLink ? (
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle
                              className="me-2 h-5 w-5"
                              aria-hidden="true"
                            />
                            {t("prepayment.sendViaWhatsapp")}
                          </a>
                        ) : (
                          <span>
                            <MessageCircle
                              className="me-2 h-5 w-5"
                              aria-hidden="true"
                            />
                            {t("prepayment.selectPaymentMethod")}
                          </span>
                        )}
                      </Button>
                    );
                  })()}
              </CardContent>
            </Card>
          )}

          {/* MEDICAL NOTES */}
          {showMedicalNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  {t("appointments.medicalNotes")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <NoteBlock
                  icon={
                    <Stethoscope className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  }
                  label={t("appointments.diagnosis")}
                  text={medicalNotes.diagnosis}
                  emptyText={t("appointments.noDiagnosisYet")}
                />
                <NoteBlock
                  icon={
                    <Pill className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  }
                  label={t("appointments.prescription")}
                  text={medicalNotes.prescription}
                  emptyText={t("appointments.noNotesYet")}
                />
                <NoteBlock
                  icon={
                    <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  }
                  label={t("appointments.doctorNotes")}
                  text={medicalNotes.notes}
                  emptyText={t("appointments.noNotesYet")}
                />
              </CardContent>
            </Card>
          )}

          {/* RATING */}
          {appointment.rating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning-400" />
                  {t("rating.yourRating")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-6 w-6",
                          i <
                            Math.round(appointment.rating!.overallRating)
                            ? "fill-warning-400 text-warning-400"
                            : "text-gray-300 dark:text-gray-600",
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <bdi className="text-lg font-semibold tabular-nums">
                    {appointment.rating.overallRating.toFixed(1)}
                  </bdi>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      label: t("rating.doctorExpertise"),
                      value: appointment.rating.doctorRating,
                    },
                    {
                      label: t("rating.communicationExplanation"),
                      value: appointment.rating.communicationRating,
                    },
                    {
                      label: t("rating.waitTime"),
                      value: appointment.rating.waitTimeRating,
                    },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-sm text-muted-foreground">
                        {c.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < c.value
                                ? "fill-warning-400 text-warning-400"
                                : "text-gray-300 dark:text-gray-600",
                            )}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {appointment.rating.review && (
                  <blockquote
                    className={cn(
                      "border-s-4 border-primary-300 dark:border-primary-700 bg-muted/50 rounded-e-lg p-3 text-foreground/90 whitespace-pre-line",
                      isRtl ? "border-e-0" : "border-s-4",
                    )}
                  >
                    {appointment.rating.review}
                  </blockquote>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* SIDEBAR — TIMELINE */}
        <aside className="lg:col-span-1 min-w-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  {t("appointments.timelineTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline
                  appointment={appointment}
                  appointmentDateTime={appointmentDateTime}
                  locale={locale}
                  t={t}
                />
              </CardContent>
            </Card>

            {/* Quick actions card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  {t("appointments.appointmentSummary")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <SummaryRow
                  label={t("appointments.date")}
                  value={
                    <bdi>
                      {formatDate(
                        appointmentDateStr,
                        "EEEE, d MMMM yyyy",
                        locale,
                      )}
                    </bdi>
                  }
                />
                <SummaryRow
                  label={t("appointments.bookedAt") + " (HH:mm)"}
                  value={
                    <bdi className="tabular-nums">
                      {formatTime(appointment.appointmentTime, locale)}
                    </bdi>
                  }
                />
                <SummaryRow
                  label={t("appointments.bookingNumber")}
                  value={
                    <bdi className="font-mono text-xs">
                      {appointment.bookingNumber}
                    </bdi>
                  }
                />
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

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

// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  isNumeric = false,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isNumeric?: boolean;
  tone?: "default" | "success";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 min-w-0">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          tone === "success"
            ? "bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300"
            : "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300",
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p
          className={cn(
            "font-semibold text-sm sm:text-base truncate",
            isNumeric && "tabular-nums",
            tone === "success"
              ? "text-success-700 dark:text-success-300"
              : "text-foreground",
          )}
        >
          <bdi>{value}</bdi>
        </p>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  stack = false,
}: {
  label: string;
  value: React.ReactNode;
  stack?: boolean;
}) {
  return (
    <div
      className={cn(
        stack
          ? "space-y-1"
          : "flex flex-wrap items-start justify-between gap-2",
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className={cn(stack ? "" : "text-end min-w-0")}>{value}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-border last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-sm font-medium text-foreground min-w-0 truncate text-end">
        {value}
      </div>
    </div>
  );
}

function NoteBlock({
  icon,
  label,
  text,
  emptyText,
}: {
  icon: React.ReactNode;
  label: string;
  text: string | null | undefined;
  emptyText: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-medium text-foreground">{label}</span>
      </div>
      {text ? (
        <p className="text-foreground bg-muted rounded-xl p-3.5 whitespace-pre-line leading-relaxed">
          {text}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic px-1">
          {emptyText}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Timeline

interface TimelineProps {
  appointment: NonNullable<ReturnType<typeof usePatientAppointment>["data"]>;
  appointmentDateTime: Date;
  locale: "ar" | "en";
  t: (k: string) => string;
}

function Timeline({
  appointment,
  appointmentDateTime,
  locale,
  t,
}: TimelineProps) {
  type Step = { key: string; label: string; at?: string | Date; done: boolean };

  const status = appointment.status;
  const isCancelled = status === AppointmentStatus.CANCELLED;
  const reachedConfirmed = [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.COMPLETED,
  ].includes(status);
  const reachedCheckedIn = [
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.COMPLETED,
  ].includes(status);
  const reachedInProgress = [
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.COMPLETED,
  ].includes(status);
  const reachedCompleted = status === AppointmentStatus.COMPLETED;

  const steps: Step[] = [
    {
      key: "booked",
      label: t("appointments.bookedAt"),
      at: appointment.createdAt,
      done: true,
    },
    {
      key: "confirmed",
      label: t("appointments.confirmedAt"),
      at: reachedConfirmed ? appointment.updatedAt : undefined,
      done: reachedConfirmed,
    },
    {
      key: "appointment",
      label: t("appointments.appointmentSummary"),
      at: appointmentDateTime,
      done: reachedCheckedIn || reachedInProgress || reachedCompleted,
    },
    {
      key: "completed",
      label: t("appointments.completedAtTime"),
      at: appointment.completedAt,
      done: reachedCompleted,
    },
  ];

  if (isCancelled) {
    steps.push({
      key: "cancelled",
      label: t("appointments.cancelledAtTime"),
      at: appointment.cancelledAt,
      done: true,
    });
  }

  return (
    <ol className="relative space-y-4">
      {/* vertical line */}
      <span
        className="absolute top-2 bottom-2 start-[11px] w-px bg-border"
        aria-hidden="true"
      />
      {steps.map((step) => {
        const isCancelStep = step.key === "cancelled";
        return (
          <li
            key={step.key}
            className="relative flex items-start gap-3 ps-1"
          >
            <span
              className={cn(
                "relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ring-card",
                isCancelStep
                  ? "bg-error-500 text-white"
                  : step.done
                    ? "bg-primary-500 text-white"
                    : "bg-muted text-muted-foreground",
              )}
              aria-hidden="true"
            >
              {isCancelStep ? (
                <XCircle className="h-3.5 w-3.5" />
              ) : step.done ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {step.at && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  <bdi>
                    {typeof step.at === "string"
                      ? formatDate(step.at, "d MMM yyyy, h:mm a", locale)
                      : formatDate(step.at, "d MMM yyyy, h:mm a", locale)}
                  </bdi>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AppointmentDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
