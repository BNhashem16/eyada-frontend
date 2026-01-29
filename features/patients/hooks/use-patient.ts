'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { PATIENT_ENDPOINTS } from '@/lib/api/endpoints';
import { PatientProfile, Appointment, FamilyMember, PaginatedResponse } from '@/types';
import { AppointmentStatus } from '@/types/enums';

// Profile hooks
export function usePatientProfile() {
  return useQuery({
    queryKey: ['patient-profile'],
    queryFn: async () => {
      return apiGet<PatientProfile>(PATIENT_ENDPOINTS.PROFILE);
    },
    staleTime: 1000 * 60 * 5,
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
      return apiGet<PatientProfile['medicalData']>(PATIENT_ENDPOINTS.MEDICAL_DATA);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdatePatientMedicalData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<PatientProfile['medicalData']>) => {
      return apiPatch(PATIENT_ENDPOINTS.MEDICAL_DATA, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medical-data'] });
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
    },
  });
}

// Appointments hooks
interface UsePatientAppointmentsOptions {
  status?: AppointmentStatus;
  page?: number;
  limit?: number;
}

export function usePatientAppointments({
  status,
  page = 1,
  limit = 10,
}: UsePatientAppointmentsOptions = {}) {
  return useQuery({
    queryKey: ['patient-appointments', status, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
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
      return apiGet<Appointment>(`${PATIENT_ENDPOINTS.APPOINTMENTS}/${appointmentId}`);
    },
    enabled: !!appointmentId,
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      return apiPatch(`${PATIENT_ENDPOINTS.APPOINTMENTS}/${appointmentId}/cancel`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
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

// Ratings hooks
export function useSubmitRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      appointmentId: string;
      rating: number;
      comment?: string;
    }) => {
      return apiPost(PATIENT_ENDPOINTS.RATINGS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
  });
}
