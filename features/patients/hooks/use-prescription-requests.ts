"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost } from "@/lib/api";
import { PATIENT_PRESCRIPTION_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type {
  PrescriptionRequest,
  PrescriptionOrder,
  CreatePrescriptionRequestDto,
  CancelPrescriptionRequestDto,
} from "@/types/prescription";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface PrescriptionRequestFilters {
  page?: number;
  limit?: number;
  status?: string;
}

// ===== Patient: Prescription Requests =====

export function usePrescriptionRequests(
  filters: PrescriptionRequestFilters = {},
) {
  const { page = 1, limit = 10, status } = filters;

  return useQuery({
    queryKey: ["prescription-requests", { page, limit, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PrescriptionRequest>>(
        `${PATIENT_PRESCRIPTION_ENDPOINTS.REQUESTS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}

export function usePrescriptionRequest(requestId: string) {
  return useQuery({
    queryKey: ["prescription-request", requestId],
    queryFn: async () => {
      return apiGet<PrescriptionRequest>(
        PATIENT_PRESCRIPTION_ENDPOINTS.REQUEST(requestId),
      );
    },
    enabled: !!requestId,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}

export function useCreatePrescriptionRequest() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreatePrescriptionRequestDto) => {
      return apiPost<PrescriptionRequest>(
        PATIENT_PRESCRIPTION_ENDPOINTS.REQUESTS,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescription-requests"] });
      toastSuccess(t("toast.success"), t("prescription.requestCreated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useCancelPrescriptionRequest() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      requestId,
      ...data
    }: CancelPrescriptionRequestDto & { requestId: string }) => {
      return apiPost(
        PATIENT_PRESCRIPTION_ENDPOINTS.CANCEL_REQUEST(requestId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescription-requests"] });
      queryClient.invalidateQueries({ queryKey: ["prescription-request"] });
      toastSuccess(t("toast.success"), t("prescription.requestCancelled"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

// ===== Patient: Prescription Orders =====

export interface PrescriptionOrderFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export function usePatientPrescriptionOrders(
  filters: PrescriptionOrderFilters = {},
) {
  const { page = 1, limit = 10, status } = filters;

  return useQuery({
    queryKey: ["patient-prescription-orders", { page, limit, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PrescriptionOrder>>(
        `${PATIENT_PRESCRIPTION_ENDPOINTS.ORDERS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}

export function usePatientPrescriptionOrder(orderId: string) {
  return useQuery({
    queryKey: ["patient-prescription-order", orderId],
    queryFn: async () => {
      return apiGet<PrescriptionOrder>(
        PATIENT_PRESCRIPTION_ENDPOINTS.ORDER(orderId),
      );
    },
    enabled: !!orderId,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}
