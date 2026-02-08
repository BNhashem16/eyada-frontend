"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import { PaginatedResponse } from "@/types";
import { toastSuccess, toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { AxiosError } from "axios";
import type { ApiError } from "@/types";

// ==================== Types ====================

export type FeedbackType = "COMPLAINT" | "SUGGESTION";
export type FeedbackStatus = "NEW" | "IN_REVIEW" | "RESOLVED" | "REJECTED";

export interface AdminFeedback {
  id: string;
  type: FeedbackType;
  name: string;
  email: string | null;
  phone: string | null;
  content: string;
  status: FeedbackStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFeedbackFilters {
  page?: number;
  limit?: number;
  type?: FeedbackType;
  status?: FeedbackStatus;
}

// ==================== Hooks ====================

export function useAdminFeedbacks(filters: AdminFeedbackFilters = {}) {
  const { page = 1, limit = 10, type, status } = filters;

  return useQuery({
    queryKey: ["admin-feedbacks", { page, limit, type, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (type) params.append("type", type);
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<AdminFeedback>>(
        `${ADMIN_ENDPOINTS.FEEDBACKS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 30,
  });
}

export function useAdminFeedback(id: string) {
  return useQuery({
    queryKey: ["admin-feedback", id],
    queryFn: async () => {
      return apiGet<AdminFeedback>(ADMIN_ENDPOINTS.FEEDBACK(id));
    },
    enabled: !!id,
  });
}

export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: FeedbackStatus;
      adminNotes?: string;
    }) => {
      return apiPatch<AdminFeedback>(ADMIN_ENDPOINTS.FEEDBACK_STATUS(id), {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
      });
    },
    onSuccess: () => {
      toastSuccess(t("common.success"), t("admin.feedbacks.updateStatus"));
      queryClient.invalidateQueries({ queryKey: ["admin-feedbacks"] });
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || t("common.error");
      toastError(
        t("common.error"),
        Array.isArray(message) ? message[0] : message,
      );
    },
  });
}
