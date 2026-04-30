"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { toastSuccess, toastError } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import type { ApiError } from "@/types";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

interface LoginCredentials {
  email: string;
  password: string;
}

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

/**
 * Pure validator for the post-login `returnUrl` query param.
 * Exported for unit tests. Returns the URL if safe, otherwise null.
 *
 * Rules:
 * - Must be a non-empty string starting with a single "/"
 * - Reject protocol-relative ("//host"), backslash-prefixed ("/\\host"),
 *   absolute URLs ("http://", "https://", "javascript:", "data:", ...)
 * - Reject auth-namespace paths to avoid post-login redirect loops
 */
export function validateReturnUrl(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;

  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }

  if (decoded.length === 0 || decoded.length > 1024) return null;
  if (!decoded.startsWith("/")) return null;
  if (decoded.startsWith("//") || decoded.startsWith("/\\")) return null;
  if (decoded.includes("\n") || decoded.includes("\r")) return null;

  const pathOnly = decoded.split("?")[0]?.split("#")[0] ?? "";
  if (AUTH_PATHS.some((p) => pathOnly === p || pathOnly.startsWith(`${p}/`))) {
    return null;
  }

  return decoded;
}

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await login(credentials);
    },
    onSuccess: () => {
      toastSuccess(t("auth.loginSuccessTitle"), t("auth.loginSuccessDesc"));

      const safeReturnUrl = validateReturnUrl(searchParams.get("returnUrl"));
      if (safeReturnUrl) {
        router.push(safeReturnUrl);
        return;
      }

      const currentUser = useAuthStore.getState().user;
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
        message = t("auth.loginNetworkError");
      } else if (error.response.status === 429) {
        message = t("auth.loginRateLimitError");
      } else {
        message = extractApiError(error, t("auth.loginFailedDefault"));
      }

      toastError(t("auth.loginErrorTitle"), message);
    },
  });
}
