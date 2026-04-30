"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost } from "@/lib/api";
import { PHARMACY_OWNER_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type {
  WalletSummary,
  WalletTransaction,
  WalletTransactionType,
  Settlement,
  RequestSettlementDto,
} from "@/types/wallet";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { pharmacyWalletKeys } from "@/lib/query-keys";

export function useWalletSummary(pharmacyId: string) {
  // 'fast-changing': balance updates from incoming orders should feel
  // close to live; user can also press Refresh.
  return usePharmacyQuery<WalletSummary>({
    queryKey: pharmacyWalletKeys.balance(pharmacyId),
    queryFn: async () =>
      apiGet<WalletSummary>(PHARMACY_OWNER_ENDPOINTS.WALLET(pharmacyId)),
    enabled: !!pharmacyId,
    preset: "fast-changing",
  });
}

export interface WalletTransactionFilters {
  type?: WalletTransactionType;
  page?: number;
  limit?: number;
}

export function useWalletTransactions(
  pharmacyId: string,
  filters: WalletTransactionFilters = {},
) {
  const { type, page = 1, limit = 10 } = filters;

  return usePharmacyQuery<PaginatedResponse<WalletTransaction>>({
    queryKey: pharmacyWalletKeys.transactions(pharmacyId, {
      type,
      page,
      limit,
    }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (type) params.append("type", type);

      return apiGet<PaginatedResponse<WalletTransaction>>(
        `${PHARMACY_OWNER_ENDPOINTS.WALLET_TRANSACTIONS(pharmacyId)}?${params.toString()}`,
      );
    },
    enabled: !!pharmacyId,
  });
}

export function usePharmacySettlements(
  pharmacyId: string,
  page = 1,
  limit = 10,
) {
  return usePharmacyQuery<PaginatedResponse<Settlement>>({
    queryKey: pharmacyWalletKeys.settlements(pharmacyId, { page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      return apiGet<PaginatedResponse<Settlement>>(
        `${PHARMACY_OWNER_ENDPOINTS.REQUEST_SETTLEMENT(pharmacyId)}?${params.toString()}`,
      );
    },
    enabled: !!pharmacyId,
  });
}

export function useRequestSettlement(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (dto: RequestSettlementDto) => {
      return apiPost<Settlement>(
        PHARMACY_OWNER_ENDPOINTS.REQUEST_SETTLEMENT(pharmacyId),
        dto,
      );
    },
    onSuccess: () => {
      // Settlement request changes balance, transactions log, and the
      // settlements list — invalidate the whole wallet scope at once.
      queryClient.invalidateQueries({
        queryKey: pharmacyWalletKeys.scoped(pharmacyId),
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
