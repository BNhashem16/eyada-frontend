import {
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  Truck,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { OrderStatus } from "@/types/enums";

export const STATUS_CONFIG: Record<
  string,
  { key: string; variant: string; icon: React.ElementType }
> = {
  PENDING: { key: "statusPending", variant: "secondary", icon: Clock },
  CONFIRMED: { key: "statusConfirmed", variant: "info", icon: CheckCircle2 },
  PREPARING: { key: "statusPreparing", variant: "info", icon: ChefHat },
  READY_FOR_PICKUP: {
    key: "statusReadyForPickup",
    variant: "info",
    icon: Package,
  },
  OUT_FOR_DELIVERY: {
    key: "statusOutForDelivery",
    variant: "warning",
    icon: Truck,
  },
  DELIVERED: {
    key: "statusDelivered",
    variant: "success",
    icon: CheckCircle2,
  },
  CANCELLED: { key: "statusCancelled", variant: "destructive", icon: XCircle },
  RETURNED: { key: "statusReturned", variant: "secondary", icon: RotateCcw },
  REFUNDED: { key: "statusRefunded", variant: "secondary", icon: RotateCcw },
};

export const OWNER_ACTIONS: Record<
  string,
  { toStatus: OrderStatus; label: string }[]
> = {
  PENDING: [
    { toStatus: OrderStatus.CONFIRMED, label: "confirmOrder" },
    { toStatus: OrderStatus.CANCELLED, label: "cancelOrder" },
  ],
  CONFIRMED: [{ toStatus: OrderStatus.PREPARING, label: "prepareOrder" }],
  PREPARING: [{ toStatus: OrderStatus.READY_FOR_PICKUP, label: "markReady" }],
};

export const TRACKING_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

// Statuses where driver reassignment is not allowed (terminal states)
export const TERMINAL_STATUSES = [
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
] as const;
