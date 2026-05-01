"use client";

import { LayoutDashboard, Package, User } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth/guards";
import { Role } from "@/types";
import { DashboardLayout, MenuItem } from "@/components/common";
import { useTranslation } from "@/lib/i18n";

function DriverLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    {
      href: "/driver/dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      href: "/driver/deliveries",
      label: t("nav.deliveries"),
      icon: Package,
    },
    {
      href: "/driver/profile",
      label: t("nav.profile"),
      icon: User,
    },
  ];

  return (
    <DashboardLayout
      menuItems={menuItems}
      userRoleLabel={t("app.driverRole")}
      basePath="/driver"
    >
      {children}
    </DashboardLayout>
  );
}

export function DriverLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.DRIVER]}>
      <DriverLayoutContent>{children}</DriverLayoutContent>
    </ProtectedRoute>
  );
}
