'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { DOCTOR_SECRETARIES_ENDPOINTS } from '@/lib/api/endpoints';
import { SecretaryWithClinics, SecretaryAssignment } from '@/types';

// Get all secretaries for doctor's clinics
export function useDoctorSecretaries() {
  return useQuery({
    queryKey: ['doctor-secretaries'],
    queryFn: async () => {
      return apiGet<SecretaryWithClinics[]>(DOCTOR_SECRETARIES_ENDPOINTS.SECRETARIES);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get secretaries for a specific clinic
export function useClinicSecretaries(clinicId: string) {
  return useQuery({
    queryKey: ['clinic-secretaries', clinicId],
    queryFn: async () => {
      return apiGet<SecretaryAssignment[]>(DOCTOR_SECRETARIES_ENDPOINTS.CLINIC_SECRETARIES(clinicId));
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });
}

// Create new secretary and assign to clinic
export interface CreateSecretaryData {
  email: string;
  phoneNumber: string;
  password: string;
  fullName: string;
  clinicId: string;
}

export function useCreateSecretary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSecretaryData) => {
      return apiPost<SecretaryAssignment>(DOCTOR_SECRETARIES_ENDPOINTS.SECRETARIES, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-secretaries'] });
      queryClient.invalidateQueries({ queryKey: ['clinic-secretaries'] });
    },
  });
}

// Assign existing secretary to clinic
export interface AssignSecretaryData {
  secretaryUserId: string;
  clinicId: string;
}

export function useAssignSecretary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignSecretaryData) => {
      return apiPost<SecretaryAssignment>(DOCTOR_SECRETARIES_ENDPOINTS.ASSIGN, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-secretaries'] });
      queryClient.invalidateQueries({ queryKey: ['clinic-secretaries'] });
    },
  });
}

// Update secretary info
export interface UpdateSecretaryData {
  fullName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export function useUpdateSecretary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ secretaryUserId, ...data }: UpdateSecretaryData & { secretaryUserId: string }) => {
      return apiPatch(DOCTOR_SECRETARIES_ENDPOINTS.SECRETARY(secretaryUserId), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-secretaries'] });
      queryClient.invalidateQueries({ queryKey: ['clinic-secretaries'] });
    },
  });
}

// Update secretary assignment (activate/deactivate)
export interface UpdateAssignmentData {
  isActive: boolean;
}

export function useUpdateSecretaryAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, ...data }: UpdateAssignmentData & { assignmentId: string }) => {
      return apiPatch<SecretaryAssignment>(DOCTOR_SECRETARIES_ENDPOINTS.ASSIGNMENT(assignmentId), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-secretaries'] });
      queryClient.invalidateQueries({ queryKey: ['clinic-secretaries'] });
    },
  });
}

// Remove secretary from clinic
export function useRemoveSecretaryFromClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      return apiDelete(DOCTOR_SECRETARIES_ENDPOINTS.ASSIGNMENT(assignmentId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-secretaries'] });
      queryClient.invalidateQueries({ queryKey: ['clinic-secretaries'] });
    },
  });
}
