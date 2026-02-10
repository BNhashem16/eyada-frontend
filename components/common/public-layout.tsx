"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  Building2,
  Grid3X3,
  LogIn,
  MessageSquareHeart,
} from "lucide-react";
import { Header, NavLinkItem } from "./header";
import { useTranslation } from "@/lib/i18n";
import { useIsAuthenticated, useIsHydrated } from "@/lib/auth/store";

export interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();

  const navLinks: NavLinkItem[] = [
    { href: "/specialties", label: t("nav.specialties"), icon: Grid3X3 },
    { href: "/doctors", label: t("nav.doctors"), icon: Stethoscope },
    { href: "/clinics", label: t("nav.clinics"), icon: Building2 },
    {
      href: "/feedback",
      label: t("nav.complaintsAndSuggestions"),
      icon: MessageSquareHeart,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header + Mobile Nav wrapped in sticky container */}
      <div className="sticky top-0 z-40">
        <Header
          variant="public"
          navLinks={navLinks}
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-lg shadow-lg">
            <nav className="container mx-auto px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              {isHydrated && !isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="font-medium">{t("nav.login")}</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">{t("app.name")}</span>
            </div>
            <p className="text-gray-400 max-w-md">
              {t("app.footerText")}. {t("app.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">{t("nav.quickLinks")}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/doctors"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.findDoctor")}
                </Link>
              </li>
              <li>
                <Link
                  href="/clinics"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.findClinic")}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.joinAsDoctor")}
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="inline-flex items-center gap-2 hover:text-white transition-colors"
                >
                  <MessageSquareHeart className="h-4 w-4" />
                  {t("nav.complaintsAndSuggestions")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">{t("nav.contactUs")}</h4>
            <ul className="space-y-2 text-gray-400">
              <li dir="ltr">+20 123 456 7890</li>
              <li>support@eyada.com</li>
              <li>{t("app.location")}</li>
            </ul>
          </div>
        </div>

        {/* Feedback CTA */}
        <div className="mt-8 pt-8 border-t border-gray-800 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <p className="text-gray-400 text-sm">
              {t("feedback.subtitle")}
            </p>
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
            >
              <MessageSquareHeart className="h-4 w-4" />
              {t("nav.complaintsAndSuggestions")}
            </Link>
          </div>

          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>
              © {new Date().getFullYear()} {t("app.name")}. {t("app.copyright")}
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
