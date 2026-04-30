"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { PHARMACY_OWNER_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { PharmacyOrder, UpdateOrderStatusDto } from "@/types/order";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { pharmacyOrderKeys } from "@/lib/query-keys";

export interface PharmacyOrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export function usePharmacyOrders(
  pharmacyId: string,
  filters: PharmacyOrderFilters = {},
) {
  const { page = 1, limit = 10, status, search } = filters;

  // 'fast-changing': owner watches the orders pipeline closely; 60s
  // staleTime keeps the list snappy while still avoiding mount-refetch.
  return usePharmacyQuery<PaginatedResponse<PharmacyOrder>>({
    queryKey: pharmacyOrderKeys.list(pharmacyId, {
      page,
      limit,
      status,
      search,
    }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);
      if (search) params.append("search", search);

      return apiGet<PaginatedResponse<PharmacyOrder>>(
        `${PHARMACY_OWNER_ENDPOINTS.ORDERS(pharmacyId)}?${params.toString()}`,
      );
    },
    enabled: !!pharmacyId,
    preset: "fast-changing",
  });
}

export function usePharmacyOrder(pharmacyId: string, orderId: string) {
  // 'fast-changing': order detail page reflects status mid-flight while
  // owner moves the order through the pipeline.
  return usePharmacyQuery<PharmacyOrder>({
    queryKey: pharmacyOrderKeys.detail(pharmacyId, orderId),
    queryFn: async () =>
      apiGet<PharmacyOrder>(
        PHARMACY_OWNER_ENDPOINTS.ORDER(pharmacyId, orderId),
      ),
    enabled: !!pharmacyId && !!orderId,
    preset: "fast-changing",
  });
}

export function useUpdateOrderStatus(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      orderId,
      ...data
    }: UpdateOrderStatusDto & { orderId: string }) => {
      return apiPatch<PharmacyOrder>(
        PHARMACY_OWNER_ENDPOINTS.ORDER_STATUS(pharmacyId, orderId),
        data,
      );
    },
    onSuccess: (_, vars) => {
      // Targeted invalidation: this pharmacy's order list + the one detail.
      queryClient.invalidateQueries({
        queryKey: pharmacyOrderKeys.lists(pharmacyId),
      });
      queryClient.invalidateQueries({
        queryKey: pharmacyOrderKeys.detail(pharmacyId, vars.orderId),
      });
      toastSuccess(t("toast.success"), t("pharmacyOwner.orderStatusUpdated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
