'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Stethoscope,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Building2,
  User,
  Star,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProtectedRoute } from '@/lib/auth/guards';
import { useAuthStore } from '@/lib/auth/store';
import { Role } from '@/types';
import { getInitials } from '@/lib/utils';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { LanguageToggle } from '@/components/common/language-toggle';
import { ProfileCompletionGuard } from '@/components/common/profile-completion-guard';
import { useTranslation } from '@/lib/i18n';

const getMenuItems = (t: (key: string) => string) => [
  { href: '/doctor/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
  { href: '/doctor/appointments', label: t('nav.appointments'), icon: Calendar },
  { href: '/doctor/clinics', label: t('nav.clinics'), icon: Building2 },
  { href: '/doctor/profile', label: t('nav.profile'), icon: User },
];

function DoctorLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const menuItems = getMenuItems(t);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block">{t('app.name')}</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profilePicture || undefined} />
                <AvatarFallback className="text-sm">
                  {getInitials(user?.name || '')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground max-w-[150px] truncate">
                  {t('doctors.doctorPrefix')} {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">{t('app.doctorRole')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-card border-e border-border min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/doctor/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="my-4 border-t border-border" />

            <button
              onClick={() => logout()}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {t('nav.logout')}
            </button>
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute inset-y-0 start-0 w-72 bg-card">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profilePicture || undefined} />
                    <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{t('doctors.doctorPrefix')} {user?.name}</p>
                    <p className="text-sm text-muted-foreground">{t('app.doctorRole')}</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6 text-muted-foreground" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/doctor/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                          : 'text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="my-4 border-t border-border" />

                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
                >
                  <LogOut className="h-5 w-5" />
                  {t('nav.logout')}
                </button>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
      <ProfileCompletionGuard role={Role.DOCTOR}>
        <DoctorLayoutContent>{children}</DoctorLayoutContent>
      </ProfileCompletionGuard>
    </ProtectedRoute>
  );
}
