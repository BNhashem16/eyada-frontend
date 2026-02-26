"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { ADMIN_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { Settlement, ProcessSettlementDto } from "@/types/wallet";
import type { SettlementStatus } from "@/types";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface SettlementFilters {
  status?: SettlementStatus;
  page?: number;
  limit?: number;
}

export function useAdminSettlements(filters: SettlementFilters = {}) {
  const { status, page = 1, limit = 10 } = filters;

  return useQuery({
    queryKey: ["admin-settlements", { status, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<Settlement>>(
        `${ADMIN_PHARMACY_ENDPOINTS.SETTLEMENTS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 30,
  });
}

export function useProcessSettlement() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      settlementId,
      ...dto
    }: ProcessSettlementDto & { settlementId: string }) => {
      return apiPatch<Settlement>(
        ADMIN_PHARMACY_ENDPOINTS.PROCESS_SETTLEMENT(settlementId),
        dto,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settlements"] });
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
