'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { toastSuccess, toastError } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError, Role } from '@/types';

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role?: 'PATIENT' | 'DOCTOR';
}

export function useRegister() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      await register(data);
    },
    onSuccess: () => {
      // Get the user after registration
      const currentUser = useAuthStore.getState().user;

      // Redirect based on role
      if (currentUser) {
        switch (currentUser.role) {
          case 'DOCTOR':
            // Show message that doctor needs to complete profile
            toastSuccess(
              'تم إنشاء الحساب بنجاح',
              'يرجى إكمال بيانات ملفك الطبي لمراجعتها من قبل الإدارة'
            );
            // Redirect to profile page to complete registration
            router.push('/doctor/profile');
            break;
          case 'PATIENT':
          default:
            // Show message that patient needs to complete profile
            toastSuccess(
              'تم إنشاء الحساب بنجاح',
              'يرجى إكمال بيانات ملفك الشخصي'
            );
            // Redirect to profile page to complete registration
            router.push('/patient/profile');
        }
      } else {
        router.push('/');
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      let message: string;

      if (!error.response) {
        // Network error or server is down
        message = 'لا يمكن الاتصال بالخادم. تأكد من اتصالك بالإنترنت.';
      } else if (error.response.status === 409) {
        message = 'هذا البريد الإلكتروني أو رقم الهاتف مسجل بالفعل.';
      } else if (error.response.status === 429) {
        message = 'محاولات كثيرة. حاول مرة أخرى لاحقاً.';
      } else {
        // Handle message that could be string or array
        const errorMessage = error.response.data?.message;
        if (Array.isArray(errorMessage)) {
          message = errorMessage[0] || 'فشل إنشاء الحساب. حاول مرة أخرى.';
        } else {
          message = errorMessage || 'فشل إنشاء الحساب. حاول مرة أخرى.';
        }
      }

      toastError('خطأ في إنشاء الحساب', message);
    },
  });
}
