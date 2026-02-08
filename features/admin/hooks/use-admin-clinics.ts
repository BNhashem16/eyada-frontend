"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import { PaginatedResponse } from "@/types";

// ==================== Types ====================

export interface AdminClinic {
  id: string;
  name: { ar: string; en: string };
  address: { ar: string; en: string };
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  doctorProfile: {
    id: string;
    user: {
      id: string;
      fullName: string;
      phoneNumber: string;
      email: string;
    };
    specialty: {
      id: string;
      name: { ar: string; en: string };
    };
  };
  city?: {
    id: string;
    name: { ar: string; en: string };
    state: {
      id: string;
      name: { ar: string; en: string };
    };
  };
  _count?: {
    appointments: number;
    services: number;
    schedules: number;
    secretaryAssignments: number;
  };
}

export interface ClinicStatistics {
  totalClinics: number;
  activeClinics: number;
  inactiveClinics: number;
  bySpecialty: Array<{
    specialtyId: string;
    specialtyName: { ar: string; en: string };
    count: number;
  }>;
  byCity: Array<{
    cityId: string;
    cityName: { ar: string; en: string };
    count: number;
  }>;
}

export interface AdminClinicFilters {
  page?: number;
  limit?: number;
  doctorProfileId?: string;
  cityId?: string;
  stateId?: string;
  specialtyId?: string;
  isActive?: boolean;
  search?: string;
}

// ==================== Hooks ====================

export function useAdminClinics(filters: AdminClinicFilters = {}) {
  const {
    page = 1,
    limit = 30,
    doctorProfileId,
    cityId,
    stateId,
    specialtyId,
    isActive,
    search,
  } = filters;

  return useQuery({
    queryKey: [
      "admin-clinics",
      {
        page,
        limit,
        doctorProfileId,
        cityId,
        stateId,
        specialtyId,
        isActive,
        search,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (doctorProfileId) params.append("doctorProfileId", doctorProfileId);
      if (cityId) params.append("cityId", cityId);
      if (stateId) params.append("stateId", stateId);
      if (specialtyId) params.append("specialtyId", specialtyId);
      if (isActive !== undefined)
        params.append("isActive", isActive.toString());
      if (search) params.append("search", search);

      return apiGet<PaginatedResponse<AdminClinic>>(
        `${ADMIN_ENDPOINTS.CLINICS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminClinic(id: string) {
  return useQuery({
    queryKey: ["admin-clinic", id],
    queryFn: async () => {
      return apiGet<AdminClinic>(ADMIN_ENDPOINTS.CLINIC(id));
    },
    enabled: !!id,
  });
}

export function useAdminClinicStatistics() {
  return useQuery({
    queryKey: ["admin-clinics-statistics"],
    queryFn: async () => {
      return apiGet<ClinicStatistics>(ADMIN_ENDPOINTS.CLINICS_STATISTICS);
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export interface UpdateClinicData {
  isActive?: boolean;
}

export function useUpdateAdminClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateClinicData & { id: string }) => {
      return apiPatch<AdminClinic>(ADMIN_ENDPOINTS.CLINIC(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clinic"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clinics-statistics"] });
    },
  });
}

export function useDeleteAdminClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(ADMIN_ENDPOINTS.CLINIC(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clinics-statistics"] });
    },
  });
}
