"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/i18n";
import { useUser, useLogout } from "@/lib/auth/store";
import { getInitials } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}

export interface SidebarProps {
  menuItems: MenuItem[];
  userRoleLabel?: string;
  showDoctorPrefix?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  extraContent?: React.ReactNode;
  basePath?: string;
}

// Desktop Sidebar
export function Sidebar({ menuItems, basePath = "" }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const logout = useLogout();

  const isActive = (href: string) => {
    const dashboardPath = `${basePath}/dashboard`;
    return (
      pathname === href || (href !== dashboardPath && pathname.startsWith(href))
    );
  };

  return (
    <aside className="hidden lg:block w-64 bg-card border-e border-border min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        <div className="my-4 border-t border-border" />

        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {t("nav.logout")}
        </button>
      </nav>
    </aside>
  );
}

// Mobile Sidebar
export function MobileSidebar({
  menuItems,
  userRoleLabel,
  showDoctorPrefix = false,
  isOpen,
  onClose,
  extraContent,
  basePath = "",
}: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const user = useUser();
  const logout = useLogout();

  if (!isOpen) return null;

  const isActive = (href: string) => {
    const dashboardPath = `${basePath}/dashboard`;
    return (
      pathname === href || (href !== dashboardPath && pathname.startsWith(href))
    );
  };

  const getUserDisplayName = () => {
    if (showDoctorPrefix) {
      return `${t("doctors.doctorPrefix")} ${user?.name}`;
    }
    return user?.name;
  };

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="absolute top-0 bottom-0 start-0 w-[85vw] max-w-72 h-dvh bg-card flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user?.profilePicture || undefined} />
              <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {getUserDisplayName()}
              </p>
              {userRoleLabel && (
                <p className="text-sm text-muted-foreground truncate">
                  {userRoleLabel}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1"
            aria-label={t("common.close")}
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          <div className="my-4 border-t border-border" />

          {extraContent}

          <button
            onClick={() => {
              logout();
              onClose?.();
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
          >
            <LogOut className="h-5 w-5" />
            {t("nav.logout")}
          </button>
        </nav>
      </aside>
    </div>
  );
}
