'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { toastSuccess, toastError } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await login(credentials);
    },
    onSuccess: () => {
      toastSuccess('تم تسجيل الدخول بنجاح', 'مرحباً بك!');

      // Get the user after login
      const currentUser = useAuthStore.getState().user;

      // Redirect based on role
      if (currentUser) {
        switch (currentUser.role) {
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'DOCTOR':
            router.push('/doctor/dashboard');
            break;
          case 'SECRETARY':
            router.push('/secretary/dashboard');
            break;
          case 'PATIENT':
          default:
            router.push('/patient/dashboard');
        }
      } else {
        router.push('/');
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ||
        'فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.';
      toastError('خطأ', message);
    },
  });
}
