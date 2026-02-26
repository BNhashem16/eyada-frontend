"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { PHARMACY_OWNER_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError, PaginatedResponse } from "@/types";
import type { DriverProfile } from "@/types/driver";
import { DriverStatus } from "@/types/enums";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface PharmacyDriverFilters {
  page?: number;
  limit?: number;
  status?: DriverStatus;
  search?: string;
}

export function usePharmacyDrivers(
  pharmacyId: string,
  filters: PharmacyDriverFilters = {},
) {
  const { page = 1, limit = 10, status, search } = filters;

  return useQuery({
    queryKey: ["pharmacy-drivers", pharmacyId, { page, limit, status, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);
      if (search) params.append("search", search);

      return apiGet<PaginatedResponse<DriverProfile>>(
        `${PHARMACY_OWNER_ENDPOINTS.DRIVERS(pharmacyId)}?${params.toString()}`,
      );
    },
    enabled: !!pharmacyId,
    staleTime: 1000 * 60,
  });
}

export function useCreatePharmacyDriver(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      email: string;
      phoneNumber: string;
      password: string;
      vehicleType?: string;
      vehiclePlate?: string;
      licenseNumber?: string;
    }) => {
      return apiPost(PHARMACY_OWNER_ENDPOINTS.DRIVERS(pharmacyId), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pharmacy-drivers", pharmacyId],
      });
      toastSuccess(
        t("toast.success"),
        t("pharmacyOwner.drivers.driverCreated"),
      );
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useApprovePharmacyDriver(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (driverId: string) => {
      return apiPatch(
        PHARMACY_OWNER_ENDPOINTS.APPROVE_DRIVER(pharmacyId, driverId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pharmacy-drivers", pharmacyId],
      });
      toastSuccess(
        t("toast.success"),
        t("pharmacyOwner.drivers.approvedSuccess"),
      );
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useRejectPharmacyDriver(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (driverId: string) => {
      return apiPatch(
        PHARMACY_OWNER_ENDPOINTS.REJECT_DRIVER(pharmacyId, driverId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pharmacy-drivers", pharmacyId],
      });
      toastSuccess(
        t("toast.success"),
        t("pharmacyOwner.drivers.rejectedSuccess"),
      );
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useSuspendPharmacyDriver(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (driverId: string) => {
      return apiPatch(
        PHARMACY_OWNER_ENDPOINTS.SUSPEND_DRIVER(pharmacyId, driverId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pharmacy-drivers", pharmacyId],
      });
      toastSuccess(
        t("toast.success"),
        t("pharmacyOwner.drivers.suspendedSuccess"),
      );
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useActivatePharmacyDriver(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (driverId: string) => {
      return apiPatch(
        PHARMACY_OWNER_ENDPOINTS.ACTIVATE_DRIVER(pharmacyId, driverId),
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pharmacy-drivers", pharmacyId],
      });
      toastSuccess(
        t("toast.success"),
        t("pharmacyOwner.drivers.activatedSuccess"),
      );
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useAvailableDrivers(pharmacyId: string, orderId: string) {
  return useQuery({
    queryKey: ["available-drivers", pharmacyId, orderId],
    queryFn: async () => {
      return apiGet<DriverProfile[]>(
        PHARMACY_OWNER_ENDPOINTS.AVAILABLE_DRIVERS(pharmacyId, orderId),
      );
    },
    enabled: !!pharmacyId && !!orderId,
    staleTime: 1000 * 30,
  });
}

export function useAssignDriver(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      orderId,
      driverProfileId,
    }: {
      orderId: string;
      driverProfileId: string;
    }) => {
      return apiPost(
        PHARMACY_OWNER_ENDPOINTS.ASSIGN_DRIVER(pharmacyId, orderId),
        { driverProfileId },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-orders"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-order"] });
      toastSuccess(
        t("toast.success"),
        t("pharmacyOwner.drivers.driverAssigned"),
      );
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useReassignDriver(pharmacyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      orderId,
      driverProfileId,
    }: {
      orderId: string;
      driverProfileId: string;
    }) => {
      return apiPatch(
        PHARMACY_OWNER_ENDPOINTS.REASSIGN_DRIVER(pharmacyId, orderId),
        { driverProfileId },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-orders"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-order"] });
      toastSuccess(
        t("toast.success"),
        t("pharmacyOwner.drivers.driverReassigned"),
      );
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
