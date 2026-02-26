"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { DriverProfile } from "@/types/driver";
import { DriverStatus } from "@/types/enums";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface AdminDriverFilters {
  page?: number;
  limit?: number;
  status?: DriverStatus;
  search?: string;
}

export function useAdminDrivers(filters: AdminDriverFilters = {}) {
  const { page = 1, limit = 10, status, search } = filters;

  return useQuery({
    queryKey: ["admin-drivers", { page, limit, status, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);
      if (search) params.append("search", search);

      return apiGet<PaginatedResponse<DriverProfile>>(
        `${ADMIN_ENDPOINTS.DRIVERS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60,
  });
}

export function useApproveDriver() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (driverId: string) => {
      return apiPatch(ADMIN_ENDPOINTS.APPROVE_DRIVER(driverId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      toastSuccess(t("toast.success"), t("admin.drivers.approvedSuccess"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useRejectDriver() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (driverId: string) => {
      return apiPatch(ADMIN_ENDPOINTS.REJECT_DRIVER(driverId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      toastSuccess(t("toast.success"), t("admin.drivers.rejectedSuccess"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useSuspendDriver() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (driverId: string) => {
      return apiPatch(ADMIN_ENDPOINTS.SUSPEND_DRIVER(driverId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      toastSuccess(t("toast.success"), t("admin.drivers.suspendedSuccess"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useActivateDriver() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (driverId: string) => {
      return apiPatch(ADMIN_ENDPOINTS.ACTIVATE_DRIVER(driverId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      toastSuccess(t("toast.success"), t("admin.drivers.activatedSuccess"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
