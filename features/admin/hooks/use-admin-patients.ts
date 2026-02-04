'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/lib/api';
import { ADMIN_ENDPOINTS } from '@/lib/api/endpoints';
import { PatientProfile, PaginatedResponse } from '@/types';
import { PatientStatus } from '@/types/enums';

// Filter options for admin patients list
export interface AdminPatientsFilters {
  page?: number;
  limit?: number;
  status?: PatientStatus;
  search?: string;
  isActive?: boolean;
  isApproved?: boolean;
}

export function useAdminPatients(filters: AdminPatientsFilters = {}) {
  const {
    page = 1,
    limit = 30,
    status,
    search,
    isActive,
    isApproved,
  } = filters;

  return useQuery({
    queryKey: ['admin-patients', { page, limit, status, search, isActive, isApproved }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (status) params.append('status', status);
      if (search) params.append('search', search);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      if (isApproved !== undefined) params.append('isApproved', isApproved.toString());

      return apiGet<PaginatedResponse<PatientProfile>>(`${ADMIN_ENDPOINTS.PATIENTS}?${params.toString()}`);
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

// Get pending patients only
export function usePendingPatients() {
  return useAdminPatients({ status: PatientStatus.PENDING });
}

export function useAdminPatient(patientId: string) {
  return useQuery({
    queryKey: ['admin-patient', patientId],
    queryFn: async () => {
      return apiGet<PatientProfile>(ADMIN_ENDPOINTS.PATIENT(patientId));
    },
    enabled: !!patientId,
  });
}

export function useApprovePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string) => {
      return apiPatch<PatientProfile>(ADMIN_ENDPOINTS.APPROVE_PATIENT(patientId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-patients'] });
      queryClient.invalidateQueries({ queryKey: ['admin-patient'] });
    },
  });
}

export function useRejectPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string) => {
      return apiPatch<PatientProfile>(ADMIN_ENDPOINTS.REJECT_PATIENT(patientId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-patients'] });
      queryClient.invalidateQueries({ queryKey: ['admin-patient'] });
    },
  });
}

export function useSuspendPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string) => {
      return apiPatch<PatientProfile>(ADMIN_ENDPOINTS.SUSPEND_PATIENT(patientId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-patients'] });
      queryClient.invalidateQueries({ queryKey: ['admin-patient'] });
    },
  });
}
