"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api";
import { AI_ENDPOINTS } from "@/lib/api/endpoints";
import { toastSuccess, toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { AxiosError } from "axios";
import type { ApiError } from "@/types";
import { extractApiError } from "@/lib/utils";

export interface AiSettings {
  id: string;
  isEnabled: boolean;
  hasApiKey: boolean;
  apiKeyPreview: string | null;
  dailyLimit: number;
  systemPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAiSettingsData {
  isEnabled?: boolean;
  apiKey?: string;
  dailyLimit?: number;
  systemPrompt?: string;
}

export function useAiSettings() {
  return useQuery({
    queryKey: ["admin-ai-settings"],
    queryFn: () => apiGet<AiSettings>(AI_ENDPOINTS.ADMIN_SETTINGS),
  });
}

export function useUpdateAiSettings() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: UpdateAiSettingsData) =>
      apiPatch<AiSettings>(AI_ENDPOINTS.ADMIN_SETTINGS, data),
    onSuccess: () => {
      toastSuccess(t("common.success"), t("ai.settingsUpdated"));
      queryClient.invalidateQueries({ queryKey: ["admin-ai-settings"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("common.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
