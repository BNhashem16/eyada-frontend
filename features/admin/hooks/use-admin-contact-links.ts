"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ContactLink,
  ContactLinkPlatform,
  Multilingual,
  PaginatedResponse,
  ApiError,
} from "@/types";
import { AxiosError } from "axios";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface UseAdminContactLinksOptions {
  page?: number;
  limit?: number;
  search?: string;
  platform?: ContactLinkPlatform;
  isActive?: boolean;
}

export function useAdminContactLinks(
  options: UseAdminContactLinksOptions = {},
) {
  const { page = 1, limit = 10, search, platform, isActive } = options;

  return useQuery({
    queryKey: [
      "admin-contact-links",
      { page, limit, search, platform, isActive },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (platform) params.append("platform", platform);
      if (isActive !== undefined)
        params.append("isActive", isActive.toString());

      return apiGet<PaginatedResponse<ContactLink>>(
        `${ADMIN_ENDPOINTS.CONTACT_LINKS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60 * 5,
  });
}

interface CreateContactLinkData {
  platform: ContactLinkPlatform;
  label: Multilingual;
  value: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function useCreateContactLink() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreateContactLinkData) => {
      return apiPost<ContactLink>(ADMIN_ENDPOINTS.CONTACT_LINKS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-links"] });
      queryClient.invalidateQueries({ queryKey: ["contact-links"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

interface UpdateContactLinkData {
  id: string;
  platform?: ContactLinkPlatform;
  label?: Multilingual;
  value?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function useUpdateContactLink() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateContactLinkData) => {
      return apiPatch<ContactLink>(ADMIN_ENDPOINTS.CONTACT_LINK(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-links"] });
      queryClient.invalidateQueries({ queryKey: ["contact-links"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useDeleteContactLink() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(ADMIN_ENDPOINTS.CONTACT_LINK(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-links"] });
      queryClient.invalidateQueries({ queryKey: ["contact-links"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
