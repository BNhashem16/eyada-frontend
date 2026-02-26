"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { PATIENT_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { PharmacyCampaign } from "@/types/campaign";

export function usePharmacyActiveCampaigns(pharmacyId: string) {
  return useQuery({
    queryKey: ["patient-pharmacy-campaigns", pharmacyId],
    queryFn: async () => {
      return apiGet<{ data: PharmacyCampaign[] }>(
        PATIENT_PHARMACY_ENDPOINTS.PHARMACY_CAMPAIGNS(pharmacyId),
      );
    },
    enabled: !!pharmacyId,
    staleTime: 1000 * 60,
  });
}
