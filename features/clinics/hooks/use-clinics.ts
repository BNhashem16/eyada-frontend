'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';
import { Clinic, ClinicSchedule, ClinicServiceType, PaginatedResponse } from '@/types';
import { ClinicFilters } from '../components/clinic-filters';

interface UseClinicsOptions {
  filters?: ClinicFilters;
  page?: number;
  limit?: number;
}

export function useClinics({ filters = {}, page = 1, limit = 10 }: UseClinicsOptions = {}) {
  return useQuery({
    queryKey: ['clinics', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.specialtyId) params.append('specialtyId', filters.specialtyId);
      if (filters.stateId) params.append('stateId', filters.stateId);
      if (filters.cityId) params.append('cityId', filters.cityId);
      if (filters.hasAvailableSlots !== undefined) {
        params.append('hasAvailableSlots', filters.hasAvailableSlots.toString());
      }
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const url = `${PUBLIC_ENDPOINTS.CLINICS}?${params.toString()}`;
      return apiGet<PaginatedResponse<Clinic>>(url);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useClinic(clinicId: string) {
  return useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: async () => {
      return apiGet<Clinic>(`${PUBLIC_ENDPOINTS.CLINICS}/${clinicId}`);
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useClinicSchedules(clinicId: string) {
  return useQuery({
    queryKey: ['clinic-schedules', clinicId],
    queryFn: async () => {
      return apiGet<ClinicSchedule[]>(`${PUBLIC_ENDPOINTS.CLINICS}/${clinicId}/schedules`);
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useClinicServices(clinicId: string) {
  return useQuery({
    queryKey: ['clinic-services', clinicId],
    queryFn: async () => {
      return apiGet<ClinicServiceType[]>(`${PUBLIC_ENDPOINTS.CLINICS}/${clinicId}/services`);
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });
}

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export function useClinicAvailableSlots(clinicId: string, date: string) {
  return useQuery({
    queryKey: ['clinic-available-slots', clinicId, date],
    queryFn: async () => {
      const params = new URLSearchParams({ date });
      return apiGet<AvailableSlot[]>(`${PUBLIC_ENDPOINTS.CLINICS}/${clinicId}/available-slots?${params}`);
    },
    enabled: !!clinicId && !!date,
    staleTime: 1000 * 60, // 1 minute for slots
  });
}
