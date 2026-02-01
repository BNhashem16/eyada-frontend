'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';
import { State, City } from '@/types';

/**
 * Public hook to fetch all states (governorates)
 * No authentication required
 */
export function useStates() {
  return useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      return apiGet<State[]>(PUBLIC_ENDPOINTS.STATES);
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - states don't change often
  });
}

/**
 * Public hook to fetch a single state by ID
 * No authentication required
 */
export function useState(stateId: string) {
  return useQuery({
    queryKey: ['state', stateId],
    queryFn: async () => {
      return apiGet<State>(PUBLIC_ENDPOINTS.STATE(stateId));
    },
    enabled: !!stateId,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Public hook to fetch cities, optionally filtered by state
 * No authentication required
 */
export function useCities(stateId?: string) {
  return useQuery({
    queryKey: ['cities', stateId],
    queryFn: async () => {
      const params = stateId ? `?stateId=${stateId}` : '';
      return apiGet<City[]>(`${PUBLIC_ENDPOINTS.CITIES}${params}`);
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Public hook to fetch a single city by ID
 * No authentication required
 */
export function useCity(cityId: string) {
  return useQuery({
    queryKey: ['city', cityId],
    queryFn: async () => {
      return apiGet<City>(PUBLIC_ENDPOINTS.CITY(cityId));
    },
    enabled: !!cityId,
    staleTime: 1000 * 60 * 30,
  });
}
