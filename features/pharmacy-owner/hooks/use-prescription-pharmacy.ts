"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { PHARMACY_OWNER_PRESCRIPTION_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { PrescriptionOrder } from "@/types/prescription";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface PharmacyPrescriptionFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export function usePharmacyPrescriptionOrders(
  pharmacyId: string,
  filters: PharmacyPrescriptionFilters = {},
) {
  const { page = 1, limit = 10, status } = filters;

  return useQuery({
    queryKey: [
      "pharmacy-prescription-orders",
      pharmacyId,
      { page, limit, status },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PrescriptionOrder>>(
        `${PHARMACY_OWNER_PRESCRIPTION_ENDPOINTS.ORDERS(pharmacyId)}?${params.toString()}`,
      );
    },
    enabled: !!pharmacyId,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}

export function useUpdatePrescriptionOrderStatus() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      pharmacyId,
      orderId,
      status,
      note,
    }: {
      pharmacyId: string;
      orderId: string;
      status: string;
      note?: string;
    }) => {
      return apiPatch(
        PHARMACY_OWNER_PRESCRIPTION_ENDPOINTS.ORDER_STATUS(pharmacyId, orderId),
        { status, note },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pharmacy-prescription-orders"],
      });
      toastSuccess(t("toast.success"), t("prescription.orderStatusUpdated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
