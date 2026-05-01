"use client";

import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Wallet,
  Megaphone,
  Truck,
  User,
  ClipboardList,
} from "lucide-react";
import { ProtectedRoute } from "@/lib/auth/guards";
import { Role } from "@/types";
import { ProfileCompletionGuard } from "@/components/common/profile-completion-guard";
import { DashboardLayout, MenuItem } from "@/components/common";
import { useTranslation } from "@/lib/i18n";

function PharmacyOwnerLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    {
      href: "/pharmacy-owner/dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      href: "/pharmacy-owner/pharmacies",
      label: t("nav.myPharmacies"),
      icon: Store,
    },
    {
      href: "/pharmacy-owner/products",
      label: t("nav.products"),
      icon: Package,
    },
    {
      href: "/pharmacy-owner/orders",
      label: t("nav.orders"),
      icon: ShoppingCart,
    },
    {
      href: "/pharmacy-owner/wallet",
      label: t("nav.wallet"),
      icon: Wallet,
    },
    {
      href: "/pharmacy-owner/campaigns",
      label: t("nav.campaigns"),
      icon: Megaphone,
    },
    {
      href: "/pharmacy-owner/drivers",
      label: t("nav.drivers"),
      icon: Truck,
    },
    {
      href: "/pharmacy-owner/prescription-orders",
      label: t("nav.prescriptionOrders"),
      icon: ClipboardList,
    },
    {
      href: "/pharmacy-owner/profile",
      label: t("nav.profile"),
      icon: User,
    },
  ];

  return (
    <DashboardLayout
      menuItems={menuItems}
      userRoleLabel={t("app.pharmacyOwnerRole")}
      basePath="/pharmacy-owner"
    >
      {children}
    </DashboardLayout>
  );
}

export function PharmacyOwnerLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.PHARMACY_OWNER]}>
      <ProfileCompletionGuard role={Role.PHARMACY_OWNER}>
        <PharmacyOwnerLayoutContent>{children}</PharmacyOwnerLayoutContent>
      </ProfileCompletionGuard>
    </ProtectedRoute>
  );
}
