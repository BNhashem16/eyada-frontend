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
export function useDoctorProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      return apiGet<DoctorProfile>(DOCTOR_ENDPOINTS.PROFILE);
    },
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
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
      return apiPost<DoctorProfile>(DOCTOR_ENDPOINTS.CREATE_PROFILE, data);
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

export function useDeleteClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clinicId: string) => {
      return apiDelete(DOCTOR_ENDPOINTS.DELETE_CLINIC(clinicId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-clinics'] });
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

// Appointments hooks - extended filters matching Swagger spec
export interface UseDoctorAppointmentsOptions {
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  date?: string; // Single date filter
  dateFrom?: string; // Date range start
  dateTo?: string; // Date range end
  clinicId?: string;
  search?: string; // Search by patient name or booking number
  serviceTypeId?: string;
  upcoming?: boolean; // Only show upcoming appointments
  page?: number;
  limit?: number;
}

export function useDoctorAppointments({
  status,
  paymentStatus,
  date,
  dateFrom,
  dateTo,
  clinicId,
  search,
  serviceTypeId,
  upcoming,
  page = 1,
  limit = 20,
}: UseDoctorAppointmentsOptions = {}) {
  return useQuery({
    queryKey: ['doctor-appointments', { status, paymentStatus, date, dateFrom, dateTo, clinicId, search, serviceTypeId, upcoming, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (paymentStatus) params.append('paymentStatus', paymentStatus);
      if (date) params.append('date', date);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (clinicId) params.append('clinicId', clinicId);
      if (search) params.append('search', search);
      if (serviceTypeId) params.append('serviceTypeId', serviceTypeId);
      if (upcoming !== undefined) params.append('upcoming', upcoming.toString());
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      return apiGet<PaginatedResponse<Appointment>>(
        `${DOCTOR_ENDPOINTS.APPOINTMENTS}?${params.toString()}`
      );
    },
    staleTime: 1000 * 30, // 30 seconds for appointments
  });
}

// Get single appointment
export function useDoctorAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ['doctor-appointment', appointmentId],
    queryFn: async () => {
      return apiGet<Appointment>(DOCTOR_ENDPOINTS.APPOINTMENT(appointmentId));
    },
    enabled: !!appointmentId,
    staleTime: 1000 * 30,
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

// Per Swagger UpdatePaymentStatusDto: paymentStatus (required), paymentMethod (optional)
export function useUpdateAppointmentPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      paymentStatus,
      paymentMethod,
    }: {
      appointmentId: string;
      paymentStatus: PaymentStatus;
      paymentMethod?: 'CASH' | 'CARD' | 'INSURANCE';
    }) => {
      return apiPatch(`${DOCTOR_ENDPOINTS.APPOINTMENTS}/${appointmentId}/payment`, {
        paymentStatus,
        paymentMethod,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    },
  });
}

// Medical notes interface matching Swagger UpdateMedicalNotesDto
export interface MedicalNotesData {
  diagnosis?: string;
  prescription?: string;
  notes?: string;
}

// Get medical notes for an appointment
export function useGetMedicalNotes(appointmentId: string) {
  return useQuery({
    queryKey: ['doctor-appointment-medical-notes', appointmentId],
    queryFn: async () => {
      return apiGet<MedicalNotesData>(DOCTOR_ENDPOINTS.APPOINTMENT_MEDICAL_NOTES(appointmentId));
    },
    enabled: !!appointmentId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddMedicalNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      ...data
    }: {
      appointmentId: string;
    } & MedicalNotesData) => {
      return apiPatch(DOCTOR_ENDPOINTS.APPOINTMENT_MEDICAL_NOTES(appointmentId), data);
    },
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-appointment', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['doctor-appointment-medical-notes', appointmentId] });
    },
  });
}

// Doctor's own ratings - GET /doctors/ratings (paginated with statistics)
export interface DoctorRatingsResponse extends PaginatedResponse<Rating> {
  statistics: {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: Record<number, number>;
  };
}

export function useDoctorOwnRatings(filters: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 10 } = filters;
  return useQuery({
    queryKey: ['doctor-own-ratings', { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      return apiGet<DoctorRatingsResponse>(
        `${DOCTOR_ENDPOINTS.RATINGS}?${params.toString()}`
      );
    },
    staleTime: 1000 * 60 * 5,
  });
}
