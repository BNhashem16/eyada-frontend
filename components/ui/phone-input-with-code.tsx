"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Input } from "./input";
import { useTranslation } from "@/lib/i18n";

const COUNTRY_CODES = [
  { code: "20", flag: "🇪🇬", name: { ar: "مصر", en: "Egypt" } },
  { code: "966", flag: "🇸🇦", name: { ar: "السعودية", en: "Saudi Arabia" } },
  { code: "971", flag: "🇦🇪", name: { ar: "الإمارات", en: "UAE" } },
  { code: "965", flag: "🇰🇼", name: { ar: "الكويت", en: "Kuwait" } },
  { code: "974", flag: "🇶🇦", name: { ar: "قطر", en: "Qatar" } },
  { code: "973", flag: "🇧🇭", name: { ar: "البحرين", en: "Bahrain" } },
  { code: "968", flag: "🇴🇲", name: { ar: "عمان", en: "Oman" } },
  { code: "962", flag: "🇯🇴", name: { ar: "الأردن", en: "Jordan" } },
  { code: "964", flag: "🇮🇶", name: { ar: "العراق", en: "Iraq" } },
  { code: "963", flag: "🇸🇾", name: { ar: "سوريا", en: "Syria" } },
  { code: "961", flag: "🇱🇧", name: { ar: "لبنان", en: "Lebanon" } },
  { code: "970", flag: "🇵🇸", name: { ar: "فلسطين", en: "Palestine" } },
  { code: "218", flag: "🇱🇾", name: { ar: "ليبيا", en: "Libya" } },
  { code: "216", flag: "🇹🇳", name: { ar: "تونس", en: "Tunisia" } },
  { code: "213", flag: "🇩🇿", name: { ar: "الجزائر", en: "Algeria" } },
  { code: "212", flag: "🇲🇦", name: { ar: "المغرب", en: "Morocco" } },
  { code: "249", flag: "🇸🇩", name: { ar: "السودان", en: "Sudan" } },
  { code: "967", flag: "🇾🇪", name: { ar: "اليمن", en: "Yemen" } },
  { code: "1", flag: "🇺🇸", name: { ar: "أمريكا", en: "USA" } },
  { code: "44", flag: "🇬🇧", name: { ar: "بريطانيا", en: "UK" } },
  { code: "49", flag: "🇩🇪", name: { ar: "ألمانيا", en: "Germany" } },
  { code: "33", flag: "🇫🇷", name: { ar: "فرنسا", en: "France" } },
  { code: "90", flag: "🇹🇷", name: { ar: "تركيا", en: "Turkey" } },
] as const;

function parsePhoneValue(value: string): {
  countryCode: string;
  localNumber: string;
} {
  if (!value) return { countryCode: "20", localNumber: "" };

  const digits = value.replace(/[^0-9]/g, "");

  // Try to match against known country codes (longest first)
  const sortedCodes = [...COUNTRY_CODES].sort(
    (a, b) => b.code.length - a.code.length,
  );
  for (const country of sortedCodes) {
    if (digits.startsWith(country.code)) {
      return {
        countryCode: country.code,
        localNumber: digits.slice(country.code.length),
      };
    }
  }

  return { countryCode: "20", localNumber: digits };
}

interface PhoneInputWithCodeProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function PhoneInputWithCode({
  value,
  onChange,
  disabled,
  className,
}: PhoneInputWithCodeProps) {
  const { locale } = useTranslation();
  const { countryCode, localNumber } = parsePhoneValue(value);

  const handleCodeChange = (newCode: string) => {
    onChange(localNumber ? `+${newCode}${localNumber}` : "");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^0-9]/g, "");
    onChange(num ? `+${countryCode}${num}` : "");
  };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

  return (
    <div className={cn("flex gap-2", className)} dir="ltr">
      <Select
        value={countryCode}
        onValueChange={handleCodeChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[120px] sm:w-[140px] shrink-0">
          <SelectValue>
            {selectedCountry && (
              <span className="flex items-center gap-1.5">
                <span>{selectedCountry.flag}</span>
                <span className="text-muted-foreground">
                  +{selectedCountry.code}
                </span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>
                  {country.name[locale as "ar" | "en"] || country.name.en}
                </span>
                <span className="text-muted-foreground">+{country.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        inputMode="tel"
        value={localNumber}
        onChange={handleNumberChange}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  );
}
