"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { PUBLIC_ENDPOINTS } from "@/lib/api/endpoints";
import { State, City, PaginatedResponse } from "@/types";

export interface PublicStatesFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export function usePublicStates(filters: PublicStatesFilters = {}) {
  const { search, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ["public-states", { search, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      return apiGet<PaginatedResponse<State>>(
        `${PUBLIC_ENDPOINTS.STATES}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60 * 5,
  });
}

export interface PublicCitiesFilters {
  stateId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function usePublicCities(filters: PublicCitiesFilters = {}) {
  const { stateId, search, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ["public-cities", { stateId, search, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (stateId) params.append("stateId", stateId);

      return apiGet<PaginatedResponse<City>>(
        `${PUBLIC_ENDPOINTS.CITIES}?${params.toString()}`,
      );
    },
    enabled: !!stateId,
    staleTime: 1000 * 60 * 5,
  });
}
