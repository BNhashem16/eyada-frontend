"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { PHARMACY_OWNER_ENDPOINTS } from "@/lib/api/endpoints";

export interface PharmacyOwnerDashboardData {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalRevenue: number;
  wallet: {
    balance: number;
    totalEarned: number;
    totalSettled: number;
  } | null;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
  topProducts: Array<{
    productId: string;
    name: { ar: string; en: string } | null;
    totalQuantity: number;
  }>;
}

export function usePharmacyOwnerDashboard(pharmacyId: string) {
  return useQuery({
    queryKey: ["pharmacy-owner-dashboard", pharmacyId],
    queryFn: async () => {
      return apiGet<PharmacyOwnerDashboardData>(
        PHARMACY_OWNER_ENDPOINTS.DASHBOARD(pharmacyId),
      );
    },
    enabled: !!pharmacyId,
    staleTime: 1000 * 60,
  });
}
