"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  Menu,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useTranslation } from "@/lib/i18n";
import {
  useUser,
  useIsAuthenticated,
  useLogout,
  useIsHydrated,
} from "@/lib/auth/store";
import { getInitials } from "@/lib/utils";
import { useState, useCallback } from "react";
import { LucideIcon } from "lucide-react";

export interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface HeaderProps {
  variant?: "public" | "auth" | "dashboard";
  navLinks?: NavLinkItem[];
  userRole?: string;
  userRoleLabel?: string;
  showDoctorPrefix?: boolean;
  onMenuClick?: () => void;
  rightContent?: React.ReactNode;
}

export function Header({
  variant = "public",
  navLinks = [],
  userRole,
  userRoleLabel,
  showDoctorPrefix = false,
  onMenuClick,
  rightContent,
}: HeaderProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const logout = useLogout();
  const isHydrated = useIsHydrated();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen((prev) => !prev);
  }, []);

  const closeUserMenu = useCallback(() => {
    setUserMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUserMenuOpen(false);
  }, [logout]);

  const getDashboardLink = () => {
    switch (user?.role) {
      case "DOCTOR":
        return "/doctor/dashboard";
      case "PATIENT":
        return "/patient/dashboard";
      case "SECRETARY":
        return "/secretary/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  const getUserDisplayName = () => {
    if (showDoctorPrefix) {
      return `${t("doctors.doctorPrefix")} ${user?.name}`;
    }
    return user?.name;
  };

  // Auth variant - simple header
  if (variant === "auth") {
    return (
      <header className="fixed top-0 inset-x-0 z-40 p-4 flex items-center justify-between bg-card/80 backdrop-blur-lg">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-medical">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary-700 dark:text-primary-400">
            {t("app.name")}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
    );
  }

  // Dashboard variant - with sidebar toggle
  if (variant === "dashboard") {
    return (
      <header className="fixed top-0 inset-x-0 z-40 bg-card border-b border-border">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <button
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
                onClick={onMenuClick}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block">
                {t("app.name")}
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            {rightContent}
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profilePicture || undefined} />
                <AvatarFallback className="text-sm">
                  {getInitials(user?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground max-w-[150px] truncate">
                  {getUserDisplayName()}
                </p>
                {userRoleLabel && (
                  <p className="text-xs text-muted-foreground">
                    {userRoleLabel}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Public variant - with navigation
  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
              {t("app.name")}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {navLinks.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400"
                        : "text-foreground hover:text-primary-600 dark:hover:text-primary-400 hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Side: Auth + Toggles */}
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />

            {!isHydrated ? (
              <Skeleton className="h-8 w-24" />
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-primary-100 dark:ring-primary-900/50">
                    <AvatarImage src={user.profilePicture || undefined} />
                    <AvatarFallback className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      {getInitials(user.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium text-foreground max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden lg:block" />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={closeUserMenu}
                    />
                    <div className="absolute end-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl z-50 py-1 overflow-hidden">
                      <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href={getDashboardLink()}
                        onClick={closeUserMenu}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t("nav.dashboard")}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 w-full transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ms-1">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex"
                >
                  <Link href="/login">
                    <LogIn className="h-4 w-4 ms-1.5" />
                    {t("nav.login")}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="shadow-sm shadow-primary-500/20"
                >
                  <Link href="/register">
                    <UserPlus className="h-4 w-4 ms-1.5" />
                    <span className="hidden sm:inline">
                      {t("nav.register")}
                    </span>
                    <span className="sm:hidden">{t("nav.login")}</span>
                  </Link>
                </Button>
              </div>
            )}

            {onMenuClick && (
              <button
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={onMenuClick}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
