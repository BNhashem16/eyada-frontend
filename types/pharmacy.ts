import { Multilingual, Timestamps, User } from "./models";
import { PharmacyStatus, DeliveryType } from "./enums";

// Pharmacy Owner Profile
export interface PharmacyOwnerProfile extends Timestamps {
  id: string;
  userId: string;
  businessName: string;
  businessLicense?: string;
  taxNumber?: string;
  status: PharmacyStatus;
  approvedAt?: string;
  approvedBy?: string;
  user?: Pick<User, "id" | "fullName" | "email" | "phoneNumber">;
}

// Pharmacy
export interface Pharmacy extends Timestamps {
  id: string;
  ownerProfileId: string;
  name: string;
  description?: string;
  address: string;
  cityId: string;
  latitude?: number;
  longitude?: number;
  phoneNumbers: string[];
  logo?: string;
  coverImage?: string;
  isActive: boolean;
  averageRating: number;
  totalRatings: number;
  deliveryType: DeliveryType;
  deliveryFee: string;
  minOrderAmount: string;
  freeDeliveryThreshold?: string;
  operatingHours?: OperatingHour[];
  ownerProfile?: PharmacyOwnerProfile;
  city?: {
    id: string;
    name: Multilingual;
    state?: { id: string; name: Multilingual };
  };
  _count?: {
    products?: number;
    orders?: number;
  };
}

export interface OperatingHour {
  day: string;
  open: string;
  close: string;
}

// Create pharmacy DTO
export interface CreatePharmacyDto {
  name: string;
  description?: string;
  address: string;
  cityId: string;
  latitude?: number;
  longitude?: number;
  phoneNumbers: string[];
  logo?: string;
  coverImage?: string;
  deliveryType?: DeliveryType;
  deliveryFee?: number;
  minOrderAmount?: number;
  freeDeliveryThreshold?: number;
  operatingHours?: OperatingHour[];
  isActive?: boolean;
}

// Update pharmacy DTO
export type UpdatePharmacyDto = Partial<CreatePharmacyDto>;
