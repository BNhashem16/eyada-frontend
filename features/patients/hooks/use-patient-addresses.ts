"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { PATIENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError } from "@/types";
import type {
  PatientAddress,
  CreatePatientAddressDto,
  UpdatePatientAddressDto,
} from "@/types/address";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export function usePatientAddresses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["patient-addresses"],
    queryFn: async () => {
      return apiGet<PatientAddress[]>(PATIENT_ENDPOINTS.ADDRESSES);
    },
    staleTime: 1000 * 60,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreatePatientAddressDto) => {
      return apiPost<PatientAddress>(PATIENT_ENDPOINTS.ADDRESSES, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-addresses"] });
      toastSuccess(t("toast.success"), t("addresses.addressCreated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      addressId,
      ...data
    }: UpdatePatientAddressDto & { addressId: string }) => {
      return apiPatch<PatientAddress>(
        PATIENT_ENDPOINTS.ADDRESS(addressId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-addresses"] });
      toastSuccess(t("toast.success"), t("addresses.addressUpdated"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (addressId: string) => {
      return apiDelete(PATIENT_ENDPOINTS.ADDRESS(addressId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-addresses"] });
      toastSuccess(t("toast.success"), t("addresses.addressDeleted"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (addressId: string) => {
      return apiPatch<PatientAddress>(
        PATIENT_ENDPOINTS.ADDRESS_SET_DEFAULT(addressId),
        {},
      );
    },
    onMutate: async (addressId: string) => {
      await queryClient.cancelQueries({ queryKey: ["patient-addresses"] });
      const previous = queryClient.getQueryData<PatientAddress[]>([
        "patient-addresses",
      ]);
      if (previous) {
        queryClient.setQueryData<PatientAddress[]>(
          ["patient-addresses"],
          previous.map((addr) => ({
            ...addr,
            isDefault: addr.id === addressId,
          })),
        );
      }
      return { previous };
    },
    onError: (error: AxiosError<ApiError>, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["patient-addresses"], context.previous);
      }
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
    onSuccess: () => {
      toastSuccess(t("toast.success"), t("addresses.defaultAddressSet"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-addresses"] });
    },
  });
}
