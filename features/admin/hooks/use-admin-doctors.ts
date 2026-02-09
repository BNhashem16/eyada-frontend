"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import { DoctorProfile, PaginatedResponse } from "@/types";
import { DoctorStatus } from "@/types/enums";

// Filter options for admin doctors list
export interface AdminDoctorsFilters {
  page?: number;
  limit?: number;
  status?: DoctorStatus;
  specialtyId?: string;
  cityId?: string;
  stateId?: string;
  search?: string;
  minRating?: number;
  isActive?: boolean;
  isApproved?: boolean;
}

export function useAdminDoctors(filters: AdminDoctorsFilters = {}) {
  const {
    page = 1,
    limit = 30,
    status,
    specialtyId,
    cityId,
    stateId,
    search,
    minRating,
    isActive,
    isApproved,
  } = filters;

  return useQuery({
    queryKey: [
      "admin-doctors",
      {
        page,
        limit,
        status,
        specialtyId,
        cityId,
        stateId,
        search,
        minRating,
        isActive,
        isApproved,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (status) params.append("status", status);
      if (specialtyId) params.append("specialtyId", specialtyId);
      if (cityId) params.append("cityId", cityId);
      if (stateId) params.append("stateId", stateId);
      if (search) params.append("search", search);
      if (minRating !== undefined)
        params.append("minRating", minRating.toString());
      if (isActive !== undefined)
        params.append("isActive", isActive.toString());
      if (isApproved !== undefined)
        params.append("isApproved", isApproved.toString());

      return apiGet<PaginatedResponse<DoctorProfile>>(
        `${ADMIN_ENDPOINTS.DOCTORS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

// Keep the old hook name for backwards compatibility (deprecated)
export function usePendingDoctors() {
  return useAdminDoctors({ status: DoctorStatus.PENDING });
}

export function useAdminDoctor(doctorId: string) {
  return useQuery({
    queryKey: ["admin-doctor", doctorId],
    queryFn: async () => {
      return apiGet<DoctorProfile>(ADMIN_ENDPOINTS.DOCTOR(doctorId));
    },
    enabled: !!doctorId,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useApproveDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctorId: string) => {
      return apiPatch<DoctorProfile>(
        ADMIN_ENDPOINTS.APPROVE_DOCTOR(doctorId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctor"] });
    },
  });
}

export function useRejectDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctorId: string) => {
      return apiPatch<DoctorProfile>(
        ADMIN_ENDPOINTS.REJECT_DOCTOR(doctorId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctor"] });
    },
  });
}

export function useSuspendDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctorId: string) => {
      return apiPatch<DoctorProfile>(
        ADMIN_ENDPOINTS.SUSPEND_DOCTOR(doctorId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctor"] });
    },
  });
}
