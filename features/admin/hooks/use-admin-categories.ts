"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import {
  ADMIN_PHARMACY_ENDPOINTS,
  PUBLIC_PHARMACY_ENDPOINTS,
} from "@/lib/api/endpoints";
import type { ApiError } from "@/types";
import type {
  PharmacyCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/category";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export function usePublicCategories() {
  return useQuery({
    queryKey: ["pharmacy-categories"],
    queryFn: async () => {
      return apiGet<PharmacyCategory[]>(PUBLIC_PHARMACY_ENDPOINTS.CATEGORIES);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin-pharmacy-categories"],
    queryFn: async () => {
      return apiGet<PharmacyCategory[]>(ADMIN_PHARMACY_ENDPOINTS.CATEGORIES);
    },
    staleTime: 1000 * 60,
  });
}

export function useAdminCategory(categoryId: string) {
  return useQuery({
    queryKey: ["admin-pharmacy-category", categoryId],
    queryFn: async () => {
      return apiGet<PharmacyCategory>(
        ADMIN_PHARMACY_ENDPOINTS.CATEGORY(categoryId),
      );
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreateCategoryDto) => {
      return apiPost<PharmacyCategory>(
        ADMIN_PHARMACY_ENDPOINTS.CATEGORIES,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-categories"],
      });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-categories"] });
      toastSuccess(t("toast.success"), t("toast.created"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      categoryId,
      ...data
    }: UpdateCategoryDto & { categoryId: string }) => {
      return apiPatch<PharmacyCategory>(
        ADMIN_PHARMACY_ENDPOINTS.CATEGORY(categoryId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-category"],
      });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-categories"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      return apiDelete(ADMIN_PHARMACY_ENDPOINTS.CATEGORY(categoryId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-categories"],
      });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-categories"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
