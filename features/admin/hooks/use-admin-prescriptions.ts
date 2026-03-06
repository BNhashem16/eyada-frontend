"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  return useQuery({
    queryKey: ["admin-prescription-requests", { page, limit, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PrescriptionRequest>>(
        `${ADMIN_PRESCRIPTION_ENDPOINTS.REQUESTS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}

export function useAdminPrescriptionRequest(requestId: string) {
  return useQuery({
    queryKey: ["admin-prescription-request", requestId],
    queryFn: async () => {
      return apiGet<PrescriptionRequest>(
        ADMIN_PRESCRIPTION_ENDPOINTS.REQUEST(requestId),
      );
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-prescription-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-prescription-request"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-prescription-orders"],
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

  return useQuery({
    queryKey: ["admin-prescription-orders", { page, limit, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PrescriptionOrder>>(
        `${ADMIN_PRESCRIPTION_ENDPOINTS.ORDERS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
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
        queryKey: ["admin-prescription-orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-prescription-requests"],
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

export function usePlatformCommission() {
  return useQuery({
    queryKey: ["platform-commission"],
    queryFn: async () => {
      return apiGet<PlatformCommissionConfig>(
        ADMIN_PRESCRIPTION_ENDPOINTS.COMMISSION,
      );
    },
    staleTime: 1000 * 60,
  });
}

export function usePlatformCommissionHistory() {
  return useQuery({
    queryKey: ["platform-commission-history"],
    queryFn: async () => {
      return apiGet<PlatformCommissionConfig[]>(
        ADMIN_PRESCRIPTION_ENDPOINTS.COMMISSION_HISTORY,
      );
    },
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
      queryClient.invalidateQueries({ queryKey: ["platform-commission"] });
      queryClient.invalidateQueries({
        queryKey: ["platform-commission-history"],
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
      queryClient.invalidateQueries({ queryKey: ["platform-commission"] });
      queryClient.invalidateQueries({
        queryKey: ["platform-commission-history"],
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
