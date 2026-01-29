'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Calendar,
  Users,
  Settings,
  LogOut,
  Stethoscope,
  ChevronLeft,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth/store';
import { getInitials } from '@/lib/utils';

const menuItems = [
  {
    href: '/patient/dashboard',
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
  },
  {
    href: '/patient/appointments',
    label: 'مواعيدي',
    icon: Calendar,
  },
  {
    href: '/patient/profile',
    label: 'الملف الشخصي',
    icon: User,
  },
  {
    href: '/patient/family',
    label: 'أفراد العائلة',
    icon: Users,
  },
];

export function PatientSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-white border-e border-gray-200 min-h-[calc(100vh-4rem)] flex flex-col">
      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.profilePicture || undefined} />
            <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-sm text-gray-500">مريض</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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

        {/* Separator */}
        <div className="my-4 border-t border-gray-200" />

        {/* Book Appointment */}
        <Link
          href="/doctors"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
        >
          <Stethoscope className="h-5 w-5" />
          احجز موعد جديد
          <ChevronLeft className="h-4 w-4 ms-auto" />
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-error-600 hover:bg-error-50 hover:text-error-700"
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5 ms-2" />
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  );
}
