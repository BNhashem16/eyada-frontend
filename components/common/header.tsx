'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Stethoscope,
  Menu,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { LanguageToggle } from '@/components/common/language-toggle';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore, useIsHydrated } from '@/lib/auth/store';
import { getInitials } from '@/lib/utils';
import { useState } from 'react';
import { LucideIcon } from 'lucide-react';

export interface HeaderProps {
  variant?: 'public' | 'auth' | 'dashboard';
  userRole?: string;
  userRoleLabel?: string;
  showDoctorPrefix?: boolean;
  onMenuClick?: () => void;
  rightContent?: React.ReactNode;
}

export function Header({
  variant = 'public',
  userRole,
  userRoleLabel,
  showDoctorPrefix = false,
  onMenuClick,
  rightContent,
}: HeaderProps) {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const isHydrated = useIsHydrated();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'PATIENT':
        return '/patient/dashboard';
      case 'SECRETARY':
        return '/secretary/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const getUserDisplayName = () => {
    if (showDoctorPrefix) {
      return `${t('doctors.doctorPrefix')} ${user?.name}`;
    }
    return user?.name;
  };

  // Auth variant - simple header
  if (variant === 'auth') {
    return (
      <header className="absolute top-0 w-full p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-medical">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary-700 dark:text-primary-400">
            {t('app.name')}
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
  if (variant === 'dashboard') {
    return (
      <header className="sticky top-0 z-40 bg-card border-b border-border">
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
                {t('app.name')}
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
                  {getInitials(user?.name || '')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground max-w-[150px] truncate">
                  {getUserDisplayName()}
                </p>
                {userRoleLabel && (
                  <p className="text-xs text-muted-foreground">{userRoleLabel}</p>
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
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">{t('app.name')}</span>
          </Link>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />

            {!isHydrated ? (
              <Skeleton className="h-8 w-24" />
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute end-0 mt-2 w-56 rounded-lg bg-card border border-border shadow-lg z-50 py-1">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t('nav.dashboard')}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 ms-2" />
                    {t('nav.login')}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register">
                    <UserPlus className="h-4 w-4 ms-2" />
                    {t('nav.register')}
                  </Link>
                </Button>
              </>
            )}

            {onMenuClick && (
              <button
                className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                onClick={onMenuClick}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
