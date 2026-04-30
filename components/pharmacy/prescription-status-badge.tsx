"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

const TONE: Record<
  string,
  "default" | "warning" | "success" | "error" | "secondary"
> = {
  PENDING: "warning",
  ASSIGNED: "default",
  IN_REVIEW: "default",
  READY: "default",
  FULFILLED: "success",
  REJECTED: "error",
  CANCELLED: "secondary",
  EXPIRED: "secondary",
};

interface PrescriptionStatusBadgeProps {
  status: string;
  className?: string;
}

export function PrescriptionStatusBadge({
  status,
  className,
}: PrescriptionStatusBadgeProps) {
  const { t } = useTranslation();
  const normalized = String(status).toUpperCase();
  const tone = TONE[normalized] ?? "secondary";
  const label = t(`pharmacy.prescriptionStatus.${normalized}` as never);

  return (
    <Badge variant={tone} className={className}>
      {label}
    </Badge>
  );
}
