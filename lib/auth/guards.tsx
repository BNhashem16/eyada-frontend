"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  useUser,
  useIsAuthenticated,
  useIsAuthLoading,
  useIsHydrated,
} from "./store";
import { Role } from "@/types";
import { toastWarning } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";

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
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useIsAuthLoading();
  const isHydrated = useIsHydrated();
  const { t } = useTranslation();
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    // Wait for hydration
    if (!isHydrated) return;

    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true;
        toastWarning(t("auth.loginRequiredTitle"), t("auth.loginRequiredDesc"));
      }
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
      // Redirect based on role (but avoid infinite loop by checking current path)
      const dashboardPath = getRoleDashboard(user.role);
      if (pathname !== dashboardPath && !pathname.startsWith(dashboardPath)) {
        router.replace(dashboardPath);
      }
    }
  }, [
    isHydrated,
    isAuthenticated,
    isLoading,
    user,
    allowedRoles,
    router,
    pathname,
    fallbackPath,
    t,
  ]);

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
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated && user) {
      const dashboardPath = getRoleDashboard(user.role);
      router.replace(dashboardPath);
    }
  }, [isHydrated, isAuthenticated, user, router]);

  // Show loading only while hydrating (not during login)
  if (!isHydrated) {
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
      return "/admin/dashboard";
    case Role.DOCTOR:
      return "/doctor/dashboard";
    case Role.SECRETARY:
      return "/secretary/dashboard";
    case Role.PHARMACY_OWNER:
      return "/pharmacy-owner/dashboard";
    case Role.DRIVER:
      return "/driver/dashboard";
    case Role.PATIENT:
    default:
      return "/patient/dashboard";
  }
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(roles: Role | Role[]): boolean {
  const user = useUser();

  if (!user) return false;

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Hook to get current user's dashboard path
 */
export function useUserDashboard(): string {
  const user = useUser();

  if (!user) return "/login";

  return getRoleDashboard(user.role);
}
