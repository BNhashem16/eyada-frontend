import { Timestamps, Multilingual, User } from "./models";
import { DriverStatus, VehicleType, OrderStatus } from "./enums";

export interface DriverProfile extends Timestamps {
  id: string;
  userId: string;
  vehicleType?: VehicleType;
  vehiclePlate?: string;
  licenseNumber?: string;
  status: DriverStatus;
  isAvailable: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  user?: Pick<User, "id" | "fullName" | "email" | "phoneNumber" | "isActive">;
  _count?: { deliveries: number };
}

export interface DriverDelivery {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: string;
  deliveryFee: string;
  deliveryType: string;
  deliveryAddress?: {
    ar?: string;
    en?: string;
    lat?: number;
    lng?: number;
    label?: string;
    phoneNumber?: string;
  };
  deliveryNotes?: string;
  confirmedAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  pharmacy?: {
    id: string;
    name: Multilingual;
    phoneNumbers?: string[];
  };
  user?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  items: {
    id: string;
    productName: Multilingual;
    quantity: number;
    totalPrice: string;
  }[];
  delivery?: {
    id: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    estimatedTime?: number;
  };
}

export interface DriverDeliveryFilters {
  page?: number;
  limit?: number;
  status?: string;
}
