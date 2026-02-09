"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { toastSuccess, toastError } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import type { ApiError, Role } from "@/types";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role?: "PATIENT" | "DOCTOR";
}

export function useRegister() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const { t } = useTranslation();

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
          case "DOCTOR":
            // Show message that doctor needs to complete profile
            toastSuccess(
              t("auth.registerSuccessTitle"),
              t("auth.registerSuccessDoctorDesc"),
            );
            // Redirect to profile page to complete registration
            router.push("/doctor/profile");
            break;
          case "PATIENT":
          default:
            // Show message that patient needs to complete profile
            toastSuccess(
              t("auth.registerSuccessTitle"),
              t("auth.registerSuccessPatientDesc"),
            );
            // Redirect to profile page to complete registration
            router.push("/patient/profile");
        }
      } else {
        router.push("/");
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      let message: string;

      if (!error.response) {
        message = t("auth.registerNetworkError");
      } else if (error.response.status === 409) {
        message = t("auth.registerConflictError");
      } else if (error.response.status === 429) {
        message = t("auth.registerRateLimitError");
      } else {
        message = extractApiError(error, t("auth.registerFailedDefault"));
      }

      toastError(t("auth.registerErrorTitle"), message);
    },
  });
}
