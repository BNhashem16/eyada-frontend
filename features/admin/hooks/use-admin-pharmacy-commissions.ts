"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPut, apiDelete } from "@/lib/api";
import { ADMIN_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError } from "@/types";
import type {
  PharmacyCommissionResponse,
  PharmacyCommission,
  SetCommissionDto,
} from "@/types/pharmacy-commission";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { adminPharmacyKeys } from "@/lib/query-keys";

export function usePharmacyCommission(pharmacyId: string) {
  return usePharmacyQuery<PharmacyCommissionResponse>({
    queryKey: adminPharmacyKeys.commissions({ pharmacyId }),
    queryFn: async () =>
      apiGet<PharmacyCommissionResponse>(
        ADMIN_PHARMACY_ENDPOINTS.PHARMACY_COMMISSION(pharmacyId),
      ),
    enabled: !!pharmacyId,
  });
}

export function useSetPharmacyCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      pharmacyId,
      ...data
    }: SetCommissionDto & { pharmacyId: string }) => {
      return apiPut<PharmacyCommission>(
        ADMIN_PHARMACY_ENDPOINTS.PHARMACY_COMMISSION(pharmacyId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.commissions(),
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

export function useDeletePharmacyCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (pharmacyId: string) => {
      return apiDelete(
        ADMIN_PHARMACY_ENDPOINTS.PHARMACY_COMMISSION(pharmacyId),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminPharmacyKeys.commissions(),
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
