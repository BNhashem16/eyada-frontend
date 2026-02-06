'use client';

import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints';
import { toastSuccess, toastError } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      return apiPost(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
    },
    onSuccess: () => {
      toastSuccess(t('auth.changePasswordSuccessTitle'), t('auth.changePasswordSuccessDesc'));
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ||
        t('auth.changePasswordFailedDefault');
      toastError(t('auth.changePasswordErrorTitle'), message);
    },
  });
}
