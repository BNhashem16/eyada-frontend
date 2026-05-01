"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, Menu, X, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useTranslation } from "@/lib/i18n";
import { useUser, useLogout } from "@/lib/auth/store";
import { getInitials } from "@/lib/utils";
import type { MenuItem } from "./sidebar";

export interface AdminLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  headerRightContent?: React.ReactNode;
}

export function AdminLayout({
  children,
  menuItems,
  headerRightContent,
}: AdminLayoutProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useUser();
  const logout = useLogout();

  const isActive = (href: string) => {
    return (
      pathname === href ||
      (href !== "/admin/dashboard" && pathname.startsWith(href))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900 dark:bg-gray-950 text-white">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-gray-300 hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold">{t("app.name")}</span>
                <span className="text-xs text-gray-300 block">
                  {t("app.adminPanel")}
                </span>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            {headerRightContent}
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 border-2 border-primary-500">
                <AvatarImage src={user?.profilePicture || undefined} />
                <AvatarFallback className="text-sm bg-primary-600 text-white">
                  {getInitials(user?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium max-w-[150px] truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-300">{t("app.systemAdmin")}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-gray-800 dark:bg-gray-900 text-white min-h-[calc(100vh-4rem)]">
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
                      ? "bg-primary-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="my-4 border-t border-gray-700" />

            <button
              onClick={() => logout()}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {t("nav.logout")}
            </button>
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute top-0 bottom-0 start-0 w-[85vw] max-w-72 h-dvh bg-gray-800 dark:bg-gray-900 text-white flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-10 w-10 border-2 border-primary-500 shrink-0">
                    <AvatarImage src={user?.profilePicture || undefined} />
                    <AvatarFallback className="bg-primary-600 text-white">
                      {getInitials(user?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{user?.name}</p>
                    <p className="text-sm text-gray-300 truncate">
                      {t("app.systemAdmin")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="shrink-0 p-1"
                  aria-label={t("common.close")}
                >
                  <X className="h-6 w-6 text-gray-300" />
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
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        active
                          ? "bg-primary-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="my-4 border-t border-gray-700" />

                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <LogOut className="h-5 w-5" />
                  {t("nav.logout")}
                </button>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
