"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { PUBLIC_ENDPOINTS } from "@/lib/api/endpoints";
import { PaymentMethodModel } from "@/types";

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      return apiGet<PaymentMethodModel[]>(PUBLIC_ENDPOINTS.PAYMENT_METHODS);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
