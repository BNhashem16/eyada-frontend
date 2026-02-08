"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  type Locale,
  locales,
  defaultLocale,
  localeDirection,
} from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "rtl" | "ltr";
  isRtl: boolean;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

const LOCALE_STORAGE_KEY = "eyada-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Load saved locale on mount
  useEffect(() => {
    setMounted(true);
    const savedLocale = localStorage.getItem(
      LOCALE_STORAGE_KEY,
    ) as Locale | null;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  // Update HTML attributes when locale changes
  useEffect(() => {
    if (!mounted) return;

    const dir = localeDirection[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;

    // Update font family based on locale
    if (locale === "ar") {
      document.body.style.fontFamily =
        "var(--font-cairo, 'Cairo', 'Tajawal', system-ui, sans-serif)";
    } else {
      document.body.style.fontFamily =
        "var(--font-inter, 'Inter', system-ui, sans-serif)";
    }
  }, [locale, mounted]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === "ar" ? "en" : "ar";
    setLocale(newLocale);
  }, [locale, setLocale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      dir: localeDirection[locale],
      isRtl: locale === "ar",
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
