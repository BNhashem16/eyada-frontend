"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPatch } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError } from "@/types";
import { PaginatedResponse } from "@/types";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

// ==================== Types ====================

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";

export interface AdminAppointment {
  id: string;
  bookingNumber: string;
  appointmentDate: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  price: number;
  queueNumber: number | null;
  patientName: string;
  patientAge: number | null;
  serviceName: { ar: string; en: string };
  cancellationReason: string | null;
  createdAt: string;
  completedAt: string | null;
  bookedForPatient?: {
    id: string;
    user: {
      id: string;
      fullName: string;
      phoneNumber: string;
      email: string;
    };
  };
  bookedByUser?: {
    id: string;
    fullName: string;
  };
  clinic?: {
    id: string;
    name: { ar: string; en: string };
    phone: string;
    doctorProfile: {
      id: string;
      user: {
        id: string;
        fullName: string;
        phoneNumber: string;
      };
      specialty: {
        id: string;
        name: { ar: string; en: string };
      };
    };
    city?: {
      id: string;
      name: { ar: string; en: string };
      state: {
        id: string;
        name: { ar: string; en: string };
      };
    };
  };
  serviceType?: {
    id: string;
    name: { ar: string; en: string };
    price: number;
    duration: number;
  };
  cancelledBy?: {
    id: string;
    fullName: string;
  };
}

export interface AppointmentStatistics {
  totalAppointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  pending: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  byStatus: Array<{ status: string; count: number }>;
  byPaymentStatus: Array<{ status: string; count: number }>;
}

export interface AdminAppointmentFilters {
  page?: number;
  limit?: number;
  clinicId?: string;
  doctorProfileId?: string;
  patientProfileId?: string;
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  serviceTypeId?: string;
  specialtyId?: string;
}

// ==================== Hooks ====================

export function useAdminAppointments(filters: AdminAppointmentFilters = {}) {
  const {
    page = 1,
    limit = 30,
    clinicId,
    doctorProfileId,
    patientProfileId,
    status,
    paymentStatus,
    date,
    dateFrom,
    dateTo,
    search,
    serviceTypeId,
    specialtyId,
  } = filters;

  return useQuery({
    queryKey: [
      "admin-appointments",
      {
        page,
        limit,
        clinicId,
        doctorProfileId,
        patientProfileId,
        status,
        paymentStatus,
        date,
        dateFrom,
        dateTo,
        search,
        serviceTypeId,
        specialtyId,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (clinicId) params.append("clinicId", clinicId);
      if (doctorProfileId) params.append("doctorProfileId", doctorProfileId);
      if (patientProfileId) params.append("patientProfileId", patientProfileId);
      if (status) params.append("status", status);
      if (paymentStatus) params.append("paymentStatus", paymentStatus);
      if (date) params.append("date", date);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (search) params.append("search", search);
      if (serviceTypeId) params.append("serviceTypeId", serviceTypeId);
      if (specialtyId) params.append("specialtyId", specialtyId);

      return apiGet<PaginatedResponse<AdminAppointment>>(
        `${ADMIN_ENDPOINTS.APPOINTMENTS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminAppointment(id: string) {
  return useQuery({
    queryKey: ["admin-appointment", id],
    queryFn: async () => {
      return apiGet<AdminAppointment>(ADMIN_ENDPOINTS.APPOINTMENT(id));
    },
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminAppointmentStatistics(
  filters: AdminAppointmentFilters = {},
) {
  const { dateFrom, dateTo } = filters;

  return useQuery({
    queryKey: ["admin-appointments-statistics", { dateFrom, dateTo }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      return apiGet<AppointmentStatistics>(
        `${ADMIN_ENDPOINTS.APPOINTMENTS_STATISTICS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export interface UpdateAppointmentData {
  status?: AppointmentStatus;
  cancellationReason?: string;
  paymentStatus?: PaymentStatus;
}

export function useUpdateAdminAppointment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateAppointmentData & { id: string }) => {
      return apiPatch<AdminAppointment>(ADMIN_ENDPOINTS.APPOINTMENT(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-appointment"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-appointments-statistics"],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(t("toast.error"), extractApiError(error, t("errors.somethingWentWrong")));
    },
  });
}
