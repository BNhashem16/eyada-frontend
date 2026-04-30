"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { SettlementStatus } from "@/types";

const TONE: Record<
  SettlementStatus,
  "default" | "warning" | "success" | "error"
> = {
  [SettlementStatus.PENDING]: "warning",
  [SettlementStatus.PROCESSING]: "default",
  [SettlementStatus.COMPLETED]: "success",
  [SettlementStatus.FAILED]: "error",
};

interface SettlementStatusBadgeProps {
  status: SettlementStatus | string;
  className?: string;
}

export function SettlementStatusBadge({
  status,
  className,
}: SettlementStatusBadgeProps) {
  const { t } = useTranslation();
  const normalized = String(status).toUpperCase() as SettlementStatus;
  const tone = TONE[normalized] ?? "default";
  const label = t(`pharmacy.settlementStatus.${normalized}` as never);

  return (
    <Badge variant={tone} className={className}>
      {label}
    </Badge>
  );
}
