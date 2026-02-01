'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { DOCTOR_ENDPOINTS } from '@/lib/api/endpoints';
import {
  DoctorProfile,
  Clinic,
  ClinicSchedule,
  ClinicServiceType,
  Appointment,
  PaginatedResponse,
  Rating,
} from '@/types';
import { AppointmentStatus, PaymentStatus } from '@/types/enums';

// Profile hooks
export function useDoctorProfile() {
  return useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      return apiGet<DoctorProfile>(DOCTOR_ENDPOINTS.PROFILE);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<DoctorProfile>) => {
      return apiPatch<DoctorProfile>(DOCTOR_ENDPOINTS.UPDATE_PROFILE, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
    },
  });
}

// Create profile for new doctors
export function useCreateDoctorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<DoctorProfile> & { specialtyId: string }) => {
      return apiPost<DoctorProfile>(DOCTOR_ENDPOINTS.UPDATE_PROFILE, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
    },
  });
}

// Clinics hooks
export function useDoctorClinics() {
  return useQuery({
    queryKey: ['doctor-clinics'],
    queryFn: async () => {
      return apiGet<Clinic[]>(DOCTOR_ENDPOINTS.CLINICS);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useDoctorClinic(clinicId: string) {
  return useQuery({
    queryKey: ['doctor-clinic', clinicId],
    queryFn: async () => {
      return apiGet<Clinic>(`${DOCTOR_ENDPOINTS.CLINICS}/${clinicId}`);
    },
    enabled: !!clinicId,
  });
}

export function useCreateClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Clinic>) => {
      return apiPost<Clinic>(DOCTOR_ENDPOINTS.CLINICS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinics'] });
    },
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clinicId, data }: { clinicId: string; data: Partial<Clinic> }) => {
      return apiPatch<Clinic>(`${DOCTOR_ENDPOINTS.CLINICS}/${clinicId}`, data);
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinics'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-clinic', clinicId] });
    },
  });
}

export function useToggleClinicActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clinicId: string) => {
      return apiPatch<Clinic>(DOCTOR_ENDPOINTS.CLINIC_TOGGLE_ACTIVE(clinicId), {});
    },
    onSuccess: (_, clinicId) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinics'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-clinic', clinicId] });
    },
  });
}

// Schedules hooks
export function useClinicSchedules(clinicId: string) {
  return useQuery({
    queryKey: ['doctor-clinic-schedules', clinicId],
    queryFn: async () => {
      return apiGet<ClinicSchedule[]>(`${DOCTOR_ENDPOINTS.CLINICS}/${clinicId}/schedules`);
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clinicId, data }: { clinicId: string; data: Partial<ClinicSchedule> }) => {
      return apiPost<ClinicSchedule>(`${DOCTOR_ENDPOINTS.CLINICS}/${clinicId}/schedules`, data);
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinic-schedules', clinicId] });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

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
        `${DOCTOR_ENDPOINTS.CLINICS}/${clinicId}/schedules/${scheduleId}`,
        data
      );
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinic-schedules', clinicId] });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clinicId, scheduleId }: { clinicId: string; scheduleId: string }) => {
      return apiDelete(`${DOCTOR_ENDPOINTS.CLINICS}/${clinicId}/schedules/${scheduleId}`);
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinic-schedules', clinicId] });
    },
  });
}

// Services hooks
export function useClinicServices(clinicId: string) {
  return useQuery({
    queryKey: ['doctor-clinic-services', clinicId],
    queryFn: async () => {
      return apiGet<ClinicServiceType[]>(`${DOCTOR_ENDPOINTS.CLINICS}/${clinicId}/services`);
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clinicId,
      data,
    }: {
      clinicId: string;
      data: Partial<ClinicServiceType>;
    }) => {
      return apiPost<ClinicServiceType>(`${DOCTOR_ENDPOINTS.CLINICS}/${clinicId}/services`, data);
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinic-services', clinicId] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clinicId,
      serviceId,
      data,
    }: {
      clinicId: string;
      serviceId: string;
      data: Partial<ClinicServiceType>;
    }) => {
      return apiPatch<ClinicServiceType>(
        `${DOCTOR_ENDPOINTS.CLINICS}/${clinicId}/services/${serviceId}`,
        data
      );
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinic-services', clinicId] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clinicId, serviceId }: { clinicId: string; serviceId: string }) => {
      return apiDelete(`${DOCTOR_ENDPOINTS.CLINICS}/${clinicId}/services/${serviceId}`);
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinic-services', clinicId] });
    },
  });
}

export function useToggleServiceActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clinicId, serviceId }: { clinicId: string; serviceId: string }) => {
      return apiPatch<ClinicServiceType>(
        DOCTOR_ENDPOINTS.CLINIC_SERVICE_TOGGLE_ACTIVE(clinicId, serviceId),
        {}
      );
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinic-services', clinicId] });
    },
  });
}

// Appointments hooks
interface UseDoctorAppointmentsOptions {
  status?: AppointmentStatus;
  date?: string;
  clinicId?: string;
  page?: number;
  limit?: number;
}

export function useDoctorAppointments({
  status,
  date,
  clinicId,
  page = 1,
  limit = 20,
}: UseDoctorAppointmentsOptions = {}) {
  return useQuery({
    queryKey: ['doctor-appointments', status, date, clinicId, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (date) params.append('date', date);
      if (clinicId) params.append('clinicId', clinicId);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      return apiGet<PaginatedResponse<Appointment>>(
        `${DOCTOR_ENDPOINTS.APPOINTMENTS}?${params.toString()}`
      );
    },
    staleTime: 1000 * 30, // 30 seconds for appointments
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      status,
    }: {
      appointmentId: string;
      status: AppointmentStatus;
    }) => {
      return apiPatch(`${DOCTOR_ENDPOINTS.APPOINTMENTS}/${appointmentId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    },
  });
}

export function useUpdateAppointmentPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      paymentStatus,
      amountPaid,
    }: {
      appointmentId: string;
      paymentStatus: PaymentStatus;
      amountPaid?: number;
    }) => {
      return apiPatch(`${DOCTOR_ENDPOINTS.APPOINTMENTS}/${appointmentId}/payment`, {
        paymentStatus,
        amountPaid,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    },
  });
}

export function useAddMedicalNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      diagnosis,
      prescription,
      notes,
    }: {
      appointmentId: string;
      diagnosis?: string;
      prescription?: string;
      notes?: string;
    }) => {
      return apiPatch(`${DOCTOR_ENDPOINTS.APPOINTMENTS}/${appointmentId}/medical-notes`, {
        diagnosis,
        prescription,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    },
  });
}

// Ratings hooks
export function useDoctorRatings(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['doctor-ratings', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      return apiGet<PaginatedResponse<Rating>>(`${DOCTOR_ENDPOINTS.RATINGS}?${params}`);
    },
    staleTime: 1000 * 60 * 5,
  });
}
