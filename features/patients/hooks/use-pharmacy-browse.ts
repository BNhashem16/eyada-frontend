"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { PUBLIC_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types";
import type { Pharmacy } from "@/types/pharmacy";
import type { PharmacyProduct } from "@/types/product";
import type { PharmacyCategory } from "@/types/category";

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

  return useQuery({
    queryKey: ["public-pharmacies", { search, page, limit }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (search?.trim()) params.search = search.trim();
      return apiGet<PaginatedResponse<Pharmacy>>(
        PUBLIC_PHARMACY_ENDPOINTS.PHARMACIES,
        params,
      );
    },
    staleTime: 1000 * 60, // 1 minute
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

  return useQuery({
    queryKey: [
      "public-products",
      {
        search,
        categoryId,
        pharmacyId,
        minPrice,
        maxPrice,
        requiresPrescription,
        page,
        limit,
      },
    ],
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
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["pharmacy-categories"],
    queryFn: async () => {
      return apiGet<PharmacyCategory[]>(PUBLIC_PHARMACY_ENDPOINTS.CATEGORIES);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
