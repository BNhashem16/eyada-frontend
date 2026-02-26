"use client";

import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiUpload } from "@/lib/api/client";
import { UPLOAD_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiError } from "@/types";
import { toastError } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/utils";

export interface UploadResponse {
  fileKey: string;
  url: string;
}

export function useUploadImage() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      return apiUpload<UploadResponse>(UPLOAD_ENDPOINTS.IMAGE, file);
    },
    onError: (error: AxiosError<ApiError>) => {
      toastError(
        t("toast.error"),
        extractApiError(error, t("pharmacyOwner.uploadFailed")),
      );
    },
  });
}
