"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { ADMIN_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { PharmacyOwnerProfile } from "@/types/pharmacy";
import { PharmacyStatus } from "@/types/enums";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { adminPharmacyKeys } from "@/lib/query-keys";

export interface AdminPharmacyOwnerFilters {
  page?: number;
  limit?: number;
  status?: PharmacyStatus;
  search?: string;
}

interface PharmacyOwnerProfileWithCount extends PharmacyOwnerProfile {
  _count?: { pharmacies?: number };
}

export function useAdminPharmacyOwners(
  filters: AdminPharmacyOwnerFilters = {},
) {
  const { page = 1, limit = 10, status, search } = filters;

  return usePharmacyQuery<PaginatedResponse<PharmacyOwnerProfileWithCount>>({
    queryKey: adminPharmacyKeys.owners({ page, limit, status, search }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);
      if (search) params.append("search", search);

      return apiGet<PaginatedResponse<PharmacyOwnerProfileWithCount>>(
        `${ADMIN_PHARMACY_ENDPOINTS.PHARMACY_OWNERS}?${params.toString()}`,
      );
    },
  });
}

export function useApprovePharmacyOwner() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (ownerProfileId: string) => {
      return apiPatch(
        ADMIN_PHARMACY_ENDPOINTS.APPROVE_OWNER(ownerProfileId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPharmacyKeys.owners() });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useRejectPharmacyOwner() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (ownerProfileId: string) => {
      return apiPatch(
        ADMIN_PHARMACY_ENDPOINTS.REJECT_OWNER(ownerProfileId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPharmacyKeys.owners() });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useSuspendPharmacyOwner() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (ownerProfileId: string) => {
      return apiPatch(
        ADMIN_PHARMACY_ENDPOINTS.SUSPEND_OWNER(ownerProfileId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPharmacyKeys.owners() });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
