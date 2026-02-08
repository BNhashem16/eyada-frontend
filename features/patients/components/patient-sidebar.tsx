"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Calendar,
  Users,
  Settings,
  LogOut,
  Stethoscope,
  ChevronLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth/store";
import { getInitials } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export function PatientSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      href: "/patient/dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      href: "/patient/appointments",
      label: t("appointments.myAppointments"),
      icon: Calendar,
    },
    {
      href: "/patient/profile",
      label: t("nav.profile"),
      icon: User,
    },
    {
      href: "/patient/family",
      label: t("patient.family"),
      icon: Users,
    },
  ];

  return (
    <aside className="w-64 bg-card border-e border-border min-h-[calc(100vh-4rem)] flex flex-col">
      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.profilePicture || undefined} />
            <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {user?.name}
            </p>
            <p className="text-sm text-muted-foreground">{t("auth.patient")}</p>
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
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="my-4 border-t border-border" />

        {/* Book Appointment */}
        <Link
          href="/doctors"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          <Stethoscope className="h-5 w-5" />
          {t("appointments.bookNew")}
          <ChevronLeft className="h-4 w-4 ms-auto" />
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 hover:text-error-700 dark:text-error-400"
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5 ms-2" />
          {t("nav.logout")}
        </Button>
      </div>
    </aside>
  );
}
