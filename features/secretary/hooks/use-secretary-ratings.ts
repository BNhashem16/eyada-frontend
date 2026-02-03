'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { SECRETARY_ENDPOINTS } from '@/lib/api/endpoints';
import { SecretaryRatingsResponse } from '@/types';

export function useSecretaryRatings() {
  return useQuery({
    queryKey: ['secretary-ratings'],
    queryFn: async () => {
      return apiGet<SecretaryRatingsResponse>(SECRETARY_ENDPOINTS.RATINGS);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
