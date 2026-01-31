'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/lib/api';
import { ADMIN_ENDPOINTS } from '@/lib/api/endpoints';
import { DoctorProfile } from '@/types';

export function usePendingDoctors() {
  return useQuery({
    queryKey: ['admin-pending-doctors'],
    queryFn: async () => {
      return apiGet<DoctorProfile[]>(ADMIN_ENDPOINTS.PENDING_DOCTORS);
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useApproveDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctorId: string) => {
      return apiPatch<DoctorProfile>(ADMIN_ENDPOINTS.APPROVE_DOCTOR(doctorId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-doctors'] });
    },
  });
}

export function useRejectDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctorId: string) => {
      return apiPatch<DoctorProfile>(ADMIN_ENDPOINTS.REJECT_DOCTOR(doctorId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-doctors'] });
    },
  });
}

export function useSuspendDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctorId: string) => {
      return apiPatch<DoctorProfile>(ADMIN_ENDPOINTS.SUSPEND_DOCTOR(doctorId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-doctors'] });
    },
  });
}
