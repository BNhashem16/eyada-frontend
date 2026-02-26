import type { CouponType } from "./enums";

export interface PharmacyCoupon {
  id: string;
  code: string;
  couponType: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  pharmacyId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    usages: number;
  };
}

export interface CreateCouponDto {
  code: string;
  couponType: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  pharmacyId?: string;
}

export interface UpdateCouponDto {
  couponType?: CouponType;
  value?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  pharmacyId?: string;
}

export interface ValidateCouponDto {
  code: string;
  cartTotal: number;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  couponType: CouponType;
  value: number;
  discount: number;
}
