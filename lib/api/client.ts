import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, AUTH_ENDPOINTS } from "./endpoints";
import type { ApiError, AuthTokens } from "@/types";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
  timeout: 30000,
});

// Token storage keys
const ACCESS_TOKEN_KEY = "eyada_access_token";
const REFRESH_TOKEN_KEY = "eyada_refresh_token";

// Per-tab session correlation ID. Generated once at module init and forwarded
// on every API request as `x-correlation-id` so backend logs and frontend
// errors (Sentry tags this same value) can be linked end-to-end. Stable for
// the lifetime of the tab.
function generateCorrelationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const SESSION_CORRELATION_ID =
  typeof window !== "undefined" ? generateCorrelationId() : "";

export function getSessionCorrelationId(): string {
  return SESSION_CORRELATION_ID;
}

// Callback for when session is invalidated (refresh token fails)
let onSessionInvalidated: (() => void) | null = null;

// Callback for when doctor profile is incomplete
let onDoctorProfileIncomplete: (() => void) | null = null;

// Callback for clearing query cache (called on logout/login)
let onClearQueryCache: (() => void) | null = null;

// Token management functions
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (tokens: AuthTokens): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Register callback for when session is invalidated
  onSessionInvalidated: (callback: () => void): void => {
    onSessionInvalidated = callback;
  },

  // Register callback for when doctor profile is incomplete
  onDoctorProfileIncomplete: (callback: () => void): void => {
    onDoctorProfileIncomplete = callback;
  },

  // Register callback for clearing query cache
  onClearQueryCache: (callback: () => void): void => {
    onClearQueryCache = callback;
  },

  // Call to clear query cache (on logout/user change)
  clearQueryCache: (): void => {
    if (onClearQueryCache) {
      onClearQueryCache();
    }
  },
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Notify subscribers with new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Request interceptor - Add auth token and language
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Accept-Language header
    if (typeof window !== "undefined" && config.headers) {
      const locale = localStorage.getItem("eyada-locale") || "ar";
      config.headers["Accept-Language"] = locale;
      // End-to-end trace correlation. Backend echoes this via its own
      // middleware; Sentry tags errors with the same value.
      if (SESSION_CORRELATION_ID) {
        config.headers["x-correlation-id"] = SESSION_CORRELATION_ID;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Extended config type for retry flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Response interceptor - Handle token refresh and special errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // If no config or no response, reject
    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    // Check for DOCTOR_PROFILE_INCOMPLETE error (403)
    if (error.response.status === 403) {
      const errorData = error.response.data as any;
      const errorCode = errorData?.error || errorData?.errorCode;

      if (errorCode === "DOCTOR_PROFILE_INCOMPLETE") {
        if (onDoctorProfileIncomplete) {
          onDoctorProfileIncomplete();
        }
        return Promise.reject(error);
      }
    }

    // If 401 and not a refresh request and not already retried
    if (
      error.response.status === 401 &&
      !originalRequest.url?.includes(AUTH_ENDPOINTS.REFRESH) &&
      !originalRequest.url?.includes(AUTH_ENDPOINTS.LOGIN) &&
      !originalRequest._retry
    ) {
      const refreshToken = tokenStorage.getRefreshToken();

      // If no refresh token, just reject - let the app handle it
      // Don't redirect here to avoid infinite loops
      if (!refreshToken) {
        return Promise.reject(error);
      }

      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;

      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (token) {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post<AuthTokens>(
          `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        tokenStorage.setTokens({
          accessToken,
          refreshToken: newRefreshToken,
        });

        isRefreshing = false;
        onTokenRefreshed(accessToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Clear tokens and notify the app
        tokenStorage.clearTokens();
        onTokenRefreshed("");
        // Notify auth store that session is invalidated
        if (onSessionInvalidated) {
          onSessionInvalidated();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Helper to unwrap API response { success: true, data: {...} }
function unwrapResponse<T>(responseData: any): T {
  // If response has success/data structure, unwrap it
  if (
    responseData &&
    typeof responseData === "object" &&
    "success" in responseData &&
    "data" in responseData
  ) {
    return responseData.data;
  }
  return responseData;
}

// Helper function for API calls
export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await apiClient.get<T>(url, { params });
  return unwrapResponse<T>(response.data);
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<T>(url, data);
  return unwrapResponse<T>(response.data);
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.patch<T>(url, data);
  return unwrapResponse<T>(response.data);
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<T>(url, data);
  return unwrapResponse<T>(response.data);
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<T>(url);
  return unwrapResponse<T>(response.data);
}

export async function apiUpload<T>(
  url: string,
  file: File,
  fieldName = "file",
  onProgress?: (percent: number) => void,
): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file);

  const response = await apiClient.post<T>(url, formData, {
    headers: { "Content-Type": undefined },
    onUploadProgress: onProgress
      ? (event) => {
          if (event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        }
      : undefined,
  });
  return unwrapResponse<T>(response.data);
}

export default apiClient;
