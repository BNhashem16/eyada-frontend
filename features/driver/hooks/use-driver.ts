"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { DRIVER_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type {
  DriverProfile,
  DriverDelivery,
  DriverDeliveryFilters,
} from "@/types/driver";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export function useDriverProfile() {
  return useQuery({
    queryKey: ["driver-profile"],
    queryFn: async () => {
      return apiGet<DriverProfile>(DRIVER_ENDPOINTS.PROFILE);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateDriverProfile() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: {
      vehicleType?: string;
      vehiclePlate?: string;
      licenseNumber?: string;
    }) => {
      return apiPatch(DRIVER_ENDPOINTS.PROFILE, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-profile"] });
      toastSuccess(t("toast.success"), t("driver.profileUpdated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useToggleAvailability() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: { isAvailable: boolean }) => {
      return apiPatch(DRIVER_ENDPOINTS.AVAILABILITY, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-profile"] });
      toastSuccess(t("toast.success"), t("driver.availabilityUpdated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useUpdateLocation() {
  return useMutation({
    mutationFn: async (data: { latitude: number; longitude: number }) => {
      return apiPatch(DRIVER_ENDPOINTS.LOCATION, data);
    },
  });
}

export function useDriverDeliveries(filters: DriverDeliveryFilters = {}) {
  const { page = 1, limit = 10, status } = filters;

  return useQuery({
    queryKey: ["driver-deliveries", { page, limit, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      return apiGet<PaginatedResponse<DriverDelivery>>(
        `${DRIVER_ENDPOINTS.DELIVERIES}?${params.toString()}`,
      );
    },
    refetchInterval: status === "active" ? 30000 : false,
    staleTime: 1000 * 30,
  });
}

export function useDriverDelivery(id: string) {
  return useQuery({
    queryKey: ["driver-delivery", id],
    queryFn: async () => {
      return apiGet<DriverDelivery>(DRIVER_ENDPOINTS.DELIVERY(id));
    },
    enabled: !!id,
    staleTime: 1000 * 30,
  });
}

export function usePickupDelivery() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiPatch(DRIVER_ENDPOINTS.PICKUP_DELIVERY(id), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["driver-delivery"] });
      toastSuccess(t("toast.success"), t("driver.pickedUpSuccess"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useCompleteDelivery() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiPatch(DRIVER_ENDPOINTS.COMPLETE_DELIVERY(id), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["driver-delivery"] });
      toastSuccess(t("toast.success"), t("driver.deliveredSuccess"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
