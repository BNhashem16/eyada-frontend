import type { PharmacyCommissionType } from "./enums";

export interface CommissionTier {
  minAmount: number;
  maxAmount: number;
  percentage: number;
}

export interface PharmacyCommission {
  id: string;
  pharmacyId: string;
  commissionType: PharmacyCommissionType;
  commissionValue: number;
  tiers: CommissionTier[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SetCommissionDto {
  commissionType: PharmacyCommissionType;
  commissionValue: number;
  tiers?: CommissionTier[];
}

export interface PharmacyCommissionResponse {
  pharmacy: {
    id: string;
    name: { ar: string; en: string };
  };
  commission: PharmacyCommission | null;
}
