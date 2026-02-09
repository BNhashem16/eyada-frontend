import type { AxiosError } from "axios";
import type { ApiError } from "@/types";

/**
 * Extract a human-readable error message from an API error response.
 * Handles all backend response formats:
 * - string[] (from HttpExceptionFilter / PrismaExceptionFilter)
 * - string (plain text)
 * - { en, ar } object (bilingual, safety net)
 */
export function extractApiError(
  error: AxiosError<ApiError>,
  fallback: string,
): string {
  if (!error.response?.data?.message) return fallback;

  const msg = error.response.data.message;

  // Backend sends message as array of localized strings
  if (Array.isArray(msg)) {
    return msg[0] || fallback;
  }

  // String message
  if (typeof msg === "string") {
    return msg;
  }

  return fallback;
}
