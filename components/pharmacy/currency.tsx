"use client";

import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface CurrencyProps {
  amount: number | string | null | undefined;
  currency?: string;
  className?: string;
  /**
   * If true, render in muted color when amount is zero.
   */
  fadeZero?: boolean;
}

/**
 * Localized currency display. Uses `Intl.NumberFormat` with the active locale
 * and the given currency (defaults to `EGP`). Always shows two decimals.
 *
 * Renders dir-neutral content; the surrounding text direction (RTL/LTR) is
 * handled by the layout.
 */
export function Currency({
  amount,
  currency = "EGP",
  className,
  fadeZero = false,
}: CurrencyProps) {
  const { locale } = useTranslation();

  const value = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  const safeValue = Number.isFinite(value) ? value : 0;

  const formatter = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const muted = fadeZero && safeValue === 0;

  return (
    <span
      className={cn(
        "tabular-nums",
        muted && "text-muted-foreground",
        className,
      )}
      data-testid="currency"
    >
      {formatter.format(safeValue)}
    </span>
  );
}
