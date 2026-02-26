import { Multilingual, Timestamps } from "./models";
import type { PharmacyCategory } from "./category";

export interface PharmacyProduct extends Timestamps {
  id: string;
  pharmacyId: string;
  categoryId?: string;
  name: Multilingual;
  description?: Multilingual;
  sku?: string;
  barcode?: string;
  price: string; // Decimal comes as string from API
  discountPrice?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  requiresPrescription: boolean;
  images: string[];
  isActive: boolean;
  pharmacy?: {
    id: string;
    name: Multilingual;
    isActive?: boolean;
    deliveryType?: string;
    deliveryFee?: string;
    minOrderAmount?: string;
    freeDeliveryThreshold?: string;
  };
  category?: Pick<PharmacyCategory, "id" | "name">;
}

export interface CreateProductDto {
  name: Multilingual;
  description?: Partial<Multilingual>;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  price: number;
  discountPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  requiresPrescription?: boolean;
  images?: string[];
  isActive?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;
