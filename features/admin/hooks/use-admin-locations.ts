'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { ADMIN_ENDPOINTS, PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';
import { State, City, Multilingual } from '@/types';

// States
export function useAdminStates() {
  return useQuery({
    queryKey: ['admin-states'],
    queryFn: async () => {
      return apiGet<State[]>(PUBLIC_ENDPOINTS.STATES);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

interface CreateStateData {
  name: Multilingual;
  code?: string;
}

export function useCreateState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStateData) => {
      return apiPost<State>(ADMIN_ENDPOINTS.STATES, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-states'] });
    },
  });
}

interface UpdateStateData {
  id: string;
  name?: Multilingual;
  code?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export function useUpdateState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateStateData) => {
      return apiPatch<State>(ADMIN_ENDPOINTS.STATE(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-states'] });
    },
  });
}

export function useDeleteState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(ADMIN_ENDPOINTS.STATE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-states'] });
    },
  });
}

// Cities
export function useAdminCities(stateId?: string) {
  return useQuery({
    queryKey: ['admin-cities', stateId],
    queryFn: async () => {
      const params = stateId ? `?stateId=${stateId}` : '';
      return apiGet<City[]>(`${PUBLIC_ENDPOINTS.CITIES}${params}`);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

interface CreateCityData {
  stateId: string;
  name: Multilingual;
}

export function useCreateCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCityData) => {
      return apiPost<City>(ADMIN_ENDPOINTS.CITIES, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
    },
  });
}

interface UpdateCityData {
  id: string;
  name?: Multilingual;
  isActive?: boolean;
  sortOrder?: number;
}

export function useUpdateCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCityData) => {
      return apiPatch<City>(ADMIN_ENDPOINTS.CITY(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
    },
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(ADMIN_ENDPOINTS.CITY(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
    },
  });
}
