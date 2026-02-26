"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import { Specialty, Multilingual, PaginatedResponse } from "@/types";
import { AxiosError } from "axios";
import type { ApiError } from "@/types";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

// ==================== Statistics ====================

export interface SpecialtyStatistics {
  totalSpecialties: number;
  activeSpecialties: number;
  inactiveSpecialties: number;
}

export function useAdminSpecialtyStatistics() {
  return useQuery({
    queryKey: ["admin-specialties-statistics"],
    queryFn: async () => {
      return apiGet<SpecialtyStatistics>(
        ADMIN_ENDPOINTS.SPECIALTIES_STATISTICS,
      );
    },
    staleTime: 1000 * 60,
  });
}

// Per Swagger: GET /admin/specialties with optional filters and pagination
export interface UseAdminSpecialtiesOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export function useAdminSpecialties(options: UseAdminSpecialtiesOptions = {}) {
  const { page = 1, limit = 10, search, isActive } = options;

  return useQuery({
    queryKey: ["admin-specialties", { page, limit, search, isActive }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (isActive !== undefined)
        params.append("isActive", isActive.toString());

      return apiGet<PaginatedResponse<Specialty>>(
        `${ADMIN_ENDPOINTS.SPECIALTIES}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Per Swagger CreateSpecialtyDto: name is REQUIRED
interface CreateSpecialtyData {
  name: Multilingual; // required
  description?: Multilingual;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean; // default: true
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreateSpecialtyData) => {
      return apiPost<Specialty>(ADMIN_ENDPOINTS.SPECIALTIES, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

interface UpdateSpecialtyData {
  id: string;
  name?: Multilingual;
  description?: Multilingual;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateSpecialtyData) => {
      return apiPatch<Specialty>(ADMIN_ENDPOINTS.SPECIALTY(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(ADMIN_ENDPOINTS.SPECIALTY(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
