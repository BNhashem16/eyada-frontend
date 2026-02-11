"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import { ClinicSchedule } from "@/types";
import { AxiosError } from "axios";
import type { ApiError } from "@/types";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export function useAdminClinicSchedules(clinicId: string) {
  return useQuery({
    queryKey: ["admin-clinic-schedules", clinicId],
    queryFn: async () => {
      return apiGet<ClinicSchedule[]>(
        ADMIN_ENDPOINTS.CLINIC_SCHEDULES(clinicId),
      );
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCreateSchedule() {
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
        ADMIN_ENDPOINTS.CLINIC_SCHEDULES(clinicId),
        data,
      );
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-clinic-schedules", clinicId],
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

export function useAdminUpdateSchedule() {
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
        ADMIN_ENDPOINTS.CLINIC_SCHEDULE(clinicId, scheduleId),
        data,
      );
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-clinic-schedules", clinicId],
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

export function useAdminDeleteSchedule() {
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
      return apiDelete(ADMIN_ENDPOINTS.CLINIC_SCHEDULE(clinicId, scheduleId));
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-clinic-schedules", clinicId],
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
