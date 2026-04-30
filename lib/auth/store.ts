"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiClient, tokenStorage, AUTH_ENDPOINTS, apiPost } from "@/lib/api";
import type { User, AuthResponse, Role } from "@/types";

// Login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Register data
interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role?: "PATIENT" | "DOCTOR" | "PHARMACY_OWNER";
}

// Auth state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setHydrated: () => void;
}

// Backend may return tokens nested ({ tokens: {...} }) or flat. Backend may also
// send `full_name` (snake_case) instead of `fullName`. This shape captures both.
type RawAuthResponse = AuthResponse & {
  user: AuthResponse["user"] & { full_name?: string };
};

function extractTokens(response: AuthResponse): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = response.tokens?.accessToken ?? response.accessToken;
  const refreshToken = response.tokens?.refreshToken ?? response.refreshToken;
  if (!accessToken) {
    throw new Error("Invalid auth response - no access token");
  }
  return { accessToken, refreshToken: refreshToken ?? "" };
}

function normalizeUser(user: RawAuthResponse["user"] | User): User {
  const fullName =
    user.fullName ?? (user as RawAuthResponse["user"]).full_name ?? "";
  const role = (user.role ? String(user.role).toUpperCase() : "") as Role;
  return {
    ...user,
    fullName,
    name: user.name ?? fullName,
    role,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      setHydrated: () => {
        set({ isHydrated: true });
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        tokenStorage.clearQueryCache();

        try {
          const response = await apiPost<RawAuthResponse>(
            AUTH_ENDPOINTS.LOGIN,
            credentials,
          );
          tokenStorage.setTokens(extractTokens(response));
          set({
            user: response.user ? normalizeUser(response.user) : null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        tokenStorage.clearQueryCache();

        try {
          const response = await apiPost<RawAuthResponse>(
            AUTH_ENDPOINTS.REGISTER,
            data,
          );
          tokenStorage.setTokens(extractTokens(response));
          set({
            user: response.user ? normalizeUser(response.user) : null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const refreshToken = tokenStorage.getRefreshToken();
          if (refreshToken) {
            await apiPost(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
          }
        } catch {
          // Ignore errors during logout
        } finally {
          tokenStorage.clearTokens();
          // Clear React Query cache to prevent data leakage between users
          tokenStorage.clearQueryCache();
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      logoutAll: async () => {
        try {
          await apiPost(AUTH_ENDPOINTS.LOGOUT_ALL);
        } catch {
          // Ignore errors
        } finally {
          tokenStorage.clearTokens();
          // Clear React Query cache to prevent data leakage between users
          tokenStorage.clearQueryCache();
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      fetchUser: async () => {
        const token = tokenStorage.getAccessToken();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await apiClient.get<User>(AUTH_ENDPOINTS.ME);
          set({
            user: normalizeUser(response.data),
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          tokenStorage.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },
    }),
    {
      name: "eyada-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          state.user = normalizeUser(state.user);
        }
        state?.setHydrated();
      },
    },
  ),
);

// Register session invalidation callback
// This is called when the refresh token fails, to clear the store
if (typeof window !== "undefined") {
  tokenStorage.onSessionInvalidated(() => {
    // Clear query cache to prevent data leakage
    tokenStorage.clearQueryCache();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  // Register doctor profile incomplete callback
  // This is called when a 403 DOCTOR_PROFILE_INCOMPLETE error is received
  tokenStorage.onDoctorProfileIncomplete(() => {
    const currentPath = window.location.pathname;
    // Only redirect if not already on the profile page
    if (!currentPath.includes("/doctor/profile")) {
      window.location.href = "/doctor/profile";
    }
  });
}

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useIsHydrated = () => useAuthStore((state) => state.isHydrated);
export const useLogout = () => useAuthStore((state) => state.logout);
