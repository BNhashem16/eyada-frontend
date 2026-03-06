"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  User,
  Users,
  Stethoscope,
  ChevronLeft,
  ShoppingCart,
  Package,
  Pill,
  MapPin,
  FileText,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/lib/auth/guards";
import { Role } from "@/types";
import { ProfileCompletionGuard } from "@/components/common/profile-completion-guard";
import { DashboardLayout, MenuItem } from "@/components/common";
import { AiChatButton } from "@/features/ai/components/ai-chat-button";
import { useTranslation } from "@/lib/i18n";

function PatientLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    {
      href: "/patient/dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      href: "/patient/appointments",
      label: t("nav.myAppointments"),
      icon: Calendar,
    },
    { href: "/patient/profile", label: t("nav.profile"), icon: User },
    { href: "/patient/family", label: t("family.title"), icon: Users },
    {
      href: "/patient/pharmacy",
      label: t("pharmacyOwner.pharmacyBrowse"),
      icon: Pill,
    },
    {
      href: "/patient/cart",
      label: t("pharmacyOwner.cart"),
      icon: ShoppingCart,
    },
    {
      href: "/patient/orders",
      label: t("pharmacyOwner.myOrders"),
      icon: Package,
    },
    { href: "/patient/addresses", label: t("addresses.title"), icon: MapPin },
    {
      href: "/patient/prescriptions",
      label: t("nav.prescriptions"),
      icon: FileText,
    },
    {
      href: "/patient/prescription-orders",
      label: t("nav.prescriptionOrders"),
      icon: ClipboardList,
    },
  ];

  const headerRightContent = (
    <div className="flex items-center gap-2">
      <Button
        asChild
        size="sm"
        className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <Link href="/patient/pharmacy">
          <Pill className="h-4 w-4 ms-2" />
          {t("pharmacyOwner.pharmacyBrowse")}
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm" className="hidden sm:flex">
        <Link href="/doctors">
          <Stethoscope className="h-4 w-4 ms-2" />
          {t("doctors.bookAppointment")}
        </Link>
      </Button>
    </div>
  );

  const mobileExtraContent = (
    <Link
      href="/doctors"
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
    >
      <Stethoscope className="h-5 w-5" />
      {t("appointments.bookNew")}
      <ChevronLeft className="h-4 w-4 ms-auto" />
    </Link>
  );

  return (
    <>
      <DashboardLayout
        menuItems={menuItems}
        userRoleLabel={t("app.patientRole")}
        basePath="/patient"
        headerRightContent={headerRightContent}
        mobileExtraContent={mobileExtraContent}
      >
        {children}
      </DashboardLayout>
      <AiChatButton />
    </>
  );
}

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.PATIENT]}>
      <ProfileCompletionGuard role={Role.PATIENT}>
        <PatientLayoutContent>{children}</PatientLayoutContent>
      </ProfileCompletionGuard>
    </ProtectedRoute>
  );
}
