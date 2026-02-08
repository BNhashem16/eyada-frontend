"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { toastSuccess, toastError } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import type { ApiError } from "@/types";
import { useTranslation } from "@/lib/i18n";

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await login(credentials);
    },
    onSuccess: () => {
      toastSuccess(t("auth.loginSuccessTitle"), t("auth.loginSuccessDesc"));

      // Get the user after login
      const currentUser = useAuthStore.getState().user;

      // Redirect based on role
      if (currentUser) {
        switch (currentUser.role) {
          case "ADMIN":
            router.push("/admin/dashboard");
            break;
          case "DOCTOR":
            router.push("/doctor/dashboard");
            break;
          case "SECRETARY":
            router.push("/secretary/dashboard");
            break;
          case "PATIENT":
          default:
            router.push("/patient/dashboard");
        }
      } else {
        router.push("/");
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      let message: string;

      if (!error.response) {
        // Network error or server is down
        message = t("auth.loginNetworkError");
      } else if (error.response.status === 429) {
        message = t("auth.loginRateLimitError");
      } else {
        // Handle message that could be string or array
        const errorMessage = error.response.data?.message;
        if (Array.isArray(errorMessage)) {
          message = errorMessage[0] || t("auth.loginFailedDefault");
        } else {
          message = errorMessage || t("auth.loginFailedDefault");
        }
      }

      toastError(t("auth.loginErrorTitle"), message);
    },
  });
}
