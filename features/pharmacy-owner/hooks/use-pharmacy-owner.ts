"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { PHARMACY_OWNER_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type {
  Pharmacy,
  CreatePharmacyDto,
  UpdatePharmacyDto,
} from "@/types/pharmacy";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

// ==================== Queries ====================

export interface PharmacyOwnerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export function useMyPharmacies(filters: PharmacyOwnerFilters = {}) {
  const { page = 1, limit = 10, search } = filters;

  return useQuery({
    queryKey: ["my-pharmacies", { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      return apiGet<PaginatedResponse<Pharmacy>>(
        `${PHARMACY_OWNER_ENDPOINTS.PHARMACIES}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60,
  });
}

export function useMyPharmacy(pharmacyId: string) {
  return useQuery({
    queryKey: ["my-pharmacy", pharmacyId],
    queryFn: async () => {
      return apiGet<Pharmacy>(PHARMACY_OWNER_ENDPOINTS.PHARMACY(pharmacyId));
    },
    enabled: !!pharmacyId,
    staleTime: 1000 * 60,
  });
}

// ==================== Mutations ====================

export function useCreatePharmacy() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreatePharmacyDto) => {
      return apiPost<Pharmacy>(PHARMACY_OWNER_ENDPOINTS.PHARMACIES, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pharmacies"] });
      toastSuccess(t("toast.success"), t("pharmacyOwner.addPharmacy"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useUpdatePharmacy() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      pharmacyId,
      ...data
    }: UpdatePharmacyDto & { pharmacyId: string }) => {
      return apiPatch<Pharmacy>(
        PHARMACY_OWNER_ENDPOINTS.PHARMACY(pharmacyId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["my-pharmacy"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useDeletePharmacy() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (pharmacyId: string) => {
      return apiDelete(PHARMACY_OWNER_ENDPOINTS.PHARMACY(pharmacyId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pharmacies"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
