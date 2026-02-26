import { Multilingual, Timestamps } from "./models";

export interface PharmacyCategory extends Timestamps {
  id: string;
  name: Multilingual;
  description?: Multilingual;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  parent?: PharmacyCategory;
  children?: PharmacyCategory[];
  _count?: {
    products?: number;
  };
}

export interface CreateCategoryDto {
  name: Multilingual;
  description?: Partial<Multilingual>;
  icon?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
