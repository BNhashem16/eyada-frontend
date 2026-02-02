'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { PATIENT_ENDPOINTS } from '@/lib/api/endpoints';
import { PatientProfile, Appointment, FamilyMember, PaginatedResponse } from '@/types';
import { AppointmentStatus, PaymentStatus, Gender, RelationshipType } from '@/types/enums';

// Profile hooks
export function usePatientProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['patient-profile'],
    queryFn: async () => {
      return apiGet<PatientProfile>(PATIENT_ENDPOINTS.PROFILE);
    },
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

// Create patient profile (for new patients)
export interface CreatePatientProfileData {
  dateOfBirth?: string;
  age?: number;
  gender?: Gender;
  whatsappNumber?: string;
  usePhoneAsWhatsapp?: boolean;
  bloodType?: string;
}

export function useCreatePatientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePatientProfileData) => {
      return apiPost<PatientProfile>(PATIENT_ENDPOINTS.CREATE_PROFILE, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
    },
  });
}

export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<PatientProfile>) => {
      return apiPatch<PatientProfile>(PATIENT_ENDPOINTS.PROFILE, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
    },
  });
}

export function usePatientMedicalData() {
  return useQuery({
    queryKey: ['patient-medical-data'],
    queryFn: async () => {
      return apiGet(PATIENT_ENDPOINTS.MEDICAL);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdatePatientMedicalData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiPatch(PATIENT_ENDPOINTS.MEDICAL, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medical-data'] });
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
    },
  });
}

// Appointments hooks - extended filters matching Swagger spec
export interface UsePatientAppointmentsOptions {
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  clinicId?: string;
  doctorId?: string;
  upcoming?: boolean;
  forFamilyMember?: boolean;
  page?: number;
  limit?: number;
}

export function usePatientAppointments({
  status,
  paymentStatus,
  dateFrom,
  dateTo,
  clinicId,
  doctorId,
  upcoming,
  forFamilyMember,
  page = 1,
  limit = 10,
}: UsePatientAppointmentsOptions = {}) {
  return useQuery({
    queryKey: ['patient-appointments', { status, paymentStatus, dateFrom, dateTo, clinicId, doctorId, upcoming, forFamilyMember, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (paymentStatus) params.append('paymentStatus', paymentStatus);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (clinicId) params.append('clinicId', clinicId);
      if (doctorId) params.append('doctorId', doctorId);
      if (upcoming !== undefined) params.append('upcoming', upcoming.toString());
      if (forFamilyMember !== undefined) params.append('forFamilyMember', forFamilyMember.toString());
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      return apiGet<PaginatedResponse<Appointment>>(
        `${PATIENT_ENDPOINTS.APPOINTMENTS}?${params.toString()}`
      );
    },
    staleTime: 1000 * 60,
  });
}

export function usePatientAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ['patient-appointment', appointmentId],
    queryFn: async () => {
      return apiGet<Appointment>(PATIENT_ENDPOINTS.APPOINTMENT(appointmentId));
    },
    enabled: !!appointmentId,
  });
}

// Book appointment - matches Swagger CreateAppointmentDto
export interface BookAppointmentData {
  clinicId: string;
  serviceTypeId: string;
  appointmentDate: string; // YYYY-MM-DD format
  patientProfileId?: string; // For booking for family members
  notes?: string;
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookAppointmentData) => {
      return apiPost<Appointment>(PATIENT_ENDPOINTS.APPOINTMENTS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      return apiPatch(PATIENT_ENDPOINTS.CANCEL_APPOINTMENT(appointmentId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
  });
}

// Get medical notes for an appointment
export interface MedicalNotes {
  diagnosis?: string;
  prescription?: string;
  notes?: string;
}

export function useAppointmentMedicalNotes(appointmentId: string) {
  return useQuery({
    queryKey: ['patient-appointment-medical-notes', appointmentId],
    queryFn: async () => {
      return apiGet<MedicalNotes>(PATIENT_ENDPOINTS.APPOINTMENT_MEDICAL_NOTES(appointmentId));
    },
    enabled: !!appointmentId,
    staleTime: 1000 * 60 * 5,
  });
}

// Family hooks
export function usePatientFamily() {
  return useQuery({
    queryKey: ['patient-family'],
    queryFn: async () => {
      return apiGet<FamilyMember[]>(PATIENT_ENDPOINTS.FAMILY);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddFamilyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<FamilyMember, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>) => {
      return apiPost<FamilyMember>(PATIENT_ENDPOINTS.FAMILY, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-family'] });
    },
  });
}

export function useUpdateFamilyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: Partial<Omit<FamilyMember, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>> }) => {
      return apiPatch<FamilyMember>(`${PATIENT_ENDPOINTS.FAMILY}/${memberId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-family'] });
    },
  });
}

export function useDeleteFamilyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      return apiDelete(`${PATIENT_ENDPOINTS.FAMILY}/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-family'] });
    },
  });
}

// Ratings hooks - matching Swagger CreateRatingDto
export interface CreateRatingData {
  appointmentId: string;
  rating: number; // 1-5
  review?: string; // max 1000 chars
}

export function useSubmitRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRatingData) => {
      return apiPost(PATIENT_ENDPOINTS.RATINGS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
  });
}
