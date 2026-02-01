'use client';

import { useMutation } from '@tanstack/react-query';
import { apiPatch } from '@/lib/api';
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints';
import { toastSuccess, toastError } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      return apiPatch(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
    },
    onSuccess: () => {
      toastSuccess('تم تغيير كلمة المرور', 'تم تحديث كلمة المرور بنجاح');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ||
        'فشل في تغيير كلمة المرور. تأكد من كلمة المرور الحالية.';
      toastError('خطأ', message);
    },
  });
}
