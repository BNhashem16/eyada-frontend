'use client';

import { useState } from 'react';
import { Header } from './header';
import { Sidebar, MobileSidebar, MenuItem } from './sidebar';
import { useTranslation } from '@/lib/i18n';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  userRoleLabel: string;
  showDoctorPrefix?: boolean;
  basePath: string;
  headerRightContent?: React.ReactNode;
  mobileExtraContent?: React.ReactNode;
}

export function DashboardLayout({
  children,
  menuItems,
  userRoleLabel,
  showDoctorPrefix = false,
  basePath,
  headerRightContent,
  mobileExtraContent,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="dashboard"
        userRoleLabel={userRoleLabel}
        showDoctorPrefix={showDoctorPrefix}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        rightContent={headerRightContent}
      />

      <div className="flex">
        <Sidebar menuItems={menuItems} basePath={basePath} />

        <MobileSidebar
          menuItems={menuItems}
          userRoleLabel={userRoleLabel}
          showDoctorPrefix={showDoctorPrefix}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          extraContent={mobileExtraContent}
          basePath={basePath}
        />

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
