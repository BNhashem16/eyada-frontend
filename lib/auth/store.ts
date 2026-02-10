"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiClient, tokenStorage, AUTH_ENDPOINTS, apiPost } from "@/lib/api";
import type { User, AuthResponse } from "@/types";

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
  role?: "PATIENT" | "DOCTOR";
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

        // Clear previous user's cached data before login
        tokenStorage.clearQueryCache();

        try {
          const response = await apiPost<AuthResponse>(
            AUTH_ENDPOINTS.LOGIN,
            credentials,
          );

          console.log("Login response (unwrapped):", response);

          // Extract tokens - handle both nested and flat structures
          // Nested: { tokens: { accessToken, refreshToken }, user }
          // Flat: { accessToken, refreshToken, user }
          const accessToken =
            response.tokens?.accessToken || (response as any).accessToken;
          const refreshToken =
            response.tokens?.refreshToken || (response as any).refreshToken;

          if (!accessToken) {
            throw new Error("Invalid login response - no access token");
          }

          tokenStorage.setTokens({
            accessToken,
            refreshToken: refreshToken || "",
          });

          // Add name alias for fullName and normalize role to uppercase
          const user = response.user
            ? {
                ...response.user,
                name:
                  response.user.fullName ||
                  (response.user as any).full_name ||
                  (response.user as any).name ||
                  "",
                role: (
                  (response.user.role || "") as string
                ).toUpperCase() as any,
              }
            : null;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });

        // Clear previous user's cached data before register
        tokenStorage.clearQueryCache();

        try {
          const response = await apiPost<AuthResponse>(
            AUTH_ENDPOINTS.REGISTER,
            data,
          );

          console.log("Register response (unwrapped):", response);

          // Extract tokens - handle both nested and flat structures
          // Nested: { tokens: { accessToken, refreshToken }, user }
          // Flat: { accessToken, refreshToken, user }
          const accessToken =
            response.tokens?.accessToken || (response as any).accessToken;
          const refreshToken =
            response.tokens?.refreshToken || (response as any).refreshToken;

          if (!accessToken) {
            throw new Error("Invalid register response - no access token");
          }

          tokenStorage.setTokens({
            accessToken,
            refreshToken: refreshToken || "",
          });

          // Add name alias for fullName and normalize role to uppercase
          const user = response.user
            ? {
                ...response.user,
                name:
                  response.user.fullName ||
                  (response.user as any).full_name ||
                  (response.user as any).name ||
                  "",
                role: (
                  (response.user.role || "") as string
                ).toUpperCase() as any,
              }
            : null;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Register error:", error);
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
          // Add name alias for fullName and normalize role to uppercase
          const user = {
            ...response.data,
            name: response.data.fullName,
            role: ((response.data.role || "") as string).toUpperCase() as any,
          };
          set({
            user,
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
        // Add name alias if missing (for backwards compatibility)
        if (state?.user) {
          if (!state.user.name && state.user.fullName) {
            state.user.name = state.user.fullName;
          }
          // Normalize role to uppercase
          if (state.user.role) {
            state.user.role = (state.user.role as string).toUpperCase() as any;
          }
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
