'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { SECRETARY_ENDPOINTS } from '@/lib/api/endpoints';
import { Appointment, Clinic, PaginatedResponse } from '@/types';
import { AppointmentStatus, PaymentStatus } from '@/types/enums';

interface UseSecretaryAppointmentsOptions {
  clinicId?: string;
  date?: string;
  status?: AppointmentStatus;
  page?: number;
  limit?: number;
}

export function useSecretaryAppointments({
  clinicId,
  date,
  status,
  page = 1,
  limit = 20,
}: UseSecretaryAppointmentsOptions = {}) {
  return useQuery({
    queryKey: ['secretary-appointments', clinicId, date, status, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (clinicId) params.append('clinicId', clinicId);
      if (date) params.append('date', date);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const url = `${SECRETARY_ENDPOINTS.APPOINTMENTS}?${params.toString()}`;
      return apiGet<PaginatedResponse<Appointment>>(url);
    },
    staleTime: 1000 * 30, // 30 seconds - appointments change frequently
  });
}

export function useSecretaryAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ['secretary-appointment', appointmentId],
    queryFn: async () => {
      return apiGet<Appointment>(SECRETARY_ENDPOINTS.APPOINTMENT(appointmentId));
    },
    enabled: !!appointmentId,
    staleTime: 1000 * 30,
  });
}

export function useSecretaryClinics() {
  return useQuery({
    queryKey: ['secretary-clinics'],
    queryFn: async () => {
      return apiGet<Clinic[]>(SECRETARY_ENDPOINTS.CLINICS);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

interface BookAppointmentData {
  clinicId: string;
  serviceTypeId: string;
  patientProfileId?: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  symptoms?: string;
  patientName?: string;
  patientPhone?: string;
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookAppointmentData) => {
      return apiPost<Appointment>(SECRETARY_ENDPOINTS.APPOINTMENTS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secretary-appointments'] });
    },
  });
}

interface UpdateAppointmentStatusData {
  appointmentId: string;
  status: AppointmentStatus;
  cancellationReason?: string;
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, ...data }: UpdateAppointmentStatusData) => {
      return apiPatch<Appointment>(
        SECRETARY_ENDPOINTS.APPOINTMENT_STATUS(appointmentId),
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secretary-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['secretary-appointment'] });
    },
  });
}

interface UpdatePaymentData {
  appointmentId: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'CASH' | 'CARD' | 'INSURANCE';
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, ...data }: UpdatePaymentData) => {
      return apiPatch<Appointment>(
        SECRETARY_ENDPOINTS.APPOINTMENT_PAYMENT(appointmentId),
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secretary-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['secretary-appointment'] });
    },
  });
}
