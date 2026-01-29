import type { Multilingual } from '@/types';

export type SupportedLocale = 'ar' | 'en';

/**
 * Get localized text from a Multilingual object
 */
export function getLocalizedText(
  text: Multilingual | string | undefined | null,
  locale: SupportedLocale
): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[locale] || text.ar || text.en || '';
}

/**
 * Create a Multilingual object
 */
export function createMultilingual(ar: string, en: string): Multilingual {
  return { ar, en };
}

/**
 * Check if text has content in the specified locale
 */
export function hasLocalizedContent(
  text: Multilingual | undefined | null,
  locale: SupportedLocale
): boolean {
  if (!text) return false;
  return Boolean(text[locale]?.trim());
}
