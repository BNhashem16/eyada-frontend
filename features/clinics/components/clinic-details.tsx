"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CalendarDays,
  ExternalLink,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useClinic } from "../hooks/use-clinics";
import { BookingWidget } from "./booking-widget";
import { ClinicScheduleExplorer } from "./clinic-schedule-explorer";
import { DayOfWeek } from "@/types/enums";
import type { ClinicSchedule, ScheduleShift } from "@/types/models";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { formatTime, utcTimeToLocal } from "@/lib/utils/date";
import { getImageUrl } from "@/lib/utils/storage";
import { cn } from "@/lib/utils";

interface ClinicDetailsProps {
  clinicId: string;
}

const JS_DAY_TO_ENUM: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

function timeToMinutes(time: string): number {
  const local = time.includes("T")
    ? time.split("T")[1]?.slice(0, 5) ?? ""
    : utcTimeToLocal(time);
  const [h, m] = local.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  return h * 60 + m;
}

function computeOpenStatus(
  schedules: ClinicSchedule[] | undefined,
  now: Date,
): { isOpenNow: boolean; todaySchedule: ClinicSchedule | undefined } {
  if (!schedules?.length) return { isOpenNow: false, todaySchedule: undefined };
  const todayEnum = JS_DAY_TO_ENUM[now.getDay()];
  const todaySchedule = schedules.find((s) => s.dayOfWeek === todayEnum);
  if (!todaySchedule || !todaySchedule.isActive)
    return { isOpenNow: false, todaySchedule };
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isOpenNow = (todaySchedule.shifts ?? []).some((shift) => {
    const start = timeToMinutes(shift.startTime);
    const end = timeToMinutes(shift.endTime);
    if (start < 0 || end < 0) return false;
    if (end < start) return nowMin >= start || nowMin <= end;
    return nowMin >= start && nowMin <= end;
  });
  return { isOpenNow, todaySchedule };
}

export function ClinicDetailsComponent({ clinicId }: ClinicDetailsProps) {
  const { t, locale } = useTranslation();
  const { data: clinic, isLoading, isError } = useClinic(clinicId);
  const schedules = clinic?.schedules;
  const services = clinic?.serviceTypes;

  const [activeTab, setActiveTab] = useState<string>("browse");
  const [bookingDate, setBookingDate] = useState<Date | null>(null);

  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { isOpenNow, todaySchedule } = useMemo(
    () => computeOpenStatus(schedules, now),
    [schedules, now],
  );

  if (isLoading) return <ClinicDetailsSkeleton />;

  if (isError || !clinic) {
    return (
      <Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("clinics.loadError")}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/clinics">{t("doctors.backToSearch")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const clinicName = getLocalizedText(clinic.name, locale);
  const cityName = getLocalizedText(clinic.city?.name, locale);
  const stateName = clinic.city?.state
    ? getLocalizedText(clinic.city.state.name, locale)
    : "";
  const description = getLocalizedText(clinic.description, locale);
  const heroImage = clinic.images?.[0];
  const doctor = clinic.doctorProfile;
  const doctorAvatar =
    doctor?.profileImage || doctor?.user?.profilePicture || null;
  const specialtyName = doctor?.specialty
    ? getLocalizedText(doctor.specialty.name, locale)
    : "";

  // Pick a day from the schedule explorer → switch to the booking tab
  // and seed BookingWidget with that date.
  const handlePickDay = (date: Date) => {
    setBookingDate(date);
    setActiveTab("booking");
    // Smooth scroll to top so the user sees the booking widget
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* HERO */}
      <ClinicHero
        clinicName={clinicName}
        heroImage={heroImage}
        cityName={cityName}
        stateName={stateName}
        clinic={clinic}
        isOpenNow={isOpenNow}
        hasTodaySchedule={Boolean(todaySchedule?.isActive)}
        todaySchedule={todaySchedule}
        locale={locale}
        t={t}
        onBookNow={() => {
          setBookingDate(null);
          setActiveTab("booking");
        }}
      />

      {/* MOBILE STICKY ACTIONS */}
      <div className="md:hidden grid grid-cols-2 gap-2 -mt-2">
        <Button
          size="lg"
          className="min-h-[44px]"
          onClick={() => {
            setBookingDate(null);
            setActiveTab("booking");
          }}
        >
          <Calendar className="me-2 h-4 w-4" aria-hidden="true" />
          {t("clinics.bookNow")}
        </Button>
        {clinic.phoneNumbers && clinic.phoneNumbers.length > 0 ? (
          <Button asChild variant="outline" size="lg" className="min-h-[44px]">
            <a href={`tel:${clinic.phoneNumbers[0]}`}>
              <Phone className="me-2 h-4 w-4" aria-hidden="true" />
              {t("clinics.callClinic")}
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            className="min-h-[44px]"
            onClick={() => setActiveTab("browse")}
          >
            <Clock className="me-2 h-4 w-4" aria-hidden="true" />
            {t("clinics.browseTimes")}
          </Button>
        )}
      </div>

      {/* DOCTOR CARD — separate, prominent */}
      {doctor && (
        <DoctorPreviewCard
          doctor={doctor}
          doctorAvatar={doctorAvatar}
          specialtyName={specialtyName}
          locale={locale}
          t={t}
        />
      )}

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label={t("clinics.todayHours")}
          value={
            todaySchedule?.isActive && todaySchedule.shifts?.length
              ? `${formatTime(todaySchedule.shifts[0].startTime, locale)} – ${formatTime(
                  todaySchedule.shifts[todaySchedule.shifts.length - 1].endTime,
                  locale,
                )}`
              : t("clinics.closedToday")
          }
          tone={
            todaySchedule?.isActive && todaySchedule.shifts?.length
              ? "primary"
              : "muted"
          }
          isTime={Boolean(
            todaySchedule?.isActive && todaySchedule.shifts?.length,
          )}
        />
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label={t("clinics.workDayCount")}
          value={String(
            (schedules ?? []).filter(
              (s) => s.isActive && s.shifts && s.shifts.length > 0,
            ).length,
          )}
          tone="primary"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label={t("clinics.serviceCount")}
          value={String(services?.length ?? 0)}
          tone="primary"
        />
      </div>

      {/* DESCRIPTION */}
      {description && (
        <Card>
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm sm:text-base text-foreground/85 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger
                value="browse"
                className="min-h-[44px] sm:min-h-9"
              >
                <CalendarDays className="me-2 h-4 w-4" aria-hidden="true" />
                {t("clinics.browseTimes")}
              </TabsTrigger>
              <TabsTrigger
                value="booking"
                className="min-h-[44px] sm:min-h-9"
              >
                <Calendar className="me-2 h-4 w-4" aria-hidden="true" />
                {t("clinics.bookAppointmentTab")}
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="min-h-[44px] sm:min-h-9"
              >
                <DollarSign className="me-2 h-4 w-4" aria-hidden="true" />
                {t("clinics.servicesTab")}
              </TabsTrigger>
            </TabsList>

            {/* BROWSE TIMES (NEW DEFAULT) */}
            <TabsContent value="browse" className="mt-6">
              <ClinicScheduleExplorer
                clinicId={clinicId}
                schedules={schedules}
                onPickSlot={(date) => handlePickDay(date)}
                onPickDayForBooking={(date) => handlePickDay(date)}
              />
            </TabsContent>

            {/* BOOKING */}
            <TabsContent value="booking" className="mt-6">
              <BookingWidget clinicId={clinicId} initialDate={bookingDate} />
            </TabsContent>

            {/* SERVICES */}
            <TabsContent value="services" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    {t("clinics.servicesAndPrices")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {services && services.length > 0 ? (
                    <ul className="space-y-3">
                      {services.map((service) => (
                        <li
                          key={service.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground">
                              {getLocalizedText(service.name, locale) ||
                                service.serviceType}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t("clinics.durationMinutes").replace(
                                "{duration}",
                                String(service.duration),
                              )}
                            </p>
                          </div>
                          <div className="text-end">
                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                              {service.price} {t("common.egp")}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">
                      {t("clinics.noServicesYet")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-1 min-w-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            <Card className="border-primary-200 dark:border-primary-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  {t("clinics.bookYourAppointment")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("clinics.bookSubtitle")}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <SidebarTodayCard
                  schedule={todaySchedule}
                  isOpenNow={isOpenNow}
                  locale={locale}
                  t={t}
                />
                <Button
                  className="w-full min-h-[44px]"
                  size="lg"
                  onClick={() => setActiveTab("browse")}
                >
                  <CalendarDays className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("clinics.browseTimes")}
                </Button>
                <Button
                  className="w-full min-h-[44px]"
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setBookingDate(null);
                    setActiveTab("booking");
                  }}
                >
                  <Calendar className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("clinics.bookNow")}
                </Button>
                {clinic.phoneNumbers && clinic.phoneNumbers.length > 0 && (
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full min-h-[44px]"
                  >
                    <a href={`tel:${clinic.phoneNumbers[0]}`}>
                      <Phone className="me-2 h-4 w-4" aria-hidden="true" />
                      {t("clinics.callClinic")}
                    </a>
                  </Button>
                )}
                {clinic.latitude != null && clinic.longitude != null && (
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full min-h-[44px]"
                  >
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="me-2 h-4 w-4" aria-hidden="true" />
                      {t("clinics.viewLocation")}
                      <ExternalLink
                        className="ms-2 h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface ClinicHeroProps {
  clinicName: string;
  heroImage: string | undefined;
  cityName: string;
  stateName: string;
  clinic: NonNullable<ReturnType<typeof useClinic>["data"]>;
  isOpenNow: boolean;
  hasTodaySchedule: boolean;
  todaySchedule: ClinicSchedule | undefined;
  locale: "ar" | "en";
  t: (k: string) => string;
  onBookNow: () => void;
}

function ClinicHero({
  clinicName,
  heroImage,
  cityName,
  stateName,
  clinic,
  isOpenNow,
  hasTodaySchedule,
  todaySchedule,
  locale,
  t,
  onBookNow,
}: ClinicHeroProps) {
  return (
    <section
      aria-labelledby="clinic-name"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-700 dark:via-primary-800 dark:to-primary-900 text-white shadow-lg"
    >
      {heroImage && (
        <>
          <img
            src={getImageUrl(heroImage)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-700/85 via-primary-700/75 to-primary-900/90 dark:from-primary-800/90 dark:via-primary-800/85 dark:to-primary-950/95"
            aria-hidden="true"
          />
        </>
      )}

      <div
        className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -start-20 h-80 w-80 rounded-full bg-white/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr_auto] md:items-start">
        {/* Logo / clinic icon */}
        <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
          <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
        </div>

        {/* Title + meta */}
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {clinic.isActive && (
              <Badge className="bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/20">
                <Sparkles className="me-1 h-3 w-3" aria-hidden="true" />
                {t("clinics.availableForBooking")}
              </Badge>
            )}
            <OpenNowBadge
              isOpenNow={isOpenNow}
              hasSchedule={hasTodaySchedule}
              t={t}
            />
          </div>

          <h1
            id="clinic-name"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight"
          >
            {clinicName}
          </h1>

          <div className="flex flex-col gap-2 text-sm text-white/90 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
            <span className="inline-flex items-start gap-2 min-w-0">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <bdi className="min-w-0">
                {getLocalizedText(clinic.address, locale)}
                {cityName && (
                  <>
                    {" · "}
                    {cityName}
                    {stateName && `, ${stateName}`}
                  </>
                )}
              </bdi>
            </span>

            {clinic.phoneNumbers && clinic.phoneNumbers.length > 0 && (
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a
                  href={`tel:${clinic.phoneNumbers[0]}`}
                  className="hover:text-white"
                >
                  <bdi>{clinic.phoneNumbers[0]}</bdi>
                </a>
              </span>
            )}
          </div>
        </div>

        {/* Desktop CTA cluster */}
        <div className="hidden md:flex flex-col gap-2 md:items-end">
          <Button
            size="lg"
            className="bg-white text-primary-700 hover:bg-white/90 font-semibold shadow-sm w-full md:w-auto min-h-[44px]"
            onClick={onBookNow}
          >
            <Calendar className="me-2 h-4 w-4" aria-hidden="true" />
            {t("clinics.bookNow")}
          </Button>
          {clinic.phoneNumbers && clinic.phoneNumbers.length > 0 && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white w-full md:w-auto min-h-[44px]"
            >
              <a href={`tel:${clinic.phoneNumbers[0]}`}>
                <Phone className="me-2 h-4 w-4" aria-hidden="true" />
                {t("clinics.callClinic")}
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Today's hours strip */}
      <div className="relative border-t border-white/15 bg-black/20 px-6 py-3 sm:px-8">
        <TodayHoursStrip
          schedule={todaySchedule}
          isOpenNow={isOpenNow}
          locale={locale}
          t={t}
        />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function OpenNowBadge({
  isOpenNow,
  hasSchedule,
  t,
}: {
  isOpenNow: boolean;
  hasSchedule: boolean;
  t: (k: string) => string;
}) {
  if (isOpenNow) {
    return (
      <Badge className="bg-success-500/95 text-white ring-1 ring-white/25 hover:bg-success-500">
        <span
          className="me-1.5 inline-block h-2 w-2 rounded-full bg-white animate-pulse"
          aria-hidden="true"
        />
        {t("clinics.openNow")}
      </Badge>
    );
  }
  return (
    <Badge className="bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15">
      <XCircle className="me-1 h-3 w-3" aria-hidden="true" />
      {hasSchedule ? t("clinics.closedNow") : t("clinics.closedToday")}
    </Badge>
  );
}

function TodayHoursStrip({
  schedule,
  isOpenNow,
  locale,
  t,
}: {
  schedule: ClinicSchedule | undefined;
  isOpenNow: boolean;
  locale: "ar" | "en";
  t: (k: string) => string;
}) {
  if (!schedule || !schedule.isActive || !schedule.shifts?.length) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/85">
        <Clock className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium">{t("clinics.todayHours")}:</span>
        <span>{t("clinics.closedToday")}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <div className="flex items-center gap-2 text-white/95 font-medium">
        <Clock className="h-4 w-4" aria-hidden="true" />
        <span>{t("clinics.todayHours")}:</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {schedule.shifts.map((shift, i) => (
          <ShiftPill
            key={i}
            shift={shift}
            locale={locale}
            tone={isOpenNow ? "active" : "neutral"}
          />
        ))}
      </div>
    </div>
  );
}

function ShiftPill({
  shift,
  locale,
  tone,
}: {
  shift: ScheduleShift;
  locale: "ar" | "en";
  tone: "active" | "neutral" | "muted";
}) {
  const start = formatTime(shift.startTime, locale);
  const end = formatTime(shift.endTime, locale);
  const styles =
    tone === "active"
      ? "bg-success-500/90 text-white ring-1 ring-white/25"
      : tone === "neutral"
        ? "bg-white/15 text-white ring-1 ring-white/25"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        styles,
      )}
    >
      <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
      <bdi className="tabular-nums">
        {start}
        <span className="mx-1.5 opacity-70">–</span>
        {end}
      </bdi>
    </span>
  );
}

function SidebarTodayCard({
  schedule,
  isOpenNow,
  locale,
  t,
}: {
  schedule: ClinicSchedule | undefined;
  isOpenNow: boolean;
  locale: "ar" | "en";
  t: (k: string) => string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 space-y-2",
        isOpenNow
          ? "border-success-300 dark:border-success-800 bg-success-50 dark:bg-success-900/20"
          : "border-border bg-muted/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {t("clinics.todayHours")}
        </span>
        {isOpenNow ? (
          <Badge className="bg-success-500 text-white">
            <span
              className="me-1 inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse"
              aria-hidden="true"
            />
            {t("clinics.openNow")}
          </Badge>
        ) : (
          <Badge variant="outline">
            {schedule?.isActive
              ? t("clinics.closedNow")
              : t("clinics.closedToday")}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {schedule?.isActive && schedule.shifts?.length ? (
          schedule.shifts.map((shift, i) => (
            <ShiftPill
              key={i}
              shift={shift}
              locale={locale}
              tone={isOpenNow ? "active" : "muted"}
            />
          ))
        ) : (
          <span className="text-sm text-muted-foreground">
            {t("clinics.closedToday")}
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  className,
  isTime = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "muted";
  className?: string;
  /** When true the value is a time/number — render with tabular-nums.
   *  Otherwise the value may be translated text (e.g. "مغلقة اليوم")
   *  and must follow the page direction. */
  isTime?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 flex items-center gap-3 min-w-0",
        tone === "primary"
          ? "border-border bg-card"
          : "border-dashed border-border bg-muted/40",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          tone === "primary"
            ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
            : "bg-muted text-muted-foreground",
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
            isTime && "tabular-nums",
            tone === "primary" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <bdi>{value}</bdi>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function DoctorPreviewCard({
  doctor,
  doctorAvatar,
  specialtyName,
  locale,
  t,
}: {
  doctor: NonNullable<ReturnType<typeof useClinic>["data"]>["doctorProfile"];
  doctorAvatar: string | null;
  specialtyName: string;
  locale: "ar" | "en";
  t: (k: string) => string;
}) {
  if (!doctor) return null;
  return (
    <Link
      href={`/doctors/${doctor.id}`}
      className="group block rounded-2xl border border-border bg-card hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        {doctorAvatar ? (
          <img
            src={getImageUrl(doctorAvatar)}
            alt=""
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900/40 shrink-0"
          />
        ) : (
          <span
            className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40 ring-2 ring-primary-200 dark:ring-primary-900"
            aria-hidden="true"
          >
            <Stethoscope className="h-7 w-7 text-primary-600 dark:text-primary-400" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            <span className="text-base sm:text-lg font-semibold text-foreground truncate">
              {t("doctors.doctorPrefix")} {doctor.user?.fullName}
            </span>
            {doctor.totalRatings > 0 && (
              <span
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-foreground"
                aria-label={`${t("clinics.doctorRating")}: ${Number(doctor.averageRating).toFixed(1)}`}
              >
                <Star
                  className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                  aria-hidden="true"
                />
                <bdi className="font-semibold tabular-nums">
                  {Number(doctor.averageRating).toFixed(1)}
                </bdi>
                <bdi className="text-muted-foreground">
                  ({doctor.totalRatings})
                </bdi>
              </span>
            )}
          </div>
          {specialtyName && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {specialtyName}
            </p>
          )}
          {doctor.totalAppointments > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("clinics.totalAppointments")}:{" "}
              <bdi className="tabular-nums font-medium text-foreground">
                {doctor.totalAppointments}
              </bdi>
            </p>
          )}
        </div>

        {/* Direction-aware chevron — points toward the link target. */}
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ClinicDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 w-full rounded-3xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
