"use client";

import { LayoutDashboard, Calendar, Plus, Star, Clock } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth/guards";
import { Role } from "@/types";
import { DashboardLayout, MenuItem } from "@/components/common";
import { useTranslation } from "@/lib/i18n";

function SecretaryLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    {
      href: "/secretary/dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      href: "/secretary/appointments",
      label: t("nav.appointments"),
      icon: Calendar,
    },
    {
      href: "/secretary/appointments/new",
      label: t("secretary.bookAppointment"),
      icon: Plus,
    },
    { href: "/secretary/schedules", label: t("nav.schedules"), icon: Clock },
    { href: "/secretary/ratings", label: t("nav.ratings"), icon: Star },
  ];

  return (
    <DashboardLayout
      menuItems={menuItems}
      userRoleLabel={t("app.secretaryRole")}
      basePath="/secretary"
    >
      {children}
    </DashboardLayout>
  );
}

export default function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.SECRETARY]}>
      <SecretaryLayoutContent>{children}</SecretaryLayoutContent>
    </ProtectedRoute>
  );
}
