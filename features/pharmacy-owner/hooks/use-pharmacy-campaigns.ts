"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { PHARMACY_OWNER_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { CampaignStatus } from "@/types";
import type {
  PharmacyCampaign,
  CreateCampaignDto,
  UpdateCampaignDto,
  UpdateCampaignStatusDto,
} from "@/types/campaign";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { pharmacyCampaignKeys } from "@/lib/query-keys";

export interface CampaignFilters {
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}

export function usePharmacyCampaigns(
  pharmacyId: string,
  filters: CampaignFilters = {},
) {
  const { status, page = 1, limit = 10 } = filters;

  return usePharmacyQuery<PaginatedResponse<PharmacyCampaign>>({
    queryKey: pharmacyCampaignKeys.list(pharmacyId, { status, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<PharmacyCampaign>>(
        `${PHARMACY_OWNER_ENDPOINTS.CAMPAIGNS(pharmacyId)}?${params.toString()}`,
      );
    },
    enabled: !!pharmacyId,
  });
}

export function usePharmacyCampaign(pharmacyId: string, campaignId: string) {
  return usePharmacyQuery<PharmacyCampaign>({
    queryKey: pharmacyCampaignKeys.detail(pharmacyId, campaignId),
    queryFn: async () =>
      apiGet<PharmacyCampaign>(
        PHARMACY_OWNER_ENDPOINTS.CAMPAIGN(pharmacyId, campaignId),
      ),
    enabled: !!pharmacyId && !!campaignId,
  });
}

export function useCreateCampaign(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreateCampaignDto) => {
      return apiPost<PharmacyCampaign>(
        PHARMACY_OWNER_ENDPOINTS.CAMPAIGNS(pharmacyId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pharmacyCampaignKeys.lists(pharmacyId),
      });
      toastSuccess(t("toast.success"), t("toast.created"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useUpdateCampaign(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      campaignId,
      ...data
    }: UpdateCampaignDto & { campaignId: string }) => {
      return apiPatch<PharmacyCampaign>(
        PHARMACY_OWNER_ENDPOINTS.CAMPAIGN(pharmacyId, campaignId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pharmacyCampaignKeys.lists(pharmacyId),
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

export function useUpdateCampaignStatus(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      campaignId,
      status,
    }: UpdateCampaignStatusDto & { campaignId: string }) => {
      return apiPatch<PharmacyCampaign>(
        PHARMACY_OWNER_ENDPOINTS.CAMPAIGN_STATUS(pharmacyId, campaignId),
        { status },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pharmacyCampaignKeys.lists(pharmacyId),
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

export function useDeleteCampaign(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      return apiDelete(
        PHARMACY_OWNER_ENDPOINTS.CAMPAIGN(pharmacyId, campaignId),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pharmacyCampaignKeys.lists(pharmacyId),
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
