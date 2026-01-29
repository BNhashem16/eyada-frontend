'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useIsHydrated } from './store';
import { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  fallbackPath?: string;
}

/**
 * Protect routes based on authentication and role
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const isHydrated = useIsHydrated();

  useEffect(() => {
    // Wait for hydration
    if (!isHydrated) return;

    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${fallbackPath}?returnUrl=${returnUrl}`);
      return;
    }

    // If authenticated but not authorized, redirect to dashboard
    if (
      !isLoading &&
      isAuthenticated &&
      allowedRoles &&
      user &&
      !allowedRoles.includes(user.role)
    ) {
      // Redirect based on role
      const dashboardPath = getRoleDashboard(user.role);
      router.replace(dashboardPath);
    }
  }, [isHydrated, isAuthenticated, isLoading, user, allowedRoles, router, pathname, fallbackPath]);

  // Show nothing while checking auth
  if (!isHydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Not authorized
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Redirect authenticated users away from auth pages
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const isHydrated = useIsHydrated();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isLoading && isAuthenticated && user) {
      const dashboardPath = getRoleDashboard(user.role);
      router.replace(dashboardPath);
    }
  }, [isHydrated, isAuthenticated, isLoading, user, router]);

  // Show nothing while checking
  if (!isHydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // If authenticated, don't render (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Get dashboard path based on user role
 */
function getRoleDashboard(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return '/admin/dashboard';
    case Role.DOCTOR:
      return '/doctor/dashboard';
    case Role.SECRETARY:
      return '/secretary/dashboard';
    case Role.PATIENT:
    default:
      return '/patient/dashboard';
  }
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(roles: Role | Role[]): boolean {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Hook to get current user's dashboard path
 */
export function useUserDashboard(): string {
  const user = useAuthStore((state) => state.user);

  if (!user) return '/login';

  return getRoleDashboard(user.role);
}
