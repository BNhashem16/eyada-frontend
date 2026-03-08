import type { Multilingual } from "./models";

// Enums
export enum PrescriptionRequestStatus {
  PENDING_REVIEW = "PENDING_REVIEW",
  ASSIGNED = "ASSIGNED",
  PREPARING = "PREPARING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PrescriptionType {
  IMAGE = "IMAGE",
  TEXT = "TEXT",
  MIXED = "MIXED",
}

// Interfaces
export interface PrescriptionOrderItem {
  id: string;
  orderId: string;
  medicationName: Multilingual;
  quantity: number;
  unitPrice: number;
  notes: string | null;
  createdAt: string;
}

export interface PrescriptionRequest {
  id: string;
  requestNumber: string;
  type: PrescriptionType;
  prescriptionImages: string[];
  prescriptionText: string | null;
  notes: string | null;
  status: PrescriptionRequestStatus;
  assignedBy: string | null;
  assignedAt: string | null;
  totalAmount: number | null;
  cancelReason: string | null;
  orders?: PrescriptionOrder[];
  patient?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  deliveryAddress?: {
    id: string;
    label: string;
    addressLine1: string;
    city: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionOrderStatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  note: string | null;
  createdAt: string;
}

export interface PrescriptionOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  commissionAmount?: number;
  deliveryFee: number;
  totalAmount: number;
  paymentStatus: string;
  items: PrescriptionOrderItem[];
  pharmacy?: {
    id: string;
    name: Multilingual;
    address?: Multilingual;
    phoneNumbers?: string[];
  };
  request?: {
    requestNumber: string;
    prescriptionImages: string[];
    prescriptionText: string | null;
  };
  statusHistory?: PrescriptionOrderStatusHistory[];
  createdAt: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
}

export interface PlatformCommissionConfig {
  id: string;
  commissionPercentage: number;
  minCommission: number;
  maxCommission: number | null;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
}

// DTOs
export interface CreatePrescriptionRequestDto {
  prescriptionImages?: string[];
  prescriptionText?: string;
  notes?: string;
  deliveryAddressId: string;
}

export interface AssignmentItemDto {
  medicationNameAr: string;
  medicationNameEn: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface PharmacyAssignmentDto {
  pharmacyId: string;
  items: AssignmentItemDto[];
}

export interface AssignPrescriptionDto {
  assignments: PharmacyAssignmentDto[];
  deliveryFee?: number;
}

export interface CancelPrescriptionRequestDto {
  reason?: string;
}

export interface CreatePlatformCommissionDto {
  commissionPercentage: number;
  minCommission?: number;
  maxCommission?: number;
}

export interface UpdatePlatformCommissionDto {
  commissionPercentage?: number;
  minCommission?: number;
  maxCommission?: number;
}
