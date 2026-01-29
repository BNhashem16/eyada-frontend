import { format, parseISO, isValid, formatDistance, isToday, isBefore, isSameDay, addDays } from 'date-fns';

export { isToday, isBefore, isSameDay, addDays };
import { ar, enUS } from 'date-fns/locale';

export type SupportedLocale = 'ar' | 'en';

const locales = {
  ar,
  en: enUS,
};

/**
 * Format a date string or Date object
 */
export function formatDate(
  date: string | Date | undefined | null,
  formatStr: string = 'PPP',
  locale: SupportedLocale = 'ar'
): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) return '';

  return format(dateObj, formatStr, { locale: locales[locale] });
}

/**
 * Format time from HH:mm string
 */
export function formatTime(
  time: string | undefined | null,
  locale: SupportedLocale = 'ar'
): string {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return format(date, 'p', { locale: locales[locale] });
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(
  date: string | Date | undefined | null,
  locale: SupportedLocale = 'ar'
): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) return '';

  return formatDistance(dateObj, new Date(), {
    addSuffix: true,
    locale: locales[locale],
  });
}

/**
 * Format date for API (YYYY-MM-DD)
 */
export function toApiDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get day name in Arabic or English
 */
export function getDayName(
  dayIndex: number,
  locale: SupportedLocale = 'ar'
): string {
  const days = {
    ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };
  return days[locale][dayIndex] || '';
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
