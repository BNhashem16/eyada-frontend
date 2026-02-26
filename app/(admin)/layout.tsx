"use client";

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
  Link2,
  Bot,
  CreditCard,
  Store,
  Tag,
  Ticket,
  Megaphone,
  ArrowUpRight,
  BarChart3,
  Truck,
} from "lucide-react";
import { ProtectedRoute } from "@/lib/auth/guards";
import { Role } from "@/types";
import { AdminLayout, MenuItem } from "@/components/common";
import { useTranslation } from "@/lib/i18n";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    {
      href: "/admin/dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    { href: "/admin/doctors", label: t("nav.doctors"), icon: Stethoscope },
    {
      href: "/admin/patients",
      label: t("admin.patients.title"),
      icon: UserRound,
    },
    { href: "/admin/clinics", label: t("nav.clinics"), icon: Building },
    {
      href: "/admin/appointments",
      label: t("nav.appointments"),
      icon: CalendarDays,
    },
    { href: "/admin/secretaries", label: t("nav.secretaries"), icon: UserCog },
    { href: "/admin/ratings", label: t("nav.ratings"), icon: Star },
    { href: "/admin/specialties", label: t("nav.specialties"), icon: Grid3X3 },
    {
      href: "/admin/locations",
      label: t("admin.locations.title"),
      icon: MapPin,
    },
    { href: "/admin/commissions", label: t("nav.commissions"), icon: Percent },
    { href: "/admin/collections", label: t("nav.collections"), icon: Wallet },
    {
      href: "/admin/feedbacks",
      label: t("nav.feedbacks"),
      icon: MessageSquareHeart,
    },
    {
      href: "/admin/payment-methods",
      label: t("nav.paymentMethods"),
      icon: CreditCard,
    },
    {
      href: "/admin/pharmacy-owners",
      label: t("nav.pharmacyOwners"),
      icon: Users,
    },
    {
      href: "/admin/pharmacies",
      label: t("nav.pharmacies"),
      icon: Store,
    },
    {
      href: "/admin/pharmacy-categories",
      label: t("nav.categories"),
      icon: Tag,
    },
    {
      href: "/admin/pharmacy-coupons",
      label: t("nav.coupons"),
      icon: Ticket,
    },
    {
      href: "/admin/pharmacy-campaigns",
      label: t("nav.campaigns"),
      icon: Megaphone,
    },
    {
      href: "/admin/pharmacy-settlements",
      label: t("nav.settlements"),
      icon: ArrowUpRight,
    },
    {
      href: "/admin/pharmacy-drivers",
      label: t("nav.drivers"),
      icon: Truck,
    },
    {
      href: "/admin/pharmacy-dashboard",
      label: t("nav.pharmacyDashboard"),
      icon: BarChart3,
    },
    {
      href: "/admin/contact-links",
      label: t("nav.contactLinks"),
      icon: Link2,
    },
    {
      href: "/admin/ai-settings",
      label: t("nav.aiSettings"),
      icon: Bot,
    },
  ];

  return <AdminLayout menuItems={menuItems}>{children}</AdminLayout>;
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
