"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import { PaymentMethodModel, Multilingual, PaginatedResponse } from "@/types";
import { AxiosError } from "axios";
import type { ApiError } from "@/types";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

// ==================== Statistics ====================

export interface PaymentMethodStatistics {
  totalPaymentMethods: number;
  activePaymentMethods: number;
  inactivePaymentMethods: number;
}

export function useAdminPaymentMethodStatistics() {
  return useQuery({
    queryKey: ["admin-payment-methods-statistics"],
    queryFn: async () => {
      return apiGet<PaymentMethodStatistics>(
        ADMIN_ENDPOINTS.PAYMENT_METHODS_STATISTICS,
      );
    },
    staleTime: 1000 * 60,
  });
}

// ==================== List ====================

export interface UseAdminPaymentMethodsOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export function useAdminPaymentMethods(
  options: UseAdminPaymentMethodsOptions = {},
) {
  const { page = 1, limit = 10, search, isActive } = options;

  return useQuery({
    queryKey: ["admin-payment-methods", { page, limit, search, isActive }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (isActive !== undefined)
        params.append("isActive", isActive.toString());

      return apiGet<PaginatedResponse<PaymentMethodModel>>(
        `${ADMIN_ENDPOINTS.PAYMENT_METHODS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ==================== Create ====================

interface CreatePaymentMethodData {
  name: Multilingual;
  code: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreatePaymentMethodData) => {
      return apiPost<PaymentMethodModel>(ADMIN_ENDPOINTS.PAYMENT_METHODS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-payment-methods"],
      });
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

// ==================== Update ====================

interface UpdatePaymentMethodData {
  id: string;
  name?: Multilingual;
  code?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePaymentMethodData) => {
      return apiPatch<PaymentMethodModel>(
        ADMIN_ENDPOINTS.PAYMENT_METHOD(id),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-payment-methods"],
      });
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

// ==================== Delete ====================

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(ADMIN_ENDPOINTS.PAYMENT_METHOD(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-payment-methods"],
      });
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
