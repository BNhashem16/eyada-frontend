"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { CampaignStatus } from "@/types";
import type {
  PharmacyCampaign,
  UpdateCampaignDto,
  UpdateCampaignStatusDto,
} from "@/types/campaign";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface AdminCampaignFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: CampaignStatus;
}

export function useAdminCampaigns(filters: AdminCampaignFilters = {}) {
  const { page = 1, limit = 10, search, status } = filters;

  return useQuery({
    queryKey: ["admin-pharmacy-campaigns", { page, limit, search, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PharmacyCampaign>>(
        `${ADMIN_PHARMACY_ENDPOINTS.CAMPAIGNS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60,
  });
}

export function useUpdateAdminCampaign() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      campaignId,
      ...data
    }: UpdateCampaignDto & { campaignId: string }) => {
      return apiPatch<PharmacyCampaign>(
        ADMIN_PHARMACY_ENDPOINTS.CAMPAIGN(campaignId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-campaigns"],
      });
      toastSuccess(t("toast.success"), t("toast.updated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useUpdateAdminCampaignStatus() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      campaignId,
      status,
    }: UpdateCampaignStatusDto & { campaignId: string }) => {
      return apiPatch<PharmacyCampaign>(
        ADMIN_PHARMACY_ENDPOINTS.CAMPAIGN_STATUS(campaignId),
        { status },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-campaigns"],
      });
      toastSuccess(t("toast.success"), t("toast.updated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useDeleteAdminCampaign() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      return apiDelete(ADMIN_PHARMACY_ENDPOINTS.CAMPAIGN(campaignId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pharmacy-campaigns"],
      });
      toastSuccess(t("toast.success"), t("toast.deleted"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
