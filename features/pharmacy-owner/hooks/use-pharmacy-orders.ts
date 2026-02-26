"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { PHARMACY_OWNER_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { PharmacyOrder, UpdateOrderStatusDto } from "@/types/order";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

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

  return useQuery({
    queryKey: ["pharmacy-orders", pharmacyId, { page, limit, status, search }],
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
    staleTime: 1000 * 30,
  });
}

export function usePharmacyOrder(pharmacyId: string, orderId: string) {
  return useQuery({
    queryKey: ["pharmacy-order", pharmacyId, orderId],
    queryFn: async () => {
      return apiGet<PharmacyOrder>(
        PHARMACY_OWNER_ENDPOINTS.ORDER(pharmacyId, orderId),
      );
    },
    enabled: !!pharmacyId && !!orderId,
    staleTime: 1000 * 30,
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pharmacy-orders", pharmacyId],
      });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-order"] });
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
