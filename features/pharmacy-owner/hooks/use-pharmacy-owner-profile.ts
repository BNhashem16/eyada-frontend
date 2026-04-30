"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { PHARMACY_OWNER_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError } from "@/types";
import type { PharmacyOwnerProfile } from "@/types/pharmacy";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { pharmacyKeys } from "@/lib/query-keys";

export function usePharmacyOwnerProfile(options?: { enabled?: boolean }) {
  return usePharmacyQuery<PharmacyOwnerProfile>({
    queryKey: pharmacyKeys.ownerProfile(),
    queryFn: async () =>
      apiGet<PharmacyOwnerProfile>(PHARMACY_OWNER_ENDPOINTS.PROFILE),
    enabled: options?.enabled ?? true,
  });
}

export function useUpdatePharmacyOwnerProfile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<PharmacyOwnerProfile>) => {
      return apiPatch<PharmacyOwnerProfile>(
        PHARMACY_OWNER_ENDPOINTS.PROFILE,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.ownerProfile() });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
