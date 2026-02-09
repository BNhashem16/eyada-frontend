"use client";

import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { PUBLIC_FEEDBACK_ENDPOINTS } from "@/lib/api/endpoints";
import { toastSuccess, toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { AxiosError } from "axios";
import type { ApiError } from "@/types";
import { extractApiError } from "@/lib/utils";

interface SubmitFeedbackData {
  type: "COMPLAINT" | "SUGGESTION";
  name: string;
  email?: string;
  phone?: string;
  content: string;
}

export function useSubmitFeedback() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: SubmitFeedbackData) => {
      const payload: SubmitFeedbackData = {
        type: data.type,
        name: data.name,
        content: data.content,
      };
      if (data.email) payload.email = data.email;
      if (data.phone) payload.phone = data.phone;

      return apiPost(PUBLIC_FEEDBACK_ENDPOINTS.CREATE, payload);
    },
    onSuccess: () => {
      toastSuccess(t("common.success"), t("feedback.success"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("common.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
