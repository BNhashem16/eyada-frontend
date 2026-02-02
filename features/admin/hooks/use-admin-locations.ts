'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { ADMIN_ENDPOINTS } from '@/lib/api/endpoints';
import { State, City, Multilingual } from '@/types';

// States - per Swagger: GET /admin/states returns all states (active and inactive)
export function useAdminStates() {
  return useQuery({
    queryKey: ['admin-states'],
    queryFn: async () => {
      return apiGet<State[]>(ADMIN_ENDPOINTS.STATES);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Per Swagger CreateStateDto: name and code are REQUIRED
interface CreateStateData {
  name: Multilingual;
  code: string; // Required per Swagger, maxLength: 10
  sortOrder?: number;
  isActive?: boolean;
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

// Cities - per Swagger: GET /admin/cities returns all cities (active and inactive)
export function useAdminCities(stateId?: string) {
  return useQuery({
    queryKey: ['admin-cities', stateId],
    queryFn: async () => {
      const params = stateId ? `?stateId=${stateId}` : '';
      return apiGet<City[]>(`${ADMIN_ENDPOINTS.CITIES}${params}`);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Per Swagger CreateCityDto: stateId and name are REQUIRED
interface CreateCityData {
  stateId: string; // UUID, required
  name: Multilingual; // required
  sortOrder?: number;
  isActive?: boolean; // default: true
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

// Per Swagger UpdateCityDto
interface UpdateCityData {
  id: string;
  stateId?: string; // UUID, can change parent state
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
