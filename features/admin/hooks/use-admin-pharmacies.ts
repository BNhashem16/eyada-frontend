"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { ADMIN_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { Pharmacy } from "@/types/pharmacy";
import { PharmacyStatus } from "@/types/enums";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface AdminPharmacyFilters {
  page?: number;
  limit?: number;
  status?: PharmacyStatus;
  cityId?: string;
  search?: string;
}

export function useAdminPharmacies(filters: AdminPharmacyFilters = {}) {
  const { page = 1, limit = 10, status, cityId, search } = filters;

  return useQuery({
    queryKey: ["admin-pharmacies", { page, limit, status, cityId, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);
      if (cityId) params.append("cityId", cityId);
      if (search) params.append("search", search);

      return apiGet<PaginatedResponse<Pharmacy>>(
        `${ADMIN_PHARMACY_ENDPOINTS.PHARMACIES}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60,
  });
}

export function useAdminPharmacy(pharmacyId: string) {
  return useQuery({
    queryKey: ["admin-pharmacy", pharmacyId],
    queryFn: async () => {
      return apiGet<Pharmacy>(ADMIN_PHARMACY_ENDPOINTS.PHARMACY(pharmacyId));
    },
    enabled: !!pharmacyId,
    staleTime: 1000 * 60,
  });
}

export function useApprovePharmacy() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (pharmacyId: string) => {
      return apiPatch<Pharmacy>(
        ADMIN_PHARMACY_ENDPOINTS.APPROVE_PHARMACY(pharmacyId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pharmacy"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useRejectPharmacy() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (pharmacyId: string) => {
      return apiPatch<Pharmacy>(
        ADMIN_PHARMACY_ENDPOINTS.REJECT_PHARMACY(pharmacyId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pharmacy"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useSuspendPharmacy() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (pharmacyId: string) => {
      return apiPatch<Pharmacy>(
        ADMIN_PHARMACY_ENDPOINTS.SUSPEND_PHARMACY(pharmacyId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pharmacy"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
