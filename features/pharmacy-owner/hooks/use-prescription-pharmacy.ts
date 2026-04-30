"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { PHARMACY_OWNER_PRESCRIPTION_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { PrescriptionOrder } from "@/types/prescription";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { prescriptionKeys } from "@/lib/query-keys";

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

  // 'fast-changing': prescription order workflow expects near-live state
  // because patient & owner alternate moves. The previous implementation
  // hard-polled every 30s; the user explicitly disallowed that. Owner
  // presses Refresh + mutations invalidate.
  return usePharmacyQuery<PaginatedResponse<PrescriptionOrder>>({
    queryKey: prescriptionKeys.pharmacyOrders(pharmacyId, {
      page,
      limit,
      status,
    }),
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
    preset: "fast-changing",
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
    onSuccess: (_, vars) => {
      // Invalidate this pharmacy's prescription orders only.
      queryClient.invalidateQueries({
        queryKey: prescriptionKeys.pharmacyOrders(vars.pharmacyId),
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
