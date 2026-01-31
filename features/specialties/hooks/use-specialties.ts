'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';
import { Specialty } from '@/types';

export function useSpecialties() {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      return apiGet<Specialty[]>(PUBLIC_ENDPOINTS.SPECIALTIES);
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - specialties don't change often
  });
}

export function useSpecialty(specialtyId: string) {
  return useQuery({
    queryKey: ['specialty', specialtyId],
    queryFn: async () => {
      return apiGet<Specialty>(PUBLIC_ENDPOINTS.SPECIALTY(specialtyId));
    },
    enabled: !!specialtyId,
    staleTime: 1000 * 60 * 30,
  });
}
