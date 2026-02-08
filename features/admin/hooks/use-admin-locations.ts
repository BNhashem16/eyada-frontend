"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import { State, City, Multilingual, PaginatedResponse } from "@/types";

export interface AdminStatesFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// States - with filters and pagination
export function useAdminStates(filters: AdminStatesFilters = {}) {
  const { page = 1, limit = 50, search, isActive } = filters;

  return useQuery({
    queryKey: ["admin-states", { page, limit, search, isActive }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (isActive !== undefined)
        params.append("isActive", isActive.toString());

      return apiGet<PaginatedResponse<State>>(
        `${ADMIN_ENDPOINTS.STATES}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60 * 5,
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
      queryClient.invalidateQueries({ queryKey: ["admin-states"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-states"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-states"] });
    },
  });
}

export interface AdminCitiesFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  stateId?: string;
}

// Cities - with filters and pagination
export function useAdminCities(filters: AdminCitiesFilters = {}) {
  const { page = 1, limit = 50, search, isActive, stateId } = filters;

  return useQuery({
    queryKey: ["admin-cities", { page, limit, search, isActive, stateId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (isActive !== undefined)
        params.append("isActive", isActive.toString());
      if (stateId) params.append("stateId", stateId);

      return apiGet<PaginatedResponse<City>>(
        `${ADMIN_ENDPOINTS.CITIES}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60 * 5,
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
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
    },
  });
}
