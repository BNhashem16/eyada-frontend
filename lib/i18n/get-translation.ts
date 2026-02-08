import ar from "./ar.json";
import en from "./en.json";
import { defaultLocale, type Locale } from "./config";

type TranslationKeys = typeof ar;
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationKeys>;

const translations: Record<Locale, TranslationKeys> = {
  ar,
  en,
};

export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

/**
 * Get a single translation without the hook
 * Useful for static contexts or server-side rendering
 */
export function getTranslation(
  key: TranslationKey | string,
  locale: Locale = defaultLocale,
  params?: Record<string, string | number>,
): string {
  let value = getNestedValue(
    translations[locale] as Record<string, unknown>,
    key,
  );

  if (!value) {
    value = getNestedValue(translations.ar as Record<string, unknown>, key);
  }

  if (!value) {
    return key;
  }

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value!.replace(
        new RegExp(`\\{${paramKey}\\}`, "g"),
        String(paramValue),
      );
    });
  }

  return value;
}
