"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { prescriptionKeys } from "@/lib/query-keys";

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

  // 'fast-changing': patient sees pharmacist's status moves on this list.
  // The previous implementation polled every 30s; the user explicitly
  // disallowed polling. Patient presses Refresh + mutations invalidate.
  return usePharmacyQuery<PaginatedResponse<PrescriptionRequest>>({
    queryKey: prescriptionKeys.patientRequests({ page, limit, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PrescriptionRequest>>(
        `${PATIENT_PRESCRIPTION_ENDPOINTS.REQUESTS}?${params.toString()}`,
      );
    },
    preset: "fast-changing",
  });
}

export function usePrescriptionRequest(requestId: string) {
  return usePharmacyQuery<PrescriptionRequest>({
    queryKey: prescriptionKeys.patientRequest(requestId),
    queryFn: async () =>
      apiGet<PrescriptionRequest>(
        PATIENT_PRESCRIPTION_ENDPOINTS.REQUEST(requestId),
      ),
    enabled: !!requestId,
    preset: "fast-changing",
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
      queryClient.invalidateQueries({
        queryKey: prescriptionKeys.patientRequests(),
      });
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
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: prescriptionKeys.patientRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: prescriptionKeys.patientRequest(vars.requestId),
      });
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

  return usePharmacyQuery<PaginatedResponse<PrescriptionOrder>>({
    queryKey: prescriptionKeys.patientOrders({ page, limit, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PrescriptionOrder>>(
        `${PATIENT_PRESCRIPTION_ENDPOINTS.ORDERS}?${params.toString()}`,
      );
    },
    preset: "fast-changing",
  });
}

export function usePatientPrescriptionOrder(orderId: string) {
  return usePharmacyQuery<PrescriptionOrder>({
    queryKey: prescriptionKeys.patientOrder(orderId),
    queryFn: async () =>
      apiGet<PrescriptionOrder>(PATIENT_PRESCRIPTION_ENDPOINTS.ORDER(orderId)),
    enabled: !!orderId,
    preset: "fast-changing",
  });
}
