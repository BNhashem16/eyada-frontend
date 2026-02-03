'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { SECRETARY_ENDPOINTS } from '@/lib/api/endpoints';
import { PatientProfile, PaginatedResponse } from '@/types';

export interface UseSecretaryPatientsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export function useSecretaryPatients({
  search,
  page = 1,
  limit = 20,
}: UseSecretaryPatientsOptions = {}) {
  return useQuery({
    queryKey: ['secretary-patients', { search, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const url = `${SECRETARY_ENDPOINTS.PATIENTS_SEARCH}?${params.toString()}`;
      return apiGet<PaginatedResponse<PatientProfile>>(url);
    },
    staleTime: 1000 * 30, // 30 seconds
    enabled: true,
  });
}

export function useSecretaryPatient(patientProfileId: string) {
  return useQuery({
    queryKey: ['secretary-patient', patientProfileId],
    queryFn: async () => {
      return apiGet<PatientProfile>(SECRETARY_ENDPOINTS.PATIENT(patientProfileId));
    },
    enabled: !!patientProfileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
