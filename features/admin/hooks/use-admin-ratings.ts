"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import { PaginatedResponse } from "@/types";
import { AxiosError } from "axios";
import type { ApiError } from "@/types";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

// ==================== Types ====================

export interface AdminRating {
  id: string;
  rating: number;
  review: string | null;
  isVisible: boolean;
  createdAt: string;
  patientProfile: {
    id: string;
    user: {
      id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  doctorProfile: {
    id: string;
    user: {
      id: string;
      fullName: string;
      phoneNumber: string;
    };
    specialty: {
      id: string;
      name: { ar: string; en: string };
    };
  };
  appointment?: {
    id: string;
    bookingNumber: string;
    appointmentDate: string;
    clinic?: {
      id: string;
      name: { ar: string; en: string };
    };
  };
}

export interface RatingStatistics {
  totalRatings: number;
  averageRating: number;
  visibleRatings: number;
  hiddenRatings: number;
  byRating: Array<{ rating: number; count: number }>;
}

export interface AdminRatingFilters {
  page?: number;
  limit?: number;
  search?: string;
  doctorProfileId?: string;
  patientProfileId?: string;
  rating?: number;
  isVisible?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// ==================== Hooks ====================

export function useAdminRatings(filters: AdminRatingFilters = {}) {
  const {
    page = 1,
    limit = 30,
    search,
    doctorProfileId,
    patientProfileId,
    rating,
    isVisible,
    dateFrom,
    dateTo,
  } = filters;

  return useQuery({
    queryKey: [
      "admin-ratings",
      {
        page,
        limit,
        search,
        doctorProfileId,
        patientProfileId,
        rating,
        isVisible,
        dateFrom,
        dateTo,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (search) params.append("search", search);
      if (doctorProfileId) params.append("doctorProfileId", doctorProfileId);
      if (patientProfileId) params.append("patientProfileId", patientProfileId);
      if (rating) params.append("rating", rating.toString());
      if (isVisible !== undefined)
        params.append("isVisible", isVisible.toString());
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      return apiGet<PaginatedResponse<AdminRating>>(
        `${ADMIN_ENDPOINTS.RATINGS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminRating(id: string) {
  return useQuery({
    queryKey: ["admin-rating", id],
    queryFn: async () => {
      return apiGet<AdminRating>(ADMIN_ENDPOINTS.RATING(id));
    },
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminRatingStatistics(filters: AdminRatingFilters = {}) {
  const { dateFrom, dateTo } = filters;

  return useQuery({
    queryKey: ["admin-ratings-statistics", { dateFrom, dateTo }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      return apiGet<RatingStatistics>(
        `${ADMIN_ENDPOINTS.RATINGS_STATISTICS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export interface UpdateRatingData {
  isVisible?: boolean;
}

export function useUpdateAdminRating() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateRatingData & { id: string }) => {
      return apiPatch<AdminRating>(ADMIN_ENDPOINTS.RATING(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-rating"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ratings-statistics"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(t("toast.error"), extractApiError(error, t("errors.somethingWentWrong")));
    },
  });
}

export function useDeleteAdminRating() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(ADMIN_ENDPOINTS.RATING(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ratings-statistics"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(t("toast.error"), extractApiError(error, t("errors.somethingWentWrong")));
    },
  });
}
