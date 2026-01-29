'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';
import { DoctorProfile, PaginatedResponse } from '@/types';
import { DoctorFilters } from '../components/doctor-filters';

interface UseDoctorsOptions {
  filters?: DoctorFilters;
  page?: number;
  limit?: number;
}

export function useDoctors({ filters = {}, page = 1, limit = 10 }: UseDoctorsOptions = {}) {
  return useQuery({
    queryKey: ['doctors', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.specialtyId) params.append('specialtyId', filters.specialtyId);
      if (filters.stateId) params.append('stateId', filters.stateId);
      if (filters.cityId) params.append('cityId', filters.cityId);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const url = `${PUBLIC_ENDPOINTS.DOCTORS}?${params.toString()}`;
      return apiGet<PaginatedResponse<DoctorProfile>>(url);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDoctor(doctorId: string) {
  return useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      return apiGet<DoctorProfile>(`${PUBLIC_ENDPOINTS.DOCTORS}/${doctorId}`);
    },
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDoctorRatings(doctorId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['doctor-ratings', doctorId, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      return apiGet<PaginatedResponse<Rating>>(`${PUBLIC_ENDPOINTS.DOCTORS}/${doctorId}/ratings?${params}`);
    },
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5,
  });
}

interface Rating {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  patient: {
    user: {
      name: string;
      profilePicture?: string;
    };
  };
}
