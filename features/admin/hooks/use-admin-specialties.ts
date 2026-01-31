'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { ADMIN_ENDPOINTS, PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';
import { Specialty, Multilingual } from '@/types';

export function useAdminSpecialties() {
  return useQuery({
    queryKey: ['admin-specialties'],
    queryFn: async () => {
      return apiGet<Specialty[]>(PUBLIC_ENDPOINTS.SPECIALTIES);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

interface CreateSpecialtyData {
  name: Multilingual;
  description?: Multilingual;
  icon?: string;
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSpecialtyData) => {
      return apiPost<Specialty>(ADMIN_ENDPOINTS.SPECIALTIES, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-specialties'] });
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
    },
  });
}

interface UpdateSpecialtyData {
  id: string;
  name?: Multilingual;
  description?: Multilingual;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateSpecialtyData) => {
      return apiPatch<Specialty>(ADMIN_ENDPOINTS.SPECIALTY(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-specialties'] });
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
    },
  });
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(ADMIN_ENDPOINTS.SPECIALTY(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-specialties'] });
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
    },
  });
}
