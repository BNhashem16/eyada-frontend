"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { AI_ENDPOINTS } from "@/lib/api/endpoints";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { AxiosError } from "axios";
import type { ApiError } from "@/types";
import { extractApiError } from "@/lib/utils";

export interface AiConversation {
  id: string;
  question: string;
  answer: string;
  language: string;
  createdAt: string;
}

export interface AiChatResponse {
  id: string;
  question: string;
  answer: string;
  remainingQuestions: number;
  dailyLimit: number;
  createdAt: string;
}

interface ConversationsResponse {
  data: AiConversation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useAiConversations(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["ai-conversations", { page, limit }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      return apiGet<ConversationsResponse>(
        `${AI_ENDPOINTS.CONVERSATIONS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 30,
  });
}

export function useSendAiMessage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: { message: string; language?: "ar" | "en" }) => {
      return apiPost<AiChatResponse>(AI_ENDPOINTS.CHAT, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["ai-status"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("common.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
