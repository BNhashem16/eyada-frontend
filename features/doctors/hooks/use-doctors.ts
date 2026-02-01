'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';
import { DoctorProfile, PaginatedResponse } from '@/types';

// Extended doctor filters matching Swagger spec
export interface DoctorFilters {
  search?: string;
  specialtyId?: string;
  stateId?: string;
  cityId?: string;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
}

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
      if (filters.minRating !== undefined) params.append('minRating', filters.minRating.toString());
      if (filters.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString());
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

// Swagger uses limit/offset instead of page/limit for ratings
export function useDoctorRatings(doctorId: string, limit = 10, offset = 0) {
  return useQuery({
    queryKey: ['doctor-ratings', doctorId, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      return apiGet<Rating[]>(PUBLIC_ENDPOINTS.DOCTOR_RATINGS(doctorId) + `?${params}`);
    },
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5,
  });
}

export interface Rating {
  id: string;
  rating: number;
  review?: string;
  createdAt: string;
  patientProfile?: {
    user: {
      fullName: string;
      profilePicture?: string;
    };
  };
}
