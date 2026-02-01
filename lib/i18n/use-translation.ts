'use client';

import { useCallback, useMemo } from 'react';
import ar from './ar.json';
import en from './en.json';
import { defaultLocale, type Locale } from './config';

// Try to import useLanguage, but provide fallback for SSR
let useLanguageHook: (() => { locale: Locale }) | null = null;
try {
  // Dynamic import to avoid SSR issues
  const { useLanguage } = require('@/components/providers/language-provider');
  useLanguageHook = useLanguage;
} catch {
  // Fallback if provider not available
}

type TranslationKeys = typeof ar;
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<TranslationKeys>;

const translations: Record<Locale, TranslationKeys> = {
  ar,
  en,
};

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Hook to access translations
 * Uses the current locale from LanguageProvider if available
 * @param overrideLocale - Optional locale to override the provider's locale
 * @returns Object with translation function and utilities
 */
export function useTranslation(overrideLocale?: Locale) {
  // Try to get locale from provider
  let providerLocale: Locale = defaultLocale;
  try {
    if (useLanguageHook) {
      const { locale } = useLanguageHook();
      providerLocale = locale;
    }
  } catch {
    // Provider not available, use default
  }

  const locale = overrideLocale ?? providerLocale;
  const currentTranslations = useMemo(() => translations[locale], [locale]);

  /**
   * Get a translated string by key
   * @param key - The translation key (e.g., 'common.save', 'auth.login')
   * @param params - Optional parameters to interpolate (e.g., { count: 5 })
   * @returns The translated string or the key if not found
   */
  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      let value = getNestedValue(currentTranslations as Record<string, unknown>, key);

      if (!value) {
        // Fallback to Arabic if not found
        value = getNestedValue(translations.ar as Record<string, unknown>, key);
      }

      if (!value) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }

      // Interpolate parameters
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        });
      }

      return value;
    },
    [currentTranslations]
  );

  return {
    t,
    locale,
    isRtl: locale === 'ar',
    dir: locale === 'ar' ? 'rtl' : 'ltr',
  };
}

/**
 * Get a single translation without the hook
 * Useful for static contexts or server-side rendering
 */
export function getTranslation(
  key: TranslationKey | string,
  locale: Locale = defaultLocale,
  params?: Record<string, string | number>
): string {
  let value = getNestedValue(translations[locale] as Record<string, unknown>, key);

  if (!value) {
    value = getNestedValue(translations.ar as Record<string, unknown>, key);
  }

  if (!value) {
    return key;
  }

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    });
  }

  return value;
}
