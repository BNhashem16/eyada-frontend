"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { SECRETARY_ENDPOINTS } from "@/lib/api/endpoints";
import { ClinicSchedule, ApiError } from "@/types";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export function useSecretaryClinicSchedules(clinicId: string) {
  return useQuery({
    queryKey: ["secretary-clinic-schedules", clinicId],
    queryFn: async () => {
      return apiGet<ClinicSchedule[]>(
        SECRETARY_ENDPOINTS.CLINIC_SCHEDULES(clinicId),
      );
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSecretaryCreateSchedule() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      clinicId,
      data,
    }: {
      clinicId: string;
      data: Partial<ClinicSchedule>;
    }) => {
      return apiPost<ClinicSchedule>(
        SECRETARY_ENDPOINTS.CLINIC_SCHEDULES(clinicId),
        data,
      );
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({
        queryKey: ["secretary-clinic-schedules", clinicId],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useSecretaryUpdateSchedule() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      clinicId,
      scheduleId,
      data,
    }: {
      clinicId: string;
      scheduleId: string;
      data: Partial<ClinicSchedule>;
    }) => {
      return apiPatch<ClinicSchedule>(
        SECRETARY_ENDPOINTS.CLINIC_SCHEDULE(clinicId, scheduleId),
        data,
      );
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({
        queryKey: ["secretary-clinic-schedules", clinicId],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useSecretaryDeleteSchedule() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      clinicId,
      scheduleId,
    }: {
      clinicId: string;
      scheduleId: string;
    }) => {
      return apiDelete(
        SECRETARY_ENDPOINTS.CLINIC_SCHEDULE(clinicId, scheduleId),
      );
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({
        queryKey: ["secretary-clinic-schedules", clinicId],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}
