"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import type { AdminDashboardStatistics } from "@/types/dashboard";

export function useAdminDashboardStatistics() {
  return useQuery({
    queryKey: ["admin-dashboard-statistics"],
    queryFn: async () => {
      return apiGet<AdminDashboardStatistics>(
        ADMIN_ENDPOINTS.DASHBOARD_STATISTICS,
      );
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}
