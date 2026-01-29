'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Stethoscope,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  User,
  Users,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProtectedRoute } from '@/lib/auth/guards';
import { useAuthStore } from '@/lib/auth/store';
import { getInitials } from '@/lib/utils';

const menuItems = [
  { href: '/patient/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/patient/appointments', label: 'مواعيدي', icon: Calendar },
  { href: '/patient/profile', label: 'الملف الشخصي', icon: User },
  { href: '/patient/family', label: 'أفراد العائلة', icon: Users },
];

function PatientLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-gray-600"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">عيادة</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="hidden sm:flex">
              <Link href="/doctors">
                <Stethoscope className="h-4 w-4 ms-2" />
                احجز موعد
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profilePicture || undefined} />
                <AvatarFallback className="text-sm">
                  {getInitials(user?.name || '')}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-e border-gray-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="my-4 border-t border-gray-200" />

            <button
              onClick={() => logout()}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
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
            <aside className="absolute inset-y-0 start-0 w-72 bg-white">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profilePicture || undefined} />
                    <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">مريض</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="my-4 border-t border-gray-200" />

                <Link
                  href="/doctors"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-600 hover:bg-primary-50"
                >
                  <Stethoscope className="h-5 w-5" />
                  احجز موعد جديد
                  <ChevronLeft className="h-4 w-4 ms-auto" />
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-error-600 hover:bg-error-50"
                >
                  <LogOut className="h-5 w-5" />
                  تسجيل الخروج
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

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['PATIENT']}>
      <PatientLayoutContent>{children}</PatientLayoutContent>
    </ProtectedRoute>
  );
}
