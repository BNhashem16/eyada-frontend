"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost } from "@/lib/api";
import { PATIENT_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type {
  PharmacyOrder,
  CreateOrderDto,
  CancelOrderDto,
  PreviewOrderDto,
  OrderPreviewResult,
} from "@/types/order";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface PatientOrderFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export function usePatientOrders(filters: PatientOrderFilters = {}) {
  const { page = 1, limit = 10, status } = filters;

  return useQuery({
    queryKey: ["patient-orders", { page, limit, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PharmacyOrder>>(
        `${PATIENT_PHARMACY_ENDPOINTS.ORDERS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 30,
  });
}

export function usePatientOrder(orderId: string) {
  return useQuery({
    queryKey: ["patient-order", orderId],
    queryFn: async () => {
      return apiGet<PharmacyOrder>(PATIENT_PHARMACY_ENDPOINTS.ORDER(orderId));
    },
    enabled: !!orderId,
    staleTime: 1000 * 30,
  });
}

export function usePreviewOrder() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: PreviewOrderDto) => {
      return apiPost<OrderPreviewResult>(
        PATIENT_PHARMACY_ENDPOINTS.PREVIEW_ORDER,
        data,
      );
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreateOrderDto) => {
      return apiPost<PharmacyOrder>(PATIENT_PHARMACY_ENDPOINTS.ORDERS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toastSuccess(t("toast.success"), t("pharmacyOwner.orderPlaced"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      orderId,
      ...data
    }: CancelOrderDto & { orderId: string }) => {
      return apiPost<PharmacyOrder>(
        PATIENT_PHARMACY_ENDPOINTS.ORDER_CANCEL(orderId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-orders"] });
      queryClient.invalidateQueries({ queryKey: ["patient-order"] });
      toastSuccess(t("toast.success"), t("pharmacyOwner.orderCancelled"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
