'use client';

import {
  LayoutDashboard,
  Users,
  UserCog,
  UserRound,
  Stethoscope,
  Grid3X3,
  MapPin,
  Percent,
  Wallet,
  CalendarDays,
  Building,
  Star,
  MessageSquareHeart,
} from 'lucide-react';
import { ProtectedRoute } from '@/lib/auth/guards';
import { Role } from '@/types';
import { AdminLayout, MenuItem } from '@/components/common';
import { useTranslation } from '@/lib/i18n';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    { href: '/admin/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/admin/doctors', label: t('nav.doctors'), icon: Stethoscope },
    { href: '/admin/patients', label: t('admin.patients.title'), icon: UserRound },
    { href: '/admin/clinics', label: t('nav.clinics'), icon: Building },
    { href: '/admin/appointments', label: t('nav.appointments'), icon: CalendarDays },
    { href: '/admin/secretaries', label: t('nav.secretaries'), icon: UserCog },
    { href: '/admin/ratings', label: t('nav.ratings'), icon: Star },
    { href: '/admin/specialties', label: t('nav.specialties'), icon: Grid3X3 },
    { href: '/admin/locations', label: t('admin.locations.title'), icon: MapPin },
    { href: '/admin/commissions', label: t('nav.commissions'), icon: Percent },
    { href: '/admin/collections', label: t('nav.collections'), icon: Wallet },
    { href: '/admin/feedbacks', label: t('nav.feedbacks'), icon: MessageSquareHeart },
  ];

  return (
    <AdminLayout menuItems={menuItems}>
      {children}
    </AdminLayout>
  );
}

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}
