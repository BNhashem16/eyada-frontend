"use client";

import * as React from "react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const locales = { ar, en: enUS };

interface DateOfBirthInputProps {
  /** Date value in yyyy-MM-dd string format */
  value?: string;
  /** Callback with yyyy-MM-dd string (empty string when incomplete) */
  onChange?: (value: string) => void;
  /** Additional class names for the wrapper */
  className?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Locale for month names */
  locale?: "ar" | "en";
}

function getDaysInMonth(month: number, year: number): number {
  if (!month) return 31;
  if ([4, 6, 9, 11].includes(month)) return 30;
  if (month === 2) {
    if (!year) return 29;
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  }
  return 31;
}

function DateOfBirthInput({
  value,
  onChange,
  className,
  disabled = false,
  locale = "ar",
}: DateOfBirthInputProps) {
  const { t } = useTranslation();

  // Parse external value into parts
  const externalParts = React.useMemo(() => {
    if (!value || !value.includes("-")) return { year: "", month: "", day: "" };
    const [y, m, d] = value.split("-");
    return {
      year: y || "",
      month: m || "",
      day: d || "",
    };
  }, [value]);

  // Internal state for partial selections
  const [year, setYear] = React.useState(externalParts.year);
  const [month, setMonth] = React.useState(externalParts.month);
  const [day, setDay] = React.useState(externalParts.day);

  // Sync internal state when external value changes
  React.useEffect(() => {
    setYear(externalParts.year);
    setMonth(externalParts.month);
    setDay(externalParts.day);
  }, [externalParts.year, externalParts.month, externalParts.day]);

  const currentYear = new Date().getFullYear();

  const years = React.useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear; y >= currentYear - 120; y--) {
      arr.push(y);
    }
    return arr;
  }, [currentYear]);

  const months = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2000, i, 1);
      return {
        value: String(i + 1).padStart(2, "0"),
        label: format(date, "MMMM", { locale: locales[locale] }),
      };
    });
  }, [locale]);

  const maxDays = React.useMemo(
    () => getDaysInMonth(parseInt(month) || 0, parseInt(year) || 0),
    [month, year],
  );

  const days = React.useMemo(
    () => Array.from({ length: maxDays }, (_, i) => i + 1),
    [maxDays],
  );

  const emitChange = (newYear: string, newMonth: string, newDay: string) => {
    if (newYear && newMonth && newDay) {
      // Clamp day if it exceeds max for month/year
      const max = getDaysInMonth(parseInt(newMonth), parseInt(newYear));
      const clampedDay = Math.min(parseInt(newDay), max);
      const formatted = `${newYear}-${newMonth}-${String(clampedDay).padStart(2, "0")}`;
      onChange?.(formatted);
    } else {
      onChange?.("");
    }
  };

  const handleYearChange = (val: string) => {
    setYear(val);
    // Clamp day if needed
    if (val && month && day) {
      const max = getDaysInMonth(parseInt(month), parseInt(val));
      if (parseInt(day) > max) {
        const clamped = String(max).padStart(2, "0");
        setDay(clamped);
        emitChange(val, month, clamped);
        return;
      }
    }
    emitChange(val, month, day);
  };

  const handleMonthChange = (val: string) => {
    setMonth(val);
    // Clamp day if needed
    if (year && val && day) {
      const max = getDaysInMonth(parseInt(val), parseInt(year));
      if (parseInt(day) > max) {
        const clamped = String(max).padStart(2, "0");
        setDay(clamped);
        emitChange(year, val, clamped);
        return;
      }
    }
    emitChange(year, val, day);
  };

  const handleDayChange = (val: string) => {
    setDay(val);
    emitChange(year, month, val);
  };

  const selectClass = cn(
    "h-10 rounded-lg border bg-background px-2 py-2 text-sm text-foreground",
    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "border-border hover:border-muted-foreground/50",
    "appearance-none cursor-pointer",
  );

  return (
    <div className={cn("flex gap-2", className)} dir="ltr">
      {/* Year */}
      <select
        value={year}
        onChange={(e) => handleYearChange(e.target.value)}
        disabled={disabled}
        className={cn(selectClass, "flex-1 min-w-0")}
      >
        <option value="">{t("common.selectYear")}</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>

      {/* Month */}
      <select
        value={month}
        onChange={(e) => handleMonthChange(e.target.value)}
        disabled={disabled}
        className={cn(selectClass, "flex-1 min-w-0")}
      >
        <option value="">{t("common.selectMonth")}</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      {/* Day */}
      <select
        value={day}
        onChange={(e) => handleDayChange(e.target.value)}
        disabled={disabled}
        className={cn(selectClass, "flex-[0.6] min-w-0")}
      >
        <option value="">{t("common.selectDay")}</option>
        {days.map((d) => (
          <option key={d} value={String(d).padStart(2, "0")}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}

DateOfBirthInput.displayName = "DateOfBirthInput";

export { DateOfBirthInput };
export type { DateOfBirthInputProps };
