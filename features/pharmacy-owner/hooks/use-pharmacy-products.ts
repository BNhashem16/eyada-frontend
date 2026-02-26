"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  return useQuery({
    queryKey: [
      "my-products",
      pharmacyId,
      { page, limit, search, categoryId, isActive },
    ],
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
    staleTime: 1000 * 60,
  });
}

export function useMyProduct(pharmacyId: string, productId: string) {
  return useQuery({
    queryKey: ["my-product", pharmacyId, productId],
    queryFn: async () => {
      return apiGet<PharmacyProduct>(
        PHARMACY_OWNER_ENDPOINTS.PRODUCT(pharmacyId, productId),
      );
    },
    enabled: !!pharmacyId && !!productId,
    staleTime: 1000 * 60,
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
      queryClient.invalidateQueries({
        queryKey: ["my-products", pharmacyId],
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-products", pharmacyId],
      });
      queryClient.invalidateQueries({ queryKey: ["my-product"] });
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
      queryClient.invalidateQueries({
        queryKey: ["my-products", pharmacyId],
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
