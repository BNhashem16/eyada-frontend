'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient, tokenStorage, AUTH_ENDPOINTS, apiPost } from '@/lib/api';
import type { User, AuthResponse } from '@/types';

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
  role?: 'PATIENT' | 'DOCTOR';
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

        try {
          const response = await apiPost<AuthResponse>(
            AUTH_ENDPOINTS.LOGIN,
            credentials
          );

          tokenStorage.setTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });

          set({
            user: response.user,
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

        try {
          const response = await apiPost<AuthResponse>(
            AUTH_ENDPOINTS.REGISTER,
            data
          );

          tokenStorage.setTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });

          set({
            user: response.user,
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
            user: response.data,
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
      name: 'eyada-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useIsHydrated = () => useAuthStore((state) => state.isHydrated);
