"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, ImageIcon, X, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageViewer } from "@/components/ui/image-viewer";
import { useTranslation } from "@/lib/i18n";
import { useUploadImage } from "@/hooks/use-upload";
import { useCreatePrescriptionRequest } from "../hooks/use-prescription-requests";
import { usePatientAddresses } from "@/features/patients/hooks";
import { compressImage } from "@/lib/utils/compress-image";

interface UploadedImage {
  fileKey: string;
  url: string;
}

export function UploadPrescriptionForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const uploadImage = useUploadImage();
  const createRequest = useCreatePrescriptionRequest();

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [notes, setNotes] = useState("");
  const [addressId, setAddressId] = useState("");

  // Image viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Fetch patient addresses via the typed hook (no apiClient in components rule).
  const { data: addresses } = usePatientAddresses();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Compress before uploading
        const compressed = await compressImage(file);
        const result = await uploadImage.mutateAsync(compressed);
        setImages((prev) => [
          ...prev,
          { fileKey: result.fileKey, url: result.url },
        ]);
      }
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const hasImages = images.length > 0;
  const hasText = prescriptionText.trim().length > 0;
  const canSubmit = (hasImages || hasText) && !!addressId;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    await createRequest.mutateAsync({
      prescriptionImages: hasImages
        ? images.map((img) => img.fileKey)
        : undefined,
      prescriptionText: prescriptionText || undefined,
      notes: notes || undefined,
      deliveryAddressId: addressId,
    });
    router.push("/patient/prescriptions");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("prescription.uploadImages")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("prescription.uploadImagesHint")}
          </p>

          {/* Uploaded images preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div
                  key={img.fileKey}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-border cursor-pointer"
                  onClick={() => openViewer(index)}
                >
                  <img
                    src={img.url}
                    alt={`${t("prescription.uploadImages")} ${index + 1}`}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    aria-label={t("common.delete")}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute end-1 top-1 grid size-8 place-items-center rounded-full bg-error-500 text-white opacity-100 transition-opacity sm:size-7 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t("prescription.uploadImages")}
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </CardContent>
      </Card>

      {/* OR Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm font-medium text-muted-foreground">
          {t("prescription.orDivider")}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Text Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("prescription.prescriptionText")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t("prescription.prescriptionTextPlaceholder")}
            value={prescriptionText}
            onChange={(e) => setPrescriptionText(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("prescription.additionalNotes")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t("prescription.additionalNotesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("prescription.selectAddress")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={addressId} onValueChange={setAddressId}>
            <SelectTrigger
              className="min-h-[44px] sm:min-h-9"
              aria-label={t("prescription.selectAddress")}
            >
              <SelectValue placeholder={t("prescription.selectAddress")} />
            </SelectTrigger>
            <SelectContent>
              {(addresses ?? []).map((addr) => (
                <SelectItem key={addr.id} value={addr.id}>
                  {addr.label} - {addr.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Validation hint */}
      {!hasImages && !hasText ? (
        <p className="text-center text-sm text-warning-700 dark:text-warning-200">
          {t("prescription.atLeastOneRequired")}
        </p>
      ) : null}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || createRequest.isPending}
        className="w-full min-h-[48px]"
        size="lg"
      >
        {createRequest.isPending ? (
          <>
            <Loader2 className="me-2 size-4 animate-spin" aria-hidden="true" />
            {t("prescription.submitting")}
          </>
        ) : (
          <>
            <Upload className="me-2 size-4" aria-hidden="true" />
            {t("prescription.submitRequest")}
          </>
        )}
      </Button>

      {/* Image Viewer */}
      <ImageViewer
        images={images.map((img) => img.url)}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        alt={t("prescription.uploadImages")}
      />
    </div>
  );
}
