'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { SECRETARY_ENDPOINTS } from '@/lib/api/endpoints';

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

export interface SecretaryStatistics {
  period: {
    from: string;
    to: string;
    label: string;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    completionRate: number;
  };
  revenue: {
    total: number;
    cash: number;
    card: number;
    insurance: number;
  };
  services: Array<{
    serviceId: string;
    serviceName: { ar: string; en: string };
    count: number;
    revenue: number;
  }>;
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
    patientName: string;
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
  patientName?: string;
  patientPhone?: string;
  page?: number;
  limit?: number;
}

// Hook: Get today's overview
export function useSecretaryTodayOverview(clinicId?: string) {
  return useQuery({
    queryKey: ['secretary-today-overview', clinicId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (clinicId) params.append('clinicId', clinicId);
      const query = params.toString();
      return apiGet<TodayOverview>(
        `${SECRETARY_ENDPOINTS.TODAY_OVERVIEW}${query ? `?${query}` : ''}`
      );
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

// Hook: Get statistics for period
export function useSecretaryStatistics(options: StatisticsFilterOptions = {}) {
  const { period = 'month', dateFrom, dateTo, clinicId } = options;

  return useQuery({
    queryKey: ['secretary-statistics', { period, dateFrom, dateTo, clinicId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', period);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (clinicId) params.append('clinicId', clinicId);

      return apiGet<SecretaryStatistics>(
        `${SECRETARY_ENDPOINTS.STATISTICS}?${params.toString()}`
      );
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook: Get patient visit history
export function useSecretaryPatientHistory(options: PatientHistoryFilterOptions = {}) {
  const { patientName, patientPhone, page = 1, limit = 20 } = options;

  return useQuery({
    queryKey: ['secretary-patient-history', { patientName, patientPhone, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (patientName) params.append('patientName', patientName);
      if (patientPhone) params.append('patientPhone', patientPhone);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      return apiGet<PatientHistoryResponse>(
        `${SECRETARY_ENDPOINTS.PATIENT_HISTORY}?${params.toString()}`
      );
    },
    enabled: !!(patientName || patientPhone),
    staleTime: 1000 * 60 * 5,
  });
}

// Hook: Check if patient can revisit
export function useSecretaryCheckRevisit(clinicId: string, patientPhone?: string) {
  return useQuery({
    queryKey: ['secretary-check-revisit', { clinicId, patientPhone }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('clinicId', clinicId);
      if (patientPhone) params.append('patientPhone', patientPhone);

      return apiGet<RevisitEligibility>(
        `${SECRETARY_ENDPOINTS.CHECK_REVISIT}?${params.toString()}`
      );
    },
    enabled: !!clinicId && !!patientPhone,
    staleTime: 1000 * 60 * 5,
  });
}
