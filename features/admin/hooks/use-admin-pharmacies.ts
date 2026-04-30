"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { ADMIN_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { Pharmacy } from "@/types/pharmacy";
import { PharmacyStatus } from "@/types/enums";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { adminPharmacyKeys } from "@/lib/query-keys";

export interface AdminPharmacyFilters {
  page?: number;
  limit?: number;
  status?: PharmacyStatus;
  cityId?: string;
  search?: string;
}

export function useAdminPharmacies(filters: AdminPharmacyFilters = {}) {
  const { page = 1, limit = 10, status, cityId, search } = filters;

  return usePharmacyQuery<PaginatedResponse<Pharmacy>>({
    queryKey: adminPharmacyKeys.pharmacies({
      page,
      limit,
      status,
      cityId,
      search,
    }),
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
  });
}

export function useAdminPharmacy(pharmacyId: string) {
  return usePharmacyQuery<Pharmacy>({
    queryKey: adminPharmacyKeys.pharmacy(pharmacyId),
    queryFn: async () =>
      apiGet<Pharmacy>(ADMIN_PHARMACY_ENDPOINTS.PHARMACY(pharmacyId)),
    enabled: !!pharmacyId,
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
    onSuccess: (_, pharmacyId) => {
      // Status change → invalidate the pharmacies list and the one detail.
      queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.pharmacy(pharmacyId),
      });
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
    onSuccess: (_, pharmacyId) => {
      // Status change → invalidate the pharmacies list and the one detail.
      queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.pharmacy(pharmacyId),
      });
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
    onSuccess: (_, pharmacyId) => {
      // Status change → invalidate the pharmacies list and the one detail.
      queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.pharmacy(pharmacyId),
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
