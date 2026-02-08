"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { SECRETARY_ENDPOINTS } from "@/lib/api/endpoints";
import { Appointment, Clinic, PaginatedResponse } from "@/types";
import { AppointmentStatus, PaymentStatus } from "@/types/enums";

// Extended filters matching Swagger spec
export interface UseSecretaryAppointmentsOptions {
  clinicId?: string;
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  date?: string; // Single date filter
  dateFrom?: string; // Date range start
  dateTo?: string; // Date range end
  search?: string; // Search by patient name or booking number
  serviceTypeId?: string;
  upcoming?: boolean; // Only show upcoming appointments
  page?: number;
  limit?: number;
}

export function useSecretaryAppointments({
  clinicId,
  status,
  paymentStatus,
  date,
  dateFrom,
  dateTo,
  search,
  serviceTypeId,
  upcoming,
  page = 1,
  limit = 20,
}: UseSecretaryAppointmentsOptions = {}) {
  return useQuery({
    queryKey: [
      "secretary-appointments",
      {
        clinicId,
        status,
        paymentStatus,
        date,
        dateFrom,
        dateTo,
        search,
        serviceTypeId,
        upcoming,
        page,
        limit,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (clinicId) params.append("clinicId", clinicId);
      if (status) params.append("status", status);
      if (paymentStatus) params.append("paymentStatus", paymentStatus);
      if (date) params.append("date", date);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (search) params.append("search", search);
      if (serviceTypeId) params.append("serviceTypeId", serviceTypeId);
      if (upcoming !== undefined)
        params.append("upcoming", upcoming.toString());
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const url = `${SECRETARY_ENDPOINTS.APPOINTMENTS}?${params.toString()}`;
      return apiGet<PaginatedResponse<Appointment>>(url);
    },
    staleTime: 1000 * 30, // 30 seconds - appointments change frequently
  });
}

export function useSecretaryAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ["secretary-appointment", appointmentId],
    queryFn: async () => {
      return apiGet<Appointment>(
        SECRETARY_ENDPOINTS.APPOINTMENT(appointmentId),
      );
    },
    enabled: !!appointmentId,
    staleTime: 1000 * 30,
  });
}

export function useSecretaryClinics() {
  return useQuery({
    queryKey: ["secretary-clinics"],
    queryFn: async () => {
      return apiGet<Clinic[]>(SECRETARY_ENDPOINTS.CLINICS);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create appointment for patient - per Swagger CreateSecretaryAppointmentDto
export interface CreateSecretaryAppointmentData {
  clinicId: string; // UUID, required
  serviceTypeId: string; // UUID, required
  appointmentDate: string; // YYYY-MM-DD format, required
  patientName: string; // 2-100 chars, required
  patientDateOfBirth: string; // YYYY-MM-DD format, required
  patientPhone?: string; // optional
  notes?: string; // max 500 chars
  symptoms?: string; // max 500 chars
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSecretaryAppointmentData) => {
      return apiPost<Appointment>(SECRETARY_ENDPOINTS.APPOINTMENTS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secretary-appointments"] });
    },
  });
}

// Alias for backward compatibility
export const useBookAppointment = useCreateAppointment;

interface UpdateAppointmentStatusData {
  appointmentId: string;
  status: AppointmentStatus;
  cancellationReason?: string;
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      ...data
    }: UpdateAppointmentStatusData) => {
      return apiPatch<Appointment>(
        SECRETARY_ENDPOINTS.APPOINTMENT_STATUS(appointmentId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secretary-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["secretary-appointment"] });
    },
  });
}

interface UpdatePaymentData {
  appointmentId: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: "CASH" | "CARD" | "INSURANCE";
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, ...data }: UpdatePaymentData) => {
      return apiPatch<Appointment>(
        SECRETARY_ENDPOINTS.APPOINTMENT_PAYMENT(appointmentId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secretary-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["secretary-appointment"] });
    },
  });
}
