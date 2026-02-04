'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { DOCTOR_ENDPOINTS } from '@/lib/api/endpoints';

// Types for statistics
export interface TodayOverview {
  totalAppointments: number;
  completed: number;
  waiting: number;
  pending: number;
  cancelled: number;
  noShow: number;
  currentQueueLength: number;
  avgWaitTime: number;
  todayRevenue: number;
}

export interface StatisticsPeriod {
  from: string;
  to: string;
  label: string;
}

export interface AppointmentStats {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number;
}

export interface RevenueStats {
  total: number;
  cash: number;
  card: number;
  insurance: number;
  pending?: number;
}

export interface PatientStats {
  total: number;
  newPatients: number;
  returningPatients: number;
}

export interface ServiceStats {
  serviceId: string;
  serviceName: { ar: string; en: string };
  count: number;
  revenue: number;
}

export interface DailyBreakdown {
  date: string;
  appointments: number;
  completed: number;
  revenue: number;
}

export interface DoctorStatistics {
  period: StatisticsPeriod;
  appointments: AppointmentStats;
  revenue: RevenueStats;
  patients: PatientStats;
  services: ServiceStats[];
  dailyBreakdown: DailyBreakdown[];
}

export interface PatientVisit {
  id: string;
  bookingNumber: string;
  patientName: string;
  patientPhone: string | null;
  patientAge: number | null;
  appointmentDate: string;
  serviceName: { ar: string; en: string };
  price: number;
  paymentStatus: string;
  paymentMethod: string | null;
  clinic: { name: { ar: string; en: string } };
  medicalNotes?: {
    diagnosis: string | null;
    prescription: string | null;
    notes: string | null;
  };
}

export interface PatientHistoryResponse {
  data: PatientVisit[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface RevisitEligibility {
  canRevisit: boolean;
  previousVisits: number;
  lastVisit: {
    date: string;
    service: { ar: string; en: string };
    clinic: { ar: string; en: string };
  } | null;
}

export type StatisticsPeriodType = 'today' | 'week' | 'month' | 'custom';

export interface StatisticsFilterOptions {
  period?: StatisticsPeriodType;
  dateFrom?: string;
  dateTo?: string;
  clinicId?: string;
}

export interface PatientHistoryFilterOptions {
  patientProfileId?: string;
  patientName?: string;
  patientPhone?: string;
  page?: number;
  limit?: number;
}

// Hook: Get today's overview
export function useTodayOverview(clinicId?: string) {
  return useQuery({
    queryKey: ['doctor-today-overview', clinicId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (clinicId) params.append('clinicId', clinicId);
      const query = params.toString();
      return apiGet<TodayOverview>(
        `${DOCTOR_ENDPOINTS.TODAY_OVERVIEW}${query ? `?${query}` : ''}`
      );
    },
    staleTime: 1000 * 30, // Refresh every 30 seconds
    refetchInterval: 1000 * 60, // Auto-refresh every minute
  });
}

// Hook: Get statistics for period
export function useDoctorStatistics(options: StatisticsFilterOptions = {}) {
  const { period = 'month', dateFrom, dateTo, clinicId } = options;

  return useQuery({
    queryKey: ['doctor-statistics', { period, dateFrom, dateTo, clinicId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', period);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (clinicId) params.append('clinicId', clinicId);

      return apiGet<DoctorStatistics>(
        `${DOCTOR_ENDPOINTS.STATISTICS}?${params.toString()}`
      );
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook: Get patient visit history
export function usePatientHistory(options: PatientHistoryFilterOptions = {}) {
  const { patientProfileId, patientName, patientPhone, page = 1, limit = 20 } = options;

  return useQuery({
    queryKey: ['doctor-patient-history', { patientProfileId, patientName, patientPhone, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (patientProfileId) params.append('patientProfileId', patientProfileId);
      if (patientName) params.append('patientName', patientName);
      if (patientPhone) params.append('patientPhone', patientPhone);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      return apiGet<PatientHistoryResponse>(
        `${DOCTOR_ENDPOINTS.PATIENT_HISTORY}?${params.toString()}`
      );
    },
    enabled: !!(patientProfileId || patientName || patientPhone),
    staleTime: 1000 * 60 * 5,
  });
}

// Hook: Check if patient can revisit
export function useCheckRevisit(patientProfileId?: string, patientPhone?: string) {
  return useQuery({
    queryKey: ['doctor-check-revisit', { patientProfileId, patientPhone }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (patientProfileId) params.append('patientProfileId', patientProfileId);
      if (patientPhone) params.append('patientPhone', patientPhone);

      return apiGet<RevisitEligibility>(
        `${DOCTOR_ENDPOINTS.CHECK_REVISIT}?${params.toString()}`
      );
    },
    enabled: !!(patientProfileId || patientPhone),
    staleTime: 1000 * 60 * 5,
  });
}
