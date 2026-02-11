"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError } from "@/types";
import { PaginatedResponse } from "@/types";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

// ==================== Types ====================

export type CommissionType = "FIXED" | "PERCENTAGE";

export type DateFilterPeriod =
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "THIS_YEAR"
  | "CUSTOM";

export interface Commission {
  id: string;
  doctorProfileId: string;
  commissionType: CommissionType;
  commissionValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  doctorProfile?: {
    id: string;
    user: {
      fullName: string;
      email: string;
      phoneNumber: string;
    };
    specialty: {
      id: string;
      name: { ar: string; en: string };
    };
  };
}

export interface DoctorBalance {
  doctorProfileId: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  specialtyName: { ar: string; en: string };
  totalCommission: number;
  totalPaid: number;
  balance: number;
  appointmentsCount: number;
  commissionSettings: {
    type: CommissionType;
    value: number;
    isActive: boolean;
  } | null;
}

export interface CommissionPayment {
  id: string;
  doctorProfileId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string | null;
  notes: string | null;
  referenceNumber: string | null;
  createdAt: string;
  createdBy: string;
}

export interface DetailedReport extends DoctorBalance {
  appointments: Array<{
    id: string;
    bookingNumber: string;
    patientName: string;
    serviceName: { ar: string; en: string };
    price: number;
    commissionType: CommissionType;
    commissionValue: number;
    commissionAmount: number;
    completedAt: string;
    appointmentDate: string;
    clinicName: { ar: string; en: string };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string | null;
    notes: string | null;
    referenceNumber: string | null;
    createdAt: string;
  }>;
}

export interface BalanceSummary {
  totalDoctors: number;
  totalCommission: number;
  totalPaid: number;
  totalBalance: number;
  doctorsWithBalance: number;
}

// ==================== Filter Interfaces ====================

export interface CommissionFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface BalanceFilters {
  page?: number;
  limit?: number;
  doctorProfileId?: string;
  period?: DateFilterPeriod;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  hasBalance?: boolean;
}

// ==================== Commission CRUD Hooks ====================

export function useCommissions(filters: CommissionFilters = {}) {
  const { page = 1, limit = 30, search, isActive } = filters;

  return useQuery({
    queryKey: ["admin-commissions", { page, limit, search, isActive }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (search) params.append("search", search);
      if (isActive !== undefined)
        params.append("isActive", isActive.toString());

      return apiGet<PaginatedResponse<Commission>>(
        `${ADMIN_ENDPOINTS.COMMISSIONS}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60,
  });
}

export function useCommission(doctorProfileId: string) {
  return useQuery({
    queryKey: ["admin-commission", doctorProfileId],
    queryFn: async () => {
      return apiGet<Commission | null>(
        ADMIN_ENDPOINTS.COMMISSION(doctorProfileId),
      );
    },
    enabled: !!doctorProfileId,
  });
}

export interface CreateCommissionData {
  doctorProfileId: string;
  commissionType: CommissionType;
  commissionValue: number;
  isActive?: boolean;
}

export function useCreateCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreateCommissionData) => {
      return apiPost<Commission>(ADMIN_ENDPOINTS.COMMISSIONS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-commissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commission"] });
      queryClient.invalidateQueries({ queryKey: ["admin-balances"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export interface UpdateCommissionData {
  commissionType?: CommissionType;
  commissionValue?: number;
  isActive?: boolean;
}

export function useUpdateCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateCommissionData & { id: string }) => {
      return apiPatch<Commission>(ADMIN_ENDPOINTS.COMMISSION(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-commissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commission"] });
      queryClient.invalidateQueries({ queryKey: ["admin-balances"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useDeleteCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(ADMIN_ENDPOINTS.COMMISSION(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-commissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commission"] });
      queryClient.invalidateQueries({ queryKey: ["admin-balances"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

// ==================== Balance Hooks ====================

export function useBalanceSummary(filters: BalanceFilters = {}) {
  const { period, dateFrom, dateTo } = filters;

  return useQuery({
    queryKey: ["admin-balance-summary", { period, dateFrom, dateTo }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) params.append("period", period);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      return apiGet<BalanceSummary>(
        `${ADMIN_ENDPOINTS.COMMISSION_SUMMARY}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60,
  });
}

export function useDoctorBalances(filters: BalanceFilters = {}) {
  const {
    page = 1,
    limit = 30,
    doctorProfileId,
    period,
    dateFrom,
    dateTo,
    search,
    hasBalance,
  } = filters;

  return useQuery({
    queryKey: [
      "admin-balances",
      {
        page,
        limit,
        doctorProfileId,
        period,
        dateFrom,
        dateTo,
        search,
        hasBalance,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (doctorProfileId) params.append("doctorProfileId", doctorProfileId);
      if (period) params.append("period", period);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (search) params.append("search", search);
      if (hasBalance !== undefined)
        params.append("hasBalance", hasBalance.toString());

      return apiGet<PaginatedResponse<DoctorBalance>>(
        `${ADMIN_ENDPOINTS.COMMISSION_BALANCES}?${params.toString()}`,
      );
    },
    staleTime: 1000 * 60,
  });
}

export function useDoctorDetailedReport(
  doctorProfileId: string,
  filters: BalanceFilters = {},
) {
  const { period, dateFrom, dateTo } = filters;

  return useQuery({
    queryKey: [
      "admin-doctor-report",
      doctorProfileId,
      { period, dateFrom, dateTo },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) params.append("period", period);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      return apiGet<DetailedReport>(
        `${ADMIN_ENDPOINTS.COMMISSION_DOCTOR_REPORT(doctorProfileId)}?${params.toString()}`,
      );
    },
    enabled: !!doctorProfileId,
    staleTime: 1000 * 60,
  });
}

// ==================== Payment Hooks ====================

export interface RecordPaymentData {
  doctorProfileId: string;
  amount: number;
  paymentMethod?: string;
  notes?: string;
  referenceNumber?: string;
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: RecordPaymentData) => {
      return apiPost<CommissionPayment>(
        ADMIN_ENDPOINTS.COMMISSION_PAYMENTS,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-balances"] });
      queryClient.invalidateQueries({ queryKey: ["admin-balance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctor-report"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payment-history"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function usePaymentHistory(
  doctorProfileId: string,
  page: number = 1,
  limit: number = 30,
) {
  return useQuery({
    queryKey: ["admin-payment-history", doctorProfileId, { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      return apiGet<PaginatedResponse<CommissionPayment>>(
        `${ADMIN_ENDPOINTS.COMMISSION_PAYMENT_HISTORY(doctorProfileId)}?${params.toString()}`,
      );
    },
    enabled: !!doctorProfileId,
    staleTime: 1000 * 60,
  });
}
