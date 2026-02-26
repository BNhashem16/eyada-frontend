"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type {
  PharmacyCoupon,
  CreateCouponDto,
  UpdateCouponDto,
} from "@/types/coupon";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface CouponFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export function useAdminCoupons(filters: CouponFilters = {}) {
  const { page = 1, limit = 10, search, isActive } = filters;

  return useQuery({
    queryKey: ["admin-pharmacy-coupons", { page, limit, search, isActive }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (isActive !== undefined)
        params.append("isActive", isActive.toString());

      return apiGet<PaginatedResponse<PharmacyCoupon>>(
        `${ADMIN_PHARMACY_ENDPOINTS.COUPONS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60,
  });
}

export function useAdminCoupon(couponId: string) {
  return useQuery({
    queryKey: ["admin-pharmacy-coupon", couponId],
    queryFn: async () => {
      return apiGet<PharmacyCoupon>(ADMIN_PHARMACY_ENDPOINTS.COUPON(couponId));
    },
    enabled: !!couponId,
    staleTime: 1000 * 60,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreateCouponDto) => {
      return apiPost<PharmacyCoupon>(ADMIN_PHARMACY_ENDPOINTS.COUPONS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-coupons"],
      });
      toastSuccess(t("toast.success"), t("toast.created"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      couponId,
      ...data
    }: UpdateCouponDto & { couponId: string }) => {
      return apiPatch<PharmacyCoupon>(
        ADMIN_PHARMACY_ENDPOINTS.COUPON(couponId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-coupons"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-coupon"],
      });
      toastSuccess(t("toast.success"), t("toast.updated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (couponId: string) => {
      return apiDelete(ADMIN_PHARMACY_ENDPOINTS.COUPON(couponId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-coupons"],
      });
      toastSuccess(t("toast.success"), t("toast.deleted"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
