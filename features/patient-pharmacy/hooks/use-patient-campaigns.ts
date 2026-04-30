"use client";

import { apiGet } from "@/lib/api";
import { PATIENT_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { PharmacyCampaign } from "@/types/campaign";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { patientPharmacyBrowseKeys } from "@/lib/query-keys";

export function usePharmacyActiveCampaigns(pharmacyId: string) {
  return usePharmacyQuery<{ data: PharmacyCampaign[] }>({
    queryKey: [
      ...patientPharmacyBrowseKeys.all,
      "active-campaigns",
      pharmacyId,
    ] as const,
    queryFn: async () =>
      apiGet<{ data: PharmacyCampaign[] }>(
        PATIENT_PHARMACY_ENDPOINTS.PHARMACY_CAMPAIGNS(pharmacyId),
      ),
    enabled: !!pharmacyId,
  });
}
