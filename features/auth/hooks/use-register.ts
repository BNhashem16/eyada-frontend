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
      toastSuccess('تم إنشاء الحساب بنجاح', 'مرحباً بك في عيادة!');

      // Get the user after registration
      const currentUser = useAuthStore.getState().user;

      // Redirect based on role
      if (currentUser) {
        switch (currentUser.role) {
          case 'DOCTOR':
            router.push('/doctor/dashboard');
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
        'فشل إنشاء الحساب. حاول مرة أخرى.';
      toastError('خطأ', message);
    },
  });
}
