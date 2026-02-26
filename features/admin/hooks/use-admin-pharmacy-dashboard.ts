"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { ADMIN_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";

export interface AdminPharmacyDashboardData {
  totalPharmacies: number;
  activePharmacies: number;
  pendingPharmacies: number;
  totalProducts: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalRevenue: number;
  totalCommission: number;
  topPharmacies: Array<{
    id: string;
    name: { ar: string; en: string };
    _count: { orders: number; products: number };
  }>;
}

export function useAdminPharmacyDashboard() {
  return useQuery({
    queryKey: ["admin-pharmacy-dashboard"],
    queryFn: async () => {
      return apiGet<AdminPharmacyDashboardData>(
        ADMIN_PHARMACY_ENDPOINTS.PHARMACY_DASHBOARD,
      );
    },
    staleTime: 1000 * 60,
  });
}
