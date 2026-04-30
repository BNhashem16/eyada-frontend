"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { OrderStatus } from "@/types";

const STATUS_TONE: Record<
  OrderStatus,
  "default" | "warning" | "success" | "error" | "secondary"
> = {
  [OrderStatus.PENDING]: "warning",
  [OrderStatus.CONFIRMED]: "default",
  [OrderStatus.PREPARING]: "default",
  [OrderStatus.READY_FOR_PICKUP]: "default",
  [OrderStatus.OUT_FOR_DELIVERY]: "default",
  [OrderStatus.DELIVERED]: "success",
  [OrderStatus.CANCELLED]: "error",
  [OrderStatus.RETURNED]: "secondary",
  [OrderStatus.REFUNDED]: "secondary",
};

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const { t } = useTranslation();
  const normalized = String(status).toUpperCase() as OrderStatus;
  const tone = STATUS_TONE[normalized] ?? "secondary";
  const label = t(`pharmacy.orderStatus.${normalized}` as never);

  return (
    <Badge variant={tone} className={className}>
      {label}
    </Badge>
  );
}
