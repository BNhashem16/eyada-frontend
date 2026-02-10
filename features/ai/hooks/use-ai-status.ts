"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { AI_ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/auth/store";

export interface AiStatus {
  isEnabled: boolean;
  remainingQuestions: number;
  dailyLimit: number;
}

export function useAiStatus() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["ai-status"],
    queryFn: () => apiGet<AiStatus>(AI_ENDPOINTS.STATUS),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}
