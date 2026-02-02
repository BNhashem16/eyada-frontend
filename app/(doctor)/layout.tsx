'use client';

import {
  LayoutDashboard,
  Calendar,
  Building2,
  User,
  Star,
} from 'lucide-react';
import { ProtectedRoute } from '@/lib/auth/guards';
import { Role } from '@/types';
import { ProfileCompletionGuard } from '@/components/common/profile-completion-guard';
import { DashboardLayout, MenuItem } from '@/components/common';
import { useTranslation } from '@/lib/i18n';

function DoctorLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    { href: '/doctor/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/doctor/appointments', label: t('nav.appointments'), icon: Calendar },
    { href: '/doctor/clinics', label: t('nav.clinics'), icon: Building2 },
    { href: '/doctor/ratings', label: t('nav.ratings'), icon: Star },
    { href: '/doctor/profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <DashboardLayout
      menuItems={menuItems}
      userRoleLabel={t('app.doctorRole')}
      showDoctorPrefix={true}
      basePath="/doctor"
    >
      {children}
    </DashboardLayout>
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
