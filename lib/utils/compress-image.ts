import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 3000,
  useWebWorker: true,
  initialQuality: 0.85,
  preserveExif: false,
};

/**
 * Compress an image file while preserving quality.
 * - Targets ~1.5MB max (from 5MB limit)
 * - Keeps resolution up to 3000px (important for prescription readability)
 * - Uses 85% quality to maintain text clarity
 * - Skips compression if file is already small enough
 */
export async function compressImage(file: File): Promise<File> {
  // Skip if already under 500KB — no point compressing small files
  if (file.size <= 500 * 1024) {
    return file;
  }

  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  return compressed;
}
