const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || "";

export function getImageUrl(fileKey: string): string {
  if (!fileKey) return "";
  if (fileKey.startsWith("http")) return fileKey;
  return `${STORAGE_BASE_URL}/${fileKey}`;
}
