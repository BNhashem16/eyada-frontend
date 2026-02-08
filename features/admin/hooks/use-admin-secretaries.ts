"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import { PaginatedResponse } from "@/types";

// ==================== Types ====================

export interface AdminSecretary {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  assignments?: SecretaryAssignment[];
}

export interface SecretaryAssignment {
  id: string;
  isActive: boolean;
  createdAt: string;
  clinic: {
    id: string;
    name: { ar: string; en: string };
    doctorProfile: {
      id: string;
      user: {
        id: string;
        fullName: string;
      };
    };
  };
}

// Raw API response type (clinicSecretary records with user nested)
interface RawSecretaryAssignment {
  id: string;
  isActive: boolean;
  createdAt: string;
  clinic: {
    id: string;
    name: { ar: string; en: string };
    doctorProfile: {
      id: string;
      user: {
        id: string;
        fullName: string;
      };
    };
  };
  user: {
    id: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
}

export interface AdminSecretaryFilters {
  page?: number;
  limit?: number;
  search?: string;
  doctorUserId?: string;
  clinicId?: string;
  isActive?: boolean;
}

export interface CreateSecretaryData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  clinicId: string;
}

export interface AssignSecretaryData {
  secretaryUserId: string;
  clinicId: string;
}

export interface UpdateSecretaryData {
  fullName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

// Transform raw API response to group by secretary
function transformSecretariesResponse(
  rawData: RawSecretaryAssignment[],
): AdminSecretary[] {
  const secretariesMap = new Map<string, AdminSecretary>();

  for (const assignment of rawData) {
    const userId = assignment.user.id;

    if (!secretariesMap.has(userId)) {
      secretariesMap.set(userId, {
        id: userId,
        fullName: assignment.user.fullName,
        email: assignment.user.email,
        phoneNumber: assignment.user.phoneNumber,
        isActive: assignment.user.isActive,
        createdAt: assignment.user.createdAt,
        assignments: [],
      });
    }

    secretariesMap.get(userId)!.assignments!.push({
      id: assignment.id,
      isActive: assignment.isActive,
      createdAt: assignment.createdAt,
      clinic: assignment.clinic,
    });
  }

  return Array.from(secretariesMap.values());
}

// ==================== Hooks ====================

export function useAdminSecretaries(filters: AdminSecretaryFilters = {}) {
  const {
    page = 1,
    limit = 30,
    search,
    doctorUserId,
    clinicId,
    isActive,
  } = filters;

  return useQuery({
    queryKey: [
      "admin-secretaries",
      {
        page,
        limit,
        search,
        doctorUserId,
        clinicId,
        isActive,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (search) params.append("search", search);
      if (doctorUserId) params.append("doctorUserId", doctorUserId);
      if (clinicId) params.append("clinicId", clinicId);
      if (isActive !== undefined)
        params.append("isActive", isActive.toString());

      const response = await apiGet<PaginatedResponse<RawSecretaryAssignment>>(
        `${ADMIN_ENDPOINTS.SECRETARIES}?${params.toString()}`,
      );

      // Transform the data to group by secretary
      const transformedData = transformSecretariesResponse(response.data);

      return {
        data: transformedData,
        meta: {
          ...response.meta,
          total: transformedData.length,
        },
      };
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCreateAdminSecretary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSecretaryData) => {
      return apiPost<AdminSecretary>(ADMIN_ENDPOINTS.SECRETARIES, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-secretaries"] });
    },
  });
}

export function useAssignSecretary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignSecretaryData) => {
      return apiPost<SecretaryAssignment>(
        ADMIN_ENDPOINTS.ASSIGN_SECRETARY,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-secretaries"] });
    },
  });
}

export function useUpdateAdminSecretary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateSecretaryData & { id: string }) => {
      return apiPatch<AdminSecretary>(ADMIN_ENDPOINTS.SECRETARY(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-secretaries"] });
    },
  });
}

export function useRemoveSecretaryAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      return apiDelete(ADMIN_ENDPOINTS.SECRETARY_ASSIGNMENT(assignmentId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-secretaries"] });
    },
  });
}
