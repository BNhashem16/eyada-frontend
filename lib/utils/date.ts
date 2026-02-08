import {
  format,
  parseISO,
  isValid,
  formatDistance,
  isToday,
  isBefore,
  isSameDay,
  addDays,
  isPast,
} from "date-fns";

export { isToday, isBefore, isSameDay, addDays, isPast };
import { ar, enUS } from "date-fns/locale";
import { getTranslation } from "@/lib/i18n";

export type SupportedLocale = "ar" | "en";

const locales = {
  ar,
  en: enUS,
};

/**
 * Get user's timezone offset in minutes
 * Positive = behind UTC (e.g., UTC-5 = 300)
 * Negative = ahead of UTC (e.g., UTC+2 = -120)
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Get user's timezone name
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert UTC date/time to user's local timezone
 * The backend sends UTC, we add/subtract offset to get local time
 */
export function toLocalTime(date: Date | string): Date {
  if (typeof date === "string") {
    // Parse the ISO string - JavaScript automatically converts to local time
    // when using new Date() with ISO string
    return new Date(date);
  }
  return date;
}

/**
 * Convert UTC time string (HH:mm) to local time string
 * @param utcTime - Time in HH:mm format (UTC)
 * @param dateContext - Optional date for accurate DST handling
 */
export function utcTimeToLocal(utcTime: string, dateContext?: Date): string {
  if (!utcTime || !utcTime.includes(":")) return utcTime;

  const [hours, minutes] = utcTime.split(":").map(Number);

  // Create a UTC date with the given time
  const baseDate = dateContext || new Date();
  const utcDate = new Date(
    Date.UTC(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hours,
      minutes,
      0,
    ),
  );

  // The Date object automatically converts to local time
  const localHours = utcDate.getHours().toString().padStart(2, "0");
  const localMinutes = utcDate.getMinutes().toString().padStart(2, "0");

  return `${localHours}:${localMinutes}`;
}

/**
 * Convert local time string (HH:mm) to UTC time string
 * @param localTime - Time in HH:mm format (local)
 * @param dateContext - Optional date for accurate DST handling
 */
export function localTimeToUtc(localTime: string, dateContext?: Date): string {
  if (!localTime || !localTime.includes(":")) return localTime;

  const [hours, minutes] = localTime.split(":").map(Number);

  // Create a local date with the given time
  const baseDate = dateContext || new Date();
  const localDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    minutes,
    0,
  );

  // Get UTC time
  const utcHours = localDate.getUTCHours().toString().padStart(2, "0");
  const utcMinutes = localDate.getUTCMinutes().toString().padStart(2, "0");

  return `${utcHours}:${utcMinutes}`;
}

/**
 * Format a date string or Date object (handles UTC to local conversion)
 */
export function formatDate(
  date: string | Date | undefined | null,
  formatStr: string = "PPP",
  locale: SupportedLocale = "ar",
): string {
  if (!date) return "";

  let dateObj: Date;

  if (typeof date === "string") {
    // If ISO string with timezone indicator (Z or +/-), convert to local
    if (
      date.includes("T") &&
      (date.includes("Z") || date.match(/[+-]\d{2}:\d{2}$/))
    ) {
      dateObj = toLocalTime(date);
    } else {
      // Plain date string (YYYY-MM-DD) - parse as local date
      dateObj = parseISO(date);
    }
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) return "";

  return format(dateObj, formatStr, { locale: locales[locale] });
}

/**
 * Format time from HH:mm string or extract time from ISO datetime
 * Automatically converts UTC time to local time
 * @param time - Time in HH:mm format (UTC from backend) or ISO datetime string
 * @param locale - Locale for formatting
 * @param isUtc - If true, treats HH:mm as UTC and converts to local (default: true)
 */
export function formatTime(
  time: string | undefined | null,
  locale: SupportedLocale = "ar",
  isUtc: boolean = true,
): string {
  if (!time) return "";

  let date: Date;

  // Check if it's an ISO datetime string
  if (time.includes("T")) {
    // ISO datetime - JavaScript handles UTC to local conversion automatically
    date = new Date(time);
  } else {
    // It's a simple HH:mm string
    if (isUtc) {
      // Convert UTC time to local time
      const localTime = utcTimeToLocal(time);
      const [hours, minutes] = localTime.split(":").map(Number);
      date = new Date();
      date.setHours(hours, minutes, 0, 0);
    } else {
      // Already local time
      const [hours, minutes] = time.split(":").map(Number);
      date = new Date();
      date.setHours(hours, minutes, 0, 0);
    }
  }

  return format(date, "p", { locale: locales[locale] });
}

/**
 * Format time from ISO datetime string (UTC to local)
 */
export function formatTimeFromDatetime(
  datetime: string | Date | undefined | null,
  locale: SupportedLocale = "ar",
): string {
  if (!datetime) return "";

  // new Date() with ISO string automatically converts to local time
  const dateObj = typeof datetime === "string" ? new Date(datetime) : datetime;

  if (!isValid(dateObj)) return "";

  return format(dateObj, "p", { locale: locales[locale] });
}

/**
 * Get local time string (HH:mm) from ISO datetime or UTC time
 */
export function getLocalTimeString(datetime: string | Date): string {
  if (typeof datetime === "string") {
    // If ISO datetime
    if (datetime.includes("T")) {
      const dateObj = new Date(datetime);
      return format(dateObj, "HH:mm");
    }
    // If HH:mm format (UTC), convert to local
    return utcTimeToLocal(datetime);
  }
  return format(datetime, "HH:mm");
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(
  date: string | Date | undefined | null,
  locale: SupportedLocale = "ar",
): string {
  if (!date) return "";

  let dateObj: Date;

  if (typeof date === "string") {
    // If ISO string with timezone indicator, convert to local
    if (
      date.includes("T") &&
      (date.includes("Z") || date.match(/[+-]\d{2}:\d{2}$/))
    ) {
      dateObj = toLocalTime(date);
    } else {
      dateObj = parseISO(date);
    }
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) return "";

  return formatDistance(dateObj, new Date(), {
    addSuffix: true,
    locale: locales[locale],
  });
}

/**
 * Format date for API (YYYY-MM-DD) - uses local date
 */
export function toApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Format datetime for API (ISO string in UTC)
 */
export function toApiDatetime(date: Date): string {
  return date.toISOString();
}

/**
 * Create a datetime from local date and local time
 */
export function createLocalDatetime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const localDate = new Date(date);
  localDate.setHours(hours, minutes, 0, 0);
  return localDate;
}

/**
 * Create a datetime from local date and UTC time for API
 * Useful when user selects a time slot that's in UTC
 */
export function createDatetimeFromUtcTime(date: Date, utcTime: string): Date {
  const [hours, minutes] = utcTime.split(":").map(Number);
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
      0,
    ),
  );
}

/**
 * Get day name in Arabic or English
 */
export function getDayName(
  dayIndex: number,
  locale: SupportedLocale = "ar",
): string {
  const dayKeys = [
    "days.sunday",
    "days.monday",
    "days.tuesday",
    "days.wednesday",
    "days.thursday",
    "days.friday",
    "days.saturday",
  ];
  return getTranslation(dayKeys[dayIndex], locale) || "";
}

/**
 * Format relative date (alias for getRelativeTime)
 */
export const formatRelativeDate = getRelativeTime;

/**
 * Get an array of dates for the week starting from a given date
 */
export function getWeekDays(startDate: Date, count: number = 7): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < count; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
}
