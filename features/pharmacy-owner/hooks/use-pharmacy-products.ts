"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { PHARMACY_OWNER_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type {
  PharmacyProduct,
  CreateProductDto,
  UpdateProductDto,
} from "@/types/product";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { pharmacyProductKeys } from "@/lib/query-keys";

export interface OwnerProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export function useMyProducts(
  pharmacyId: string,
  filters: OwnerProductFilters = {},
) {
  const { page = 1, limit = 10, search, categoryId, isActive } = filters;

  return usePharmacyQuery<PaginatedResponse<PharmacyProduct>>({
    queryKey: pharmacyProductKeys.list(pharmacyId, {
      page,
      limit,
      search,
      categoryId,
      isActive,
    }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (categoryId) params.append("categoryId", categoryId);
      if (isActive !== undefined) params.append("isActive", String(isActive));

      return apiGet<PaginatedResponse<PharmacyProduct>>(
        `${PHARMACY_OWNER_ENDPOINTS.PRODUCTS(pharmacyId)}?${params.toString()}`,
      );
    },
    enabled: !!pharmacyId,
  });
}

export function useMyProduct(pharmacyId: string, productId: string) {
  return usePharmacyQuery<PharmacyProduct>({
    queryKey: pharmacyProductKeys.detail(pharmacyId, productId),
    queryFn: async () =>
      apiGet<PharmacyProduct>(
        PHARMACY_OWNER_ENDPOINTS.PRODUCT(pharmacyId, productId),
      ),
    enabled: !!pharmacyId && !!productId,
  });
}

export function useCreateProduct(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      return apiPost<PharmacyProduct>(
        PHARMACY_OWNER_ENDPOINTS.PRODUCTS(pharmacyId),
        data,
      );
    },
    onSuccess: () => {
      // Create → invalidate lists only.
      queryClient.invalidateQueries({
        queryKey: pharmacyProductKeys.lists(pharmacyId),
      });
      toastSuccess(t("toast.success"), t("pharmacyOwner.addProduct"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useUpdateProduct(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      productId,
      ...data
    }: UpdateProductDto & { productId: string }) => {
      return apiPatch<PharmacyProduct>(
        PHARMACY_OWNER_ENDPOINTS.PRODUCT(pharmacyId, productId),
        data,
      );
    },
    onSuccess: (_, vars) => {
      // Update → invalidate lists + the one detail.
      queryClient.invalidateQueries({
        queryKey: pharmacyProductKeys.lists(pharmacyId),
      });
      queryClient.invalidateQueries({
        queryKey: pharmacyProductKeys.detail(pharmacyId, vars.productId),
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useDeleteProduct(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (productId: string) => {
      return apiDelete(PHARMACY_OWNER_ENDPOINTS.PRODUCT(pharmacyId, productId));
    },
    onSuccess: () => {
      // Delete → invalidate lists only.
      queryClient.invalidateQueries({
        queryKey: pharmacyProductKeys.lists(pharmacyId),
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
