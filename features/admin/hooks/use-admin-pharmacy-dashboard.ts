"use client";

import { apiGet } from "@/lib/api";
import { ADMIN_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { adminPharmacyKeys } from "@/lib/query-keys";

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
  return usePharmacyQuery<AdminPharmacyDashboardData>({
    queryKey: adminPharmacyKeys.dashboard(),
    queryFn: async () =>
      apiGet<AdminPharmacyDashboardData>(
        ADMIN_PHARMACY_ENDPOINTS.PHARMACY_DASHBOARD,
      ),
  });
}
