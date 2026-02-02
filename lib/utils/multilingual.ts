import type { Multilingual } from '@/types';
import type { SupportedLocale } from './date';

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

/**
 * Get initials from a name (supports Arabic and English)
 */
export function getInitials(name: string | undefined | null): string {
  if (!name) return '';

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}
