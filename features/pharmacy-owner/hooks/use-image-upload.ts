"use client";

import { useState } from "react";
import { apiUpload } from "@/lib/api";
import { UPLOAD_ENDPOINTS } from "@/lib/api/endpoints";
import { useTranslation } from "@/lib/i18n";
import { toastError } from "@/hooks/use-toast";
import { extractApiError } from "@/lib/utils";

interface UploadResult {
  fileKey: string;
  url: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function useImageUpload() {
  const { t } = useTranslation();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
  });

  const uploadImage = async (file: File): Promise<UploadResult | null> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toastError(t("toast.error"), t("pharmacyOwner.invalidImageType"));
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toastError(t("toast.error"), t("pharmacyOwner.imageTooLarge"));
      return null;
    }

    setUploadState({ isUploading: true, progress: 0 });

    try {
      const result = await apiUpload<UploadResult>(
        UPLOAD_ENDPOINTS.IMAGE,
        file,
        "file",
        (percent) => setUploadState({ isUploading: true, progress: percent }),
      );
      setUploadState({ isUploading: false, progress: 100 });
      return result;
    } catch (error: any) {
      setUploadState({ isUploading: false, progress: 0 });
      toastError(
        t("toast.error"),
        extractApiError(error, t("pharmacyOwner.uploadFailed")),
      );
      return null;
    }
  };

  return { uploadImage, ...uploadState };
}
