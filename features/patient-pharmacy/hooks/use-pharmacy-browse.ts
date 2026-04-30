"use client";

import { apiGet } from "@/lib/api";
import { PUBLIC_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types";
import type { Pharmacy } from "@/types/pharmacy";
import type { PharmacyProduct } from "@/types/product";
import type { PharmacyCategory } from "@/types/category";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { patientPharmacyBrowseKeys } from "@/lib/query-keys";

// --- Filter types ---

export interface PharmacyBrowseFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductBrowseFilters {
  search?: string;
  categoryId?: string;
  pharmacyId?: string;
  minPrice?: number;
  maxPrice?: number;
  requiresPrescription?: boolean;
  page?: number;
  limit?: number;
}

// --- Hooks ---

export function usePublicPharmacies(filters: PharmacyBrowseFilters = {}) {
  const { search, page = 1, limit = 12 } = filters;

  return usePharmacyQuery<PaginatedResponse<Pharmacy>>({
    queryKey: patientPharmacyBrowseKeys.pharmacies({ search, page, limit }),
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (search?.trim()) params.search = search.trim();
      return apiGet<PaginatedResponse<Pharmacy>>(
        PUBLIC_PHARMACY_ENDPOINTS.PHARMACIES,
        params,
      );
    },
  });
}

export function usePublicProducts(filters: ProductBrowseFilters = {}) {
  const {
    search,
    categoryId,
    pharmacyId,
    minPrice,
    maxPrice,
    requiresPrescription,
    page = 1,
    limit = 12,
  } = filters;

  return usePharmacyQuery<PaginatedResponse<PharmacyProduct>>({
    queryKey: patientPharmacyBrowseKeys.products({
      search,
      categoryId,
      pharmacyId,
      minPrice,
      maxPrice,
      requiresPrescription,
      page,
      limit,
    }),
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (search?.trim()) params.search = search.trim();
      if (categoryId) params.categoryId = categoryId;
      if (pharmacyId) params.pharmacyId = pharmacyId;
      if (minPrice !== undefined) params.minPrice = minPrice;
      if (maxPrice !== undefined) params.maxPrice = maxPrice;
      if (requiresPrescription !== undefined)
        params.requiresPrescription = requiresPrescription;
      return apiGet<PaginatedResponse<PharmacyProduct>>(
        PUBLIC_PHARMACY_ENDPOINTS.PRODUCTS,
        params,
      );
    },
  });
}

export function useCategories() {
  return usePharmacyQuery<PharmacyCategory[]>({
    queryKey: patientPharmacyBrowseKeys.categories(),
    queryFn: async () =>
      apiGet<PharmacyCategory[]>(PUBLIC_PHARMACY_ENDPOINTS.CATEGORIES),
  });
}
