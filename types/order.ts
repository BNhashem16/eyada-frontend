import type { Multilingual, Timestamps } from "./models";
import type {
  OrderStatus,
  PharmacyOrderPaymentStatus,
  VehicleType,
} from "./enums";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: Multilingual;
  unitPrice: string;
  quantity: number;
  totalPrice: string;
  createdAt: string;
  product?: {
    id: string;
    name: Multilingual;
    images: string[];
  };
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  changedBy: string;
  note?: string;
  createdAt: string;
}

export interface PharmacyOrder extends Timestamps {
  id: string;
  orderNumber: string;
  userId: string;
  pharmacyId: string;
  idempotencyKey: string;
  status: OrderStatus;
  paymentStatus: PharmacyOrderPaymentStatus;
  subtotal: string;
  discountAmount: string;
  deliveryFee: string;
  totalAmount: string;
  commissionAmount: string;
  prescriptionKey?: string;
  prescriptionNotes?: string;
  deliveryType: string;
  deliveryAddress?: {
    ar?: string;
    en?: string;
    lat?: number;
    lng?: number;
    label?: string;
    city?: string;
    area?: string;
    buildingNumber?: string;
    floor?: string;
    apartment?: string;
    landmark?: string;
    notes?: string;
    phoneNumber?: string;
  };
  deliveryNotes?: string;
  couponCode?: string;
  couponDiscount?: string;
  campaignId?: string;
  campaignDiscount?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
  pharmacy?: {
    id: string;
    name: Multilingual;
    phoneNumbers?: string[];
  };
  user?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  statusHistory?: OrderStatusHistory[];
  delivery?: {
    id: string;
    driverProfileId?: string;
    deliveryType: string;
    estimatedTime?: number;
    pickedUpAt?: string;
    deliveredAt?: string;
    trackingNotes?: string;
    driver?: {
      id: string;
      vehicleType?: VehicleType;
      vehiclePlate?: string;
      isAvailable: boolean;
      user?: {
        id: string;
        fullName: string;
        phoneNumber: string;
      };
    };
  };
}

export interface PreviewOrderDto {
  couponCode?: string;
}

export interface OrderPreviewItem {
  productId: string;
  productName: Multilingual;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderPreviewResult {
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  couponDiscount?: number;
  campaignId?: string;
  campaignDiscount?: number;
  totalAmount: number;
  items: OrderPreviewItem[];
}

export interface CreateOrderDto {
  idempotencyKey: string;
  deliveryAddress?: {
    ar?: string;
    en?: string;
    lat?: number;
    lng?: number;
  };
  prescriptionKey?: string;
  prescriptionNotes?: string;
  couponCode?: string;
  deliveryNotes?: string;
}

export interface CancelOrderDto {
  reason?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  note?: string;
}
