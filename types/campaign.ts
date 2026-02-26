import type {
  CampaignCalculationType,
  CampaignStatus,
  DiscountType,
} from "./enums";

export interface PharmacyCampaign {
  id: string;
  pharmacyId: string;
  name: string;
  description?: string | null;
  discountType: DiscountType;
  calculationType: CampaignCalculationType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  usageLimit?: number | null;
  usageCount: number;
  perUserLimit?: number | null;
  createdAt: string;
  updatedAt: string;
  pharmacy?: {
    id: string;
    name: { ar: string; en: string };
  };
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  discountType: DiscountType;
  calculationType?: CampaignCalculationType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit?: number;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {}

export interface UpdateCampaignStatusDto {
  status: CampaignStatus;
}
