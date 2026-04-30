"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { ADMIN_PRESCRIPTION_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type {
  PrescriptionRequest,
  PrescriptionOrder,
  AssignPrescriptionDto,
  PlatformCommissionConfig,
  CreatePlatformCommissionDto,
  UpdatePlatformCommissionDto,
} from "@/types/prescription";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { prescriptionKeys } from "@/lib/query-keys";

// ===== Prescription Requests =====

export interface AdminPrescriptionFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export function useAdminPrescriptionRequests(
  filters: AdminPrescriptionFilters = {},
) {
  const { page = 1, limit = 10, status } = filters;

  // 'fast-changing': admin watches incoming requests in near real-time.
  // The previous implementation polled every 30s; user explicitly disallowed.
  return usePharmacyQuery<PaginatedResponse<PrescriptionRequest>>({
    queryKey: prescriptionKeys.adminRequests({ page, limit, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PrescriptionRequest>>(
        `${ADMIN_PRESCRIPTION_ENDPOINTS.REQUESTS}?${params.toString()}`,
      );
    },
    preset: "fast-changing",
  });
}

export function useAdminPrescriptionRequest(requestId: string) {
  return usePharmacyQuery<PrescriptionRequest>({
    queryKey: prescriptionKeys.adminRequest(requestId),
    queryFn: async () =>
      apiGet<PrescriptionRequest>(
        ADMIN_PRESCRIPTION_ENDPOINTS.REQUEST(requestId),
      ),
    enabled: !!requestId,
  });
}

export function useAssignPrescription() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      requestId,
      ...data
    }: AssignPrescriptionDto & { requestId: string }) => {
      return apiPost(
        ADMIN_PRESCRIPTION_ENDPOINTS.ASSIGN_REQUEST(requestId),
        data,
      );
    },
    onSuccess: (_, vars) => {
      // Assign creates a prescription order and updates the request.
      queryClient.invalidateQueries({
        queryKey: prescriptionKeys.adminRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: prescriptionKeys.adminRequest(vars.requestId),
      });
      queryClient.invalidateQueries({
        queryKey: prescriptionKeys.adminOrders(),
      });
      toastSuccess(t("toast.success"), t("prescription.requestAssigned"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

// ===== Prescription Orders =====

export function useAdminPrescriptionOrders(
  filters: AdminPrescriptionFilters = {},
) {
  const { page = 1, limit = 10, status } = filters;

  return usePharmacyQuery<PaginatedResponse<PrescriptionOrder>>({
    queryKey: prescriptionKeys.adminOrders({ page, limit, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PrescriptionOrder>>(
        `${ADMIN_PRESCRIPTION_ENDPOINTS.ORDERS}?${params.toString()}`,
      );
    },
    preset: "fast-changing",
  });
}

export function useUpdateAdminPrescriptionOrderStatus() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      note,
    }: {
      orderId: string;
      status: string;
      note?: string;
    }) => {
      return apiPatch(ADMIN_PRESCRIPTION_ENDPOINTS.ORDER_STATUS(orderId), {
        status,
        note,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: prescriptionKeys.adminOrders(),
      });
      queryClient.invalidateQueries({
        queryKey: prescriptionKeys.adminRequests(),
      });
      toastSuccess(t("toast.success"), t("prescription.orderStatusUpdated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

// ===== Platform Commission =====

const platformCommissionKey = ["platform-commission"] as const;
const platformCommissionHistoryKey = [
  "platform-commission",
  "history",
] as const;

export function usePlatformCommission() {
  return usePharmacyQuery<PlatformCommissionConfig>({
    queryKey: platformCommissionKey,
    queryFn: async () =>
      apiGet<PlatformCommissionConfig>(ADMIN_PRESCRIPTION_ENDPOINTS.COMMISSION),
  });
}

export function usePlatformCommissionHistory() {
  return usePharmacyQuery<PlatformCommissionConfig[]>({
    queryKey: platformCommissionHistoryKey,
    queryFn: async () =>
      apiGet<PlatformCommissionConfig[]>(
        ADMIN_PRESCRIPTION_ENDPOINTS.COMMISSION_HISTORY,
      ),
  });
}

export function useCreatePlatformCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreatePlatformCommissionDto) => {
      return apiPost<PlatformCommissionConfig>(
        ADMIN_PRESCRIPTION_ENDPOINTS.COMMISSION,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformCommissionKey });
      queryClient.invalidateQueries({
        queryKey: platformCommissionHistoryKey,
      });
      toastSuccess(t("toast.success"), t("prescription.commissionCreated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useUpdatePlatformCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      configId,
      ...data
    }: UpdatePlatformCommissionDto & { configId: string }) => {
      return apiPatch<PlatformCommissionConfig>(
        ADMIN_PRESCRIPTION_ENDPOINTS.COMMISSION_UPDATE(configId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformCommissionKey });
      queryClient.invalidateQueries({
        queryKey: platformCommissionHistoryKey,
      });
      toastSuccess(t("toast.success"), t("prescription.commissionUpdated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
