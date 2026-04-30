"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { PATIENT_PHARMACY_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError } from "@/types";
import type { Cart, AddToCartDto, UpdateCartItemDto } from "@/types/cart";
import type { ValidateCouponDto, CouponValidationResult } from "@/types/coupon";
import { toastError, toastSuccess } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";
import { usePharmacyQuery } from "@/features/_shared/hooks/use-pharmacy-query";
import { patientCartKeys } from "@/lib/query-keys";

export function useCart() {
  return usePharmacyQuery<Cart>({
    queryKey: patientCartKeys.all,
    queryFn: async () => apiGet<Cart>(PATIENT_PHARMACY_ENDPOINTS.CART),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: AddToCartDto) => {
      return apiPost<Cart>(PATIENT_PHARMACY_ENDPOINTS.CART_ADD, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientCartKeys.all });
      toastSuccess(t("toast.success"), t("pharmacyOwner.addedToCart"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      itemId,
      ...data
    }: UpdateCartItemDto & { itemId: string }) => {
      return apiPatch<Cart>(PATIENT_PHARMACY_ENDPOINTS.CART_ITEM(itemId), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientCartKeys.all });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (itemId: string) => {
      return apiDelete(PATIENT_PHARMACY_ENDPOINTS.CART_ITEM(itemId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientCartKeys.all });
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      return apiDelete(PATIENT_PHARMACY_ENDPOINTS.CART);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientCartKeys.all });
      toastSuccess(t("toast.success"), t("pharmacyOwner.cartCleared"));
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("errors.somethingWentWrong")),
      );
    },
  });
}

export function useValidateCoupon() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: ValidateCouponDto) => {
      return apiPost<CouponValidationResult>(
        PATIENT_PHARMACY_ENDPOINTS.VALIDATE_COUPON,
        data,
      );
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("pharmacyOwner.invalidCoupon")),
      );
    },
  });
}
