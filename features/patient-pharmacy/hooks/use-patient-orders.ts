"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { patientCartKeys, patientPharmacyOrderKeys } from "@/lib/query-keys";

export interface PatientOrderFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export function usePatientOrders(filters: PatientOrderFilters = {}) {
  const { page = 1, limit = 10, status } = filters;

  return usePharmacyQuery<PaginatedResponse<PharmacyOrder>>({
    queryKey: patientPharmacyOrderKeys.list({ page, limit, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PharmacyOrder>>(
        `${PATIENT_PHARMACY_ENDPOINTS.ORDERS}?${params.toString()}`,
      );
    },
  });
}

export function usePatientOrder(orderId: string) {
  // 'fast-changing': patient watches owner's status moves on the active order.
  return usePharmacyQuery<PharmacyOrder>({
    queryKey: patientPharmacyOrderKeys.detail(orderId),
    queryFn: async () =>
      apiGet<PharmacyOrder>(PATIENT_PHARMACY_ENDPOINTS.ORDER(orderId)),
    enabled: !!orderId,
    preset: "fast-changing",
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
      // Placing an order both empties the cart and adds to the orders list.
      queryClient.invalidateQueries({
        queryKey: patientPharmacyOrderKeys.lists(),
      });
      queryClient.invalidateQueries({ queryKey: patientCartKeys.all });
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
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: patientPharmacyOrderKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: patientPharmacyOrderKeys.detail(vars.orderId),
      });
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
