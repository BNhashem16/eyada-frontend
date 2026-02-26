"use client";

import { useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadImage, type UploadResponse } from "@/hooks/use-upload";
import { useTranslation } from "@/lib/i18n";
import { getImageUrl } from "@/lib/utils/storage";

interface ImageUploadProps {
  value: string[];
  onChange: (keys: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 10,
  className,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadImage();
  const [uploadingCount, setUploadingCount] = useState(0);
  // Store URLs returned by upload for newly uploaded images
  const [urlMap, setUrlMap] = useState<Record<string, string>>({});

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxImages - value.length;
    const filesToUpload = files.slice(0, remaining);

    setUploadingCount(filesToUpload.length);

    const newKeys: string[] = [];
    const newUrls: Record<string, string> = {};

    for (const file of filesToUpload) {
      try {
        const result: UploadResponse = await uploadMutation.mutateAsync(file);
        newKeys.push(result.fileKey);
        newUrls[result.fileKey] = result.url;
      } catch {
        // Error toast handled by hook's onError
      } finally {
        setUploadingCount((prev) => Math.max(0, prev - 1));
      }
    }

    if (newKeys.length > 0) {
      setUrlMap((prev) => ({ ...prev, ...newUrls }));
      onChange([...value, ...newKeys]);
    }

    // Reset input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  const getDisplayUrl = (fileKey: string) => {
    return urlMap[fileKey] || getImageUrl(fileKey);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {/* Existing images */}
        {value.map((key, index) => (
          <div
            key={key}
            className="relative aspect-square rounded-lg border overflow-hidden group"
          >
            <img
              src={getDisplayUrl(key)}
              alt={`${t("pharmacyOwner.productImages")} ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 end-1 p-1 rounded-full bg-error-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title={t("pharmacyOwner.removeImage")}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Upload placeholders (for in-progress uploads) */}
        {Array.from({ length: uploadingCount }).map((_, i) => (
          <div
            key={`uploading-${i}`}
            className="aspect-square rounded-lg border border-dashed flex items-center justify-center bg-muted/30"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ))}

        {/* Add button */}
        {value.length + uploadingCount < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary-400 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary-600 transition-colors"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs">{t("pharmacyOwner.uploadImage")}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
