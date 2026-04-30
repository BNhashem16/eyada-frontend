"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useClinicAvailableSlots,
  type AvailableSlot,
} from "../hooks/use-clinics";
import { DayOfWeek } from "@/types/enums";
import type { ClinicSchedule, ScheduleShift } from "@/types/models";
import { useTranslation } from "@/lib/i18n";
import {
  formatDate,
  formatTime,
  toApiDate,
  utcTimeToLocal,
} from "@/lib/utils/date";
import { cn } from "@/lib/utils";

const DAY_KEYS: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]: "days.sunday",
  [DayOfWeek.MONDAY]: "days.monday",
  [DayOfWeek.TUESDAY]: "days.tuesday",
  [DayOfWeek.WEDNESDAY]: "days.wednesday",
  [DayOfWeek.THURSDAY]: "days.thursday",
  [DayOfWeek.FRIDAY]: "days.friday",
  [DayOfWeek.SATURDAY]: "days.saturday",
};

const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

const JS_DAY_TO_ENUM: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

const PICKER_DAYS = 14;

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function timeToLocalMinutes(time: string): number {
  const local = time.includes("T")
    ? time.split("T")[1]?.slice(0, 5) ?? ""
    : utcTimeToLocal(time);
  const [h, m] = local.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  return h * 60 + m;
}

interface ClinicScheduleExplorerProps {
  clinicId: string;
  schedules: ClinicSchedule[] | undefined;
  onPickSlot: (date: Date, slotTime: string) => void;
  onPickDayForBooking: (date: Date) => void;
}

export function ClinicScheduleExplorer({
  clinicId,
  schedules,
  onPickSlot,
  onPickDayForBooking,
}: ClinicScheduleExplorerProps) {
  const { t, locale } = useTranslation();
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);
  const days = useMemo(
    () =>
      Array.from({ length: PICKER_DAYS }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
      }),
    [today],
  );

  // Default: pick today if today is a working day, else the first working day.
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (!schedules) return today;
    const todayEnum = JS_DAY_TO_ENUM[today.getDay()];
    const todaySchedule = schedules.find((s) => s.dayOfWeek === todayEnum);
    if (todaySchedule?.isActive && todaySchedule.shifts?.length) return today;
    for (const d of days) {
      const dayEnum = JS_DAY_TO_ENUM[d.getDay()];
      const sch = schedules.find((s) => s.dayOfWeek === dayEnum);
      if (sch?.isActive && sch.shifts?.length) return d;
    }
    return today;
  });

  const sortedSchedules = useMemo(
    () =>
      schedules
        ? [...schedules].sort(
            (a, b) =>
              DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
          )
        : [],
    [schedules],
  );

  const selectedDayEnum = JS_DAY_TO_ENUM[selectedDate.getDay()];
  const selectedSchedule = schedules?.find(
    (s) => s.dayOfWeek === selectedDayEnum,
  );
  const selectedDayIsClosed =
    !selectedSchedule?.isActive || !selectedSchedule.shifts?.length;

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          {t("clinics.browseTimes")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("clinics.browseTimesHint")}
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Day picker — horizontal scrollable chip list */}
        <DayPicker
          days={days}
          today={today}
          selectedDate={selectedDate}
          schedules={schedules}
          onSelect={setSelectedDate}
          locale={locale}
          t={t}
        />

        {/* Day summary header */}
        <DaySummary
          selectedDate={selectedDate}
          isClosed={selectedDayIsClosed}
          shifts={selectedSchedule?.shifts}
          locale={locale}
          t={t}
        />

        {/* Filter toggle */}
        {!selectedDayIsClosed && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-full bg-muted p-1 text-sm">
              <button
                type="button"
                onClick={() => setShowAvailableOnly(false)}
                className={cn(
                  "px-3 py-1.5 rounded-full transition-colors min-h-[36px]",
                  !showAvailableOnly
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("clinics.showAllSlots")}
              </button>
              <button
                type="button"
                onClick={() => setShowAvailableOnly(true)}
                className={cn(
                  "px-3 py-1.5 rounded-full transition-colors min-h-[36px]",
                  showAvailableOnly
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("clinics.showAvailableOnly")}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="min-h-[36px]"
              onClick={() => onPickDayForBooking(selectedDate)}
            >
              <Calendar className="me-2 h-4 w-4" aria-hidden="true" />
              {t("clinics.bookThisSlot")}
            </Button>
          </div>
        )}

        {/* Slots grid */}
        {!selectedDayIsClosed && (
          <SlotsForDay
            clinicId={clinicId}
            date={selectedDate}
            showAvailableOnly={showAvailableOnly}
            onPickSlot={onPickSlot}
            t={t}
            locale={locale}
          />
        )}

        {/* Weekly summary toggle */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowWeeklySummary((v) => !v)}
            className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline min-h-[36px]"
            aria-expanded={showWeeklySummary}
          >
            {showWeeklySummary ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
            {showWeeklySummary
              ? t("clinics.hideWeeklySummary")
              : t("clinics.showWeeklySummary")}
          </button>

          {showWeeklySummary && (
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border overflow-hidden">
              {sortedSchedules.length > 0 ? (
                sortedSchedules.map((schedule) => (
                  <WeeklyDayRow
                    key={schedule.id}
                    schedule={schedule}
                    isToday={schedule.dayOfWeek === JS_DAY_TO_ENUM[today.getDay()]}
                    locale={locale}
                    t={t}
                  />
                ))
              ) : (
                <li className="p-4 text-sm text-muted-foreground text-center">
                  {t("clinics.noWorkingHours")}
                </li>
              )}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function DayPicker({
  days,
  today,
  selectedDate,
  schedules,
  onSelect,
  locale,
  t,
}: {
  days: Date[];
  today: Date;
  selectedDate: Date;
  schedules: ClinicSchedule[] | undefined;
  onSelect: (d: Date) => void;
  locale: "ar" | "en";
  t: (k: string) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {t("clinics.pickDay")}
        </span>
      </div>
      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="flex gap-2 px-1">
          {days.map((d) => {
            const dayEnum = JS_DAY_TO_ENUM[d.getDay()];
            const sch = schedules?.find((s) => s.dayOfWeek === dayEnum);
            const isClosed = !sch?.isActive || !sch.shifts?.length;
            const isSelected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, today);

            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => onSelect(d)}
                aria-pressed={isSelected}
                aria-label={`${formatDate(d, "EEEE d MMMM", locale)}${
                  isClosed ? ` — ${t("clinics.closedToday")}` : ""
                }`}
                className={cn(
                  "shrink-0 flex flex-col items-center justify-center gap-0.5 rounded-2xl border px-3 py-2 min-w-[64px] min-h-[72px] transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-primary-500 bg-primary-500 text-white shadow-md"
                    : isClosed
                      ? "border-dashed border-border bg-muted/40 text-muted-foreground"
                      : "border-border bg-card text-foreground hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20",
                )}
              >
                <span className="text-[10px] font-medium uppercase tracking-wide opacity-90">
                  {formatDate(d, "EEE", locale)}
                </span>
                <bdi className="text-lg font-bold tabular-nums">
                  {formatDate(d, "d", locale)}
                </bdi>
                {isToday && !isSelected && (
                  <span className="text-[9px] font-semibold text-primary-600 dark:text-primary-400">
                    {t("clinics.today")}
                  </span>
                )}
                {isClosed && !isSelected && (
                  <span className="text-[9px] font-medium opacity-80">
                    {t("common.closed")}
                  </span>
                )}
                {isSelected && isToday && (
                  <span className="text-[9px] font-semibold opacity-95">
                    {t("clinics.today")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function DaySummary({
  selectedDate,
  isClosed,
  shifts,
  locale,
  t,
}: {
  selectedDate: Date;
  isClosed: boolean;
  shifts: ScheduleShift[] | undefined;
  locale: "ar" | "en";
  t: (k: string) => string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isClosed
          ? "border-dashed border-border bg-muted/40"
          : "border-primary-200 dark:border-primary-800 bg-primary-50/60 dark:bg-primary-900/20",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            {t("clinics.pickDay")}
          </p>
          <p className="text-base sm:text-lg font-semibold text-foreground">
            {formatDate(selectedDate, "EEEE, d MMMM yyyy", locale)}
          </p>
        </div>
        {isClosed ? (
          <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3" aria-hidden="true" />
            {t("clinics.closedToday")}
          </Badge>
        ) : (
          <Badge className="bg-primary-500 text-white gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {shifts?.length === 1
              ? t("clinics.shiftCountSingular")
              : t("clinics.shiftCount").replace(
                  "{count}",
                  String(shifts?.length ?? 0),
                )}
          </Badge>
        )}
      </div>

      {!isClosed && shifts && shifts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {shifts.map((shift, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-xs font-medium"
            >
              <Clock
                className="h-3 w-3 shrink-0 text-primary-600 dark:text-primary-400"
                aria-hidden="true"
              />
              <bdi className="tabular-nums">
                {formatTime(shift.startTime, locale)}
                <span className="mx-1.5 opacity-70">–</span>
                {formatTime(shift.endTime, locale)}
              </bdi>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function SlotsForDay({
  clinicId,
  date,
  showAvailableOnly,
  onPickSlot,
  t,
  locale,
}: {
  clinicId: string;
  date: Date;
  showAvailableOnly: boolean;
  onPickSlot: (date: Date, slotTime: string) => void;
  t: (k: string) => string;
  locale: "ar" | "en";
}) {
  const apiDate = toApiDate(date);
  const { data, isLoading, isError } = useClinicAvailableSlots(
    clinicId,
    apiDate,
  );

  const isToday = useMemo(() => isSameDay(date, new Date()), [date]);
  const nowMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  const slots = useMemo<
    Array<AvailableSlot & { passed: boolean }>
  >(() => {
    if (!data) return [];
    return data.map((slot) => {
      const slotMin = timeToLocalMinutes(slot.time);
      const passed = isToday && slotMin >= 0 && slotMin < nowMinutes;
      return { ...slot, passed };
    });
  }, [data, isToday, nowMinutes]);

  const filtered = useMemo(
    () =>
      showAvailableOnly
        ? slots.filter((s) => s.isAvailable && !s.passed)
        : slots,
    [slots, showAvailableOnly],
  );

  const availableCount = useMemo(
    () => slots.filter((s) => s.isAvailable && !s.passed).length,
    [slots],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {t("clinics.loadingSlots")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-sm">
        <AlertCircle className="h-6 w-6 text-error-500" aria-hidden="true" />
        <p className="text-error-600 dark:text-error-400">
          {t("clinics.slotsLoadError")}
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
        <Clock className="h-6 w-6" aria-hidden="true" />
        <p>{t("clinics.noSlotsForDay")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">
          {availableCount === 0 ? (
            <span className="text-muted-foreground">
              {t("clinics.slotsCountAvailableNone")}
            </span>
          ) : availableCount === 1 ? (
            <span className="font-medium text-success-700 dark:text-success-300">
              {t("clinics.slotsCountAvailableSingular")}
            </span>
          ) : (
            <span className="font-medium text-success-700 dark:text-success-300">
              {t("clinics.slotsCountAvailable").replace(
                "{count}",
                String(availableCount),
              )}
            </span>
          )}
        </p>
        <Legend t={t} />
      </div>

      <div
        role="list"
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2"
      >
        {filtered.map((slot, i) => {
          const isClickable = slot.isAvailable && !slot.passed;
          const tone = !slot.isAvailable
            ? "booked"
            : slot.passed
              ? "passed"
              : "available";
          return (
            <button
              key={`${slot.time}-${i}`}
              type="button"
              role="listitem"
              disabled={!isClickable}
              onClick={() => isClickable && onPickSlot(date, slot.time)}
              aria-label={`${formatTime(slot.time, locale)} — ${
                tone === "available"
                  ? t("clinics.available")
                  : tone === "booked"
                    ? t("clinics.booked")
                    : t("clinics.passed")
              }`}
              className={cn(
                "group flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-sm font-medium tabular-nums transition-all min-h-[56px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                tone === "available" &&
                  "border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20 text-success-800 dark:text-success-200 hover:border-success-400 hover:bg-success-100 dark:hover:bg-success-900/40 cursor-pointer",
                tone === "booked" &&
                  "border-border bg-muted text-muted-foreground line-through cursor-not-allowed",
                tone === "passed" &&
                  "border-dashed border-border bg-muted/40 text-muted-foreground/70 cursor-not-allowed",
              )}
            >
              <bdi className="leading-none tabular-nums">
                {formatTime(slot.time, locale)}
              </bdi>
              {tone === "available" && (
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold opacity-90">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  {t("clinics.available")}
                </span>
              )}
              {tone === "booked" && (
                <span className="mt-1 text-[10px] font-medium opacity-80">
                  {t("clinics.booked")}
                </span>
              )}
              {tone === "passed" && (
                <span className="mt-1 text-[10px] font-medium opacity-80">
                  {t("clinics.passed")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ t }: { t: (k: string) => string }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      <li className="inline-flex items-center gap-1">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full bg-success-500"
          aria-hidden="true"
        />
        {t("clinics.available")}
      </li>
      <li className="inline-flex items-center gap-1">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/40"
          aria-hidden="true"
        />
        {t("clinics.booked")}
      </li>
      <li className="inline-flex items-center gap-1">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-muted-foreground/60"
          aria-hidden="true"
        />
        {t("clinics.passed")}
      </li>
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function WeeklyDayRow({
  schedule,
  isToday,
  locale,
  t,
}: {
  schedule: ClinicSchedule;
  isToday: boolean;
  locale: "ar" | "en";
  t: (k: string) => string;
}) {
  const dayLabel = t(DAY_KEYS[schedule.dayOfWeek]);
  const isClosed = !schedule.isActive || !schedule.shifts?.length;

  return (
    <li
      className={cn(
        "flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between",
        isToday
          ? "bg-primary-50 dark:bg-primary-900/20"
          : isClosed
            ? "bg-muted/30"
            : "bg-card",
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            "font-medium text-sm",
            isClosed ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {dayLabel}
        </span>
        {isToday && (
          <Badge
            variant="outline"
            className="border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300"
          >
            {t("clinics.today")}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 sm:justify-end">
        {isClosed ? (
          <span className="text-xs text-muted-foreground">
            {t("common.closed")}
          </span>
        ) : (
          schedule.shifts!.map((shift, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
            >
              <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
              <bdi className="tabular-nums">
                {formatTime(shift.startTime, locale)}
                <span className="mx-1.5 opacity-70">–</span>
                {formatTime(shift.endTime, locale)}
              </bdi>
            </span>
          ))
        )}
      </div>
    </li>
  );
}
