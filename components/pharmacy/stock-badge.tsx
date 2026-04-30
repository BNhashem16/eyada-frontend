"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

interface StockBadgeProps {
  stock: number;
  /** Below this stock level, render the low-stock tone. */
  lowThreshold?: number;
  className?: string;
}

export function StockBadge({
  stock,
  lowThreshold = 5,
  className,
}: StockBadgeProps) {
  const { t } = useTranslation();

  if (stock <= 0) {
    return (
      <Badge variant="error" className={className}>
        {t("pharmacy.stock.outOfStock")}
      </Badge>
    );
  }

  if (stock <= lowThreshold) {
    return (
      <Badge variant="warning" className={className}>
        {t("pharmacy.stock.low", { count: stock })}
      </Badge>
    );
  }

  return (
    <Badge variant="success" className={className}>
      {t("pharmacy.stock.inStock", { count: stock })}
    </Badge>
  );
}
