"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { PHARMACY_OWNER_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError } from "@/types";
import type { PharmacyOwnerProfile } from "@/types/pharmacy";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export function usePharmacyOwnerProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["pharmacy-owner-profile"],
    queryFn: async () => {
      return apiGet<PharmacyOwnerProfile>(PHARMACY_OWNER_ENDPOINTS.PROFILE);
    },
    staleTime: 1000 * 60 * 5,
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
      queryClient.invalidateQueries({ queryKey: ["pharmacy-owner-profile"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
